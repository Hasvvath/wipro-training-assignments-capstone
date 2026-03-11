using System.ComponentModel.DataAnnotations;

namespace FinanceManagementSystem.Models
{
    public class ExpenseCategory
    {
        [Key]
        public int CategoryId { get; set; }

        [Required]
        public string CategoryName { get; set; } = null!;
    }
}