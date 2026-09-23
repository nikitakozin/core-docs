# Состояние: StateManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Хранит текущие значения в памяти и синхронно уведомляет подписчиков. Не сохраняет данные в браузере и не связывает их с DOM.

## Подключение

```js
import StateManager from 'https://cdn.sdelal.tech/core/latest/state.js';
const state = new StateManager();
state.set('filters', { status: 'all' });
const unsubscribe = state.subscribe('filters', (value, previous) => {
  console.log(value, previous);
});
state.update('filters', value => ({ ...value, status: 'active' }));
// При удалении компонента:
unsubscribe();
```

Конструктор возвращает один экземпляр. После создания он доступен как `window.StateManager`; сам импорт экземпляр не создаёт.

## API

- `has(name)` → boolean. Отличает отсутствующий ключ от сохранённого `undefined`.
- `get(name)` → значение или `undefined`.
- `set(name, value)` → boolean: изменилось ли значение. Сравнение — `Object.is`.
- `update(name, updater)` → результат `set`; updater получает текущее значение.
- `subscribe(name, listener, { immediate = true } = {})` → функция отписки. Listener получает `(value, previousValue)`.
- `unsubscribe(name, listener)` и `delete(name)` → boolean.
- `clear()` удаляет значения; `listenerCount(name)` считает подписчиков.

## Поведение

Новый подписчик сразу получает сохранённое значение; второго аргумента при этом нет (`undefined`). При `{ immediate: false }` первого вызова нет.

Объекты хранятся по ссылке. Изменение объекта на месте и повторный `set` с той же ссылкой не уведомят подписчиков. Создавайте новый объект или массив.

`delete` вызывает подписчиков с `(undefined, previousValue)`. `clear` делает то же для каждого ключа. Подписки при удалении данных сохраняются. Ошибка одного обработчика записывается в консоль и не прерывает остальных.

## Очистка

Метода `destroy()` нет. Отписывайте обработчики явно. Не вызывайте `clear()` из отдельного компонента: это удалит состояния всего приложения.

Для разовых фактов используйте [EventEmitter](js-event.md), для загрузки и гонок запросов — [resource](js-resource.md).

### E73. Счётчик без перерисовки компонента

StateManager хранит число. Обновление output и обработчики кнопок — код приложения.

```html
<div class="core-card core-row core-y-center core-g-6x">
  <button type="button" id="minus" class="core-button" aria-label="Уменьшить">−</button>
  <output id="count" class="core-text core-text-xl core-text-bold" aria-live="polite"></output>
  <button type="button" id="plus" class="core-button" aria-label="Увеличить">+</button>
  <button type="button" id="reset" class="core-button core-button-transparent">Сбросить</button>
</div>
```

```js
import StateManager from 'https://cdn.sdelal.tech/core/latest/state.js';
const state = new StateManager();
state.set('count', 0);
const off = state.subscribe('count', value => {
  document.getElementById('count').textContent = value;
});
document.getElementById('plus').onclick = () => state.update('count', value => value + 1);
document.getElementById('minus').onclick = () => state.update('count', value => value - 1);
document.getElementById('reset').onclick = () => state.set('count', 0);
// При удалении компонента: off();
```

<!-- demo:E73 -->

**Источник:** [state.js](https://cdn.sdelal.tech/core/latest/state.js), проверенная версия и SHA-256 — в [манифесте](../reference/source-manifest.json); при обновлении байты модуля не изменились.
