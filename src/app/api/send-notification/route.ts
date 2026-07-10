import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  try {
    // We look for the JSON file in the project root
    const serviceAccountPath = path.join(process.cwd(), 'aspira-8e3be-firebase-adminsdk-fbsvc-8d9503230c.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log("Firebase Admin initialized successfully.");
    } else {
      console.error("Service account JSON not found at", serviceAccountPath);
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { topic, title, message } = body;

    if (!topic || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields (topic, title, message)' },
        { status: 400 }
      );
    }

    if (!admin.apps.length) {
       return NextResponse.json(
        { error: 'Firebase Admin not initialized properly' },
        { status: 500 }
      );
    }

    const payload = {
      topic: topic,
      notification: {
        title: title,
        body: message,
      },
      android: {
        priority: 'high' as const,
        notification: {
          channelId: 'aspira_notif', // Matches Android channel ID
          sound: 'default',
        }
      }
    };

    const response = await admin.messaging().send(payload);
    
    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
