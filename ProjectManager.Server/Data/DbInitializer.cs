using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace ProjectManager.Server.Data
{
    public class DbInitializer
    {
        private readonly ModelBuilder modelBuilder;
        public DbInitializer(ModelBuilder modelBuilder)
        {
            this.modelBuilder = modelBuilder;
        }

        public void SeedProjects()
        {

            modelBuilder.Entity<Project>().HasData(
            new Project
            {
                 Id = 1,
                 Name = "NotePad",
                 Description = "A basic note-taking app for quickly recording thoughts, reminders, and to-do lists. " +
                 "NotePad features a clean and minimalistic interface, making it easy to create, edit, and organize notes on the go. ",
                 ManagerId = "1"
            }
   );
        }

        public void SeedUsers()
        {
            var hasher = new PasswordHasher<AppUser>();

            var manager = new AppUser
            {
                Id = "1",
                UserName = "Tommy1",
                NormalizedUserName = "TOMMY1",
                Email = "member@example.com",
                NormalizedEmail = "MEMBER@EXAMPLE.COM",
                FirstName = "Tommy",
                LastName = "Member",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D")
            };
            manager.PasswordHash = hasher.HashPassword(manager, "member1");

            var teamMember1 = new AppUser
            {
                Id = "2",
                UserName = "Eric2",
                NormalizedUserName = "ERIC2",
                Email = "member@example.com",
                NormalizedEmail = "MEMBER@EXAMPLE.COM",
                FirstName = "Eric",
                LastName = "Member",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D")
            };
            teamMember1.PasswordHash = hasher.HashPassword(teamMember1, "member2");

            var teamMember2 = new AppUser
            {
                Id = "3",
                UserName = "Danny3",
                NormalizedUserName = "DANNY3",
                Email = "member@example.com",
                NormalizedEmail = "MEMBER@EXAMPLE.COM",
                FirstName = "Danny",
                LastName = "Member",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D")
            };

            teamMember2.PasswordHash = hasher.HashPassword(teamMember2, "member3");
            var teamMember3 = new AppUser
            {
                Id = "4",
                UserName = "Alex4",
                NormalizedUserName = "ALEX4",
                Email = "member@example.com",
                NormalizedEmail = "MEMBER@EXAMPLE.COM",
                FirstName = "Alex",
                LastName = "Member",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D")
            };

            teamMember3.PasswordHash = hasher.HashPassword(teamMember3, "member4");
            var teamMember4 = new AppUser
            {
                Id = "5",
                UserName = "John5",
                NormalizedUserName = "JOHN5",
                Email = "member@example.com",
                NormalizedEmail = "MEMBER@EXAMPLE.COM",
                FirstName = "John",
                LastName = "Member",
                EmailConfirmed = true,
                SecurityStamp = Guid.NewGuid().ToString("D")
            };
            teamMember4.PasswordHash = hasher.HashPassword(teamMember4, "member5");


            modelBuilder.Entity<AppUser>().HasData( manager, teamMember1,teamMember2,teamMember3,teamMember4);
        }
    }
}