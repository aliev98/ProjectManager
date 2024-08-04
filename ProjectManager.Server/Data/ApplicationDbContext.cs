using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace ProjectManager.Server.Data
{
    public class ApplicationDbContext : IdentityDbContext<AppUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) 
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

          
            modelBuilder.Entity<Project>()
               .HasOne(p => p.Manager)
               .WithMany()
               .HasForeignKey(p => p.ManagerId)
               .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
        .HasOne(m => m.Sender)
        .WithMany()
        .HasForeignKey(m => m.SenderUserId)
        .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Project>()
           .HasMany(p => p.UsersInProjects)
           .WithOne(uip => uip.Project)
           .HasForeignKey(uip => uip.ProjectId);

            modelBuilder.Entity<UserInProject>()
            .HasOne(uip => uip.User)
            .WithMany(u => u.UsersInProjects)
            .HasForeignKey(uip => uip.UserId);


            modelBuilder.Entity<UserInProject>()
                .HasKey(up => new { up.ProjectId, up.UserId });

            var db = new DbInitializer(modelBuilder);
            db.SeedProjects();
            //db.SeedRoles();
            db.SeedUsers();
            modelBuilder.HasDefaultSchema("identity");
        }

        public DbSet<Project> Projects { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<UserInProject> UsersInProjects { get; set; }
    }
}