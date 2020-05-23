const express = require('express');
const auth = require('../middleware/auth');
const Note = require('../models/note');
const router = express.Router();

router.post('/notes', auth, async (req, res) => {
	const note = new Note({
		...req.body,
		owner: req.user._id
	});
	try {
		await note.save();
		res.status(201).send({ note });
	} catch (error) {
		res.status(400).send({ error });
	}
});

// GET /notes?title=name
router.get('/notes', auth, async (req, res) => {
	const match = {};
	const sort = {};
	if (req.query.title) {
		match.title = req.query.title;
	}

	if (req.query.sortBy) {
		const part = req.query.sortBy.split('_');
		sort[part[0]] = part[1] === 'desc' ? -1 : 1;
	}

	try {
		// const note = await Note.find({})
		await req.user
			.populate({
				path: 'notes',
				match,
				options: {
					limit: parseInt(req.query.limit),
					skip: parseInt(req.query.skip),
					sort
				}
			})
			.execPopulate();
		res.send({ note: req.user.notes });
	} catch (error) {
		res.status(500).send({ error });
	}
});

router.get('/notes/:id', auth, async (req, res) => {
	const _id = req.params.id;
	try {
		const note = await Note.findOne({ _id, owner: req.user._id });
		if (!note) {
			return res.status(404).send({ error: 'Not Found' });
		}
		res.send({ note });
	} catch (error) {
		res.status(500).send({ error });
	}
});

router.patch('/notes/:id', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['title', 'body'];
	const isValidOperation = updates.every((update) => {
		return allowedUpdates.includes(update);
	});

	if (!isValidOperation) {
		return res.status(400).send({ error: 'invalid operation' });
	}

	try {
		const note = await Note.findOne({
			_id: req.params.id,
			owner: req.user._id
		});

		if (!note) {
			return res.status(404).send({ error: 'Not Found' });
		}

		updates.forEach((update) => {
			note[update] = req.body[update];
		});

		await note.save();
		res.send({ note });
	} catch (error) {
		res.status(500).send({ error });
	}
});

router.delete('/notes/:id', auth, async (req, res) => {
	try {
		// const note = await Note.findByIdAndDelete(req.params.id)

		const note = await Note.findOneAndDelete({
			_id: req.params.id,
			owner: req.user._id
		});

		if (!note) {
			return res.status(404).send({ error: 'Not Found' });
		}

		res.send({ note });
	} catch (error) {
		res.status(500).send({ error });
	}
});

module.exports = router;
