import { SettingKey } from "@/constants/enum";
import { errorHandler } from "@/helpers/handler";
import { api } from "@/utils/api";
import { Button, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";

const OpenAIApi = () => {
  const [inputType, setInputType] = useState<"password" | "text">("password");

  const form = useForm({
    initialValues: {
      key: "",
    },
  });
  const mutateKey = api.setting.createKey.useMutation({
    onError: errorHandler,
  });

  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <form
        className="flex w-72 flex-col gap-y-2"
        onSubmit={form.onSubmit(
          (values) =>
            void mutateKey
              .mutateAsync({
                key: SettingKey.OPENAI_API_KEY,
                value: values.key,
              })
              .then(() => {
                window.location.reload();
              })
        )}
      >
        <TextInput
          type={inputType}
          placeholder="key"
          label="OpenAI API Key"
          mb="sm"
          withAsterisk
          required
          rightSection={
            <IconEye
              size={20}
              color={inputType === "password" ? "gray" : "blue"}
              onClick={() =>
                setInputType((prev) =>
                  prev === "password" ? "text" : "password"
                )
              }
            />
          }
          {...form.getInputProps("key")}
        />
        <Button type="submit">Submit</Button>
      </form>
    </div>
  );
};

export default OpenAIApi;
