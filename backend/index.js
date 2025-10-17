import express from "express";
import cors from "cors";
import { connecttodb } from "./models/model.js";
import userrouter from "./routes/routes.js";
import http from "http";
import { Server } from "socket.io";

//create http server
const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://quick-chat-lemon.vercel.app"
  ],
  credentials: true,
}));


//initialize socket.io
export const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://quick-chat-lemon.vercel.app"
    ],
    credentials: true,
  },
});


const onlineusers = {};

io.on("connection", (socket) => {
  socket.on("setup", (data) => {
    socket.join(data._id);
    socket.emit("connected");

    onlineusers[data._id] = socket.id;

    io.emit("useronline", onlineusers);

    socket.on("disconnect", () => {
      delete onlineusers[data._id];
      io.emit("useronline", onlineusers);
    });
  });

  socket.on("send message", (newMessage) => {
    const receiverId = newMessage.receiverId;
    if (!receiverId) return;
    io.to(receiverId).emit("new message", newMessage);
    io.to(receiverId).emit("new notification",newMessage)
  });

  socket.on("typing", ({ room }) => socket.in(room).emit("typing", room));
  socket.on("stop typing", ({ room }) =>
    socket.in(room).emit("stop typing", room)
  );
});

app.use(express.json());

connecttodb();

app.use("/", userrouter);

app.use((req, res, next) => {
  res.status(404).json({ message: `cant find ${req.originalUrl}` });
});
server.listen(process.env.PORT, () => {console.log(`✅ Server running on port ${process.env.PORT}`);});
