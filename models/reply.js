const { Schema, model } = require("mongoose");

const replySchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    blogId: {
      type: Schema.Types.ObjectId,
      ref: "blog",
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "comment",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true }
);

const reply = model("reply", replySchema);

module.exports = reply;
