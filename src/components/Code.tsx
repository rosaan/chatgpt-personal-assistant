import { Paper } from "@mantine/core";
import { Prism, type PrismProps } from "@mantine/prism";

interface Props {
  children: {
    props: {
      className: string;
      children: string;
    };
  };
}

const Code = ({ children }: Props) => {
  const className = children?.props?.className;
  const code = children?.props?.children;
  const language =
    (className?.replace("lang-", "") as PrismProps["language"]) || "bash";

  if (!code) return null;

  return (
    <Paper bg="dark" withBorder p="sm">
      <Prism language={language} p="sm">
        {code}
      </Prism>
    </Paper>
  );
};

export default Code;
