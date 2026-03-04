// api/verify-student.js
import multer from 'multer';
import { createReadStream } from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

// Disable Next.js bodyParser for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Helper function to run middleware
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// api/verify-student.js
export default async function handler(req, res) {
  // 1. Essential: Set CORS headers so your frontend can talk to this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Handle the preflight OPTIONS request (browsers send this automatically)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Ensure it's a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 4. Your main logic goes here. Let's start with a simple success response
    //    to confirm the function works at its most basic level.
    console.log("API function started successfully!");
    
    // You can log the body to see what's being sent from your form
    console.log("Request body:", req.body);

    // Respond with success
    return res.status(200).json({
      success: true,
      message: "API function is working!",
      dataReceived: req.body
    });

  } catch (error) {
    // 5. Catch any errors and log them (they will appear in Vercel logs)
    console.error("Error in API function:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "An internal server error occurred."
    });
  }
}