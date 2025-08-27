import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const auth = () => getServerSession(authOptions);
export const getSession = () => getServerSession(authOptions);
