/**
 * Data Export Script for PostgreSQL Migration
 * 
 * Run with: npx ts-node scripts/export-data.ts
 * 
 * This script exports all data from SQLite to JSON files
 * for backup before PostgreSQL migration.
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function exportData() {
  const exportDir = path.join(process.cwd(), 'data-export')
  
  // Create export directory
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir, { recursive: true })
  }

  console.log('📦 Starting data export...\n')

  try {
    // Export Users
    const users = await prisma.user.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'users.json'),
      JSON.stringify(users, null, 2)
    )
    console.log(`✅ Users: ${users.length} records`)

    // Export Agenda
    const agenda = await prisma.agenda.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'agenda.json'),
      JSON.stringify(agenda, null, 2)
    )
    console.log(`✅ Agenda: ${agenda.length} records`)

    // Export Tasks
    const tasks = await prisma.task.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'tasks.json'),
      JSON.stringify(tasks, null, 2)
    )
    console.log(`✅ Tasks: ${tasks.length} records`)

    // Export Notulensi
    const notulensi = await prisma.notulensi.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'notulensi.json'),
      JSON.stringify(notulensi, null, 2)
    )
    console.log(`✅ Notulensi: ${notulensi.length} records`)

    // Export Surat
    const surat = await prisma.surat.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'surat.json'),
      JSON.stringify(surat, null, 2)
    )
    console.log(`✅ Surat: ${surat.length} records`)

    // Export Imam
    const imam = await prisma.imam.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'imam.json'),
      JSON.stringify(imam, null, 2)
    )
    console.log(`✅ Imam: ${imam.length} records`)

    // Export Decision
    const decisions = await prisma.decision.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'decisions.json'),
      JSON.stringify(decisions, null, 2)
    )
    console.log(`✅ Decisions: ${decisions.length} records`)

    // Export Paroki
    const paroki = await prisma.paroki.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'paroki.json'),
      JSON.stringify(paroki, null, 2)
    )
    console.log(`✅ Paroki: ${paroki.length} records`)

    // Export DigitalSignature
    const signatures = await prisma.digitalSignature.findMany()
    fs.writeFileSync(
      path.join(exportDir, 'signatures.json'),
      JSON.stringify(signatures, null, 2)
    )
    console.log(`✅ Signatures: ${signatures.length} records`)

    // Create metadata file
    const metadata = {
      exportedAt: new Date().toISOString(),
      source: 'SQLite',
      tables: {
        users: users.length,
        agenda: agenda.length,
        tasks: tasks.length,
        notulensi: notulensi.length,
        surat: surat.length,
        imam: imam.length,
        decisions: decisions.length,
        paroki: paroki.length,
        signatures: signatures.length,
      },
      totalRecords: users.length + agenda.length + tasks.length + 
                    notulensi.length + surat.length + imam.length + 
                    decisions.length + paroki.length + signatures.length
    }

    fs.writeFileSync(
      path.join(exportDir, '_metadata.json'),
      JSON.stringify(metadata, null, 2)
    )

    console.log('\n📊 Export Summary:')
    console.log(`   Total records: ${metadata.totalRecords}`)
    console.log(`   Export location: ${exportDir}`)
    console.log('\n✅ Data export completed successfully!')

  } catch (error) {
    console.error('❌ Export failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run export
exportData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
