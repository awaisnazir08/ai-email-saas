import { Configuration } from 'openai-edge';
import { Message, OpenAIStream, StreamingTextResponse } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { OramaClient } from '@/lib/orama';

export async function POST(req: Request) {
    try {
        const {userId} = await auth();
        if (!userId) {
            return new Response('Unauthorized', {status: 401})
        }
        const { accountId, messages } = await req.json();
        const orama = new OramaClient(accountId)
        await orama.initialize()

        const lastMessage = messages[messages.length - 1]
        console.log(lastMessage)
        const context = await orama.vectorSearch({term: lastMessage.content})
        console.log(context.hits.length + ' hits found')
        return new Response('OK', {status: 200})
    } catch (error) {
        console.log('error', error)
        return new Response("Internal Server Error", { status: 500 })
    }
}