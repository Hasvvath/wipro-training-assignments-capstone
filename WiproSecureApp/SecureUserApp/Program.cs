using SecureUserApp.Services;
using Serilog;

Log.Logger = new LoggerConfiguration()
    .WriteTo.File("logs.txt")
    .CreateLogger();

var service = new UserService();

while (true)
{
    Console.WriteLine("\n1. Register");
    Console.WriteLine("2. Login");
    Console.WriteLine("3. Exit");
    Console.Write("Enter choice: ");

    string input = Console.ReadLine();

    if (input == "1")
    {
        Console.Write("Username: ");
        string u = Console.ReadLine();

        Console.Write("Password: ");
        string p = Console.ReadLine();

        Console.Write("Email: ");
        string e = Console.ReadLine();

        service.Register(u, p, e);
        Console.WriteLine("Registered Successfully");
    }
    else if (input == "2")
    {
        Console.Write("Username: ");
        string u = Console.ReadLine();

        Console.Write("Password: ");
        string p = Console.ReadLine();

        bool result = service.Login(u, p);
        Console.WriteLine(result ? "Login Success" : "Login Failed");
    }
    else if (input == "3")
    {
        break;
    }
    else
    {
        Console.WriteLine("Invalid choice");
    }
}