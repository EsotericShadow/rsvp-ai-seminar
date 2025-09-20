import 'dotenv/config'
import prisma from '@/lib/prisma'

async function main() {
  console.log('Looking for Evergreen Web Solutions entry...')
  
  // Find the Evergreen Web Solutions entry
  const member = await prisma.audienceMember.findFirst({
    where: { 
      businessName: { contains: 'Evergreen Web Solutions' }
    },
    include: { group: true }
  })

  if (!member) {
    console.log('No Evergreen Web Solutions entry found')
    return
  }

  console.log(`Found entry: ${member.businessName} (${member.businessId})`)
  console.log(`Current invite token: ${member.inviteToken || 'NULL'}`)

  if (member.inviteToken) {
    console.log('Entry already has a token, no action needed')
    return
  }

  // Generate a token for the manual entry
  const token = `manual_${member.businessId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  // Update the entry with the token
  await prisma.audienceMember.update({
    where: { id: member.id },
    data: { inviteToken: token }
  })

  console.log(`✅ Updated Evergreen Web Solutions entry with token: ${token}`)
  console.log('The entry should now be able to receive campaign emails.')
}

main().catch((e) => {
  console.error('Error:', e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})

