'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAurinkoAuthUrl } from '@/lib/aurinko';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react'
import { Plus, PlusIcon } from 'lucide-react';
import React, { useState } from 'react'
import {useLocalStorage} from 'usehooks-ts'; // direct replacement of useState

type Props = {
    isCollapsed: boolean
}

const AccountSwitcher = ({ isCollapsed }: Props) => {
    const { data } = api.account.getAccounts.useQuery()   // useQuery is part of react query

    if (!data) {
        return null;
    }

    const [accountId, setAccountId] = useLocalStorage("accountId", "")
  return (
    <Select defaultValue={accountId} onValueChange={setAccountId}>
        <SelectTrigger className={cn(
            "flex w-full flex-1 items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
            isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto [&>svg]:hidden"
          )}
          aria-label="Select Account">

            <SelectValue placeholder='Select an account'>
                <span className={cn({"hidden": !isCollapsed})}>
                    {data.find(account => account.id === accountId)?.emailAddress[0]} 
                </span>
                <span className={cn({"hidden": isCollapsed, 'ml-2': true})}>
                {data.find(account => account.id === accountId)?.emailAddress} 
                </span>
            </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {data.map((account) => {
            return (
            <SelectItem key={account.id} value={account.id}>
                {account.emailAddress}
            </SelectItem>
            )
          })}

          <div onClick={async ()=>{
                    const authUrl = await getAurinkoAuthUrl('Google')
                    window.location.href = authUrl;
          }} className='flex items-center relative hover:bg-gray-50 w-full cursor-pointer rounded-sm py-1.5 pl-2 pr-8 text-sm outline focus:bg-accent'>
            <Plus className='size-4 mr-1'/>
            Add account
          </div>
        </SelectContent>
    </Select>
  )
}

export default AccountSwitcher