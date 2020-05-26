const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      requred: true,
      trim: true
    },

    body: {
      type: String,
      default: ''
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      requred: true,
      ref: 'User'
    },
    nType: {
      type: String,
      default: 'note'
    },
    shares: [
      {
        share: {
          type: String
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
