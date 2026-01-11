import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateBishopName() {
  try {
    const result = await prisma.user.update({
      where: { email: 'uskup@keuskupan-sby.or.id' },
      data: { name: 'Mgr. Agustinus Tri Budi Utomo' }
    })
    console.log('Updated user:', result.email, '-> Name:', result.name)
  } catch (error) {
    console.error('Error updating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateBishopName()
