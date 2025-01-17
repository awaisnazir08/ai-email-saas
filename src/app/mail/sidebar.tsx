"use client";
import React from 'react'
import { useLocalStorage } from 'usehooks-ts';
import { Nav } from './nav';
import { File, Inbox, Send } from 'lucide-react';

type Props = { isCollapsed: boolean}

const Sidebar = ({ isCollapsed }: Props) => {

    const [accountId] = useLocalStorage('accountId', '')  // is also like a global storage, can access value globally 
    const [tab] = useLocalStorage<"inbox" | "draft" | "sent">("ai-email-saas-tab", "inbox")
    // localStorage.setItem("ai-email-saas-tab", "inbox")
  return (
    <Nav 
    isCollapsed = {isCollapsed}
    links={[
        {
            title: 'Inbox',
            label: "1",
            icon: Inbox,
            variant: tab === 'inbox'? "default" : "ghost"
        },
        {
            title: "Draft", 
            label: "1",
            icon: File,
            variant: tab === "draft" ? "default" : "ghost"
        },
        {
            title: "Sent",
            label: "5",
            icon: Send,
            variant: tab === "sent" ? "default" : "ghost"
        }
    ]}
    ></Nav>
  )
}

export default Sidebar