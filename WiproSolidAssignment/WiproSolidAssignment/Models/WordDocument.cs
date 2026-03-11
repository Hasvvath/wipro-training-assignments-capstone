using System;
using System.Collections.Generic;
using System.Text;

using WiproSolidAssignment.Interfaces;

namespace WiproSolidAssignment.Models
{
    public class WordDocument : IDocument
    {
        public void Print()
        {
            Console.WriteLine("Printing Word Document");
        }
    }
}
