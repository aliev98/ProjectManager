import React from 'react';
import { Link } from 'react-router-dom';

function ProjectList({ managingProjects, memberProjects }) {
    return (
        <div className="ListContainer">
            { managingProjects.length == 0 && memberProjects.length == 0 ? <h3>You are not taking part of any projects yet</h3>: null}
            {managingProjects.length > 0 && (
                <ul>
                    <h3>Projects you are managing</h3>
                    {managingProjects.map(project => (
                        <li key={project.id}>
                            <Link className="project-link" to={`/project/${project.id}`}>
                                {project.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            {memberProjects.length > 0 && (
                <ul>
                    <h3>Projects you are a member of</h3>
                    {memberProjects.map(project => (
                        <li key={project.id}>
                            <Link className="project-link" to={`/project/${project.id}`}>
                                {project.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProjectList;
