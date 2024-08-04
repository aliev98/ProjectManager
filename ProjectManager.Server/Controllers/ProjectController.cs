using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Server.Data;
using System.Security.Claims;

namespace ProjectManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProjectController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public ProjectController(ApplicationDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpGet("get-managing")]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects([FromQuery] string userId)
        {
            var projects = await _context.Projects
                .Where(c => c.ManagerId == userId)
                .ToListAsync();
            return Ok(projects);
        }

        [HttpGet("get-member")]
        public async Task<ActionResult<IEnumerable<Project>>> GetUserProjectsAsync([FromQuery] string userId)
        {
            try
            {
                // Fetch projects where the user is a member
                var projects = await _context.UsersInProjects
                    .Where(uip => uip.UserId == userId)
                    .Include(uip => uip.Project) // Include Project details
                    .ThenInclude(p => p.Manager) // Include Manager details in the Project
                    .ToListAsync();

                // Ensure that the 'projects' object contains valid data
                if (projects == null || !projects.Any())
                {
                    return NotFound("No projects found for the user.");
                }

                // Map to a DTO
                var projectDtos = projects.Select(uip => new
                {
                    uip.Project.Id,
                    uip.Project.Name,
                    ManagerName = uip.Project.Manager.UserName
                });

                return Ok(projectDtos);
            }
            catch (Exception ex)
            {
                // Log the exception details for debugging
                Console.WriteLine($"An error occurred: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Project>>> GetProjectList()
        {
            var projects = await _context.Projects
                .Include(p => p.UsersInProjects)
                .ThenInclude(uip => uip.User) 
                .ToListAsync();

            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Tasks)
                .Include(p => p.Manager)
                .Include(p => p.UsersInProjects)
                .ThenInclude(uip => uip.User) 
                .FirstOrDefaultAsync(p => p.Id == id);

            if (project == null)
            {
                return NotFound();
            }

            var projectDetails = new
            {
                project.Name,
                project.Description,
                project.Manager,
                Members = project.UsersInProjects.Select(uip => new { uip.User.Id, uip.User.UserName }).ToList() // Include project members
            };

            return Ok(projectDetails);
        }

        [HttpPost("Create")]
        public async Task<ActionResult<Project>> CreateProject([FromBody] ProjectRequest newProject)
        {
            if (newProject == null)
            {
                return BadRequest("Project cannot be null");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                var project = new Project
                {
                    Name = newProject.Name,
                    Description = newProject.Description,
                    ManagerId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                };

                _context.Projects.Add(project);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Database error: {ex.Message}");
            }
        }

        [HttpGet("{id}/get-tasks")]
        public async Task<ActionResult<IEnumerable<Task>>> GetTasks(int id)
        {
            var tasks = await _context.Tasks
                .Include(t => t.AssignedTo) // Include assigned user
                .Where(t => t.ProjectId == id) // Filter tasks by project ID
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{projectId}/messages")]
        public async Task<IActionResult> GetMessages(int projectId)
        {
            var messages = await _context.Messages
                .Include(m => m.Sender) // Include sender details if needed
                .Where(m => m.ProjectId == projectId)
                .OrderBy(m => m.SentAt) // Order by the time the message was sent
                .ToListAsync();

            if (messages == null)
            {
                return NotFound();
            }

            return Ok(messages);
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest newMessage)
        {
            if (newMessage == null)
            {
                return BadRequest("Invalid message data.");
            }

            var project = await _context.Projects.FindAsync(newMessage.ProjectId);

            if (project == null)
            {
                return NotFound("Project not found.");
            }

            if (string.IsNullOrEmpty(newMessage.UserId))
            {
                return Unauthorized("User is not authenticated.");
            }

            var message = new Message
            {
                Content = newMessage.Content,
                ProjectId = newMessage.ProjectId,
                SenderUserId = newMessage.UserId,
                SentAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return Ok(message);
        }

        [HttpPost("create-task")]
        public async Task<IActionResult> CreateTask([FromBody] TaskRequest newTask)
        {
            try
            {
                var project = await _context.Projects.FindAsync(newTask.ProjectId);
                if (project == null)
                {
                    return NotFound("Project not found.");
                }

                var user = await _context.Users.FindAsync(newTask.UserId);

                if (user == null)
                {
                    return NotFound("Assigned user not found.");
                }

                var task = new Task
                {
                    Description = newTask.Description,
                    DueDate = newTask.DueDate,
                    IsCompleted = newTask.IsCompleted,
                    ProjectId = project.Id,
                    Project = project,
                    AssignedToId = user.Id,
                    AssignedTo = user
                };

                _context.Tasks.Add(task);
                await _context.SaveChangesAsync();

                var taskDto = new
                {
                    task.Id,
                    task.Description,
                    task.DueDate,
                    task.IsCompleted,
                    Project = new
                    {
                        project.Id,
                        project.Name
                    },
                    AssignedTo = new
                    {
                        user.Id,
                        user.UserName
                    }
                };

                return Ok(taskDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }

        [HttpGet("{projectId}/tasks/assigned")]
        public async Task<IActionResult> GetAssignedTasks(int projectId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null)
            {
                return Unauthorized();
            }

            var tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId && t.AssignedToId == userId)
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpPatch("{projectId}/tasks/{id}")]
        public async Task<IActionResult> UpdateTask(int projectId, int id, [FromBody] bool request)
        {
            var task = await _context.Tasks
                .Where(t => t.ProjectId == projectId && t.Id == id)
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound();
            }

            task.IsCompleted = request;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(task);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{projectId}/tasks/{id}")]
        public async Task<IActionResult> GetTaskById(int projectId, int id)
        {
            var task = await _context.Tasks
                .Where(t => t.ProjectId == projectId && t.Id == id)
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound();
            }

            return Ok(task);
        }
    }
}