import { SettingKey } from "@/constants/enum";
import { errorHandler } from "@/helpers/handler";
import { api } from "@/utils/api";
import { Button, Drawer, Group, ScrollArea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconEye } from "@tabler/icons-react";
import { useState } from "react";

interface Props {
  opened: boolean;
  close: () => void;
}

const SettingsDrawer = ({ opened, close }: Props) => {
  const [inputType, setInputType] = useState<"password" | "text">("password");
  const form = useForm({
    initialValues: {
      [SettingKey.OPENAI_API_KEY]: "",
    },
  });

  api.setting.getKey.useQuery(
    {
      key: SettingKey.OPENAI_API_KEY,
    },
    {
      onSuccess: (data) => {
        form.setFieldValue(SettingKey.OPENAI_API_KEY, data?.value || "");
      },
    }
  );

  const mutateKey = api.setting.updateKey.useMutation({
    onError: errorHandler,
  });

  return (
    <Drawer
      opened={opened}
      onClose={close}
      title="Settings"
      position="right"
      scrollAreaComponent={ScrollArea.Autosize}
    >
      <form
        onSubmit={form.onSubmit((values) => {
          void mutateKey
            .mutateAsync({
              key: SettingKey.OPENAI_API_KEY,
              value: values[SettingKey.OPENAI_API_KEY],
            })
            .then(() => {
              close();
              notifications.show({
                title: "Settings updated",
                message: "Your settings have been updated",
                color: "teal",
              });
            });
        })}
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
          {...form.getInputProps(SettingKey.OPENAI_API_KEY)}
        />

        <Group position="right" mt="md">
          <Button type="submit">Save</Button>
        </Group>
      </form>
    </Drawer>
  );
};

export default SettingsDrawer;
