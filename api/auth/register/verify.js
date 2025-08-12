import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, response } = req.body;

    if (!username || !response) {
      return res.status(400).json({ error: 'Username and response are required' });
    }

    // Verify the registration response
    const verification = await verifyRegistrationResponse({
      response,
      expectedOrigin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
      expectedRPID: process.env.VERCEL_URL ? new URL(process.env.VERCEL_URL).hostname : 'localhost',
    });

    if (verification.verified) {
      // Create Supabase user
      const { data, error } = await supabase.auth.signUp({
        email: `${username}@passkey.local`,
        password: crypto.randomUUID(), // Random password for passkey auth
        options: {
          data: {
            username,
            passkey_registered: true,
            passkey_credential_id: verification.registrationInfo.credentialID,
            passkey_public_key: verification.registrationInfo.credentialPublicKey,
          }
        }
      });

      if (error) throw error;

      return res.status(200).json({ 
        verified: true, 
        user: data.user,
        message: 'Passkey registration successful'
      });
    } else {
      return res.status(400).json({ 
        verified: false, 
        error: 'Passkey verification failed' 
      });
    }
  } catch (error) {
    console.error('Error verifying registration:', error);
    res.status(500).json({ error: 'Failed to verify registration' });
  }
} 