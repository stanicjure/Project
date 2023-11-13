const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  roles: {
    User: {
      type: Number,
      default: 2001,
    },
    Editor: Number,
    Admin: Number,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: [String],
  apartments: [
    {
      label: String,
      reservations: [
        {
          guestName: String,
          price: Number,
          persons: Number,
          children: Number,
          start: Date,
          end: Date,
          additionalInfo: String,
          advancePay: Number,
          payed: Boolean,
        },
      ],
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
