using System;
using System.Collections.Generic;
using System.Text;

using Xunit;
using BankingApp;

public class BankAccountTests
{
    [Fact]
    public void Transfer_Should_Move_Money_From_One_Account_To_Another()
    {
        var source = new BankAccount(1000);
        var target = new BankAccount(500);

        source.TransferTo(target, 300);

        Assert.Equal(700, source.Balance);
        Assert.Equal(800, target.Balance);
    }
    [Fact]
    public void Transfer_Should_Throw_When_Insufficient_Funds()
    {
        var source = new BankAccount(100);
        var target = new BankAccount(500);

        Assert.Throws<InvalidOperationException>(() =>
            source.TransferTo(target, 200));
    }
    [Fact]
    public void Deposit_Should_Increase_Balance()
    {
        var account = new BankAccount(100);

        account.Deposit(50);

        Assert.Equal(150, account.Balance);
    }
    [Fact]
    public void Withdraw_Should_Decrease_Balance()
    {
        var account = new BankAccount(200);

        account.Withdraw(50);

        Assert.Equal(150, account.Balance);
    }
    [Fact]
    public void Withdraw_Should_Throw_When_Insufficient_Funds()
    {
        var account = new BankAccount(100);

        Assert.Throws<InvalidOperationException>(() =>
            account.Withdraw(200));
    }
    [Fact]
    public void Transfer_Should_Not_Change_Target_When_Source_Fails()
    {
        var source = new BankAccount(100);
        var target = new BankAccount(500);

        Assert.Throws<InvalidOperationException>(() =>
            source.TransferTo(target, 200));

        Assert.Equal(100, source.Balance);
        Assert.Equal(500, target.Balance);
    }
}