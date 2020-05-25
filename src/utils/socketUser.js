const users = [];

const addUser = ({ id, username, room }) => {
  if (!username || !room) {
    return { error: 'Username and room is required' };
  }

  const exsitingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (exsitingUser) {
    return { error: 'User already exsists' };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  const userFound = users.find((user) => {
    return user.id === id;
  });
  return userFound;
};

const getUsersInRoom = (room) => {
  const usersInRoom = users.filter((user) => {
    return user.room === room;
  });
  return usersInRoom;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
