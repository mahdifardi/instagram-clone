import { z } from "zod";

export const commentDto = z.object({
    postId: z.string().min(1),
    text: z.string().min(1),
    commentId: z.string().optional(),
});

export type CommentDto = z.infer<typeof commentDto>;
