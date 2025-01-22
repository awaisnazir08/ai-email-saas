'use client';
import { Action, KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch, Priority } from 'kbar';
import React from 'react';
import RenderResults from './render-results';
import { useLocalStorage } from 'usehooks-ts';
import { useTheme } from 'next-themes';
import useThemeSwitching from './use-theme-switching';
import useAccountSwitching from './use-account-switching';

export default function KBar({ children }: { children: React.ReactNode }) {  //children props from KBar to the ActualComponent

    const [tab, setTab] = useLocalStorage('ai-email-saas-tab', 'inbox');
    const [done, setDone] = useLocalStorage('ai-email-saas-done', false);

    const actions: Action[] = [
        {
            id: "inboxAction",
            name: "Inbox",
            shortcut: ["g", 'i'],
            keywords: "inbox",
            section: "Navigation",
            subtitle: "View your inbox",
            perform: () => {
                setTab('inbox')
            },
        },
        {
            id: "draftsAction",
            name: "Drafts",
            shortcut: ['g', 'd'],
            keywords: "drafts",
            priority: Priority.HIGH,
            subtitle: "View your drafts",
            section: "Navigation",
            perform: () => {
                setTab('draft')
            },
        },
        {
            id: "sentAction",
            name: "Sent",
            shortcut: ['g', "s"],
            keywords: "sent",
            section: "Navigation",
            subtitle: "View the sent",
            perform: () => {
                setTab('sent')
            },
        },
        {
            id: "pendingAction",
            name: "See done",
            shortcut: ['g', "d"],
            keywords: "done",
            section: "Navigation",
            subtitle: "View the done emails",
            perform: () => {
                setDone(true)
            },
        },
        {
            id: "doneAction",
            name: "See Pending",
            shortcut: ['g', "u"],
            keywords: 'pending, undone, not done',
            section: "Navigation",
            subtitle: "View the pending emails",
            perform: () => {
                setDone(false)
            },
        },
    ];
    return <KBarProvider actions={actions}>
        <ActualComponent>
            {children}
        </ActualComponent>

    </KBarProvider>
}


const ActualComponent = ({ children }: { children: React.ReactNode }) => {
    useThemeSwitching();
    useAccountSwitching();
    return <React.Fragment>
        <KBarPortal>
            <KBarPositioner className='fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm scrollbar-hide !p-0 z-[999]'>
                <KBarAnimator className='max-w-[600px] !mt-64 w-full bg-white dark:bg-gray-800 text-foreground dark:text-gray-200 shadow-lg border dark:border-gray-700 rounded-lg overflow-hidden relative !-translate-y-12'>
                    <div className='bg-white dark:bg-gray-800'>
                        <div className='border-x-0 border-b-2 dark:border-gray-700'>
                            <KBarSearch className='py-4 px-6 text-lg w-full bg-white dark:bg-gray-800 outline-none border-none focus:outline-none focus:ring-0 focus:ring-offset-0' />
                        </div>
                        <RenderResults />
                    </div>
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
        {children}
    </React.Fragment>
}