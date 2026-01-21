import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Webhooks from './pages/Webhooks';
import ApiDocs from './pages/ApiDocs';
import Home from './pages/Home';

function App() {
    return (
        <Router>
                <div className="app">
                    <header className="topbar">
                        <div className="brand">
                            <div className="logo">PG</div>
                            <div className="title">Payment Gateway</div>
                        </div>

                        <nav className="nav-links">
                            <NavLink to="/" end className={({isActive}) => isActive ? 'active' : ''}>Home</NavLink>
                            <NavLink to="/webhooks" className={({isActive}) => isActive ? 'active' : ''}>Webhooks</NavLink>
                            <NavLink to="/docs" className={({isActive}) => isActive ? 'active' : ''}>API Documentation</NavLink>
                        </nav>
                    </header>

                    <main>
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/webhooks" element={<Webhooks />} />
                            <Route path="/docs" element={<ApiDocs />} />
                        </Routes>
                    </main>
                </div>
            </Router>
    );
}

export default App;
