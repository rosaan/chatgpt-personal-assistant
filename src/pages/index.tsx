import { type NextPage } from "next";

import AppLayout from "@/layouts/AppLayout";
import { Button, Menu } from "@mantine/core";
import { IconMessageCircle } from "@tabler/icons-react";
import { api } from "@/utils/api";
import { errorHandler } from "@/helpers/handler";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const models = api.gpt.listModels.useQuery(void null, {
    onError: errorHandler,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const router = useRouter();

  const createChat = api.gpt.createChat.useMutation({
    onError: errorHandler,
    onSuccess: async (data) => {
      await router.push(`/chat/${data.id}`);
    },
  });

  return (
    <AppLayout>
      <main className="relative flex h-screen w-full items-center justify-center">
        <Menu shadow="lg" width={200}>
          <Menu.Target>
            <Button size="md" variant="outline">
              Create new chat
            </Button>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Select Model</Menu.Label>
            {models.data?.map((model) => (
              <Menu.Item
                icon={<IconMessageCircle size={14} />}
                key={model.id}
                onClick={() => {
                  void createChat.mutateAsync({
                    model: model.id,
                  });
                }}
              >
                {model.id}
              </Menu.Item>
            ))}
          </Menu.Dropdown>
        </Menu>
      </main>
    </AppLayout>
  );
};

export default Home;
