import { isBefore, isToday, isThisWeek, startOfToday } from "date-fns";

export type DateStatus = "overdue" | "today" | "this-week" | "future" | "none";

export function getDateStatus(date?: string | Date | null): DateStatus {
    if (!date) return "none";

    const dueDate = new Date(date);
    const today = startOfToday();

    if (isBefore(dueDate, today)) return "overdue";
    if (isToday(dueDate)) return "today";
    if (isThisWeek(dueDate, { weekStartsOn: 1 })) return "this-week";
    return "future";
}

export function getDateStatusColor(status: DateStatus): string {
    switch (status) {
        case "overdue":
            return "text-red-500 bg-red-100 dark:bg-red-900/30";
        case "today":
            return "text-orange-500 bg-orange-100 dark:bg-orange-900/30";
        case "this-week":
            return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
        default:
            return "text-muted-foreground bg-muted";
    }
}
