const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const noteRouter = require('./routers/note');
const shareRouter = require('./routers/share');
const path = require('path');
const socketio = require('socket.io');
const http = require('http');
const {
  addUser,
  getUser,
  removeUser,
  getUsersInRoom
} = require('./utils/socketUser');

//server
const port = process.env.PORT;
const app = express();
const publicPath = path.join(__dirname, '../public');

const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicPath));
app.use(express.json());
app.use(userRouter);
app.use(noteRouter);
app.use(shareRouter);

io.on('connection', (socket) => {
  socket.on('join', ({ username, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    const firstUser = getUsersInRoom(room)[0];
    io.to(firstUser.id).emit('getData', 'new incoming User');
    io.to(user.room).emit('roomData', { users: getUsersInRoom(user.room) });
    callback();
  });

  socket.on('recentData', (data, room) => {
    const users = getUsersInRoom(room);

    io.to(users[users.length - 1].id).emit('contentData', {
      editorData: data
    });
  });

  socket.on('editorValue', (data) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('contentData', {
      editorData: data
    });
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('roomData', { users: getUsersInRoom(user.room) });
    }
  });
});

server.listen(port, () => {
  console.log(`server is up on port ${port}`);
});
