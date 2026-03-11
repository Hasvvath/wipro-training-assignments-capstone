using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FoodDeliveryApp.Data;
using FoodDeliveryApp.Models;

namespace FoodDeliveryApp.Controllers
{
    [Authorize(Roles = "Admin")]
    public class FoodsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public FoodsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        public async Task<IActionResult> Index()
        {
            var foods = await _context.Foods.Include(f => f.Category).ToListAsync();
            return View(foods);
        }

        // GET: Foods/Create
        public IActionResult Create()
        {
            ViewBag.Categories = _context.Categories.ToList();
            return View();
        }

        // POST: Foods/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Food food)
        {
            if (ModelState.IsValid)
            {
                _context.Foods.Add(food);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.Categories = _context.Categories.ToList();
            return View(food);
        }

        // GET: Foods/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var food = await _context.Foods.FindAsync(id);
            if (food == null) return NotFound();

            ViewBag.Categories = _context.Categories.ToList();
            return View(food);
        }

        // POST: Foods/Edit
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Food food)
        {
            if (ModelState.IsValid)
            {
                _context.Update(food);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }

            ViewBag.Categories = _context.Categories.ToList();
            return View(food);
        }
    }
}