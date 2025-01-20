'use client';
import useThreads from '@/hooks/use-threads';
import { cn } from '@/lib/utils';
import { RouterOutputs } from '@/trpc/react';
import { formatDistanceToNow } from 'date-fns';
import React from 'react';
import {Letter} from 'react-letter';
import Avatar from 'react-avatar';

type Props = {
    email: RouterOutputs['account']['getThreads'][0]['emails'][0]   //router outputs help us get type definition (type output (type of the procedures, a very nice utility of trpc))
}

const EmailDisplay = ({ email }: Props) => {
    const { account } = useThreads();
    const isMe = account?.emailAddress === email.from.address
    // who sent the email? and if the sender if me
    return (
        <div className={cn('border rounded-md p-4 transition-all hover:translate-x-2', {
            'border-l-gray-900 border-l-4': isMe
        })}>
            <div className='flex items-center justify-between gap-2'>
                <div className='flex items-center justify-between gap-2'>
                    {!isMe && <Avatar name={email.from.name ?? email.from.address} email={email.from.address} size='35' textSizeRatio={2} round={true} />}
                    <span className='font-medium '>
                        {isMe ? "Me": email.from.address}
                    </span>
                </div>
                <p className='text-xm text-muted-foreground'>
                    {formatDistanceToNow(email.sentAt ?? new Date(), {
                        addSuffix: true
                    })}
                </p>
            </div>
            <div className='h-4'>
                <Letter html={email?.body ?? ""} className='bg-white rounded-md text-black'/>
            </div>
        </div>
    )
}

export default EmailDisplay