import { api } from "@/utils/api";
import {
  createStyles,
  Navbar,
  UnstyledButton,
  Text,
  Group,
  ActionIcon,
  Tooltip,
  rem,
  ScrollArea,
  useMantineTheme,
  Drawer,
  Menu,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconSettings,
  IconTemplate,
  IconMessageCircle,
} from "@tabler/icons-react";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/router";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { type Chat } from "@prisma/client";
import QuickChat from "./QuickChat";
import { errorHandler } from "@/helpers/handler";
import SettingsDrawer from "./SettingsDrawer";

const links = [
  { icon: IconMessageCircle, label: "Quick Chat" },
  { icon: IconTemplate, label: "Templates" },
  { icon: IconSettings, label: "Settings" },
];

const Sidebar: React.FC = () => {
  const { classes } = useStyles();
  const [openedSettingsDrawer, setSettingsDrawer] = useDisclosure(false);

  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false);

  const chats = api.gpt.listChat.useQuery();

  const router = useRouter();

  router.events.on("routeChangeComplete", () => void chats.refetch());

  const theme = useMantineTheme();

  const createChat = api.gpt.createChat.useMutation({
    onError: errorHandler,
    onSuccess: async (data) => {
      await router.push(`/chat/${data.id}`);
      void chats.refetch();
    },
  });
  const deleteChat = api.gpt.deleteChat.useMutation({
    onError: errorHandler,
  });

  const models = api.gpt.listModels.useQuery();

  const confirmDelete = (chat: Chat) =>
    modals.openConfirmModal({
      title: "Please confirm your action",
      children: (
        <Text size="sm">Are you sure you want to delete {chat.name}?</Text>
      ),
      labels: { confirm: "Confirm", cancel: "Cancel" },
      onCancel: () => {
        return;
      },
      onConfirm: () => {
        void deleteChat
          .mutateAsync({
            chatId: chat.id,
          })
          .then(async () => {
            void chats.refetch();
            if (router.query.id === chat.id) {
              await router.push(`/`);
              notifications.show({
                title: "Chat deleted",
                message: "The chat was deleted successfully",
                variant: "success",
              });
            }
          })
          .catch((error) => {
            errorHandler(error);
          });
      },
    });

  const mainLinks = links.map((link) => (
    <UnstyledButton
      key={link.label}
      className={classes.mainLink}
      onClick={() => {
        if (link.label === "Quick Chat") {
          openDrawer();
        }
        if (link.label === "Settings") {
          setSettingsDrawer.open();
        }
      }}
    >
      <div className={classes.mainLinkInner}>
        <link.icon size={20} className={classes.mainLinkIcon} stroke={1.5} />
        <span>{link.label}</span>
      </div>
    </UnstyledButton>
  ));

  const collectionLinks = chats.data?.map((chat) => (
    <Link
      href={`/chat/${chat.id}`}
      key={chat.name}
      className={classes.collectionLink}
      style={
        (router.query.id === chat.id && {
          backgroundColor: theme.colors.gray[8],
        }) ||
        {}
      }
    >
      <div className="flex h-6 items-center justify-between gap-4">
        <Text truncate w={rem(220)}>
          <span style={{ marginRight: rem(9), fontSize: rem(16) }}>💬</span>{" "}
          {chat.name}
        </Text>
        {router.query.id === chat.id && (
          <ActionIcon
            variant="ghost"
            loading={deleteChat.isLoading}
            onClick={() => confirmDelete(chat)}
          >
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </div>
    </Link>
  ));

  return (
    <Navbar width={{ sm: 300 }} p="md" className={classes.navbar}>
      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title="Quick Chat"
        position="right"
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <QuickChat />
      </Drawer>
      <SettingsDrawer
        opened={openedSettingsDrawer}
        close={setSettingsDrawer.close}
      />
      {/* <TextInput
        placeholder="Search"
        icon={<IconSearch size="0.8rem" stroke={1.5} />}
        rightSectionWidth={70}
        rightSection={<Code className={classes.searchCode}>Ctrl + K</Code>}
        styles={{ rightSection: { pointerEvents: "none" } }}
        mb="sm"
      /> */}
      <Navbar.Section
        className={classes.section}
        grow
        component={ScrollArea.Autosize}
      >
        <Group className={classes.collectionsHeader} position="apart">
          <Text weight={500} color="dimmed">
            Chats
          </Text>
          <Menu shadow="lg" width={200}>
            <Menu.Target>
              <Tooltip label="Create chat" withArrow position="right">
                <ActionIcon variant="default" size={18}>
                  <IconPlus size="0.8rem" stroke={1.5} />
                </ActionIcon>
              </Tooltip>
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
        </Group>
        <div className={classes.collections + " flex flex-col gap-y-1"}>
          {collectionLinks}
        </div>
      </Navbar.Section>
      <Navbar.Section className={classes.section}>
        <div className={classes.mainLinks}>{mainLinks}</div>
      </Navbar.Section>

      {/* <Navbar.Section className={classes.section}> */}
      {/* <ThemeToggle /> */}
      {/* </Navbar.Section> */}

      <Navbar.Section>
        <Text size="sm" component="a" href="https://github.com/rosaan">
          Developed by Rosaan © {new Date().getFullYear()}
        </Text>
      </Navbar.Section>
    </Navbar>
  );
};

export default Sidebar;

const useStyles = createStyles((theme) => ({
  navbar: {
    paddingTop: 0,
  },

  section: {
    marginLeft: `calc(${theme.spacing.md} * -1)`,
    marginRight: `calc(${theme.spacing.md} * -1)`,
    marginBottom: theme.spacing.md,

    "&:not(:last-of-type)": {
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[3]
      }`,
    },
  },

  searchCode: {
    fontWeight: 700,
    fontSize: rem(10),
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[2]
    }`,
  },

  mainLinks: {
    paddingLeft: `calc(${theme.spacing.md} - ${theme.spacing.xs})`,
    paddingRight: `calc(${theme.spacing.md} - ${theme.spacing.xs})`,
    paddingBottom: theme.spacing.md,
  },

  mainLink: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: `${rem(8)} ${theme.spacing.xs}`,
    borderRadius: theme.radius.sm,
    fontWeight: 500,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  mainLinkInner: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },

  mainLinkIcon: {
    marginRight: theme.spacing.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[2]
        : theme.colors.gray[6],
  },

  mainLinkBadge: {
    padding: 0,
    width: rem(20),
    height: rem(20),
    pointerEvents: "none",
  },

  collections: {
    paddingLeft: `calc(${theme.spacing.md} - ${rem(6)})`,
    paddingRight: `calc(${theme.spacing.md} - ${rem(6)})`,
    paddingBottom: theme.spacing.md,
  },

  collectionsHeader: {
    paddingLeft: `calc(${theme.spacing.md} + ${rem(2)})`,
    paddingRight: theme.spacing.md,
    marginBottom: rem(5),
  },

  collectionLink: {
    display: "block",
    padding: `${rem(8)} ${theme.spacing.xs}`,
    textDecoration: "none",
    borderRadius: theme.radius.sm,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    lineHeight: 1,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },
}));
