import React from 'react';

function ApiDocs() {
    return (
        <div className="container">
            <div data-test-id="api-docs">
                <h2>Integration Guide</h2>

                <section data-test-id="section-create-order" className="card">
                    <h3>1. Create Order</h3>
                    <pre data-test-id="code-snippet-create-order">
                        {`curl -X POST http://localhost:8000/api/v1/orders \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "currency": "INR",
    "receipt": "receipt_123"
  }'`}
                    </pre>
                </section>

                <section data-test-id="section-sdk-integration" className="card">
                    <h3>2. SDK Integration</h3>
                    <pre data-test-id="code-snippet-sdk">
                        {`<script src="http://localhost:3001/checkout.js"></script>
<script>
const checkout = new PaymentGateway({
  key: 'key_test_abc123',
  orderId: 'order_xyz',
  onSuccess: (response) => {
    console.log('Payment ID:', response.paymentId);
  }
});
checkout.open();
</script>`}
                    </pre>
                </section>

                <section data-test-id="section-webhook-verification" className="card">
                    <h3>3. Verify Webhook Signature</h3>
                    <pre data-test-id="code-snippet-webhook">
                        {`const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}`}
                    </pre>
                </section>

                <section className="card">
                    <h3>4. Create Payment</h3>
                    <pre>
                        {`curl -X POST http://localhost:8000/api/v1/payments \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Idempotency-Key: unique_request_id_123" \\
  -H "Content-Type: application/json" \\
  -d '{
    "order_id": "order_NXhj67fGH2jk9mPq",
    "method": "upi",
    "vpa": "user@paytm"
  }'`}
                    </pre>
                </section>

                <section className="card">
                    <h3>5. Create Refund</h3>
                    <pre>
                        {`curl -X POST http://localhost:8000/api/v1/payments/{payment_id}/refunds \\
  -H "X-Api-Key: key_test_abc123" \\
  -H "X-Api-Secret: secret_test_xyz789" \\
  -H "Content-Type: application/json" \\
  -d '{
    "amount": 50000,
    "reason": "Customer requested refund"
  }'`}
                    </pre>
                </section>
            </div>
        </div>
    );
}

export default ApiDocs;
