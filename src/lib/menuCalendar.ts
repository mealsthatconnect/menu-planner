import type { UserRole } from "@/lib/types";

export type CalendarView = "Month" | "Week" | "Day";
export type MenuCalendarMode = "view" | "edit";

export function canEditCalendar(role: string | null | undefined): boolean {
  return role === "Admin" || role === "Kitchen Staff";
}

export function isStaffEditorRole(
  role: string | null | undefined,
): role is Extract<UserRole, "Admin" | "Kitchen Staff"> {
  return role === "Admin" || role === "Kitchen Staff";
}

export function getOffsetDate(date: Date, offset: number, view: CalendarView) {
  const newDate = new Date(date);

  if (view === "Day") {
    newDate.setDate(date.getDate() + offset);
  } else if (view === "Week") {
    newDate.setDate(date.getDate() + offset * 7);
  } else if (view === "Month") {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  }

  return newDate;
}

export function getCurrentViewDates(anchor: Date, view: CalendarView) {
  if (view === "Day") {
    return [anchor];
  }

  if (view === "Week") {
    const dayOfWeek = anchor.getDay();
    const startOfWeek = new Date(anchor);
    startOfWeek.setDate(anchor.getDate() - dayOfWeek + 1);

    return Array.from({ length: 5 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }

  const startOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const lastDay = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();

  return Array.from(
    { length: lastDay },
    (_, i) => new Date(startOfMonth.getFullYear(), startOfMonth.getMonth(), i + 1),
  );
}

export function formatCalendarDayId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}
