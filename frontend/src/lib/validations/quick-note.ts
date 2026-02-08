import { z } from "zod";

/**
 * Sanitize text input by stripping potential HTML/script tags.
 */
const sanitizeText = (value: string | undefined | null): string | undefined => {
    if (!value) return value ?? undefined;
    return value.replace(/<[^>]*>/g, '').trim();
};

export const quickNoteSchema = z.object({
    content: z.string()
        .min(1, "Content is required")
        .max(5000, "Note is too long")
        .transform(sanitizeText)
        .refine((val) => val && val.length > 0, { message: "Content is required" }),
});

export type QuickNoteFormValues = z.infer<typeof quickNoteSchema>;

// Convert to task schema
export const convertToTaskSchema = z.object({
    title: z.string()
        .max(200)
        .transform(sanitizeText)
        .optional(),
    description: z.string()
        .max(2000)
        .transform(sanitizeText)
        .optional(),
    priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
    status: z.enum(["backlog", "in_progress", "review", "done"]).default("backlog"),
    projectId: z.number().optional().nullable(),
});

export type ConvertToTaskFormValues = z.infer<typeof convertToTaskSchema>;
