import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const gptRouter = createTRPCRouter({
  chatCompletion: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const chat = await ctx.prisma.chat.findUnique({
        where: {
          id: input.chatId,
        },
      });

      const messages = await ctx.prisma.message.findMany({
        where: {
          chatId: input.chatId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const data = await ctx.openai.chatCompletion(
        chat?.model ?? "gpt-3.5-turbo",
        messages.map((message) => ({
          role: message.role === "user" ? "user" : "assistant",
          content: message.text,
        }))
      );

      if (data.choices.length > 0) {
        const messages = await Promise.all(
          data.choices.map(async (choice) => {
            const message = await ctx.prisma.message.create({
              data: {
                text: choice.message?.content ?? "",
                role: "assistant",
                total_token: data.usage?.total_tokens ?? 0,
                chatId: input.chatId,
              },
            });
            return message;
          })
        );

        return messages;
      }
    }),

  createChat: publicProcedure
    .input(z.object({ model: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const count = await ctx.prisma.chat.count({
          where: {
            deletedAt: null,
          },
        });
        const chat = await ctx.prisma.chat.create({
          data: {
            name: `Chat ${count + 1}`,
            model: input.model,
          },
        });
        return chat;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),

  getChat: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const chat = await ctx.prisma.chat.findFirst({
        where: {
          id: input.chatId,
          deletedAt: null,
        },
      });
      return chat;
    }),

  listChat: publicProcedure.query(async ({ ctx }) => {
    const chats = await ctx.prisma.chat.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return chats;
  }),

  listMessage: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      const messages = await ctx.prisma.message.findMany({
        where: {
          chatId: input.chatId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });
      return messages;
    }),

  createMessage: publicProcedure
    .input(z.object({ text: z.string(), role: z.string(), chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const count = await ctx.prisma.message.count({
          where: {
            chatId: input.chatId,
          },
        });

        void (async () => {
          if (count === 0) {
            const data = await ctx.openai.generateChatTitle(input.text);
            if (data.choices.length > 0 && data?.choices[0]?.message?.content) {
              await ctx.prisma.chat.update({
                where: {
                  id: input.chatId,
                },
                data: {
                  name: data?.choices[0]?.message?.content,
                },
              });
            }
          }
        })();

        const message = await ctx.prisma.message.create({
          data: input,
        });

        return message;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),

  totalCost: publicProcedure.query(async ({ ctx }) => {
    const totalCost = await ctx.prisma.message.aggregate({
      _sum: {
        total_token: true,
      },
    });
    return totalCost;
  }),

  deleteChat: publicProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const chat = await ctx.prisma.chat.update({
          where: {
            id: input.chatId,
          },
          data: {
            deletedAt: new Date(),
          },
        });
        return chat;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }),

  listQuickMessage: publicProcedure.query(async ({ ctx }) => {
    const quickMessages = await ctx.prisma.quickMessage.findMany({
      where: {
        deletedAt: null,
      },
    });
    return quickMessages;
  }),

  createQuickMessage: publicProcedure
    .input(z.object({ text: z.string(), role: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.prisma.quickMessage.create({
        data: {
          text: input.text,
          role: input.role,
        },
      });
      return data;
    }),

  quickMessageChatCompletion: publicProcedure.mutation(async ({ ctx }) => {
    const quickMessages = await ctx.prisma.quickMessage.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    });

    const data = await ctx.openai.generalAssistant(
      quickMessages.map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.text,
      }))
    );

    if (data.choices.length > 0) {
      const messages = await Promise.all(
        data.choices.map(async (choice) => {
          const message = await ctx.prisma.quickMessage.create({
            data: {
              text: choice.message?.content ?? "",
              role: "assistant",
              total_token: data.usage?.total_tokens ?? 0,
            },
          });
          return message;
        })
      );

      return messages;
    }
  }),

  clearQuickMessages: publicProcedure.mutation(async ({ ctx }) => {
    const data = await ctx.prisma.quickMessage.updateMany({
      where: {
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return data;
  }),

  listModels: publicProcedure.query(async ({ ctx }) => {
    const models = await ctx.openai.listModels();
    return models;
  }),
});
