# CLAUDE.md

Гайд для работы над проектом через Claude Code (в т.ч. с других машин).

> **Правило:** при каждом важном изменении проекта (новые поля формы, изменение формулы,
> изменение темы, исправление архитектурных проблем) — **обновить этот файл**. Без документации
> следующая сессия потеряет контекст и воспроизведёт те же ошибки.

## Что это

Калькулятор «Что выгоднее: купить сразу или оформить рассрочку?» — одностраничное
веб-приложение. Сравнивает два сценария покупки:

1. **Оплатить сразу** → разовый бонус.
2. **Рассрочка + депозит** → всю сумму кладём на депозит, каждый месяц достаём платёж по
   беспроцентной рассрочке (сумма / срок) и гасим. Остаток депозита убывает и к концу срока
   обнуляется, но за это время на убывающий остаток капают проценты. Эти проценты за вычетом
   налога — выгода, которую сравниваем с бонусом.

Вся логика в браузере, бэкенда нет. Состояние локальное (`useReducer` + `useMemo`).

## Команды

```bash
pnpm install        # установка (пакетный менеджер — pnpm, не npm/npx для install)
pnpm dev            # дев-сервер
pnpm test           # vitest run — тесты ядра расчёта
pnpm test:watch     # vitest в watch-режиме
pnpm build          # tsc -b && vite build → dist/
pnpm preview        # предпросмотр сборки
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
```

## Формула расчёта (ядро)

Реализована в [`src/lib/calc.ts`](src/lib/calc.ts), функция `simulate(input)`. Помесячная
симуляция, порядок операций внутри месяца строго такой:

```
monthlyRate = annualRatePct / 100 / 12
payment     = purchasePrice / termMonths
balance     = purchasePrice
для каждого месяца 1..termMonths:
  1. interest = max(balance, 0) * monthlyRate     # проценты только на положит. остаток
  2. если капитализация: balance += interest
     иначе:              копим interest отдельно
  3. balance -= payment                            # списать платёж
     если balance < 0: balance = 0                 # граница: не уходим в минус
totalInterestGross = капитализация ? Σ interest : накопленные отдельно
netDepositIncome   = totalInterestGross * (1 − taxPct/100)
```

Вердикт: сравнить `netDepositIncome` с `bonus` → `deposit` / `upfront` / `tie`.

**Инварианты (проверяются в [`calc.test.ts`](src/lib/calc.test.ts)):**
- При капитализации итоговый остаток депозита == сумме начисленных процентов.
- Без капитализации остаток к концу срока == 0.
- Остаток никогда не уходит в минус; проценты не начисляются на отрицательный баланс.

**Любое изменение `simulate` обязано сопровождаться обновлением тестов и `pnpm test`.**

## Структура

```
src/
  lib/
    calc.ts        # simulate() + validate() — чистые функции, без React
    calc.test.ts   # тесты ядра (vitest)
    format.ts      # formatTenge / formatNumber / parseDecimal (ru-RU, тг)
    form.ts        # FormState, defaultForm, toCalcInput()
  components/
    InputPanel.tsx       # форма; получает form/errors/onChange пропсами
    VerdictCard.tsx      # крупный вердикт
    ComparisonTable.tsx  # доход депозита (до/после налога) vs бонус
    BalanceChart.tsx     # recharts LineChart остатка по месяцам
    MonthlyTable.tsx     # collapsible-таблица помесячно
    ui/                  # сгенерированные компоненты shadcn/ui — не править вручную
  App.tsx          # reducer формы + derived-расчёт через useMemo
  index.css        # Tailwind v4 + CSS-переменные темы (пресет shadcn)
```

## Состояние формы по умолчанию

Определено в [`src/lib/form.ts`](src/lib/form.ts), `defaultForm`:

| Поле | Значение | Примечание |
|---|---|---|
| `purchasePrice` | `"1000"` | Не пустое — иначе при входе сразу видна ошибка валидации |
| `bonus` | `"0"` | |
| `term` | `"12"` | Совпадает с активным пресетом по умолчанию |
| `isCustomTerm` | `false` | |
| `annualRatePct` | `"16"` | Средняя ставка по РК |
| `capitalization` | `true` | |
| `taxEnabled` | `false` | Налог на доход необязателен для физлиц в РК; Switch выключен |
| `taxPct` | `"10"` | Показывается только при `taxEnabled: true` |

**Пресеты срока:** `[3, 4, 6, 12, 24]` мес + «Другое» (произвольный ввод).

## Правила и договорённости

- **Пакетный менеджер — pnpm.** `npm install` на Windows нестабилен (падал при скаффолдинге).
  Коммить `pnpm-lock.yaml`. В `package.json` обязательно поле `"packageManager": "pnpm@X.Y.Z"` —
  без него CI (pnpm/action-setup) не знает версию и падает.

- **shadcn компоненты добавлять через `npx shadcn@latest add <name>`**, а не через
  `pnpm dlx shadcn` — у последнего на Windows бывает ошибка `ERR_PNPM_NO_IMPORTER_MANIFEST_FOUND`
  из-за кэша.

- **Логика расчёта — только в `src/lib/`**, в чистых функциях без React. UI не должен содержать
  бизнес-вычислений. Расчёт в `App.tsx` идёт через `useMemo`, пересчёт реактивный (без кнопки).

- **Тема shadcn — пресет `b59i6Eu9zu`**, CSS-переменные в `src/index.css`. Тему задаёт владелец
  проекта; не хардкодить цвета — использовать семантические токены (`bg-background`, `text-primary`,
  `var(--border)` и т.п.). В графике цвета берём из CSS-переменных темы.

- **Суммы** форматируются только через `format.ts` (разделитель разрядов + « тг»).

- **Алиас `@/`** → `src/` (настроен в `vite.config.ts` и `tsconfig`).

## Тема и цвета (APCA-контраст)

Тёмная тема: `--primary` переопределён на `oklch(0.76 0.13 292)` — лавандовый, который
проходит проверку по **APCA** (Accessible Perceptual Contrast Algorithm):
- Lc −62 — текст `text-primary` на тёмном фоне `oklch(0.205 0 0)` → проходит (нужно ≥ |Lc 60|).
- Lc +66 — тёмный `primary-foreground oklch(0.145 0 0)` на лавандовой кнопке → проходит.

Светлая тема: `--primary: oklch(0.491 0.27 292.581)` — оригинал пресета, проверку не меняли.

**Правило:** при изменении акцентных цветов темы — проверять APCA-контраст. Минимум:
- Lc −60 для обычного текста на тёмном фоне.
- Lc −45 для крупного жирного текста.

Не использовать отдельные токены типа `--primary-text` для обхода контраста — менять сам
`--primary` в тёмной теме и `--primary-foreground` соответственно. Так все акцентные элементы
(кнопки, иконки, `text-primary`) автоматически получают правильный цвет.

## Архитектурные подводные камни

### CardHeader использует CSS grid, не flex

`CardHeader` из shadcn/ui по умолчанию имеет `display: grid`. Если нужен `CollapsibleTrigger`
на всю ширину со стрелкой справа — **не оборачивать его в `<CardHeader>`**. Использовать
самостоятельный `<CollapsibleTrigger>` с flex-классами:

```tsx
<CollapsibleTrigger className="flex w-full cursor-pointer select-none items-center justify-between px-6 pt-0 pb-5">
  <CardTitle>Заголовок</CardTitle>
  <RiArrowDownSLine className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
</CollapsibleTrigger>
```

### recharts: обязательно отключать анимацию

В `<Line>` (и других рядах recharts) всегда ставить `isAnimationActive={false}`. Без этого
скриншот-превью зависает (анимация не заканчивается в headless-среде).

### recharts: не давать CardContent горизонтальный padding

`CardContent` внутри карточки с графиком должен иметь `className="px-0 pb-4"` — без
горизонтального padding. Иначе SVG recharts переполняет контейнер и обрезается `overflow-hidden`
карточки. Внутренние отступы задаются через `margin` в `<LineChart>`:

```tsx
<CardContent className="px-0 pb-4">
  <LineChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 16 }}>
```

### MonthlyTable открыта по умолчанию

`useState(true)` — таблица раскрыта сразу, пользователь видит данные без лишнего клика.

## Деплой

GitHub Pages через Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):
пуш в `main` → install → test → build → publish. `base: "./"` в `vite.config.ts` делает сборку
независимой от имени репозитория. Источник Pages в настройках репо: **GitHub Actions**.

Workflow использует `pnpm/action-setup@v4` + `setup-node@v4` с `cache: pnpm`. Версия pnpm
берётся из поля `packageManager` в `package.json` — это поле **обязательно**.

## Вне scope (v1)

Сохранение расчётов, история, аккаунты; несколько валют; парсинг ставок банков; сложные
депозиты (пополняемые, лестница ставок).
