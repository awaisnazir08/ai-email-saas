import { EmailMessage } from "./types";

// used for concurrency, say we have 1000 emails, we don't want to send all the mails to our database and crash/cook our db/server. It is basically a rate limiting module which probably sends data in chunks
import pLimit from 'p-limit';

export async function syncEmailsToDatabase(emails: EmailMessage[]) {
    console.log("Attempting to sync emails to database", emails.length)
    // send chunks of 10 at a time 
    const limit = pLimit(10)

    try {
        Promise.all(emails.map(email => saveEmail(email)))
    } catch(error) {
        console.error("Oopsies, couldn't save email at this moment", error)
    }
}