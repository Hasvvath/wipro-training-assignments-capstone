using System.ComponentModel.DataAnnotations;

namespace FoodDeliveryApp.Models
{
    public class Sale
    {
        [Key]
        public int SaleId { get; set; }
        public decimal TotalAmount { get; set; }
        public string UserId { get; set; }
        public DateTime Date { get; set; }
        public string Status { get; set; }
    }
}