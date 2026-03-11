using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LibraryManagement
{
    public class Library
    {
        // Properties
        public List<Book> Books { get; private set; }
        public List<Borrower> Borrowers { get; private set; }

        // Constructor
        public Library()
        {
            Books = new List<Book>();
            Borrowers = new List<Borrower>();
        }

        // Add new book
        public void AddBook(Book book)
        {
            Books.Add(book);
        }

        // Register new borrower
        public void RegisterBorrower(Borrower borrower)
        {
            Borrowers.Add(borrower);
        }

        // Borrow a book
        public bool BorrowBook(string isbn, string libraryCardNumber)
        {
            Book book = Books.FirstOrDefault(b => b.ISBN == isbn && !b.IsBorrowed);
            Borrower borrower = Borrowers.FirstOrDefault(b => b.LibraryCardNumber == libraryCardNumber);

            if (book == null || borrower == null)
                return false;

            book.Borrow();
            borrower.BorrowBook(book);
            return true;
        }

        // Return a book
        public bool ReturnBook(string isbn, string libraryCardNumber)
        {
            Borrower borrower = Borrowers.FirstOrDefault(b => b.LibraryCardNumber == libraryCardNumber);
            if (borrower == null) return false;

            Book book = borrower.BorrowedBooks.FirstOrDefault(b => b.ISBN == isbn);
            if (book == null) return false;

            book.Return();
            borrower.ReturnBook(book);
            return true;
        }

        // View books
        public List<Book> ViewBooks()
        {
            return Books;
        }

        // View borrowers
        public List<Borrower> ViewBorrowers()
        {
            return Borrowers;
        }
    }
}
