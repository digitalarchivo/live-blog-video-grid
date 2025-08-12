import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styled from 'styled-components';

const AuthContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  max-width: 400px;
  margin: 0 auto;
`;

const AuthForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid var(--color-border, #e1e5e9);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--color-background, #ffffff);
  color: var(--color-text, #333333);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary, #007bff);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-primary, #007bff);
  color: white;
  
  &:hover {
    background: var(--color-primary-dark, #0056b3);
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: var(--color-muted, #6c757d);
    cursor: not-allowed;
    transform: none;
  }
`;

const Instructions = styled.div`
  background: var(--color-info-bg, #e7f3ff);
  border: 1px solid var(--color-info-border, #b3d9ff);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-size: 0.9rem;
  color: var(--color-info-text, #004085);
`;

const ErrorMessage = styled.div`
  background: var(--color-error-bg, #f8d7da);
  border: 1px solid var(--color-error-border, #f5c6cb);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: var(--color-error-text, #721c24);
`;

const SuccessMessage = styled.div`
  background: var(--color-success-bg, #d4edda);
  border: 1px solid var(--color-success-border, #c3e6cb);
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  color: var(--color-success-text, #155724);
`;

const AuthButton = () => {
  const { signUp, signIn, isAuthenticated, user, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !username.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setIsRegistering(true);
    setError('');
    setSuccess('');

    try {
      await signUp(email, password, username);
      setSuccess('Account created successfully! Check your email to confirm.');
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (error) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setIsSigningIn(true);
    setError('');
    setSuccess('');

    try {
      await signIn(email, password);
      setSuccess('Signed in successfully!');
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.message || 'Sign in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  if (isAuthenticated && user) {
    return (
      <AuthContainer>
        <SuccessMessage>
          ✅ Welcome back, {user.user_metadata?.username || 'User'}!
        </SuccessMessage>
        <Button onClick={signOut}>
          Sign Out
        </Button>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <h2>🔐 Simple Authentication</h2>
      
      <Instructions>
        <strong>Quick and simple:</strong>
        <br />• <strong>Sign Up:</strong> Create account with email/password
        <br />• <strong>Sign In:</strong> Use existing credentials
        <br />• <strong>No complex setup</strong> - just works!
      </Instructions>

      <AuthForm onSubmit={handleSignUp}>
        <Input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isRegistering || isSigningIn}
        />
        
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isRegistering || isSigningIn}
        />
        
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isRegistering || isSigningIn}
        />
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            type="submit" 
            disabled={isRegistering || isSigningIn}
            style={{ flex: 1 }}
          >
            {isRegistering ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <Button 
            type="button" 
            onClick={handleSignIn}
            disabled={isRegistering || isSigningIn}
            style={{ flex: 1, background: 'var(--color-secondary, #6c757d)' }}
          >
            {isSigningIn ? 'Signing In...' : 'Sign In'}
          </Button>
        </div>
      </AuthForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </AuthContainer>
  );
};

export default AuthButton; 