var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Force HTTPS
app.UseHttpsRedirection();

// Custom Logging Middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request: {context.Request.Method} {context.Request.Path}");
    await next.Invoke();
    Console.WriteLine($"Response Status: {context.Response.StatusCode}");
});

// Custom Error Handling Middleware
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("Something went wrong! Custom Error Page");
    });
});

// Content Security Policy (Basic Security)
app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Content-Security-Policy", "default-src 'self'");
    await next();
});

// Serve static files from wwwroot
app.UseStaticFiles();

app.MapGet("/", () => "Middleware App Running");

app.Run();