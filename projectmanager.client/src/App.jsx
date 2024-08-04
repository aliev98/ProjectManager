import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateProjectPage from './pages/CreateProjectPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AboutPage from './pages/AboutPage';


const App = () => {
    return (
        <div className="container">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create-project" element={<CreateProjectPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/project/:id" element={<ProjectDetailsPage />} />
                <Route path="/about" element={<AboutPage />} />
            </Routes>
        </div>
    );
};

export default App;