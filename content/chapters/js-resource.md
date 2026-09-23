# Асинхронные данные: resource

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Управляет состояниями загрузки поверх StateManager. HTTP-запрос и разбор ответа остаются в loader приложения.

## Подключение

```js
import StateManager from 'https://cdn.sdelal.tech/core/latest/state.js';
import resource from 'https://cdn.sdelal.tech/core/latest/resource.js';
const state = new StateManager();
const projects = resource('projects', async (status, { signal }) => {
  const response = await fetch(`/api/projects?status=${encodeURIComponent(status)}`, { signal });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}, { state, dedupe: false, latest: true, abortPrevious: true });
const off = projects.subscribe(snapshot => console.log(snapshot));
try {
  await projects.load('active');
} catch (error) {
  if (error.name !== 'AbortError') console.error(error);
}
```

`/api/projects` — endpoint приложения, не Core. Для проверки без сервера замените loader своей функцией, возвращающей данные.

## Экспорты и состояние

Default export — `resource(name, loader, options)`. Именованные экспорты — `AsyncResource` и `ResourceManager`.

Фабрика возвращает один ресурс на имя. Повторное создание с тем же именем **не меняет** loader и настройки. StateManager берётся из `options.state`, менеджера или `window.StateManager`.

В StateManager под именем ресурса хранится `{ status, data, error }`. Статусы: `idle`, `loading`, `ready`, `error`. Наличие `initialData`, включая `undefined`, задаёт начальный `ready`; без начальных/сохранённых данных — `idle`.

## Настройки

`dedupe: true`, `latest: true`, `abortPrevious: false`, `loadingDelay: 0`, `keepPreviousData: true` — значения по умолчанию. Дополнительно: `state`, `initialData`, `onSuccess(data, context)`, `onError(error, context)`, `isAbortError(error)`.

`dedupe` возвращает тот же Promise, пока идёт актуальный `load`. **Аргументы не сравниваются.** Для поиска с меняющимся запросом задайте `dedupe: false`; иначе второй запрос получит Promise первого.

`latest` не даёт устаревшей операции записать результат в state. При этом её Promise всё равно разрешается своим результатом или отклоняется своей ошибкой. `abortPrevious` дополнительно прерывает AbortSignal; реальная отмена зависит от loader.

`loadingDelay` задерживает только статус `loading`, не запуск loader. `keepPreviousData` сохраняет данные при загрузке и ошибке.

## API ресурса

- `load(...args)` → Promise; вызывает `loader(...args, context)`.
- `mutate(task)` → Promise; вызывает `task(currentData, context)`. Task должен вернуть новое полное значение данных.
- `get()` → данные; `getState()` → snapshot.
- `set(data)` → данные; синхронно публикует `ready` и делает старые операции неактуальными.
- `subscribe(listener, options)` → функция отписки; правила как у StateManager.
- `cancel()` → boolean; отменяет операции, сохраняет данные, убирает ошибку.
- `reset(data)` → snapshot со статусом `idle`.
- `destroy()` отменяет операции и удаляет ресурс из менеджера.

`context` содержит `signal`, `data`, `resource`, `operation`, `revision`, `args`. Для `mutate` массив `args` пуст. Все ошибки `load/mutate`, включая отмену, нужно обработать через `catch`.

## Менеджер и очистка

`new ResourceManager({ state })` — singleton. Методы: `create(name, loader, options)`, `get(name)`, `has(name)`, `delete(name)`, `clear()`, `destroy()`.

`resource.destroy()` не удаляет ключ и подписки StateManager. При удалении владельца ресурса отдельно вызовите сохранённую отписку; ключ удаляйте только если он больше никому не нужен.

```js
off();
projects.destroy();
state.delete('projects');
```

### E75. Загрузка, ошибка и повтор

Учебный loader возвращает данные после задержки; сетевого запроса нет. Resource управляет состоянием, приложение показывает результат.

```html
<section class="core-card core-col core-g-6x">
  <div class="core-row core-g-4x">
    <button id="load" class="core-button core-button-primary" type="button">Загрузить проекты</button>
    <button id="fail" class="core-button" type="button">Проверить ошибку</button>
  </div>
  <output id="result" class="core-text" aria-live="polite">Ожидание.</output>
</section>
```

```js
import StateManager from 'https://cdn.sdelal.tech/core/latest/state.js';
import resource from 'https://cdn.sdelal.tech/core/latest/resource.js';
const state = new StateManager();
const projects = resource('demo.projects', async fail => {
  await new Promise(resolve => setTimeout(resolve, 350));
  if (fail) throw new Error('Учебная ошибка загрузки');
  return ['Сайт театра', 'Каталог', 'Личный кабинет'];
}, { state, dedupe: false, latest: true });
const off = projects.subscribe(({ status, data, error }) => {
  document.getElementById('result').textContent = status === 'loading' ? 'Загрузка…'
    : status === 'error' ? error.message : status === 'ready' ? data.join(' · ') : 'Ожидание.';
});
const load = fail => projects.load(fail).catch(() => { /* Ошибка уже показана подпиской. */ });
document.getElementById('load').onclick = () => load(false);
document.getElementById('fail').onclick = () => load(true);
// При удалении компонента: off(); projects.destroy();
```

<!-- demo:E75 -->

**Источник:** [resource.js](https://cdn.sdelal.tech/core/latest/resource.js), проверенная версия и SHA-256 — в [манифесте](../reference/source-manifest.json); при обновлении байты модуля не изменились.
