const mongoose = require('mongoose');

const chatAddModel = new mongoose.Schema({
    addedby: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    added: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("chatAddModel", chatAddModel);
