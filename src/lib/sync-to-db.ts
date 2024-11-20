import { EmailMessage, EmailAddress } from "./types";

// used for concurrency, say we have 1000 emails, we don't want to send all the mails to our database and crash/cook our db/server. It is basically a rate limiting module which probably sends data in chunks
import pLimit from 'p-limit';
import { dataTagSymbol } from "@tanstack/react-query";
import { db } from "@/server/db";

export async function syncEmailsToDatabase(emails: EmailMessage[], accountId: string) {
    console.log("Attempting to sync emails to database", emails.length)
    // send chunks of 10 at a time 
    const limit = pLimit(10)

    try {
        Promise.all(emails.map((email, index) => upsertEmail(email, accountId, index)))
    }
    catch (error) {
        console.error("Oopsies, couldn't save email at this moment", error)
    }
}

async function upsertEmail(email: EmailMessage, accountId: string, index: number) {
    console.log('upserting email', index);
    try {
        let emailLabelType: 'inbox' | 'sent' | 'draft' = 'inbox'
        if (email.sysLabels.includes('inbox') || email.sysLabels.includes('important')) {
            emailLabelType = 'inbox'
        }
        else if (email.sysLabels.includes('sent')) {
            emailLabelType = 'sent'
        }
        else if (email.sysLabels.includes('draft')) {
            emailLabelType = 'draft'
        }
        
        // shape of the address: {name: string, address: string}
        const addressesToUpsert = new Map()
        for (const address of [email.from, ...email.to, ...email.cc, ...email.bcc, ...email.replyTo]) {
            addressesToUpsert.set(address.address, address)
        }
    }
    catch (error) {

    }
}


async function upsertEmailAddress(address: EmailAddress, accountId: string) {
    try {
        const existingAddress = await db.emailAddress.findUnique({
            where: {
                accountId_address: {accountId: accountId, 
                    address: address.address ?? ""
                }
            },
        });

        if (existingAddress) {
            return await db.emailAddress.update({
                where: {
                    id: existingAddress.id
                },
                data: {
                    name: address.name,
                    raw: address.raw
                }
            })
        }
        else {
            return await db.emailAddress.create({
                data: {
                    address: address.address ?? "",
                    name: address.name,
                    raw: address.raw,
                    accountId: accountId
                }
            })
        }
    }
    catch(error) {
        console.log("Failed to upsert email address", error)
        return null
    }
}