"use client";
import React from 'react'
import { useLocalStorage } from 'usehooks-ts';
import { Nav } from './nav';
import { File, Inbox, Send } from 'lucide-react';
import { api } from '@/trpc/react';

type Props = { isCollapsed: boolean}

const Sidebar = ({ isCollapsed }: Props) => {

    const [accountId] = useLocalStorage('accountId', '')  // is also like a global storage, can access value globally 
    const [tab] = useLocalStorage<"inbox" | "draft" | "sent">("ai-email-saas-tab", "inbox")
    const {data: inboxThreads } = api.account.getNumThreads.useQuery({
        accountId, 
        tab: "inbox"
    })
    const {data: draftThreads } = api.account.getNumThreads.useQuery({
        accountId, 
        tab: "draft"
    })
    const {data: sentThreads } = api.account.getNumThreads.useQuery({
        accountId, 
        tab: "sent"
    })
    // localStorage.setItem("ai-email-saas-tab", "inbox")
  return (
    <Nav 
    isCollapsed = {isCollapsed}
    links={[
        {
            title: 'Inbox',
            label: inboxThreads?.toString() ?? '0',
            icon: Inbox,
            variant: tab === 'inbox'? "default" : "ghost"
        },
        {
            title: "Draft", 
            label: draftThreads?.toString() ?? '0',
            icon: File,
            variant: tab === "draft" ? "default" : "ghost"
        },
        {
            title: "Sent",
            label: sentThreads?.toString() ?? '0',
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost"
        }
    ]}
    ></Nav>
  )
}

export default Sidebar