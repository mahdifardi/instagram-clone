import { z } from "zod";

export const signUpDto = z.object({
    username: z.string().min(1),
    email: z.string().email().min(1),
    password: z.string().min(1),
});

export type SignUpDto = z.infer<typeof signUpDto>;
