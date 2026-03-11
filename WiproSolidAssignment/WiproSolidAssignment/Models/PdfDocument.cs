using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;

namespace WiproSolidAssignment.Models
{
    public class PdfDocument : IDocument
    {
        public void Print()
        {
            Console.WriteLine("Printing PDF Document");
        }
    }
}