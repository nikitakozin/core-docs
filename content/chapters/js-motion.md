# Анимации: MotionManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Запускает CSS-анимации и Web Animations API, ожидает transition и поддерживает отмену.

## Подключение

```js
import MotionManager from 'https://cdn.sdelal.tech/core/latest/motion.js';
const motion = new MotionManager();
const panel = document.querySelector('#panel');
const result = await motion.animate(panel, 'core-animate:fade-in');
console.log(result.status);
```

Конструктор — singleton; доступен как `window.MotionManager`. Настройки: `reducedMotionQuery: '(prefers-reduced-motion: reduce)'`, `timeoutPadding: 50`.

## API

- `animate(element, classesOrKeyframes, options = {})` → Promise `{ status, element }`.
- `transitionFinished(element, options = {})` → такой же Promise.
- `stagger(elements, animation, options = {})` → Promise массива результатов. `animation` может быть функцией `(element, index)`.
- `cancel(element)` → boolean; `cancelAll()` отменяет зарегистрированные `animate`.
- `destroy()` отменяет `animate`, удаляет глобальную ссылку и сбрасывает singleton.
- `reducedMotion` — текущий результат media query.

Статус: `finished`, `cancelled` или `skipped`. Отмена не отклоняет Promise. Ошибочный DOM-аргумент выбрасывает TypeError.

## CSS-анимации

Передайте строку классов или массив строк. Опции: `delay` в мс, `fillMode: 'both'`, `restart: true`, `cleanup: true`, `timeout`, `signal`, `cancelPrevious: true`, `reducedMotion: 'skip'`.

Классы добавляются на время анимации. `cleanup: false` оставляет их после завершения. По умолчанию новая анимация отменяет предыдущую на том же элементе. `{ reducedMotion: 'allow' }` разрешает эффект несмотря на системную настройку.

Ожидание заканчивается по `animationend/animationcancel` или вычисленному duration + delay + 50 мс. Число повторов `animation-iteration-count` в расчёт не входит. Для сложного набора анимаций задайте timeout и проверьте результат. `restart` снимает и возвращает классы без принудительного layout, поэтому перезапуск уже работающей CSS-анимации не гарантирован.

## Web Animations API

```js
await motion.animate(panel, [
  { opacity: 0, transform: 'translateY(8px)' },
  { opacity: 1, transform: 'translateY(0)' }
], { duration: 180, easing: 'ease-out', timeout: 500, cleanup: true });
```

Объект или массив объектов трактуется как keyframes. Остальные опции передаются `element.animate`, кроме управляющих `cancelPrevious`, `cleanup`, `reducedMotion`, `signal`, `timeout`.

Здесь `cleanup` по умолчанию **не включён**, а аварийный тайм-аут существует только при явном `timeout`. Не оставляйте бесконечную WAAPI-анимацию в ожидании без отмены. При reduced motion duration и delay становятся нулевыми, результат — `skipped`.

## Transition и stagger

```js
const controller = new AbortController();
const finished = motion.transitionFinished(panel, {
  property: 'transform', timeout: 400, signal: controller.signal
});
panel.classList.add('app-panel-open'); // Класс приложения.
await finished;
```

Вызывайте ожидание рядом с изменением состояния. Без transition и без явного timeout результат — `skipped`; явный timeout завершает ожидание со статусом `finished`. `cancelAll()` не управляет отдельным `transitionFinished`; для него используйте AbortSignal.

`stagger` добавляет задержку: исходный `delay + index × stagger`, по умолчанию шаг 60 мс. Transform эффекта может конфликтовать с позиционированием Core: анимируйте внутренний элемент, а не позиционирующую обёртку.

### E78. Анимация с отменой

MotionManager запускает Web Animations API. При reduced motion движение пропускается. Кнопка отмены возвращает cancelled.

```html
<div class="core-card core-col core-g-6x">
  <div class="core-row core-g-4x">
    <button type="button" id="animate" class="core-button core-button-primary">Анимировать</button>
    <button type="button" id="cancel" class="core-button">Отменить</button>
  </div>
  <div id="tile" class="core-card core-bg-surface-alt core-text">Карточка</div>
  <output id="motion-state" class="core-text" aria-live="polite">Ожидание.</output>
</div>
```

```js
import MotionManager from 'https://cdn.sdelal.tech/core/latest/motion.js';
const motion = new MotionManager();
const tile = document.getElementById('tile');
const result = document.getElementById('motion-state');
document.getElementById('animate').onclick = async () => {
  result.textContent = 'Анимация…';
  const { status } = await motion.animate(tile, [
    { transform: 'translateX(0)', opacity: 1 },
    { transform: 'translateX(24px)', opacity: 0.55 },
    { transform: 'translateX(0)', opacity: 1 }
  ], { duration: 800, easing: 'ease-in-out', cleanup: true });
  result.textContent = status;
};
document.getElementById('cancel').onclick = () => motion.cancel(tile);
// При удалении владельца: motion.destroy();
```

<!-- demo:E78 -->

**Источник:** [motion.js](https://cdn.sdelal.tech/core/latest/motion.js), снимок v185 от 21.09.2026; файл совпадает с проверенным v182.
