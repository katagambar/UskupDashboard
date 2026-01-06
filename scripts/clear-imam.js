const { PrismaClient } = require('@prisma/client')

async function clearImam() {
    const db = new PrismaClient()
    try {
        const result = await db.imam.deleteMany({})
        console.log('Deleted imam records:', result.count)
    } finally {
        await db.$disconnect()
    }
}

clearImam()
