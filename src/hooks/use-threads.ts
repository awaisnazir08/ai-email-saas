import { api } from '@/trpc/react'
import React from 'react'
import { useLocalStorage } from 'usehooks-ts'

const useThreads = () => {
    const {data: accounts, isFetching, refetch} = api.account.getAccounts.useQuery()
    const [accountId] = useLocalStorage('accountId', '')
    const [tab] = useLocalStorage('ai-email-saas-tab', 'inbox')
    const [done] = useLocalStorage('ai-email-saas-done', false)

    const {data: threads} = api.account.getThreads.useQuery({
        accountId,
        tab,
        done
    }, {
        enabled: !!accountId && !!tab, placeholderData: e => e, refetchInterval: 5000
    })
  return {
    threads,
    isFetching,
    refetch,
    accountId,
    account: accounts?.find(e => e.id === accountId)
  }
}

export default useThreads
