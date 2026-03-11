using System.ComponentModel.DataAnnotations;

namespace FoodDeliveryApp.Models
{
    public class ProductSold
    {
        [Key]
        public int ProductId { get; set; }
        public int SaleId { get; set; }
        public int Qty { get; set; }
        public decimal TotalProductAmount { get; set; }
        public string Status { get; set; }
    }
}