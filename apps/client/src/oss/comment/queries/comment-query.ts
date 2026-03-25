export function useResolveCommentMutation() {
  return {
    mutateAsync: async (_input?: {
      commentId?: string;
      pageId?: string;
      resolved?: boolean;
    }) => null,
  };
}
