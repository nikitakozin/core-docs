# CSS-взаимодействия, видимость и анимации

[Оглавление](../README.md) · [Правила агента](../AGENTS.md)

## Сначала различите способы скрытия

`core-hide` задаёт display none. `core-show` восстанавливает display из `--d` либо unset; не каждое основание одинаково определяет `--d`, поэтому show не является универсальным восстановлением любого исходного display.

`core-ghost` делает opacity 0 и отключает pointer-events. Это **не** hidden/inert и не гарантирует удаления из клавиатурной навигации или accessibility tree. `core-pointer-none/auto` регулируют только hit testing. Не используйте их как полноценный disabled для формы.

## Родительский hover-trigger

В HTML пишется буквально `core-trigger:hover`. Потомки получают `core-target:show`, `:hide`, `:mute`, `:unmute`, `:add`, `:remove`, `:upscale` или `:upscale-1x`…`-5x`.

Show/hide используют opacity: место сохраняется. Add/remove используют visibility: место также сохраняется; это не вставка/удаление DOM и не display none. Mute/unmute управляют opacity, upscale — transform. Некоторые базовые ветки используют `--opacity` без fallback: для предсказуемого собственного значения можно явно задать `style="--opacity: 1"` на цели.

Триггер реагирует не только на hover при `(hover: hover)`, но и на focus-visible самого элемента или его потомка. Это положительное свойство для клавиатуры, однако оно не заменяет проверку доступности скрытых интерактивных целей.

**Глубина ограничена реализацией:** в исходнике явно повторены правила для трёх уровней вложенных hover-trigger. Четвёртый уровень не следует объявлять поддержанным по аналогии. Вложение имеет семантику области действия; не ожидайте полной независимости всех hover-родителей.

## Hover самого элемента

`core-hover:show`, `:mute`, `:unmute`, `:upscale` и варианты масштаба применяются к самому элементу, а не к его потомкам. Не заменяйте `target` на `hover` механически: это разные роли.

## Управляемое поведение

Для раскрытия блоков используйте [CollapseManager](js-collapse.md), для очереди и отмены анимаций — [MotionManager](js-motion.md). Это разные модули: CollapseManager использует собственные классы и таймеры, а не экземпляр MotionManager.

## Анимации

Префикс `core-animate:NAME` и ряд коротких алиасов запускают эффекты. Подтверждённые имена: fade-in/out, fade-in/out-top/right/bottom/left, height-grow, shake, slide-shake-left/right, fade-pulsing, size-pulsing, pulse, pulse-in, mirror-x/y, spin. Длительность и сила берутся из `--core-animate-time` и `--core-animate-strength`.

`core-animate-time-0.5x/1x/2x/3x/4x/5x/6x/7x/8x/9x/10x` соответствуют 0,15 / 0,3 / 0,475 / 0,754 / 1,195 / 1,893 / 3 / 4,5 / 6 / 8 / 10 s. Это специально заданная нелинейная шкала.

В v185 короткие анимационные алиасы удалены. Используйте `core-animate:spin`, `:pulse`, `:pulse-in`, `:shake`, `:slide-shake-left/right`, `:fade-pulsing`, `:size-pulsing`, `:mirror-x/y`. Классы `core-mirror-x/y` остаются статическими отражениями, а не анимациями. Height-grow анимирует max-height до большой viewport-величины; это не точный замер высоты контента.

## Загрузка и reduced motion

`core-loading` добавляет spinner, обрезает переполнение и отключает pointer-events. `core-loading-overlay` — отдельное оформление перекрытия. Для процесса нужны также `aria-busy`, доступный статус и защита от повторного запуска. Правило `prefers-reduced-motion` в CSS есть только у scroll-hint и не отключает все анимации. В E58 приложение учитывает настройку через matchMedia и переключает штатный класс, без собственного CSS.

### E56. Появление пояснения при hover и клавиатурном фокусе

В примере появляется только поясняющий текст; критичное действие не спрятано за hover.

```html
<div class="core-card core-col core-trigger:hover" tabindex="0">
  <strong class="core-text core-text-bold">Материалы проекта</strong>
  <p class="core-text">Наведите указатель или переведите фокус клавишей Tab.</p>
  <span class="core-text core-text-s core-target:show">В этой области действует один hover-trigger.</span>
</div>
```

<!-- demo:E56 -->

### E57. Вложенные области взаимодействия

Это два уровня из трёх явно описанных в CSS. Четвёртый уровень не входит в подтверждённый контракт.

```html
<div class="core-card core-col core-trigger:hover" tabindex="0">
  <span class="core-text core-target:show">Активен внешний блок</span>
  <div class="core-card core-bg core-col core-trigger:hover core-border" tabindex="0">
    <span class="core-text">Внутренняя область</span>
    <span class="core-text core-text-s core-target:show">Активен внутренний блок</span>
  </div>
</div>
```

<!-- demo:E57 -->

### E58. Анимация с учётом reduced motion без собственного CSS

Приложение добавляет штатную анимацию Core, только когда пользователь разрешает движение. Изменение системной настройки учитывается без перезагрузки. Собственных CSS-правил нет.

```html
<div class="core-row core-y-center">
  <span class="core-icon-spinner core-icon-l core-animate-time-4x" id="progress-icon" aria-hidden="true"></span>
  <span class="core-text" role="status">Идёт синхронизация</span>
</div>
```

```js
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const icon = document.getElementById('progress-icon');
const update = () => icon.classList.toggle('core-animate:spin', !preference.matches);
preference.addEventListener('change', update);
update();
```

<!-- demo:E58 -->

**Источник:** [Исходный Core CSS](https://cdn.sdelal.tech/core/latest/core.css).
