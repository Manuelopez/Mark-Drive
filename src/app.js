const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const noteRouter = require('./routers/note');
const shareRouter = require('./routers/share');
const path = require('path');

const port = process.env.PORT;
const app = express();
const publicPath = path.join(__dirname, '../public');

app.use(express.static(publicPath));
app.use(express.json());
app.use(userRouter);
app.use(noteRouter);
app.use(shareRouter);

app.listen(port, () => {
	console.log(`server is up on port ${port}`);
});
