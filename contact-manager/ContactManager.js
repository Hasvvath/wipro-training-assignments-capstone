"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactManager = void 0;
class ContactManager {
    constructor() {
        this.contacts = [];
    }
    addContact(contact) {
        this.contacts.push(contact);
        console.log("✅ Contact added successfully");
    }
    viewContacts() {
        return this.contacts;
    }
    modifyContact(id, updatedContact) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) {
            console.log("❌ Error: Contact not found");
            return;
        }
        Object.assign(contact, updatedContact);
        console.log("✅ Contact updated successfully");
    }
    deleteContact(id) {
        const index = this.contacts.findIndex(c => c.id === id);
        if (index === -1) {
            console.log("❌ Error: Contact not found");
            return;
        }
        this.contacts.splice(index, 1);
        console.log("✅ Contact deleted successfully");
    }
}
exports.ContactManager = ContactManager;
