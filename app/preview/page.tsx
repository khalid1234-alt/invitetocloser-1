import { InvitationPreview } from '@/components/invitation-preview'
import { getInvitationById } from '@/lib/invitation-store'
import { invitation as defaultInvitation } from '@/lib/invitation-data'

export default async function PreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>
}) {
  const params = (await searchParams) ?? {}
  const record = await getInvitationById(params.id)

  const invitation = record
    ? {
        groom: record.groom,
        bride: record.bride,
        occasion: record.occasion,
        hosts: record.hosts,
        date: record.date,
        time: record.time,
        startsAt: record.startsAt,
        venue: record.venue,
        contact: record.contact,
      }
    : defaultInvitation

  return <InvitationPreview initialInvitation={invitation} />
}
