import { Suspense } from "react";
import { CalendarView } from "@/components/calendar/calendar-view";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <Suspense fallback={null}>
      <CalendarView />
    </Suspense>
  );
}
