using Fracto.API.Data;
using Fracto.API.DTOs;
using Fracto.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _environment;

        public DoctorController(ApplicationDbContext context, IWebHostEnvironment environment)
        {
            _context = context;
            _environment = environment;
        }

        [HttpGet]
        public IActionResult GetDoctors([FromQuery] string? city)
        {
            var query = _context.Doctors.AsQueryable();

            if (!string.IsNullOrWhiteSpace(city))
            {
                var normalizedCity = city.Trim().ToLower();
                query = query.Where(d => d.City.ToLower() == normalizedCity);
            }

            var doctors = query.Select(d => new
            {
                doctorId = d.DoctorId,
                name = d.Name,
                specialization = d.Specialization,
                rating = d.Rating,
                city = d.City,
                hospitalName = d.HospitalName,
                experience = d.Experience,
                profileImage = d.ProfileImage
            }).ToList();

            return Ok(doctors);
        }

        [HttpGet("{id}")]
        public IActionResult GetDoctorById(int id)
        {
            var doctor = _context.Doctors
                .Where(d => d.DoctorId == id)
                .Select(d => new
                {
                    doctorId = d.DoctorId,
                    name = d.Name,
                    specialization = d.Specialization,
                    rating = d.Rating,
                    city = d.City,
                    hospitalName = d.HospitalName,
                    experience = d.Experience,
                    profileImage = d.ProfileImage
                })
                .FirstOrDefault();

            if (doctor == null)
                return NotFound("Doctor not found");

            return Ok(doctor);
        }

        [HttpPost]
        public IActionResult CreateDoctor([FromForm] CreateDoctorDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name) ||
                string.IsNullOrWhiteSpace(dto.Specialization) ||
                string.IsNullOrWhiteSpace(dto.City) ||
                string.IsNullOrWhiteSpace(dto.HospitalName))
            {
                return BadRequest("Name, specialization, city and hospital name are required");
            }

            if (dto.Experience < 0)
            {
                return BadRequest("Experience cannot be negative");
            }

            string? imagePath = SaveImage(dto.Image);

            var doctor = new Doctor
            {
                Name = dto.Name.Trim(),
                Specialization = dto.Specialization.Trim(),
                Rating = dto.Rating,
                City = dto.City.Trim(),
                HospitalName = dto.HospitalName.Trim(),
                Experience = dto.Experience,
                ProfileImage = imagePath
            };

            _context.Doctors.Add(doctor);
            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                message = "Doctor created successfully",
                doctorId = doctor.DoctorId
            });
        }

        [HttpPut("{id}")]
        public IActionResult UpdateDoctor(int id, [FromForm] UpdateDoctorDto dto)
        {
            var doctor = _context.Doctors.FirstOrDefault(d => d.DoctorId == id);
            if (doctor == null)
                return NotFound("Doctor not found");

            if (dto.Experience < 0)
            {
                return BadRequest("Experience cannot be negative");
            }

            doctor.Name = dto.Name.Trim();
            doctor.Specialization = dto.Specialization.Trim();
            doctor.Rating = dto.Rating;
            doctor.City = dto.City.Trim();
            doctor.HospitalName = dto.HospitalName.Trim();
            doctor.Experience = dto.Experience;

            if (dto.Image != null)
            {
                doctor.ProfileImage = SaveImage(dto.Image);
            }

            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                message = "Doctor updated successfully"
            });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteDoctor(int id)
        {
            var doctor = _context.Doctors.FirstOrDefault(d => d.DoctorId == id);
            if (doctor == null)
                return NotFound("Doctor not found");

            _context.Doctors.Remove(doctor);
            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                message = "Doctor deleted successfully"
            });
        }

        private string? SaveImage(IFormFile? image)
        {
            if (image == null || image.Length == 0)
                return null;

            var uploadsFolder = Path.Combine(_environment.WebRootPath!, "uploads", "doctors");

            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using var stream = new FileStream(filePath, FileMode.Create);
            image.CopyTo(stream);

            return $"/uploads/doctors/{fileName}";
        }
    }
}
