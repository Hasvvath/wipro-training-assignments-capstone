using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace LibraryManagement
{
    public class Book
    {
        // Properties
        public string Title { get; set; }
        public string Author { get; set; }
        public string ISBN { get; set; }
        public bool IsBorrowed { get; private set; }

        // Constructor
        public Book(string title, string author, string isbn)
        {
            Title = title;
            Author = author;
            ISBN = isbn;
            IsBorrowed = false;
        }

        // Mark book as borrowed
        public void Borrow()
        {
            IsBorrowed = true;
        }

        // Mark book as returned
        public void Return()
        {
            IsBorrowed = false;
        }
    }
}

