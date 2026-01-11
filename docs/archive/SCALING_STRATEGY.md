# 🚀 Horizontal Scaling Strategy
## Dashboard Uskup Surabaya - Production Scaling Guide

### Current Architecture Analysis
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │  Load Balancer  │    │  Load Balancer  │
│   (Nginx/HAProxy)│    │                 │    │                 │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            ┌───────▼───────┐        ┌────────▼────────┐
            │   App Server  │        │   App Server    │
            │   Node.js     │        │   Node.js       │
            │   (Instance 1)│        │   (Instance 2)  │
            └───────┬───────┘        └────────┬────────┘
                    │                         │
            ┌───────▼───────┐        ┌────────▼────────┐
            │   Database    │        │   Database      │
            │   PostgreSQL  │        │   PostgreSQL    │
            │   Primary     │        │   Read Replica  │
            └───────────────┘        └─────────────────┘
```

---

## 🎯 SCALING PHASES

### Phase 1: Basic Optimization (0-100 users)
**Current State - Optimized for Small Scale**

**Database Optimization**
- ✅ Indexes created for all frequently queried fields
- ✅ Query optimization implemented
- ✅ Connection pooling enabled
- ✅ Read replicas for reporting queries

**Application Optimization**
- ✅ Bundle size optimization
- ✅ Caching strategy (5-minute dashboard cache)
- ✅ Code splitting and lazy loading
- ✅ Image optimization

**Infrastructure**
- Single server deployment
- Basic monitoring enabled
- Automated backups

**Performance Targets**
- Response time: < 200ms
- Uptime: 99.5%
- Database query time: < 50ms

---

### Phase 2: Vertical Scaling (100-500 users)
**Enhanced Single Instance**

**Database Scaling**
```yaml
PostgreSQL Configuration:
  max_connections: 200
  shared_buffers: 256MB
  effective_cache_size: 1GB
  work_mem: 4MB
  maintenance_work_mem: 64MB
  
  # Performance tuning
  wal_buffers: 16MB
  checkpoint_completion_target: 0.9
  random_page_cost: 1.1
  effective_io_concurrency: 200
```

**Application Scaling**
```yaml
Node.js Configuration:
  NODE_OPTIONS: "--max-old-space-size=2048"
  PM2_INSTANCES: 2
  PM2_MAX_MEMORY: "1G"
  
  # Socket.IO optimization
  socketio:
    max_connections: 500
    ping_timeout: 60000
    ping_interval: 25000
```

**Monitoring Enhancement**
- Performance metrics collection
- Database query monitoring
- Real-time alerting

**Performance Targets**
- Response time: < 300ms
- Uptime: 99.7%
- Concurrent users: 500
- Database connections: 150

---

### Phase 3: Horizontal Scaling (500-2000 users)
**Multi-Instance Deployment**

#### Load Balancer Configuration
```nginx
# nginx.conf
upstream dashboard_backend {
    least_conn;
    server app1.internal:3000 weight=1 max_fails=3 fail_timeout=30s;
    server app2.internal:3000 weight=1 max_fails=3 fail_timeout=30s;
    server app3.internal:3000 weight=1 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name dashboard.keuskupan-surabaya.org;
    
    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    limit_req zone=auth burst=10 nodelay;
    
    # Caching
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    proxy_cache_use_stale error timeout updating http_500 http_502 http_503 http_504;
    
    location /api/ {
        proxy_pass http://dashboard_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    location / {
        proxy_pass http://dashboard_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

#### Database Clustering
```yaml
PostgreSQL Primary-Replica Setup:
  Primary:
    host: db-primary.internal
    port: 5432
    resources: 4 CPU, 8GB RAM, SSD
    
  Replica 1:
    host: db-replica-1.internal  
    port: 5432
    resources: 2 CPU, 4GB RAM, SSD
    
  Replica 2:
    host: db-replica-2.internal
    port: 5432  
    resources: 2 CPU, 4GB RAM, SSD
    
  Load Distribution:
    - Primary: Write operations (95%)
    - Replica 1: Read operations (70%)
    - Replica 2: Read operations (30%)
```

#### Application Deployment
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: dashboard-uskup:latest
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:pass@db-primary:5432/dashboard
      - SESSION_SECRET=${SESSION_SECRET}
    depends_on:
      - redis
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - backend

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - backend

volumes:
  redis_data:

networks:
  backend:
    driver: bridge
```

#### Session Management
```typescript
// Redis-backed session store for horizontal scaling
import RedisStore from 'connect-redis'
import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

const sessionStore = new RedisStore({
  client: redisClient,
  prefix: 'dashboard:session:'
})

// Configure NextAuth to use Redis session store
export const authOptions = {
  // ... other options
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // Redis for session data if needed
  callbacks: {
    async session({ session, token }) {
      // Session data is now shared across instances
      return session
    }
  }
}
```

**Performance Targets**
- Response time: < 400ms
- Uptime: 99.8%
- Concurrent users: 2000
- Database connections: 300

---

### Phase 4: Advanced Scaling (2000+ users)
**Microservices & Cloud-Native**

#### Microservices Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Service Mesh  │    │   Message Queue │
│   (Kong/Istio)  │    │   (Istio)       │    │   (RabbitMQ)    │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
┌────────▼───────┐    ┌───────────▼───────┐    ┌─────────▼───────┐
│ Auth Service   │    │  Dashboard API   │    │ Notification    │
│                │    │                  │    │ Service         │
└────────┬───────┘    └──────────┬───────┘    └─────────┬───────┘
         │                       │                       │
┌────────▼───────┐    ┌───────────▼───────┐    ┌─────────▼───────┐
│ User Service   │    │  Analytics API   │    │ Report Service  │
│                │    │                  │    │                 │
└────────────────┘    └──────────────────┘    └─────────────────┘
```

#### Kubernetes Deployment
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: dashboard-uskup

---
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dashboard-api
  namespace: dashboard-uskup
spec:
  replicas: 5
  selector:
    matchLabels:
      app: dashboard-api
  template:
    metadata:
      labels:
        app: dashboard-api
    spec:
      containers:
      - name: dashboard-api
        image: dashboard-uskup:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: dashboard-api-service
  namespace: dashboard-uskup
spec:
  selector:
    app: dashboard-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: dashboard-api-hpa
  namespace: dashboard-uskup
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: dashboard-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

#### Database Sharding
```sql
-- Sharding strategy for large datasets
-- Partition table by created_date for better performance

CREATE TABLE agenda_partitioned (
    LIKE agenda INCLUDING ALL
) PARTITION BY RANGE (created_at);

-- Create monthly partitions
CREATE TABLE agenda_2025_01 PARTITION OF agenda_partitioned
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE agenda_2025_02 PARTITION OF agenda_partitioned
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Add partitions for future months
```

**Performance Targets**
- Response time: < 500ms
- Uptime: 99.9%
- Concurrent users: 10,000+
- Global availability

---

## 🛠️ DEPLOYMENT SCRIPTS

### Auto-scaling Script
```bash
#!/bin/bash
# scripts/auto-scale.sh

# Get current load
CPU_USAGE=$(kubectl top nodes | awk 'NR==2 {print $3}' | sed 's/%//')
MEMORY_USAGE=$(kubectl top nodes | awk 'NR==2 {print $5}' | sed 's/%//')

# Scale based on load
if [ $CPU_USAGE -gt 80 ] || [ $MEMORY_USAGE -gt 80 ]; then
    echo "High load detected. Scaling up..."
    kubectl scale deployment dashboard-api --replicas=10
elif [ $CPU_USAGE -lt 30 ] && [ $MEMORY_USAGE -lt 30 ]; then
    echo "Low load detected. Scaling down..."
    kubectl scale deployment dashboard-api --replicas=3
else
    echo "Load is normal. No scaling needed."
fi
```

### Load Testing Script
```bash
#!/bin/bash
# scripts/load-test.sh

echo "Starting load test for Dashboard Uskup Surabaya"

# Test different load levels
for users in 10 50 100 500 1000; do
    echo "Testing with $users concurrent users..."
    
    ab -n $((users * 10)) -c $users \
       -H "Accept: application/json" \
       http://dashboard.keuskupan-surabaya.org/api/dashboard
    
    echo "Sleeping for 30 seconds before next test..."
    sleep 30
done

echo "Load test completed"
```

---

## 📊 MONITORING & ALERTING

### Key Metrics to Monitor
```yaml
Application Metrics:
  - Response time (p95, p99)
  - Error rate (%)
  - Throughput (requests/second)
  - Active connections
  - Memory usage (%)
  - CPU utilization (%)

Database Metrics:
  - Connection pool usage
  - Query execution time
  - Lock wait time
  - Cache hit ratio
  - Replication lag

Infrastructure Metrics:
  - Load balancer health
  - Server availability
  - Network latency
  - Disk I/O
  - SSL certificate expiry
```

### Alerting Rules
```yaml
# prometheus/alerts.yml
groups:
- name: dashboard.rules
  rules:
  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      
  - alert: DatabaseConnectionsHigh
    expr: pg_stat_database_numbackends / pg_settings_max_connections > 0.8
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database connection pool nearly full"
```

---

## 🚀 ROLLING DEPLOYMENTS

### Zero-Downtime Deployment
```bash
#!/bin/bash
# scripts/rolling-deploy.sh

NEW_VERSION=$1
CURRENT_REPLICAS=$(kubectl get deployment dashboard-api -o jsonpath='{.spec.replicas}')

echo "Starting rolling deployment to version $NEW_VERSION"

# Update deployment
kubectl set image deployment/dashboard-api \
  dashboard-api=dashboard-uskup:$NEW_VERSION

# Wait for rollout to complete
kubectl rollout status deployment/dashboard-api --timeout=300s

if [ $? -eq 0 ]; then
    echo "Deployment successful"
else
    echo "Deployment failed, rolling back..."
    kubectl rollout undo deployment/dashboard-api
    exit 1
fi

# Health check
echo "Performing health check..."
sleep 10
HEALTH_CHECK=$(curl -f http://dashboard.keuskupan-surabaya.org/api/health || echo "FAILED")

if [ "$HEALTH_CHECK" != "FAILED" ]; then
    echo "Health check passed"
else
    echo "Health check failed, rolling back..."
    kubectl rollout undo deployment/dashboard-api
    exit 1
fi

echo "Rolling deployment completed successfully"
```

---

## 💰 COST OPTIMIZATION

### Resource Optimization
```yaml
Cost-saving Measures:
  - Use spot instances for non-critical workloads
  - Implement auto-scaling to reduce idle resources
  - Use reserved instances for predictable loads
  - Optimize database storage with compression
  - Implement CDN for static assets
  
Monitoring Costs:
  - Track cost per user
  - Monitor resource utilization
  - Identify optimization opportunities
  - Set budget alerts
```

### Performance Budget
```javascript
// Performance budget for continuous monitoring
const performanceBudget = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift
  
  // Custom metrics
  APIResponseTime: 500, // 95th percentile
  BundleSize: 500, // KB
  DatabaseQueryTime: 100, // ms
  
  // Resources
  MemoryUsage: 100, // MB
  CPUUsage: 70, // %
  DiskUsage: 80 // %
}
```

---

## 🎯 SUCCESS METRICS

### Phase 1 Success Criteria
- [x] Response time < 200ms
- [x] Uptime > 99.5%
- [x] Zero critical security vulnerabilities
- [x] All tests passing

### Phase 2 Success Criteria
- [ ] Support 500 concurrent users
- [ ] Database query time < 50ms
- [ ] Auto-scaling working
- [ ] Monitoring dashboards active

### Phase 3 Success Criteria
- [ ] Support 2000 concurrent users
- [ ] Zero-downtime deployments
- [ ] Multi-region ready
- [ ] Cost per user optimized

### Phase 4 Success Criteria
- [ ] Global distribution ready
- [ ] 99.9% uptime SLA
- [ ] Microservices architecture
- [ ] Advanced analytics enabled

---

*Last updated: November 9, 2025*