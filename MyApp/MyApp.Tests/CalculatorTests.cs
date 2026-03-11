using System;
using System.Collections.Generic;
using System.Text;

using Xunit;
using MyApp;

namespace MyApp.Tests
{
    public class CalculatorTests
    {
        [Fact]
        public void Add_TwoNumbers_ReturnsCorrectSum()
        {
            var calc = new Calculator();

            var result = calc.Add(2, 3);

            Assert.Equal(5, result);
        }
    }
}