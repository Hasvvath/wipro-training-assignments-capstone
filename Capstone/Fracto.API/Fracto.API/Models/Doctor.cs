namespace Fracto.API.Models
{
    public class Doctor
    {
        public int DoctorId { get; set; }

        public string Name { get; set; }

        public string City { get; set; }

        public int SpecializationId { get; set; }

        public double Rating { get; set; }

        public string? Image { get; set; }
    }
}