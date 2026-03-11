using System.ComponentModel.DataAnnotations.Schema;

namespace Models1
{
    public class Medicine
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public int PharmacyId { get; set; }

        [ForeignKey("PharmacyId")]
        public Pharmacy? pharma { get; set; }

        public int Qty { get; set; }
    }
}
