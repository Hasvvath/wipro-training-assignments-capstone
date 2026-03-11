using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;

namespace WiproSolidAssignment.Formatters
{
    public class ExcelFormatter : IReportFormatter
    {
        public string Format(string content)
        {
            return "[EXCEL] " + content;
        }
    }
}