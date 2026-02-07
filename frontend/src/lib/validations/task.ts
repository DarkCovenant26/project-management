import { z } from "zod";

export const taskSchema = z.object({
    title: z.string().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().max(2000, "Description is too long").optional().or(z.literal("")),
    priority: z.enum(["Low", "Medium", "High"]),
    dueDate: z.date().optional().nullable(),
    projectId: z.number().optional().nullable(),
    tagIds: z.array(z.number()).default([]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
