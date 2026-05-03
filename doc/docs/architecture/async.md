---
title: Асинхронное взаимодействие
sidebar_position: 3
---

# Асинхронное взаимодействие

Сценарий: при создании сессии (UC-06) мастер заполняет форму, сервер сохраняет событие синхронно, а затем асинхронно отправляет email-уведомления выбранным игрокам.

## Диаграмма последовательности

```plantuml
@startuml
actor Master
participant "Quest Desk" as App
participant "PostgreSQL" as DB
participant "RabbitMQ" as MQ
participant "Email Service" as Email
actor Player

Master -> App: POST /sessions (дата, участники)
App -> DB: INSERT session
DB --> App: OK
App --> Master: 201 Created
App -> MQ: publish message {session_id, users}
MQ -> Email: consume and send
Email -> Player: Уведомление о сессии
@enduml