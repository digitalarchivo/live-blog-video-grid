import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

const VideoContainer = styled.div`
  background: var(--color-surface);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg) 0;
  border: 2px solid var(--color-border);
  box-shadow: var(--shadow-md);
`;

const VideoTitle = styled.h3`
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-md) 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const VideoForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--color-text);
  font-size: var(--font-size-sm);
`;

const Input = styled.input`
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  transition: all var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    border-color: var(--color-primary);
  }
`;

const TextArea = styled.textarea`
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  font-family: var(--font-body);
  resize: vertical;
  min-height: 80px;
  transition: all var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:hover {
    border-color: var(--color-primary);
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  &.secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border: 2px solid var(--color-border);
    
    &:hover {
      border-color: var(--color-primary);
      background: rgba(59, 130, 246, 0.05);
    }
  }
`;

const VideoList = styled.div`
  display: grid;
  gap: var(--spacing-md);
`;

const VideoCard = styled.div`
  background: var(--color-background);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
  }
`;

const VideoCardTitle = styled.h4`
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: var(--font-size-base);
`;

const VideoCardDescription = styled.p`
  margin: 0 0 var(--spacing-sm) 0;
  color: var(--color-text);
  font-size: var(--font-size-sm);
  line-height: 1.5;
`;

const VideoLink = styled.a`
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;
  
  &:hover {
    text-decoration: underline;
  }
`;

const VideoMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text);
  opacity: 0.7;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const EmptyState = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-text);
  opacity: 0.7;
`;

const TwitterSpaces = () => {
  const { user, isAuthenticated } = useAuth();
  const [videos, setVideos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadVideos();
    }
  }, [isAuthenticated]);

  const loadVideos = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.videoUrl.trim()) {
      alert('Please fill in the title and video URL');
      return;
    }
    
    try {
      setLoading(true);
      const videoData = {
        user_id: user?.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        video_url: formData.videoUrl.trim(),
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('videos')
        .insert([videoData])
        .select()
        .single();

      if (error) throw error;

      setVideos(prev => [data, ...prev]);
      setFormData({ title: '', description: '', videoUrl: '' });
      setShowForm(false);
      
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Error adding video. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const deleteVideo = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', videoId);

      if (error) throw error;

      setVideos(prev => prev.filter(video => video.id !== videoId));
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Error deleting video. Please try again.');
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
    <VideoContainer>
      <VideoTitle>🎥 Video Manager</VideoTitle>
      
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          ➕ Add New Video
        </Button>
      ) : (
        <VideoForm onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Video Title *</Label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Enter video title"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Enter video description (optional)"
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Video URL *</Label>
            <Input
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleFormChange}
              placeholder="https://example.com/video or YouTube/Twitter link"
              type="url"
              required
            />
          </FormGroup>
          
          <ActionButtons>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Video'}
            </Button>
            <Button 
              type="button" 
              className="secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </Button>
          </ActionButtons>
        </VideoForm>
      )}

      <VideoList>
        {videos.length === 0 ? (
          <EmptyState>
            {loading ? 'Loading videos...' : 'No videos yet. Add your first video!'}
          </EmptyState>
        ) : (
          videos.map(video => (
            <VideoCard key={video.id}>
              <VideoCardTitle>{video.title}</VideoCardTitle>
              {video.description && (
                <VideoCardDescription>{video.description}</VideoCardDescription>
              )}
              <VideoLink href={video.video_url} target="_blank" rel="noopener noreferrer">
                {video.video_url}
              </VideoLink>
              <VideoMeta>
                <span>Added: {new Date(video.created_at).toLocaleDateString()}</span>
                <Button 
                  className="secondary" 
                  onClick={() => deleteVideo(video.id)}
                  style={{ padding: 'var(--spacing-xs) var(--spacing-sm)', fontSize: 'var(--font-size-xs)' }}
                >
                  🗑️ Delete
                </Button>
              </VideoMeta>
            </VideoCard>
          ))
        )}
      </VideoList>
    </VideoContainer>
  );
};

export default TwitterSpaces; 