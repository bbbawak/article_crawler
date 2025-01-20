import { NotificationType, PostCategory } from "@prisma/client";
import { Server } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { corsOptions } from "../app";
import prisma from "../shared/prisma";

// Declare a variable to hold io and sendNotification
let sendNotification: Function | null = null;

export function socketIo(server: Server) {
  const io = new SocketIOServer(server, {
    cors: corsOptions,
  });

  // Define sendNotification function
  sendNotification = async (
    recipientId: string,
    senderId: string,
    message: string,
    type: NotificationType,
    postId?: string,
    category?: PostCategory
  ) => {
    try {
      // Save the notification to the database
      const notification = await prisma.notification.create({
        data: {
          userId: recipientId,
          senderId,
          message,
          type,
          isRead: false,
          postId,
          category,
        },
      });

      // Emit the notification to the recipient if they're connected
      io.to(recipientId).emit("receiveNotification", notification);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Handle new connections to the Socket.io server
  io.on("connection", (socket: Socket) => {
    // Allow users to join their own private room based on their user ID
    socket.on("joinUserRoom", (userId) => {
      socket.join(userId);
    });

    // Handle user disconnection
    socket.on("disconnect", () => {});
  });

  return { io };
}

export { sendNotification };
