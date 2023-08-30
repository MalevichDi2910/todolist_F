import { ResponseType } from "features/TodolistsList/todolists.api";
import { instance } from "common/api/common.api";

export const authAPI = {
  login(data: LoginParamsType) {
    const promise = instance.post<ResponseType<{ userId?: number }>>("auth/login", data);
    return promise;
  },
  logout() {
    const promise = instance.delete<ResponseType<{ userId?: number }>>("auth/login");
    return promise;
  },
  me() {
    const promise = instance.get<ResponseType<{ id: number; email: string; login: string }>>("auth/me");
    return promise;
  },
};

export type LoginParamsType = {
  email: string;
  password: string;
  rememberMe: boolean;
  captcha?: string;
};