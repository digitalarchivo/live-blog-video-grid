import React, { useState } from 'react';
import { supabase } from '../config/supabase';
import styled from 'styled-components';

const TestContainer = styled.div`
  padding: 20px;
  background: #f0f0f0;
  border-radius: 8px;
  margin: 20px;
  font-family: monospace;
`;

const TestButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  margin: 5px;
  
  &:hover {
    background: #0056b3;
  }
`;

const Status = styled.div`
  margin: 10px 0;
  padding: 10px;
  border-radius: 4px;
  
  &.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  }
`;

const SupabaseTest = () => {
  const [status, setStatus] = useState('Not tested');
  const [error, setError] = useState(null);
  const [userCount, setUserCount] = useState(0);

  const testConnection = async () => {
    try {
      setStatus('Testing connection...');
      setError(null);
      
      // Test basic connection
      const { error: connError } = await supabase
        .from('themes')
        .select('count')
        .limit(1);
      
      if (connError) {
        throw connError;
      }
      
      setStatus('✅ Connection successful!');
      
      // Test table access
      const { count, error: countError } = await supabase
        .from('themes')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        throw countError;
      }
      
      setUserCount(count || 0);
      
    } catch (err) {
      setStatus('❌ Connection failed');
      setError(err.message);
      console.error('Supabase test error:', err);
    }
  };

  const testAuth = async () => {
    try {
      setStatus('Testing authentication...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (session) {
        setStatus(`✅ Authenticated as: ${session.user.email}`);
      } else {
        setStatus('ℹ️ No active session (this is normal)');
      }
      
    } catch (err) {
      setStatus('❌ Auth test failed');
      setError(err.message);
    }
  };

  const resetTest = () => {
    setStatus('Not tested');
    setError(null);
    setUserCount(0);
  };

  return (
    <TestContainer>
      <h3>🔍 Supabase Connection Test</h3>
      
      <div>
        <TestButton onClick={testConnection}>Test Database Connection</TestButton>
        <TestButton onClick={testAuth}>Test Authentication</TestButton>
        <TestButton onClick={resetTest}>Reset Test</TestButton>
      </div>
      
      <Status className={status.includes('✅') ? 'success' : status.includes('❌') ? 'error' : ''}>
        <strong>Status:</strong> {status}
      </Status>
      
      {userCount > 0 && (
        <Status className="success">
          <strong>Database Tables:</strong> Accessible ({userCount} themes found)
        </Status>
      )}
      
      {error && (
        <Status className="error">
          <strong>Error:</strong> {error}
        </Status>
      )}
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <strong>Current Config:</strong><br/>
        URL: {process.env.REACT_APP_SUPABASE_URL || 'Not set'}<br/>
        Key: {process.env.REACT_APP_SUPABASE_ANON_KEY ? 'Set ✓' : 'Not set ✗'}
      </div>
    </TestContainer>
  );
};

export default SupabaseTest; 