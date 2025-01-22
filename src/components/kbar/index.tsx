'use client';
import { KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarSearch } from 'kbar';
import React from 'react';

export default function KBar ({ children }: { children: React.ReactNode }){  //children props from KBar to the ActualComponent
    return <KBarProvider>
        <ActualComponent>
            {children}
        </ActualComponent>

    </KBarProvider>
}

const ActualComponent = ({ children }: { children: React.ReactNode}) => {
    return <React.Fragment>
        <KBarPortal>
            <KBarPositioner>
                <KBarAnimator>
                    <KBarSearch />
                </KBarAnimator>
            </KBarPositioner>
        </KBarPortal>
        {children}
    </React.Fragment>
}