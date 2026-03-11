using FinanceManagementSystem.Data;
using FinanceManagementSystem.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinanceManagementSystem.Controllers
{
    public class ExpenseCategoriesController : Controller
    {
        private readonly ApplicationDbContext _context;
        public ExpenseCategoriesController(ApplicationDbContext context) => _context = context;

        public async Task<IActionResult> Index()
        {
            var cats = await _context.ExpenseCategories.ToListAsync();
            return View(cats);
        }

        public IActionResult Create() => View();

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(ExpenseCategory category)
        {
            if (!ModelState.IsValid) return View(category);
            _context.ExpenseCategories.Add(category);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        public async Task<IActionResult> Delete(int id)
        {
            var cat = await _context.ExpenseCategories.FindAsync(id);
            if (cat == null) return NotFound();
            return View(cat);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var cat = await _context.ExpenseCategories.FindAsync(id);
            if (cat != null) _context.ExpenseCategories.Remove(cat);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }
    }
}