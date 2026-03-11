using Microsoft.EntityFrameworkCore;
using Models1;

namespace DAL
{
    public class PharmacyContext : DbContext
    {
        public PharmacyContext(DbContextOptions<PharmacyContext> options)
            : base(options)
        {
        }

        public DbSet<Pharmacy> pharmacies { get; set; }
        public DbSet<Medicine> medicines { get; set; }
    }
}
