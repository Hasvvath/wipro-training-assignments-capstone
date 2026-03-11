using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using PartySignupApp.Data;
using PartySignupApp.Models;
using System.Linq;

namespace PartySignupApp.Controllers
{
    public class PartiesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public PartiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Parties
        public IActionResult Index()
        {
            return View(_context.Parties.ToList());
        }

        // GET: Parties/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: Parties/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult Create(Party party)
        {
            if (ModelState.IsValid)
            {
                _context.Parties.Add(party);
                _context.SaveChanges();
                return RedirectToAction(nameof(Index));
            }
            return View(party);
        }

        // ✅ STEP 10 - Signup Page
        public IActionResult Signup()
        {
            ViewBag.Parties = new SelectList(_context.Parties, "Id", "Name");
            return View();
        }
        [HttpPost]
        public IActionResult Signup(int partyId)
        {
            
            TempData["Msg"] = "Signup successful for Party Id: " + partyId;
            return RedirectToAction("Signup");
        }

        // ✅ STEP 12 - Ajax method
        [HttpGet]
        public JsonResult AllowSignUp(int partyId)
        {
            var party = _context.Parties.FirstOrDefault(p => p.Id == partyId);

            if (party == null)
                return Json("Invalid");

            if (party.IsExternal)
                return Json("External");

            return Json("Internal");
        }
    }
}