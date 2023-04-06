import { type AppType } from "next/app";
import { type Session } from "next-auth";
// import { SessionProvider } from "next-auth/react";
import {
  type ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
  Loader,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import { api } from "@/utils/api";

import "@/styles/globals.css";
import Head from "next/head";
import { useState } from "react";
import { SettingKey } from "@/constants/enum";
import OpenAIToken from "@/components/OpenAIToken";
import { errorHandler } from "@/helpers/handler";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: {
    // session,
    ...pageProps
  },
}) => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const fetchSettings = api.setting.getKey.useQuery(
    {
      key: SettingKey.OPENAI_API_KEY,
    },
    {
      onError: errorHandler,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  return (
    <>
      <Head>
        <title>ChatGPT Local</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
        <link rel="icon" href="/_next/image?url=%2Fopenai.png&w=96&q=75" />
      </Head>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Notifications position="top-right" zIndex={2077} />
          <ModalsProvider>
            {/* <SessionProvider session={session}> */}
            {fetchSettings.isLoading && (
              <div className="flex h-screen w-screen items-center justify-center">
                <Loader size="lg" />
              </div>
            )}
            {!fetchSettings.isLoading && !fetchSettings.data?.key && (
              <OpenAIToken />
            )}
            {fetchSettings.data?.key && <Component {...pageProps} />}
            {/* </SessionProvider> */}
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
