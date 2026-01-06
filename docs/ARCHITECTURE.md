# System Architecture

## Overview

Dashboard Uskup is a modern web application built with **Next.js 14 (App Router)**, designed to assist the Bishop and Curia in managing diocese operations. It integrates **Artificial Intelligence (Magisterium AI)** to provide theological assistance and features a robust **Task Management**, **Document Management**, and **Collaboration** system.

## Tech Stack

- **Frontend/Backend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Database**: SQLite (Development/Local), PostgreSQL (Production ready via Prisma)
- **ORM**: Prisma
- **AI Integration**: Magisterium AI API
- **Real-time**: Socket.IO (planned/partial integration through `useSocket`)
- **Authentication**: Custom JWT / NextAuth (hybrid)

## System Architecture Diagrams

### 1. System Context Diagram

High-level view of how users interact with the system.

```mermaid
C4Context
    title System Context Diagram for Dashboard Uskup

    Person(user, "User", "Bishop, Vikjen, Curia Members")
    System(dashboard, "Dashboard Uskup", "Web Application for Diocese Management")
    System_Ext(magisterium, "Magisterium AI", "External AI Service for Theological Q&A")
    System_Ext(pororomo, "Pororomo", "External Diocese Data System (Imam/Paroki)")

    Rel(user, dashboard, "Uses", "HTTPS")
    Rel(dashboard, magisterium, "Queries", "HTTPS/JSON")
    Rel(dashboard, pororomo, "Syncs Data", "API")
```

### 2. Container Diagram

Detailed structural view of the application containers.

```mermaid
C4Container
    title Container Diagram

    Person(user, "User", "Bishop, Curia")

    Container_Boundary(c1, "Dashboard Uskup App") {
        Container(web_app, "Next.js App", "React, TypeScript", "Delivers SPA and Server Components")
        Container(api, "API Routes", "Next.js API", "Handles business logic, auth, and external calls")
        Container(ai_service, "AI Service Layer", "TypeScript", "Proxy and formatter for Magisterium AI")
        Container(db_layer, "Data Access Layer", "Prisma Client", "Type-safe database access")
    }

    System_Ext(magisterium, "Magisterium AI API", "Theological Knowledge Base")
    ContainerDb(database, "Database", "SQLite/PostgreSQL", "Stores Users, Tasks, Documents, Logs")

    Rel(user, web_app, "Visits", "HTTPS")
    Rel(web_app, api, "Fetches JSON", "HTTPS")
    Rel(api, ai_service, "Delegates AI tasks")
    Rel(ai_service, magisterium, "Chat Completions", "HTTPS")
    Rel(api, db_layer, "Calls")
    Rel(db_layer, database, "Reads/Writes", "SQL")
```

## Data Model (ERD)

The application uses a relational schema managed by Prisma. Below is the Entity Relationship Diagram.

```mermaid
erDiagram
    User ||--o{ Task : "creates"
    User ||--o{ Surat : "creates"
    User ||--o{ Agenda : "creates"
    User ||--o{ Notulensi : "creates"
    User ||--o{ Issue : "creates"
    User ||--o{ Opinion : "authors"
    User ||--o{ Notification : "receives"
    
    Agenda ||--o| Notulensi : "has"
    Surat ||--o| DigitalSignature : "signed with"
    
    Issue ||--o{ Opinion : "has"
    Issue ||--o{ User : "assigned to"
    
    User {
        string id PK
        string email
        string name
        enum role
        string jabatan
    }

    Task {
        string id PK
        string title
        string status
        int progress
        date deadline
        string assignee
    }

    Surat {
        string id PK
        string nomor
        string judul
        string status
        boolean isSigned
    }

    Issue {
        string id PK
        string title
        string status
        string decision
    }

    Opinion {
        string id PK
        string content
        string recommendation
    }

    Imam {
        string id PK
        string nama
        string paroki
        string status
    }
```

## Core Modules

### 1. AI Assistant (`src/app/api/ai/chat`)

- **Purpose**: Provides theological answers with citations.
- **Flow**: User Message -> API Route -> `sendMagisteriumChat` -> Magisterium AI -> Format Response (Markdown + Citations) -> User.
- **Security**: API Key is stored server-side (`MAGISTERIUM_API_KEY`).

### 2. Task Management (`src/app/tasks`)

- **Purpose**: Track assignments for Bishop and Curia.
- **Features**: CRUD, Progress Tracking, Categorization.
- **Validation**: Server-side validation (Zod-like manual checks implemented in API).

### 3. Smart Reporting (Planned)

- Aggregate data from `Surat`, `Agenda`, and `Task` to generate monthly/yearly reports for the Bishop.

## Security Overview

- **Authentication**: JWT-based session management.
- **Role-Based Access Control (RBAC)**: Users have roles (`USKUP`, `VIKJEN`, `STAFF`) determining access (schema supported, middleware implementation pending).
- **Environment Variables**: Sensitive keys (`DATABASE_URL`, `MAGISTERIUM_API_KEY`) are kept in `.env`.
