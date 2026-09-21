# Навигация: NavigationManager

[JavaScript](javascript.md) · [Правила агента](../AGENTS.md)

Согласует URL, History API и именованные состояния. Это не роутер страниц: менеджер не перехватывает ссылки, не загружает HTML и не рендерит интерфейс.

## Подключение и адаптер

```js
import NavigationManager from 'https://cdn.sdelal.tech/core/latest/navigation.js';
const navigation = new NavigationManager();
const unregister = navigation.register('filters', {
  fromUrl(url) {
    return { status: url.searchParams.get('status') || 'all' };
  },
  toUrl(url, value) {
    if (!value || value.status === 'all') url.searchParams.delete('status');
    else url.searchParams.set('status', value.status);
    return url;
  }
});
const off = navigation.subscribe('filters', (value, previous, info) => {
  console.log(value, info.cause);
});
navigation.navigate('filters', { status: 'active' });
```

Запускайте пример на странице HTTP(S). History API не следует проверять как часть `srcdoc`-демо: URL такого документа отличается от URL приложения.

## Настройки и адаптер

Конструктор — singleton; `window.NavigationManager` появляется после создания. Настройки: `stateKey: '__coreNavigation'`, `eventName: 'core:navigation'`.

`fromUrl(url, storedValue, historyState)` возвращает состояние namespace; `undefined` удаляет его. `toUrl(url, value, namespaces)` может изменить переданный URL и вернуть URL/строку. Регистрация сразу синхронизирует состояние.

Без адаптера значение хранится в `history.state.__coreNavigation`. Чужие поля объекта `history.state` сохраняются. При наличии адаптера его `fromUrl` определяет состояние после записи URL.

## API

- `register(namespace, adapter)` → функция удаления адаптера. Она не удаляет сохранённое состояние.
- `get(namespace)` → текущее значение.
- `navigate(namespace, value, options)` → boolean; добавляет запись истории.
- `replace(namespace, value, options)` → boolean; заменяет текущую запись.
- `subscribe(namespace, listener, { immediate = true } = {})` → функция отписки; listener получает `(value, previousValue, info)`.
- `subscribe(listener)` → глобальная подписка на `info`, **без немедленного первого вызова**.
- `unsubscribe(namespace, listener)` → boolean; `refresh(cause = 'refresh')` → boolean.
- `destroy()` снимает слушатели и возвращает исходные методы history, если они всё ещё обёрнуты этим экземпляром.

Опции записи: `url`, `historyState`, `title`. Явный `url` обходит `toUrl`. Дублирующая запись с теми же URL и state возвращает `false`.

Удаление значения:

```js
navigation.replace('filters', NavigationManager.DELETE);
```

Чтобы удаление не восстановил `fromUrl`, адаптер должен учитывать очищенный URL.

## События и ограничения

Менеджер оборачивает `history.pushState/replaceState` и слушает `popstate`, `hashchange`, `pageshow`. `info` содержит `url`, `previousUrl`, `cause`, `historyState`; DOM-событие `core:navigation` отправляется на `window`, его `detail` — тот же объект.

Сохраняйте в history сериализуемые данные и используйте URL того же origin. Изменение состояния не означает, что данные страницы уже загружены.

PopupManager использует hash и отдельное поле `history.state.popups`. Не назначайте тот же hash двум независимым маршрутам. Адаптер query-параметров должен сохранять остальные части URL.

```js
off();
unregister();
// Только при завершении работы владельца общего менеджера:
navigation.destroy();
```

**Источник:** [navigation.js](https://cdn.sdelal.tech/core/latest/navigation.js), архив `core.zip` от 20.09.2026.
