# dsh-usage

Usage and cost dashboard for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness).

It reads the Session logs already on your machine, prices every model call with the published
DeepSeek rates, and shows the result where you actually look: a sidebar page, a chip under each
assistant message, and a chip in the composer footer.

No build step, no runtime dependency, no network access except the optional balance lookup.

## What you get

- **Usage page**, opened from the sidebar foot row (just above the account launcher): total cost,
  tokens, API requests, cache-hit rate, account balance, a per-day cost chart, a per-model table,
  and the recent Sessions.
- **Stacked daily chart**: one segment per model, a value axis, and a legend that doubles as
  filters — click a model to take it out of the chart. Hovering a column opens a card with that
  day's split, or `$0.00` on a quiet day.
- **Turn cost** in the row that already carries copy, feedback and the shipped usage chip:
  `🗄 Usage 7.7M tok  [gauge] $0,0271 USD  21:17`. It prices the whole Turn — every request it
  made, tool rounds included — so it matches the token counter beside it. Click it for the
  breakdown: cost per token kind and the provider/model.
- **Session cost** in the composer footer, beside the turn/step and token counters, with the same
  breakdown on click (per token kind and per model).
- **Time ranges**: today, yesterday, last 7 days, last 30 days, this month, last month, custom
  (with a calendar picker).
- **Language**: English, French or Chinese for the whole plugin UI — persisted, English by default.

## Requirements

- A DeepSeek Harness installation with the Web UI (the desktop app, or `dsh web`).
- Any profile that composes `@deepseek-ai/dsh-web-app` — the shipped `desktop` profile does.
- Nothing else. The Host half uses only Node built-ins; the browser half requires `react` from the
  module loader the Harness already provides.

## Install

### From a clone

```bash
git clone https://github.com/SimonMedy/dsh-usage.git
```

Then install that directory as a bundle in your profile. From a Harness session, ask the agent to
run `plugin_manager` with `action: install_bundle` and the absolute path of the clone. The Plugin
Manager links the directory into `~/.dsh/profiles/<profile>` and enables the bundle.

Keep the clone where it is: the profile stores a `link:` to it, so moving or deleting the directory
breaks the plugin at the next start.

### From npm (after publishing)

```bash
npm publish
```

then install the package spec `dsh-usage@1.0.0` the same way. An npm install copies the
files into the profile instead of linking, so it survives moving the source directory.

## Configure prices

The API returns tokens, never an invoice: the dollar figure is computed from the published rates.
Defaults follow the [official price list](https://api-docs.deepseek.com/quick_start/pricing) in USD
per 1M tokens, written as `[off-peak, peak]`. Override them in the profile patch
(`~/.dsh/profiles/<profile>/cordis.patch.yml`):

```yaml
- id: usage-dashboard
  name: "dsh-usage"
  config:
    currency: USD
    prices:
      "deepseek-flash":
        cacheHit: [0.003, 0.006]
        cacheMiss: [0.15, 0.3]
        output: [0.6, 1.2]
      "deepseek-v4-pro":
        cacheHit: [0.022, 0.044]
        cacheMiss: [0.66, 1.32]
        output: [1.98, 3.96]
```

A single number applies to both tariffs (`cacheMiss: 0.15`). A model that matches no row is priced
with the fallback grid and marked `default price` in the per-model table, so an extrapolated figure
is never silently presented as a real one.

### Future models

Pricing is resolved per request, from the model recorded in the event, so a model that did not exist
when this plugin shipped never breaks the page: names containing `pro` use the v4-pro row, names
containing `flash` the flash row, anything else falls back to the flash grid and is tagged
**default price** until you add its row to `prices`. The tag disappears as soon as a request matches
an entry.

## How the cost is computed

Every `assistant/message` event in a Session log carries the provider `usage` record — cached input,
uncached input, output — **and** the model that produced it (`message.source`). The Host folds those
events, so:

- each request is priced with **its own** model, including a model switch in the middle of a turn;
- peak hours (01:00–04:00 and 06:00–10:00 UTC, Monday to Friday) use the peak tariff, everything
  else the off-peak one;
- forks and resumed Sessions are counted once per Session, because each fork has its own log.

Previous Sessions are included from the moment you install: the logs were already there.

## Balance

The balance card uses the signed-in DeepSeek account when there is one. Otherwise the Host asks
`https://api.deepseek.com/user/balance` with the API key resolved from the `DEEPSEEK_API_KEY`
credential reference and shows the wallet totals it returns. When neither is available the card is
replaced by the Session count, so the page always renders.

The tariff drop between two balance samples (recorded at most every three hours, kept in
`~/.dsh/storages/usage-dashboard/balance.json`) is shown as money actually billed — the only figure
on the page that is not an estimate.

## Privacy

Everything is computed locally: the Host reads the Session logs under `~/.dsh/sessions` and never
uploads them. The only outbound request is the optional balance lookup to `api.deepseek.com`, made
with your API key and only when the account service cannot answer. The browser receives aggregates
only — token counts, costs, Session titles and folder paths — over the Harness's authenticated
channel, and the API key never leaves the Host process.

## Limits

- **Cost is an estimate.** It matches the provider invoice as long as the price table is current and
  your usage goes through the official API. Chinese public holidays, which are off-peak, are not
  known to the plugin.
- **The per-message chip is positioned with a flex `order`.** The Harness keeps the usage chip and
  the clock in one span; the plugin opens that span with `display: contents` so the cost can sit
  between them. If a future release changes that markup the rule stops matching and the chip falls
  back to the end of the row — it never breaks the layout.
- The sidebar row is styled to match the account launcher's signed-out state (32 px). A signed-in
  launcher is taller; the row keeps its own height rather than following the account state.
- Sessions are folded lazily: the first page open after a long while may spend a second or two
  reading cold logs, then returns a `partial` flag while the rest fills in.

## Uninstall

Remove the bundle from the profile (Plugin Manager, or `plugin_manager` with `action: remove_bundle`
and the package name). The plugin keeps no data of its own except the optional balance samples under
`~/.dsh/storages/usage-dashboard/`.

## Repository layout

```
index.js            Host half — Session fold, JSON routes, price table
client.js           Browser half — sidebar page, chips, pickers, calendar, CSS
cordis.patch.yml    The bundle patch that inserts the Host row
locale/en.json      Plugin Manager title and description (en)
locale/fr.json      Same, French
icon.svg            Plugin Manager icon
```

## License

MIT — see [LICENSE](LICENSE).
