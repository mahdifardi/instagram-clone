import { z } from "zod";

const arraySchema = z
    .union([z.array(z.string()), z.string().default("")])
    .transform((arg) => (Array.isArray(arg) ? arg : [arg]));

export const updatePostDto = z.object({
    caption: z.string().optional().default(""),
    mentions: arraySchema.optional().default([]),
    deletedImages: arraySchema.optional().default([]),
    close_status: z.enum(["close", "normal"]).optional().default("normal"),
});

export type UpdatePostDto = z.infer<typeof updatePostDto>;
