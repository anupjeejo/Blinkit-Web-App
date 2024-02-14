const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
{
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    },
    token: {
        type: String,
    },
    documents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "document",
        }
    ],
},
{ 
    timestamps: true 
}
)

module.exports = mongoose.model("user", UserSchema)