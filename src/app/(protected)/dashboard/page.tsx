import { redirect } from "next/navigation";
import SignOutButton from "./_components/sign-out-buttom";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/db";
import { usersToClinicsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

const DashboardPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  // selecionar clinicas do usuario
  const clinics = await db.query.usersToClinicsTable.findMany({
    where: eq(usersToClinicsTable.userId, session.user.id),
  });

  if (clinics.length === 0) {
    redirect("/clinic-form");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <h1>{session?.user?.name}</h1>
      <h1>{session?.user?.email}</h1>
      <SignOutButton />
    </div>
  );
};

export default DashboardPage;
