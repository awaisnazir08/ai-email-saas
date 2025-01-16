'use client';
import { api } from '@/trpc/react'
import React from 'react'

type Props = {
    isCollapsed: boolean
}

const AccountSwitcher = ({ isCollapsed }: Props) => {
    const { data } = api.account.getAccounts.useQuery()   // useQuery is part of react query
  return (
    <>
    {data?.map(account => {
        return <div key={account.id}>{
            account.emailAddress
        }
        </div>
    })}
    </>
  )
}

export default AccountSwitcher