import { createSignedObjectUrl } from '../server/r2.js'

function normalizeTwoDigits(value, fallback) {
  const raw = String(value || fallback)
  if (!/^\d{1,2}$/.test(raw)) return null
  return raw.padStart(2, '0')
}

function normalizeAsset(value) {
  const asset = String(value || 'lecture-p01.mp4')
  return /^[a-z0-9][a-z0-9._-]*\.mp4$/i.test(asset) ? asset : null
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  const volume = normalizeTwoDigits(req.query.volume, '01')
  const lesson = normalizeTwoDigits(req.query.lesson, '01')
  const asset = normalizeAsset(req.query.asset)
  if (!volume || !lesson || !asset) return res.status(400).json({ ok: false, error: 'Invalid video request' })

  const key = `video/volume-${volume}/lesson-${lesson}/${asset}`

  try {
    const url = await createSignedObjectUrl(key, 3600)
    res.setHeader('Cache-Control', 'no-store')

    if (String(req.query.json || '') === '1') {
      return res.status(200).json({ ok: true, key, expiresIn: 3600, url })
    }

    return res.redirect(302, url)
  } catch (error) {
    console.error('video-url api error', error)
    return res.status(500).json({ ok: false, error: error.message || 'Unable to create video URL' })
  }
}
