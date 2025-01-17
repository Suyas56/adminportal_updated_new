import { google } from 'googleapis';
import multer from 'multer';
import { getServerSession } from 'next-auth/next'; // Use getSession if you're not on the latest version
import { authorize, getAccessToken } from './authorize';
import stream from 'stream';
import { createRouter } from 'next-connect';
import { authOptions } from '../auth/[...nextauth]'; // Adjust the path based on your file structure

export const config = {
    api: { bodyParser: false },
};

const upload = multer();

const bufferToStream = (buffer) => {
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    return bufferStream;
};

const router = createRouter();

router.post(upload.array('files'), async (req, res) => {
    try {
        const oAuth2Client = await authorize(); // Get the authorized client

        const drive = google.drive({ version: 'v3', auth: oAuth2Client });

        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).send('No files uploaded.');
        }

        const finalResult = [];
        for (const file of files) {
            console.log(file);
            const bufferStream = bufferToStream(file.buffer);
            const requestBody = { name: file.originalname, parents: [process.env.FOLDER_ID] };
            const media = { mimeType: file.mimetype, body: bufferStream };

            try {
                console.log('Uploading file:', file.originalname);
                const result = await drive.files.create({
                    requestBody,
                    media,
                    fields: 'id,name,webViewLink',
                });
                finalResult.push(result.data);
            } catch (uploadError) {
                console.error('Upload error:', uploadError.message);
                if (uploadError.message.includes('Invalid Credentials')) {
                    await getAccessToken();
                }
            }
        }

        if (finalResult.length === 0) {
            console.log("Error in uploading", finalResult);
            return res.status(500).json({ error: 'All uploads failed.' });
        }

        return res.status(200).json(finalResult);

    } catch (error) {
        console.error('Error in authorization or upload:', error);
        return res.status(500).json({ error: 'Authorization or upload failed.' });
    }
});


export default router.handler();
