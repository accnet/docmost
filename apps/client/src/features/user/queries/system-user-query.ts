import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  activateSystemUser,
  deactivateSystemUser,
  deleteSystemUser,
  getSystemUsers,
} from "@/features/user/services/user-service";
import { IPagination, QueryParams } from "@/lib/types";
import { ISystemUser } from "@/features/user/types/user.types";
import { notifications } from "@mantine/notifications";

export function useSystemUsersQuery(params?: QueryParams) {
  return useQuery<IPagination<ISystemUser>, Error>({
    queryKey: ["systemUsers", params],
    queryFn: () => getSystemUsers(params),
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["systemUsers"] });
}

export function useDeactivateSystemUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string }>({
    mutationFn: (data) => deactivateSystemUser(data),
    onSuccess: () => invalidate(queryClient),
    onError: (error: any) =>
      notifications.show({
        message: error?.response?.data?.message ?? "Failed to deactivate user",
        color: "red",
      }),
  });
}

export function useActivateSystemUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string }>({
    mutationFn: (data) => activateSystemUser(data),
    onSuccess: () => invalidate(queryClient),
    onError: (error: any) =>
      notifications.show({
        message: error?.response?.data?.message ?? "Failed to activate user",
        color: "red",
      }),
  });
}

export function useDeleteSystemUserMutation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string }>({
    mutationFn: (data) => deleteSystemUser(data),
    onSuccess: () => invalidate(queryClient),
    onError: (error: any) =>
      notifications.show({
        message: error?.response?.data?.message ?? "Failed to delete user",
        color: "red",
      }),
  });
}
