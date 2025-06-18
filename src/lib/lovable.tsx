
import { LovableProvider } from "@lovable/chat";

const mcpServers = [
  {
    name: "Qdrant-MCP",
    url: import.meta.env.VITE_MCP_URL,
    headers: import.meta.env.VITE_MCP_HEADER
      ? {
          [import.meta.env.VITE_MCP_HEADER]:
            import.meta.env.VITE_MCP_TOKEN,
        }
      : undefined,
  },
];

export function withLovable(children: React.ReactNode) {
  return (
    <LovableProvider
      apiKey={import.meta.env.VITE_LOVABLE_API_KEY}
      mcpServers={mcpServers}
      model={import.meta.env.VITE_LOVABLE_MODEL}
    >
      {children}
    </LovableProvider>
  );
}
