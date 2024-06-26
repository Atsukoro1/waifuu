import { protectedProcedure } from "@/server/lib/trpc";
import { BotVisibility } from "@prisma/client";
import { z } from "zod";

/**
 * Returns all bots that the user has access to (public and private for the user making the request, public for bots
 * of other users).
 * */
export default protectedProcedure
  .input(
    z
      .object({
        limit: z.number().min(1).nullish(),
        userId: z.string().nullish(),
      })
      .optional(),
  )
  .query(async ({ input, ctx }) => {
    const isUser = !input?.userId || input.userId === ctx.user.id;
    const visibility = isUser ? undefined : BotVisibility.PUBLIC;

    return await ctx.prisma.bot.findMany({
      take: input?.limit || undefined,
      where: {
        creatorId: input?.userId ?? ctx.user.id,
        visibility: visibility,
      },
    });
  });
