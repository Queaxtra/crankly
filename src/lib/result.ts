export const createToolResult = (data: unknown) => ({
  content: [
    {
      type: "text" as const,
      text: JSON.stringify(data, null, 2),
    },
  ],
});

export const createToolErrorResult = (message: string) => ({
  content: [
    {
      type: "text" as const,
      text: message,
    },
  ],
  isError: true,
});
