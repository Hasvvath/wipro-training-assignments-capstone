using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;

namespace WiproSolidAssignment.Services
{
    public class ReportGenerator : IReportGenerator
    {
        public string GenerateReport()
        {
            return "Sales Report Data";
        }
    }
}