'use client';
import React from 'react'
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Text } from '@tiptap/extension-text';
import EditorMenubar from './editor-menubar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import TagInput from './tag-input';
import { Input } from '@/components/ui/input';
import { set } from 'date-fns';
import AIComposeButton from './ai-compose-button';
import { Token } from '@clerk/nextjs/server';
import { generate } from './action';
import { readStreamableValue } from 'ai/rsc';

type Props = {
    subject: string
    setSubject: (subject: string) => void

    toValues: { label: string, value: string }[]
    setToValues: (value: { label: string, value: string }[]) => void

    ccValues: { label: string, value: string }[]
    setCcValues: (value: { label: string, value: string }[]) => void

    to: string[]
    handleSend: (value: string) => void
    isSending: boolean

    defaultToolbarExpanded?: boolean
}

const EmailEditor = ({ subject, setSubject, toValues, setToValues, ccValues, setCcValues, to, handleSend, isSending, defaultToolbarExpanded } : Props) => {
    const [value, setValue] = React.useState<string>('')
    const [expanded, setExpanded] = React.useState<boolean>(defaultToolbarExpanded ?? false)
    const [token, setToken] = React.useState<string>('')


    const aiGenerate = async (value: string) => {
        const { output } = await generate(value) 
        for await (const token of readStreamableValue(output)) {
            if (token){
                setToken(token)
            }
        }

    }

    const CustomText = Text.extend({
        addKeyboardShortcuts() {
            return {
                'Alt-j': () => {
                    // console.log('Alt-j')
                    aiGenerate(this.editor.getText())
                    return true;
                }
            }
        }
    })
    const editor = useEditor({
        autofocus: false,
        extensions: [StarterKit, CustomText],
        onUpdate: ({ editor }) => {
            setValue(editor.getHTML())
        }
    })

    const onGenerate = (token: string) => {
        console.log(token)
        editor?.commands?.insertContent(token)
    }

    if (!editor) {
        return null;
    }

    React.useEffect(() => {
        editor?.commands?.insertContent(token)
    }, [editor, token])

    return (
        <div>
            <div className='flex p-4 py-2 border-b'>
                <EditorMenubar editor={editor} />
            </div>
            <div className='p-4 pb-0 space-y-2'>
                {
                    expanded && (
                        <React.Fragment>
                            <TagInput
                                label='To'
                                onChange={setToValues}
                                placeholder='Add Recipients'
                                value={toValues}
                            />
                            <TagInput
                                label='Cc'
                                onChange={setCcValues}
                                placeholder='Add Recipients'
                                value={ccValues}
                            />
                            <Input className='w-full' id='subject' placeholder='Subject' value={subject} onChange={(e) => setSubject(e.target.value)}/>
                        </React.Fragment>
                    )}
                <div className='flex items-center gap-2'>
                    <div className='cursor-pointer' onClick={() => setExpanded(!expanded)}>
                        <span className='text-green-600 font-medium'>
                            Draft {" "}
                        </span>
                        <span>
                            to {to?.join(', ')}
                        </span>
                    </div>
                    <AIComposeButton isComposing={defaultToolbarExpanded ?? false} onGenerate={onGenerate} />
                </div>

            </div>
            <div className='prose w-full px-4 py-4'>
                <EditorContent editor={editor} value={value} />
            </div>
            <Separator />
            <div className='py-3 px-4 flex items-center justify-between'>
                <span className='text-sm'>
                    Tip: Press {" "}
                    <kbd className='px-2 py-1.5 text-xs font-semibold text-gray-80 bg-gray-100 border border-gray-200 rounded-lg'>
                        Cmd + J
                    </kbd> {" "}
                    For AI autocomplete
                </span>
                <Button onClick={async () =>{
                    editor?.commands?.clearContent()
                    await handleSend(value)
                }} disabled={isSending}>
                    Send
                </Button>

            </div>
        </div>
    )
}

export default EmailEditor
