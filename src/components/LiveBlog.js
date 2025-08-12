import React, { useState, useEffect, useRef } from 'react';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const BlogContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-body);
`;

const BlogPost = styled(motion.div)`
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
  
  &.editing {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(97, 218, 251, 0.2);
  }
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
`;

const PostTitle = styled.h3`
  margin: 0;
  font-family: var(--font-heading);
  font-size: 1.1rem;
  color: var(--color-primary);
`;

const PostContent = styled.div`
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--color-text);
  min-height: 80px;
  
  &.editing {
    outline: none;
    border: 1px solid var(--color-primary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-sm);
  }
`;

const EditButton = styled.button`
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-accent);
    transform: scale(1.05);
  }
`;

const PresenceIndicator = styled.div`
  position: absolute;
  top: var(--spacing-xs);
  right: var(--spacing-xs);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.color};
  border: 2px solid white;
  box-shadow: var(--shadow-sm);
`;

const LiveBlog = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [yDoc, setYDoc] = useState(null);
  const [presence, setPresence] = useState(new Map());
  
  const postsRef = useRef(null);
  const editorRefs = useRef({});

  useEffect(() => {
    if (!isAuthenticated) return;

    // Initialize Yjs document
    const doc = new Y.Doc();
    const wsProvider = new WebsocketProvider(
      process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:1234',
      'live-blog-room',
      doc,
      { WebSocketPolyfill: WebSocket }
    );

    setYDoc(doc);

    // Set up presence awareness
    const awareness = wsProvider.awareness;
    awareness.setLocalStateField('user', {
      id: user.id,
      name: user.user_metadata?.username || 'Anonymous',
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      avatar: user.user_metadata?.avatar_url || null
    });

    // Listen for presence changes
    awareness.on('change', () => {
      const states = awareness.getStates();
      setPresence(new Map(states));
    });

    // Set up posts collection
    const postsCollection = doc.getArray('posts');
    
    // Initialize with default posts if empty
    if (postsCollection.length === 0) {
      const defaultPosts = Array.from({ length: 9 }, (_, i) => ({
        id: `post-${i + 1}`,
        title: `Blog Post ${i + 1}`,
        content: `This is the content for blog post ${i + 1}. Click edit to start writing!`,
        author: user.user_metadata?.username || 'Anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));
      
      postsCollection.push(defaultPosts);
    }

    // Listen for changes
    postsCollection.observe(event => {
      const updatedPosts = postsCollection.toArray();
      setPosts(updatedPosts);
    });

    // Load initial posts
    setPosts(postsCollection.toArray());

    return () => {
      wsProvider.destroy();
    };
  }, [isAuthenticated, user]);

  const startEditing = (postId) => {
    setEditingPost(postId);
    setTimeout(() => {
      if (editorRefs.current[postId]) {
        editorRefs.current[postId].focus();
      }
    }, 100);
  };

  const savePost = (postId, newContent) => {
    if (!yDoc) return;

    const postsCollection = yDoc.getArray('posts');
    const postIndex = postsCollection.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
      const updatedPost = {
        ...postsCollection.get(postIndex),
        content: newContent,
        updatedAt: new Date().toISOString()
      };
      
      postsCollection.delete(postIndex);
      postsCollection.insert(postIndex, [updatedPost]);
    }
    
    setEditingPost(null);
  };

  const handleContentChange = (postId, newContent) => {
    if (!yDoc) return;

    const postsCollection = yDoc.getArray('posts');
    const postIndex = postsCollection.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
      const currentPost = postsCollection.get(postIndex);
      const updatedPost = {
        ...currentPost,
        content: newContent,
        updatedAt: new Date().toISOString()
      };
      
      postsCollection.delete(postIndex);
      postsCollection.insert(postIndex, [updatedPost]);
    }
  };

  const handleKeyDown = (e, postId) => {
    if (e.key === 'Enter' && e.metaKey) {
      savePost(postId, e.target.textContent);
    } else if (e.key === 'Escape') {
      setEditingPost(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <BlogContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            gridColumn: '1 / -1',
            gridRow: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)'
          }}
        >
          <h1>Welcome to Live Blog + Video Grid</h1>
          <p>Please sign in with your passkey to start editing.</p>
        </motion.div>
      </BlogContainer>
    );
  }

  return (
    <BlogContainer ref={postsRef}>
      <AnimatePresence>
        {posts.map((post, index) => (
          <BlogPost
            key={post.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={editingPost === post.id ? 'editing' : ''}
          >
            <PostHeader>
              <PostTitle>{post.title}</PostTitle>
              <EditButton
                onClick={() => startEditing(post.id)}
                disabled={editingPost === post.id}
              >
                {editingPost === post.id ? 'Saving...' : 'Edit'}
              </EditButton>
            </PostHeader>
            
            <PostContent
              ref={el => editorRefs.current[post.id] = el}
              contentEditable={editingPost === post.id}
              suppressContentEditableWarning
              className={editingPost === post.id ? 'editing' : ''}
              onInput={(e) => handleContentChange(post.id, e.target.textContent)}
              onKeyDown={(e) => handleKeyDown(e, post.id)}
              onBlur={(e) => savePost(post.id, e.target.textContent)}
            >
              {post.content}
            </PostContent>
            
            {/* Presence indicators */}
            {Array.from(presence.values()).map((userState, i) => (
              <PresenceIndicator
                key={userState.id}
                color={userState.color}
                title={userState.name}
              />
            ))}
          </BlogPost>
        ))}
      </AnimatePresence>
    </BlogContainer>
  );
};

export default LiveBlog; 