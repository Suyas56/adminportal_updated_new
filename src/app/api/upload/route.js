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

    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    
    // Upload to Google Drive
    const driveResponse = await drive.files.create({
      requestBody: {
        name: file.name,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      },
      media: {
        mimeType: file.type,
        body: Readable.from(Buffer.from(buffer))
      },
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

    return NextResponse.json({
      success: true,
      url: driveResponse.data.webViewLink,
      id: driveResponse.data.id
    });

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
    bodyParser: false
  }
}; 