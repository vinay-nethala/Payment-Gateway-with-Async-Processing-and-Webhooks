import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function App() {
    const [orderId, setOrderId] = useState('');
    const [orderAmount, setOrderAmount] = useState(0);
    const [method, setMethod] = useState('upi');
    const [vpa, setVpa] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState(null);
    const [embedded, setEmbedded] = useState(false);

    useEffect(() => {
        // Get order ID from URL params
        const params = new URLSearchParams(window.location.search);
        const orderIdParam = params.get('order_id');
        const embeddedParam = params.get('embedded');

        if (orderIdParam) {
            setOrderId(orderIdParam);
            fetchOrderDetails(orderIdParam);
        }

        if (embeddedParam === 'true') {
            setEmbedded(true);
        }
    }, []);

    const fetchOrderDetails = async (orderId) => {
        try {
            const response = await axios.get(`${API_URL}/api/v1/orders/${orderId}`, {
                headers: {
                    'X-Api-Key': 'key_test_abc123',
                    'X-Api-Secret': 'secret_test_xyz789',
                },
            });
            setOrderAmount(response.data.amount);
        } catch (error) {
            console.error('Error fetching order:', error);
        }
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: 'pending', message: 'Processing payment...' });

        try {
            const paymentData = {
                order_id: orderId,
                method,
            };

            if (method === 'upi') {
                paymentData.vpa = vpa;
            } else if (method === 'card') {
                paymentData.card_number = cardNumber;
                paymentData.card_expiry = cardExpiry;
                paymentData.card_cvv = cardCvv;
            }

            const response = await axios.post(
                `${API_URL}/api/v1/payments`,
                paymentData,
                {
                    headers: {
                        'X-Api-Key': 'key_test_abc123',
                        'X-Api-Secret': 'secret_test_xyz789',
                        'Content-Type': 'application/json',
                    },
                }
            );

            const paymentId = response.data.id;

            // Poll for payment status
            pollPaymentStatus(paymentId);
        } catch (error) {
            console.error('Payment error:', error);
            setStatus({ type: 'error', message: 'Payment failed. Please try again.' });
            setLoading(false);

            if (embedded) {
                sendMessageToParent('payment_failed', { error: error.message });
            }
        }
    };

    const pollPaymentStatus = async (paymentId) => {
        const maxAttempts = 30;
        let attempts = 0;

        const interval = setInterval(async () => {
            attempts++;

            try {
                const response = await axios.get(`${API_URL}/api/v1/payments/${paymentId}`, {
                    headers: {
                        'X-Api-Key': 'key_test_abc123',
                        'X-Api-Secret': 'secret_test_xyz789',
                    },
                });

                const payment = response.data;

                if (payment.status === 'success') {
                    clearInterval(interval);
                    setStatus({ type: 'success', message: 'Payment successful!' });
                    setLoading(false);

                    if (embedded) {
                        sendMessageToParent('payment_success', { paymentId: payment.id });
                    }
                } else if (payment.status === 'failed') {
                    clearInterval(interval);
                    setStatus({ type: 'error', message: 'Payment failed. Please try again.' });
                    setLoading(false);

                    if (embedded) {
                        sendMessageToParent('payment_failed', { error: payment.error_description });
                    }
                } else if (attempts >= maxAttempts) {
                    clearInterval(interval);
                    setStatus({ type: 'error', message: 'Payment timeout. Please check status later.' });
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error polling payment status:', error);
            }
        }, 2000);
    };

    const sendMessageToParent = (type, data) => {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type, data }, '*');
        }
    };

    return (
        <div className="checkout-container">
            <div className="checkout-header">
                <h2>Complete Payment</h2>
                {orderAmount > 0 && (
                    <div className="amount-display">
                        ₹{(orderAmount / 100).toFixed(2)}
                    </div>
                )}
            </div>

            {status && (
                <div className={`status-message status-${status.type}`}>
                    {status.message}
                </div>
            )}

            {!status || status.type === 'pending' ? (
                <form onSubmit={handlePayment}>
                    <div className="payment-methods">
                        <button
                            type="button"
                            className={`method-btn ${method === 'upi' ? 'active' : ''}`}
                            onClick={() => setMethod('upi')}
                        >
                            UPI
                        </button>
                        <button
                            type="button"
                            className={`method-btn ${method === 'card' ? 'active' : ''}`}
                            onClick={() => setMethod('card')}
                        >
                            Card
                        </button>
                    </div>

                    {method === 'upi' && (
                        <div className="form-group">
                            <label>UPI ID</label>
                            <input
                                type="text"
                                placeholder="user@paytm"
                                value={vpa}
                                onChange={(e) => setVpa(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {method === 'card' && (
                        <>
                            <div className="form-group">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    placeholder="4111 1111 1111 1111"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Expiry (MM/YY)</label>
                                <input
                                    type="text"
                                    placeholder="12/25"
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>CVV</label>
                                <input
                                    type="text"
                                    placeholder="123"
                                    value={cardCvv}
                                    onChange={(e) => setCardCvv(e.target.value)}
                                    required
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="pay-btn" disabled={loading}>
                        {loading ? 'Processing...' : 'Pay Now'}
                    </button>
                </form>
            ) : null}
        </div>
    );
}

export default App;
