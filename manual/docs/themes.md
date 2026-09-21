# Светлая, тёмная и проектные темы

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

В мануале `theme-nk.css` подключается сразу после `core.css`. Переключатель в верхней панели меняет только светлый/тёмный режим, не пересоздавая примеры. Выбор локальных файлов и отдельное применение темы не нужны.

## Два уровня тем

**Режим цвета:** встроенные `[data-theme="light"]`, `[data-theme="dark"]`, `.core-theme-light`, `.core-theme-dark`. Светлые токены заданы также на `:root`. Тёмный scope переопределяет семантику цветов и связанные параметры компонентов.

**Файл оформления:** например, `theme-nk.css`, меняющий root-типографику. Это другая ось настройки. По имени файла нельзя заключать, что существует `.core-theme-nk`. В NK-файле такого переключателя нет.

## Как задавать режим

Для целой страницы поместите `data-theme` на `html`. Это одновременно согласует корневые значения и компоненты. Для вложенной области можно поставить `core-theme-dark`, но сам переключатель токенов не обязан нарисовать поверхность на произвольном `div`: добавьте `core-bg` и нужный цвет текста либо компонент поверхности.

Переключение атрибута — обычный код приложения; отдельный API Core для этого не нужен:

```js
// Это код приложения, не экспорт Core.
function setTheme(mode) {
  if (mode !== 'light' && mode !== 'dark') {
    throw new TypeError('Неизвестный режим темы');
  }
  document.documentElement.dataset.theme = mode;
}
```

Сохранение выбора, синхронизация с системной темой и начальное состояние до первой отрисовки остаются задачами приложения. StateManager хранит значения только в памяти; он не переключает тему и не пишет её в localStorage.

## Базовые цвета

Светлый background `#fff`, foreground `#000`, surface `#f1f1f1`. Тёмный background `#181A1B`, foreground `#fff`, surface `#222525`. Акцент в обоих режимах `#B2FF35`. Link: `#1f11d8` в светлом и `#5370ff` в тёмном. Focus: `#ff883e`. Success/danger/warning отличаются по режимам; выбор цвета не заменяет текстового сообщения.

## NK: Inter и метрики

`theme-nk.css` содержит удалённые font-face Inter, меняет `--rem-base` на 17px, основное семейство на `var(--font-primary-local, "Inter"), sans-serif`, метрики primary на unitsPerEm 2048, ascender 1984, descender 494, sxHeight 1118, sCapHeight 1490 и коэффициент line-height 1,15. Также изменён `--font-accent-center-compensation`.

Файл содержит не только название шрифта. Переход на другой шрифт без соответствующих метрик может оставить неверную оптическую компенсацию. На вложенном `[data-theme="light"]` базовый CSS заново объявляет ряд font-токенов; root-переопределение темы не всегда автоматически проходит через такой остров. Проверяйте вычисленные значения именно внутри него.

## Проектная тема

Задавайте собственные настройки после Core и после выбранной темы. Для глобального акцента изменение `--color-accent` на `:root` пересчитает зависящие от него root-алиасы. Для локального scope задайте также нужные компонентные параметры, если они уже были разрешены на предке. Не меняйте внутренний `--bgc-result` только ради нового основного цвета.

Фон и текст проектной темы должны проверяться в обычном, hover, active, focus, disabled состояниях. Не обещайте доступный контраст на основании имени `primary`, `danger` или номера оттенка.

## SS и TG

**SS** подключает Jost и задаёт три явных режима: `core-theme-ss-light`, `core-theme-ss-dark`, `core-theme-ss-black`. Одной загрузки файла недостаточно: добавьте класс контейнеру или `html`. Общие правила действуют на `[class*="core-theme-ss"]`: насыщенность 430, на ширине до 720 px — 450; предельная desktop-ширина 1420 px.

```html
<link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/core.css">
<link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/theme-ss.css">
<section class="core-solo core-theme-ss-light core-bg core-color core-card">
  <h2 class="core-text core-text-bold">Панель в теме SS</h2>
  <button type="button" class="core-button core-button-primary">Продолжить</button>
</section>
```

Светлая SS: фон `#f1f1f1`, поверхность `#fff`, foreground `#000`, focus `#f6325b`. Тёмная: фон `#181A1B`, поверхность `#232323`, foreground `#fff`, focus `#ff4964`. Чёрная отличается прежде всего фоном `#000`. Класс `.theme-white` — дополнительное оформление контролов, не полный четвёртый режим. Не сочетайте на одном элементе противоречащие режимы Core и SS.

**TG** — набор переменных для `.tg-webapp` и `.core-theme-tg`. Ожидает `--tg-theme-*` от Telegram; SDK не загружает, событие смены темы не слушает и отсутствующие цвета не восполняет.

В этом файле есть несовместимости: `--color-success`, `--color-warning` и `--color-info` ссылаются сами на себя; у danger также есть самоссылка в fallback. Такие циклы не сохраняют базовое значение. Часть параметров `--color-button-*` и `--color-field-*` не используется текущими компонентами, которые читают `--theme-btn-*` и `--theme-input-*`. **Не считайте TG готовой полной темой без проверки и явного сопоставления токенов приложения.**

### E22. Светлая и тёмная области в одной странице

В каждом scope явно задана поверхность; переключатель токенов не рассматривается как самостоятельная заливка.

```html
<div class="core-grid core-grid-2c m-core-grid-1c">
  <section class="core-theme-light core-bg core-color core-card core-col core-border">
    <h3 class="core-text core-text-bold">Светлая область</h3>
    <input class="core-input" aria-label="Светлая область: название" placeholder="Название">
    <button type="button" class="core-button core-button-primary">Продолжить</button>
  </section>
  <section class="core-theme-dark core-bg core-color core-card core-col">
    <h3 class="core-text core-text-bold">Тёмная область</h3>
    <input class="core-input" aria-label="Тёмная область: название" placeholder="Название">
    <button type="button" class="core-button core-button-primary">Продолжить</button>
  </section>
</div>
```

<!-- demo:E22 -->

### E82. Три режима SS

Дополнительный stylesheet примера — theme-ss.css из latest. Каждый режим задаётся классом области, а не глобальным переключателем мануала.

```html
<div class="core-grid core-grid-3c m-core-grid-1c">
  <section class="core-solo core-theme-ss-light core-card core-bg core-color core-col core-g-4x"><h3 class="core-text core-text-bold">SS Light</h3><input class="core-input" placeholder="Название" aria-label="SS Light: название"><button type="button" class="core-button core-button-primary">Продолжить</button></section>
  <section class="core-solo core-theme-ss-dark core-card core-bg core-color core-col core-g-4x"><h3 class="core-text core-text-bold">SS Dark</h3><input class="core-input" placeholder="Название" aria-label="SS Dark: название"><button type="button" class="core-button core-button-primary">Продолжить</button></section>
  <section class="core-solo core-theme-ss-black core-card core-bg core-color core-col core-g-4x"><h3 class="core-text core-text-bold">SS Black</h3><input class="core-input" placeholder="Название" aria-label="SS Black: название"><button type="button" class="core-button core-button-primary">Продолжить</button></section>
</div>
```

<!-- demo:E82 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Тема NK](https://cdn.sdelal.tech/core/latest/theme-nk.css), [SS](https://cdn.sdelal.tech/core/latest/theme-ss.css), [TG](https://cdn.sdelal.tech/core/latest/theme-tg.css).
