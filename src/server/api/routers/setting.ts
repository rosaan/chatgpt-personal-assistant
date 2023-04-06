import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { SettingKey } from "@/constants/enum";

export const settingRouter = createTRPCRouter({
  createKey: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // check if the input.value is a valid OPENAI API key
      try {
        const setting = await ctx.prisma.setting.create({
          data: input,
        });
        return setting;
      } catch (e) {
        throw e;
      }
    }),
  updateKey: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const setting = await ctx.prisma.setting.update({
          where: { key: input.key },
          data: {
            value: input.value,
          },
        });
        if (setting.key === SettingKey.OPENAI_API_KEY)
          process.env.OPENAI_API_KEY = setting.value;
        return setting;
      } catch (e) {
        throw e;
      }
    }),
  getKey: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input, ctx }) => {
      const api_key =
        process.env.OPENAI_API_KEY === "undefined"
          ? ""
          : process.env.OPENAI_API_KEY;
      console.log("KEY", api_key);
      if (input.key === SettingKey.OPENAI_API_KEY && api_key)
        return {
          key: SettingKey.OPENAI_API_KEY,
          value: process.env.OPENAI_API_KEY,
        };

      try {
        const setting = await ctx.prisma.setting.findUnique({
          where: { key: input.key },
        });
        return setting;
      } catch (e) {
        throw e;
      }
    }),
});
