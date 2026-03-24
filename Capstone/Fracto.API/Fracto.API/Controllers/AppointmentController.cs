using Fracto.API.Data;
using Fracto.API.DTOs;
using Fracto.API.Hubs;
using Fracto.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<NotificationHub> _hub;

        public AppointmentController(ApplicationDbContext context, IHubContext<NotificationHub> hub)
        {
            _context = context;
            _hub = hub;
        }

        [HttpGet]
        public IActionResult GetAppointments()
        {
            var appointments = _context.Appointments
                .Select(a => new
                {
                    appointmentId = a.AppointmentId,
                    userId = a.UserId,
                    doctorId = a.DoctorId,
                    appointmentDate = a.AppointmentDate,
                    timeSlot = a.TimeSlot,
                    status = a.Status,
                    consultationType = a.ConsultationType,
                    meetingLink = a.MeetingLink,
                    cancellationReason = a.CancellationReason,
                    doctorName = _context.Doctors
                        .Where(d => d.DoctorId == a.DoctorId)
                        .Select(d => d.Name)
                        .FirstOrDefault()
                })
                .ToList();

            return Ok(appointments);
        }

        [HttpPost("book")]
        public async Task<IActionResult> BookDoctorAppointment([FromBody] BookAppointmentDto dto)
        {
            if (dto == null) return BadRequest("Invalid request");

            var allowedSlots = new Dictionary<string, int>
            {
                { "09:00", 10 },
                { "10:30", 20 },
                { "14:00", 20 },
                { "16:30", 20 },
                { "19:00", 20 }
            };

            if (!allowedSlots.ContainsKey(dto.TimeSlot))
                return BadRequest("Invalid time slot");

            var sameUserSameSlot = _context.Appointments.Any(a =>
                a.UserId == dto.UserId &&
                a.AppointmentDate.Date == dto.AppointmentDate.Date &&
                a.TimeSlot == dto.TimeSlot);

            if (sameUserSameSlot)
                return BadRequest("You already booked this slot for the day");

            var bookedCount = _context.Appointments.Count(a =>
                a.DoctorId == dto.DoctorId &&
                a.AppointmentDate.Date == dto.AppointmentDate.Date &&
                a.TimeSlot == dto.TimeSlot &&
                a.Status != "Cancelled");

            if (bookedCount >= allowedSlots[dto.TimeSlot])
                return BadRequest("This slot is full");

            var consultationType = string.Equals(dto.ConsultationType, "OnlineConsultation", StringComparison.OrdinalIgnoreCase)
                ? "OnlineConsultation"
                : "InPerson";

            var appointment = new Appointment
            {
                UserId = dto.UserId,
                DoctorId = dto.DoctorId,
                AppointmentDate = dto.AppointmentDate,
                TimeSlot = dto.TimeSlot,
                Status = "Booked",
                ConsultationType = consultationType,
                MeetingLink = consultationType == "OnlineConsultation" ? dto.MeetingLink : null
            };

            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            await _hub.Clients.Group($"user-{appointment.UserId}").SendAsync("AppointmentBooked", new
            {
                message = $"Appointment booked for {appointment.AppointmentDate:dd-MMM-yyyy} at {appointment.TimeSlot}.",
                type = "success",
                appointmentId = appointment.AppointmentId
            });

            await _hub.Clients.Group("role-admin").SendAsync("AppointmentBooked", new
            {
                message = $"New appointment booked by user #{appointment.UserId}.",
                type = "info",
                appointmentId = appointment.AppointmentId
            });

            return Ok(new
            {
                success = true,
                message = "Appointment booked successfully",
                appointmentId = appointment.AppointmentId
            });
        }

        [HttpGet("slots/{doctorId}")]
        public IActionResult GetAvailableSlots(int doctorId)
        {
            var bookedSlots = _context.Appointments
                .Where(a => a.DoctorId == doctorId)
                .Select(a => a.TimeSlot)
                .ToList();

            return Ok(bookedSlots);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAppointment(int id, [FromBody] Appointment updatedAppointment)
        {
            var appointment = _context.Appointments.FirstOrDefault(a => a.AppointmentId == id);
            if (appointment == null)
                return NotFound("Appointment not found");

            if (!string.IsNullOrWhiteSpace(updatedAppointment.Status))
            {
                appointment.Status = updatedAppointment.Status;
            }

            _context.SaveChanges();

            await _hub.Clients.Group($"user-{appointment.UserId}").SendAsync("ReceiveNotification", new
            {
                message = $"Appointment #{appointment.AppointmentId} updated to {appointment.Status}.",
                type = "info",
                appointmentId = appointment.AppointmentId
            });

            return Ok(new
            {
                success = true,
                message = "Appointment updated successfully"
            });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAppointment(int id)
        {
            var appointment = _context.Appointments.FirstOrDefault(a => a.AppointmentId == id);
            if (appointment == null)
                return NotFound("Appointment not found");

            var userId = appointment.UserId;
            var appointmentId = appointment.AppointmentId;

            _context.Appointments.Remove(appointment);
            _context.SaveChanges();

            await _hub.Clients.Group($"user-{userId}").SendAsync("AppointmentCancelled", new
            {
                message = "Your appointment has been cancelled.",
                type = "warning",
                appointmentId
            });

            await _hub.Clients.Group("role-admin").SendAsync("AppointmentCancelled", new
            {
                message = $"Appointment #{appointmentId} cancelled.",
                type = "warning",
                appointmentId
            });

            return Ok(new
            {
                success = true,
                message = "Appointment deleted successfully"
            });
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateAppointmentStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
        {
            var appointment = _context.Appointments.FirstOrDefault(a => a.AppointmentId == id);
            if (appointment == null) return NotFound("Appointment not found");

            if (string.IsNullOrWhiteSpace(dto.Status))
                return BadRequest("Status is required");

            appointment.Status = dto.Status;
            _context.SaveChanges();

            await _hub.Clients.Group($"user-{appointment.UserId}").SendAsync("ReceiveNotification", new
            {
                message = $"Appointment status updated to {appointment.Status}.",
                type = "info",
                appointmentId = appointment.AppointmentId
            });

            return Ok(new { success = true, message = "Appointment status updated successfully" });
        }
    }
}
