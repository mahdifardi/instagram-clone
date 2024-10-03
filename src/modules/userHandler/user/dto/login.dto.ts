import { z } from "zod";

export const loginDto = z.object({
    credential: z.string().min(1),
    password: z.string().min(1),
    keepMeSignedIn: z.boolean().optional().default(false),
});

export type LoginDto = z.infer<typeof loginDto>;
