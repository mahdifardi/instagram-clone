import fs from "fs";
import path from "path";

export const saveImage = async (imageBuffer: Buffer): Promise<string> => {
    // Define the path where the image will be saved
    const uploadsDir =
        process.env.IMG_MSG_PATH || "/src/app/dist/images/messages";
    const fileName = `image_${Date.now()}.png`;
    const filePath = path.join(uploadsDir, fileName);

    // Ensure the 'uploads' directory exists
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir);
    }

    // Save the image as a file in the 'uploads' folder
    await fs.promises.writeFile(filePath, imageBuffer);

    // Return the relative URL to the image
    return fileName;
};
