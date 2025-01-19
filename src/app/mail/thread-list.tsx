"use client"
import useThreads from '@/hooks/use-threads'
import React from 'react';
import { format } from "date-fns";

const ThreadList = () => {
    const { threads } = useThreads();

    const groupedThreads = threads?.reduce((acc, thread) => {
        const date = format(thread.emails[0]?.sentAt ?? new Date(), 'yyyy-mm-dd')
        if (!acc[date]) {
            acc[date] = []
        }

        acc[date].push(thread)
        return acc
    }, {} as Record<string, typeof threads>)

  return (
    <div className='max-w-full overflow-y-scroll max-h-[calc(100vh-120px)]'>
        <div className='flex flex-col gap-2 p-4 pt-0'>
        </div>
      
    </div>
  )
}

export default ThreadList