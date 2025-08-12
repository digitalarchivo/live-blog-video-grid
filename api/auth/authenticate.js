import { generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Generate authentication options
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({ error: 'Username is required' });
      }

      // Get user's passkey credentials from Supabase
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: `${username}@passkey.local`,
        password: 'temp-password' // This will be replaced by passkey verification
      });

      if (error) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Generate authentication options
      const options = await generateAuthenticationOptions({
        rpID: process.env.VERCEL_URL ? new URL(process.env.VERCEL_URL).hostname : 'localhost',
        allowCredentials: [{
          id: user.user_metadata.passkey_credential_id,
          type: 'public-key',
        }],
        userVerification: 'required',
      });

      res.status(200).json(options);
    } catch (error) {
      console.error('Error generating authentication options:', error);
      res.status(500).json({ error: 'Failed to generate authentication options' });
    }
  } else if (req.method === 'PUT') {
    // Verify authentication response
    try {
      const { username, response } = req.body;

      if (!username || !response) {
        return res.status(400).json({ error: 'Username and response are required' });
      }

      // Verify the authentication response
      const verification = await verifyAuthenticationResponse({
        response,
        expectedOrigin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
        expectedRPID: process.env.VERCEL_URL ? new URL(process.env.VERCEL_URL).hostname : 'localhost',
        authenticator: {
          credentialID: response.id,
          credentialPublicKey: response.publicKey,
          counter: response.counter,
        },
      });

      if (verification.verified) {
        // Sign in the user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${username}@passkey.local`,
          password: 'temp-password'
        });

        if (error) throw error;

        return res.status(200).json({ 
          verified: true, 
          user: data.user,
          message: 'Authentication successful'
        });
      } else {
        return res.status(400).json({ 
          verified: false, 
          error: 'Authentication verification failed' 
        });
      }
    } catch (error) {
      console.error('Error verifying authentication:', error);
      res.status(500).json({ error: 'Failed to verify authentication' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 