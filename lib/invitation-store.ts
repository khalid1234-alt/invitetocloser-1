import { promises as fs } from 'node:fs'
import path from 'node:path'

export type InvitationJson = {
  id: string
  groom: string
  bride: string
  occasion: string
  hosts: string
  date: {
    weekday: string
    day: string
    month: string
    year: string
    full: string
  }
  time: {
    label: string
    note: string
  }
  startsAt: string
  venue: {
    name: string
    address: string
    lat: number
    lon: number
  }
  contact: {
    display: string
    tel: string
    whatsapp: string
  }
  updatedAt: string
  createdAt: string
}

const DATA_DIR = path.join(process.cwd(), 'data')
const DATA_FILE = path.join(DATA_DIR, 'invitations.json')

async function ensureDataFile() {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, '[]', 'utf8')
  }
}

export async function readInvitationRecords(): Promise<InvitationJson[]> {
  await ensureDataFile()
  const contents = await fs.readFile(DATA_FILE, 'utf8')
  if (!contents.trim()) return []

  try {
    const data = JSON.parse(contents) as InvitationJson[]
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export async function writeInvitationRecords(records: InvitationJson[]) {
  await ensureDataFile()
  await fs.writeFile(DATA_FILE, JSON.stringify(records, null, 2), 'utf8')
}

export async function getInvitationById(id?: string | null) {
  const records = await readInvitationRecords()
  if (!id) return records[0] ?? null
  return records.find((record) => record.id === id) ?? records[0] ?? null
}

export async function upsertInvitation(payload: Omit<InvitationJson, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
  const records = await readInvitationRecords()
  const now = new Date().toISOString()
  const existingIndex = records.findIndex((record) => record.id === payload.id)

  if (existingIndex >= 0) {
    const updated = {
      ...records[existingIndex],
      ...payload,
      updatedAt: now,
    }
    records.splice(existingIndex, 1, updated)
    await writeInvitationRecords(records)
    return updated
  }

  const record: InvitationJson = {
    ...payload,
    id: payload.id || Math.random().toString(36).slice(2, 10),
    createdAt: now,
    updatedAt: now,
  } as InvitationJson

  records.unshift(record)
  await writeInvitationRecords(records)
  return record
}
