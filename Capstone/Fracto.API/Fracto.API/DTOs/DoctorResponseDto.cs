namespace Fracto.API.DTOs
{
    public class DoctorResponseDto
    {
        public int DoctorId { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Specialization { get; set; } = string.Empty;

        public double Rating { get; set; }

        public string City { get; set; } = string.Empty;

        public int Experience { get; set; }


        public string? ProfileImage { get; set; }
    }
}
