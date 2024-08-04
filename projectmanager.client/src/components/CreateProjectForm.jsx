import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CreateProjectForm() {
    const [projectName, setProjectName] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = {
            Name: projectName,
            Description: description,
        };

        try {

            await axios.post('https://localhost:7166/api/Project/Create', data ,{
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            setProjectName('');
            setDescription('');
            navigate('/')
            
        } catch (error) {
            console.error('Error creating project', error);
            setError('Error creating project');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Project Name"
                    required
                />
            </div>

            <div>
                <textarea rows="3" cols="40"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    required
                />
            </div>
            <button type="submit">Create Project</button>
            <button onClick={ () => navigate('/')}>Back</button>
        </form>
    );
}

export default CreateProjectForm;
