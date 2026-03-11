using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace LibraryManagement
{
    public class Borrower
    {
        // Properties
        public string Name { get; set; }
        public string LibraryCardNumber { get; set; }
        public List<Book> BorrowedBooks { get; private set; }

        // Constructor
        public Borrower(string name, string libraryCardNumber)
        {
            Name = name;
            LibraryCardNumber = libraryCardNumber;
            BorrowedBooks = new List<Book>();
        }

        // Borrow a book
        public void BorrowBook(Book book)
        {
            BorrowedBooks.Add(book);
        }

        // Return a book
        public void ReturnBook(Book book)
        {
            BorrowedBooks.Remove(book);
        }
    }
}

