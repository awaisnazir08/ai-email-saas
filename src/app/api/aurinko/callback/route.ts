import { exchangeCodeForAccessToken } from '@/lib/aurinko';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
// /api/aurinko/callback

export const GET = async (req: NextRequest) => {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({message: "Unauthorized"}, {status: 401});
    }

    const params = req.nextUrl.searchParams
    const status = params.get('status')
    if (status != 'success') {
        return NextResponse.json({message: "Failed to link account"}, {status: 401})
    }

    // get the code that we need to exchange for the access token (very very important)
    const code = params.get('code')
    if (!code) {
        return NextResponse.json({message: "No code provided"}, {status: 400})
    }
    const token = await exchangeCodeForAccessToken(code)
    if (!token) {
        return NextResponse.json({message: "Failed to exchange the code for access token"}, {status: 400})
    }

    console.log("Userid is: ", userId)
    return NextResponse.json({message: "Hi there"})
}