// Browser half: the page renders in both states and the chart keeps its geometry.
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { mountClient } from './client-harness.mjs'

const DAY = 86_400_000
const isoDay = (time) => {
  const date = new Date(time)
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
}

/** A summary shaped like the Host answers, with one day of two models. */
function summary() {
  const day = isoDay(Date.now())
  return {
    generatedAt: Date.now(),
    windowDays: 7,
    range: 'last7',
    since: Date.now() - 7 * DAY,
    until: Date.now(),
    partial: false,
    currency: 'USD',
    totals: { requests: 10, inputTokens: 1000, cacheReadTokens: 900_000, cacheWriteTokens: 0, outputTokens: 2_000, totalTokens: 903_000, cost: 1.11 },
    byDay: Array.from({ length: 7 }, (_, index) => ({
      date: isoDay(Date.now() - (6 - index) * DAY),
      requests: index === 6 ? 10 : 0,
      totalTokens: index === 6 ? 903_000 : 0,
      cost: index === 6 ? 1.11 : 0,
      inputTokens: 0,
      cacheReadTokens: 0,
      outputTokens: 0,
      models: index === 6 ? [{ model: 'deepseek-flash', cost: 0.97 }, { model: 'deepseek-v4-pro', cost: 0.14 }] : [],
    })),
    byModel: [
      { model: 'deepseek-flash', provider: 'deepseek-official', requests: 8, inputTokens: 500, cacheReadTokens: 600_000, cacheWriteTokens: 0, outputTokens: 1_000, cost: 0.97, priced: true, estimated: false },
      { model: 'deepseek-v4-pro', provider: 'deepseek-official', requests: 2, inputTokens: 500, cacheReadTokens: 300_000, cacheWriteTokens: 0, outputTokens: 1_000, cost: 0.14, priced: true, estimated: true },
    ],
    sessions: [],
    sessionCount: 1,
    spend: null,
    account: { source: 'api-key', wallets: [{ currency: 'USD', balance: '18.00' }], bonusWallets: [], topUpUrl: 'https://platform.deepseek.com/top_up', usageUrl: null },
  }
}

test('the page renders the same hook count while loading and once loaded', () => {
  // Hooks before the early returns: a mismatch is what blanked the page once.
  const loading = mountClient({ data: null }).render('main')
  assert.ok(loading.text.includes('[ud_head]'))

  const ready = mountClient({ data: summary() }).render('main')
  assert.ok(ready.text.includes('[ud_cards]'))
  assert.ok(ready.text.includes('[ud_chart]'))
})

test('the cost and balance cards share one shape: symbol on the amount, code as the unit', () => {
  const { nodes } = mountClient({ data: summary() }).render('main')
  const values = nodes.filter((node) => node.props.className === 'ud_value').map((node) => node.children.join(''))
  const units = nodes.filter((node) => node.props.className === 'ud_unit').map((node) => node.children.join(''))
  assert.ok(values.some((value) => value.startsWith('$')), 'amounts carry their symbol')
  assert.ok(units.includes('USD'), 'the currency code sits in the small unit slot')
  for (const value of values) assert.ok(!value.includes('USD'), 'no code inside the big amount')
})

test('the chart stacks one segment per model, clipped to the bar outline', () => {
  const { nodes } = mountClient({ data: summary() }).render('main')
  const clipped = nodes.filter((node) => node.type === 'rect' && node.props.clipPath !== undefined)
  assert.equal(clipped.length, 2, 'two visible models, two segments')

  const clips = nodes.filter((node) => node.type === 'clipPath')
  assert.equal(clips.length, 1, 'one rounded outline per bar')

  const outline = clips[0].children[0]
  const total = clipped.reduce((sum, node) => sum + node.props.height, 0)
  assert.ok(Math.abs(total - outline.props.height) < 0.001, 'segments fill the outline exactly')
})

test('the legend filters: every entry is a pressed button', () => {
  const { nodes } = mountClient({ data: summary() }).render('main')
  const entries = nodes.filter((node) => node.props.className === 'ud_legendItem')
  assert.equal(entries.length, 2)
  for (const entry of entries) assert.equal(entry.props['aria-pressed'], true)
})

test('an estimated price is flagged in the model table', () => {
  const { text } = mountClient({ data: summary() }).render('main')
  assert.ok(text.includes('est.'), 'the est. tag is rendered for the derived row')
})

test('the Session chip renders and opens its breakdown', () => {
  const usage = {
    at: Date.now(),
    currency: 'USD',
    requests: 3,
    cost: 0.0049,
    byTurn: {},
    byMessage: {},
    byModel: [{ model: 'deepseek-flash', requests: 3, cost: 0.0049, priced: true }],
    inputTokens: 300,
    cacheReadTokens: 900_000,
    cacheWriteTokens: 0,
    outputTokens: 600,
    costByKind: { input: 0.000045, cacheRead: 0.0027, cacheWrite: 0, output: 0.00036 },
  }
  const { nodes, text } = mountClient({ data: null, nullStates: [usage, { left: 40, top: 600 }] }).render('conversation.composer.dock', { sessionId: 's1' })
  assert.ok(text.includes('[ud_footCost]'))
  assert.ok(text.includes('[ud_pop]'), 'the panel opens')
  const rows = nodes.filter((node) => node.props.className === 'ud_popRow')
  assert.equal(rows.length, 4, 'uncached, cached, output and the per-model row')
})

test('an unknown message renders no chip at all', () => {
  const { text } = mountClient({ data: null }).render('conversation.chat.assistant-actions', { sessionId: 's1', messageId: 'missing' })
  assert.equal(text, '')
})
