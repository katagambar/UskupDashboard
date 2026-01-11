/**
 * Data Import Script for PostgreSQL Migration
 * 
 * Run with: npx ts-node scripts/import-data.ts
 * 
 * This script imports data from JSON files (exported from SQLite)
 * into the new PostgreSQL database.
 * 
 * IMPORTANT: Run this AFTER PostgreSQL is configured and schema is applied!
 */

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function importData() {
  const exportDir = path.join(process.cwd(), 'data-export')
  
  // Check if export directory exists
  if (!fs.existsSync(exportDir)) {
    console.error('❌ Export directory not found. Run export-data.ts first!')
    process.exit(1)
  }

  console.log('📦 Starting data import...\n')

  try {
    // Import Users first (referenced by other tables)
    if (fs.existsSync(path.join(exportDir, 'users.json'))) {
      const users = JSON.parse(fs.readFileSync(path.join(exportDir, 'users.json'), 'utf-8'))
      for (const user of users) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        })
      }
      console.log(`✅ Users: ${users.length} imported`)
    }

    // Import Paroki (referenced by Imam)
    if (fs.existsSync(path.join(exportDir, 'paroki.json'))) {
      const paroki = JSON.parse(fs.readFileSync(path.join(exportDir, 'paroki.json'), 'utf-8'))
      for (const p of paroki) {
        await prisma.paroki.upsert({
          where: { id: p.id },
          update: p,
          create: p,
        })
      }
      console.log(`✅ Paroki: ${paroki.length} imported`)
    }

    // Import Agenda
    if (fs.existsSync(path.join(exportDir, 'agenda.json'))) {
      const agenda = JSON.parse(fs.readFileSync(path.join(exportDir, 'agenda.json'), 'utf-8'))
      for (const a of agenda) {
        await prisma.agenda.upsert({
          where: { id: a.id },
          update: a,
          create: a,
        })
      }
      console.log(`✅ Agenda: ${agenda.length} imported`)
    }

    // Import Tasks
    if (fs.existsSync(path.join(exportDir, 'tasks.json'))) {
      const tasks = JSON.parse(fs.readFileSync(path.join(exportDir, 'tasks.json'), 'utf-8'))
      for (const t of tasks) {
        await prisma.task.upsert({
          where: { id: t.id },
          update: t,
          create: t,
        })
      }
      console.log(`✅ Tasks: ${tasks.length} imported`)
    }

    // Import Notulensi
    if (fs.existsSync(path.join(exportDir, 'notulensi.json'))) {
      const notulensi = JSON.parse(fs.readFileSync(path.join(exportDir, 'notulensi.json'), 'utf-8'))
      for (const n of notulensi) {
        await prisma.notulensi.upsert({
          where: { id: n.id },
          update: n,
          create: n,
        })
      }
      console.log(`✅ Notulensi: ${notulensi.length} imported`)
    }

    // Import Surat
    if (fs.existsSync(path.join(exportDir, 'surat.json'))) {
      const surat = JSON.parse(fs.readFileSync(path.join(exportDir, 'surat.json'), 'utf-8'))
      for (const s of surat) {
        await prisma.surat.upsert({
          where: { id: s.id },
          update: s,
          create: s,
        })
      }
      console.log(`✅ Surat: ${surat.length} imported`)
    }

    // Import DigitalSignatures (after Surat)
    if (fs.existsSync(path.join(exportDir, 'signatures.json'))) {
      const signatures = JSON.parse(fs.readFileSync(path.join(exportDir, 'signatures.json'), 'utf-8'))
      for (const sig of signatures) {
        await prisma.digitalSignature.upsert({
          where: { id: sig.id },
          update: sig,
          create: sig,
        })
      }
      console.log(`✅ Signatures: ${signatures.length} imported`)
    }

    // Import Imam
    if (fs.existsSync(path.join(exportDir, 'imam.json'))) {
      const imam = JSON.parse(fs.readFileSync(path.join(exportDir, 'imam.json'), 'utf-8'))
      for (const i of imam) {
        await prisma.imam.upsert({
          where: { id: i.id },
          update: i,
          create: i,
        })
      }
      console.log(`✅ Imam: ${imam.length} imported`)
    }

    // Import Decisions
    if (fs.existsSync(path.join(exportDir, 'decisions.json'))) {
      const decisions = JSON.parse(fs.readFileSync(path.join(exportDir, 'decisions.json'), 'utf-8'))
      for (const d of decisions) {
        await prisma.decision.upsert({
          where: { id: d.id },
          update: d,
          create: d,
        })
      }
      console.log(`✅ Decisions: ${decisions.length} imported`)
    }

    console.log('\n✅ Data import completed successfully!')
    console.log('\n📋 Next steps:')
    console.log('   1. Verify data in Prisma Studio: npx prisma studio')
    console.log('   2. Test the application')
    console.log('   3. Remove data-export folder when migration is confirmed')

  } catch (error) {
    console.error('❌ Import failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run import
importData()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
