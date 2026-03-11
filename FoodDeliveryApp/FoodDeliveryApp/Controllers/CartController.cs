using FoodDeliveryApp.Data;
using FoodDeliveryApp.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

[Authorize]
public class CartController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<IdentityUser> _userManager;

    public CartController(ApplicationDbContext context, UserManager<IdentityUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public IActionResult AddToCart(int foodId)
    {
        var userId = _userManager.GetUserId(User);

        var food = _context.Foods.Find(foodId);

        Cart cart = new Cart
        {
            FoodId = foodId,
            Qty = 1,
            Price = food.Price,
            TotalAmount = food.Price,
            CustomerId = userId
        };

        _context.Carts.Add(cart);
        _context.SaveChanges();

        return RedirectToAction("Index", "Foods");
    }
}