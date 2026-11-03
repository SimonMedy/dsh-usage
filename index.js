/**
 * Usage dashboard — Host half.
 *
 * Folds every stored Session log into token, request, and estimated-cost
 * figures, and serves them to the browser half as JSON. The Session log is the
 * only source of truth: each `assistant/message` event carries the provider
 * `usage` record and the model identity (`message.source`), so the fold is a
 * pure replay that surviving upgrades and forks.
 *
 * Prices are configuration, not data: the official API returns tokens, never
 * an invoice. Defaults follow the published DeepSeek price list in USD per 1M
 * tokens as `[off-peak, peak]`; peak hours are 01:00–04:00 and 06:00–10:00 UTC
 * on weekdays. A deployment overrides them through the row's `config`.
 *
 * @module dsh-usage
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

/** Plugin name reported by the Loader. */
export const name = 'usage-dashboard'

/** The Host connection carrier that mounts the authenticated JSON routes. */
export const inject = ['connection']

/** Published DeepSeek prices, USD per 1M tokens, `[off-peak, peak]`. */
const DEFAULT_PRICES = {
  'deepseek-flash': {
    cacheHit: [0.003, 0.006],
    cacheMiss: [0.15, 0.3],
    output: [0.6, 1.2],
    cacheWrite: [0, 0],
  },
  'deepseek-v4-pro': {
    cacheHit: [0.022, 0.044],
    cacheMiss: [0.66, 1.32],
    output: [1.98, 3.96],
    cacheWrite: [0, 0],
  },
}

/** Applied when a model name matches no entry: the cheap, current default. */
const FALLBACK_MODEL = 'deepseek-flash'

/** Route the page reads its window aggregate from. */
const SUMMARY_PATH = '/api/usage.summary'

/** Route the conversation chip reads one Session's per-turn cost from. */
const SESSION_PATH = '/api/usage.session'

/** How long a request-path scan may spend folding cold Sessions. */
const REQUEST_BUDGET_MS = 1500

/** How long the boot-time warm-up may spend folding cold Sessions. */
const WARM_BUDGET_MS = 20000

/** Balance lookup budget: the account service may need the network. */
const BALANCE_BUDGET_MS = 2500

/** Title lookup budget: one corpus observation for the listed Sessions. */
const TITLE_BUDGET_MS = 1500

/** Falls back to `-1` for values the provider omitted or malformed. */
function num(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : 0
}

/** Merge the row configuration over the defaults without deep-cloning prices per call. */
function resolveConfig(config) {
  const raw = config !== null && typeof config === 'object' ? config : {}
  const prices = { ...DEFAULT_PRICES }
  if (raw.prices !== null && typeof raw.prices === 'object') {
    for (const [model, entry] of Object.entries(raw.prices)) {
      if (entry === null || typeof entry !== 'object') continue
      const base = prices[model] ?? DEFAULT_PRICES[FALLBACK_MODEL]
      prices[model] = {
        cacheHit: pair(entry.cacheHit, base.cacheHit),
        cacheMiss: pair(entry.cacheMiss, base.cacheMiss),
        output: pair(entry.output, base.output),
        cacheWrite: pair(entry.cacheWrite, base.cacheWrite),
      }
    }
  }
  return {
    currency: typeof raw.currency === 'string' ? raw.currency : 'USD',
    windowDays: Number.isSafeInteger(raw.windowDays) && raw.windowDays > 0 && raw.windowDays <= 365 ? raw.windowDays : 30,
    prices,
    fallbackModel: typeof raw.fallbackModel === 'string' ? raw.fallbackModel : FALLBACK_MODEL,
  }
}

/** Accept a scalar (applied to both tariffs) or a `[off-peak, peak]` pair. */
function pair(value, fallback) {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) return [value, value]
  if (Array.isArray(value) && value.length === 2) {
    const [off, peak] = value
    if (typeof off === 'number' && typeof peak === 'number' && Number.isFinite(off) && Number.isFinite(peak) && off >= 0 && peak >= 0) return [off, peak]
  }
  return fallback
}

/** Whether one millisecond timestamp falls inside a DeepSeek peak window (UTC weekdays). */
function isPeak(time) {
  const date = new Date(time)
  const weekday = date.getUTCDay()
  if (weekday === 0 || weekday === 6) return false
  const hour = date.getUTCHours()
  return (hour >= 1 && hour < 4) || (hour >= 6 && hour < 10)
}

/** Pick the price row for one model name: exact, then family, then the fallback. */
function priceRow(prices, fallbackModel, model) {
  if (Object.hasOwn(prices, model)) return prices[model]
  const lower = model.toLowerCase()
  if (lower.includes('pro')) return prices['deepseek-v4-pro'] ?? prices[fallbackModel]
  if (lower.includes('flash')) return prices['deepseek-flash'] ?? prices[fallbackModel]
  return prices[fallbackModel] ?? DEFAULT_PRICES[FALLBACK_MODEL]
}

/** Whether a model has its own price row rather than the fallback grid. */
function priceKnown(prices, model) {
  if (Object.hasOwn(prices, model)) return true
  const lower = model.toLowerCase()
  if (lower.includes('pro')) return prices['deepseek-v4-pro'] !== undefined
  if (lower.includes('flash')) return prices['deepseek-flash'] !== undefined
  return false
}

/** The billed cost of one usage record in USD. */
function costOf(prices, fallbackModel, usage, time) {
  const row = priceRow(prices, fallbackModel, usage.model)
  const tariff = isPeak(time) ? 1 : 0
  return (
    (num(usage.inputTokens) * row.cacheMiss[tariff] +
      num(usage.cacheReadTokens) * row.cacheHit[tariff] +
      num(usage.cacheWriteTokens) * row.cacheWrite[tariff] +
      num(usage.outputTokens) * row.output[tariff]) /
    1e6
  )
}

/** Local calendar day key (`YYYY-MM-DD`) for one timestamp. */
function dayKey(time) {
  const date = new Date(time)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** Midnight-local timestamp of the day `offset` days before today. */
function dayStart(offset) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - offset)
  return date.getTime()
}

/** Longest window a request may ask for. */
const MAX_WINDOW_DAYS = 400

/** Midnight-local timestamp of the day containing `time`. */
function startOfDay(time) {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

/** Midnight-local timestamp of one `YYYY-MM-DD` parameter, or null. */
function parseDayParam(value) {
  if (typeof value !== 'string') return null
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value)
  if (parts === null) return null
  const date = new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
  date.setHours(0, 0, 0, 0)
  return Number.isFinite(date.getTime()) ? date.getTime() : null
}

/** First midnight of the month containing `time`. */
function monthStart(time) {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)
  date.setDate(1)
  return date.getTime()
}

/** Last millisecond of the day containing `time`. */
function dayEnd(time) {
  const date = new Date(time)
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + 1)
  return date.getTime() - 1
}

/**
 * Resolve the requested time range into an inclusive `[start, end]` window.
 *
 * Presets mirror the platform's picker: today, yesterday, the last 7 or 30
 * days, the current month, the previous calendar month, and an explicit
 * custom span. An unknown or incomplete request falls back to `fallbackDays`
 * ending today, so the page always receives a usable window.
 *
 * @param searchParams - the request query.
 * @param fallbackDays - default length when no usable range is present.
 * @returns the window with its preset name and day count.
 */
function resolveWindow(searchParams, fallbackDays) {
  const preset = searchParams.get('range') ?? ''
  const now = Date.now()
  const today = startOfDay(now)
  const span = (start, end, name) => {
    const boundedStart = Math.max(start, end - (MAX_WINDOW_DAYS - 1) * 24 * 60 * 60 * 1000)
    const days = Math.max(1, Math.round((dayEnd(end) - startOfDay(boundedStart)) / (24 * 60 * 60 * 1000)) + 1)
    return { start: startOfDay(boundedStart), end, preset: name, days: Math.min(days, MAX_WINDOW_DAYS) }
  }
  switch (preset) {
    case 'today':
      return span(today, now, 'today')
    case 'yesterday':
      return span(today - 24 * 60 * 60 * 1000, today - 1, 'yesterday')
    case 'last7':
      return span(today - 6 * 24 * 60 * 60 * 1000, now, 'last7')
    case 'last30':
      return span(today - 29 * 24 * 60 * 60 * 1000, now, 'last30')
    case 'thisMonth':
      return span(monthStart(today), now, 'thisMonth')
    case 'lastMonth': {
      const start = monthStart(monthStart(today) - 1)
      return span(start, monthStart(today) - 1, 'lastMonth')
    }
    case 'custom': {
      const from = parseDayParam(searchParams.get('from'))
      const to = parseDayParam(searchParams.get('to'))
      if (from === null || to === null) break
      const start = Math.min(from, to)
      return span(start, dayEnd(Math.max(from, to)), 'custom')
    }
    default:
      break
  }
  const requested = Number(searchParams.get('days'))
  const days = Number.isSafeInteger(requested) && requested >= 1 && requested <= MAX_WINDOW_DAYS ? requested : fallbackDays
  return span(today - (days - 1) * 24 * 60 * 60 * 1000, now, days === 30 ? 'last30' : 'custom')
}

/** Empty accumulation cell shared by the day, model, and turn buckets. */
function emptyBucket() {
  return { requests: 0, inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, cost: 0 }
}

/** Add one usage record into a bucket. */
function addInto(bucket, tokens, cost) {
  bucket.requests += 1
  bucket.inputTokens += tokens.inputTokens
  bucket.cacheReadTokens += tokens.cacheReadTokens
  bucket.cacheWriteTokens += tokens.cacheWriteTokens
  bucket.outputTokens += tokens.outputTokens
  bucket.cost += cost
}

/** Total tokens of one bucket, matching the provider's own `totalTokens`. */
function bucketTotal(bucket) {
  return bucket.inputTokens + bucket.cacheReadTokens + bucket.cacheWriteTokens + bucket.outputTokens
}

/**
 * Fold one Session log into usage figures.
 * @param header - the Session header, for identity and creation time.
 * @param events - the committed events in sequence order.
 * @param config - resolved prices and window policy.
 * @returns the Session's usage record, including per-model and per-turn splits.
 */
function foldSession(header, events, config) {
  const totals = emptyBucket()
  const byModel = new Map()
  const byDay = new Map()
  const byTurn = new Map()
  const byMessage = {}
  let lastTime = header.createdAt ?? 0
  let turns = 0
  let steps = 0

  for (const event of events) {
    if (event.type === 'turn/start') {
      turns += 1
      if (event.time > lastTime) lastTime = event.time
      continue
    }
    if (event.type === 'step/end') {
      steps += 1
      continue
    }
    if (event.type !== 'assistant/message') continue
    const usage = event.data !== null && typeof event.data === 'object' ? event.data.usage : undefined
    if (usage === null || typeof usage !== 'object') continue
    const message = event.data.message
    const source = message !== null && typeof message === 'object' ? (message.source ?? {}) : {}
    const model = typeof source.model === 'string' && source.model.length > 0 ? source.model : 'unknown'
    const provider = typeof source.provider === 'string' ? source.provider : ''
    const tokens = {
      inputTokens: num(usage.inputTokens),
      cacheReadTokens: num(usage.cacheReadTokens),
      cacheWriteTokens: num(usage.cacheWriteTokens),
      outputTokens: num(usage.outputTokens),
    }
    const cost = costOf(config.prices, config.fallbackModel, { ...tokens, model }, event.time)

    if (typeof message === 'object' && message !== null && typeof message.id === 'string' && message.id.length > 0) {
      const turn = Number(event.data.turn)
      byMessage[message.id] = {
        cost,
        requests: 1,
        turn: Number.isSafeInteger(turn) && turn >= 0 ? turn : 0,
        totalTokens: tokens.inputTokens + tokens.cacheReadTokens + tokens.cacheWriteTokens + tokens.outputTokens,
      }
    }

    addInto(totals, tokens, cost)

    const modelBucket = byModel.get(model) ?? { requests: 0, inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, cost: 0, model, provider, priced: priceKnown(config.prices, model) }
    if (!priceKnown(config.prices, model)) modelBucket.priced = false
    addInto(modelBucket, tokens, cost)
    byModel.set(model, modelBucket)

    const key = dayKey(event.time)
    const dayBucket = byDay.get(key) ?? emptyBucket()
    addInto(dayBucket, tokens, cost)
    byDay.set(key, dayBucket)

    const turn = Number(event.data.turn)
    if (Number.isSafeInteger(turn) && turn >= 0) {
      const turnBucket = byTurn.get(turn) ?? emptyBucket()
      addInto(turnBucket, tokens, cost)
      byTurn.set(turn, turnBucket)
    }

    if (event.time > lastTime) lastTime = event.time
  }

  return {
    id: String(header.id),
    createdAt: header.createdAt ?? 0,
    cwd: typeof header.cwd === 'string' ? header.cwd : '',
    delegationDepth: num(header.delegationDepth),
    agentPreset: typeof header.agentPreset === 'string' ? header.agentPreset : '',
    requests: totals.requests,
    inputTokens: totals.inputTokens,
    cacheReadTokens: totals.cacheReadTokens,
    cacheWriteTokens: totals.cacheWriteTokens,
    outputTokens: totals.outputTokens,
    totalTokens: bucketTotal(totals),
    cost: totals.cost,
    turns,
    steps,
    lastTime,
    byModel: [...byModel.values()],
    byDay: Object.fromEntries(byDay),
    byTurn: Object.fromEntries(byTurn),
    byMessage,
  }
}

/** Await one promise but never longer than `ms`; resolves `undefined` on timeout or failure. */
function bounded(promise, ms) {
  return Promise.race([
    Promise.resolve(promise).catch(() => undefined),
    new Promise((resolve) => setTimeout(() => resolve(undefined), ms)),
  ])
}

/** Minimum spacing between persisted balance samples. */
const SAMPLE_INTERVAL_MS = 3 * 60 * 60 * 1000

/** Oldest samples dropped once the file grows past this many entries. */
const MAX_SAMPLES = 400

/** Where the balance history lives: `<DSH_HOME>/storages/usage-dashboard/balance.json`. */
function balanceFilePath() {
  const home = process.env.DSH_HOME
  if (typeof home !== 'string' || home.length === 0) return null
  return join(home, 'storages', 'usage-dashboard', 'balance.json')
}

/** Read the persisted wallet samples; a missing or damaged file reads as empty. */
function readBalanceSamples() {
  const file = balanceFilePath()
  if (file === null) return []
  try {
    const parsed = JSON.parse(readFileSync(file, 'utf8'))
    const samples = parsed !== null && typeof parsed === 'object' && Array.isArray(parsed.samples) ? parsed.samples : []
    return samples.filter((sample) => sample !== null && typeof sample === 'object' && typeof sample.t === 'number' && typeof sample.total === 'number')
  } catch {
    return []
  }
}

/** Persist the wallet samples; a read-only home keeps the dashboard working without history. */
function writeBalanceSamples(samples) {
  const file = balanceFilePath()
  if (file === null) return
  try {
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, JSON.stringify({ version: 1, samples }))
  } catch {}
}

/**
 * Record the current wallet total at most every few hours, so a balance delta
 * becomes a measured spend figure instead of an estimate.
 * @param account - the resolved account wallets.
 */
function recordBalanceSample(account) {
  const wallets = Array.isArray(account.wallets) ? account.wallets : []
  const wallet = wallets.find((entry) => entry.currency === 'USD') ?? wallets[0]
  const total = Number(wallet?.balance)
  if (!Number.isFinite(total)) return
  const samples = readBalanceSamples()
  const last = samples[samples.length - 1]
  if (last !== undefined && Date.now() - last.t < SAMPLE_INTERVAL_MS) return
  samples.push({ t: Date.now(), total, currency: String(wallet.currency) })
  writeBalanceSamples(samples.slice(-MAX_SAMPLES))
}

/**
 * Measured spend over a window: the drop between the first and last sample.
 * @param since - window start in epoch milliseconds.
 * @param currency - currency to measure.
 * @returns the measured spend, or null with fewer than two samples.
 */
function measuredSpend(since, currency) {
  const scoped = readBalanceSamples().filter((sample) => sample.t >= since && sample.currency === currency)
  if (scoped.length < 2) return null
  const first = scoped[0]
  const last = scoped[scoped.length - 1]
  const amount = first.total - last.total
  if (!Number.isFinite(amount) || amount <= 0) return null
  return { amount, since: first.t, until: last.t, samples: scoped.length }
}

/**
 * Register the aggregation routes and warm the fold cache.
 * @param ctx - Host context carrying `connection` and the session services.
 * @param config - raw row configuration from the bundle patch.
 */
export function apply(ctx, config = {}) {
  const resolved = resolveConfig(config)

  /** `sessionId -> { revision, value }`: a fold survives until its log revision changes. */
  const folds = new Map()
  /** One background/foreground scan at a time; concurrent callers share it. */
  let scanning = null
  let lastScan = 0

  /**
   * Fold every stored Session, reusing cached folds whose revision is unchanged.
   * @param budgetMs - how long cold Sessions may be folded before returning partial.
   * @returns the per-Session records in newest-first order.
   */
  async function collect(budgetMs) {
    const persistence = ctx.get('sessionPersistence')
    if (persistence === undefined || persistence === null) return { sessions: [], partial: false, available: false }
    const snapshots = await persistence.list()
    snapshots.sort((a, b) => (b.header.createdAt ?? 0) - (a.header.createdAt ?? 0))
    const deadline = Date.now() + budgetMs
    const sessions = []
    let partial = false
    for (const snapshot of snapshots) {
      const id = String(snapshot.header.id)
      const cached = folds.get(id)
      if (cached !== undefined && cached.revision === String(snapshot.revision)) {
        sessions.push(cached.value)
        continue
      }
      if (partial || (Date.now() > deadline && sessions.length > 0)) {
        partial = true
        if (cached !== undefined) sessions.push(cached.value)
        continue
      }
      let handle
      try {
        handle = await persistence.open(id, 'read')
        const { events } = await handle.read(0, undefined, {})
        const value = foldSession(handle.header ?? snapshot.header, events, resolved)
        folds.set(id, { revision: String(snapshot.revision), value })
        sessions.push(value)
      } catch {
        if (cached !== undefined) sessions.push(cached.value)
      } finally {
        if (handle !== undefined) await handle.close().catch(() => undefined)
      }
    }
    // Drop folds of Sessions that left storage so the cache cannot grow forever.
    if (!partial) {
      const live = new Set(snapshots.map((snapshot) => String(snapshot.header.id)))
      for (const id of folds.keys()) if (!live.has(id)) folds.delete(id)
    }
    lastScan = Date.now()
    return { sessions, partial, available: true }
  }

  /** Run one scan at a time; a caller during a scan waits for that scan. */
  function scan(budgetMs) {
    if (scanning !== null) return scanning
    scanning = collect(budgetMs).finally(() => {
      scanning = null
    })
    return scanning
  }

  /** Merge Session folds into the window aggregate the page renders. */
  function aggregate(sessions, window) {
    const since = window.start
    const days = []
    const index = new Map()
    const cursor = new Date(window.start)
    cursor.setHours(0, 0, 0, 0)
    while (cursor.getTime() <= window.end && days.length < MAX_WINDOW_DAYS) {
      const bucket = { date: dayKey(cursor.getTime()), ...emptyBucket() }
      days.push(bucket)
      index.set(bucket.date, bucket)
      cursor.setDate(cursor.getDate() + 1)
    }
    const totals = emptyBucket()
    const byModel = new Map()
    const rows = []
    for (const session of sessions) {
      const inWindow = Object.entries(session.byDay).filter(([key]) => index.has(key))
      if (inWindow.length === 0 && session.lastTime < since) continue
      for (const [key, bucket] of inWindow) {
        const target = index.get(key)
        target.requests += bucket.requests
        target.inputTokens += bucket.inputTokens
        target.cacheReadTokens += bucket.cacheReadTokens
        target.cacheWriteTokens += bucket.cacheWriteTokens
        target.outputTokens += bucket.outputTokens
        target.cost += bucket.cost
      }
      let requests = 0
      let totalTokens = 0
      let cost = 0
      for (const [, bucket] of inWindow) {
        requests += bucket.requests
        totalTokens += bucketTotal(bucket)
        cost += bucket.cost
      }
      if (requests === 0) continue
      totals.requests += requests
      totals.cost += cost
      for (const [key, bucket] of inWindow) {
        totals.inputTokens += bucket.inputTokens
        totals.cacheReadTokens += bucket.cacheReadTokens
        totals.cacheWriteTokens += bucket.cacheWriteTokens
        totals.outputTokens += bucket.outputTokens
      }
      // Per-model figures are not stored per day, so attribute each model by
      // the Session's in-window token share. A Session entirely inside the
      // window keeps factor 1; an older one contributes its visible slice only.
      const sessionTokens = session.totalTokens
      const share = sessionTokens > 0 ? Math.min(1, totalTokens / sessionTokens) : 0
      for (const model of session.byModel) {
        const target = byModel.get(model.model) ?? { model: model.model, provider: model.provider, requests: 0, inputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, cost: 0, priced: model.priced !== false }
        if (model.priced === false) target.priced = false
        target.requests += model.requests * share
        target.inputTokens += model.inputTokens * share
        target.cacheReadTokens += model.cacheReadTokens * share
        target.cacheWriteTokens += model.cacheWriteTokens * share
        target.outputTokens += model.outputTokens * share
        target.cost += model.cost * share
        byModel.set(model.model, target)
      }
      rows.push({
        id: session.id,
        cwd: session.cwd,
        createdAt: session.createdAt,
        lastTime: session.lastTime,
        requests,
        totalTokens,
        cost,
        subagent: session.delegationDepth > 0,
        agentPreset: session.agentPreset,
      })
    }
    rows.sort((a, b) => b.lastTime - a.lastTime)
    return {
      totals: {
        requests: totals.requests,
        inputTokens: totals.inputTokens,
        cacheReadTokens: totals.cacheReadTokens,
        cacheWriteTokens: totals.cacheWriteTokens,
        outputTokens: totals.outputTokens,
        totalTokens: bucketTotal(totals),
        cost: totals.cost,
      },
      byDay: days.map((day) => ({ date: day.date, requests: day.requests, totalTokens: bucketTotal(day), cost: day.cost, inputTokens: day.inputTokens, cacheReadTokens: day.cacheReadTokens, outputTokens: day.outputTokens })),
      byModel: [...byModel.values()].sort((a, b) => b.cost - a.cost),
      sessions: rows,
      since,
      until: window.end,
      range: window.preset,
    }
  }

  /** Attach folded titles to the listed Sessions; failures leave the cwd fallback. */
  async function withTitles(rows) {
    const query = ctx.get('sessionQuery')
    if (query === undefined || query === null || typeof query.readTitleSnapshots !== 'function' || rows.length === 0) return rows
    const ids = rows.slice(0, 12).map((row) => row.id)
    const results = await bounded(query.readTitleSnapshots(ids), TITLE_BUDGET_MS)
    if (!Array.isArray(results)) return rows
    const titles = new Map()
    for (const result of results) {
      if (result === null || typeof result !== 'object') continue
      if (result.status !== 'fulfilled') continue
      const title = result.value?.title?.title
      if (typeof title === 'string' && title.length > 0) titles.set(String(result.sessionId), title)
    }
    return rows.map((row) => (titles.has(row.id) ? { ...row, title: titles.get(row.id) } : row))
  }

  /** Cached account wallets: the balance lookup may cross the network. */
  let accountCache = { at: 0, value: null }

  /** Read the signed-in account's wallet balances and top-up link, never blocking the page. */
  async function readSignedInAccount() {
    const account = ctx.get('deepseekAccount')
    if (account === undefined || account === null) return null
    const client = {
      version: '0.0.0',
      locale: 'en',
      timezoneOffsetSeconds: -new Date().getTimezoneOffset() * 60,
    }
    const [balance, state] = await Promise.all([
      typeof account.getBalance === 'function' ? bounded(account.getBalance(client), BALANCE_BUDGET_MS) : undefined,
      typeof account.getState === 'function' ? bounded(account.getState(), BALANCE_BUDGET_MS) : undefined,
    ])
    if (balance === undefined || balance === null || balance.status !== 'ready') return null
    const wallets = Array.isArray(balance.value) ? balance.value : []
    if (wallets.length === 0) return null
    return {
      source: 'account',
      wallets: wallets.map((wallet) => ({ currency: wallet.currency, balance: wallet.balance })),
      bonusWallets: (Array.isArray(balance.bonusWallets) ? balance.bonusWallets : []).map((wallet) => ({ currency: wallet.currency, balance: wallet.balance })),
      topUpUrl: typeof state?.links?.topUpUrl === 'string' ? state.links.topUpUrl : null,
      usageUrl: typeof state?.links?.usageUrl === 'string' ? state.links.usageUrl : null,
    }
  }

  /**
   * Read the same wallets from the official API with the configured key:
   * `/user/balance` answers total, granted, and topped-up amounts per currency,
   * which is the documented way to know the balance without a platform session.
   */
  async function readApiKeyAccount() {
    const credentials = ctx.get('credentials')
    if (credentials === undefined || credentials === null || typeof credentials.resolve !== 'function') return null
    const resolved = await bounded(credentials.resolve('DEEPSEEK_API_KEY'), 1200)
    const key = resolved !== undefined && resolved !== null && typeof resolved.value === 'string' ? resolved.value : undefined
    if (key === undefined || key.length === 0) return null
    const response = await bounded(globalThis.fetch('https://api.deepseek.com/user/balance', {
      headers: { authorization: `Bearer ${key}`, accept: 'application/json' },
    }), BALANCE_BUDGET_MS)
    if (response === undefined || response === null || response.ok !== true) return null
    const body = await bounded(response.json(), 1200)
    const infos = body !== undefined && body !== null && Array.isArray(body.balance_infos) ? body.balance_infos : []
    if (infos.length === 0) return null
    return {
      source: 'api-key',
      wallets: infos.map((info) => ({
        currency: String(info?.currency ?? 'USD'),
        balance: String(info?.total_balance ?? '0'),
        toppedUp: String(info?.topped_up_balance ?? '0'),
        granted: String(info?.granted_balance ?? '0'),
      })),
      bonusWallets: [],
      topUpUrl: 'https://platform.deepseek.com/top_up',
      usageUrl: 'https://platform.deepseek.com/usage',
    }
  }

  /** Resolve the wallets once per minute: account first, then the API key. */
  async function readAccount() {
    if (Date.now() - accountCache.at < 60000) return accountCache.value
    let account = await readSignedInAccount()
    if (account === null) account = await readApiKeyAccount()
    accountCache = { at: Date.now(), value: account }
    if (account !== null) recordBalanceSample(account)
    return account
  }

  /** JSON response helper. */
  function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
    })
  }

  /** The window aggregate the sidebar page renders. */
  async function summaryResponse(request) {
    const url = new URL(request.url)
    const window = resolveWindow(url.searchParams, resolved.windowDays)
    const result = await scan(REQUEST_BUDGET_MS)
    if (!result.available) return json({ error: 'session persistence is unavailable in this profile' }, 501)
    const aggregateResult = aggregate(result.sessions, window)
    const sessions = await withTitles(aggregateResult.sessions.slice(0, 20))
    const account = await readAccount()
    const wallet = account === null ? undefined : (account.wallets.find((entry) => entry.currency === resolved.currency) ?? account.wallets[0])
    return json({
      generatedAt: Date.now(),
      windowDays: aggregateResult.byDay.length,
      range: aggregateResult.range,
      since: aggregateResult.since,
      until: aggregateResult.until,
      partial: result.partial,
      currency: resolved.currency,
      totals: aggregateResult.totals,
      byDay: aggregateResult.byDay,
      byModel: aggregateResult.byModel,
      sessions,
      sessionCount: aggregateResult.sessions.length,
      account,
      spend: wallet === undefined ? null : measuredSpend(aggregateResult.since, wallet.currency),
    })
  }

  /** One Session's per-turn cost, for the conversation chip. */
  async function sessionResponse(request) {
    const url = new URL(request.url)
    const id = url.searchParams.get('sessionId')
    if (id === null || id.length === 0) return json({ error: 'missing sessionId' }, 400)
    const persistence = ctx.get('sessionPersistence')
    if (persistence === undefined || persistence === null) return json({ error: 'session persistence is unavailable' }, 501)
    const snapshot = await persistence.stat(id).catch(() => undefined)
    if (snapshot === undefined) return json({ error: 'session not found' }, 404)
    const revision = String(snapshot.revision)
    const cached = folds.get(id)
    let value
    if (cached !== undefined && cached.revision === revision) value = cached.value
    else {
      let handle
      try {
        handle = await persistence.open(id, 'read')
        const { events } = await handle.read(0, undefined, {})
        value = foldSession(handle.header ?? snapshot.header, events, resolved)
        folds.set(id, { revision, value })
      } finally {
        if (handle !== undefined) await handle.close().catch(() => undefined)
      }
    }
    return json({
      sessionId: id,
      currency: resolved.currency,
      requests: value.requests,
      totalTokens: value.totalTokens,
      cost: value.cost,
      byTurn: value.byTurn,
      byMessage: value.byMessage,
    })
  }

  ctx.effect(() => {
    const routes = [
      { path: SUMMARY_PATH, methods: ['GET'], requestBody: 'buffered', fetch: summaryResponse },
      { path: SESSION_PATH, methods: ['GET'], requestBody: 'buffered', fetch: sessionResponse },
    ]
    const disposers = routes.map((route) => ctx.connection.fetch.register(route))
    return () => {
      for (const pending of disposers) pending.then((dispose) => dispose(), () => undefined)
    }
  }, 'usage-dashboard: routes')

  // Warm the fold cache once the Host has settled, so the first page open is
  // already instant; the request path still scans on demand when it is not.
  ctx.effect(() => {
    const timer = setTimeout(() => {
      scan(WARM_BUDGET_MS).catch(() => undefined)
    }, 2000)
    timer.unref?.()
    return () => clearTimeout(timer)
  }, 'usage-dashboard: warm-up')

  // Sample the wallet hourly: the balance difference between two samples is
  // the only measured (billed) figure available without the platform API.
  ctx.effect(() => {
    const timer = setInterval(() => {
      readAccount().catch(() => undefined)
    }, 60 * 60 * 1000)
    timer.unref?.()
    return () => clearInterval(timer)
  }, 'usage-dashboard: balance sampler')
}
