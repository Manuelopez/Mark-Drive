const mongoose = require('mongoose');

mongoose.connect(
  process.env.MONGODB_URL,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  },
  (err, db) => {
    if (err) {
      console.log('Error could not connect to server');
    } else {
      console.log('connect correctly');
    }
  }
);
