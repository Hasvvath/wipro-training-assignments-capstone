using Microsoft.AspNetCore.Http;

namespace Fracto.API.DTOs
{
    public class UpdateDoctorDto
    {
        public string Name { get; set; } = string.Empty;

        public string Specialization { get; set; } = string.Empty;

        public double Rating { get; set; }

        public string City { get; set; } = string.Empty;

        public int Experience { get; set; }


        public string HospitalName { get; set; } = string.Empty;

        public IFormFile? Image { get; set; }
    }
}
