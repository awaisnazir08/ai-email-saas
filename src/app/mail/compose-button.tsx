'use client';
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Pencil } from "lucide-react";

import React from 'react'
import EmailEditor from "./email-editor";
import { api } from "@/trpc/react";
import useThreads from "@/hooks/use-threads";
import { toast } from "sonner";

const ComposeButton = () => {

    const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>([])
    const [ccValues, setCcValues] = React.useState<{ label: string, value: string }[]>([])
    const [subject, setSubject] = React.useState<string>('')
    const { account } = useThreads();
    const sendEmail = api.account.sendEmail.useMutation()

    const handleSend = async (value: string) => {
        if (!account) {
            return
        }
        sendEmail.mutate({
            accountId: account.id,
            threadId: undefined,
            body: value,
            subject,
            from: { name: account?.name ?? "Me", address: account.emailAddress ?? "owaisnazir2228@gmail.com" },
            to: toValues.map(to => ({ address: to.value, name: to.value })),
            cc: ccValues.map(cc => ({ address: cc.value, name: cc.value })),

            replyTo: { name: account?.name ?? "Me", address: account.emailAddress ?? "owaisnazir2228@gmail.com"},
            inReplyTo: undefined
        }, {
            onSuccess: () => {
                toast.success('Email Sent!')   // we need toasts for pop-ups to show up
            },
            onError: (error) => {
                console.log(error)
                toast.error('Error sending Email')
            }
        })
    }

    return (
        <Drawer>
            <DrawerTrigger>
                <Button>
                    <Pencil className="size-4 mr-1" />
                    Compose
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Compose Email</DrawerTitle>
                </DrawerHeader>
                <EmailEditor
                    toValues={toValues}
                    setToValues={setToValues}
                    ccValues={ccValues}
                    setCcValues={setCcValues}
                    subject={subject}
                    setSubject={setSubject}

                    handleSend={handleSend}
                    isSending={sendEmail.isPending}

                    to={toValues.map(to => to.value)}

                    defaultToolbarExpanded={true}

                />
            </DrawerContent>
        </Drawer>

    )
}

export default ComposeButton
