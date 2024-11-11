import { SignIn } from '@clerk/nextjs'
import react from 'react';

export default function Page() {
    return (
        <div className='flex justify-center items-center h-screen'>
            <SignIn />
        </div>
    )
}