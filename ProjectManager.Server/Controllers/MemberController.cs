using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ProjectManager.Server.Data;
//using ProjectManager.Server.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ProjectManager.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MemberController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserManager<AppUser> _userManager;

        public MemberController(ApplicationDbContext context, UserManager<AppUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost("add-member")]
        public async Task<IActionResult> AddMemberToProject([FromBody] AddMemberRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.userId) || request.Id <= 0)
            {
                return BadRequest("Invalid request.");
            }

            var userExists = await _context.Users.AnyAsync(u => u.Id == request.userId);
            if (!userExists)
            {
                return NotFound("User not found.");
            }

            var projectExists = await _context.Projects.AnyAsync(p => p.Id == request.Id);
            if (!projectExists)
            {
                return NotFound("Project not found.");
            }

            var alreadyInProject = await _context.UsersInProjects
                .AnyAsync(uip => uip.UserId == request.userId && uip.ProjectId == request.Id);

            if (alreadyInProject)
            {
                return Conflict("User is already a member of the project.");
            }

            var userInProject = new UserInProject
            {
                UserId = request.userId,
                ProjectId = request.Id,
            };

            _context.UsersInProjects.Add(userInProject);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Log exception details if necessary
                return StatusCode(500, "An error occurred while adding the member.");
            }

            return Ok("Member added successfully.");
        }



        [HttpPost("remove-member")]
        public async Task<IActionResult> RemoveMemberFromProject([FromBody] AddMemberRequest request)
        {
            var userInProject = await _context.UsersInProjects
                .FirstOrDefaultAsync(uip => uip.UserId == request.userId && uip.ProjectId == request.Id);

            if (userInProject == null)
            {
                return NotFound("Member not found in project.");
            }

            _context.UsersInProjects.Remove(userInProject);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [HttpGet("{projectId}/members")]
        public async Task<IActionResult> GetTeamMembers(int projectId)
        {
            var teamMembers = await _context.UsersInProjects
                .Where(uip => uip.ProjectId == projectId)
                .Include(uip => uip.User)
                .Select(uip => new
                {
                    uip.User.Id,
                    uip.User.UserName,
                    uip.User.Email
                })
                .ToListAsync();

            // Return an empty list if no members found
            return Ok(teamMembers);
        }


        [HttpGet("{projectId}/available")]
        public async Task<IActionResult> GetAvailableUsers(int projectId, [FromQuery] string managerId)
        {
            try
            {
                // Fetch the IDs of users who are already members of the project
                var projectMembers = await _context.UsersInProjects
                    .Where(uip => uip.ProjectId == projectId)
                    .Select(uip => uip.UserId)
                    .ToListAsync();

                // Fetch users who are not part of the project and match the managerId
                var availableUsers = await _context.Users
                    .Where(u => !projectMembers.Contains(u.Id) && u.Id != managerId)
                    .Select(u => new { u.Id, u.UserName })
                    .ToListAsync();

                return Ok(availableUsers);
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"An error occurred: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Internal server error");
            }
        }

    }
}