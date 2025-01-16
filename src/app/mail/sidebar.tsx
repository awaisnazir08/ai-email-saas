"use client";
import React from 'react'
import { useLocalStorage } from 'usehooks-ts';

type Props = { isCollapsed: boolean}

const Sidebar = ({ isCollapsed }: Props) => {

    const [accountId] = useLocalStorage('accountId', '')  // is also like a global storage, can access value globally 
  return (
    <div>{accountId}</div>
  )
}

export default Sidebar