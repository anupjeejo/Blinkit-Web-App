const mongoose = require("mongoose")

const DocumentSchema = new mongoose.Schema({
    docName: {
        type: String,
        trim: true,
        required: true,
    },
    public_id: {
        type: String,
        required: true,
    },
    docLink: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("document", DocumentSchema)