import { exchangeCodeForAccessToken, getAccountDetails } from '@/lib/aurinko';
import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
import { waitUntil } from "@vercel/functions";
import axios from 'axios';

// /api/aurinko/callback

export const GET = async (req: NextRequest) => {

    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }


    const params = req.nextUrl.searchParams
    const status = params.get('status')
    console.log('status: ',status)
    if (status !== 'success') {
        return NextResponse.json({message: "Failed to link account"}, {status: 401})
    }

//     // get the code that we need to exchange for the access token (very very important)
    const code = params.get('code')
    console.log('code: ', code)
    if (!code) {
        return NextResponse.json({message: "No code provided"}, {status: 400})
    }
    const token = await exchangeCodeForAccessToken(code as string)
    if (!token) {
        return NextResponse.json({message: "Failed to exchange the code for access token"}, {status: 400})
    }
    
    const accountDetails = await getAccountDetails(token.accessToken)

//     // push the account details to the database
//     // if the record already exists, update it, otherwise insert the new record
    await db.account.upsert({
        where: {
            id: token.accountId.toString()
        },
        update: {
            accessToken: token.accessToken
        },
        create: {
            id: token.accountId.toString(),  // account id for each email in aurinko
            userId,  //clerk id of the application (user)
            emailAddress: accountDetails.email,
            name: accountDetails.name,
            accessToken: token.accessToken
        }
    })

    // trigger initial sync endpoint
    waitUntil(
        axios.post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
            accountId: token.accountId.toString(),
            userId: userId
        }).then(response => {
            console.log("Initial sync triggered", response.data)
        }).catch(error =>{
            console.error("Failed to trigger initial sync", error)
        })
    )

    return NextResponse.redirect(new URL('/mail', req.url))
}
