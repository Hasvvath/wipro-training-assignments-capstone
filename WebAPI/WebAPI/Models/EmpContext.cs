using Microsoft.EntityFrameworkCore;

namespace WebAPI.Models
{
    public class EmpContext : DbContext
    {
        public EmpContext(DbContextOptions<EmpContext> options) : base(options)
        {

        }
        public DbSet<Department> departments { get; set; }
        public DbSet<Employee> Employees { get; set; }
    }
}
