const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const users = [];

app.get("/", (req, res) => {
  res.send("Server is Running!");
});

const addUser = (userName, roomId) => {
  users.push({
    userName: userName,
    roomId: roomId,
  });
};

const userLeave = (userName) => {
  //
  users = users.filter((user) => user.userName !== userName);
};

const getRoomUsers = (roomId) => {
  return users.filter((user) => user.roomID === roomId);
};
// socket
io.on("connection", (socket) => {
  console.log("Someone Connected");
  socket.on("join-room", ({ roomID, userName }) => {
    console.log("User Joined Room");
    console.log(roomID);
    console.log(userName);
    socket.join(roomID);
    addUser(userName, roomID);
    socket.to(roomID).emit("user-connected", userName);

    io.to(roomID).emit("all-users", getRoomUsers(roomID));

    socket.on("diconnect", () => {
      console.log("disconnected");
      socket.leave(roomID);
      userLeave(userName);
      io.to(roomID).emit("all-users", getRoomUsers(roomID));
    });
  });
});

server.listen(port, () => {
  console.log("Running on Port: ", port);
});
