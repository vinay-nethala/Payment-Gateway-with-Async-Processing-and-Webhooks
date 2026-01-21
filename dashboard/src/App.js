import React from 'react';
<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
=======
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
>>>>>>> 4924fc924207e806601e7ab3429d2d867083ac5b
import Webhooks from './pages/Webhooks';
import ApiDocs from './pages/ApiDocs';
import Home from './pages/Home';

function App() {
    return (
        <Router>
<<<<<<< HEAD
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
=======
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
>>>>>>> 4924fc924207e806601e7ab3429d2d867083ac5b
    );
}

export default App;
