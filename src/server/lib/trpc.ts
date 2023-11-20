/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { TRPCError } from "@/server/lib/TRPCError";
import { initTRPC } from "@trpc/server";

import { type CreateNextContextOptions } from "@trpc/server/adapters/next";
import { TRPC_ERROR_CODE_KEY, TRPC_ERROR_CODE_NUMBER } from "@trpc/server/src/rpc/codes";
import superjson from "superjson";
import { ZodError, typeToFlattenedError } from "zod";

import { retrieveUser } from "@/server/helpers/retrieveUser";
import { prisma } from "@/server/lib/db";
import { LocaleCode, locales } from "@lib/i18n";
import { User } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { TypeOptions } from "react-toastify";
import { OpenApiMeta } from "trpc-openapi";

export type ClientTRPCError = {
  code: TRPC_ERROR_CODE_NUMBER;
  message: string;
  toast?: string | null;
  toastType?: TypeOptions | null;
  data: {
    code: TRPC_ERROR_CODE_KEY;
    httpStatus: number;
    path?: string;
    stack?: string;
    zodError: typeToFlattenedError<any, string> | null;
  };
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

interface CreateContextOptions {
  user: User | null;
  req?: NextApiRequest | null;
  res?: NextApiResponse | null;
  locale: LocaleCode;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use it, you can export
 * it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we don't have to mock Next.js' req/res
 * - tRPC's `createSSGHelpers`, where we don't have req/res
 *
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    user: opts.user,
    req: opts.req,
    res: opts.res,
    locale: opts.locale,
    prisma,
  };
};

/**
 * This is the actual context you will use in your router. It will be used to process every request
 * that goes through your tRPC endpoint.
 *
 * @see https://trpc.io/docs/context
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  const user = await retrieveUser(req);
  const locale: LocaleCode = (req.headers.locale as LocaleCode) || "en";

  // check that locale is really of type LocaleCode dynamically.
  if (!locales.find((l) => l.code === locale)) {
    throw new Error(`Locale ${locale} is not supported.`);
  }

  /*
  const { messages } = await import(`../../locales/${locale}/messages`);
  i18n.load(locale, messages);
  i18n.activate(locale);*/

  return createInnerTRPCContext({
    user,
    req,
    res,
    locale,
  });
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

const t = initTRPC
  .meta<OpenApiMeta>()
  .context<typeof createTRPCContext>()
  .create({
    transformer: superjson,
    errorFormatter: ({ shape, error }): ClientTRPCError => {
      // error = code: str, name, toast
      // shape = code: number, data, message
      // shape.data = code: str, path, stack, httpStatus

      return {
        code: shape.code,
        message: shape.message,
        toast: (error as TRPCError)?.toast,
        toastType: (error as TRPCError)?.toastType,
        data: {
          code: shape.data.code,
          httpStatus: shape.data.httpStatus,
          path: shape.data.path,
          stack: shape.data.stack,
          zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
        },
      };
    },
  });

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure;

/** Reusable middleware that enforces users are logged in before running the procedure. */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      // infers the `user` as non-nullable
      user: ctx.user,
    },
  });
});

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
