# Payment Gateway Architecture

## System Overview

The payment gateway is built on a microservices architecture with async job processing, enabling scalability and reliability for production workloads.

## Architecture Diagram

```mermaid
graph TB
    subgraph "External Systems"
        MERCHANT[Merchant Website]
        WEBHOOK_ENDPOINT[Merchant Webhook Endpoint]
    end
    
    subgraph "Frontend Layer"
        SDK[Embeddable SDK]
        DASHBOARD[Dashboard :3000]
        CHECKOUT[Checkout Page :3001]
    end
    
    subgraph "API Layer"
        API[API Server :8000]
    end
    
    subgraph "Worker Layer"
        WORKER[Worker Service]
        PAYMENT_JOB[Payment Processor]
        WEBHOOK_JOB[Webhook Deliverer]
        REFUND_JOB[Refund Processor]
    end
    
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL)]
        REDIS[(Redis)]
    end
    
    MERCHANT -->|Integrate| SDK
    SDK -->|Open Modal| CHECKOUT
    MERCHANT -->|API Calls| API
    DASHBOARD -->|Configure| API
    CHECKOUT -->|Create Payment| API
    
    API -->|Enqueue| REDIS
    WORKER -->|Consume| REDIS
    WORKER --> PAYMENT_JOB
    WORKER --> WEBHOOK_JOB
    WORKER --> REFUND_JOB
    
    API <-->|Read/Write| POSTGRES
    WORKER <-->|Read/Write| POSTGRES
    
    WEBHOOK_JOB -->|HTTP POST| WEBHOOK_ENDPOINT
```

## Async Processing Flow

```mermaid
sequenceDiagram
    participant M as Merchant
    participant A as API
    participant R as Redis Queue
    participant W as Worker
    participant DB as Database
    participant WH as Webhook Endpoint
    
    M->>A: POST /payments
    A->>DB: Insert payment (status: pending)
    A->>R: Enqueue ProcessPaymentJob
    A-->>M: 201 Created (status: pending)
    
    W->>R: Consume job
    W->>W: Process payment (5-10s)
    W->>DB: Update status (success/failed)
    W->>R: Enqueue DeliverWebhookJob
    
    W->>R: Consume webhook job
    W->>W: Generate HMAC signature
    W->>WH: POST webhook with signature
    WH-->>W: 200 OK
    W->>DB: Update webhook log (success)
```

## Webhook Retry Mechanism

```mermaid
stateDiagram-v2
    [*] --> Pending: Webhook Created
    Pending --> Attempt1: Immediate
    Attempt1 --> Success: HTTP 200-299
    Attempt1 --> Attempt2: Failed (wait 1m)
    Attempt2 --> Success: HTTP 200-299
    Attempt2 --> Attempt3: Failed (wait 5m)
    Attempt3 --> Success: HTTP 200-299
    Attempt3 --> Attempt4: Failed (wait 30m)
    Attempt4 --> Success: HTTP 200-299
    Attempt4 --> Attempt5: Failed (wait 2h)
    Attempt5 --> Success: HTTP 200-299
    Attempt5 --> Failed: Max Retries
    Success --> [*]
    Failed --> [*]
```

## Database Schema

```mermaid
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

## Component Responsibilities

### API Server
- Handle HTTP requests
- Authenticate merchants
- Validate input data
- Enqueue background jobs
- Return immediate responses

### Worker Service
- Process payment jobs
- Deliver webhooks with retries
- Process refunds
- Update database records
- Handle job failures

### Redis Queue
- Store pending jobs
- Enable async processing
- Provide job retry mechanism
- Track job status

### PostgreSQL
- Persist all data
- Maintain data integrity
- Support transactions
- Enable complex queries

## Security Considerations

### API Authentication
- API key + secret validation
- Scoped to merchant account
- No public endpoints (except test)

### Webhook Security
- HMAC-SHA256 signatures
- Prevents tampering
- Verifiable by merchant
- Unique secret per merchant

### Idempotency
- Prevents duplicate charges
- 24-hour key expiration
- Scoped to merchant
- Cached responses

## Scalability Patterns

### Horizontal Scaling
- Multiple API instances behind load balancer
- Multiple worker instances processing jobs
- Redis cluster for high throughput
- PostgreSQL read replicas

### Job Queue Benefits
- Decouples processing from API
- Handles traffic spikes
- Automatic retries
- Failure isolation

### Database Optimization
- Indexed foreign keys
- Partial indexes on status
- Connection pooling
- Query optimization

## Monitoring & Observability

### Key Metrics
- Payment success rate
- Webhook delivery rate
- Job processing time
- Queue depth
- API response time

### Logging
- Structured JSON logs
- Request/response logging
- Job execution logs
- Error tracking

### Health Checks
- API health endpoint
- Database connectivity
- Redis connectivity
- Worker status

## Deployment Strategy

### Docker Compose (Development)
- Single-host deployment
- Easy local testing
- Quick iteration

### Kubernetes (Production)
- Multi-host deployment
- Auto-scaling
- Rolling updates
- High availability

### CI/CD Pipeline
1. Run tests
2. Build Docker images
3. Push to registry
4. Deploy to staging
5. Run integration tests
6. Deploy to production

## Future Enhancements

- [ ] Payment method plugins
- [ ] Multi-currency support
- [ ] Fraud detection
- [ ] Analytics dashboard
- [ ] Rate limiting
- [ ] API versioning
- [ ] Webhook replay
- [ ] Subscription billing
