import { NextRequest, NextResponse } from 'next/server'
import { getInvitationById, readInvitationRecords, upsertInvitation } from '@/lib/invitation-store'

const PREVIEW_COOKIE = 'invitation-preview'

function parseDateInfo(dateValue: string, timeValue: string) {
  const date = new Date(`${dateValue}T12:00:00`)
  const time = new Date(`1970-01-01T${timeValue}:00`)
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' })
  const month = date.toLocaleDateString('en-US', { month: 'long' })
  const label = time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  return {
    weekday,
    day: dateValue.slice(8, 10),
    month,
    year: dateValue.slice(0, 4),
    full: `${weekday}, ${date.getDate()} ${month} ${date.getFullYear()}`,
    label,
    startsAt: `${dateValue}T${timeValue}:00`,
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  if (id) {
    const item = await getInvitationById(id)
    return NextResponse.json(item)
  }

  const items = await readInvitationRecords()
  return NextResponse.json(items)
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const groom = String(payload.groom ?? '').trim()
    const bride = String(payload.bride ?? '').trim()
    const occasion = String(payload.occasion ?? 'Walima Ceremony').trim() || 'Walima Ceremony'
    const hosts = String(payload.hosts ?? '').trim()
    const dateValue = String(payload.date ?? '').trim()
    const timeValue = String(payload.time ?? '').trim()
    const address = String(payload.venueAddress ?? '').trim()
    const venueName = String(payload.venueName ?? '').trim() || address.split(',')[0] || 'Venue'
    const lat = Number(payload.lat)
    const lon = Number(payload.lon)
    const tel = String(payload.contactTel ?? payload.tel ?? '').trim()
    const whatsapp = String(payload.whatsapp ?? '').trim()
    const display = String(payload.contactDisplay ?? payload.display ?? (tel || whatsapp)).trim()

    if (!groom || !bride || !hosts || !dateValue || !timeValue || !address || !Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'Missing required invitation details.' }, { status: 400 })
    }

    const dateInfo = parseDateInfo(dateValue, timeValue)
    const invitation = {
      id: String(payload.id ?? ''),
      groom,
      bride,
      occasion,
      hosts,
      date: {
        weekday: dateInfo.weekday,
        day: dateInfo.day,
        month: dateInfo.month,
        year: dateInfo.year,
        full: dateInfo.full,
      },
      time: {
        label: dateInfo.label,
        note: String(payload.timeNote ?? 'Dinner Onwards').trim() || 'Dinner Onwards',
      },
      startsAt: dateInfo.startsAt,
      venue: {
        name: venueName,
        address,
        lat,
        lon,
      },
      contact: {
        display: display || '+91 00000 00000',
        tel: tel || '0000000000',
        whatsapp: whatsapp || tel || '0000000000',
      },
    }

    let record
    try {
      record = await upsertInvitation(invitation)
    } catch (error) {
      console.error('Invitation persistence failed; using preview cookie', error)
      const now = new Date().toISOString()
      record = {
        ...invitation,
        id: invitation.id || Math.random().toString(36).slice(2, 10),
        createdAt: now,
        updatedAt: now,
      }
    }

    const response = NextResponse.json(record)
    response.cookies.set(PREVIEW_COOKIE, Buffer.from(JSON.stringify(record)).toString('base64url'), {
      httpOnly: true,
      maxAge: 60 * 60,
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    })
    return response
  } catch (error) {
    console.error('Invitation save failed', error)
    return NextResponse.json({ error: 'Unable to save invitation.' }, { status: 500 })
  }
}
