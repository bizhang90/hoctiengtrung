import { getR2Config } from '../server/r2.js'

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  try {
    const { bucket } = getR2Config()
    return res.status(200).json({ ok: true, service: 'hoctiengtrung-api', storage: 'cloudflare-r2', bucket })
  } catch (error) {
    return res.status(500).json({ ok: false, error: error.message })
  }
}
