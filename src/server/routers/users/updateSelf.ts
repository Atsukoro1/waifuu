import { protectedProcedure } from "@/server/lib/trpc";
import updateSelfSchema from "@/server/shared/updateSelfSchema";
import { PrismaClient, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export default protectedProcedure.input(updateSelfSchema).mutation(async ({ input, ctx }) => {
  await validate(ctx.user, ctx.prisma, input.username);

  await ctx.prisma.user.update({
    where: {
      id: ctx.user.id,
    },
    data: {
      username: input.username,
      name: input.name,
      bio: input.bio,
      botContext: input.botContext,
      addressedAs: input.addressedAs,
    },
  });
});

async function validate(user: User, db: PrismaClient, username?: string) {
  if (!username || username === user.username) return;

  const usernameInvalid = await db.user.findUnique({
    where: {
      username: username,
    },
  });

  if (usernameInvalid) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Username already exists.",
    });
  }
}