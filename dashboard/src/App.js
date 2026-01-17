import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Webhooks from './pages/Webhooks';
import ApiDocs from './pages/ApiDocs';
import Home from './pages/Home';

function App() {
    return (
        <Router>
            <div className="app">
                <nav className="nav">
                    <div className="nav-links">
                        <Link to="/">Home</Link>
                        <Link to="/webhooks">Webhooks</Link>
                        <Link to="/docs">API Documentation</Link>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/webhooks" element={<Webhooks />} />
                    <Route path="/docs" element={<ApiDocs />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
