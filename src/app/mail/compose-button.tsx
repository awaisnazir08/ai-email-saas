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

const ComposeButton = () => {

    const [toValues, setToValues] = React.useState<{label: string, value: string}[]>([])
    const [ccValues, setCcValues] = React.useState<{label: string, value: string}[]>([])
    const [subject, setSubject] = React.useState<string>('')

    const handleSend = async (value: string) => {
        console.log('values', value)
    }

    return (
        <Drawer>
            <DrawerTrigger>
                <Button>
                    <Pencil className="size-4 mr-1"/>
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
                isSending={false}

                to={toValues.map(to => to.value)}

                defaultToolbarExpanded={true}

                />
            </DrawerContent>
        </Drawer>

    )
}

export default ComposeButton
