"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from 'axios';

export const getAurinkoAuthUrl = async (serviceType: "Google" | "Office") => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Unauthorized');
    }
    
    // hit the endpoint (authorize)
    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType,
        scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
        responseType: "code",
        //where to return after successful authentication
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`
    })
    // url where the user clicks to direct to the authentication tab
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`
}

export const exchangeCodeForAccessToken = async (code: string) => {
    try {
        const response = await axios.post("https://api/aurinko.io/v1/account", {}, {
            auth: {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string
            }
        })

        return response.data as {
            accountId: string,
            accessToken: string,
            userId: string,
            userSession: string
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            // throw new Error(error.response?.data?.error || "Failed to exchange code for access token")
            console.error(error.response?.data)
        }
        console.error(error)
    }

}