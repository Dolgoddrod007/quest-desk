---
title: Логическая модель данных
sidebar_position: 2
---

# Логическая модель данных


**Ссылка на диаграмму:** [Unidraw](https://unidraw.io/app/board/67f67d09dd588648d3a7?allow_guest=true)

## Сущности и атрибуты

### Users
- **id** — первичный ключ
- **email** — уникальный адрес электронной почты
- **username** — уникальное имя пользователя
- **password** — хеш пароля (bcrypt)
- **role** — роль пользователя (по умолчанию player/master, но не ограничивает)
- **avatar_url** — ссылка на аватар
- **is_active** — флаг активности учётной записи
- **is_staff** — флаг доступа к админ-панели
- **is_superuser** — флаг суперпользователя
- **created_at** — дата и время создания
- **date_joined** — дата присоединения
- **last_login** — дата последнего входа

### Campaigns
- **id** — первичный ключ
- **name** — название партии
- **description** — описание
- **invite_code** — уникальный код приглашения
- **master_id** — внешний ключ к Users (создатель)
- **created_at** — дата создания

### CampaignMembers
- **id** — первичный ключ
- **campaign_id** — внешний ключ к Campaigns
- **user_id** — внешний ключ к Users
- **role** — роль участника (master/player)
- **joined_at** — дата вступления

### Characters
- **id** — первичный ключ
- **campaign_id** — внешний ключ к Campaigns
- **user_id** — внешний ключ к Users (владелец)
- **name** — имя персонажа
- **race** — раса
- **class_name** — класс
- **level** — уровень
- **experience_points** — очки опыта
- **stats** — базовые характеристики (JSONB, содержит strength, dexterity, constitution, intelligence, wisdom, charisma)
- **inventory** — инвентарь (JSONB, массив предметов с названием, количеством, весом)
- **created_at**, **updated_at** — временные метки

### Notes
- **id** — первичный ключ
- **campaign_id** — внешний ключ к Campaigns
- **author_id** — внешний ключ к Users
- **type** — тип заметки (personal, quest, session)
- **title** — заголовок
- **content** — текст заметки
- **is_public** — флаг публичности (видна ли игрокам)
- **status** — статус
- **created_at**, **updated_at** — временные метки

### Sessions
- **id** — первичный ключ
- **campaign_id** — внешний ключ к Campaigns
- **title** — тема сессии
- **description** — описание
- **start_time** — запланированное время начала
- **duration_minutes** — продолжительность в минутах
- **status** — статус (planned, confirmed, cancelled, completed)
- **created_at** — временная метка

### SessionAvailability
- **id** — первичный ключ
- **session_id** — внешний ключ к Sessions
- **user_id** — внешний ключ к Users
- **status** — доступность (available, unavailable, tentative)
- **updated_at** — временная метка последнего изменения

### SessionLogs
- **id** — первичный ключ
- **session_id** — внешний ключ к Sessions
- **campaign_id** — внешний ключ к Campaigns (денормализован для быстрых запросов)
- **author_id** — внешний ключ к Users
- **title** — заголовок записи
- **content** — содержание
- **image_urls** — массив ссылок на изображения (может храниться как JSON)
- **created_at** — временная метка

### LogComments
- **id** — первичный ключ
- **log_id** — внешний ключ к SessionLogs
- **author_id** — внешний ключ к Users
- **content** — текст комментария
- **created_at** — временная метка
- **edited_at** — временная метка редактирования

### NPCTemplates
- **id** — первичный ключ
- **name** — имя шаблона
- **description** — описание
- **stats** — характеристики (JSONB, для гибкости под разные системы)
- **created_by_id** — внешний ключ к Users (создатель)
- **created_at** — временная метка

### EventLogs
- **id** — первичный ключ
- **timestamp** — временная метка события (UTC)
- **user_id** — идентификатор пользователя (может быть NULL для анонимных событий)
- **event_type** — тип события (registration, login_success, login_failure, campaign_created и т.д.)
- **description** — дополнительная информация
- **result** — результат (success/failure)

### UserStatsDaily
- **id** — первичный ключ
- **date** — дата, за которую собрана статистика
- **new_users_count** — количество новых пользователей
- **total_users_count** — общее количество пользователей
- **masters_count** — количество мастеров
- **players_count** — количество игроков
- **calculated_at** — временная метка расчёта

## Связи

- Users 1—* CampaignMembers *—1 Campaigns
- Campaigns 1—* Characters, Notes, Sessions, SessionLogs
- Sessions 1—* SessionAvailability *—1 Users
- SessionLogs 1—* LogComments
- Users 1—* NPCTemplates, Notes (author), SessionLogs (author)
- EventLogs ссылаются на Users по user_id (необязательно)