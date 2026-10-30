import { createHash, createHmac, randomUUID } from 'node:crypto'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'

const ROUTE = '/api/picup'
const MAX_UPLOAD = 50 * 1024 * 1024
const MAX_JSON = 256 * 1024
const CONFIG_FILE = process.env.PICUP_CONFIG || path.join(homedir(), '.picup', 'config.json')

const MIME_BY_EXT = {
  avif: 'image/avif',
  bmp: 'image/bmp',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  jxl: 'image/jxl',
  png: 'image/png',
  svg: 'image/svg+xml',
  tif: 'image/tiff',
  tiff: 'image/tiff',
  webp: 'image/webp',
}

const EXT_BY_MIME = {
  'image/avif': 'avif',
  'image/bmp': 'bmp',
  'image/gif': 'gif',
  'image/heic': 'heic',
  'image/heif': 'heif',
  'image/jpeg': 'jpg',
  'image/jxl': 'jxl',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tif',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
}

class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

function defaultConfig() {
  return {
    secretId: '',
    secretKey: '',
    bucket: '',
    region: 'ap-guangzhou',
    domain: '',
    prefix: 'images',
    publicRead: true,
  }
}

function text(value, max = 600) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalizeDomain(value) {
  let raw = text(value, 500).replace(/\/+$/, '')
  if (!raw) return ''
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new HttpError(400, '自定义域名格式不正确')
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new HttpError(400, '自定义域名必须以 http:// 或 https:// 开头')
  }
  return `${url.origin}${url.pathname.replace(/\/+$/, '')}`
}

function normalizePrefix(value) {
  return text(value, 200).replace(/^\/+|\/+$/g, '')
}

function isConfigured(cfg) {
  return Boolean(cfg.secretId && cfg.secretKey && cfg.bucket && cfg.region)
}

async function readConfig() {
  let raw
  try {
    raw = await readFile(CONFIG_FILE, 'utf8')
  } catch (error) {
    if (error && error.code === 'ENOENT') return defaultConfig()
    throw error
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new HttpError(500, `配置文件不是合法 JSON：${CONFIG_FILE}`)
  }
  const cfg = { ...defaultConfig(), ...(parsed && typeof parsed === 'object' ? parsed : {}) }
  cfg.secretId = text(cfg.secretId)
  cfg.secretKey = text(cfg.secretKey, 1000)
  cfg.bucket = text(cfg.bucket).toLowerCase()
  cfg.region = text(cfg.region).toLowerCase() || 'ap-guangzhou'
  cfg.domain = text(cfg.domain)
  cfg.prefix = normalizePrefix(cfg.prefix)
  cfg.publicRead = cfg.publicRead !== false
  return cfg
}

async function writeConfig(cfg) {
  await mkdir(path.dirname(CONFIG_FILE), { recursive: true, mode: 0o700 })
  const body = JSON.stringify(cfg, null, 2)
  await writeFile(CONFIG_FILE, body, { mode: 0o600 })
  try {
    await chmod(CONFIG_FILE, 0o600)
  } catch {
    // Best effort: Windows / unusual filesystems do not support POSIX modes.
  }
}

function publicConfig(cfg) {
  return {
    secretId: cfg.secretId,
    hasSecretKey: Boolean(cfg.secretKey),
    bucket: cfg.bucket,
    region: cfg.region,
    domain: cfg.domain,
    prefix: cfg.prefix,
    publicRead: cfg.publicRead,
    configured: isConfigured(cfg),
    configPath: CONFIG_FILE,
    maxUpload: MAX_UPLOAD,
  }
}

function mergeConfig(previous, input) {
  const next = { ...previous }
  if ('secretId' in input) next.secretId = text(input.secretId)
  if ('secretKey' in input) {
    const key = text(input.secretKey, 1000)
    if (key || input.clearSecret === true) next.secretKey = key
  }
  if ('bucket' in input) next.bucket = text(input.bucket).toLowerCase()
  if ('region' in input) next.region = text(input.region).toLowerCase() || 'ap-guangzhou'
  if ('domain' in input) next.domain = normalizeDomain(input.domain)
  if ('prefix' in input) next.prefix = normalizePrefix(input.prefix)
  if ('publicRead' in input) next.publicRead = input.publicRead !== false
  return next
}

function endpoint(cfg) {
  if (process.env.PICUP_ENDPOINT) return process.env.PICUP_ENDPOINT.replace(/\/+$/, '')
  if (!/^[a-z0-9][a-z0-9.-]*$/i.test(cfg.bucket)) {
    throw new HttpError(400, 'Bucket 格式不正确，例如 example-1250000000')
  }
  if (!/^[a-z0-9-]+$/i.test(cfg.region)) {
    throw new HttpError(400, 'Region 格式不正确，例如 ap-guangzhou')
  }
  return `https://${cfg.bucket}.cos.${cfg.region}.myqcloud.com`
}

function encodeComponent(value) {
  return encodeURIComponent(String(value))
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A')
}

function encodeKey(key) {
  return key.split('/').map((part) => encodeComponent(part)).join('/')
}

function objectUrl(cfg, key) {
  const base = cfg.domain || endpoint(cfg)
  return `${base}/${encodeKey(key)}`
}

function proxyUrl(key) {
  return `${ROUTE}/preview?key=${encodeURIComponent(key)}`
}

function imageItem(cfg, key, size, lastModified) {
  const url = objectUrl(cfg, key)
  const proxy = proxyUrl(key)
  return {
    key,
    name: key.split('/').pop() || key,
    size: Number(size) || 0,
    lastModified: lastModified || '',
    url,
    preview: cfg.publicRead ? url : proxy,
    proxy,
  }
}

function safeKey(cfg, value) {
  const key = typeof value === 'string' ? value : ''
  if (!key || key.startsWith('/') || key.includes('\0')) {
    throw new HttpError(400, '对象路径不合法')
  }
  if (cfg.prefix && key !== cfg.prefix && !key.startsWith(`${cfg.prefix}/`)) {
    throw new HttpError(400, '对象不在当前路径前缀内')
  }
  return key
}

function hmacSha1(key, data) {
  return createHmac('sha1', key).update(data, 'utf8').digest('hex')
}

function sha1(data) {
  return createHash('sha1').update(data, 'utf8').digest('hex')
}

function authorization({ secretId, secretKey, method, pathname, query, headers }) {
  const start = Math.floor(Date.now() / 1000)
  const keyTime = `${start};${start + 3600}`
  const signKey = hmacSha1(secretKey, keyTime)
  const normalized = {}
  for (const [name, value] of Object.entries(headers)) {
    normalized[name.toLowerCase()] = String(value)
  }
  const headerList = Object.keys(normalized).sort()
  const params = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([name, value]) => [name.toLowerCase(), String(value)])
    .sort(([left], [right]) => (left === right ? 0 : left > right ? 1 : -1))
  const paramList = params.map(([name]) => encodeComponent(name))
  const canonicalHeaders = headerList
    .map((name) => `${encodeComponent(name)}=${encodeComponent(normalized[name])}`)
    .join('&')
  const canonicalQuery = params
    .map(([name, value]) => `${encodeComponent(name)}=${encodeComponent(value)}`)
    .join('&')
  const httpString = `${method.toLowerCase()}\n${pathname}\n${canonicalQuery}\n${canonicalHeaders}\n`
  const stringToSign = `sha1\n${keyTime}\n${sha1(httpString)}\n`
  const signature = hmacSha1(signKey, stringToSign)
  return [
    'q-sign-algorithm=sha1',
    `q-ak=${encodeURIComponent(secretId)}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=${headerList.join(';')}`,
    `q-url-param-list=${paramList.join(';')}`,
    `q-signature=${signature}`,
  ].join('&')
}

function queryString(query) {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([name, value]) => [name.toLowerCase(), String(value)])
    .sort(([left], [right]) => (left === right ? 0 : left > right ? 1 : -1))
    .map(([name, value]) => `${encodeComponent(name)}=${encodeComponent(value)}`)
    .join('&')
}

async function cosRequest(cfg, { method, key = '', query = {}, body, contentType, signal }) {
  const base = endpoint(cfg)
  const pathname = key ? `/${encodeKey(key)}` : '/'
  const headers = { host: new URL(base).host }
  if (contentType) headers['content-type'] = contentType
  const auth = authorization({
    secretId: cfg.secretId,
    secretKey: cfg.secretKey,
    method,
    pathname,
    query,
    headers,
  })
  const qs = queryString(query)
  const url = `${base}${pathname}${qs ? `?${qs}` : ''}`
  return fetch(url, {
    method,
    headers: {
      ...(contentType ? { 'Content-Type': contentType } : {}),
      Authorization: auth,
    },
    body,
    signal,
  })
}

function decodeXml(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

function tag(xml, name) {
  const match = xml.match(new RegExp(`<${name}>([\\s\\S]*?)</${name}>`))
  return match ? decodeXml(match[1]) : ''
}

async function cosError(response) {
  let raw = ''
  try {
    raw = await response.text()
  } catch {
    // Ignore a body we cannot read.
  }
  const code = tag(raw, 'Code')
  const message = tag(raw, 'Message')
  const detail = [code, message].filter(Boolean).join(': ')
  return new HttpError(502, `COS ${response.status}${detail ? ` ${detail}` : ''}`)
}

async function listObjects(cfg, { prefix, marker, limit = 60 } = {}) {
  const query = {
    prefix: prefix || '',
    marker: marker || '',
    'max-keys': String(Math.max(1, Math.min(1000, Number(limit) || 60))),
  }
  const response = await cosRequest(cfg, { method: 'GET', query })
  if (!response.ok) throw await cosError(response)
  const xml = await response.text()
  const items = []
  const blocks = xml.match(/<Contents>[\s\S]*?<\/Contents>/g) || []
  for (const block of blocks) {
    const key = tag(block, 'Key')
    if (!key) continue
    items.push(imageItem(cfg, key, tag(block, 'Size'), tag(block, 'LastModified')))
  }
  const truncated = tag(xml, 'IsTruncated') === 'true'
  const lastKey = items.length ? items[items.length - 1].key : ''
  const nextMarker = truncated ? tag(xml, 'NextMarker') || lastKey : ''
  return { items, truncated, nextMarker }
}

function mimeFor(key) {
  const ext = key.split('.').pop()?.toLowerCase() || ''
  return MIME_BY_EXT[ext] || 'application/octet-stream'
}

function sanitizeBaseName(name) {
  const base = String(name || 'image')
    .split(/[\\/]/)
    .pop()
    .replace(/[\u0000-\u001f<>:"|?*]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
  return base.slice(0, 90) || 'image'
}

function splitName(name) {
  const base = sanitizeBaseName(name)
  const dot = base.lastIndexOf('.')
  if (dot <= 0) return { stem: base, ext: '' }
  return { stem: base.slice(0, dot) || 'image', ext: base.slice(dot + 1).toLowerCase() }
}

function uploadKey(cfg, name, contentType) {
  const { stem, ext: nameExt } = splitName(name)
  const ext = (nameExt || EXT_BY_MIME[contentType] || 'bin').replace(/[^a-z0-9]/g, '').slice(0, 10) || 'bin'
  const now = new Date()
  const year = String(now.getFullYear())
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const suffix = `${Date.now().toString(36)}-${randomUUID().slice(0, 6)}`
  const prefix = cfg.prefix ? `${cfg.prefix}/` : ''
  return `${prefix}${year}/${month}/${stem}-${suffix}.${ext}`
}

function normalizeContentType(value, key) {
  const raw = text(value, 200).split(';')[0].trim().toLowerCase()
  if (raw && raw !== 'application/octet-stream') return raw
  return mimeFor(key)
}

async function uploadObject(cfg, { name, contentType, body }) {
  const key = uploadKey(cfg, name, contentType)
  const type = normalizeContentType(contentType, key)
  const response = await cosRequest(cfg, { method: 'PUT', key, body, contentType: type })
  if (!response.ok) throw await cosError(response)
  const now = new Date().toISOString()
  return { ...imageItem(cfg, key, body.length, now), contentType: type, etag: response.headers.get('etag') || '' }
}

async function deleteObjects(cfg, keys) {
  const deleted = []
  const failed = []
  for (const rawKey of keys) {
    let key = typeof rawKey === 'string' ? rawKey : ''
    try {
      key = safeKey(cfg, rawKey)
      const response = await cosRequest(cfg, { method: 'DELETE', key })
      if (!response.ok && response.status !== 404) throw await cosError(response)
      deleted.push(key)
    } catch (error) {
      failed.push({ key, error: error instanceof Error ? error.message : String(error) })
    }
  }
  return { deleted, failed }
}

async function readBody(req, limit) {
  const declared = Number(req.headers['content-length'] || 0)
  if (declared > limit) throw new HttpError(413, `请求体超过限制（最大 ${Math.round(limit / 1024 / 1024)} MB）`)
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > limit) throw new HttpError(413, `请求体超过限制（最大 ${Math.round(limit / 1024 / 1024)} MB）`)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

async function readJson(req) {
  const body = await readBody(req, MAX_JSON)
  if (!body.length) return {}
  try {
    const parsed = JSON.parse(body.toString('utf8'))
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    throw new HttpError(400, '请求 JSON 格式不正确')
  }
}

function sendJson(res, status, value) {
  if (res.headersSent) return
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function isLocal(req) {
  const address = req.socket.remoteAddress || ''
  return address === '127.0.0.1' || address === '::1' || address === '::ffff:127.0.0.1'
}

function sameOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true
  try {
    const parsed = new URL(origin)
    return parsed.host === req.headers.host
  } catch {
    return false
  }
}

function safeDecode(value) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

async function handle(req, res) {
  if (!isLocal(req)) {
    sendJson(res, 403, { error: 'COS 图床仅允许本机访问' })
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD' && !sameOrigin(req)) {
    sendJson(res, 403, { error: '拒绝跨站请求' })
    return
  }

  const url = new URL(req.url || '/', 'http://localhost')
  const sub = url.pathname.slice(ROUTE.length) || '/'

  if (req.method === 'GET' && (sub === '/health' || sub === '/')) {
    sendJson(res, 200, { ok: true, service: 'picup-cos' })
    return
  }

  if (req.method === 'GET' && sub === '/config') {
    sendJson(res, 200, publicConfig(await readConfig()))
    return
  }

  if (req.method === 'POST' && sub === '/config') {
    const previous = await readConfig()
    const input = await readJson(req)
    const next = mergeConfig(previous, input)
    if (!isConfigured(next)) {
      sendJson(res, 400, { error: '请填写 SecretId、SecretKey、Bucket 和 Region' })
      return
    }
    await writeConfig(next)
    sendJson(res, 200, publicConfig(next))
    return
  }

  if (req.method === 'POST' && sub === '/test') {
    const cfg = await readConfig()
    if (!isConfigured(cfg)) {
      sendJson(res, 200, { ok: false, error: 'COS 尚未配置完整' })
      return
    }
    try {
      const result = await listObjects(cfg, { limit: 1 })
      sendJson(res, 200, { ok: true, bucket: cfg.bucket, region: cfg.region, count: result.items.length })
    } catch (error) {
      sendJson(res, 200, { ok: false, error: error instanceof Error ? error.message : String(error) })
    }
    return
  }

  if (req.method === 'GET' && sub === '/list') {
    const cfg = await readConfig()
    if (!isConfigured(cfg)) throw new HttpError(400, 'COS 尚未配置完整')
    const limit = Math.max(1, Math.min(200, Number(url.searchParams.get('limit')) || 60))
    const marker = url.searchParams.get('marker') || ''
    const result = await listObjects(cfg, {
      prefix: cfg.prefix ? `${cfg.prefix}/` : '',
      marker,
      limit,
    })
    sendJson(res, 200, {
      ...result,
      prefix: cfg.prefix,
      domain: cfg.domain,
      publicRead: cfg.publicRead,
    })
    return
  }

  if (req.method === 'POST' && sub === '/upload') {
    const cfg = await readConfig()
    if (!isConfigured(cfg)) throw new HttpError(400, 'COS 尚未配置完整')
    const name = safeDecode(String(req.headers['x-picup-name'] || 'image'))
    const contentType = String(req.headers['content-type'] || '')
    const body = await readBody(req, MAX_UPLOAD)
    if (!body.length) throw new HttpError(400, '文件为空')
    const item = await uploadObject(cfg, { name, contentType, body })
    sendJson(res, 200, { item })
    return
  }

  if (req.method === 'POST' && sub === '/delete') {
    const cfg = await readConfig()
    if (!isConfigured(cfg)) throw new HttpError(400, 'COS 尚未配置完整')
    const input = await readJson(req)
    const keys = Array.isArray(input.keys) ? input.keys.filter((key) => typeof key === 'string') : []
    if (!keys.length) throw new HttpError(400, '没有要删除的对象')
    sendJson(res, 200, await deleteObjects(cfg, keys))
    return
  }

  if (req.method === 'GET' && sub === '/preview') {
    const cfg = await readConfig()
    if (!isConfigured(cfg)) throw new HttpError(400, 'COS 尚未配置完整')
    const key = safeKey(cfg, url.searchParams.get('key') || '')
    const controller = new AbortController()
    res.on('close', () => {
      if (!res.writableEnded) controller.abort()
    })
    let upstream
    try {
      upstream = await cosRequest(cfg, { method: 'GET', key, signal: controller.signal })
    } catch (error) {
      if (controller.signal.aborted) return
      throw error
    }
    if (!upstream.ok) throw await cosError(upstream)
    if (!upstream.body) throw new HttpError(502, 'COS 返回了空响应')
    res.writeHead(200, {
      'Content-Type': upstream.headers.get('content-type') || mimeFor(key),
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    })
    Readable.fromWeb(upstream.body)
      .on('error', () => res.destroy())
      .pipe(res)
    return
  }

  sendJson(res, 404, { error: '未知的 COS 图床接口' })
}

export const inject = ['webServer']

export function apply(ctx) {
  ctx.effect(() =>
    ctx.webServer.register({
      kind: 'prefix',
      path: ROUTE,
      handler: (req, res) => {
        handle(req, res).catch((error) => {
          if (res.headersSent) {
            res.destroy()
            return
          }
          const status = error instanceof HttpError ? error.status : 500
          sendJson(res, status, { error: error instanceof Error ? error.message : String(error) })
        })
      },
    }),
  )
}
