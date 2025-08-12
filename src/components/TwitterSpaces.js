import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';

const SpacesContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 50vh;
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  z-index: 900;
  display: flex;
  flex-direction: column;
`;

const SpacesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: var(--color-primary);
  color: white;
  font-family: var(--font-heading);
`;

const SpacesTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
`;

const LiveIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: #ff4444;
  color: white;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  font-size: 0.9rem;
  font-weight: 500;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const VideoContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background);
  position: relative;
`;

const TwitterEmbed = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: var(--border-radius-lg);
  }
`;

const NoStreamMessage = styled.div`
  text-align: center;
  color: var(--color-text);
  font-family: var(--font-body);
  
  h3 {
    margin-bottom: var(--spacing-sm);
    color: var(--color-primary);
  }
  
  p {
    margin-bottom: var(--spacing-md);
    opacity: 0.8;
  }
`;

const StreamControls = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
`;

const ControlButton = styled.button`
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-accent);
    transform: translateY(-1px);
  }
  
  &.danger {
    background: var(--color-accent);
    
    &:hover {
      background: #e74c3c;
    }
  }
`;

const StreamForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
`;

const FormInput = styled.input`
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-body);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const FormTextarea = styled.textarea`
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  font-family: var(--font-body);
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const TwitterSpaces = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentStream, setCurrentStream] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    twitterUrl: '',
    streamKey: ''
  });

  const loadCurrentStream = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('twitter_streams')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading stream:', error);
        return;
      }

      if (data) {
        setCurrentStream(data);
        setIsLive(data.is_live);
      }
    } catch (error) {
      console.error('Error loading stream:', error);
    }
  }, [user.id]);

  useEffect(() => {
    if (isAuthenticated) {
      loadCurrentStream();
    }
  }, [isAuthenticated, loadCurrentStream]);

  const startStream = async (e) => {
    e.preventDefault();
    
    try {
      const streamData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        twitter_url: formData.twitterUrl,
        stream_key: formData.streamKey,
        is_active: true,
        is_live: true,
        started_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('twitter_streams')
        .insert([streamData])
        .select()
        .single();

      if (error) throw error;

      setCurrentStream(data);
      setIsLive(true);
      setShowForm(false);
      setFormData({ title: '', description: '', twitterUrl: '', streamKey: '' });
      
      // Update the stream status
      await updateStreamStatus(data.id, true);
      
    } catch (error) {
      console.error('Error starting stream:', error);
    }
  };

  const stopStream = async () => {
    if (!currentStream) return;

    try {
      const { error } = await supabase
        .from('twitter_streams')
        .update({
          is_live: false,
          ended_at: new Date().toISOString()
        })
        .eq('id', currentStream.id);

      if (error) throw error;

      setIsLive(false);
      setCurrentStream(prev => prev ? { ...prev, is_live: false } : null);
      
    } catch (error) {
      console.error('Error stopping stream:', error);
    }
  };

  const updateStreamStatus = async (streamId, isLive) => {
    try {
      const { error } = await supabase
        .from('twitter_streams')
        .update({ is_live: isLive })
        .eq('id', streamId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating stream status:', error);
    }
  };

  const handleFormChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SpacesContainer
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <SpacesHeader>
        <SpacesTitle>
          {isLive ? '🔴 Live Stream' : 'Twitter Spaces'}
        </SpacesTitle>
        {isLive && <LiveIndicator>LIVE</LiveIndicator>}
      </SpacesHeader>

      <VideoContainer>
        {currentStream && isLive ? (
          <TwitterEmbed>
            {currentStream.twitter_url ? (
              <iframe
                src={currentStream.twitter_url}
                title={currentStream.title}
                allowFullScreen
              />
            ) : (
              <div>
                <h3>Stream Active</h3>
                <p>Use your OBS stream key: {currentStream.stream_key}</p>
                <StreamControls>
                  <ControlButton onClick={stopStream} className="danger">
                    Stop Stream
                  </ControlButton>
                </StreamControls>
              </div>
            )}
          </TwitterEmbed>
        ) : (
          <NoStreamMessage>
            <h3>No Active Stream</h3>
            <p>Start a new Twitter Spaces stream to begin broadcasting</p>
            
            {!showForm ? (
              <ControlButton onClick={() => setShowForm(true)}>
                Start New Stream
              </ControlButton>
            ) : (
              <StreamForm onSubmit={startStream}>
                <FormInput
                  name="title"
                  placeholder="Stream Title"
                  value={formData.title}
                  onChange={handleFormChange}
                  required
                />
                <FormTextarea
                  name="description"
                  placeholder="Stream Description"
                  value={formData.description}
                  onChange={handleFormChange}
                  required
                />
                <FormInput
                  name="twitterUrl"
                  placeholder="Twitter Spaces URL (optional)"
                  value={formData.twitterUrl}
                  onChange={handleFormChange}
                />
                <FormInput
                  name="streamKey"
                  placeholder="OBS Stream Key"
                  value={formData.streamKey}
                  onChange={handleFormChange}
                  required
                />
                <StreamControls>
                  <ControlButton type="submit">
                    Start Stream
                  </ControlButton>
                  <ControlButton 
                    type="button" 
                    onClick={() => setShowForm(false)}
                    className="danger"
                  >
                    Cancel
                  </ControlButton>
                </StreamControls>
              </StreamForm>
            )}
          </NoStreamMessage>
        )}
      </VideoContainer>
    </SpacesContainer>
  );
};

export default TwitterSpaces; 