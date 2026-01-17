import React, { useState, useEffect } from 'react';

function Webhooks() {
    const [webhookUrl, setWebhookUrl] = useState('https://yoursite.com/webhook');
    const [webhookSecret, setWebhookSecret] = useState('whsec_test_abc123');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const API_KEY = 'key_test_abc123';
    const API_SECRET = 'secret_test_xyz789';

    // Fetch webhook logs on component mount
    useEffect(() => {
        fetchWebhookLogs();
    }, []);

    const fetchWebhookLogs = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/webhooks?limit=10&offset=0`, {
                headers: {
                    'X-Api-Key': API_KEY,
                    'X-Api-Secret': API_SECRET
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch webhook logs');
            }

            const data = await response.json();
            setLogs(data.data || []);
        } catch (error) {
            console.error('Error fetching webhook logs:', error);
            setMessage('Error fetching webhook logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveConfiguration = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/webhooks/config`, {
                method: 'PUT',
                headers: {
                    'X-Api-Key': API_KEY,
                    'X-Api-Secret': API_SECRET,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ webhook_url: webhookUrl })
            });

            if (!response.ok) {
                throw new Error('Failed to save configuration');
            }

            setMessage('✅ Webhook configuration saved successfully');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error saving configuration:', error);
            setMessage('❌ Error saving configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSendTestWebhook = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/webhooks/test`, {
                method: 'POST',
                headers: {
                    'X-Api-Key': API_KEY,
                    'X-Api-Secret': API_SECRET
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error?.description || 'Failed to send test webhook');
            }

            setMessage('✅ Test webhook sent successfully');
            setTimeout(() => {
                setMessage('');
                fetchWebhookLogs();
            }, 2000);
        } catch (error) {
            console.error('Error sending test webhook:', error);
            setMessage(`❌ ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRegenerateSecret = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/webhooks/secret/regenerate`, {
                method: 'POST',
                headers: {
                    'X-Api-Key': API_KEY,
                    'X-Api-Secret': API_SECRET
                }
            });

            if (!response.ok) {
                throw new Error('Failed to regenerate secret');
            }

            const data = await response.json();
            setWebhookSecret(data.webhook_secret);
            setMessage('✅ Webhook secret regenerated');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error regenerating secret:', error);
            setMessage('❌ Error regenerating secret');
        } finally {
            setLoading(false);
        }
    };

    const handleRetryWebhook = async (webhookId) => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/v1/webhooks/${webhookId}/retry`, {
                method: 'POST',
                headers: {
                    'X-Api-Key': API_KEY,
                    'X-Api-Secret': API_SECRET
                }
            });

            if (!response.ok) {
                throw new Error('Failed to retry webhook');
            }

            setMessage('✅ Webhook retry scheduled');
            setTimeout(() => {
                setMessage('');
                fetchWebhookLogs();
            }, 2000);
        } catch (error) {
            console.error('Error retrying webhook:', error);
            setMessage('❌ Error retrying webhook');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    return (
        <div data-test-id="webhook-config" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h2>Webhook Configuration</h2>

            {message && (
                <div style={{
                    padding: '12px',
                    marginBottom: '20px',
                    borderRadius: '4px',
                    background: message.includes('✅') ? '#d4edda' : '#f8d7da',
                    color: message.includes('✅') ? '#155724' : '#721c24',
                    border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                }}>
                    {message}
                </div>
            )}

            <form data-test-id="webhook-config-form" onSubmit={(e) => { e.preventDefault(); handleSaveConfiguration(); }} style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                marginBottom: '30px'
            }}>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Webhook URL
                    </label>
                    <input
                        data-test-id="webhook-url-input"
                        type="url"
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        placeholder="https://yoursite.com/webhook"
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Webhook Secret
                    </label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <span
                            data-test-id="webhook-secret"
                            style={{
                                flex: 1,
                                padding: '10px',
                                background: '#f5f5f5',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '14px'
                            }}
                        >
                            {webhookSecret}
                        </span>
                        <button
                            data-test-id="regenerate-secret-button"
                            type="button"
                            onClick={handleRegenerateSecret}
                            disabled={loading}
                            style={{
                                padding: '10px 20px',
                                background: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Regenerate
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        data-test-id="save-webhook-button"
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </button>

                    <button
                        data-test-id="test-webhook-button"
                        type="button"
                        onClick={handleSendTestWebhook}
                        disabled={loading}
                        style={{
                            padding: '12px 24px',
                            background: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500'
                        }}
                    >
                        {loading ? 'Sending...' : 'Send Test Webhook'}
                    </button>
                </div>
            </form>

            <h3>Webhook Logs</h3>
            <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table data-test-id="webhook-logs-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Event</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Status</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Attempts</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Last Attempt</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Response Code</th>
                            <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                                    {loading ? 'Loading...' : 'No webhook logs yet'}
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr
                                    key={log.id}
                                    data-test-id="webhook-log-item"
                                    data-webhook-id={log.id}
                                    style={{ borderBottom: '1px solid #dee2e6' }}
                                >
                                    <td data-test-id="webhook-event" style={{ padding: '12px' }}>{log.event}</td>
                                    <td data-test-id="webhook-status" style={{ padding: '12px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            background: log.status === 'success' ? '#d4edda' : log.status === 'failed' ? '#f8d7da' : '#fff3cd',
                                            color: log.status === 'success' ? '#155724' : log.status === 'failed' ? '#721c24' : '#856404'
                                        }}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td data-test-id="webhook-attempts" style={{ padding: '12px' }}>{log.attempts}</td>
                                    <td data-test-id="webhook-last-attempt" style={{ padding: '12px' }}>
                                        {formatDate(log.last_attempt_at)}
                                    </td>
                                    <td data-test-id="webhook-response-code" style={{ padding: '12px' }}>
                                        {log.response_code || '-'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            data-test-id="retry-webhook-button"
                                            data-webhook-id={log.id}
                                            onClick={() => handleRetryWebhook(log.id)}
                                            disabled={loading}
                                            style={{
                                                padding: '6px 12px',
                                                background: '#ffc107',
                                                color: '#000',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: loading ? 'not-allowed' : 'pointer',
                                                fontSize: '12px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Retry
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Webhooks;
