// /api/clerk/webhook

export const POST = async (req: Request) => {
    const { data } = await req.json()
    console.log("Clerk webhook received", data)
    return new Response("Webhook received", {status: 200})
}