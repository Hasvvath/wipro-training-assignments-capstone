using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;


namespace WiproRazorApp.Pages
{
    public class ItemsModel : PageModel
    {
        public static List<string> Items = new();

        public void OnGet()
        {
        }
    }
}
