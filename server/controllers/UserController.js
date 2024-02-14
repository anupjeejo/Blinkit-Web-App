const { uploadFileToCloudinary, deleteFileFromCloudinary } = require("../config/cloudinary");
const User = require("../models/User");
const Document = require("../models/Document");
const { isFileTypeSupported } =  require("../utils/utils");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// Sigup controller for onboarding new users
exports.signup = async (req, res) => {
    try {
        // Get basic details of user
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = req.body

        // Check if all details are there or not
        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return res.status(403).send({
                success: false,
                message: "All Fields are required",
            })
        }

        // Check password and confirm password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message:
                "Password and Confirm Password do not match. Please try again.",
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email })
        if(existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists. Please sign in to continue.",
            })
        }

        // Hashing password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Creating user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
        })

        return res.status(200).json({
            success: true,
            user,
            message: "User registered successfully",
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "User cannot be registered. Please try again.",
        })
    }
}

// Login controller for authenticating users
exports.login = async (req, res) => {
    try {
        // Get email and password from request body
        const { email, password } = req.body

        // Check if email or password is missing
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: `Please fill up all the required details`,
            })
        }

        // Find user with provided email
        const user = await User.findOne({ email })

        // If user not found with provided email
        if (!user) {
            return res.status(401).json({
                success: false,
                message: `User is not registered, please SignUp to Continue`,
            })
        }

        // Compare Password and generate JWT token
        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                {
                    email: user.email,
                    id: user._id, 
                    role: user.role
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h",
                }
            )

            // Save token to user document in database
            user.token = token
            user.password = undefined

            // Set cookie for token and return success response
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true,
            }

            return res.cookie("token", token, options).
                status(200).json({
                success: true,
                token,
                user,
                message: `User Login Success`,
            })
        }

        return res.status(401).json({
            success: false,
            message: `Password is incorrect`,
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            success: false,
            message: `Login Failure Please Try Again`,
        })
    }
}

// userImageUpload Controller for image upload
exports.userImageUpload = async (req, res) => {
    try {
        // Get details related to user and image to be uploaded
        const { userId } = req.body;
        const imageName = `frame_${Date.now()}.jpg`;
        const file = req.files.imageFile;
        const fileType = file.name.split('.')[1].toLowerCase();

        // Check if the file type is supported
        if(!isFileTypeSupported( fileType)){
            return res.status(400).json({
                success: false,
                message: "File format is not supported",
            })
        }

        // Upload image to Cloud
        const uploadedDoc = await uploadFileToCloudinary(file, "Blinkit-Web-App");

        // Create new Document for the uploaded image
        const newDoc = await Document.create({
            docName: imageName,
            public_id: uploadedDoc.public_id,
            docLink: uploadedDoc.secure_url,
        })
        
        // Insert the document reference to User
        const updatedUser  = await User.findByIdAndUpdate(
            userId,
            { 
                $push: { 
                    documents: newDoc._id 
                } 
            },
            { 
                new: true 
            }
        );

        // Document/Image upload failure
        if(!updatedUser){
            return res.status(400).json({
                success: false,
                message: "Image Upload unsuccessful",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Image Upload Successful",
            imageUrl: uploadedDoc.secure_url,
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        })
    }
}

// deleteUserImage Controller to delete uploaded image and its reference from user
exports.deleteUserImage = async(req, res) => {
    try {
        // Get details related to user and image to be deleted
        const { userId, documentId } = req.body;

        // Delete document from database
        const deletedDoc = await Document.findByIdAndDelete(
            {
                _id : documentId
            }
        );

        // Document not found in DB i.e it is already deleted
        if(!deletedDoc){
            return res.status(400).json({
                success: false,
                message: "Image not found or already deleted",
            })
        }

        // Delete document from cloudinary based on public ID of document
        const public_id = deletedDoc.public_id
        const response = await deleteFileFromCloudinary(public_id);

        // Document not found on cloud
        if(response?.result != 'ok') {
            return res.status(400).json({
                success: false,
                message: "Image not deleted from cloudinary",
            })
        }
        
        // Update user to remove reference of deleted document
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { 
                $pull: { 
                    documents: documentId 
                }
            },
            {
                new: true 
            }
        );

        // Document/Image deletion failure
        if(!updatedUser){
            return res.status(400).json({
                success: false,
                message: "Image deletion unsuccessful",
            })
        }

        return res.status(200).json({
            success: true,
            message: "Image deleted successful",
        })
    } catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Something went wrong",
        })
    }
}