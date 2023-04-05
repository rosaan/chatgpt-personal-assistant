import { Container, Paper, Textarea } from "@mantine/core";

interface Props {
  disabled: boolean;
  sidebarOpen?: boolean;
}

const MessageInput = ({ disabled = false, sidebarOpen = false }: Props) => {
  return (
    <Paper
      className={`fixed bottom-0 left-0 w-full ${sidebarOpen ? "pl-80" : ""}`}
    >
      <Container size="lg">
        <div className="z-90 flex items-center justify-center py-4">
          <Textarea
            autoFocus
            name="message"
            minRows={1}
            maxRows={10}
            autosize
            tabIndex={0}
            placeholder="Send a message"
            className="w-full"
            disabled={disabled}
            onKeyDown={(e) => {
              if (e.shiftKey && e.key === "Enter") {
                return;
              }
              if (e.key === "Enter") {
                if (!e.currentTarget.value.trim()) {
                  e.currentTarget.value = "";
                  e.currentTarget.rows = 1;
                  return;
                }
                e.currentTarget.rows = 1;
                e.currentTarget.form?.requestSubmit();
                e.currentTarget.value = "";
              }
            }}
          />
        </div>
      </Container>
    </Paper>
  );
};

export default MessageInput;
