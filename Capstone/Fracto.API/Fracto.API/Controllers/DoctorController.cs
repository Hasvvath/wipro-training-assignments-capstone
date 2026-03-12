using Microsoft.AspNetCore.Mvc;
using Fracto.API.Data;
using Fracto.API.Models;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DoctorController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DoctorController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetDoctors()
        {
            var doctors = _context.Doctors.ToList();
            return Ok(doctors);
        }

        [HttpPost]
        public IActionResult AddDoctor(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            _context.SaveChanges();
            return Ok(doctor);
        }
    }
}