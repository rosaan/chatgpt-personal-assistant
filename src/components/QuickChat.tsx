/* eslint-disable @typescript-eslint/no-misused-promises */
import { errorHandler } from "@/helpers/handler";
import ChatUI from "./ChatUI";
import MessageInput from "./MessageInput";
import { api } from "@/utils/api";
import { type FormEvent } from "react";

const QuickChat = () => {
  const messages = api.gpt.listQuickMessage.useQuery(void null, {
    onError: errorHandler,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const chatCompletion = api.gpt.quickMessageChatCompletion.useMutation({
    onError: errorHandler,
  });
  const createMessage = api.gpt.createQuickMessage.useMutation({
    onError: errorHandler,
  });
  const clearQuickMessages = api.gpt.clearQuickMessages.useMutation({
    onError: errorHandler,
  });

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const text = (e.currentTarget?.message?.value as string) || "";

    if (!text.trim()) return;
    if (text.trim() === "/clear") {
      await clearQuickMessages.mutateAsync();
      await messages.refetch();
      return;
    }

    try {
      const message = await createMessage.mutateAsync({
        role: "user",
        text,
      });
      messages.data?.push(message);

      const chatCompletionMsgs = await chatCompletion.mutateAsync();

      chatCompletionMsgs?.forEach((m) => {
        messages.data?.push(m);
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <ChatUI
        messages={messages.data ?? []}
        isLoading={chatCompletion.isLoading}
      />
      <form onSubmit={handleFormSubmit} className="w-full">
        <MessageInput disabled={chatCompletion.isLoading} />
      </form>
    </>
  );
};

export default QuickChat;
