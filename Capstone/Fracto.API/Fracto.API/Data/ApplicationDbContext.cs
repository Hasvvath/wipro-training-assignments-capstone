using Microsoft.EntityFrameworkCore;
using Fracto.API.Models;

namespace Fracto.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Doctor> Doctors { get; set; }

        public DbSet<Specialization> Specializations { get; set; }

        public DbSet<Appointment> Appointments { get; set; }

        public DbSet<Rating> Ratings { get; set; }
    }
}