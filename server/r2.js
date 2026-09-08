import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const required = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET']

export function getR2Config() {
  const missing = required.filter((name) => !process.env[name])
  if (missing.length) {
    const error = new Error(`Missing environment variables: ${missing.join(', ')}`)
    error.code = 'R2_CONFIG_MISSING'
    throw error
  }

  return {
    accountId: process.env.R2_ACCOUNT_ID,
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    bucket: process.env.R2_BUCKET,
  }
}

export function getR2Client() {
  const config = getR2Config()
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true,
    requestChecksumCalculation: 'WHEN_REQUIRED',
    responseChecksumValidation: 'WHEN_REQUIRED',
  })
}

export async function readJsonObject(key) {
  const { bucket } = getR2Config()
  const client = getR2Client()
  const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
  const text = await response.Body.transformToString('utf-8')
  return JSON.parse(text)
}

export async function createSignedObjectUrl(key, expiresIn = 3600) {
  const { bucket } = getR2Config()
  const client = getR2Client()
  const command = new GetObjectCommand({ Bucket: bucket, Key: key })
  return getSignedUrl(client, command, { expiresIn })
}

export function isNotFoundError(error) {
  return error?.name === 'NoSuchKey' || error?.$metadata?.httpStatusCode === 404
}
