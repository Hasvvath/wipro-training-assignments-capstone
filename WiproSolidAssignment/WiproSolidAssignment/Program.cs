using WiproSolidAssignment.Services;
using WiproSolidAssignment.Formatters;
using WiproSolidAssignment.Models;
class Program
{
    static void Main()
    {
        // SOLID
        var generator = new ReportGenerator();
        var formatter = new ExcelFormatter();
        var saver = new ReportSaver();
        var service = new ReportService(generator, formatter, saver);
        service.ProcessReport();

        // Singleton
        var logger1 = Logger.Instance;
        var logger2 = Logger.Instance;
        logger1.Log("Singleton Logger Working");
        Console.WriteLine(object.ReferenceEquals(logger1, logger2)); // true

        // Factory
        var doc = DocumentFactory.Create("PDF");
        doc.Print();

        Console.WriteLine("Assignment Completed");
        Report r1 = new SalesReport();
        Report r2 = new InventoryReport();

        Console.WriteLine(r1.GetContent());
        Console.WriteLine(r2.GetContent());
    }
}