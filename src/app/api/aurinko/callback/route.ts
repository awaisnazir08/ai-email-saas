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

    console.log("Userid is: ", userId)
    return NextResponse.json({message: "Hi there"})
}