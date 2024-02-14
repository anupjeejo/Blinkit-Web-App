const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const database = require("./config/DBConnect");
const cloudinary = require("./config/cloudinary");
const app = express();
const PORT = process.env.PORT || 5000;

// loading env file
dotenv.config();

// connecting to mongoDB
database.connect();

// connecting to cloud storage
cloudinary.cloudinaryConnect();

// loading json parser
app.use(express.json());

// loading cors
app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

// creating temporary file storage space
const fileUpload = require("express-fileupload");
app.use(fileUpload({    
    useTempFiles: true,
    tempFileDir: '/temp/',
}));

// setting up PORT for listening to request
app.listen(PORT, () => {
    console.log(`App is listening at ${PORT}`);
});

// default testing route
app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Your server is up and running ...",
    });
});

// routes to handle user requests
const userRouter = require("./routes/UserRoutes");
app.use('/api/v1/user', userRouter);