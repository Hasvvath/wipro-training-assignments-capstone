import { ContactManager } from "./ContactManager";
import { Contact } from "./Contact";

const manager = new ContactManager();

// Add Contacts
const contact1: Contact = {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    phone: "1234567890"
};

const contact2: Contact = {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "9876543210"
};

manager.addContact(contact1);
manager.addContact(contact2);

// View Contacts
console.log("\n📋 All Contacts:");
console.log(manager.viewContacts());

// Modify Contact
manager.modifyContact(1, { name: "John Updated" });

// View After Update
console.log("\n📋 After Update:");
console.log(manager.viewContacts());

// Delete Contact
manager.deleteContact(2);

// View After Delete
console.log("\n📋 After Deletion:");
console.log(manager.viewContacts());

// Error case
manager.deleteContact(99);