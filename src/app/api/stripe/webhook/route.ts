import { stripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string)
    } catch (error) {
        return new Response('Webhook Error', { status: 400 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    console.log('received stripe event', event.type)

    if (event.type === 'checkout.session.completed') {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string, {
            expand: ['items.data.price.product']
        })

        if (!session?.client_reference_id) {
            return new NextResponse('No userId', { status: 400 })
        }
        const plan = subscription.items.data[0]?.price

        if (!plan) {
            return new Error('No plan found for this subscription.');
        }

        const productId = (plan.product as Stripe.Product).id

        if (!productId) {
            throw new Error('No product ID found for this subscription.');
        }

        await db.stripeSubscription.create({
            data: {
                userId: session.client_reference_id,
                priceId: plan.id,
                customerId: subscription.customer as string,
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                subscriptionId: subscription.id
            }
        })

        return NextResponse.json({ message: "success" }, { status: 200 });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
            {
                expand: ['items.data.price.product'],
            }
        );
        const plan = subscription.items.data[0]?.price;

        if (!plan) {
            throw new Error('No plan found for this subscription.');
        }

        await db.stripeSubscription.update({
            where: {
                subscriptionId: subscription.id
            },
            data: {
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
                priceId: plan.id,
            }
        })
        return NextResponse.json({ message: "success" }, { status: 200 });
    }

    if (event.type === 'customer.subscription.updated') {
        const subscription = await stripe.subscriptions.retrieve(session.id as string);
        const existingSubscription = await db.stripeSubscription.findUnique({
            where: {
                subscriptionId: session.id as string
            }
        })

        if (!existingSubscription) {
            return new Response("Subscription not found..!!", { status: 200 })
        }
        await db.stripeSubscription.update({
            where: {
                subscriptionId: session.id as string
            },
            data: {
                updatedAt: new Date(),
                currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            }
        })
        return NextResponse.json({ message: "success" }, { status: 200 });
    }

    return new Response('Webhook received', { status: 200 })
}