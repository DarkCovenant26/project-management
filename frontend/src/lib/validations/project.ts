import { z } from "zod";

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    description: z.string().max(1000, "Description is too long").optional().or(z.literal("")),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;
