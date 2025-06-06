import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { ticketRouter } from "./routers/ticket";

export const appRouter = router({
  user: userRouter,
  ticket: ticketRouter,
});

export type AppRouter = typeof appRouter; 