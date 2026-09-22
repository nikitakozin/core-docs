# Прокручиваемые ленты: SliderManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Добавляет кнопки управления к нативно прокручиваемому контейнеру. Все непосредственные дети контейнера считаются слайдами.

## Разметка и запуск

```html
<div id="stages" data-slider class="core-slider core-g-8x">
  <article class="core-card core-w-150x">Исследование</article>
  <article class="core-card core-w-150x">Прототип</article>
  <article class="core-card core-w-150x">Дизайн</article>
</div>
<div class="core-row">
  <button type="button" class="core-button" data-slider-trigger="stages" data-slider-prev>Назад</button>
  <button type="button" class="core-button" data-slider-trigger="stages" data-slider-next>Далее</button>
</div>
<script type="module">
  import EventEmitter from 'https://cdn.sdelal.tech/core/latest/event.js';
  import SliderManager from 'https://cdn.sdelal.tech/core/latest/slider.js';
  const events = new EventEmitter();
  const sliders = new SliderManager();
</script>
```

**EventEmitter обязателен до создания SliderManager.** В коде есть вызовы `this.emitter.emit` без проверки, несмотря на мягкое предупреждение конструктора. SliderManager — singleton, доступный как `window.SliderManager`.

## Атрибуты

Контейнер: `id`, `data-slider`; ID может быть взят из значения `data-slider`. Предпочитайте настоящий HTML `id`: он используется в именах событий.

`data-slider-type="col"` меняет ось расчёта. Вертикальную компоновку и ограниченную высоту всё равно задаёт CSS приложения; одного атрибута недостаточно.

`core-slider-center` центрирует целевой слайд. `data-slider-animate` на контейнере или триггере включает плавную прокрутку. `data-slider-save` на контейнере либо предке включает сохранение программно выбранного индекса под ключом `sliderManager`.

У каждой управляющей кнопки нужен `data-slider-trigger="ID"` и одно действие: `data-slider-next`, `data-slider-prev` либо `data-slider-goto="target"`.

`target`: индекс **с нуля**, строка индекса, `next`, `prev`, `start`, `end`, `+2`, `-2` или HTML ID слайда. Триггеры обрабатываются делегированно; новым кнопкам регистрация не нужна.

## API

- `autoInit()`, `refresh()` сканируют контейнеры.
- `registerSlider(id, element)` перечитывает непосредственных детей и снимает старые observer/слушатели этого слайдера.
- `goTo(id, target, { animateScroll } = {})` меняет позицию. Не возвращает Promise.
- `getCurrentSlides(id)` → отсортированный массив DOM-элементов, видимых более чем на 95%; не индексы.
- `on(event, listener)`, `off(event, listener)`, `emit(event, ...args)` делегируют события. **`on` не возвращает функцию отписки.**
- `destroy()` снимает основные обработчики, отключает observers и сбрасывает singleton; глобальная ссылка остаётся.

Событие `sliderChange:HTML_ID` передаёт `{ slider, currentSlides }`, где `currentSlides` — Set элементов. Оно идёт через отложенный EventEmitter и не является сигналом окончания прокрутки.

```js
const listener = ({ currentSlides }) => console.log(currentSlides.size);
sliders.on('sliderChange:stages', listener);
// При удалении владельца:
sliders.off('sliderChange:stages', listener);
```

## Настройки и ограничения

`globalAnimation: false`, `smoothScrollSpeed: 1.8`, `smoothScrollEasing: 90`, `storageKey: 'sliderManager'` — основные параметры. Первый задаёт программную анимацию, второй — скорость во viewport/с, третий — замедление в мс. Клик без `data-slider-animate` передаёт `animateScroll: false`; не полагайтесь на `globalAnimation` для таких кнопок.

Ввод указателем, касанием или колесом отменяет программную анимацию. На coarse-pointer используется нативный smooth scroll. `prefers-reduced-motion` сам SliderManager не проверяет: не включайте плавность при reduced motion в коде приложения.

Положение сохраняется после `goTo`, не после каждой ручной прокрутки. После добавления слайдов вызовите `refresh()`. Переименование trigger-атрибутов поддерживается частично: значения читаются через жёстко заданные `dataset.sliderTrigger/sliderGoto`.

### E79. Этапы проекта в прокручиваемой ленте

Лента остаётся нативно прокручиваемой. EventEmitter создаётся раньше SliderManager. Плавность отключена.

```html
<div class="core-col core-g-6x">
  <div id="stages" data-slider class="core-slider core-g-8x">
    <article class="core-card core-col core-w-128x core-g-4x"><span class="core-badge">01</span><h3 class="core-text core-text-bold">Исследование</h3><p class="core-text">Интервью и структура.</p></article>
    <article class="core-card core-col core-w-128x core-g-4x"><span class="core-badge">02</span><h3 class="core-text core-text-bold">Прототип</h3><p class="core-text">Сценарии и состояния.</p></article>
    <article class="core-card core-col core-w-128x core-g-4x"><span class="core-badge">03</span><h3 class="core-text core-text-bold">Дизайн</h3><p class="core-text">Компоненты и макеты.</p></article>
    <article class="core-card core-col core-w-128x core-g-4x"><span class="core-badge">04</span><h3 class="core-text core-text-bold">Разработка</h3><p class="core-text">Код и проверки.</p></article>
  </div>
  <div class="core-row core-g-4x">
    <button type="button" class="core-button" data-slider-trigger="stages" data-slider-prev>Назад</button>
    <button type="button" class="core-button" data-slider-trigger="stages" data-slider-next>Далее</button>
    <button type="button" class="core-button core-button-transparent" data-slider-trigger="stages" data-slider-goto="start">В начало</button>
  </div>
</div>
```

```js
import EventEmitter from 'https://cdn.sdelal.tech/core/latest/event.js';
import SliderManager from 'https://cdn.sdelal.tech/core/latest/slider.js';
const events = new EventEmitter();
const sliders = new SliderManager();
// При удалении владельца: sliders.destroy();
```

<!-- demo:E79 -->

**Источник:** [slider.js](https://cdn.sdelal.tech/core/latest/slider.js), снимок v185 от 21.09.2026; файл совпадает с проверенным v182.

## Совместимость с CSS v185

JS по умолчанию использует удалённые классы `core-slide-shake-left/right`. Для обратной связи на краях задайте актуальные имена при первом создании singleton:

```js
const sliders = new SliderManager({
  endLeftAnimation: 'core-animate:slide-shake-left',
  endRightAnimation: 'core-animate:slide-shake-right'
});
```

Прокрутка не зависит от наличия этих анимаций. Не добавляйте старые CSS-алиасы в приложение ради компенсации несовпадения версий.
