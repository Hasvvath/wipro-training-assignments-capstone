using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.VisualStudio.TestTools.UnitTesting;
using LibraryManagement;

namespace LibraryManagement.Tests
{
    [TestClass]
    public class LibraryTests
    {
        private Library library;
        private Book book;
        private Borrower borrower;

        [TestInitialize]
        public void Setup()
        {
            library = new Library();
            book = new Book("Clean Code", "Robert C. Martin", "ISBN001");
            borrower = new Borrower("Ramesh", "CARD001");
        }

        [TestMethod]
        public void AddBook_BookIsAdded()
        {
            library.AddBook(book);
            Assert.AreEqual(1, library.Books.Count);
        }

        [TestMethod]
        public void RegisterBorrower_BorrowerIsAdded()
        {
            library.RegisterBorrower(borrower);
            Assert.AreEqual(1, library.Borrowers.Count);
        }

        [TestMethod]
        public void BorrowBook_BookIsMarkedBorrowed_And_AssignedToBorrower()
        {
            library.AddBook(book);
            library.RegisterBorrower(borrower);

            bool result = library.BorrowBook("ISBN001", "CARD001");

            Assert.IsTrue(result);
            Assert.IsTrue(book.IsBorrowed);
            Assert.AreEqual(1, borrower.BorrowedBooks.Count);
        }

        [TestMethod]
        public void ReturnBook_BookIsReturned_And_RemovedFromBorrower()
        {
            library.AddBook(book);
            library.RegisterBorrower(borrower);
            library.BorrowBook("ISBN001", "CARD001");

            bool result = library.ReturnBook("ISBN001", "CARD001");

            Assert.IsTrue(result);
            Assert.IsFalse(book.IsBorrowed);
            Assert.AreEqual(0, borrower.BorrowedBooks.Count);
        }

        [TestMethod]
        public void ViewBooks_And_ViewBorrowers_ReturnsCorrectLists()
        {
            library.AddBook(book);
            library.RegisterBorrower(borrower);

            Assert.AreEqual(1, library.ViewBooks().Count);
            Assert.AreEqual(1, library.ViewBorrowers().Count);
        }
    }
}
