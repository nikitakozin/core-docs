# Светлая, тёмная и проектные темы

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

В верхней панели мануала можно выбрать базовый Core, NK, SS или NKUI и отдельно светлый/тёмный режим. NKUI доступна начиная с Core v191. TG предназначена для Telegram и в переключатель сайта не включена. Оформление и режим сохраняются в localStorage; примеры получают тему без перезагрузки и сохраняют введённые значения. Если файл темы не загрузился, остаётся прежнее оформление.

## Два уровня тем

**Режим цвета:** `.core-theme-light` и `.core-theme-dark`. Светлые токены заданы также на `:root`. Атрибут `data-theme` в CSS v190 больше не выбирает режим. Тёмный класс переопределяет семантику цветов и параметры компонентов.

**Файл оформления:** например, `theme-nk.css`, меняющий root-типографику. Это другая ось настройки. По имени файла нельзя заключать, что существует `.core-theme-nk`. В NK-файле такого переключателя нет.

## Как задавать режим

Для целой страницы поместите класс режима на `html`. Для вложенной области используйте `core-theme-dark` или `core-theme-light`; добавьте `core-bg` и `core-color` либо компонент поверхности. Сам переключатель токенов не обязан рисовать фон произвольного `div`.

Переключение класса — обычный код приложения; отдельный API Core для этого не нужен:

```js
// Это код приложения, не экспорт Core.
function setTheme(mode) {
  if (mode !== 'light' && mode !== 'dark') {
    throw new TypeError('Неизвестный режим темы');
  }
  document.documentElement.classList.toggle("core-theme-light", mode === "light");
  document.documentElement.classList.toggle("core-theme-dark", mode === "dark");
}
```

Сохранение выбора, синхронизация с системной темой и начальное состояние до первой отрисовки остаются задачами приложения. StateManager хранит значения только в памяти; он не переключает тему и не пишет её в localStorage.

## Базовые цвета

Светлый background `#fff`, foreground `#000`, surface `#f1f1f1`. Тёмный background `#181A1B`, foreground `#fff`, surface `#222525`. Акцент в обоих режимах `#B2FF35`. Link: `#1f11d8` в светлом и `#5370ff` в тёмном. Focus: `#ff883e`. Success/danger/warning отличаются по режимам; выбор цвета не заменяет текстового сообщения.

## NK: Inter и метрики

`theme-nk.css` подключает Inter, задаёт основное семейство `var(--font-primary-local, "Inter"), sans-serif`, метрики primary: unitsPerEm 2048, ascender 1984, descender 494, sxHeight 1118, sCapHeight 1490, коэффициент line-height 1,15. Файл всё ещё объявляет `--rem-base: 17px`, но CSS v190 использует `--f-s-base: 18px`: старый токен больше не меняет масштаб интерфейса. Для другого масштаба задайте `--f-s-base` на корневой области с объявлениями шкалы.

Файл содержит и шрифт, и его метрики. Замена семейства без метрик может нарушить оптическую компенсацию. Вложенный `.core-theme-light` заново объявляет базовые font-токены: проверьте computed styles внутри такой области, даже если тема подключена глобально.

## NKUI: палитра и компактные контролы

Подключите `theme-nkui.css` после `core.css` и задайте обычный режим `core-theme-light` или `core-theme-dark`. Отдельного класса `core-theme-nkui` нет. Тема сама импортирует `latest/theme-nk.css` со шрифтом Inter; отдельные CSS/JS библиотеки NKUI не нужны. Даже файл NKUI из `v191/` содержит импорт NK из изменяемого `latest/`: закрепление URL одного файла не закрепляет все его зависимости.

```html
<link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/core.css">
<link rel="stylesheet" href="https://cdn.sdelal.tech/core/latest/theme-nkui.css">
<section class="core-solo core-theme-light core-bg core-color core-card core-col">
  <h2 class="core-text core-text-bold">Панель в теме NKUI</h2>
  <input class="core-input" aria-label="Название" placeholder="Название">
  <button type="button" class="core-button core-button-primary">Продолжить</button>
</section>
```

Светлый фон — `#fff`, основной текст — `#0d0d0d`, акцент — `#93c5fd`. Тёмный фон — `#2d2d2b`, текст — `#f9f9f7`, акцент — `#cc7d5e`. Палитра, метрики Inter и алиасы компонентов объявлены в каждом scope, поэтому вложенные светлые и тёмные области можно сочетать.

Шкала компактнее базового Core: `--f-s-base: 14px`, но текстовый размер m явно равен 13 px; xs/s/l/xl/xxl — 11/12/16/20/28 px. Обычные кнопки и поля имеют высоту 36 px, варианты xs/s/l — 24/28/44 px, базовый радиус — 8 px. Обычная кнопка оформлена как secondary, `core-button-transparent` — как ghost; primary использует основной цвет текста, accent — цвет акцента. Danger получает мягкий фон и красный текст.

`core-radio-group` и `core-radio-group-inline` оформляют горизонтальный выбор сегментами. Сохраняйте разметку `label.core-button-radio > input[type="radio"] + .core-radio-label` и одинаковый `name`: это нативная radio-группа с управлением стрелками, а не tabs API. Минимальная высота сегмента по умолчанию 40 px, в группах xs/s/l — 24/28/44 px; длинные подписи переносятся и увеличивают высоту. Проверьте доступную ширину и disabled-состояния конкретной группы.

Тема сохраняет стрелку disabled-select и видимый keyboard focus, уменьшает непрозрачность недоступных контролов, отключает переходы контролов при `prefers-reduced-motion: reduce`. Собственные токены `--nkui-*` и переопределения Core перечислены в [справочнике токенов](https://nikitakozin.github.io/core-docs/reference/tokens.json).

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

Светлая SS: фон `#f1f1f1`, поверхность `#fff`, foreground `#000`, focus `#f6325b`. Тёмная: фон `#181A1B`, поверхность `#232323`, foreground `#fff`, focus `#ff4964`. Чёрная отличается прежде всего фоном `#000`. В v190 светлая SS использует `--b-r-8x` для полей и кнопок вместо `--b-r-5\.5x`. Класс `.theme-white` — дополнительное оформление контролов, не четвёртый режим. Не сочетайте противоречащие режимы Core и SS на одном элементе.

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

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css). [Тема NK](https://cdn.sdelal.tech/core/latest/theme-nk.css), [NKUI](https://cdn.sdelal.tech/core/latest/theme-nkui.css), [SS](https://cdn.sdelal.tech/core/latest/theme-ss.css), [TG](https://cdn.sdelal.tech/core/latest/theme-tg.css).
