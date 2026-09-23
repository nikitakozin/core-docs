# События: EventEmitter

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Передаёт разовые события. В отличие от StateManager не хранит последнее значение для новых подписчиков.

## Подключение

```js
import EventEmitter from 'https://cdn.sdelal.tech/core/latest/event.js';
const events = new EventEmitter();
const off = events.on('project:saved', project => console.log(project.id));
events.emitImmediate('project:saved', { id: 42 });
off();
```

Конструктор — singleton; экземпляр доступен как `window.EventEmitter`. Создавайте его **до** FormManager и SliderManager.

## API

- `on(event, callback)` → функция отписки.
- `off(event, callback)` удаляет обработчик; `listenerCount(event)` возвращает число обработчиков.
- `emit(event, ...args)` ставит вызов в очередь. Таймер запускается при первом событии и срабатывает через 200 мс.
- `emitImmediate(event, ...args)` вызывает обработчики синхронно.
- `emitWithAsyncResponse(event, ...args)` → Promise с массивом результатов `allSettled`.

Очередь **не объединяет одинаковые события**: каждый вызов `emit` сохраняет свои аргументы. Разные имена обрабатываются группами, поэтому глобальный порядок перемешанных событий не гарантирован. Для немедленного действия используйте `emitImmediate`.

## Ответы подписчиков

```js
const off = events.on('editor:can-close', (payload, { accept, reject }) => {
  if (payload.saved) accept();
  else reject();
});
const answers = await events.emitWithAsyncResponse('editor:can-close', { saved: true });
const allowed = answers.every(item => item.status === 'fulfilled');
off();
```

Последний аргумент listener — `{ accept, reject }`. `accept()` разрешает ответ строкой `'accept'`, `reject()` отклоняет строкой `'reject'`. Их аргументы не передаются наружу. Без слушателей результат — `[]`.

Сам эмиттер не задаёт тайм-аут. Если подписчик не вызовет ни один callback, ожидание не завершится. Возвращённый listener Promise не ожидается; обработайте его ошибки внутри listener. FormManager добавляет собственный тайм-аут на этапе подтверждения отправки.

## Очистка

Метода `destroy()` нет. Храните функции отписки и вызывайте их при удалении компонента. Не изменяйте внутренние `listeners` и `pendingEvents` напрямую.

### E74. Очередь не теряет вызовы

Нажатие отправляет два события. Оба попадут в журнал после обработки очереди, а не только последнее.

```html
<div class="core-card core-col core-g-6x">
  <button type="button" id="send" class="core-button core-button-primary">Отправить два события</button>
  <output id="log" class="core-text" aria-live="polite">Событий пока нет.</output>
</div>
```

```js
import EventEmitter from 'https://cdn.sdelal.tech/core/latest/event.js';
const events = new EventEmitter();
const log = [];
const off = events.on('app:action', name => {
  log.push(name);
  document.getElementById('log').textContent = log.slice(-8).join(' → ');
});
document.getElementById('send').onclick = () => {
  events.emit('app:action', 'Первое');
  events.emit('app:action', 'Второе');
};
// При удалении компонента: off();
```

<!-- demo:E74 -->

**Источник:** [event.js](https://cdn.sdelal.tech/core/latest/event.js), снимок v185 от 21.09.2026; файл совпадает с проверенным v182.
