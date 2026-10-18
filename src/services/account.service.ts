import { api } from "@/lib/api";

/** Chamadas públicas da conta (sem login): e-mail, senha, exclusão e contato. */
export const accountService = {
  async forgotPassword(email: string): Promise<void> {
    await api.post("/api/v1/auth/forgot-password", { email });
  },
  async resetPassword(token: string, password: string): Promise<void> {
    await api.post("/api/v1/auth/reset-password", { token, password });
  },
  async verifyEmail(token: string): Promise<void> {
    await api.post("/api/v1/auth/verify-email", { token });
  },
  async cancelDeletionByToken(token: string): Promise<void> {
    await api.post("/api/v1/account/deletion-request/cancel-by-token", { token });
  },
  async sendContact(dto: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<void> {
    await api.post("/api/v1/public/contact", dto);
  },
};
