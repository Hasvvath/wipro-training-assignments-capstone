using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FoodDeliveryApp.Models;

namespace FoodDeliveryApp.Data
{
    public class ApplicationDbContext : IdentityDbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }
        public DbSet<Food> Foods { get; set; }
        public DbSet<Cart> Carts { get; set; }
        public DbSet<Sale> Sales { get; set; }
        public DbSet<ProductSold> ProductsSold { get; set; }
    }
}