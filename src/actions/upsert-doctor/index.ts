"use server";

import { db } from "@/db";
import { upsertDoctorSchema, UpsertDoctorSchema } from "./schema";
import { doctorsTable } from "@/db/schema";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { revalidatePath } from "next/cache";

dayjs.extend(utc);

export const upsertDoctor = actionClient
  .schema(upsertDoctorSchema)
  .action(async ({ parsedInput }) => {
    const availableFromTime = parsedInput.availableFromTime; // 15:00
    const availableToTime = parsedInput.availableToTime; // 16:00

    const availableFromUtc = dayjs
      .utc()
      .set("hour", parseInt(availableFromTime.split(":")[0]))
      .set("minute", parseInt(availableFromTime.split(":")[1]))
      .set("second", parseInt(availableFromTime.split(":")[2]))
      .utc();

    const availableToUtc = dayjs
      .utc()
      .set("hour", parseInt(availableToTime.split(":")[0]))
      .set("minute", parseInt(availableToTime.split(":")[1]))
      .set("second", parseInt(availableToTime.split(":")[2]))
      .utc();

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    if (!session?.user.clinic?.id) {
      throw new Error("Clinic not found");
    }

    await db
      .insert(doctorsTable)
      .values({
        ...parsedInput,
        id: parsedInput.id,
        clinicId: session?.user.clinic?.id,
        availableFromWeekDay: parsedInput.availableFromWeekday,
        availableToWeekDay: parsedInput.availableToWeekday,
        speciality: parsedInput.specialty,
        availableFromTime: availableFromUtc.format("HH:mm:ss"),
        availableToTime: availableToUtc.format("HH:mm:ss"),
      })
      .onConflictDoUpdate({
        target: [doctorsTable.id],
        set: {
          ...parsedInput,
          availableFromTime: availableFromUtc.format("HH:mm:ss"),
          availableToTime: availableToUtc.format("HH:mm:ss"),
        },
      });
    revalidatePath("/doctors");
  });
