import { z } from "zod";

/**
 * Sanitize text input by stripping potential HTML/script tags.
 * Defense-in-depth: Backend also sanitizes, but we do it here too.
 */
const sanitizeText = (value: string | undefined | null): string | undefined => {
    if (!value) return value ?? undefined;
    // Basic XSS prevention: strip < and > which could form HTML tags
    return value.replace(/<[^>]*>/g, '').trim();
};

const sanitizedString = (maxLength: number) =>
    z.string()
        .max(maxLength)
        .transform(sanitizeText)
        .refine((val) => !val || val.length > 0, { message: "Cannot be empty after sanitization" });

export const taskSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(200, "Title is too long")
        .transform(sanitizeText)
        .refine((val) => val && val.length > 0, { message: "Title is required" }),
    description: sanitizedString(2000).optional().or(z.literal("")),
    priority: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
    status: z.enum(["backlog", "todo", "in_progress", "review", "done"]).optional(),
    task_type: z.enum(["Feature", "Bug", "Chore", "Improvement", "Story"]).default("Feature"),

    // Dates
    dueDate: z.date().optional().nullable(),
    startDate: z.date().optional().nullable(),
    actualCompletionDate: z.date().optional().nullable(),

    // Agile Metrics
    storyPoints: z.number().int().min(0).nullable().optional(),
    timeEstimate: z.number().min(0).nullable().optional(),
    timeSpent: z.number().min(0).nullable().optional(),

    projectId: z.union([z.string(), z.number()]).optional().nullable(),

    // Relations (Arrays of IDs)
    tagIds: z.array(z.string()).default([]), // UUIDs now
    assigneeIds: z.array(z.number()).default([]), // User IDs (int)
    blockedByIds: z.array(z.string()).default([]), // Task IDs (UUID)
});

export type TaskFormValues = z.infer<typeof taskSchema>;

// Subtask schema
export const subtaskSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(200, "Title is too long")
        .transform(sanitizeText)
        .refine((val) => val && val.length > 0, { message: "Title is required" }),
    isCompleted: z.boolean().optional(),
});

export type SubtaskFormValues = z.infer<typeof subtaskSchema>;
