using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FoodDeliveryApp.Models
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        public int FoodId { get; set; }
        public int Qty { get; set; }
        public decimal Price { get; set; }
        public decimal TotalAmount { get; set; }

        public string CustomerId { get; set; }
    }
}