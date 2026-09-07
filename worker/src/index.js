const DEFAULT_JSON_CACHE = 'public, max-age=300'
const DEFAULT_VIDEO_CACHE = 'public, max-age=3600'

function corsHeaders(request, env) {
  const configured = env.ALLOWED_ORIGIN || '*'
  const origin = request.headers.get('Origin')
  const allowOrigin = configured === '*' ? '*' : (origin === configured ? origin : configured)
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization',
    'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges, ETag',
    'Access-Control-Max-Age': '86400',
  }
}

function withCors(headers, request, env) {
  const result = new Headers(headers)
  for (const [key, value] of Object.entries(corsHeaders(request, env))) result.set(key, value)
  return result
}

function jsonResponse(data, status, request, env) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: withCors({ 'Content-Type': 'application/json; charset=utf-8' }, request, env),
  })
}

function cleanSuffix(value) {
  const decoded = decodeURIComponent(value || '').replace(/^\/+/, '')
  if (!decoded || decoded.includes('..') || decoded.includes('\\')) return null
  return decoded
}

function parseRange(value, size) {
  if (!value || !value.startsWith('bytes=')) return null
  const first = value.slice(6).split(',')[0].trim()
  const [startRaw, endRaw] = first.split('-')

  let start
  let end
  if (startRaw === '') {
    const suffix = Number(endRaw)
    if (!Number.isFinite(suffix) || suffix <= 0) return null
    start = Math.max(0, size - suffix)
    end = size - 1
  } else {
    start = Number(startRaw)
    end = endRaw === '' ? size - 1 : Number(endRaw)
  }

  if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start || start >= size) return null
  end = Math.min(end, size - 1)
  return { start, end, length: end - start + 1 }
}

async function serveJsonObject(request, env, key) {
  if (request.method === 'HEAD') {
    const object = await env.CONTENT.head(key)
    if (!object) return jsonResponse({ error: 'not_found', key }, 404, request, env)
    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('ETag', object.httpEtag)
    headers.set('Content-Length', String(object.size))
    headers.set('Cache-Control', DEFAULT_JSON_CACHE)
    return new Response(null, { status: 200, headers: withCors(headers, request, env) })
  }

  const object = await env.CONTENT.get(key)
  if (!object) return jsonResponse({ error: 'not_found', key }, 404, request, env)
  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('ETag', object.httpEtag)
  headers.set('Cache-Control', DEFAULT_JSON_CACHE)
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json; charset=utf-8')
  return new Response(object.body, { status: 200, headers: withCors(headers, request, env) })
}

async function serveVideo(request, env, key) {
  const head = await env.CONTENT.head(key)
  if (!head) return jsonResponse({ error: 'not_found', key }, 404, request, env)

  if (request.method === 'HEAD') {
    const headers = new Headers()
    head.writeHttpMetadata(headers)
    headers.set('ETag', head.httpEtag)
    headers.set('Content-Length', String(head.size))
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Cache-Control', DEFAULT_VIDEO_CACHE)
    return new Response(null, { status: 200, headers: withCors(headers, request, env) })
  }

  const rangeHeader = request.headers.get('Range')
  if (rangeHeader) {
    const range = parseRange(rangeHeader, head.size)
    if (!range) {
      const headers = withCors({ 'Content-Range': `bytes */${head.size}` }, request, env)
      return new Response(null, { status: 416, headers })
    }

    const object = await env.CONTENT.get(key, { range: { offset: range.start, length: range.length } })
    if (!object) return jsonResponse({ error: 'not_found', key }, 404, request, env)
    const headers = new Headers()
    head.writeHttpMetadata(headers)
    headers.set('ETag', head.httpEtag)
    headers.set('Accept-Ranges', 'bytes')
    headers.set('Content-Range', `bytes ${range.start}-${range.end}/${head.size}`)
    headers.set('Content-Length', String(range.length))
    headers.set('Cache-Control', DEFAULT_VIDEO_CACHE)
    return new Response(object.body, { status: 206, headers: withCors(headers, request, env) })
  }

  const object = await env.CONTENT.get(key)
  if (!object) return jsonResponse({ error: 'not_found', key }, 404, request, env)
  const headers = new Headers()
  head.writeHttpMetadata(headers)
  headers.set('ETag', head.httpEtag)
  headers.set('Content-Length', String(head.size))
  headers.set('Accept-Ranges', 'bytes')
  headers.set('Cache-Control', DEFAULT_VIDEO_CACHE)
  return new Response(object.body, { status: 200, headers: withCors(headers, request, env) })
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) })
    }
    if (!['GET', 'HEAD'].includes(request.method)) {
      return jsonResponse({ error: 'method_not_allowed' }, 405, request, env)
    }

    const url = new URL(request.url)
    const path = url.pathname

    if (path === '/' || path === '/api/health') {
      return jsonResponse({ ok: true, service: 'hoctiengtrung-api', bucket: 'hoctiengtrung' }, 200, request, env)
    }

    const lessonMatch = path.match(/^\/api\/lesson\/(volume-\d+)\/(lesson-\d+)\/?$/)
    if (lessonMatch) {
      const key = `content/${lessonMatch[1]}/${lessonMatch[2]}/lesson.json`
      return serveJsonObject(request, env, key)
    }

    if (path.startsWith('/api/content/')) {
      const suffix = cleanSuffix(path.slice('/api/content/'.length))
      if (!suffix) return jsonResponse({ error: 'invalid_path' }, 400, request, env)
      return serveJsonObject(request, env, `content/${suffix}`)
    }

    if (path.startsWith('/api/video/')) {
      const suffix = cleanSuffix(path.slice('/api/video/'.length))
      if (!suffix) return jsonResponse({ error: 'invalid_path' }, 400, request, env)
      return serveVideo(request, env, `video/${suffix}`)
    }

    return jsonResponse({ error: 'not_found' }, 404, request, env)
  },
}
