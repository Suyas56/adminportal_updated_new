import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getServerSession } from 'next-auth';
import { Readable } from 'stream';

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/drive.file']
});

const drive = google.drive({ version: 'v3', auth });

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get form data from request
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    // Set up file metadata based on type
    const fileMetadata = {
      name: file.name,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
    };

    // Set up media upload
    const media = {
      mimeType: file.type,
      body: stream
    };

    // Upload file to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink'
    });

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: driveResponse.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Get the final response with file details
    const result = {
      id: driveResponse.data.id,
      name: file.name,
      url: driveResponse.data.webViewLink,
      type: file.type,
      uploadedBy: session.user.email
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}

// Helper function to get file extension
function getExtension(filename) {
  return filename.split('.').pop();
}

// Configure size limits
export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '200mb'
  }
}; 