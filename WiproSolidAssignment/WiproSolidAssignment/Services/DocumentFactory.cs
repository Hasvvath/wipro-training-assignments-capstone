using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;
using WiproSolidAssignment.Models;

namespace WiproSolidAssignment.Services
{
    public class DocumentFactory
    {
        public static IDocument Create(string type)
        {
            if (type == "PDF")
                return new PdfDocument();
            else if (type == "WORD")
                return new WordDocument();
            else
                throw new Exception("Invalid Document Type");
        }
    }
}