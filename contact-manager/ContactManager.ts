import { Contact } from "./Contact";

export class ContactManager {
    private contacts: Contact[] = [];

    addContact(contact: Contact): void {
        this.contacts.push(contact);
        console.log("✅ Contact added successfully");
    }

    viewContacts(): Contact[] {
        return this.contacts;
    }

    modifyContact(id: number, updatedContact: Partial<Contact>): void {
        const contact = this.contacts.find(c => c.id === id);

        if (!contact) {
            console.log("❌ Error: Contact not found");
            return;
        }

        Object.assign(contact, updatedContact);
        console.log("✅ Contact updated successfully");
    }

    deleteContact(id: number): void {
        const index = this.contacts.findIndex(c => c.id === id);

        if (index === -1) {
            console.log("❌ Error: Contact not found");
            return;
        }

        this.contacts.splice(index, 1);
        console.log("✅ Contact deleted successfully");
    }
}