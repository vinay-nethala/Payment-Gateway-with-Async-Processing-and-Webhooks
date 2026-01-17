import React from 'react';

function Home() {
    return (
        <div className="container">
            <h1>Payment Gateway Dashboard</h1>

            <div className="card">
                <h2>Test Credentials</h2>
                <div className="form-group">
                    <label>API Key</label>
                    <input type="text" value="key_test_abc123" readOnly />
                </div>
                <div className="form-group">
                    <label>API Secret</label>
                    <input type="text" value="secret_test_xyz789" readOnly />
                </div>
            </div>

            <div className="card">
                <h2>Quick Start</h2>
                <p>Welcome to the Payment Gateway Dashboard. Use the navigation above to:</p>
                <ul style={{ marginLeft: '20px', marginTop: '10px' }}>
                    <li>Configure webhooks and view delivery logs</li>
                    <li>Access API documentation and integration guides</li>
                </ul>
            </div>
        </div>
    );
}

export default Home;
