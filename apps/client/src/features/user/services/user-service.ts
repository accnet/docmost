import api from "@/lib/api-client";
import { ICurrentUser, ISystemUser, IUser } from "@/features/user/types/user.types";
import { IPagination, QueryParams } from "@/lib/types";

export async function getMyInfo(): Promise<ICurrentUser> {
  const req = await api.post<ICurrentUser>("/users/me");
  return req.data as ICurrentUser;
}

export async function updateUser(data: Partial<IUser>): Promise<IUser> {
  const req = await api.post<IUser>("/users/update", data);
  return req.data as IUser;
}

export async function getSystemUsers(
  params?: QueryParams,
): Promise<IPagination<ISystemUser>> {
  const req = await api.post("/users/system/list", params);
  return req.data;
}

export async function deactivateSystemUser(data: { userId: string }): Promise<void> {
  await api.post("/users/system/deactivate", data);
}

export async function activateSystemUser(data: { userId: string }): Promise<void> {
  await api.post("/users/system/activate", data);
}

export async function deleteSystemUser(data: { userId: string }): Promise<void> {
  await api.post("/users/system/delete", data);
}
