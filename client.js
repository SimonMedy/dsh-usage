window.__ModuleLoader__.load({
  id: 'dsh-usage',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useCallback, useMemo, useRef } = React

    /* ---------------------------------------------------------------- copy -- */

    const NS = 'usageDashboard'

    const en = {
      panelTitle: 'Usage',
      title: 'Usage',
      subtitle: 'Local token usage and estimated cost, folded from every Session log on this machine.',
      rangeToday: 'Today',
      rangeYesterday: 'Yesterday',
      range7: 'Last 7 days',
      range30: 'Last 30 days',
      rangeThisMonth: 'This month',
      rangeLastMonth: 'Last month',
      rangeCustom: 'Custom',
      rangeFrom: 'From',
      rangeTo: 'To',
      rangeTitle: 'Period',
      refresh: 'Refresh',
      language: 'Language',
      cost: 'Estimated cost',
      costNote: 'Published DeepSeek prices, peak and off-peak',
      spendNote: 'Billed from balance:',
      tokens: 'Tokens',
      cached: 'cached',
      requests: 'API requests',
      requestsNote: 'One per model call',
      balance: 'Account balance',
      balanceNote: 'DeepSeek account',
      balanceNoteApiKey: 'DeepSeek API key',
      sessions: 'Sessions',
      sessionsNote: 'With model calls in this window',
      topUp: 'Top up',
      perDay: 'Cost per day',
      perModel: 'By model',
      recent: 'Recent Sessions',
      colModel: 'Model',
      colSession: 'Session',
      colTokens: 'Tokens',
      colPerRequest: 'Per request',
      colTotal: 'Total',
      colCost: 'Cost',
      others: 'Others',
      noData: 'No model call recorded in this window yet.',
      loading: 'Loading usage…',
      failed: 'Could not read usage.',
      retry: 'Retry',
      partial: 'Still folding older Session logs — figures may grow.',
      subagent: 'subagent',
      turnCost: 'Estimated cost of this turn',
      costChipTitle: 'Estimated cost of this Session',
      messageCost: 'Estimated cost of this message',
      costDetails: 'Cost breakdown',
      providerModel: 'Provider / model',
      rowInput: 'Uncached input',
      rowCacheRead: 'Cached input',
      rowCacheWrite: 'Cache write',
      rowOutput: 'Output',
      defaultPrice: 'default price',
    }

    const fr = {
      panelTitle: 'Usage',
      title: 'Usage',
      subtitle: 'Consommation de tokens et coût estimé, calculés depuis les journaux de Session de cette machine.',
      rangeToday: "Aujourd'hui",
      rangeYesterday: 'Hier',
      range7: '7 derniers jours',
      range30: '30 derniers jours',
      rangeThisMonth: 'Ce mois-ci',
      rangeLastMonth: 'Le mois dernier',
      rangeCustom: 'Personnalisé',
      rangeFrom: 'Du',
      rangeTo: 'Au',
      rangeTitle: 'Période',
      refresh: 'Actualiser',
      language: 'Langue',
      cost: 'Coût estimé',
      costNote: 'Prix publics DeepSeek, heures pleines et creuses',
      spendNote: 'Débité du solde :',
      tokens: 'Tokens',
      cached: 'en cache',
      requests: 'Requêtes API',
      requestsNote: 'Une par appel au modèle',
      balance: 'Solde du compte',
      balanceNote: 'Compte DeepSeek',
      balanceNoteApiKey: 'Clé API DeepSeek',
      sessions: 'Sessions',
      sessionsNote: 'Avec des appels dans cette fenêtre',
      topUp: 'Recharger',
      perDay: 'Coût par jour',
      perModel: 'Par modèle',
      recent: 'Sessions récentes',
      colModel: 'Modèle',
      colSession: 'Session',
      colTokens: 'Tokens',
      colPerRequest: 'Par requête',
      colTotal: 'Total',
      colCost: 'Coût',
      others: 'Autres',
      noData: 'Aucun appel au modèle enregistré dans cette fenêtre.',
      loading: 'Lecture de la consommation…',
      failed: 'Impossible de lire la consommation.',
      retry: 'Réessayer',
      partial: 'Lecture des anciens journaux en cours — les chiffres peuvent augmenter.',
      subagent: 'subagent',
      turnCost: 'Coût estimé de ce tour',
      costChipTitle: 'Coût estimé de cette conversation',
      messageCost: 'Coût estimé de ce message',
      costDetails: 'Détail du coût',
      providerModel: 'Fournisseur / modèle',
      rowInput: 'Entrée non cachée',
      rowCacheRead: 'Entrée en cache',
      rowCacheWrite: 'Écriture en cache',
      rowOutput: 'Sortie',
      defaultPrice: 'prix par défaut',
    }

    const zh = {
      panelTitle: '用量',
      title: '用量',
      subtitle: '根据本机所有 Session 日志汇总的本地 token 用量与预估费用。',
      rangeToday: '今天',
      rangeYesterday: '昨天',
      range7: '近 7 天',
      range30: '近 30 天',
      rangeThisMonth: '本月',
      rangeLastMonth: '上个月',
      rangeCustom: '自定义',
      rangeFrom: '从',
      rangeTo: '到',
      rangeTitle: '时间范围',
      refresh: '刷新',
      language: '语言',
      cost: '预估费用',
      costNote: 'DeepSeek 公开价格，含高峰与非高峰',
      spendNote: '余额已扣：',
      tokens: 'Tokens',
      cached: '已缓存',
      requests: 'API 请求',
      requestsNote: '每次模型调用计一次',
      balance: '账户余额',
      balanceNote: 'DeepSeek 账户',
      balanceNoteApiKey: 'DeepSeek API 密钥',
      sessions: '会话',
      sessionsNote: '本窗口内有模型调用的会话',
      topUp: '充值',
      perDay: '每日费用',
      perModel: '按模型',
      recent: '最近的会话',
      colModel: '模型',
      colSession: '会话',
      colTokens: 'Tokens',
      colPerRequest: '每次请求',
      colTotal: '总计',
      colCost: '费用',
      others: '其他',
      noData: '本窗口内还没有模型调用记录。',
      loading: '正在读取用量…',
      failed: '无法读取用量。',
      retry: '重试',
      partial: '仍在读取更早的会话日志——数字可能继续增加。',
      subagent: '子代理',
      turnCost: '本轮预估费用',
      costChipTitle: '本会话预估费用',
      messageCost: '本条消息预估费用',
      costDetails: '费用明细',
      providerModel: '提供方 / 模型',
      rowInput: '未缓存输入',
      rowCacheRead: '缓存输入',
      rowCacheWrite: '缓存写入',
      rowOutput: '输出',
      defaultPrice: '默认价格',
    }

    const DICTS = { en, fr, zh }
    const LANG_KEY = 'dsh-usage.lang'

    /** Categorical palette for the stacked cost chart, stable per model rank. */
    const PALETTE = ['#7c5cff', '#f5a623', '#3ddc84', '#4aa8ff', '#ff6b9d', '#9aa4b2']

    /** The stored plugin language; English until the user picks another one. */
    function readStoredLang() {
      try {
        const stored = localStorage.getItem(LANG_KEY)
        if (stored === 'en' || stored === 'fr' || stored === 'zh') return stored
      } catch {}
      return 'en'
    }

    /** One language choice shared by the page, the sidebar label, and the cost chips. */
    const langStore = {
      value: readStoredLang(),
      listeners: new Set(),
      set(next) {
        this.value = next
        try {
          localStorage.setItem(LANG_KEY, next)
        } catch {}
        for (const listener of this.listeners) listener()
      },
    }

    /** Re-render one component when the plugin language changes. */
    function useLang() {
      const [value, setValue] = useState(langStore.value)
      useEffect(() => {
        const listener = () => setValue(langStore.value)
        langStore.listeners.add(listener)
        return () => {
          langStore.listeners.delete(listener)
        }
      }, [])
      return value
    }

    /** One dictionary lookup; English is the last resort for a missing key. */
    function translate(lang, key) {
      const dict = DICTS[lang] ?? en
      return dict[key] ?? en[key] ?? key
    }

    /* --------------------------------------------------------------- ranges -- */

    const RANGE_KEY = 'dsh-usage.range'
    const PRESETS = ['today', 'yesterday', 'last7', 'last30', 'thisMonth', 'lastMonth', 'custom']
    const RANGE_LABEL = {
      today: 'rangeToday',
      yesterday: 'rangeYesterday',
      last7: 'range7',
      last30: 'range30',
      thisMonth: 'rangeThisMonth',
      lastMonth: 'rangeLastMonth',
      custom: 'rangeCustom',
    }

    /** `YYYY-MM-DD` for one local timestamp. */
    function isoDay(time) {
      const date = new Date(time)
      const month = `${date.getMonth() + 1}`.padStart(2, '0')
      const day = `${date.getDate()}`.padStart(2, '0')
      return `${date.getFullYear()}-${month}-${day}`
    }

    /** Default window: the last 30 days ending today. */
    function defaultRange() {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const from = new Date(today)
      from.setDate(from.getDate() - 29)
      return { preset: 'last30', from: isoDay(from.getTime()), to: isoDay(today.getTime()) }
    }

    /** Restore the last chosen range so a reload keeps the same window. */
    function readStoredRange() {
      try {
        const raw = localStorage.getItem(RANGE_KEY)
        if (typeof raw === 'string' && raw.length > 0) {
          const parsed = JSON.parse(raw)
          if (parsed !== null && typeof parsed === 'object' && PRESETS.includes(parsed.preset)) {
            const fallback = defaultRange()
            return {
              preset: parsed.preset,
              from: typeof parsed.from === 'string' ? parsed.from : fallback.from,
              to: typeof parsed.to === 'string' ? parsed.to : fallback.to,
            }
          }
        }
      } catch {}
      return defaultRange()
    }

    /** The query string the Host resolves into an inclusive window. */
    function rangeQuery(range) {
      const params = new URLSearchParams({ range: range.preset })
      if (range.preset === 'custom') {
        params.set('from', range.from)
        params.set('to', range.to)
      }
      return params.toString()
    }

    /* ------------------------------------------------------------- helpers -- */

    /** Document-relative API address, so a mounted or tokenized prefix keeps working. */
    function apiUrl(path) {
      return new URL(path, document.baseURI).toString()
    }

    const formatterCache = new Map()

    /** Number and currency formatters bound to one locale (`undefined` = browser). */
    function formatters(locale) {
      const cacheKey = locale ?? '\u0000default'
      const cached = formatterCache.get(cacheKey)
      if (cached !== undefined) return cached
      const compactFormat = new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 })
      const plainFormat = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 })
      const built = {
        locale,
        compact: (value) => compactFormat.format(value),
        plain: (value) => plainFormat.format(value),
        money: (value, currency) => {
          const digits = value > 0 && value < 0.01 ? 6 : value < 1 ? 4 : 2
          const code = currency ?? 'USD'
          let symbol = code
          try {
            const part = new Intl.NumberFormat(locale, { style: 'currency', currency: code, currencyDisplay: 'narrowSymbol' })
              .formatToParts(0)
              .find((entry) => entry.type === 'currency')
            if (part !== undefined && part.value.length > 0) symbol = part.value
          } catch {}
          let number
          try {
            number = new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value)
          } catch {
            number = value.toFixed(digits)
          }
          return `${symbol}${number} ${code}`
        },
        /** Axis ticks: the amount alone, no currency code, so labels stay short. */
        axis: (value, currency) => {
          const code = currency ?? 'USD'
          try {
            return new Intl.NumberFormat(locale, {
              style: 'currency',
              currency: code,
              currencyDisplay: 'narrowSymbol',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value)
          } catch {
            return `$${Number(value).toFixed(2)}`
          }
        },
      }
      formatterCache.set(cacheKey, built)
      return built
    }

    /** `YYYY-MM-DD` from the API rendered as a short local date. */
    function shortDate(iso, locale) {
      const text = String(iso)
      const parts = text.split('-')
      if (parts.length !== 3) return text
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      try {
        return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' }).format(date)
      } catch {
        return text
      }
    }

    /** Epoch milliseconds rendered as a short local day and time. */
    function timeOf(ms, locale) {
      try {
        return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(ms))
      } catch {
        return new Date(ms).toISOString()
      }
    }

    function baseName(path) {
      if (typeof path !== 'string' || path.length === 0) return ''
      const parts = path.split(/[\\/]/u).filter(Boolean)
      return parts.length > 0 ? parts[parts.length - 1] : path
    }

    /** `YYYY-MM-DD` to a local Date at midnight. */
    function parseIsoDay(text) {
      const parts = String(text).split('-')
      if (parts.length !== 3) return new Date()
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
    }

    /** Month cursor (`{year, month}`) for one `YYYY-MM-DD` value. */
    function monthOf(text) {
      const date = parseIsoDay(text)
      return { year: date.getFullYear(), month: date.getMonth() }
    }

    /** Move the month cursor by `delta` months. */
    function shiftMonth(cursor, delta) {
      const date = new Date(cursor.year, cursor.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    }

    /** Monday-first 6×7 day grid for one month cursor. */
    function monthGrid(cursor) {
      const first = new Date(cursor.year, cursor.month, 1)
      const offset = (first.getDay() + 6) % 7
      const start = new Date(cursor.year, cursor.month, 1 - offset)
      const days = []
      for (let index = 0; index < 42; index += 1) {
        const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index)
        days.push({ key: isoDay(date.getTime()), day: date.getDate(), outside: date.getMonth() !== cursor.month })
      }
      return days
    }

    /** Monday-first weekday initials in the active locale. */
    function weekdayLabels(locale) {
      const labels = []
      for (let index = 0; index < 7; index += 1) {
        const date = new Date(2024, 0, 1 + index)
        try {
          const short = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
          labels.push(short.slice(0, 2))
        } catch {
          labels.push(String(date.getDate()))
        }
      }
      return labels
    }

    /** Long month and year for the calendar heading. */
    function monthTitle(cursor, locale) {
      try {
        return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(new Date(cursor.year, cursor.month, 1))
      } catch {
        return `${cursor.year}-${`${cursor.month + 1}`.padStart(2, '0')}`
      }
    }

    /** `YYYY-MM-DD` rendered as a short readable date. */
    function fieldDate(text, locale) {
      try {
        return new Intl.DateTimeFormat(locale, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parseIsoDay(text))
      } catch {
        return String(text)
      }
    }


    const CSS = `
.ud_page{height:100%;overflow:auto;padding:30px 36px 56px;color:var(--dsw-alias-label-primary);box-sizing:border-box}
.ud_inner{max-width:1140px;margin:0 auto;display:flex;flex-direction:column;gap:18px}
.ud_head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.ud_title{margin:0;font-size:26px;line-height:32px;font-weight:600;letter-spacing:-.01em}
.ud_sub{margin:6px 0 0;font-size:13px;line-height:20px;color:var(--dsw-alias-label-secondary);max-width:62ch}
.ud_actions{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex:0 0 auto;flex-wrap:wrap}
.ud_seg{display:inline-flex;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:2px;gap:2px}
.ud_segBtn{appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;padding:5px 10px;border-radius:8px;cursor:pointer}
.ud_segBtn[data-active="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.18)}
.ud_btn{appearance:none;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:6px 12px;border-radius:9px;cursor:pointer}
.ud_btn:hover{border-color:var(--dsw-alias-border-l2)}
.ud_btn:disabled{opacity:.55;cursor:default}
.ud_btnTiny{font-size:11px;line-height:16px;padding:3px 9px;border-radius:7px;text-decoration:none;display:inline-flex;align-items:center;gap:5px}
.ud_balFoot{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:2px}
.ud_balSource{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary)}
.ud_legend{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px}
.ud_legendItem{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--dsw-alias-border-l1);background:0 0;border-radius:8px;padding:2px 9px;margin:0;font:inherit;font-size:11.5px;line-height:18px;color:var(--dsw-alias-label-secondary);cursor:pointer;transition:background .12s ease,border-color .12s ease,opacity .12s ease}
.ud_legendItem:hover{border-color:var(--dsw-alias-border-l2);background:var(--dsw-alias-interactive-bg-hover)}
.ud_legendItem:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.ud_legendItem[aria-pressed="false"]{opacity:.5;border-color:transparent}
.ud_legendItem[aria-pressed="false"]:hover{opacity:.75}
.ud_legendItem[aria-pressed="false"] .ud_legendLabel{text-decoration:line-through}
.ud_legendItem[aria-pressed="false"] .ud_swatch{opacity:.35}
.ud_swatch{width:8px;height:8px;border-radius:2px;flex:none;transition:opacity .12s ease}
.ud_legendLabel{color:var(--dsw-alias-label-primary)}
.ud_legendShare{font-variant-numeric:tabular-nums}
.ud_chartWrap{position:relative}
.ud_tip{position:absolute;z-index:5;transform:translate(-50%,calc(-100% - 10px));pointer-events:none;min-width:196px;max-width:280px;padding:10px 12px;border-radius:var(--dsw-radius-md);background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px}
.ud_tipHead{display:flex;justify-content:space-between;gap:16px;margin-bottom:6px;color:var(--dsw-alias-label-primary);font-weight:500;font-variant-numeric:tabular-nums}
.ud_tipRow{display:grid;grid-template-columns:8px minmax(0,1fr) auto;align-items:center;gap:8px;padding:1px 0}
.ud_tipRow b{color:var(--dsw-alias-label-secondary);font-weight:400;text-align:right;font-variant-numeric:tabular-nums}
.ud_select{appearance:none;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:6px 10px;border-radius:9px;cursor:pointer}
.ud_picker{position:relative;flex:none}
.ud_field{display:inline-flex;align-items:center;gap:7px;max-width:230px;height:32px;box-sizing:border-box;appearance:none;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;line-height:18px;padding:0 10px;border-radius:10px;cursor:pointer}
.ud_field:hover{border-color:var(--dsw-alias-border-l2)}
.ud_field:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}
.ud_fieldText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ud_chevron{flex:none;opacity:.7}
.ud_calendar{flex:none;opacity:.75;margin-left:2px}
.ud_fieldDate{min-width:134px;justify-content:space-between}
.ud_menu{position:absolute;top:calc(100% + 6px);right:0;z-index:40;min-width:190px;max-height:340px;overflow:auto;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:5px;box-shadow:0 12px 34px rgba(0,0,0,.32)}
.ud_menuItem{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;appearance:none;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:18px;padding:7px 10px;border-radius:8px;cursor:pointer;text-align:left}
.ud_menuItem:hover{background:var(--dsw-alias-bg-layer-2)}
.ud_menuItemActive{background:var(--dsw-alias-bg-layer-2)}
.ud_check{flex:none;color:var(--dsw-alias-brand-primary)}
.ud_cal{position:absolute;top:calc(100% + 6px);right:0;z-index:40;width:248px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:12px;padding:10px;box-shadow:0 12px 34px rgba(0,0,0,.32)}
.ud_calHead{display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:8px}
.ud_calTitle{font-size:12.5px;font-weight:600;text-transform:capitalize}
.ud_calNav{appearance:none;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-secondary);width:24px;height:24px;border-radius:7px;cursor:pointer;font-size:14px;line-height:1;padding:0}
.ud_calNav:hover{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-primary)}
.ud_calWeek{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;margin-bottom:2px}
.ud_calWeek span{font-size:10px;text-align:center;color:var(--dsw-alias-label-secondary);padding:2px 0;text-transform:uppercase}
.ud_calGrid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px}
.ud_calDay{appearance:none;border:1px solid transparent;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;height:28px;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.ud_calDay:hover{background:var(--dsw-alias-bg-layer-2)}
.ud_calDayOutside{color:var(--dsw-alias-label-secondary);opacity:.45}
.ud_calDayToday{border-color:var(--dsw-alias-border-l2)}
.ud_calDaySelected{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);box-shadow:inset 0 0 0 1.5px var(--dsw-alias-brand-primary);font-weight:600}
.ud_calDaySelected:hover{background:var(--dsw-alias-bg-layer-2)}
.ud_calDay:disabled{opacity:.25;cursor:default}
.ud_calFoot{display:flex;justify-content:flex-end;margin-top:8px}
.ud_link{appearance:none;border:0;background:transparent;color:var(--dsw-alias-brand-primary);font:inherit;font-size:11.5px;cursor:pointer;padding:2px 4px;border-radius:6px}
.ud_link:hover{text-decoration:underline}
.ud_cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(215px,1fr));gap:12px}
.ud_card{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:16px 18px;display:flex;flex-direction:column;gap:4px;min-width:0}
.ud_label{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary)}
.ud_valueRow{display:flex;align-items:baseline;gap:6px;min-width:0}
.ud_value{font-size:29px;line-height:34px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ud_unit{font-size:12px;color:var(--dsw-alias-label-secondary)}
.ud_note{font-size:12px;line-height:17px;color:var(--dsw-alias-label-secondary);min-height:17px}
.ud_note a{color:var(--dsw-alias-brand-primary);text-decoration:none}
.ud_note a:hover{text-decoration:underline}
.ud_panel{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:14px;padding:16px 18px 14px;min-width:0}
.ud_panelHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin-bottom:10px}
.ud_panelTitle{font-size:13px;line-height:20px;font-weight:600}
.ud_panelMeta{font-size:12px;color:var(--dsw-alias-label-secondary)}
.ud_chart{display:block;width:100%;height:auto}
.ud_bar{fill:var(--dsw-alias-brand-primary)}
.ud_grid{stroke:var(--dsw-alias-border-l1);stroke-width:1}
.ud_guide{stroke:var(--dsw-alias-border-l2);stroke-width:1;stroke-dasharray:3 3}
.ud_axis{fill:var(--dsw-alias-label-secondary);font-size:10px;font-family:inherit}
.ud_axisY{fill:var(--dsw-alias-label-secondary);font-size:10px;font-family:inherit;font-variant-numeric:tabular-nums}
.ud_split{display:grid;grid-template-columns:1fr 1fr;gap:12px}
@media (max-width:980px){.ud_split{grid-template-columns:1fr}}
.ud_rows{display:flex;flex-direction:column}
.ud_row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:baseline;padding:8px 0;border-top:1px solid var(--dsw-alias-border-l1)}
.ud_row:first-child{border-top:0}
.ud_rowHead{padding:0 0 6px;border-top:0;color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:16px}
.ud_rowName{font-size:12.5px;line-height:18px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ud_rowMeta{font-size:11px;line-height:16px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ud_rowValue{font-size:12.5px;font-variant-numeric:tabular-nums;white-space:nowrap}
.ud_rowTag{display:inline-block;font-size:10px;line-height:14px;padding:0 5px;border-radius:5px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);margin-left:6px;vertical-align:1px}
.ud_empty{padding:26px 0;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px}
.ud_banner{font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:10px;padding:8px 12px}
.ud_error{color:var(--dsw-alias-state-error-primary)}
.ud_actionChip{box-sizing:border-box;min-width:0;height:calc(28px + var(--dsh-content-font-delta,0px));border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:calc(var(--dsh-content-font-size-secondary,13px) - 1px);font-variant-numeric:tabular-nums;line-height:calc(24px + var(--dsh-content-font-delta,0px));white-space:nowrap;border:none;background:0 0;align-items:center;gap:4px;padding:6px 8px;display:inline-flex;order:2;align-self:center;cursor:pointer}
.ud_actionChip:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ud_actionChip svg{width:calc(15px + var(--dsh-content-font-delta,0px));height:calc(15px + var(--dsh-content-font-delta,0px));flex:none}
/* The row keeps usage and the clock inside one inline-flex span, which a slot
   entry can only follow. Opening that span puts both back into the row's flex
   line, so the cost can sit between them, right of the usage chip. If a future
   build changes that structure the rules stop matching and the chip simply
   stays after the group. */
[data-clock="end"] > span:last-child{display:contents}
[data-clock="end"] > span:last-child > *:last-child{order:3}
.ud_footCost{box-sizing:border-box;max-width:100%;border-radius:var(--dsw-radius-sm);color:var(--dsw-alias-label-tertiary);font-family:inherit;font-size:12px;line-height:18px;font-variant-numeric:tabular-nums;white-space:nowrap;border:none;background:0 0;align-items:center;gap:6px;padding:1px 8px;display:inline-flex;cursor:pointer}
.ud_footCost:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ud_footCost[aria-expanded="true"]{background:var(--dsw-alias-interactive-bg-hover)}
.ud_footCost svg{width:14px;height:14px;flex:none}
.ud_sideRow{box-sizing:border-box;user-select:none;border-radius:var(--dsw-radius-md);width:100%;flex:none;height:32px;color:var(--dsw-alias-label-primary);font:inherit;font-size:14px;cursor:pointer;background:0 0;border:0;align-items:center;gap:8px;padding:6px 2px 6px 3px;line-height:20px;display:flex;text-align:left;overflow:hidden;margin:0}
.ud_sideRow:hover{background:var(--dsw-alias-interactive-bg-hover)}
.ud_sideRow[aria-current="page"]{background:var(--dsw-alias-bg-layer-2)}
.ud_sideLabel{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ud_sideIcon{box-sizing:border-box;border-radius:var(--dsw-radius-md);border:0;background:0 0;color:var(--dsw-alias-label-primary);cursor:pointer;justify-content:center;align-items:center;gap:0;width:36px;height:36px;flex:none;margin:0;padding:0;display:inline-flex}
.ud_sideIcon:hover{background:var(--dsw-alias-interactive-bg-hover)}
/* Same surface, stroke and elevation as the shipped stat dialog: the panel
   tokens are the ones the Harness uses for its own usage popovers. */
.ud_pop{position:fixed;z-index:1100;box-sizing:border-box;width:max-content;min-width:min(300px,calc(100vw - 24px));max-width:min(440px,calc(100vw - 24px));border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);box-shadow:var(--dsw-elevation-prominent);color:var(--dsw-alias-label-secondary);cursor:default;border:0;padding:16px;font-size:12px;line-height:18px}
.ud_popHead{display:flex;justify-content:space-between;gap:16px;margin-bottom:8px;color:var(--dsw-alias-label-primary);font-weight:500;font-variant-numeric:tabular-nums}
.ud_popTitle{display:inline-flex;align-items:center;gap:6px;min-width:0}
.ud_popTitle svg{width:14px;height:14px;flex:none}
.ud_popRow.ud_popRowWide{grid-template-columns:minmax(76px,auto) minmax(0,1fr)}
.ud_popValue{color:var(--dsw-alias-label-secondary);text-align:right;overflow-wrap:anywhere}
.ud_popRule{border-top:.5px solid var(--dsw-alias-border-l2);margin-bottom:10px}
.ud_popRow{display:grid;grid-template-columns:minmax(76px,auto) minmax(0,1fr) auto;gap:6px 16px;align-items:baseline;padding:1px 0;color:var(--dsw-alias-label-tertiary)}
.ud_popRow b{color:var(--dsw-alias-label-secondary);font-weight:400;font-variant-numeric:tabular-nums;text-align:right}
.ud_popMeta{color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums;text-align:right}
.ud_popSection{margin:12px 0 4px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;text-transform:uppercase;letter-spacing:.04em}
.ud_popNote{margin-top:12px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px}
`

    const tagId = 'dsh-usage/page.css'

    function ensureStyles() {
      if (typeof document === 'undefined') return
      const existing = document.querySelector(`style[data-plugin-css="${tagId}"]`)
      if (existing !== null) {
        // A hot-reloaded module reuses the tag from the previous load; refresh
        // its content so new rules are not silently missing.
        if (existing.textContent !== CSS) existing.textContent = CSS
        return
      }
      const tag = document.createElement('style')
      tag.dataset.plugin = 'dsh-usage'
      tag.dataset.pluginCss = tagId
      tag.textContent = CSS
      document.head.appendChild(tag)
    }

    /* ----------------------------------------------------------------- data -- */

    /** Load the window aggregate; keeps the previous figures visible while refreshing. */
    function useSummary(query) {
      const [state, setState] = useState({ status: 'loading', data: null, error: null })
      const [nonce, setNonce] = useState(0)

      useEffect(() => {
        let cancelled = false
        setState((previous) => ({ ...previous, status: previous.data ? 'refreshing' : 'loading' }))
        fetch(apiUrl(`api/usage.summary?${query}`), { headers: { accept: 'application/json' }, credentials: 'same-origin' })
          .then(async (response) => {
            if (response.ok) return response.json()
            let message = `${response.status} ${response.statusText}`
            try {
              const body = await response.json()
              if (body && typeof body.error === 'string') message = body.error
            } catch {}
            throw new Error(message)
          })
          .then((data) => {
            if (!cancelled) setState({ status: 'ready', data, error: null })
          })
          .catch((error) => {
            if (!cancelled) setState({ status: 'error', data: null, error: String((error && error.message) || error) })
          })
        return () => {
          cancelled = true
        }
      }, [query, nonce])

      const refresh = useCallback(() => setNonce((value) => value + 1), [])
      return { ...state, refresh }
    }

    /**
     * Per-Session costs, fetched once per Session and shared by every chip on
     * screen. Concurrent mounts share one in-flight request instead of each
     * opening their own.
     */
    const turnCache = new Map()
    const turnInflight = new Map()
    const turnListeners = new Map()

    /** Tell every mounted chip of one Session that a fresher fold arrived. */
    function publishTurnCosts(id, value) {
      const listeners = turnListeners.get(id)
      if (listeners === undefined) return
      for (const listener of listeners) listener(value)
    }

    /** One request per Session, deduped across every mounted chip. */
    function loadTurnCosts(id) {
      const pending = turnInflight.get(id)
      if (pending !== undefined) return pending
      const request = fetch(apiUrl(`api/usage.session?sessionId=${encodeURIComponent(id)}`), {
        headers: { accept: 'application/json' },
        credentials: 'same-origin',
      })
        .then((response) => (response.ok ? response.json() : undefined))
        .then((data) => {
          if (data === undefined) return undefined
          const next = {
            at: Date.now(),
            currency: data.currency,
            byTurn: data.byTurn ?? {},
            byMessage: data.byMessage ?? {},
            requests: data.requests,
            cost: data.cost,
            costByKind: data.costByKind ?? null,
            byModel: data.byModel ?? [],
            inputTokens: data.inputTokens ?? 0,
            cacheReadTokens: data.cacheReadTokens ?? 0,
            cacheWriteTokens: data.cacheWriteTokens ?? 0,
            outputTokens: data.outputTokens ?? 0,
          }
          turnCache.set(id, next)
          publishTurnCosts(id, next)
          return next
        })
        .catch(() => undefined)
        .finally(() => {
          turnInflight.delete(id)
        })
      turnInflight.set(id, request)
      return request
    }

    /**
     * Subscribe one chip to a Session's costs.
     * @param sessionId - the Session to read.
     * @param refreshMs - polling interval, or 0 for a one-shot read.
     * @param needsId - a message id this chip must find; a fold published before
     *   that message landed does not contain it, so the read is retried briefly.
     */
    function useTurnCosts(sessionId, refreshMs = 0, needsId = null) {
      const [entry, setEntry] = useState(() => (sessionId ? turnCache.get(String(sessionId)) : undefined) ?? null)
      const [nonce, setNonce] = useState(0)
      useEffect(() => {
        if (refreshMs <= 0) return undefined
        const timer = setInterval(() => setNonce((value) => value + 1), refreshMs)
        return () => clearInterval(timer)
      }, [refreshMs])
      useEffect(() => {
        const id = sessionId ? String(sessionId) : null
        if (id === null) return undefined
        const listeners = turnListeners.get(id) ?? new Set()
        const listener = (value) => setEntry(value)
        listeners.add(listener)
        turnListeners.set(id, listeners)

        let cancelled = false
        let timer = null
        let attempts = 0
        const complete = (value) => needsId === null || value.byMessage[String(needsId)] !== undefined
        const attempt = () => {
          loadTurnCosts(id).then((value) => {
            if (cancelled || value === undefined) return
            setEntry(value)
            if (!complete(value) && attempts < 5) {
              attempts += 1
              timer = setTimeout(attempt, 1500)
            }
          })
        }
        const cached = turnCache.get(id)
        // The freshness window follows the caller's interval, so a chip that
        // polls faster than the default actually sees fresh numbers.
        if (cached !== undefined && complete(cached) && Date.now() - cached.at < (refreshMs > 0 ? refreshMs : 30000)) {
          setEntry(cached)
        } else {
          attempt()
        }

        return () => {
          cancelled = true
          if (timer !== null) clearTimeout(timer)
          listeners.delete(listener)
          if (listeners.size === 0) turnListeners.delete(id)
        }
      }, [sessionId, nonce, refreshMs, needsId])
      return entry
    }

    /* ------------------------------------------------------------ rendering -- */

    function StatCard({ label, value, unit, note, children }) {
      return h(
        'div',
        { className: 'ud_card' },
        h('div', { className: 'ud_label' }, label),
        h('div', { className: 'ud_valueRow' }, h('div', { className: 'ud_value' }, value), unit ? h('div', { className: 'ud_unit' }, unit) : null),
        children ?? (note ? h('div', { className: 'ud_note' }, note) : null),
      )
    }

    /**
     * Stacked cost bars: one segment per model, largest at the bottom, with a
     * legend carrying each model's share of the window. A model list shorter
     * than the day's split means an older Host, so the bar falls back to one
     * brand-coloured segment.
     */
    function DayChart({ days, models, currency, f, t }) {
      const [hover, setHover] = useState(null)
      const width = 760
      const height = 190
      const padTop = 10
      const padBottom = 20
      // Room for the value axis, like the platform's chart.
      const padLeft = 46
      const innerHeight = height - padTop - padBottom
      const counts = days.length > 0 ? days : []
      const max = counts.reduce((peak, day) => Math.max(peak, day.cost), 0)
      const scale = max > 0 ? max : 1
      const plotWidth = width - padLeft - 2
      const step = plotWidth / Math.max(counts.length, 1)
      const barWidth = Math.max(3, Math.min(step * 0.55, step > 120 ? 72 : 22))
      const elements = []

      for (let line = 0; line <= 2; line += 1) {
        const y = padTop + (innerHeight / 2) * line
        elements.push(h('line', { key: `grid-${line}`, className: 'ud_grid', x1: padLeft, x2: width, y1: y, y2: y }))
        elements.push(
          h('text', { key: `tick-${line}`, className: 'ud_axisY', x: padLeft - 8, y: y + 3.5, textAnchor: 'end' }, f.axis((max / 2) * (2 - line), currency)),
        )
      }

      /** The cost one day attributes to one legend entry. */
      const segmentCost = (day, entry) => {
        const parts = day.models
        if (!Array.isArray(parts) || parts.length === 0) return entry.color === null ? day.cost : 0
        if (entry.others === true) {
          const known = new Set(models.filter((model) => model.others !== true).map((model) => model.key))
          return parts.reduce((sum, part) => (known.has(part.model) ? sum : sum + part.cost), 0)
        }
        const found = parts.find((part) => part.model === entry.key)
        return found === undefined ? 0 : found.cost
      }

      /** Visible segments of one day; the whole bar when the Host sent no split. */
      const daySegments = (day) => {
        if (!Array.isArray(day.models) || day.models.length === 0) {
          return day.cost > 0 ? [{ entry: { key: '__all', label: '', color: null }, value: day.cost }] : []
        }
        return models
          .map((entry) => ({ entry, value: segmentCost(day, entry) }))
          .filter((segment) => segment.value > 0)
      }

      const defs = []
      counts.forEach((day, index) => {
        const segments = daySegments(day)
        const total = segments.reduce((sum, segment) => sum + segment.value, 0)
        const x = padLeft + step * index + (step - barWidth) / 2
        if (total > 0) {
          const barHeight = (total / scale) * innerHeight
          const barTop = padTop + innerHeight - barHeight
          // One rounded outline for the whole stack, so a 2px top segment is
          // clipped by the bar's shape instead of becoming a floating pill.
          const clipId = `udclip-${index}`
          const radius = Math.min(3, barWidth / 2)
          defs.push(h('clipPath', { key: clipId, id: clipId }, h('rect', { x, y: barTop, width: barWidth, height: barHeight, rx: radius })))
          let bottom = padTop + innerHeight
          segments.forEach((segment) => {
            const segmentHeight = (segment.value / scale) * innerHeight
            bottom -= segmentHeight
            elements.push(
              h('rect', {
                key: `${day.date}-${segment.entry.key}`,
                x,
                y: bottom,
                width: barWidth,
                height: Math.max(0.5, segmentHeight),
                fill: segment.entry.color === null ? undefined : segment.entry.color,
                className: segment.entry.color === null ? 'ud_bar' : undefined,
                clipPath: `url(#${clipId})`,
              }),
            )
          })
        }
        // One invisible hit area per column, empty days included, so the guide
        // line and the card also answer on days with no spend.
        elements.push(
          h('rect', {
            key: `hit-${day.date}`,
            x: padLeft + step * index,
            y: padTop,
            width: step,
            height: innerHeight,
            fill: 'transparent',
            onMouseEnter: () => setHover(index),
            onMouseLeave: () => setHover(null),
          }),
        )
      })

      const labelStep = Math.max(1, Math.ceil(counts.length / 7))
      counts.forEach((day, index) => {
        if (index % labelStep !== 0 && index !== counts.length - 1) return
        const x = padLeft + step * index + step / 2
        elements.push(
          h('text', { key: `label-${day.date}`, className: 'ud_axis', x, y: height - 4, textAnchor: 'middle' }, shortDate(day.date, f.locale)),
        )
      })

      const hoveredIndex = hover === null ? null : hover
      const hoveredDay = hoveredIndex === null ? null : counts[hoveredIndex]
      const hoveredSegments = hoveredDay === undefined || hoveredDay === null ? [] : daySegments(hoveredDay)
      const hoveredCost = hoveredSegments.reduce((sum, segment) => sum + segment.value, 0)
      const guideX = hoveredIndex === null ? 0 : padLeft + step * hoveredIndex + step / 2
      const guideTop = padTop + innerHeight - Math.min(1, hoveredCost / scale) * innerHeight

      return h(
        'div',
        { className: 'ud_chartWrap' },
        h('svg', { className: 'ud_chart', viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': t('perDay') }, [
          h('defs', { key: 'defs' }, defs),
          ...elements,
          hoveredDay === undefined || hoveredDay === null
            ? null
            : h('line', { key: 'guide', className: 'ud_guide', x1: guideX, x2: guideX, y1: padTop, y2: padTop + innerHeight }),
        ]),
        hoveredDay === null || hoveredDay === undefined
          ? null
          : h(
              'div',
              {
                className: 'ud_tip',
                style: {
                  left: `clamp(112px, ${((guideX / width) * 100).toFixed(2)}%, calc(100% - 112px))`,
                  top: `max(96px, ${(((guideTop + 2) / height) * 100).toFixed(2)}%)`,
                },
                role: 'status',
              },
              h(
                'div',
                { className: 'ud_tipHead' },
                h('span', {}, shortDate(hoveredDay.date, f.locale)),
                h('span', {}, hoveredCost === 0 ? f.axis(0, currency) : f.money(hoveredCost, currency)),
              ),
              hoveredSegments.map((segment) =>
                h(
                  'div',
                  { className: 'ud_tipRow', key: segment.entry.key },
                  h('span', { className: 'ud_swatch', style: { background: segment.entry.color ?? 'var(--dsw-alias-brand-primary)' } }),
                  h('span', { className: 'ud_legendLabel' }, segment.entry.label),
                  h('b', {}, f.money(segment.value, currency)),
                ),
              ),
            ),
      )
    }

    /**
     * Colour key and share, mirroring the platform's stacked charts. Each entry
     * is a toggle: pressing it hides that model from the chart.
     */
    function ChartLegend({ models, hidden, onToggle, total, f, t }) {
      if (models.length === 0) return null
      const base = total > 0 ? total : 1
      return h(
        'div',
        { className: 'ud_legend' },
        models.map((model) =>
          h(
            'button',
            {
              type: 'button',
              className: 'ud_legendItem',
              key: model.key,
              'aria-pressed': hidden[model.key] !== true,
              title: model.label,
              onClick: () => onToggle(model.key),
            },
            h('span', { className: 'ud_swatch', style: { background: model.color } }),
            h('span', { className: 'ud_legendLabel' }, model.label),
            h('span', { className: 'ud_legendShare' }, `${((model.cost / base) * 100).toFixed(1)} %`),
          ),
        ),
      )
    }

    function ModelRows({ models, currency, f, t }) {
      if (models.length === 0) return h('div', { className: 'ud_empty' }, t('noData'))
      return h(
        'div',
        { className: 'ud_rows' },
        h(
          'div',
          { className: 'ud_row ud_rowHead' },
          h('div', {}, t('colModel')),
          h('div', { className: 'ud_rowValue' }, t('colTokens')),
          h('div', { className: 'ud_rowValue' }, t('colCost')),
        ),
        models.map((model) =>
          h(
            'div',
            { key: model.model, className: 'ud_row' },
            h(
              'div',
              { style: { minWidth: 0 } },
              h('div', { className: 'ud_rowName' }, model.model, model.priced === false ? h('span', { className: 'ud_rowTag', title: t('defaultPrice') }, t('defaultPrice')) : null),
              h('div', { className: 'ud_rowMeta' }, `${f.plain(model.requests)} req. · ${f.compact(model.inputTokens + model.cacheReadTokens)} in · ${f.compact(model.outputTokens)} out`),
            ),
            h('div', { className: 'ud_rowValue', style: { color: 'var(--dsw-alias-label-secondary)' } }, f.compact(model.inputTokens + model.cacheReadTokens + model.outputTokens)),
            h('div', { className: 'ud_rowValue' }, f.money(model.cost, currency)),
          ),
        ),
      )
    }

    function SessionRows({ sessions, currency, f, t }) {
      if (sessions.length === 0) return h('div', { className: 'ud_empty' }, t('noData'))
      return h(
        'div',
        { className: 'ud_rows' },
        h(
          'div',
          { className: 'ud_row ud_rowHead' },
          h('div', {}, t('colSession')),
          h('div', { className: 'ud_rowValue' }, t('colPerRequest')),
          h('div', { className: 'ud_rowValue' }, t('colTotal')),
        ),
        sessions.map((session) =>
          h(
            'div',
            { key: session.id, className: 'ud_row' },
            h(
              'div',
              { style: { minWidth: 0 } },
              h(
                'div',
                { className: 'ud_rowName', title: session.id },
                session.title ?? (baseName(session.cwd) || session.id),
                session.subagent ? h('span', { className: 'ud_rowTag' }, t('subagent')) : null,
              ),
              h('div', { className: 'ud_rowMeta' }, `${timeOf(session.lastTime, f.locale)} · ${f.plain(session.requests)} req. · ${f.compact(session.totalTokens)} tokens`),
            ),
            h('div', { className: 'ud_rowValue', style: { color: 'var(--dsw-alias-label-secondary)' } }, f.money(session.cost / Math.max(session.requests, 1), currency)),
            h('div', { className: 'ud_rowValue' }, f.money(session.cost, currency)),
          ),
        ),
      )
    }

    /** Rounded dropdown used for the language and the period pickers. */
    function Picker({ label, value, options, onChange }) {
      const [open, setOpen] = useState(false)
      const host = useRef(null)

      useEffect(() => {
        if (!open) return undefined
        const onDown = (event) => {
          if (host.current !== null && !host.current.contains(event.target)) setOpen(false)
        }
        const onKey = (event) => {
          if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('mousedown', onDown)
          document.removeEventListener('keydown', onKey)
        }
      }, [open])

      const current = options.find((option) => option.value === value)
      return h(
        'div',
        { className: 'ud_picker', ref: host },
        h(
          'button',
          {
            type: 'button',
            className: 'ud_field',
            'aria-haspopup': 'listbox',
            'aria-expanded': open,
            'aria-label': label,
            title: label,
            onClick: () => setOpen((value) => !value),
          },
          h('span', { className: 'ud_fieldText' }, current === undefined ? value : current.label),
          h(
            'svg',
            { className: 'ud_chevron', width: 10, height: 10, viewBox: '0 0 10 10', fill: 'none', 'aria-hidden': true },
            h('path', { d: 'M1.5 3.5 5 7l3.5-3.5', stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round' }),
          ),
        ),
        open
          ? h(
              'div',
              { className: 'ud_menu', role: 'listbox' },
              options.map((option) =>
                h(
                  'button',
                  {
                    key: option.value,
                    type: 'button',
                    role: 'option',
                    'aria-selected': option.value === value,
                    className: option.value === value ? 'ud_menuItem ud_menuItemActive' : 'ud_menuItem',
                    onClick: () => {
                      setOpen(false)
                      if (option.value !== value) onChange(option.value)
                    },
                  },
                  h('span', {}, option.label),
                  option.value === value
                    ? h(
                        'svg',
                        { className: 'ud_check', width: 12, height: 12, viewBox: '0 0 12 12', fill: 'none', 'aria-hidden': true },
                        h('path', { d: 'M2 6.4 4.6 9 10 3.4', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' }),
                      )
                    : null,
                ),
              ),
            )
          : null,
      )
    }

    /** One date field with a rounded calendar popover. */
    function DateField({ label, value, min, max, locale, onChange }) {
      const [open, setOpen] = useState(false)
      const [cursor, setCursor] = useState(() => monthOf(value))
      const host = useRef(null)

      useEffect(() => {
        if (!open) return undefined
        setCursor(monthOf(value))
        const onDown = (event) => {
          if (host.current !== null && !host.current.contains(event.target)) setOpen(false)
        }
        const onKey = (event) => {
          if (event.key === 'Escape') setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
          document.removeEventListener('mousedown', onDown)
          document.removeEventListener('keydown', onKey)
        }
      }, [open, value])

      const today = isoDay(Date.now())
      const labels = weekdayLabels(locale)
      const days = monthGrid(cursor)
      const pick = (key) => {
        setOpen(false)
        if (key !== value) onChange(key)
      }

      return h(
        'div',
        { className: 'ud_picker', ref: host },
        h(
          'button',
          {
            type: 'button',
            className: 'ud_field ud_fieldDate',
            'aria-haspopup': 'dialog',
            'aria-expanded': open,
            'aria-label': `${label} ${fieldDate(value, locale)}`,
            title: label,
            onClick: () => setOpen((current) => !current),
          },
          h('span', { className: 'ud_fieldText' }, fieldDate(value, locale)),
          h(
            'svg',
            { className: 'ud_calendar', width: 13, height: 13, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
            h('rect', { x: 2.2, y: 3.4, width: 11.6, height: 10.2, rx: 2, stroke: 'currentColor', strokeWidth: 1.2 }),
            h('path', { d: 'M2.2 6.6h11.6M5.4 2.2v2.4M10.6 2.2v2.4', stroke: 'currentColor', strokeWidth: 1.2, strokeLinecap: 'round' }),
          ),
        ),
        open
          ? h(
              'div',
              { className: 'ud_cal' },
              h(
                'div',
                { className: 'ud_calHead' },
                h('button', { type: 'button', className: 'ud_calNav', 'aria-label': '‹', onClick: () => setCursor(shiftMonth(cursor, -1)) }, '‹'),
                h('div', { className: 'ud_calTitle' }, monthTitle(cursor, locale)),
                h('button', { type: 'button', className: 'ud_calNav', 'aria-label': '›', onClick: () => setCursor(shiftMonth(cursor, 1)) }, '›'),
              ),
              h('div', { className: 'ud_calWeek' }, labels.map((name, index) => h('span', { key: `${name}-${index}` }, name))),
              h(
                'div',
                { className: 'ud_calGrid' },
                days.map((cell) => {
                  const disabled = (min !== undefined && cell.key < min) || (max !== undefined && cell.key > max)
                  const className = [
                    'ud_calDay',
                    cell.outside ? 'ud_calDayOutside' : '',
                    cell.key === value ? 'ud_calDaySelected' : '',
                    cell.key === today ? 'ud_calDayToday' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')
                  return h(
                    'button',
                    { key: cell.key, type: 'button', className, disabled, onClick: () => pick(cell.key) },
                    cell.day,
                  )
                }),
              ),
              h(
                'div',
                { className: 'ud_calFoot' },
                h('button', { type: 'button', className: 'ud_link', onClick: () => pick(today) }, fieldDate(today, locale)),
              ),
            )
          : null,
      )
    }

    function UsagePage(props) {
      const lang = useLang()
      const t = useCallback((key) => translate(lang, key), [lang])
      const f = useMemo(() => formatters(lang), [lang])
      const [range, setRange] = useState(readStoredRange)
      const query = rangeQuery(range)
      const { status, data, error, refresh } = useSummary(query)
      const updateRange = useCallback((next) => {
        setRange(next)
        try {
          localStorage.setItem(RANGE_KEY, JSON.stringify(next))
        } catch {}
      }, [])

      useEffect(() => {
        ensureStyles()
        const timer = setInterval(refresh, 60000)
        return () => clearInterval(timer)
      }, [refresh])

      const currency = (data && data.currency) || 'USD'
      const totals = data ? data.totals : null
      const balanceWallet = useMemo(() => {
        if (!data || !data.account || !Array.isArray(data.account.wallets)) return null
        return data.account.wallets.find((wallet) => wallet.currency === 'USD') ?? data.account.wallets[0] ?? null
      }, [data])

      const cacheRate = totals && totals.totalTokens > 0 ? (totals.cacheReadTokens / (totals.cacheReadTokens + totals.inputTokens)) * 100 : 0
      // Chart entries: models by descending cost, the tail folded into one
      // "others" slice so the palette never runs out of colours. Computed
      // before the early returns, because a hook may not follow them.
      const chartModels = useMemo(() => {
        const ranked = data === null ? [] : (data.byModel ?? []).filter((entry) => entry.cost > 0)
        const head = ranked.slice(0, PALETTE.length - 1).map((entry, index) => ({ key: entry.model, label: entry.model, cost: entry.cost, color: PALETTE[index], others: false }))
        const rest = ranked.slice(PALETTE.length - 1)
        if (rest.length > 0) {
          head.push({ key: '__others', label: translate(lang, 'others'), cost: rest.reduce((sum, entry) => sum + entry.cost, 0), color: PALETTE[PALETTE.length - 1], others: true })
        }
        return head
      }, [data, lang])
      // Legend toggles: a hidden model leaves the chart, not the page totals,
      // because those are aggregated by the Host over every Session.
      const [hiddenModels, setHiddenModels] = useState({})
      const toggleModel = useCallback((key) => {
        setHiddenModels((current) => ({ ...current, [key]: current[key] !== true }))
      }, [])
      const visibleModels = chartModels.filter((model) => hiddenModels[model.key] !== true)

      const head = h(
        'div',
        { className: 'ud_head' },
        h(
          'div',
          {},
          h('h1', { className: 'ud_title' }, t('title')),
          h('p', { className: 'ud_sub' }, t('subtitle')),
        ),
        h(
          'div',
          { className: 'ud_actions' },
          h(Picker, {
            label: t('language'),
            value: lang,
            options: [
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'Français' },
              { value: 'zh', label: '中文' },
            ],
            onChange: (value) => langStore.set(value),
          }),
          h(Picker, {
            label: t('rangeTitle'),
            value: range.preset,
            options: PRESETS.map((preset) => ({ value: preset, label: t(RANGE_LABEL[preset]) })),
            onChange: (value) => updateRange({ ...range, preset: value }),
          }),
          range.preset === 'custom'
            ? [
                h(DateField, {
                  key: 'from',
                  label: t('rangeFrom'),
                  value: range.from,
                  max: range.to,
                  locale: f.locale,
                  onChange: (value) => updateRange({ ...range, from: value }),
                }),
                h(DateField, {
                  key: 'to',
                  label: t('rangeTo'),
                  value: range.to,
                  min: range.from,
                  locale: f.locale,
                  onChange: (value) => updateRange({ ...range, to: value }),
                }),
              ]
            : null,
          h('button', { type: 'button', className: 'ud_btn', onClick: refresh, disabled: status === 'loading' || status === 'refreshing' }, t('refresh')),
        ),
      )

      if (status === 'loading' && data === null) {
        return h('div', { className: 'ud_page' }, h('div', { className: 'ud_inner' }, head, h('div', { className: 'ud_empty' }, t('loading'))))
      }

      if (data === null) {
        return h(
          'div',
          { className: 'ud_page' },
          h(
            'div',
            { className: 'ud_inner' },
            head,
            h(
              'div',
              { className: 'ud_panel' },
              h('div', { className: 'ud_empty ud_error' }, `${t('failed')} ${error ?? ''}`),
              h('div', { style: { textAlign: 'center' } }, h('button', { type: 'button', className: 'ud_btn', onClick: refresh }, t('retry'))),
            ),
          ),
        )
      }

      const originLabel = data.account !== null && data.account !== undefined && data.account.source === 'api-key' ? t('balanceNoteApiKey') : t('balanceNote')
      const topUpUrl = data.account !== null && data.account !== undefined && typeof data.account.topUpUrl === 'string' && data.account.topUpUrl.startsWith('https://') ? data.account.topUpUrl : null
      const knownPreset = Object.hasOwn(RANGE_LABEL, data.range ?? range.preset) ? (data.range ?? range.preset) : range.preset
      const rangeLabel = knownPreset === 'custom' ? `${range.from} → ${range.to}` : t(RANGE_LABEL[knownPreset])

      const cards = h(
        'div',
        { className: 'ud_cards' },
        h(StatCard, {
          label: t('cost'),
          value: f.money(totals.cost, currency),
          children: [
            data.spend !== null && data.spend !== undefined
              ? h('div', { className: 'ud_note' }, `${t('spendNote')} ${f.money(data.spend.amount, currency)}`)
              : null,
            h('div', { className: 'ud_note' }, t('costNote')),
          ],
        }),
        h(StatCard, {
          label: t('tokens'),
          value: f.compact(totals.totalTokens),
          unit: 'tokens',
          note: `${f.plain(totals.requests)} req. · ${f.compact(totals.cacheReadTokens)} ${t('cached')}`,
        }),
        h(StatCard, {
          label: t('requests'),
          value: f.plain(totals.requests),
          unit: 'req.',
          note: `${f.compact(totals.inputTokens)} in · ${f.compact(totals.outputTokens)} out`,
        }),
        balanceWallet !== null
          ? h(StatCard, {
              label: t('balance'),
              value: String(balanceWallet.balance),
              unit: balanceWallet.currency,
              note: null,
              children: h(
                'div',
                { className: 'ud_balFoot' },
                topUpUrl !== null
                  ? h('a', { className: 'ud_btn ud_btnTiny', href: topUpUrl, target: '_blank', rel: 'noreferrer' }, t('topUp'))
                  : null,
                h('span', { className: 'ud_balSource' }, originLabel),
              ),
            })
          : h(StatCard, {
              label: t('sessions'),
              value: f.plain(data.sessionCount ?? 0),
              unit: 'sessions',
              note: `${cacheRate.toFixed(0)}% ${t('cached')}`,
            }),
      )

      const chart = h(
        'div',
        { className: 'ud_panel' },
        h(
          'div',
          { className: 'ud_panelHead' },
          h('div', { className: 'ud_panelTitle' }, t('perDay')),
          h('div', { className: 'ud_panelMeta' }, `${f.money(totals.cost, currency)} · ${rangeLabel}`),
        ),
        totals.requests === 0
          ? h('div', { className: 'ud_empty' }, t('noData'))
          : [
              h(DayChart, { key: 'chart', days: data.byDay, models: visibleModels, currency, f, t }),
              h(ChartLegend, { key: 'legend', models: chartModels, hidden: hiddenModels, onToggle: toggleModel, total: totals.cost, f, t }),
            ],
      )

      const split = h(
        'div',
        { className: 'ud_split' },
        h(
          'div',
          { className: 'ud_panel' },
          h('div', { className: 'ud_panelHead' }, h('div', { className: 'ud_panelTitle' }, t('perModel'))),
          h(ModelRows, { models: data.byModel, currency, f, t }),
        ),
        h(
          'div',
          { className: 'ud_panel' },
          h(
            'div',
            { className: 'ud_panelHead' },
            h('div', { className: 'ud_panelTitle' }, t('recent')),
            h('div', { className: 'ud_panelMeta' }, `${data.sessions.length}`),
          ),
          h(SessionRows, { sessions: data.sessions.slice(0, 8), currency, f, t }),
        ),
      )

      return h(
        'div',
        { className: 'ud_page' },
        h(
          'div',
          { className: 'ud_inner' },
          head,
          data.partial ? h('div', { className: 'ud_banner' }, t('partial')) : null,
          cards,
          chart,
          split,
        ),
      )
    }

    function UsageIcon(props) {
      const size = typeof props.size === 'number' && props.size > 0 ? props.size : 18
      const active = props.active === true
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          style: { display: 'block', color: active ? 'var(--dsw-alias-brand-primary)' : 'currentColor' },
        },
        h('path', { d: 'M4 20.5h16', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', opacity: 0.5 }),
        h('path', { d: 'M7.5 20V13', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' }),
        h('path', { d: 'M12 20V7', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' }),
        h('path', { d: 'M16.5 20v-5', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round' }),
      )
    }

    /**
     * Gauge glyph shared by the cost chips: the official icon, inlined from the
     * shipped primitives (a plugin cannot import that package).
     */
    function TagIcon({ size = 13 }) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', strokeWidth: 1, xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true },
        h('path', {
          d: 'M3.4041 13.096C2.49514 12.187 1.87614 11.0288 1.62537 9.76798C1.37459 8.50716 1.50331 7.20028 1.99525 6.01261C2.48719 4.82494 3.32025 3.80981 4.3891 3.09557C5.45795 2.38134 6.71458 2.00008 8.0001 2C9.28563 2.00008 10.5423 2.38134 11.6111 3.09557C12.68 3.80981 13.513 4.82494 14.005 6.01261C14.4969 7.20028 14.6256 8.50716 14.3748 9.76798C14.1241 11.0288 13.5051 12.187 12.5961 13.096',
          stroke: 'currentColor',
        }),
        h('path', { d: 'M8 8.49994L11.6114 4.88855', stroke: 'currentColor' }),
        h('path', {
          d: 'M8 9.75C8.69036 9.75 9.25 9.19036 9.25 8.5C9.25 7.80964 8.69036 7.25 8 7.25C7.30964 7.25 6.75 7.80964 6.75 8.5C6.75 9.19036 7.30964 9.75 8 9.75Z',
          fill: 'currentColor',
        }),
      )
    }

    /**
     * One open cost panel at a time: opening a second chip closes the first
     * instead of stacking dialogs.
     */
    const openPanel = { value: null, listeners: new Set() }

    function setOpenPanel(next) {
      openPanel.value = next
      for (const listener of openPanel.listeners) listener()
    }

    /** Anchor state for one chip, mirrored from the shared open-panel store. */
    function useOpenPanel(key) {
      const [anchor, setAnchor] = useState(() => (openPanel.value !== null && openPanel.value.key === key ? openPanel.value.anchor : null))
      useEffect(() => {
        const listener = () => {
          const value = openPanel.value
          setAnchor(value !== null && value.key === key ? value.anchor : null)
        }
        openPanel.listeners.add(listener)
        return () => {
          openPanel.listeners.delete(listener)
        }
      }, [key])
      const open = useCallback((rect) => setOpenPanel({ key, anchor: { left: rect.left, top: rect.top } }), [key])
      const close = useCallback(() => setOpenPanel(null), [])
      return [anchor, open, close]
    }

    /** Dismiss the open panel on an outside click, Escape, or a resize. */
    function usePanelDismiss(anchor, close, buttonRef, panelRef) {
      useEffect(() => {
        if (anchor === null) return undefined
        const onDown = (event) => {
          if (buttonRef.current !== null && buttonRef.current.contains(event.target)) return
          if (panelRef.current !== null && panelRef.current.contains(event.target)) return
          close()
        }
        const onKey = (event) => {
          if (event.key === 'Escape') close()
        }
        const onViewport = () => close()
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        window.addEventListener('resize', onViewport)
        return () => {
          document.removeEventListener('mousedown', onDown)
          document.removeEventListener('keydown', onKey)
          window.removeEventListener('resize', onViewport)
        }
      }, [anchor, close, buttonRef, panelRef])
    }

    /** Rows shared by both panels: one per token kind, with its billed cost. */
    function costRows(kinds, usage, t) {
      if (kinds === null || kinds === undefined) return []
      const rows = [
        { key: 'input', label: t('rowInput'), tokens: usage.inputTokens, cost: kinds.input },
        { key: 'cacheRead', label: t('rowCacheRead'), tokens: usage.cacheReadTokens, cost: kinds.cacheRead },
      ]
      if (kinds.cacheWrite > 0) rows.push({ key: 'cacheWrite', label: t('rowCacheWrite'), tokens: usage.cacheWriteTokens, cost: kinds.cacheWrite })
      rows.push({ key: 'output', label: t('rowOutput'), tokens: usage.outputTokens, cost: kinds.output })
      return rows
    }

    /** The shared breakdown dialog, anchored above the chip that opened it. */
    function CostPopover({ anchor, title, meta, currency, total, rows, models, f, t, panelRef }) {
      return h(
        'div',
        {
          ref: panelRef,
          className: 'ud_pop',
          role: 'dialog',
          'aria-label': title,
          style: {
            left: `${Math.max(12, Math.min(anchor.left, window.innerWidth - 456))}px`,
            bottom: `${Math.max(12, window.innerHeight - anchor.top + 8)}px`,
          },
        },
        h(
          'div',
          { className: 'ud_popHead' },
          h('span', { className: 'ud_popTitle' }, h(TagIcon, { size: 14 }), h('span', {}, title)),
          h('span', {}, f.money(total, currency)),
        ),
        h('div', { className: 'ud_popRule' }),
        meta === null || meta === undefined
          ? null
          : h(
              'div',
              { className: 'ud_popRow ud_popRowWide', key: 'meta' },
              h('span', {}, meta.label),
              h('span', { className: 'ud_popValue' }, meta.value),
            ),
        rows.map((row) =>
          h(
            'div',
            { className: 'ud_popRow', key: row.key },
            h('span', {}, row.label),
            h('span', { className: 'ud_popMeta' }, f.compact(row.tokens)),
            h('b', {}, f.money(row.cost ?? 0, currency)),
          ),
        ),
        models.length === 0
          ? null
          : [
              h('div', { className: 'ud_popSection', key: 'section' }, t('perModel')),
              ...models.map((entry) =>
                h(
                  'div',
                  { className: 'ud_popRow', key: entry.model },
                  h('span', {}, entry.model),
                  h('span', { className: 'ud_popMeta' }, `${f.plain(entry.requests)} req.`),
                  h('b', {}, f.money(entry.cost, currency)),
                ),
              ),
            ],
        h('div', { className: 'ud_popNote' }, t('costNote')),
      )
    }

    /**
     * The Session's estimated cost in the composer footer, beside the shipped
     * turn/step, token, and cache chips. Clicking it opens the breakdown: cost
     * per token kind and per model, over the same usage records the neighbours
     * summarise, so only the price table makes it an estimate.
     */
    function SessionCostChip(props) {
      const lang = useLang()
      const f = useMemo(() => formatters(lang), [lang])
      const usage = useTurnCosts(props.sessionId, 5000)
      const [anchor, open, close] = useOpenPanel('session')
      const buttonRef = useRef(null)
      const panelRef = useRef(null)
      usePanelDismiss(anchor, close, buttonRef, panelRef)

      if (usage === null || typeof usage.cost !== 'number' || usage.requests === 0) return null

      const tr = (key) => translate(lang, key)
      const openAt = () => {
        if (anchor !== null) {
          close()
          return
        }
        const rect = buttonRef.current === null ? undefined : buttonRef.current.getBoundingClientRect()
        if (rect !== undefined) open(rect)
      }
      const button = h(
        'button',
        {
          ref: buttonRef,
          type: 'button',
          className: 'ud_footCost',
          title: `${tr('costChipTitle')} · ${f.plain(usage.requests)} req.`,
          'aria-haspopup': 'dialog',
          'aria-expanded': anchor !== null,
          onClick: openAt,
        },
        h(TagIcon, {}),
        h('span', {}, `≈ ${f.money(usage.cost, usage.currency)}`),
      )
      if (anchor === null) return button

      const models = Array.isArray(usage.byModel) ? usage.byModel.filter((entry) => entry.requests > 0).slice(0, 4) : []
      return h(
        React.Fragment,
        null,
        button,
        h(CostPopover, {
          anchor,
          title: tr('costDetails'),
          meta: null,
          currency: usage.currency,
          total: usage.cost,
          rows: costRows(usage.costByKind, usage, tr),
          models,
          f,
          t: tr,
          panelRef,
        }),
      )
    }

    /**
     * The cost of the Turn that ends on this message. The row it lives in —
     * copy, feedback, the shipped "Usage N tok" chip, the clock — summarises the
     * whole Turn, so the dollar figure must speak about the same scope: every
     * request the Turn made, tool-call rounds included.
     */
    function MessageCostChip(props) {
      const lang = useLang()
      const f = useMemo(() => formatters(lang), [lang])
      // One read per message, retried until its own usage record lands.
      const usage = useTurnCosts(props.sessionId, 0, props.messageId ?? null)
      const messageKey = props.messageId === undefined || props.messageId === null ? 'message:none' : `message:${props.messageId}`
      const [anchor, open, close] = useOpenPanel(messageKey)
      const buttonRef = useRef(null)
      const panelRef = useRef(null)
      usePanelDismiss(anchor, close, buttonRef, panelRef)

      if (usage === null || props.messageId === undefined || props.messageId === null) return null
      const entry = usage.byMessage[String(props.messageId)]
      if (entry === undefined) return null
      // The Turn aggregate is the row's scope; the message entry only supplies
      // the Turn number, and stands in when an older Host sent no Turn buckets.
      const turn = usage.byTurn[String(entry.turn)]
      const bucket = turn === undefined ? entry : turn

      const tr = (key) => translate(lang, key)
      const openAt = () => {
        if (anchor !== null) {
          close()
          return
        }
        const rect = buttonRef.current === null ? undefined : buttonRef.current.getBoundingClientRect()
        if (rect !== undefined) open(rect)
      }
      const button = h(
        'button',
        {
          ref: buttonRef,
          type: 'button',
          className: 'ud_actionChip',
          title: `${tr('turnCost')} · ${f.plain(bucket.requests)} req. · ${f.compact(bucket.inputTokens + bucket.cacheReadTokens + bucket.cacheWriteTokens + bucket.outputTokens)} tokens`,
          'aria-haspopup': 'dialog',
          'aria-expanded': anchor !== null,
          onClick: openAt,
        },
        h(TagIcon, { size: 12 }),
        h('span', {}, f.money(bucket.cost, usage.currency)),
      )
      if (anchor === null) return button

      const model = bucket.model ?? entry.model
      const provider = bucket.provider ?? entry.provider
      return h(
        React.Fragment,
        null,
        button,
        h(CostPopover, {
          anchor,
          title: tr('costDetails'),
          meta: { label: tr('providerModel'), value: provider ? `${provider}/${model}` : model },
          currency: usage.currency,
          total: bucket.cost,
          rows: costRows(bucket.costByKind, bucket, tr),
          models: [],
          f,
          t: tr,
          panelRef,
        }),
      )
    }

    /** Sidebar-foot entry that opens the Usage page (wide row, rail icon). */
    function SidebarUsageAction(props) {
      const lang = useLang()
      const wide = props.wide !== false
      const label = translate(lang, 'panelTitle')
      const open = typeof props.open === 'function' ? props.open : () => {}
      const usePanelInfo = typeof props.usePanelInfo === 'function' ? props.usePanelInfo : null
      const active = usePanelInfo === null ? false : usePanelInfo((info) => info.activePanelId === 'usage')
      return h(
        'button',
        {
          type: 'button',
          className: wide ? 'ud_sideRow' : 'ud_sideIcon',
          title: label,
          'aria-label': label,
          'aria-current': active ? 'page' : undefined,
          onClick: open,
        },
        h(UsageIcon, { size: 16, active }),
        wide ? h('span', { className: 'ud_sideLabel' }, label) : null,
      )
    }

    /* ---------------------------------------------------------------- setup -- */

    return {
      inject: ['slots', 'locale', 'layout'],
      apply(ctx) {
        ensureStyles()
        ctx.effect(() => ctx.locale.register(NS, { en, fr, zh }))

        ctx.effect(() => () => {
          const tag = document.querySelector(`style[data-plugin-css="${tagId}"]`)
          if (tag !== null) tag.remove()
        })

        ctx.slots.inject('main', () =>
          ctx.slots.register({ name: 'main', key: 'usage', locale: NS }, UsagePage),
        )

        ctx.slots.inject('conversation.chat.assistant-actions', () =>
          ctx.slots.register({ name: 'conversation.chat.assistant-actions', id: 'usage-message-cost', order: 20, locale: NS }, MessageCostChip),
        )

        ctx.slots.inject('conversation.composer.dock', () =>
          ctx.slots.register({ name: 'conversation.composer.dock', id: 'cost', order: 5, locale: NS }, SessionCostChip),
        )

        // Foot seat: renders above the settings seat, i.e. at the very bottom
        // of the column, beside the shipped foot controls.
        ctx.slots.inject('sidebar.footer.action', () =>
          ctx.slots.register(
            {
              name: 'sidebar.footer.action',
              id: 'usage-footer',
              order: 5,
              locale: NS,
              label: () => translate(langStore.value, 'panelTitle'),
              inject: () => ({ open: () => ctx.layout.selectPanel('usage') }),
            },
            SidebarUsageAction,
          ),
        )
      },
    }
  },
})
