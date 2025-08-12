import { generateRegistrationOptions } from '@simplewebauthn/server';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    // Generate registration options
    const options = await generateRegistrationOptions({
      rpName: 'Live Blog + Video Grid',
      rpID: process.env.VERCEL_URL ? new URL(process.env.VERCEL_URL).hostname : 'localhost',
      userID: username,
      userName: username,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
        authenticatorAttachment: 'cross-platform',
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Store challenge in session/database (simplified for demo)
    // In production, you'd store this securely
    res.status(200).json(options);
  } catch (error) {
    console.error('Error generating registration options:', error);
    res.status(500).json({ error: 'Failed to generate registration options' });
  }
} 