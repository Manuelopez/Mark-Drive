const express = require('express');
const Note = require('../models/note');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/share/:id', auth, async (req, res) => {
	try {
		const note = await Note.findOne({
			_id: req.params.id,
			owner: req.user._id
		});
		if (!note) {
			return res.status(404).send({ error: 'Not found' });
		}

		const user = await User.findOne({ email: req.body.email });
		if (!user) {
			return res.status(404).send({ error: 'Not found' });
		}

		const exists = note.shares.find((share) => {
			return share.share == user.email;
		});
		if (exists) {
			return res.status(400).send({ error: 'Duplicate user' });
		}

		note.shares = note.shares.concat({ share: user.email });
		await note.save();
		res.send({ note });
	} catch (error) {
		res.status(500).send({ error: 'Sever error' });
	}
});

router.post('/share/remove/:id', auth, async (req, res) => {
	try {
		const note = await Note.findOne({
			_id: req.params.id,
			owner: req.user._id
		});
		if (!note) {
			return res.status(404).send({ error: 'not found' });
		}

		note.shares = note.shares.filter((share) => {
			share.share !== req.body.email;
		});
		await note.save();
		res.send({ Success: 'user removed' });
	} catch (error) {
		res.status(500).send({ error: 'server error' });
	}
});

router.post('/share/removeAll/:id', auth, async (req, res) => {
	try {
		const note = await Note.findOne({
			_id: req.params.id,
			owner: req.user._id
		});
		if (!note) {
			return res.status(404).send({ error: 'Not found' });
		}

		note.shares = [];
		await note.save();
		res.send({ Success: 'users removed' });
	} catch (error) {
		res.status.send({ error: 'server error' });
	}
});

router.get('/share/me', auth, async (req, res) => {
	try {
		const notes = await Note.find({ 'shares.share': req.user.email });
		res.send({ notes });
	} catch (error) {
		res.status(500).send({ error: 'server error' });
	}
});

module.exports = router;