using Microsoft.AspNetCore.Mvc;
using Fracto.API.Data;
using Fracto.API.Models;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AppointmentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AppointmentController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public IActionResult BookAppointment(Appointment appointment)
        {
            appointment.Status = "Booked";

            _context.Appointments.Add(appointment);
            _context.SaveChanges();

            return Ok(appointment);
        }

        [HttpGet]
        public IActionResult GetAppointments()
        {
            return Ok(_context.Appointments.ToList());
        }
    }
}