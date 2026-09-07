import { HeadObjectCommand } from '@aws-sdk/client-s3'
import { getR2Client, getR2Config } from '../server/r2.js'

const TEST_KEY = 'video/volume-01/lesson-01/lecture-p01.mp4'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' })

  try {
    const { bucket } = getR2Config()
    const client = getR2Client()
    const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: TEST_KEY }))

    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).json({
      ok: true,
      storage: 'cloudflare-r2',
      bucket,
      key: TEST_KEY,
      size: Number(head.ContentLength || 0),
      contentType: head.ContentType || null,
      etag: head.ETag || null,
    })
  } catch (error) {
    console.error('r2-check error', error)
    return res.status(500).json({
      ok: false,
      error: error?.message || 'R2 check failed',
      code: error?.name || error?.Code || null,
    })
  }
}
