"use client";

import type { DropZoneData } from "@/components/menuPlanning/dndTypes";
import { useDroppable } from "@dnd-kit/core";
import { ReactNode } from "react";

interface DroppableCalendarAreaProps {
  dayId: string;
  children: ReactNode;
  className?: string;
  droppableId?: string;
  disabled?: boolean;
}

export default function DroppableCalendarArea({
  dayId,
  children,
  className,
  droppableId,
  disabled = false,
}: DroppableCalendarAreaProps) {
  const dropData: DropZoneData = {
    dest: "calendar",
    dayId,
  };
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId ?? `droppable-${dayId}`,
    data: dropData,
    disabled,
  });
  const defaultClassName =
    "flex h-full w-full flex-1 flex-row flex-wrap content-start gap-2 rounded-[10px] p-2 transition-colors md:flex-col md:flex-nowrap md:p-4";
  const overClassName = className ? "bg-radish-100 ring-2 ring-radish-900" : "bg-radish-100 border-2 border-radish-900";

  return (
    <div
      ref={disabled ? undefined : setNodeRef}
      className={`${className ?? defaultClassName} ${
        !disabled && isOver ? overClassName : className ? "" : "border border-medium-gray/20 bg-white/30"
      }`}
    >
      {children}
    </div>
  );
}
