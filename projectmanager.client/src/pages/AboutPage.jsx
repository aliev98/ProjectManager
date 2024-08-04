import { useNavigate } from 'react-router-dom';

function AboutPage() {
    const navigate = useNavigate();


  return (
      <div className="homepage-container">
          <h2>Project manager</h2>
          <h4>
              This project is a complete web-based Project Management System and
              it's built to make project management and teamwork easier.
              The system lets users manage their own projects and participate in projects managed by others.
              The users can assign and receive tasks, track progress, and communicate within project teams. 
              It's a comprehensive solution for managing and tracking projects.
          </h4>

          <button onClick={() => navigate('/')} >Back</button>
      </div>
  );
}

export default AboutPage;