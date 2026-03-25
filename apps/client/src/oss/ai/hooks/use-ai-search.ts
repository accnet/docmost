export function useAiSearch() {
  return {
    data: null,
    isPending: false,
    mutate: (_params?: Record<string, unknown>) => undefined,
    reset: () => undefined,
    error: null,
    streamingAnswer: "",
    streamingSources: [],
    clearStreaming: () => undefined,
  };
}
