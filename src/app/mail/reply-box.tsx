'use client';
import React, { use } from 'react'
import EmailEditor from './email-editor';
import { api, RouterOutputs } from '@/trpc/react';
import useThreads from '@/hooks/use-threads';
import { toast } from 'sonner';


const ReplyBox = () => {
  const { threadId, accountId } = useThreads();
  const { data: replyDetails } = api.account.getReplyDetails.useQuery({
    threadId: threadId ?? "",
    accountId: accountId
  })

  if (!replyDetails) {
    return null;
  }

  return (
    <Component replyDetails={replyDetails} />
  )
}

const Component = ({ replyDetails }: { replyDetails: RouterOutputs['account']['getReplyDetails'] }) => {  // routerOutputs for return type of replyDetails
  const { threadId, accountId } = useThreads();
  const [subject, setSubject] = React.useState(replyDetails.subject.startsWith('Re:') ? replyDetails.subject : `Re: ${replyDetails.subject}`)
  const [toValues, setToValues] = React.useState<{ label: string, value: string }[]>(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
  const [ccValues, setCcValues] = React.useState<{ label: string, value: string }[]>(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

  // useEffect to update the subject, toValues and ccValues when the threadId or replyDetails change
  React.useEffect(() => {
    if (!threadId || !replyDetails) {
      return;
    }
    if (!replyDetails?.subject.startsWith('Re:')) {
      setSubject(`Re: ${replyDetails.subject}`)
    }
    else {
      setSubject(replyDetails.subject)
    }

    setToValues(replyDetails.to.map(to => ({ label: to.address, value: to.address })))
    setCcValues(replyDetails.cc.map(cc => ({ label: cc.address, value: cc.address })))

  }, [threadId, replyDetails])

  const sendEmail = api.account.sendEmail.useMutation()

  const handleSend = async (value: string) => {
    if (!replyDetails) {
      return null
    }
    sendEmail.mutate({
      accountId,
      threadId: threadId ?? undefined,
      body: value,
      subject,
      from: replyDetails.from,
      to: replyDetails.to.map(to => ({ address: to.address, name: to.name ?? "" })),
      cc: replyDetails.cc.map(cc => ({ address: cc.address, name: cc.name ?? '' })),

      replyTo: replyDetails.from,
      inReplyTo: replyDetails.id  // internet message id
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
    <EmailEditor
      subject={subject}
      setSubject={setSubject}

      toValues={toValues}
      setToValues={setToValues}

      ccValues={ccValues}
      setCcValues={setCcValues}

      to={replyDetails.to.map(to => to.address)}

      isSending={true}

      handleSend={handleSend}

    />
  )
}

export default ReplyBox;
