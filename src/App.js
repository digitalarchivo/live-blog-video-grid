import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LiveBlog from './components/LiveBlog';
import TwitterSpaces from './components/TwitterSpaces';
import ThemeEditor from './components/ThemeEditor';
import SupabaseTest from './components/SupabaseTest';
import AuthButton from './components/AuthButton';
import { AnimatePresence } from 'framer-motion';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background: var(--color-background);
  color: var(--color-text);
  font-family: var(--font-body);
`;

const Header = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--color-surface);
  border-bottom: 2px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-lg);
  z-index: 1000;
  box-shadow: var(--shadow-md);
`;

const Logo = styled.h1`
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: 1.5rem;
`;

const HeaderControls = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
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
  
  &.secondary {
    background: var(--color-secondary);
    
    &:hover {
      background: var(--color-accent);
    }
  }
`;

const MainContent = styled.main`
  margin-top: 60px;
  height: calc(100vh - 60px);
`;

function App() {
  const [showThemeEditor, setShowThemeEditor] = useState(false);

  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContainer>
          <Header>
            <Logo>🚀 Live Blog + Video Grid</Logo>
            <HeaderControls>
              <ControlButton 
                onClick={() => setShowThemeEditor(!showThemeEditor)}
                className="secondary"
              >
                🎨 Theme Editor
              </ControlButton>
            </HeaderControls>
          </Header>

          <MainContent>
            <AuthButton />
            <SupabaseTest />
            <TwitterSpaces />
            <LiveBlog />
          </MainContent>

          <AnimatePresence>
            {showThemeEditor && (
              <ThemeEditor 
                isOpen={showThemeEditor} 
                onClose={() => setShowThemeEditor(false)} 
              />
            )}
          </AnimatePresence>
        </AppContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
