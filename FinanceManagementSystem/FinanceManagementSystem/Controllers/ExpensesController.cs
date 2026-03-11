using FinanceManagementSystem.Data;
using FinanceManagementSystem.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace FinanceManagementSystem.Controllers
{
    [Authorize]
    public class ExpensesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ExpensesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // Helper: get current App UserId from Identity
        private int GetCurrentUserId()
        {
            var identityUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var appUser = _context.Users.FirstOrDefault(u => u.IdentityUserId == identityUserId);

            // If not found, create App User automatically
            if (appUser == null)
            {
                appUser = new Models.User
                {
                    IdentityUserId = identityUserId!,
                    Username = User.Identity!.Name ?? "User",
                    Email = User.Identity!.Name ?? "unknown@mail.com"
                };

                _context.Users.Add(appUser);
                _context.SaveChanges();
            }

            return appUser.UserId;
        }

        // GET: /Expenses  -> only MY expenses
        public async Task<IActionResult> Index()
        {
            var appUserId = GetCurrentUserId();

            var expenses = await _context.Expenses
                .Where(e => e.UserId == appUserId)
                .Include(e => e.Category)
                .OrderByDescending(e => e.Date)
                .ToListAsync();

            return View(expenses);
        }

        // GET: /Expenses/Create
        public IActionResult Create()
        {
            ViewData["CategoryId"] = new SelectList(_context.ExpenseCategories, "CategoryId", "CategoryName");
            return View();
        }

        // POST: /Expenses/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Expense expense)
        {
            var appUserId = GetCurrentUserId();
            expense.UserId = appUserId;   // 🔒 force ownership

            if (!ModelState.IsValid)
            {
                ViewData["CategoryId"] = new SelectList(_context.ExpenseCategories, "CategoryId", "CategoryName", expense.CategoryId);
                return View(expense);
            }

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        // GET: /Expenses/Edit/5
        public async Task<IActionResult> Edit(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            var appUserId = GetCurrentUserId();
            if (expense.UserId != appUserId) return Forbid();   // 🔒 block others

            ViewData["CategoryId"] = new SelectList(_context.ExpenseCategories, "CategoryId", "CategoryName", expense.CategoryId);
            return View(expense);
        }

        // POST: /Expenses/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, Expense expense)
        {
            if (id != expense.ExpenseId) return NotFound();

            var appUserId = GetCurrentUserId();
            if (expense.UserId != appUserId) return Forbid();   // 🔒 block others

            if (!ModelState.IsValid)
            {
                ViewData["CategoryId"] = new SelectList(_context.ExpenseCategories, "CategoryId", "CategoryName", expense.CategoryId);
                return View(expense);
            }

            _context.Update(expense);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        // GET: /Expenses/Delete/5
        public async Task<IActionResult> Delete(int id)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.ExpenseId == id);

            if (expense == null) return NotFound();

            var appUserId = GetCurrentUserId();
            if (expense.UserId != appUserId) return Forbid();   // 🔒 block others

            return View(expense);
        }

        // POST: /Expenses/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var expense = await _context.Expenses.FindAsync(id);
            if (expense == null) return NotFound();

            var appUserId = GetCurrentUserId();
            if (expense.UserId != appUserId) return Forbid();   // 🔒 block others

            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        // Report: only MY expenses
        public async Task<IActionResult> Report(DateTime? fromDate, DateTime? toDate)
        {
            var appUserId = GetCurrentUserId();

            var query = _context.Expenses
                .Where(e => e.UserId == appUserId)
                .Include(e => e.Category)
                .AsQueryable();

            if (fromDate.HasValue) query = query.Where(e => e.Date >= fromDate.Value.Date);
            if (toDate.HasValue) query = query.Where(e => e.Date <= toDate.Value.Date.AddDays(1).AddTicks(-1));

            var list = await query.OrderByDescending(e => e.Date).ToListAsync();
            return View(list);
        }
    }
}