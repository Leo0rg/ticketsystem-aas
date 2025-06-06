import { z } from 'zod';
import { router, publicProcedure, protectedProcedure, adminProcedure } from '../trpc';
import { notifyTicketAuthor } from '../utils/telegram';

export const ticketRouter = router({
  // Получить все заявки (для админов)
  getAll: adminProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.ticket.findMany({
      include: {
        user: true,
        comments: true,
        handler: true,
      },
    });
  }),

  // Получить заявки пользователя
  getUserTickets: protectedProcedure.query(async ({ ctx }) => {
    // ctx.userId гарантированно существует из-за protectedProcedure
    return await ctx.prisma.ticket.findMany({
      where: {
        userId: ctx.userId!,
      },
      include: {
        comments: true,
      },
    });
  }),

  // Получить заявку по ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.ticket.findUnique({
        where: {
          id: input.id,
        },
        include: {
          user: true,
          comments: true,
        },
      });
    }),

  // Создать новую заявку
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(5).max(100),
        description: z.string().min(10),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ticket = await ctx.prisma.ticket.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority || 'MEDIUM',
          userId: ctx.userId!,
        },
      });

      // Отправляем уведомление о создании заявки
      await notifyTicketAuthor(
        ctx.prisma,
        ticket.id,
        `Ваша заявка была успешно создана и ожидает обработки.`
      );

      return ticket;
    }),

  // Обновить статус заявки
  updateStatus: adminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CANCELED']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dataToUpdate: { status: typeof input.status, handlerId?: string | null } = {
        status: input.status,
      };

      // Если заявка взята в работу, назначаем текущего пользователя
      if (input.status === 'IN_PROGRESS') {
        dataToUpdate.handlerId = ctx.userId;
      } else if (input.status === 'PENDING' || input.status === 'RESOLVED' || input.status === 'CANCELED') {
        // Если заявка возвращается в ожидание или закрывается, снимаем обработчика
        dataToUpdate.handlerId = null;
      }
      
      const ticket = await ctx.prisma.ticket.update({
        where: {
          id: input.id,
        },
        data: dataToUpdate,
      });

      // Определяем сообщение в зависимости от статуса
      let statusMessage = "";
      switch (input.status) {
        case "PENDING":
          statusMessage = "Ваша заявка ожидает рассмотрения.";
          break;
        case "IN_PROGRESS":
          const handler = await ctx.prisma.user.findUnique({ where: { id: ctx.userId } });
          statusMessage = `Ваша заявка взята в работу сотрудником ${handler?.name || 'поддержки'}.`;
          break;
        case "RESOLVED":
          statusMessage = "Ваша заявка была успешно решена.";
          break;
        case "CANCELED":
          statusMessage = "Ваша заявка была отменена.";
          break;
      }

      // Отправляем уведомление об изменении статуса
      await notifyTicketAuthor(ctx.prisma, ticket.id, statusMessage);

      return ticket;
    }),

  // Добавить комментарий к заявке
  addComment: protectedProcedure
    .input(
      z.object({
        ticketId: z.string(),
        text: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const comment = await ctx.prisma.comment.create({
        data: {
          text: input.text,
          ticketId: input.ticketId,
        },
      });

      // Получаем информацию о текущем пользователе
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId! },
        select: { name: true, email: true },
      });

      // Отправляем уведомление о новом комментарии
      await notifyTicketAuthor(
        ctx.prisma,
        input.ticketId,
        `К вашей заявке добавлен новый комментарий от ${user?.name || user?.email || "пользователя"}:\n\n"${input.text}"`
      );

      return comment;
    }),
}); 