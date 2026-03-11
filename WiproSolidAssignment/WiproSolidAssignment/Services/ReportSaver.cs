using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;

namespace WiproSolidAssignment.Services
{
    public class ReportSaver : IReportSaver
    {
        public void Save(string content)
        {
            Console.WriteLine("Report Saved: " + content);
        }
    }
}
