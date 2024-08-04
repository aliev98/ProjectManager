import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('')

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:7166/api/Auth/login', { username, password }, {
                withCredentials: true // Ensure cookies are sent with requests
            });

            if (response.status === 200) {
                navigate('/');
            }

        } catch (error) {
            console.error('Invalid credentials', error);
            setError('Invalid username or password')
        }
    };

    return (
        <form onSubmit={handleSubmit} className="authForm">
        <h2>Login</h2>
            <div>
                <label>Username:</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" style={{width:'70px', marginTop:'10px'} }>Login</button>
            
            <p style={{color:'red'}}> { error}</p>
        </form>
    );
};

export default LoginPage;
