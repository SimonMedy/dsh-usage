// Aggregation: day buckets, per-day model split, window filtering, live sessions.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { boot, message, session } from './helpers.mjs'

const DAY = 86_400_000
const NOON = 12 * 60 * 60 * 1000

test('each day carries the per-model split the chart stacks', async () => {
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const at = today.getTime()
  const events = [
    message('m1', 0, [1_000, 0, 0, 1_000], { time: at, model: 'deepseek-flash' }),
    message('m2', 0, [1_000, 0, 0, 1_000], { time: at, model: 'deepseek-v4-pro' }),
  ]
  const { call } = await boot({ sessions: [session('s1', events, { createdAt: at - DAY })] })
  const { body } = await call('/api/usage.summary', { preset: 'last7' })

  const todayKey = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}`
  const bucket = body.byDay.find((day) => day.date === todayKey)
  assert.ok(bucket !== undefined, 'today has a bucket')
  assert.equal(bucket.models.length, 2)
  const splitSum = bucket.models.reduce((sum, entry) => sum + entry.cost, 0)
  assert.ok(Math.abs(splitSum - bucket.cost) < 1e-12, 'model split adds up to the day')
  assert.deepEqual(bucket.models.map((entry) => entry.model).sort(), ['deepseek-flash', 'deepseek-v4-pro'])
})

test('a Session outside the window does not reach the totals', async () => {
  const old = Date.now() - 40 * DAY
  const events = [message('m1', 0, [1_000_000, 0, 0, 0], { time: old })]
  const { call } = await boot({ sessions: [session('s1', events, { createdAt: old })] })
  const { body } = await call('/api/usage.summary', { preset: 'last7' })
  assert.equal(body.totals.requests, 0)
  assert.equal(body.totals.cost, 0)
})

test('subagent Sessions are flagged for the Session table', async () => {
  const events = [message('m1', 0, [10, 0, 0, 10])]
  const { call } = await boot({
    sessions: [session('main', events), session('child', events, { delegationDepth: 1, createdAt: Date.now() - 1000 })],
  })
  const { body } = await call('/api/usage.summary', { preset: 'last30' })
  const child = body.sessions.find((entry) => entry.id === 'child')
  assert.equal(child.subagent, true)
})

test('a live Session answers from its in-memory log before the flush', async () => {
  const events = [message('m1', 0, [10, 0, 0, 10]), message('m2', 0, [20, 0, 0, 20])]
  const stored = session('s1', events.slice(0, 1))
  const live = [{ id: 's1', header: stored.header, log: events }]
  const { call } = await boot({ sessions: [stored], live })
  const { body } = await call('/api/usage.session', { sessionId: 's1' })
  assert.equal(body.requests, 2, 'the live log wins over the one-event persisted copy')
})

test('an unknown Session is reported as not found', async () => {
  const { call } = await boot({ sessions: [] })
  const { status } = await call('/api/usage.session', { sessionId: 'nope' })
  assert.equal(status, 404)
})

test('a bad range falls back instead of failing', async () => {
  const { call } = await boot({ sessions: [] })
  const { status, body } = await call('/api/usage.summary', { preset: 'wat', from: 'x', to: 'y' })
  assert.equal(status, 200)
  assert.ok(Array.isArray(body.byDay))
})
