import { Paper, Avatar, Table, Container, Text } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { type QuickMessage, type Message } from "@prisma/client";
import Markdown from "markdown-to-jsx";
import { createRef, useEffect } from "react";
import Code from "./Code";
import Image from "next/image";

interface Props {
  model?: string;
  messages: Message[] | QuickMessage[];
  isLoading: boolean;
}

const ChatUI = ({ model, messages, isLoading }: Props) => {
  const colorScheme = useColorScheme();
  const divRef = createRef<HTMLDivElement>();

  useEffect(() => {
    divRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, divRef]);

  return (
    <div className="flex-1 overflow-auto">
      {model && (
        <Paper p="md" bg={colorScheme === "light" ? "gray" : "dark"}>
          <Container size="md">
            <div className="text-center">Model: {model}</div>
            {/* <div className="text-center">
            Total cost: $
            {(
              ((totalCost.data?._sum.total_token ?? 0) / 1000) *
              0.002
            ).toPrecision(1)}
          </div> */}
          </Container>
        </Paper>
      )}
      {messages?.map((message, i) => (
        <Paper p="md" bg={i % 2 ? "dark" : ""} key={i}>
          <Container size="md">
            <div className="flex items-start gap-8">
              {message.role === "user" ? (
                <Avatar className="h-10 w-10" />
              ) : (
                <Image
                  src="/openai.png"
                  alt="OpenAI logo"
                  width={40}
                  height={40}
                  className="rounded-lg"
                />
              )}
              <article className="prose">
                <Text>
                  <Markdown
                    options={{
                      overrides: {
                        pre: {
                          component: Code,
                        },
                        table: {
                          component: Table,
                        },
                      },
                    }}
                  >
                    {message.text}
                  </Markdown>
                </Text>
              </article>
            </div>
          </Container>
        </Paper>
      ))}
      {isLoading && (
        <Paper p="md" bg={"dark"}>
          <Container size="md">
            <div className="flex items-start gap-12">
              <Image
                src="/openai.png"
                alt="OpenAI logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <Text>Please wait...</Text>
            </div>
          </Container>
        </Paper>
      )}
      <div className="h-24" ref={divRef} />
    </div>
  );
};

export default ChatUI;
