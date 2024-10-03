import { z } from "zod";

export const editProfileDto = z.object({
    password: z.string().optional(),
    email: z.string().email().min(1),
    firstname: z.string().optional().default(""),
    lastname: z.string().optional().default(""),
    profileStatus: z.enum(["public", "private"]).optional().default("public"),
    bio: z.string().optional().default(""),
});

export type EditProfileDto = z.infer<typeof editProfileDto>;
