using Microsoft.AspNetCore.Mvc;
using Fracto.API.Data;
using Fracto.API.Models;

namespace Fracto.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Register(User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }
    }
}