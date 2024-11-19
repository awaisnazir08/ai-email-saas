import { exchangeCodeForAccessToken, getAccountDetails } from '@/lib/aurinko';
import { db } from '@/server/db';
import { auth } from '@clerk/nextjs/server';
import { type NextRequest, NextResponse } from 'next/server';
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

    // get the code that we need to exchange for the access token (very very important)
    const code = params.get('code')
    console.log('code: ', code)
    if (!code) {
        return NextResponse.json({message: "No code provided"}, {status: 400})
    }
    const token = await exchangeCodeForAccessToken(code as string)
    console.log("token: ", token)
    if (!token) {
        return NextResponse.json({message: "Failed to exchange the code for access token"}, {status: 400})
    }
    
    const accountDetails = await getAccountDetails(token.accessToken)

    // push the account details to the database
    // if the record already exists, update it, otherwise insert the new record
    await db.account.upsert({
        where: {
            id: token.accountId.toString()
        },
        update: {
            accessToken: token.accessToken
        },
        create: {
            id: token.accountId.toString(),
            userId,
            emailAddress: accountDetails.email,
            name: accountDetails.name,
            accessToken: token.accessToken
        }
    })
    console.log('reached here')
    // console.log("Userid is: ", userId)
    return NextResponse.redirect(new URL('/mail', req.url))
}