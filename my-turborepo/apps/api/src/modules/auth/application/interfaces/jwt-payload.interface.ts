import { UserRole } from "@hvalya/types";

export interface IJwtPayload {
  sub: string;   // userId
  email: string;
  role: UserRole;
}