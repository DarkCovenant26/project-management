import { z } from "zod";

/**
 * Sanitize text input by stripping potential HTML/script tags.
 * Defense-in-depth: Backend also sanitizes, but we do it here too.
 */
const sanitizeText = (value: string | undefined | null): string | undefined => {
    if (!value) return value ?? undefined;
    return value.replace(/<[^>]*>/g, '').trim();
};

export const projectSchema = z.object({
    title: z.string()
        .min(1, "Title is required")
        .max(200, "Title is too long")
        .transform((val) => val.replace(/<[^>]*>/g, '').trim())
        .refine((val) => val.length > 0, { message: "Title is required" }),
    description: z.string()
        .max(2000, "Description is too long")
        .transform(sanitizeText)
        .optional()
        .or(z.literal("")),
    color: z.string().max(20).optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

// Member invitation schema
export const memberInviteSchema = z.object({
    email: z.string()
        .email("Invalid email address")
        .max(254)
        .transform((v) => v.trim().toLowerCase()),
    role: z.enum(["admin", "member", "viewer"]).default("member"),
});

export type MemberInviteFormValues = z.infer<typeof memberInviteSchema>;
