import { isNotFoundError, readJsonObject } from '../server/r2.js'

function normalizeTwoDigits(value, fallback) {
  const raw = String(value || fallback)
  if (!/^\d{1,2}$/.test(raw)) return null
  return raw.padStart(2, '0')
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const volume = normalizeTwoDigits(req.query.volume, '01')
  const lesson = normalizeTwoDigits(req.query.lesson, '01')
  if (!volume || !lesson) return res.status(400).json({ ok: false, error: 'Invalid volume or lesson' })

  const key = `content/volume-${volume}/lesson-${lesson}/lesson.json`

  try {
    const data = await readJsonObject(key)
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400')
    return res.status(200).json({ ok: true, key, lesson: data })
  } catch (error) {
    if (isNotFoundError(error)) return res.status(404).json({ ok: false, error: 'Lesson content not found', key })
    console.error('lesson api error', error)
    return res.status(500).json({ ok: false, error: error.message || 'Unable to load lesson' })
  }
}
