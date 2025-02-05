"use server";

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import axios from 'axios';
import { getSubscriptionStatus } from "./stripe-actions";
import { db } from "@/server/db";
import { FREE_ACCOUNTS_PER_USER, PRO_ACCOUNTS_PER_USER } from "@/constants";

export const getAurinkoAuthUrl = async (serviceType: "Google" | "Office365") => {
    const { userId } = await auth();
    if (!userId) {
        throw new Error('Unauthorized');
    }

    const isSubscribed = await getSubscriptionStatus();
    const accounts = await db.account.count({
        where: {
            userId: userId
        }
    })

    if (isSubscribed) {
        if (accounts >= PRO_ACCOUNTS_PER_USER) {
            throw new Error("You have reached the maximum number of accounts for your subscription..!!")  
        }
        
    } else {
        if (accounts >= FREE_ACCOUNTS_PER_USER) {
            throw new Error("You have reached the maximum number of accounts for your subscription..!!")
        }
    }


    
    // hit the endpoint (authorize)
    const params = new URLSearchParams({
        clientId: process.env.AURINKO_CLIENT_ID as string,
        serviceType: serviceType,
        scopes: "Mail.Read Mail.ReadWrite Mail.Send Mail.Drafts Mail.All",
        responseType: "code",
        returnUrl: `${process.env.NEXT_PUBLIC_URL}/api/aurinko/callback`,
    })
    // url where the user clicks to direct to the authentication tab
    return `https://api.aurinko.io/v1/auth/authorize?${params.toString()}`;
}

export const exchangeCodeForAccessToken = async (code: string) => {
    try {
        // console.log(`url being hit is: https://api.aurinko.io/v1/auth/token/${code}` )
        const response = await axios.post(`https://api.aurinko.io/v1/auth/token/${code}`, {}, {
            auth: {
                username: process.env.AURINKO_CLIENT_ID as string,
                password: process.env.AURINKO_CLIENT_SECRET as string
            }
        })

        return response.data as {
            accountId: number,
            accessToken: string,
            userId: string,
            userSession: string
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching Aurinko token:', error.response?.data);
        } else {
            console.error('Unexpected error fetching Aurinko token:', error);
        }
    }
}

export const getAccountDetails = async (accessToken: string) => {
    try {
        const response = await axios.get('https://api.aurinko.io/v1/account', {
            headers: {
                'Authorization': `Bearer ${accessToken}` //access token is specific to the user and to the account
            }
        })

        return response.data as {
            email: string,
            name: string
        }
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error fetching account details', error.response?.data);
        }
        else {
            console.error("Unexpected error fetching account details: ", error)
        }
        throw error;
    }
}

