using Microsoft.AspNetCore.Mvc;
using Fracto.API.Data;
using Fracto.API.Models;
using Fracto.API.DTOs;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RatingController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public RatingController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [HttpPost]
        public IActionResult AddRating([FromBody] AddRatingDto dto)
        {
            if (dto == null || dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            var appointment = _context.Appointments.FirstOrDefault(a =>
                a.AppointmentId == dto.AppointmentId &&
                a.UserId == dto.UserId &&
                a.DoctorId == dto.DoctorId);

            if (appointment == null)
                return BadRequest("Invalid appointment/user/doctor.");

            if (!string.Equals(appointment.Status, "Attended", StringComparison.OrdinalIgnoreCase))
                return BadRequest("Rating allowed only after appointment is attended.");

            var alreadyRated = _context.Ratings.Any(r =>
                r.AppointmentId == dto.AppointmentId &&
                r.UserId == dto.UserId);

            if (alreadyRated)
                return BadRequest("You already rated this appointment.");

            _context.Ratings.Add(new Rating
            {
                UserId = dto.UserId,
                DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
                Score = dto.Rating
            });

            var doctor = _context.Doctors.FirstOrDefault(d => d.DoctorId == dto.DoctorId);
            if (doctor == null)
                return NotFound("Doctor not found.");

            _context.SaveChanges();

            var avg = _context.Ratings
                .Where(r => r.DoctorId == dto.DoctorId)
                .Average(r => (double)r.Score);

            doctor.Rating = Math.Round(avg, 1);

            _context.SaveChanges();

            return Ok(new { success = true, message = "Rating submitted successfully" });
        }


        [HttpGet]
        public IActionResult GetRatings()
        {
            return Ok(_context.Ratings.ToList());
        }
    }
}