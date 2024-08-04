import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Messaging from '../components/Messaging';

const ProjectDetailsPage = () => {
    const { id } = useParams(); // Project ID
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [isManager, setIsManager] = useState(localStorage.getItem('isManager') === 'true' || false);
    const [project, setProject] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [error, setError] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [isAssigningTask, setIsAssigningTask] = useState(false);
    const [newTaskDescription, setNewTaskDescription] = useState('');
    const [assignedUserId, setAssignedUserId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [username, setUsername] = useState('');
    const [managerId, setManagerId] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                const userResponse = await axios.get('https://localhost:7166/api/Auth/user-info', { withCredentials: true });
                const fetchedUserId = userResponse.data.id;
                const fetchedUsername = userResponse.data.userName;

                setUserId(fetchedUserId);
                setUsername(fetchedUsername);
                localStorage.setItem('userId', fetchedUserId);

                const response = await axios.get(`https://localhost:7166/api/Project/${id}`, { withCredentials: true });
                console.log(response.data);
                setProject(response.data);
                setManagerId(response.data.manager.id);
                

                // console.log(response.data.manager.id);

                if (response.data.manager.id === fetchedUserId) {
                    setIsManager(true);
                    localStorage.setItem('isManager', 'true');
                } else {
                    setIsManager(false);
                    localStorage.setItem('isManager', 'false');
                }

                await fetchTeamMembers();
                await fetchAvailableUsers();
                await fetchTasks();

            } catch (error) {
                console.error('Error fetching project details or user ID:', error);
                setError('Failed to load project details or user information.');
            }
        };

        const fetchTasks = async () => {

            try {
                const response = await axios.get(`https://localhost:7166/api/Project/${id}/get-tasks`, { withCredentials: true });
                console.log('Tasks:', response.data);
                setTasks(response.data);
            } catch (error) {
                console.error('Error fetching tasks:', error);
                setError('Failed to load tasks.');
            }
        };

        fetchProjectDetails();
    //    fetchUsername();
    }, [id]);

    useEffect(() => {
        if (managerId) {
            fetchAvailableUsers();
        }

    }, [managerId]);

    const fetchTeamMembers = async () => {
        try {
            const response = await axios.get(`https://localhost:7166/api/Member/${id}/members`, { withCredentials: true });
            setTeamMembers(response.data);
        } catch (error) {
            console.error('Error fetching team members:', error);
            setError('Failed to load team members.');
        }
    };

    const fetchAvailableUsers = async () => {
        if (!managerId) return;
        try {

            const response = await axios.get(`https://localhost:7166/api/Member/${id}/available`, {
                params: { managerId: managerId },

                withCredentials: true
            });

            setAvailableUsers(response.data);

        } catch (error) {
            console.error('Error fetching available users:', error);
            setError('Failed to load available users.');
        }
    };

    const handleAddMember = async (userId) => {
        try {
            await axios.post('https://localhost:7166/api/Member/add-member',
                { userId, id }, // Ensure property names match backend expectations
                { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
            );

            // Refresh team members and available users
            await fetchTeamMembers();
            await fetchAvailableUsers();


            setError(null);

        } catch (error) {
            console.error('Error adding team member', error);
            setError('Failed to add team member. Please try again.');
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await axios.post('https://localhost:7166/api/Member/remove-member', { userId, id }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            await fetchTeamMembers();
            await fetchAvailableUsers();
            setError(null);
        } catch (error) {
            console.error('Error removing team member', error);
            setError('Failed to remove team member.');
        }
    };

    const handleAssignTask = async () => {
        try {
            await axios.post('https://localhost:7166/api/Project/create-task', {
                description: newTaskDescription,
                userId: assignedUserId,
                dueDate: dueDate,
                isCompleted: false,
                projectId: id
            }, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });

            const tasksResponse = await axios.get(`https://localhost:7166/api/Project/${id}/get-tasks`, { withCredentials: true });
            setTasks(tasksResponse.data);

            setIsAssigningTask(false);
            setNewTaskDescription('');
            setAssignedUserId('');
            setDueDate('');
            setError(null);
        } catch (error) {
            console.error('Error assigning task:', error);
            setError('Failed to assign task.');
        }
    };

    const handleTaskCompletion = async (taskId) => {
        try {
            await axios.patch(`https://localhost:7166/api/Project/${id}/tasks/${taskId}`,
                true ,
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            const response = await axios.get(`https://localhost:7166/api/Project/${id}/get-tasks`, { withCredentials: true });
            setTasks(response.data);
            setError(null);
        } catch (error) {
            console.error('Error marking task as complete:', error);
            setError('Failed to mark task as complete.');
        }
    };

    return (
        <div className="project-details-container">
            <button onClick={() => navigate('/')} className="homeButton" >Back to Home</button>
            <small> <p style={{ position: 'absolute', top:'20px',left:'20px' }}>Signed in as {username}</p></small>    
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {project && (
                <div>
                    <h1>{project.name}</h1>
                    <h3>{project.description}</h3>
                    <div className="project-details-section">
                        <div style={{marginBottom:'10px'}}>
                         Team manager: <span className="manager-username">{project.manager.userName}</span>
                    </div>
                  
                        {teamMembers.length > 0 ? 'Team members' : null}
                        <ul className="users-list">
                            {teamMembers.map(member => (
                                <li key={member.id} style={{fontWeight:'bold', paddingRight:'7px' } }>
                                    {member.userName}

                                    {isManager ? <button className="remove-member" onClick={() => handleRemoveMember(member.id)}>Remove</button> : null}

                                </li>
                            ))}
                        </ul>
                   
                        {availableUsers.length > 0 && isManager && (

                            <div style={{marginTop:'15px'} }>
                                 Add new members 
                                <ul className="users-list" >
                                    {availableUsers.map(user => (
                                        <li key={user.id}>
                                            <button className="add-member" onClick={() => handleAddMember(user.id)}> + {user.userName}</button>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                        )}

                    </div>
                    <div className="project-details-section">
                    <br/>
                        <h2>Project Tasks</h2>
                        {tasks.length > 0 ? (
                            <div>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Description</th>
                                            <th>Assigned To</th>
                                            <th>Due Date</th>
                                            <th>Completed</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tasks.map(task => {
                                            const dueDate = new Date(task.dueDate);
                                            const formattedDueDate = dueDate.toISOString().split('T')[0];

                                            return (
                                                <tr key={task.id}>
                                                    <td style={{ backgroundColor: task.isCompleted ? '#D0F0C0' : 'transparent' }}>{task.description}</td>
                                                    <td style={{ backgroundColor: task.isCompleted ? '#D0F0C0' : 'transparent' }}>{task.assignedTo.userName}</td>
                                                    <td style={{ backgroundColor: task.isCompleted ? '#D0F0C0' : 'transparent' }}>{formattedDueDate}</td>
                                                    <td style={{ backgroundColor: task.isCompleted ? '#D0F0C0' : 'transparent' }}>{task.isCompleted ? 'Yes' : 'No'}</td>
                                                    <td className="td-Complete">
                                                        {!task.isCompleted && task.assignedToId === userId && (
                                                            <button className="complete-button" onClick={() => handleTaskCompletion(task.id)}>Completed</button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No tasks assigned yet.</p>
                        )}
                        {isManager ? <button onClick={() => setIsAssigningTask(true)}>Assign Task</button> : null}

                        {isAssigningTask && (
                            <div className="assign-task-form">
                                <h3>Assign Task</h3>
                                <label>
                                    Description:
                                    <input type="text" value={newTaskDescription} onChange={(e) => setNewTaskDescription(e.target.value)} />
                                </label>
                                <br />
                                <label>
                                    Due Date:
                                    <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                                </label>
                                <br />
                                <label>
                                    Assign To:
                                    <select value={assignedUserId} onChange={(e) => setAssignedUserId(e.target.value)}>
                                        <option value="">Select a user</option>
                                        {teamMembers.map(user => (
                                            <option key={user.id} value={user.id}>{user.userName}</option>
                                        ))}

                                        <option key="manager" value={managerId}  >{username} (Yourself)</option>

                                    </select>
                                </label>
                                <br />
                                <div className ="assignButtons">

                                <button onClick={handleAssignTask}>Submit Task</button>
                                <button className="cancel" onClick={() => setIsAssigningTask(false)}>Cancel</button>

                                </div>
                            </div>
                        )}
                    </div>
                    <br/>
                    <Messaging projectId={id} userId={userId} />
                </div>
            )}
        </div>
    );
};

export default ProjectDetailsPage;