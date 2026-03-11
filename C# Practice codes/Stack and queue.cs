using System;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        // --- Stack Implementation (LIFO) ---
        Stack<int> marks = new Stack<int>();

        marks.Push(100);
        marks.Push(99);
        marks.Push(89);

        // Peek: Returns the top element without removing it (89)
        Console.WriteLine(marks.Peek()); 
        
        // Pop: Removes and returns the top element (89)
        Console.WriteLine(marks.Pop());  
        
        // Peek: Now returns the new top element (99)
        Console.WriteLine(marks.Peek()); 

        Console.WriteLine(); // Visual separator

        // --- Queue Implementation (FIFO) ---
        Queue<string> countries = new Queue<string>();

        countries.Enqueue("India");
        countries.Enqueue("Japan");
        countries.Enqueue("USA");
        countries.Enqueue("China");

        // Peek: Returns the first element added without removing it ("India")
        Console.WriteLine(countries.Peek()); 
        
        // Dequeue: Removes and returns the first element ("India")
        Console.WriteLine(countries.Dequeue()); 
        
        // Peek: Now returns the next element in line ("Japan")
        Console.WriteLine(countries.Peek()); 
    }
}
