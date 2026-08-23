import { api } from "@/lib/api";
import type { AttendanceResult, TableInfo } from "@/types/domain";

export async function getTableByToken(token: string): Promise<TableInfo> {
  const { data } = await api.get<TableInfo>(
    `/api/v1/public/tables/${encodeURIComponent(token)}`,
  );
  return data;
}

export async function callWaiter(token: string): Promise<AttendanceResult> {
  const { data } = await api.post<AttendanceResult>(
    `/api/v1/public/tables/${encodeURIComponent(token)}/attendance`,
  );
  return data;
}
