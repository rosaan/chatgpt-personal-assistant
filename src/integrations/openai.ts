import {
  type ChatCompletionRequestMessage,
  Configuration,
  OpenAIApi,
} from "openai/";

export class OpenAI {
  private openai: OpenAIApi;

  constructor(key: string | undefined) {
    this.openai = new OpenAIApi(
      new Configuration({
        apiKey: key,
      })
    );
  }
  async chatCompletion(
    model: string,
    messages: ChatCompletionRequestMessage[]
  ) {
    const response = await this.openai.createChatCompletion({
      model,
      messages,
    });

    return response.data;
  }
  async generalAssistant(messages: ChatCompletionRequestMessage[]) {
    const response = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a very usefull assistant for me that knows everything about everything.",
        },
        ...messages,
      ],
    });

    return response.data;
  }

  async listModels() {
    const availableModels = ["gpt-4", "gpt-3.5-turbo", "gpt-4-32k"];
    const models = await this.openai.listModels();
    return models.data?.data.filter((model) =>
      availableModels.includes(model.id)
    );
  }

  async generateChatTitle(message: string) {
    const response = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "Generate a short title between 3-8 words for a chat with the following message: ",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    return response.data;
  }
}
