import React from 'react'
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from '@/components/ui/resizable'
import { TooltipProvider } from '@/components/ui/tooltip'

type Props = {
    defaultLayout: number[] | undefined
    navCollapsedSize: number
}

const Main = ({defaultLayout = [20,32,48], navCollapsedSize}: Props) => {
  return (
    <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup direction='horizontal' onLayout={(sizes: number[]) =>{
            console.log(sizes)
        }} className='items-stretch h-full min-h-screen'>
            <ResizablePanel defaultSize={defaultLayout[0]} collapsedSize={navCollapsedSize}
            collapsible={true}
            >
            </ResizablePanel>

        </ResizablePanelGroup>
    </TooltipProvider>
  )
}

export default Main
