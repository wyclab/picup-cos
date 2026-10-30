import assert from 'node:assert/strict'
import { createHash, createHmac } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'

const dir = await mkdtemp(path.join(tmpdir(), 'picup-test-'))
process.env.PICUP_CONFIG = path.join(dir, 'config.json')
const { apply } = await import('../index.js')

const objects = new Map()
const authorizations = []
const authErrors = []
const SECRET_KEY = 'SECRETTEST'

function camSafeUrlEncode(value) {
  return encodeURIComponent(String(value))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

function getObjectKeys(object) {
  return Object.keys(object)
    .map((key) => camSafeUrlEncode(key).toLowerCase())
    .sort()
}

function obj2str(object) {
  return getObjectKeys(object)
    .map((key) => {
      const original = Object.keys(object).find(
        (candidate) => camSafeUrlEncode(candidate).toLowerCase() === key,
      )
      return `${key}=${camSafeUrlEncode(object[original])}`
    })
    .join('&')
}

function verifyAuthorization(req, url) {
  const auth = req.headers.authorization || ''
  const fields = {}
  for (const part of auth.split('&')) {
    const at = part.indexOf('=')
    if (at > 0) fields[part.slice(0, at)] = part.slice(at + 1)
  }
  const headers = { host: req.headers.host }
  if (req.headers['content-type']) headers['content-type'] = req.headers['content-type']
  const query = {}
  for (const [key, value] of url.searchParams) query[key] = value
  const qHeaderList = getObjectKeys(headers).join(';')
  const qUrlParamList = getObjectKeys(query).join(';')
  const formatString = [
    req.method.toLowerCase(),
    url.pathname,
    obj2str(query),
    obj2str(headers),
    '',
  ].join('\n')
  const signKey = createHmac('sha1', SECRET_KEY).update(fields['q-key-time'] || '').digest('hex')
  const stringToSign = [
    'sha1',
    fields['q-sign-time'] || '',
    createHash('sha1').update(formatString, 'utf8').digest('hex'),
    '',
  ].join('\n')
  const expected = createHmac('sha1', signKey).update(stringToSign).digest('hex')
  if (
    !auth ||
    fields['q-sign-algorithm'] !== 'sha1' ||
    fields['q-ak'] !== 'AKIDTEST' ||
    fields['q-header-list'] !== qHeaderList ||
    fields['q-url-param-list'] !== qUrlParamList ||
    fields['q-signature'] !== expected
  ) {
    authErrors.push({
      method: req.method,
      path: url.pathname,
      expectedSignature: expected,
      actualSignature: fields['q-signature'],
      expectedHeaderList: qHeaderList,
      actualHeaderList: fields['q-header-list'],
      expectedParamList: qUrlParamList,
      actualParamList: fields['q-url-param-list'],
      formatString,
    })
    return false
  }
  return true
}

function readAll(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function xmlEscape(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const cos = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  authorizations.push(req.headers.authorization || '')
  if (!verifyAuthorization(req, url)) {
    res.writeHead(403, { 'Content-Type': 'application/xml' })
    res.end('<Error><Code>SignatureDoesNotMatch</Code><Message>bad signature</Message></Error>')
    return
  }
  if (req.method === 'GET' && url.pathname === '/') {
    const prefix = url.searchParams.get('prefix') || ''
    const marker = url.searchParams.get('marker') || ''
    const max = Number(url.searchParams.get('max-keys') || 1000)
    const keys = [...objects.keys()].sort().filter((key) => key.startsWith(prefix) && (!marker || key > marker))
    const page = keys.slice(0, max)
    const truncated = keys.length > page.length
    const contents = page
      .map((key) => {
        const entry = objects.get(key)
        return `<Contents><Key>${xmlEscape(key)}</Key><LastModified>2026-10-30T12:00:00.000Z</LastModified><ETag>"x"</ETag><Size>${entry.body.length}</Size><StorageClass>STANDARD</StorageClass></Contents>`
      })
      .join('')
    const body = `<?xml version="1.0" encoding="utf-8"?><ListBucketResult><Name>test</Name><Prefix>${xmlEscape(prefix)}</Prefix><Marker>${xmlEscape(marker)}</Marker><MaxKeys>${max}</MaxKeys><IsTruncated>${truncated}</IsTruncated>${contents}${truncated ? `<NextMarker>${xmlEscape(page[page.length - 1])}</NextMarker>` : ''}</ListBucketResult>`
    res.writeHead(200, { 'Content-Type': 'application/xml' })
    res.end(body)
    return
  }
  const key = decodeURIComponent(url.pathname.slice(1))
  if (req.method === 'PUT') {
    const body = await readAll(req)
    objects.set(key, { body, type: req.headers['content-type'] || '' })
    res.writeHead(200, { ETag: '"test-etag"' })
    res.end()
    return
  }
  if (req.method === 'DELETE') {
    objects.delete(key)
    res.writeHead(204)
    res.end()
    return
  }
  if (req.method === 'GET') {
    const entry = objects.get(key)
    if (!entry) {
      res.writeHead(404, { 'Content-Type': 'application/xml' })
      res.end('<Error><Code>NoSuchKey</Code><Message>missing</Message></Error>')
      return
    }
    res.writeHead(200, { 'Content-Type': entry.type, 'Content-Length': entry.body.length })
    res.end(entry.body)
    return
  }
  res.writeHead(405)
  res.end()
})

const cosPort = await new Promise((resolve) => {
  cos.listen(0, '127.0.0.1', () => resolve(cos.address().port))
})

let route
apply({
  effect(fn) {
    return fn()
  },
  webServer: {
    register(value) {
      route = value
      return () => {}
    },
  },
})

const host = createServer((req, res) => {
  if (req.url?.startsWith('/api/picup')) {
    route.handler(req, res)
    return
  }
  res.writeHead(404)
  res.end()
})
const hostPort = await new Promise((resolve) => {
  host.listen(0, '127.0.0.1', () => resolve(host.address().port))
})
const base = `http://127.0.0.1:${hostPort}`
process.env.PICUP_ENDPOINT = `http://127.0.0.1:${cosPort}`

async function json(pathname, options) {
  const response = await fetch(base + pathname, options)
  const body = await response.json()
  return { response, body }
}

try {
  let result = await json('/api/picup/health')
  assert.equal(result.response.status, 200)
  assert.equal(result.body.ok, true)

  result = await json('/api/picup/config')
  assert.equal(result.body.configured, false)

  result = await json('/api/picup/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secretId: 'AKIDTEST',
      secretKey: 'SECRETTEST',
      bucket: 'example-1250000000',
      region: 'ap-guangzhou',
      domain: 'https://img.test',
      prefix: 'images',
      publicRead: true,
    }),
  })
  assert.equal(result.response.status, 200)
  assert.equal(result.body.configured, true)
  assert.equal(result.body.domain, 'https://img.test')
  assert.equal(result.body.hasSecretKey, true)

  const configStat = await stat(process.env.PICUP_CONFIG)
  assert.equal(configStat.mode & 0o777, 0o600)
  const saved = JSON.parse(await readFile(process.env.PICUP_CONFIG, 'utf8'))
  assert.equal(saved.secretKey, 'SECRETTEST')

  const payload = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3])
  const uploadResponse = await fetch(base + '/api/picup/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'image/png',
      'X-Picup-Name': encodeURIComponent('测试 (1)!.png'),
    },
    body: payload,
  })
  assert.equal(uploadResponse.status, 200)
  const uploaded = (await uploadResponse.json()).item
  assert.match(uploaded.key, /^images\/\d{4}\/\d{2}\/测试-\(1\)!-[a-z0-9-]+\.png$/)
  assert.match(uploaded.url, /^https:\/\/img\.test\/images\/.*%281%29%21-/)
  assert.equal(uploaded.preview, uploaded.url)
  assert.deepEqual(objects.get(uploaded.key).body, payload)
  assert.equal(objects.get(uploaded.key).type, 'image/png')
  assert.match(authorizations.at(-1), /q-header-list=content-type;host/)
  assert.match(authorizations.at(-1), /q-ak=AKIDTEST/)
  assert.match(authorizations.at(-1), /q-sign-time=/)

  result = await json('/api/picup/list?limit=60')
  assert.equal(result.response.status, 200)
  assert.equal(result.body.items.length, 1)
  assert.equal(result.body.items[0].key, uploaded.key)
  assert.equal(result.body.publicRead, true)

  const previewResponse = await fetch(
    base + `/api/picup/preview?key=${encodeURIComponent(uploaded.key)}`,
  )
  assert.equal(previewResponse.status, 200)
  assert.equal(previewResponse.headers.get('content-type'), 'image/png')
  assert.deepEqual(Buffer.from(await previewResponse.arrayBuffer()), payload)

  result = await json('/api/picup/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicRead: false }),
  })
  assert.equal(result.body.publicRead, false)
  result = await json('/api/picup/list?limit=60')
  assert.match(result.body.items[0].preview, /^\/api\/picup\/preview\?key=/)
  assert.equal(result.body.items[0].url, uploaded.url)

  result = await json('/api/picup/test', { method: 'POST' })
  assert.equal(result.body.ok, true)
  assert.equal(result.body.count, 1)

  const badOrigin = await fetch(base + '/api/picup/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://evil.test' },
    body: JSON.stringify({ keys: [uploaded.key] }),
  })
  assert.equal(badOrigin.status, 403)

  result = await json('/api/picup/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keys: [uploaded.key] }),
  })
  assert.deepEqual(result.body.deleted, [uploaded.key])
  assert.deepEqual(result.body.failed, [])
  assert.equal(objects.size, 0)

  result = await json('/api/picup/list?limit=60')
  assert.equal(result.body.items.length, 0)

  assert.deepEqual(authErrors, [])
  console.log('PICUP_SMOKE_OK')
} finally {
  host.close()
  cos.close()
  await rm(dir, { recursive: true, force: true })
}
