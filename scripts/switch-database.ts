/**
 * Database Provider Switch Script
 * 
 * Run with: npx ts-node scripts/switch-database.ts [sqlite|postgresql]
 * 
 * This script switches the Prisma provider between SQLite and PostgreSQL.
 */

import * as fs from 'fs'
import * as path from 'path'

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma')

function switchDatabase(provider: 'sqlite' | 'postgresql') {
  console.log(`🔄 Switching database provider to: ${provider}\n`)

  // Read current schema
  let schema = fs.readFileSync(schemaPath, 'utf-8')

  // Provider-specific replacements
  if (provider === 'postgresql') {
    // Switch to PostgreSQL
    schema = schema.replace(
      /provider\s*=\s*"sqlite"/,
      'provider = "postgresql"'
    )
    console.log('✅ Provider changed to PostgreSQL')
    console.log('\n📋 Next steps:')
    console.log('   1. Update .env with PostgreSQL DATABASE_URL')
    console.log('   2. Run: npx prisma generate')
    console.log('   3. Run: npx prisma db push')
    console.log('   4. Run: npx ts-node scripts/import-data.ts')
  } else {
    // Switch to SQLite  
    schema = schema.replace(
      /provider\s*=\s*"postgresql"/,
      'provider = "sqlite"'
    )
    console.log('✅ Provider changed to SQLite')
    console.log('\n📋 Next steps:')
    console.log('   1. Ensure .env has SQLite DATABASE_URL (file:./dev.db)')
    console.log('   2. Run: npx prisma generate')
    console.log('   3. Run: npx prisma db push')
  }

  // Write updated schema
  fs.writeFileSync(schemaPath, schema)
  console.log('\n✅ Schema updated successfully!')
}

// Get argument
const arg = process.argv[2]

if (!arg || !['sqlite', 'postgresql', 'postgres'].includes(arg.toLowerCase())) {
  console.log('Usage: npx ts-node scripts/switch-database.ts [sqlite|postgresql]')
  console.log('')
  console.log('Examples:')
  console.log('  npx ts-node scripts/switch-database.ts postgresql')
  console.log('  npx ts-node scripts/switch-database.ts sqlite')
  process.exit(1)
}

const provider = arg.toLowerCase() === 'sqlite' ? 'sqlite' : 'postgresql'
switchDatabase(provider)
