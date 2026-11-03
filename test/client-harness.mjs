// Mount the browser half in a VM: no DOM, just the module loader contract.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const ROOT = fileURLToPath(new URL('..', import.meta.url))

/**
 * Load `client.js` the way the Harness does and expose its slot components.
 * @param options - `useState` replacements for the null states a test needs,
 *   in call order, plus the data a summary read should resolve to.
 * @returns the registered slots and a render helper that walks the tree.
 */
export function mountClient({ data = null, nullStates = [] } = {}) {
  let captured = null
  const sandbox = {
    window: {
      __ModuleLoader__: { load(spec) { captured = spec } },
      addEventListener() {},
      removeEventListener() {},
      innerWidth: 1280,
      innerHeight: 800,
    },
    document: {
      baseURI: 'http://127.0.0.1:5000/',
      querySelector: () => null,
      createElement: () => ({ dataset: {}, textContent: '', remove() {} }),
      head: { appendChild() {} },
      addEventListener() {},
      removeEventListener() {},
    },
    Intl,
    URL,
    URLSearchParams,
    Date,
    Math,
    JSON,
    Number,
    Object,
    Array,
    String,
    Map,
    Set,
    console,
    Error,
    Promise,
    encodeURIComponent,
    setTimeout: () => 0,
    clearTimeout: () => {},
    setInterval: () => 0,
    clearInterval: () => {},
    fetch: () => Promise.reject(new Error('offline')),
    AbortController,
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  }
  sandbox.globalThis = sandbox
  vm.createContext(sandbox)
  vm.runInContext(readFileSync(join(ROOT, 'client.js'), 'utf8'), sandbox)
  if (captured === null) throw new Error('client.js did not register with the module loader')

  let nullIndex = 0
  const React = {
    Fragment: 'fragment',
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children: children.flat() }
    },
    useState(initial) {
      if (data !== null && initial !== null && typeof initial === 'object' && initial.status === 'loading') {
        return [{ status: 'ready', data, error: null }, () => {}]
      }
      const value = typeof initial === 'function' ? initial() : initial
      // The chip reads its usage through a lazily initialised state that starts
      // null, exactly like the panel anchor: both are replaced in call order.
      if (value === null && nullIndex < nullStates.length) {
        const replacement = nullStates[nullIndex]
        nullIndex += 1
        return [replacement, () => {}]
      }
      return [value, () => {}]
    },
    useEffect() {},
    useCallback(fn) {
      return fn
    },
    useMemo(fn) {
      return fn()
    },
    useRef(value) {
      return { current: value ?? null }
    },
  }

  const slots = new Map()
  captured.factory((name) => {
    if (name === 'react') return React
    throw new Error(`unexpected require: ${name}`)
  }).apply({
    effect(fn) {
      fn()
      return () => {}
    },
    locale: {
      register() {
        return () => {}
      },
      bind() {
        return (key) => key
      },
    },
    layout: { selectPanel() {} },
    slots: {
      inject(key, callback) {
        return callback()
      },
      register(options, component) {
        slots.set(options.name, { options, component })
        return () => {}
      },
    },
  })

  /** Render one slot component and flatten it into class tokens and text. */
  const render = (slotName, props = {}) => {
    const entry = slots.get(slotName)
    if (entry === undefined) throw new Error(`slot not registered: ${slotName}`)
    nullIndex = 0
    const tokens = []
    const nodes = []
    const walk = (node) => {
      if (node === null || node === undefined || typeof node === 'boolean') return
      if (typeof node === 'string' || typeof node === 'number') {
        tokens.push(String(node))
        return
      }
      if (Array.isArray(node)) {
        node.forEach(walk)
        return
      }
      if (typeof node.type === 'function') {
        walk(node.type(node.props))
        return
      }
      const className = node.props?.className
      if (className !== undefined) tokens.push(`[${String(className).split(' ')[0]}]`)
      nodes.push({ type: node.type, props: node.props ?? {}, children: node.children ?? [] })
      node.children?.forEach(walk)
    }
    walk(entry.component({ t: (key) => key, ...props }))
    return { tokens, text: tokens.join(' '), nodes }
  }

  return { slots, render }
}
