# 🏗️ System Architecture

This document explains the **overall architecture** of the Async Payment Gateway system.  
The design follows **real-world payment gateway patterns** used in production systems.

---

## 📌 Architecture Goals

- Non-blocking payment processing
- High scalability using background workers
- Reliable webhook delivery
- Clear separation of responsibilities
- Easy monitoring and maintenance

---

## 🧱 High-Level Architecture Diagram

```mermaid
graph TD
    M[Merchant Website / App]
    SDK[Checkout SDK]
    UI[Checkout UI]
    API[API Server<br/>Node.js + Express]
    REDIS[(Redis Queue)]
    WORKER[Worker Service<br/>Bull Jobs]
    DB[(PostgreSQL)]
    WH[Merchant Webhook Endpoint]

    M -->|Integrates| SDK
    SDK -->|Opens| UI
    UI -->|Create Payment| API
    M -->|Create Order| API

    API -->|Store Data| DB
    API -->|Enqueue Jobs| REDIS

    WORKER -->|Consume Jobs| REDIS
    WORKER -->|Update Status| DB
    WORKER -->|Send Events| WH
```
## 🔄 Payment Processing Flow
```mermaid

sequenceDiagram
    participant Merchant
    participant API
    participant Redis
    participant Worker
    participant DB
    participant Webhook

    Merchant->>API: Create Payment
    API->>DB: Save payment (pending)
    API->>Redis: Add payment job
    API-->>Merchant: Response (pending)

    Worker->>Redis: Fetch job
    Worker->>DB: Get payment details
    Worker->>Worker: Process payment

    alt Success
        Worker->>DB: Update status (success)
        Worker->>Redis: Queue webhook job
    else Failure
        Worker->>DB: Update status (failed)
        Worker->>Redis: Queue webhook job
    end

    Worker->>Webhook: Send webhook event
```
## Webhook Delivery Architecture
```mermaid
 stateDiagram-v2
    [*] --> Pending
    Pending --> Attempt1
    Attempt1 --> Success
    Attempt1 --> Retry2

    Retry2 --> Success
    Retry2 --> Retry3

    Retry3 --> Success
    Retry3 --> Retry4

    Retry4 --> Success
    Retry4 --> Retry5

    Retry5 --> Success
    Retry5 --> Failed

    Success --> [*]
    Failed --> [*]
```
## Data Architecture
```mermaid

erDiagram
    MERCHANTS ||--o{ ORDERS : creates
    ORDERS ||--|| PAYMENTS : contains
    PAYMENTS ||--o{ REFUNDS : generates
    MERCHANTS ||--o{ WEBHOOK_LOGS : receives
    MERCHANTS ||--o{ IDEMPOTENCY_KEYS : uses

    MERCHANTS {
        uuid id
        string api_key
        string api_secret
        string webhook_url
    }

    PAYMENTS {
        string id
        string status
        string method
        int amount
    }

    WEBHOOK_LOGS {
        uuid id
        string event
        int attempts
        string status
    }
```
## 🧠 Component Responsibilities
## API Server

Authentication

Input validation

Order & payment creation

Job enqueueing

Status APIs

### Worker Service

Payment processing

Refund processing

Webhook delivery

Retry handling

 ## Redis

Job queue storage

Retry scheduling

Worker coordination

## PostgreSQL

Persistent storage

Audit logs

Payment lifecycle tracking

## Checkout SDK

Modal handling

Iframe communication

Success / failure callbacks

⚙️ Why This Architecture Works

✔ API remains fast and responsive
✔ Long tasks handled asynchronously
✔ Failures are retried safely
✔ Services can scale independently
✔ Matches real payment gateway systems

🎯 Summary

This architecture is designed to handle real-world payment workloads, not demo traffic.
It emphasizes reliability, scalability, and security, making it suitable for production-style environments.










