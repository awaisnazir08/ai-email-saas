import { db } from './../../../server/db';
import { Configuration, OpenAIApi } from 'openai-edge';
import { Message, streamText } from 'ai';
import { auth } from '@clerk/nextjs/server';
import { OramaClient } from '@/lib/orama';
import { openai } from '@ai-sdk/openai';
import { getSubscriptionStatus } from '@/lib/stripe-actions';
import { FREE_CREDITS_PER_DAY } from '@/constants';

// const openai = new OpenAIApi(new Configuration({
//     apiKey: process.env.OPENAI_API_KEY
// }))

export async function POST(req: Request) {

    const today = new Date().toDateString();
    try {
        const { userId } = await auth();
        if (!userId) {
            return new Response('Unauthorized', { status: 401 })
        }

        const isSubscribed = await getSubscriptionStatus();

        if (!isSubscribed) {
            const chatbotInteraction = await db.chatbotInteraction.findUnique({
                where: {
                    userId: userId,
                    day: today
                }
            })

            if (!chatbotInteraction) {
                await db.chatbotInteraction.create({
                    data: {
                        day: today,
                        userId: userId,
                        count: 1
                    }
                })
            } else if (chatbotInteraction.count >= FREE_CREDITS_PER_DAY){
                return new Response("You have reached the free limit for today", { status: 429 })
            }
        }
        const { accountId, messages } = await req.json();
        const orama = new OramaClient(accountId)
        await orama.initialize()

        const lastMessage = messages[messages.length - 1]
        console.log(lastMessage)
        const context = await orama.vectorSearch({ term: lastMessage.content })
        console.log(context.hits.length + ' hits found');

        const prompt = {
            role: "system",
            content: `You are an AI email assistant embedded in an email client app. Your purpose is to help the user compose emails by answering questions, providing suggestions, and offering relevant information based on the context of their previous emails.
            THE TIME NOW IS ${new Date().toLocaleString()}
      
      START CONTEXT BLOCK
      ${context.hits.map((hit) => JSON.stringify(hit.document)).join('\n')}
      END OF CONTEXT BLOCK
      
      When responding, please keep in mind:
      - Be helpful, clever, and articulate.
      - Rely on the provided email context to inform your responses.
      - If the context does not contain enough information to answer a question, politely say you don't have enough information.
      - Avoid apologizing for previous responses. Instead, indicate that you have updated your knowledge based on new information.
      - Do not invent or speculate about anything that is not directly supported by the email context.
      - Keep your responses concise and relevant to the user's questions or the email being composed.`
        };

        const response = streamText({
            model: openai('gpt-3.5-turbo'),
            messages: [prompt, ...messages.filter((message: Message) => message.role === 'user')],
        })
        // const stream = OpenAIStream(response, {
        //     onStart: async () => {
        //         console.log('hjgdf')
        //     }, 
        //     onCompletion: async (completion) => {
        //         console.log('stream completed', completion)
        //     },
        //     onText: (text)
        // })

        await db.chatbotInteraction.update({
            where: {
                userId: userId,
                day: today
            },
            data: {
                count: {
                    increment: 1
                }
            }
        })
        return response.toDataStreamResponse();

    } catch (error) {
        console.log('error', error)
        return new Response("Internal Server Error", { status: 500 })
    }
}