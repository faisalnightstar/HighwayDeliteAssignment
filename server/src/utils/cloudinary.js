import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Return null if no file path is provided

        // Upload an fie to Cloudinary
        const uploadResult = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: "auto", // The type of file. 'auto' will automatically detect the type of file
                crop: "auto",
                gravity: "auto",
                width: 500,
                height: 500,
            })
            .catch((error) => {
                console.log("uploadResult error in utils/cloudinary", error);
            });

        //console.log(`Files is uploaded successfully: ${uploadResult.url}`);
        fs.unlinkSync(localFilePath); //Delete the locally saved file if it successfully uploaded
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the locally saved file if it fails to upload
        return null;
    }
};

const tripUploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null; // Return null if no file path is provided

        // Upload an fie to Cloudinary
        const uploadResult = await cloudinary.uploader
            .upload(localFilePath, {
                resource_type: "auto", // The type of file. 'auto' will automatically detect the type of file
                crop: "auto",
                gravity: "auto",
                width: 1280,
                height: 720,
            })
            .catch((error) => {
                console.log("uploadResult error in cloudinary utils", error);
            });

        //console.log(`Files is uploaded successfully: ${uploadResult.url}`);
        fs.unlinkSync(localFilePath); //Delete the locally saved file if it successfully uploaded
        return uploadResult;
    } catch (error) {
        fs.unlinkSync(localFilePath); // Delete the locally saved file if it fails to upload
        return null;
    }
};

/**
 * Deletes an asset from Cloudinary given its public ID.
 * @param {string} publicId - The public ID of the asset.
 */
const deleteOnCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error("Error deleting file from Cloudinary:", error);
        throw error;
    }
};

/**
 * Extracts the public ID from a Cloudinary URL.
 * Example URL:
 *   https://res.cloudinary.com/yourcloudname/image/upload/v123456789/userAvatars/filename.jpg
 * This function removes the version (v123456789) and the file extension.
 * @param {string} url - The Cloudinary URL.
 * @returns {string|null} - The public ID, e.g. "userAvatars/filename"
 */
const extractPublicId = (url) => {
    if (!url) return null;
    // Remove any query parameters
    const cleanUrl = url.split("?")[0];
    const parts = cleanUrl.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1) return null;
    // The segments after "upload" might include a version (e.g., v123456789)
    const segmentsAfterUpload = parts.slice(uploadIndex + 1);
    // If the first segment starts with "v", remove it
    if (segmentsAfterUpload[0].startsWith("v")) {
        segmentsAfterUpload.shift();
    }
    // Rejoin and remove file extension from the last segment
    const publicIdWithExt = segmentsAfterUpload.join("/");
    const dotIndex = publicIdWithExt.lastIndexOf(".");
    const publicId =
        dotIndex !== -1
            ? publicIdWithExt.substring(0, dotIndex)
            : publicIdWithExt;
    return publicId;
};

export {
    uploadOnCloudinary,
    tripUploadOnCloudinary,
    deleteOnCloudinary,
    extractPublicId,
};
