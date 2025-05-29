"use server";

import { db } from "@/db";
import { clinicsTable, usersToClinicsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { authClient } from "@/lib/auth-clinte";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const createClinic = async (name: string) => {
  // verificar se usuario esta logado
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const [clinic] = await db.insert(clinicsTable).values({ name }).returning();
  await db.insert(usersToClinicsTable).values({
    clinicId: clinic.id,
    userId: session.user.id,
  });
  redirect("/dashboard");
};
