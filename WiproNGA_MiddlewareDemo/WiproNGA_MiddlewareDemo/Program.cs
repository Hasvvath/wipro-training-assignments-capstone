using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WiproNGA_MiddlewareDemo.Data;

var builder = WebApplication.CreateBuilder(args);


builder.Services.AddRazorPages();

var app = builder.Build();



app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    await next(); // call next middleware
    Console.WriteLine($"Response Status: {context.Response.StatusCode}");
});


app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "text/html";
        await context.Response.WriteAsync("<h1>Something went wrong!</h1><p>Please try again later.</p>");
    });
});


app.UseHttpsRedirection();


app.Use(async (context, next) =>
{
    context.Response.Headers.Add(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self';"
    );
    await next();
});


app.UseStaticFiles();


app.MapGet("/", () => "Middleware + Static Files Demo is running!");
app.MapRazorPages();


app.Run();
