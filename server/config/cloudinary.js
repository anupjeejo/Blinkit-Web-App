const cloudinary = require("cloudinary").v2;

require("dotenv").config();

exports.cloudinaryConnect = () => {
    try {
        cloudinary.config({
            cloud_name: process.env.CLOUD_NAME,
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
        })
    } catch (error) {
        console.log(error);
    }
}

exports.uploadFileToCloudinary = (file, folder, quality) => {
    try {
        const options = { folder };

        if(quality){
            options.quality = quality;
        }

        options.resource_type = "auto";
        return cloudinary.uploader.upload(file.tempFilePath, options);
    } catch (error) {
        console.log(error);
    }
}

exports.deleteFileFromCloudinary = (public_id) => {
    try {
        return cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log(error);
    }
}