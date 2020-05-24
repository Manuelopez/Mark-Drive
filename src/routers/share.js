const express = require('express');
const Note = require('../models/note');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/share/:id', auth, async (req, res) => {
  try {
    let note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!note) {
      note = await Note.findOne({
        _id: req.params.id,
        'shares.share': req.user.email
      });

      if (!note) {
        return res.status(404).send({ error: 'Not Found' });
      }
    }

    if (req.body.email == req.user.email) {
      return res.send({ error: 'you own the note' });
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
    let note = await Note.findOne({
      _id: req.params.id,
      owner: req.user._id
    });
    if (!note) {
      note = await Note.findOne({
        _id: req.params.id,
        'shares.share': req.user.email
      });

      if (!note) {
        return res.status(404).send({ error: 'Not Found' });
      }
      if (req.user.email != req.body.email) {
        return res.send({ error: 'you dont own it' });
      }
    }

    note.shares = note.shares.filter((share) => {
      return share.share !== req.body.email;
    });
    await note.save();
    res.send({ note });
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
    res.send({ note });
  } catch (error) {
    res.status(500).send({ error: 'server error' });
  }
});

router.get('/share/me', auth, async (req, res) => {
  try {
    const note = await Note.find({ 'shares.share': req.user.email });
    res.send({ note });
  } catch (error) {
    res.status(500).send({ error: 'server error' });
  }
});

module.exports = router;
