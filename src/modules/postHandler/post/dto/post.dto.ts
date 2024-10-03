import { z } from "zod";

const arraySchema = z
    .union([z.array(z.string()), z.string()])
    .transform((arg) => (Array.isArray(arg) ? arg : [arg]));

export const postDto = z.object({
    caption: z.string().optional().default(""),
    mentions: arraySchema.optional().default([]),
    close_status: z.enum(["close", "normal"]).optional().default("normal"),
});

export type PostDto = z.infer<typeof postDto>;
