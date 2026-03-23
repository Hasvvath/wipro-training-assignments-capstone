using Fracto.API.Data;
using Fracto.API.DTOs;
using Fracto.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

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
        [HttpPost("add")]
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

            var alreadyRated = _context.Ratings.Any(r =>
                r.AppointmentId == dto.AppointmentId &&
                r.UserId == dto.UserId);

            if (alreadyRated)
                return BadRequest("You already rated this appointment.");

            var status = (appointment.Status ?? "").Trim().ToLower();
            var canRateByStatus = status == "attended" || status == "present";
            var canRateByTime = IsAppointmentTimeOver(appointment);

            if (!canRateByStatus && !canRateByTime)
                return BadRequest("Rating allowed only after appointment is completed.");

            _context.Ratings.Add(new Rating
            {
                UserId = dto.UserId,
                DoctorId = dto.DoctorId,
                AppointmentId = dto.AppointmentId,
                Score = dto.Rating
            });

            _context.SaveChanges();

            var doctor = _context.Doctors.FirstOrDefault(d => d.DoctorId == dto.DoctorId);
            if (doctor == null)
                return NotFound("Doctor not found.");

            var avg = _context.Ratings
                .Where(r => r.DoctorId == dto.DoctorId)
                .Average(r => (double)r.Score);

            doctor.Rating = Math.Round(avg, 1);
            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                message = "Rating submitted successfully",
                doctorId = doctor.DoctorId,
                updatedDoctorRating = doctor.Rating
            });
        }

        [HttpGet]
        public IActionResult GetRatings()
        {
            return Ok(_context.Ratings.ToList());
        }

        private static bool IsAppointmentTimeOver(Appointment appointment)
        {
            if (!TryBuildAppointmentDateTime(appointment, out var scheduled))
                return false;

            return scheduled <= DateTime.Now;
        }

        private static bool TryBuildAppointmentDateTime(Appointment appointment, out DateTime result)
        {
            result = default;

            if (appointment.AppointmentDate == default)
                return false;

            var date = appointment.AppointmentDate.Date;

            if (string.IsNullOrWhiteSpace(appointment.TimeSlot))
                return false;

            var slot = appointment.TimeSlot.Trim();

            // Accept formats like: "09:00", "10:30", "09:00 AM", "10:30 AM - 20 / 20 slots left"
            var normalized = slot.Split('-')[0].Trim();

            string[] formats =
            {
                "HH:mm",
                "H:mm",
                "hh:mm tt",
                "h:mm tt",
                "HH:mm:ss",
                "H:mm:ss"
            };

            if (!DateTime.TryParseExact(normalized, formats, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsedTime))
                return false;

            result = date.AddHours(parsedTime.Hour).AddMinutes(parsedTime.Minute).AddSeconds(parsedTime.Second);
            return true;
        }
    }
}
