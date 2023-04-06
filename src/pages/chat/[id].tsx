/* eslint-disable @typescript-eslint/no-misused-promises */
import { type NextPage } from "next";

import AppLayout from "@/layouts/AppLayout";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { type FormEvent } from "react";
import ChatUI from "@/components/ChatUI";
import MessageInput from "@/components/MessageInput";
import { errorHandler } from "@/helpers/handler";

const ChatID: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const chat = api.gpt.getChat.useQuery(
    {
      chatId: id as string,
    },
    {
      onError: errorHandler,
      onSuccess: async (data) => {
        if (!data) {
          await router.push("/");
        }
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const chatCompletion = api.gpt.chatCompletion.useMutation({
    onError: errorHandler,
  });
  const createMessage = api.gpt.createMessage.useMutation({
    onError: errorHandler,
  });

  const messages = api.gpt.listMessage.useQuery(
    {
      chatId: id as string,
    },
    {
      onError: errorHandler,
      onSuccess: async (data) => {
        if (!data) {
          await router.push("/");
        }
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const text = (e.currentTarget?.message?.value as string) || "";

    try {
      const message = await createMessage.mutateAsync({
        chatId: id as string,
        role: "user",
        text,
      });

      messages.data?.push(message);

      const chatCompletionMsgs = await chatCompletion.mutateAsync({
        chatId: id as string,
      });

      chatCompletionMsgs?.forEach((m) => {
        messages.data?.push(m);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AppLayout>
      <main className="relative h-screen">
        <ChatUI
          model={chat.data?.model}
          messages={messages.data ?? []}
          isLoading={chatCompletion.isLoading}
        />
        <form onSubmit={handleFormSubmit}>
          <MessageInput disabled={chatCompletion.isLoading} sidebarOpen />
        </form>
      </main>
    </AppLayout>
  );
};

export default ChatID;
