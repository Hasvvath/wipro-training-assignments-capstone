using System;
using System.Collections.Generic;
using System.Text;
namespace BankingApp
{
    public class BankAccount
    {
        public decimal Balance { get; private set; }

        public BankAccount(decimal initialBalance)
        {
            if (initialBalance < 0)
                throw new ArgumentException("Initial balance cannot be negative");

            Balance = initialBalance;
        }

        public void Deposit(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Deposit amount must be positive");

            Balance += amount;
        }

        public void Withdraw(decimal amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Withdrawal amount must be positive");

            if (Balance < amount)
                throw new InvalidOperationException("Insufficient funds");

            Balance -= amount;
        }

        public void TransferTo(BankAccount target, decimal amount)
        {
            if (target == null)
                throw new ArgumentNullException(nameof(target));

            // Atomic transfer
            Withdraw(amount);
            target.Deposit(amount);
        }
    }
}