using Fracto.API.Data;
using Fracto.API.DTOs;
using Fracto.API.Models;
using Microsoft.AspNetCore.Mvc;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorLeaveController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorLeaveController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetLeaves()
        {
            var leaves = _context.DoctorLeaves
                .Select(l => new
                {
                    id = l.DoctorLeaveId,
                    doctorId = l.DoctorId,
                    leaveDate = l.LeaveDate,
                    isFullDay = l.IsFullDay,
                    timeSlot = l.TimeSlot,
                    reason = l.Reason
                })
                .ToList();

            return Ok(leaves);
        }

        [HttpPost]
        public IActionResult AddLeave([FromBody] CreateDoctorLeaveDto dto)
        {
            if (dto.DoctorId <= 0) return BadRequest("Doctor is required.");
            if (dto.LeaveDate == default) return BadRequest("Leave date is required.");
            if (!dto.IsFullDay && string.IsNullOrWhiteSpace(dto.TimeSlot))
                return BadRequest("Time slot is required for slot leave.");

            var doctor = _context.Doctors.FirstOrDefault(d => d.DoctorId == dto.DoctorId);
            if (doctor == null) return NotFound("Doctor not found.");

            var leaveDate = dto.LeaveDate.Date;
            var normalizedLeaveSlot = NormalizeSlot(dto.TimeSlot);

            var duplicate = _context.DoctorLeaves.Any(l =>
                l.DoctorId == dto.DoctorId &&
                l.LeaveDate.Date == leaveDate &&
                l.IsFullDay == dto.IsFullDay &&
                (dto.IsFullDay || NormalizeSlot(l.TimeSlot) == normalizedLeaveSlot));

            if (duplicate) return BadRequest("Leave already exists for this doctor/date/slot.");

            var leave = new DoctorLeave
            {
                DoctorId = dto.DoctorId,
                LeaveDate = leaveDate,
                IsFullDay = dto.IsFullDay,
                TimeSlot = dto.IsFullDay ? null : normalizedLeaveSlot,
                Reason = dto.Reason
            };

            _context.DoctorLeaves.Add(leave);

            var appointments = _context.Appointments
                .Where(a => a.DoctorId == dto.DoctorId && a.AppointmentDate.Date == leaveDate)
                .ToList();

            var affected = appointments
                .Where(a =>
                    IsBookedLike(a.Status) &&
                    (dto.IsFullDay || NormalizeSlot(a.TimeSlot) == normalizedLeaveSlot))
                .ToList();

            foreach (var a in affected)
            {
                a.Status = "CancelledDoctorUnavailable";
                a.CancellationReason = "Your booking was cancelled due to doctor unavailable.";
            }

            _context.SaveChanges();

            return Ok(new
            {
                success = true,
                message = "Leave saved successfully.",
                cancelledAppointments = affected.Count
            });
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteLeave(int id)
        {
            var leave = _context.DoctorLeaves.FirstOrDefault(l => l.DoctorLeaveId == id);
            if (leave == null) return NotFound("Leave not found.");

            _context.DoctorLeaves.Remove(leave);
            _context.SaveChanges();

            return Ok(new { success = true, message = "Leave deleted successfully." });
        }

        private static bool IsBookedLike(string? status)
        {
            var s = (status ?? "").Trim().ToLower();
            return s == "booked" || s == "waiting";
        }

        private static string NormalizeSlot(string? slot)
        {
            if (string.IsNullOrWhiteSpace(slot)) return "";
            var s = slot.Trim();
            if (s.Contains('-')) s = s.Split('-')[0].Trim(); // handles "07:00 PM - ..."
            return s.ToUpper()
                .Replace(" AM", "")
                .Replace(" PM", "")
                .Trim();
        }
    }
}
