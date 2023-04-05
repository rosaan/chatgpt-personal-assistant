import Sidebar from "@/components/Sidebar";
import { AppShell } from "@mantine/core";
import { type PropsWithChildren } from "react";

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <AppShell
      padding={0}
      navbar={<Sidebar />}
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
}
