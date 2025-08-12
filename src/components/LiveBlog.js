import React, { useState, useEffect, useRef } from 'react';
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
  overflow: hidden;
  position: relative;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }
  
  &.editing {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(97, 218, 251, 0.2);
  }
`;

const PostImage = styled.div`
  width: 100%;
  height: 60%;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'var(--color-secondary)'};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.1) 50%,
      rgba(0, 0, 0, 0.3) 100%
    );
    pointer-events: none;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
  color: white;
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: center;
  padding: var(--spacing-md);
`;

const ImageUploadButton = styled.button`
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
    transform: scale(1.05);
  }
`;

const PostContent = styled.div`
  flex: 1;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PostHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
`;

const PostTitle = styled.h3`
  margin: 0;
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
  color: var(--color-text);
  line-height: 1.3;
  flex: 1;
  margin-right: var(--spacing-sm);
`;

const EditButton = styled.button`
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    background: var(--color-accent);
    transform: scale(1.05);
  }
`;

const PostDescription = styled.div`
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-text);
  margin-bottom: var(--spacing-sm);
  flex: 1;
  
  &.editing {
    outline: none;
    border: 1px solid var(--color-primary);
    border-radius: var(--border-radius-sm);
    padding: var(--spacing-sm);
    background: var(--color-background);
  }
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  opacity: 0.8;
  margin-top: auto;
`;

const Author = styled.span`
  font-weight: 600;
  color: var(--color-primary);
`;

const Date = styled.span`
  font-size: var(--font-size-xs);
`;



const ImageInput = styled.input`
  display: none;
`;

const LiveBlog = () => {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  
  const postsRef = useRef(null);
  const editorRefs = useRef({});
  const imageInputRefs = useRef({});

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

      // Initialize with default posts
  const defaultPosts = [];
  const now = 1704067200000; // Fixed timestamp for demo
  for (let i = 0; i < 9; i++) {
    defaultPosts.push({
      id: `post-${i + 1}`,
      title: `Blog Post ${i + 1}`,
      description: `This is the description for blog post ${i + 1}. Click edit to start writing your content!`,
      imageUrl: null,
      author: user.user_metadata?.username || 'Anonymous',
      createdAt: now,
      updatedAt: now
    });
  }
    
    setPosts(defaultPosts);
  }, [isAuthenticated, user]);

  const startEditing = (postId) => {
    setEditingPost(postId);
    setTimeout(() => {
      if (editorRefs.current[postId]) {
        editorRefs.current[postId].focus();
      }
    }, 100);
  };

  const savePost = (postId, newDescription) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, description: newDescription, updatedAt: Date.now() }
          : post
      )
    );
    setEditingPost(null);
  };

  const handleDescriptionChange = (postId, newDescription) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, description: newDescription, updatedAt: Date.now() }
          : post
      )
    );
  };

  const handleTitleChange = (postId, newTitle) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, title: newTitle, updatedAt: Date.now() }
          : post
      )
    );
  };

  const handleImageUpload = (postId, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Convert image to base64 for storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, imageUrl: imageUrl, updatedAt: Date.now() }
            : post
        )
      );
    };
    reader.readAsDataURL(file);
  };

  const triggerImageUpload = (postId) => {
    if (imageInputRefs.current[postId]) {
      imageInputRefs.current[postId].click();
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
            <PostImage 
              imageUrl={post.imageUrl}
              onClick={() => triggerImageUpload(post.id)}
            >
              {!post.imageUrl && (
                <ImagePlaceholder>
                  Click to add HD image
                </ImagePlaceholder>
              )}
              <ImageUploadButton onClick={(e) => {
                e.stopPropagation();
                triggerImageUpload(post.id);
              }}>
                📷
              </ImageUploadButton>
            </PostImage>
            
            <PostContent>
              <PostHeader>
                <PostTitle
                  contentEditable={editingPost === post.id}
                  suppressContentEditableWarning
                  onInput={(e) => handleTitleChange(post.id, e.target.textContent)}
                  onBlur={(e) => handleTitleChange(post.id, e.target.textContent)}
                  style={{
                    outline: editingPost === post.id ? '1px solid var(--color-primary)' : 'none',
                    padding: editingPost === post.id ? 'var(--spacing-xs)' : '0',
                    borderRadius: editingPost === post.id ? 'var(--border-radius-sm)' : '0'
                  }}
                >
                  {post.title}
                </PostTitle>
                <EditButton
                  onClick={() => startEditing(post.id)}
                  disabled={editingPost === post.id}
                >
                  {editingPost === post.id ? 'Saving...' : 'Edit'}
                </EditButton>
              </PostHeader>
              
              <PostDescription
                ref={el => editorRefs.current[post.id] = el}
                contentEditable={editingPost === post.id}
                suppressContentEditableWarning
                className={editingPost === post.id ? 'editing' : ''}
                onInput={(e) => handleDescriptionChange(post.id, e.target.textContent)}
                onKeyDown={(e) => handleKeyDown(e, post.id)}
                onBlur={(e) => savePost(post.id, e.target.textContent)}
              >
                {post.description}
              </PostDescription>
              
              <PostMeta>
                <Author>{post.author}</Author>
                <Date>{new Date(post.createdAt).toLocaleDateString()}</Date>
              </PostMeta>
            </PostContent>
            
            {/* Hidden image input */}
            <ImageInput
              ref={el => imageInputRefs.current[post.id] = el}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(post.id, e)}
            />
            

          </BlogPost>
        ))}
      </AnimatePresence>
    </BlogContainer>
  );
};

export default LiveBlog; 