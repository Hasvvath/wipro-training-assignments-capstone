using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;

namespace WiproSolidAssignment.Services
{
    public class ReportService
    {
        private readonly IReportGenerator _generator;
        private readonly IReportFormatter _formatter;
        private readonly IReportSaver _saver;

        public ReportService(IReportGenerator generator, IReportFormatter formatter, IReportSaver saver)
        {
            _generator = generator;
            _formatter = formatter;
            _saver = saver;
        }

        public void ProcessReport()
        {
            var data = _generator.GenerateReport();
            var formatted = _formatter.Format(data);
            _saver.Save(formatted);
        }
    }
}
