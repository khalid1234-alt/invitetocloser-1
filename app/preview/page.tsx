import { InvitationPreview } from '@/components/invitation-preview'
import { getInvitationById } from '@/lib/invitation-store'
import { invitation as defaultInvitation } from '@/lib/invitation-data'
import { cookies } from 'next/headers'

const PREVIEW_COOKIE = 'invitation-preview'

export default async function PreviewPage({
  searchParams,
}: {
  searchParams?: Promise<{ id?: string }>
}) {
  const params = (await searchParams) ?? {}
  let record = await getInvitationById(params.id)

  const encoded = (await cookies()).get(PREVIEW_COOKIE)?.value
  if (encoded) {
    try {
      const cookieRecord = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'))
      if (!params.id || cookieRecord.id === params.id) {
        record = cookieRecord
      }
    } catch {
    }
  }

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
