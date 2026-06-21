# CLAUDE.md

Гайд для работы над проектом через Claude Code (в т.ч. с других машин).

## Что это

Калькулятор «Рассрочка + депозит» — одностраничное веб-приложение. Сравнивает два сценария
покупки и показывает выгоду:

1. **Оплатить сразу** → разовый бонус.
2. **Рассрочка + депозит** → всю сумму кладём на депозит, каждый месяц достаём платёж по
   беспроцентной рассрочке (сумма / срок) и гасим. Остаток депозита убывает и к концу срока
   обнуляется, но за это время на убывающий остаток капают проценты. Эти проценты за вычетом
   налога — выгода, которую сравниваем с бонусом.

Вся логика в браузере, бэкенда нет. Состояние локальное (`useReducer` + `useMemo`).

## Команды

```bash
pnpm install        # установка (пакетный менеджер — pnpm, не npm)
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

## Правила и договорённости

- **Пакетный менеджер — pnpm.** `npm install` в этом окружении нестабилен (падал при
  скаффолдинге); используй pnpm. Коммить `pnpm-lock.yaml`.
- **Логика расчёта — только в `src/lib/`**, в чистых функциях без React. UI не должен содержать
  бизнес-вычислений. Расчёт в `App.tsx` идёт через `useMemo`, пересчёт реактивный (без кнопки).
- **Тема shadcn — пресет `b59i6Eu9zu`**, CSS-переменные в `src/index.css`. Тему задаёт владелец
  проекта; не хардкодить цвета — использовать семантические токены (`bg-background`, `text-primary`,
  `var(--border)` и т.п.). В графике цвета берём из CSS-переменных темы.
- **Компоненты `src/components/ui/`** генерируются shadcn — добавлять новые через
  `npx shadcn@latest add <name>`, а не писать руками.
- **Суммы** форматируются только через `format.ts` (разделитель разрядов + « тг»).
- **Алиас `@/`** → `src/` (настроен в `vite.config.ts` и `tsconfig`).

## Деплой

GitHub Pages через Actions ([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)):
пуш в `main` → install → test → build → publish. `base: "./"` в `vite.config.ts` делает сборку
независимой от имени репозитория. Источник Pages в настройках репо: **GitHub Actions**.

## Вне scope (v1)

Сохранение расчётов, история, аккаунты; несколько валют; парсинг ставок банков; сложные
депозиты (пополняемые, лестница ставок).
