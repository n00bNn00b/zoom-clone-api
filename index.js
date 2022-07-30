const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const cors = require("cors");

const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

let users = [];

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
  socket.on("join-room", ({ userName, roomId }) => {
    console.log("User Joined Room");
    console.log(userName);
    console.log(roomId);
    if (roomId && userName) {
      socket.join(roomId);
      addUser(userName, roomId);
      socket.to(roomId).emit("user-connected", userName);

      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    }

    socket.on("diconnect", () => {
      console.log("disconnected");
      socket.leave(roomId);
      userLeave(userName);
      io.to(roomId).emit("all-users", getRoomUsers(roomId));
    });
  });
});

server.listen(port, () => {
  console.log("Running on Port: ", port);
});
