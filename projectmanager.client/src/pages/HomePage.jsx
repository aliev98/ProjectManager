import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectList from '../components/ProjectList';
import axios from 'axios';

function HomePage() {
    const [managingProjects, setManagingProjects] = useState([]);
    const [memberProjects, setMemberProjects] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const response = await fetch('https://localhost:7166/api/Auth/user-info', {
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('There was an error fetching user info!', error);
            }
        };

        fetchUserInfo();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                if (user) {
                    // Fetch projects managed by the user
                    const response1 = await axios.get('https://localhost:7166/api/Project/get-managing', {
                        params: { userId: user.id },
                        withCredentials: true
                    });

                    setManagingProjects(response1.data)
                }
            } catch (error) {
                console.error('There was an error fetching the projects', error);
            }
        };

        const fetchMemberProjects = async () => {
            try {
                if (user) {
                    // Fetch projects where the the user is a member
                    const response = await axios.get('https://localhost:7166/api/Project/get-member', {
                        params: { userId: user.id },
                        withCredentials: true
                    });

                    setMemberProjects(response.data);
                    console.log(response.data)
                }
            }
            catch(error) {
                console.error('There was an error fetching the projects', error);
            }
        }

        fetchProjects();
        fetchMemberProjects();

    }, [user]);

    const handleLogout = async () => {
        try {
            const response = await fetch('https://localhost:7166/api/Auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                console.log('Logout successful');
                setUser(null); // Clear user state
                navigate('/'); // Redirect to homepage
            } else {
                console.error('Logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('There was an error logging out!', error);
        }
    };


    return (
        <div className={user ? "homepage-container" : ""}>
            <button onClick={() => navigate('/about')} className="aboutBtn" >About</button>
            <div className="header-buttons">
                {!user && (
                    <div className="auth-buttons">
                        <button onClick={() => navigate('/login')}>Login</button>
                        <button onClick={() => navigate('/register')}>Register</button>
                    </div>
                )}
                {user && (
                    <button className="btnLogout" onClick={handleLogout}>Logout</button>
                )}
            </div>
            {user ? <h1 className="homepage-title">Home Page</h1> :

                <div>
                 <h1>Home page - Project Manager</h1>
                 <h3>Start by signing in or creating an account</h3>
                 <h3>Click About for information about this website</h3>
                </div>
            }

            {user && (
                <div className="user-info">
                    <div style={{marginLeft:'6px'} }>
                    <p className="user-detail">Signed in as {user.firstName} {user.lastName}</p>
                    <p className="user-detail">Email: {user.email}</p>
                    <p className="user-detail">Username: {user.userName}</p>
                    </div>
                    <div className="create-project-button-container">
                        <button className="create-project-button" onClick={() => navigate('/create-project')}>Create project</button>
                    </div>

                    <div className="project-list">
                        <ProjectList managingProjects={managingProjects} memberProjects={memberProjects} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomePage;