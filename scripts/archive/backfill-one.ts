import 'dotenv/config'
import prisma from '@/lib/prisma'
import {
  fetchLeadMineBusinesses,
} from '@/lib/leadMine'

async function main() {
  const group = await prisma.audienceGroup.findFirst({
    where: { members: { some: { businessName: { contains: 'Evergreen Web Solutions' } } } },
    include: { members: { where: { businessName: { contains: 'Evergreen Web Solutions' } } } },
  })

  const m = group?.members?.[0]
  if (!m) throw new Error('AudienceMember not found for businessId')

  if (!m.primaryEmail) throw new Error('Primary email is required to mint a token')

  // 1) Create (idempotent — ok if it already exists)
  // Removed createLeadMineBusiness call

  // 2) Fetch token
  const { data } = await fetchLeadMineBusinesses({
    ids: [m.businessId],
    createMissing: true,
    limit: 1,
  })
  const lm = data?.[0]
  const token = lm?.invite?.token
  if (!token) throw new Error('LeadMine returned no invite token')

  // 3) Persist
  await prisma.audienceMember.updateMany({
    where: { businessId: m.businessId },
    data: { inviteToken: token },
  })

  console.log('Backfilled token for:', m.businessId, token)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
