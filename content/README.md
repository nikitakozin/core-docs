# Core — руководство

[Открыть HTML](https://nikitakozin.github.io/core-docs/) · [Правила агента](AGENTS.md) · [Разработка и сборка](https://github.com/nikitakozin/core-docs#readme)

42 главы и 87 примера. Проверенная версия, дата и хеши указаны в [манифесте](reference/source-manifest.json). Runtime использует изменяемый latest; изменения API и границы проверки — в [источниках и проверках](chapters/verification.md).

## Локально для агента

[Скачайте ZIP](https://nikitakozin.github.io/core-docs/core-agent.zip) и поместите папку `core` из архива в `docs/` вашего проекта. Получится `docs/core/AGENTS.md`. Дополните существующий корневой `AGENTS.md` проекта блоком из [инструкции подключения](chapters/agent-workflow.md), затем отправьте агенту приведённый там первый запрос.

В комплекте только Markdown и JSON; сборка и установка зависимостей для его использования не нужны. Все справочники доступны локально. При обновлении заменяйте только `docs/core/`, сохраняя собственные инструкции в корневом `AGENTS.md`. Core в приложении подключается с CDN и требует сети.

## Разделы

- [Что такое Core и где он применим](chapters/overview.md)
- [Подключение и первый интерфейс](chapters/start.md)
- [Архитектура: пять типов правил](chapters/architecture.md)
- [Наследование, вложенность и каскад](chapters/inheritance.md)
- [Токены и шкалы размеров](chapters/tokens.md)
- [Компоновки: секция, строка, колонка, сетка](chapters/layout.md)
- [Отступы, gap и радиусы](chapters/spacing.md)
- [Ширины, высоты и дробные колонки](chapters/dimensions.md)
- [Адаптивность и точные префиксы](chapters/responsive.md)
- [Позиционирование, края и скруглённые углы](chapters/position.md)
- [Цвет, прозрачность, границы и тени](chapters/colors.md)
- [Светлая, тёмная и проектные темы](chapters/themes.md)
- [Текст, заголовки и оптическое выравнивание](chapters/typography.md)
- [Контентная область: статьи и HTML из редактора](chapters/content.md)
- [Кнопки и группы действий](chapters/buttons.md)
- [Бирки, метки и компактные действия](chapters/badges.md)
- [Иконки: маски, размеры и адаптивность](chapters/icons.md)
- [Поля, подписи и базовая форма](chapters/forms.md)
- [Составное поле: core-input-box](chapters/input-box.md)
- [Checkbox, radio и сегментированный выбор](chapters/choices.md)
- [Списки и таблицы](chapters/lists-tables.md)
- [Изображения, пропорции и обрезка](chapters/media.md)
- [CSS-взаимодействия, видимость и анимации](chapters/interaction.md)
- [Всплывающие окна: CSS-анатомия](chapters/popups.md)
- [JavaScript: подключение и выбор модуля](chapters/javascript.md)
- [Состояние: StateManager](chapters/js-state.md)
- [События: EventEmitter](chapters/js-event.md)
- [Асинхронные данные: resource](chapters/js-resource.md)
- [Навигация: NavigationManager](chapters/js-navigation.md)
- [Раскрывающиеся блоки: CollapseManager](chapters/js-collapse.md)
- [Поведение полей: FieldManager](chapters/js-field.md)
- [Формы: FormManager](chapters/js-form.md)
- [Анимации: MotionManager](chapters/js-motion.md)
- [Всплывающие окна: PopupManager](chapters/js-popup.md)
- [Прокручиваемые ленты: SliderManager](chapters/js-slider.md)
- [Рецепты составных интерфейсов](chapters/recipes.md)
- [Доступность, совместимость и интеграция](chapters/accessibility.md)
- [Ограничения и реестр рисков](chapters/pitfalls.md)
- [Порядок работы агента и Harness](chapters/agent-workflow.md)
- [Индекс классов и примеров](https://nikitakozin.github.io/core-docs/chapters/class-index.md)
- [Справочник токенов](chapters/token-reference.md)
- [Источники и проверки](chapters/verification.md)
