/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { notifications } from "@mantine/notifications";

export const errorHandler = (error: any) => {
  if (!error) return;
  const message = (): string => {
    if (error?.message?.includes("401")) {
      return "Invalid OpenAI API key";
    }
    return error?.message || "Something went wrong";
  };
  notifications.show({
    color: "red",
    title: "Error",
    message: message(),
  });
};
