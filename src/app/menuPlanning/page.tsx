import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import MenuCalendar from "@/components/menuPlanning/MenuCalendar";

export default async function MenuPlanningPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/menu");
  }

  return <MenuCalendar mode="edit" />;
}
