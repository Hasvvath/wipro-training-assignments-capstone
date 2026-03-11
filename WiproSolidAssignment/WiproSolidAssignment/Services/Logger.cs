using System;
using System.Collections.Generic;
using System.Text;

namespace WiproSolidAssignment.Services
{
    public class Logger
    {
        private static Logger _instance;

        private Logger() { }

        public static Logger Instance
        {
            get
            {
                if (_instance == null)
                    _instance = new Logger();
                return _instance;
            }
        }

        public void Log(string message)
        {
            Console.WriteLine("LOG: " + message);
        }
    }
}
