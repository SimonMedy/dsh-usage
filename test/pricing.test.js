// Cost maths: published rows, peak/off-peak, and models nobody configured.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'
import { boot, message, session } from './helpers.mjs'

/** 2026-11-03 12:00 UTC, a Tuesday: off-peak. */
const OFF_PEAK = Date.UTC(2026, 10, 3, 12, 0, 0)
/** 2026-11-03 02:00 UTC, a Tuesday: inside the first peak window. */
const PEAK = Date.UTC(2026, 10, 3, 2, 0, 0)

const summaryOf = async (events, config) => {
  const { call } = await boot({ sessions: [session('s1', events)], config })
  const { body } = await call('/api/usage.summary', { preset: 'last30' })
  return body
}

test('an exact model row uses the published off-peak rates', async () => {
  const body = await summaryOf([message('m1', 0, [1_000_000, 0, 0, 0], { time: OFF_PEAK, model: 'deepseek-flash' })])
  assert.equal(body.totals.cost, 0.15)
})

test('the same tokens cost double inside a peak window', async () => {
  const body = await summaryOf([message('m1', 0, [1_000_000, 0, 0, 0], { time: PEAK, model: 'deepseek-flash' })])
  assert.equal(body.totals.cost, 0.3)
})

test('cached input is billed at the cache rate, not the miss rate', async () => {
  const body = await summaryOf([message('m1', 0, [0, 1_000_000, 0, 0], { time: OFF_PEAK, model: 'deepseek-flash' })])
  assert.equal(body.totals.cost, 0.003)
})

test('a configured model wins over every default', async () => {
  const body = await summaryOf([message('m1', 0, [1_000_000, 0, 0, 0], { time: OFF_PEAK, model: 'deepseek-flash' })], {
    prices: { 'deepseek-flash': { cacheMiss: [1, 2], cacheHit: [0, 0], output: [0, 0] } },
  })
  assert.equal(body.totals.cost, 1)
  assert.equal(body.byModel[0].estimated, false)
})

test('an unknown model is priced from its family and marked as an estimate', async () => {
  const body = await summaryOf([message('m1', 0, [1_000_000, 0, 0, 0], { time: OFF_PEAK, model: 'deepseek-v9-pro' })])
  // `pro` in the name selects the pro grid: 0.66 off-peak per 1M uncached.
  assert.equal(body.totals.cost, 0.66)
  assert.equal(body.byModel[0].estimated, true)
  assert.equal(body.byModel[0].priced, true)
})

test('an unknown family falls back to the cheap grid, still flagged', async () => {
  const body = await summaryOf([message('m1', 0, [1_000_000, 0, 0, 0], { time: OFF_PEAK, model: 'mystery-model' })])
  assert.equal(body.totals.cost, 0.15)
  assert.equal(body.byModel[0].estimated, true)
})

test('a learnt model is priced the same way after a restart', async () => {
  const events = [message('m1', 0, [1_000_000, 0, 0, 0], { time: OFF_PEAK, model: 'deepseek-v9-pro' })]
  const first = await boot({ sessions: [session('s1', events)] })
  await first.call('/api/usage.summary', { preset: 'last30' })
  // The derived row lands in DSH_HOME a moment after the scan.
  await new Promise((resolve) => setTimeout(resolve, 700))
  const stored = JSON.parse(readFileSync(join(first.home, 'storages', 'usage-dashboard', 'models.json'), 'utf8'))
  assert.ok(Object.hasOwn(stored.models, 'deepseek-v9-pro'), 'the derived row is persisted')

  // A second process re-reads it instead of guessing from the family name.
  events[0].data.message.source.model = 'deepseek-v9-pro'
  const second = await boot({ sessions: [session('s1', events)], home: first.home })
  const { body } = await second.call('/api/usage.summary', { preset: 'last30' })
  assert.equal(body.totals.cost, 0.66)
  assert.equal(body.byModel[0].estimated, true)
})

test('the turn and session totals agree with the sum of their parts', async () => {
  const events = [
    message('m1', 0, [1_000, 500_000, 0, 2_000], { time: OFF_PEAK }),
    message('m2', 0, [500, 300_000, 0, 1_000], { time: OFF_PEAK }),
    message('m3', 1, [100, 100_000, 0, 500], { time: OFF_PEAK }),
  ]
  const { call } = await boot({ sessions: [session('s1', events)] })
  const { body } = await call('/api/usage.session', { sessionId: 's1' })

  const turns = Object.values(body.byTurn)
  assert.equal(turns.length, 2)
  assert.equal(turns[0].requests, 2, 'the tool-call round is one turn with two requests')
  const turnSum = turns.reduce((sum, turn) => sum + turn.cost, 0)
  assert.ok(Math.abs(turnSum - body.cost) < 1e-12, 'turns add up to the Session')
  for (const turn of turns) {
    const kinds = turn.costByKind
    const kindSum = kinds.input + kinds.cacheRead + kinds.cacheWrite + kinds.output
    assert.ok(Math.abs(kindSum - turn.cost) < 1e-12, 'token kinds add up to the turn')
  }
  for (const entry of Object.values(body.byMessage)) {
    const kinds = entry.costByKind
    const kindSum = kinds.input + kinds.cacheRead + kinds.cacheWrite + kinds.output
    assert.ok(Math.abs(kindSum - entry.cost) < 1e-12, 'token kinds add up to the message')
  }
})
