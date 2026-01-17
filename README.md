# Payment Gateway Async Pro

An industrial-grade, production-ready payment gateway with asynchronous payment processing, secure webhook delivery, and a lightweight embeddable SDK — built on Node.js, Express, PostgreSQL, Redis, Docker, and React.

---

## 🚀 Features

- **Asynchronous Payment Processing:** Non-blocking API using Redis + Bull job queues  
- **Secure Webhooks:** HMAC-SHA256 signed, delivered with automatic retries and exponential backoff  
- **Embeddable SDK:** Tiny 3.77 KB JavaScript widget with modal & iframe integration  
- **Idempotency Keys:** Prevent duplicate requests within 24 hours per merchant  
- **Full Docker Compose Setup:** Easy local and production deployment  
- **Merchant Dashboard:** Real-time monitoring of orders, payments, webhooks, and retries  
- **Test Mode:** Fast simulation of success/failure with configurable delays  

---

## 🏗️ System Architecture
```


graph TB
    subgraph External Systems
        MERCHANT[Merchant Website]
        WEBHOOK_ENDPOINT[Merchant Webhook Endpoint]
    end

    subgraph Frontend
        SDK[Embeddable SDK<br/>3.77 KB]
        DASHBOARD[Dashboard (React) :3000]
        CHECKOUT[Checkout Page (React) :3001]
    end

    subgraph API Layer
        API[API Server (Express) :8000]
        AUTH[Auth Middleware]
        ROUTES[API Route Handlers]
    end

    subgraph Worker Layer
        WORKER[Worker Service (Bull Queues)]
        PAY_PROC[Payment Processor]
        WEBHOOK_PROC[Webhook Deliverer]
        REFUND_PROC[Refund Processor]
    end

    subgraph Data Layer
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
    end

    MERCHANT -->|Integrate| SDK
    SDK -->|Open Modal| CHECKOUT
    MERCHANT -->|API Calls| API
    DASHBOARD -->|Manage| API
    CHECKOUT -->|Create Payment| API

    API --> AUTH --> ROUTES -->|Enqueue Jobs| REDIS
    WORKER -->|Process Jobs| REDIS
    WORKER -->|Update DB| POSTGRES
    API <-->|CRUD| POSTGRES
    WEBHOOK_PROC -->|Send Webhook POST with HMAC| WEBHOOK_ENDPOINT
```


🔄 Webhook Delivery & Retry Mechanism
```

stateDiagram-v2
    [*] --> Pending: Webhook Created
    Pending --> Attempt1: Immediate
    Attempt1 --> Success: HTTP 2xx
    Attempt1 --> Attempt2: Fail (Wait 1 min)
    Attempt2 --> Success
    Attempt2 --> Attempt3: Fail (Wait 5 min)
    Attempt3 --> Success
    Attempt3 --> Attempt4: Fail (Wait 30 min)
    Attempt4 --> Success
    Attempt4 --> Attempt5: Fail (Wait 2 hrs)
    Attempt5 --> Success
    Attempt5 --> Failed: Max retries reached
    Success --> [*]
    Failed --> [*]
---
```




📚 Database Schema
Mermaid
```

erDiagram
    MERCHANTS ||--o{ ORDERS : creates
    MERCHANTS ||--o{ PAYMENTS : processes
    MERCHANTS ||--o{ REFUNDS : issues
    MERCHANTS ||--o{ WEBHOOK_LOGS : receives
    MERCHANTS ||--o{ IDEMPOTENCY_KEYS : uses
    ORDERS ||--|| PAYMENTS : has
    PAYMENTS ||--o{ REFUNDS : has

    MERCHANTS {
        uuid id PK
        string email UK
        string business_name
        string api_key UK
        string api_secret
        string webhook_url
        string webhook_secret
        timestamp created_at
    }

    ORDERS {
        string id PK
        uuid merchant_id FK
        integer amount
        string currency
        string receipt
        string status
        timestamp created_at
    }

    PAYMENTS {
        string id PK
        string order_id FK
        uuid merchant_id FK
        integer amount
        string currency
        string method
        string status
        boolean captured
        string error_code
        timestamp created_at
    }

    REFUNDS {
        string id PK
        string payment_id FK
        uuid merchant_id FK
        integer amount
        string reason
        string status
        timestamp created_at
        timestamp processed_at
    }

    WEBHOOK_LOGS {
        uuid id PK
        uuid merchant_id FK
        string event
        jsonb payload
        string status
        integer attempts
        timestamp next_retry_at
        integer response_code
        timestamp created_at
    }

    IDEMPOTENCY_KEYS {
        string key PK
        uuid merchant_id PK
        jsonb response
        timestamp created_at
        timestamp expires_at
    }
```

---

⚙️ SDK Integration Flow
```

Mermaid
sequenceDiagram
    participant Merchant
    participant SDK
    participant Modal
    participant Iframe
    participant API

    Merchant->>SDK: new PaymentGateway({orderId, onSuccess, onFailure})
    Merchant->>SDK: checkout.open()
    SDK->>Modal: Create modal overlay
    SDK->>Iframe: Create iframe with order_id
    SDK->>Merchant: Append modal to DOM

    Note over Iframe: User fills payment details
    Iframe->>API: POST /payments
    API-->>Iframe: 201 Created (pending)

    loop Poll every 2s
        Iframe->>API: GET /payments/:id
        API-->>Iframe: Payment status
    end

    alt Payment Success
        Iframe->>SDK: postMessage(success)
        SDK->>Merchant: onSuccess callback
        SDK->>Modal: Remove modal
    else Payment Failed
        Iframe->>SDK: postMessage(failure)
        SDK->>Merchant: onFailure callback
    end
---
```


⚡ Quick Start
## Prerequisites
Docker Desktop installed and running


Node.js 18+ (optional for local development)

Git
Installation & Run
```Bash
git clone https://github.com/shahanth4444/payment-gateway-async-pro.git
cd payment-gateway-async-pro
docker-compose up -d --build
```


Access Points
Service
URL
Description
API
```

http://localhost:8000
REST API Server
```
```
Dashboard
http://localhost:3000
```
```



Merchant Dashboard UI
Checkout
http://localhost:3001

http://localhost:3001/checkout.js
```


Create Order
```Bash
curl -X POST http://localhost:8000/api/v1/orders \
-H "X-Api-Key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789" \
-H "Content-Type: application/json" \
-d '{"amount":50000,"currency":"INR","receipt":"order_001"}'
```

Create Payment
```Bash
curl -X POST http://localhost:8000/api/v1/payments \
-H "X-Api-Key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789" \
-H "Idempotency-Key: unique_key_123" \
-H "Content-Type: application/json" \
-d '{"order_id":"order_001","method":"upi","vpa":"success@paytm"}'
```

Check Payment Status
```Bash
curl http://localhost:8000/api/v1/payments/pay_abc123 \
-H "X-Api-Key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789"
```

View Webhook Logs
```Bash
curl http://localhost:8000/api/v1/webhooks?limit=5 \
-H "X-Api-Key: key_test_abc123" \
-H "X-Api-Secret: secret_test_xyz789"
```

## 🔄 Webhook Setup & Monitoring
Use webhook URL like http://yoursite.com/webhook in Docker environments.
Webhooks are signed with whsec_test_abc123 using merchant’s webhook secret.
Retry strategy with exponential backoff: 1 min → 5 min → 30 min → 2 hrs.
Dashboard UI for manual retry and detailed webhook event logs.

## 🛠️ Operational & Scaling Notes
Workers process jobs asynchronously (payments, webhooks, refunds)
Logs available via docker-compose logs -f worker for troubleshooting
Scale horizontally by increasing worker container replicas
Use PostgreSQL & Redis connection pooling for performance

### 🔒 Security Best Practices
API requests authenticated with API key + secret headers
Webhook payloads verified with HMAC-SHA256 signatures
SQL queries use parameterized statements to prevent injection
Input validation ensures data integrity on all endpoints

🗂️ Project Structure
```



payment-gateway-async-pro/
├── backend/
│   ├── src/
│   │   ├── routes/           # API route handlers
│   │   ├── jobs/             # Background job processors
│   │   ├── services/         # Business logic modules
│   │   ├── middleware/       # Authentication & validation
│   │   ├── config/           # DB & queue configuration
│   │   ├── workers/          # Job queue consumers
│   │   └── index.js          # API server entrypoint
│   ├── migrations/           # DB schema scripts
│   ├── Dockerfile            # API server Dockerfile
│   ├── Dockerfile.worker     # Worker Dockerfile
│   └── package.json
├── dashboard/                # Merchant Dashboard (React app)
├── checkout/                 # Payment Checkout Page (React app)
├── checkout-widget/          # Embeddable JavaScript SDK
├── docker-compose.yml
└── README.md
````

👨‍💻 Author & License
Made for demonstration and learning purposes.
Licensed under MIT License.
Thank you for choosing Payment Gateway Async Pro!
Happy coding & seamless payments! 🎉
