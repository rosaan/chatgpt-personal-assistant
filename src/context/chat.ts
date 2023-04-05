import { atom } from "jotai";
import { api } from "@/utils/api";

const getChats = () => {
  const { data } = api.gpt.listChat.useQuery();
  return data;
};

const chat = atom(getChats());

export { chat };
