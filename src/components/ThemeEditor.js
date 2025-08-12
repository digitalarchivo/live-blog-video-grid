import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

const EditorContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  height: 100vh;
  background: var(--color-surface);
  border-left: 2px solid var(--color-border);
  box-shadow: var(--shadow-xl);
  overflow-y: auto;
  z-index: 1000;
  padding: var(--spacing-lg);
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
`;

const EditorTitle = styled.h2`
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
`;

const CloseButton = styled.button`
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-xs) var(--spacing-sm);
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Section = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const SectionTitle = styled.h3`
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
  font-size: 1rem;
  font-family: var(--font-heading);
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-sm);
`;

const ColorInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const ColorLabel = styled.label`
  font-size: 0.8rem;
  color: var(--color-text);
  font-weight: 500;
`;

const ColorPicker = styled.input`
  width: 100%;
  height: 40px;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  
  &:hover {
    border-color: var(--color-primary);
  }
`;

const FontSelect = styled.select`
  width: 100%;
  padding: var(--spacing-sm);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-body);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
  }
`;

const SpacingSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const SliderLabel = styled.label`
  font-size: 0.8rem;
  color: var(--color-text);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: var(--color-border);
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: none;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: var(--color-primary);
  }
  
  &:checked + span:before {
    transform: translateX(26px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--color-border);
  transition: 0.4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const SaveButton = styled.button`
  width: 100%;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-accent);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ThemeEditor = ({ isOpen, onClose }) => {
  const { currentTheme, saveTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(currentTheme);
  const [saving, setSaving] = useState(false);

  const handleColorChange = (category, key, value) => {
    setLocalTheme(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleFontChange = (key, value) => {
    setLocalTheme(prev => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [key]: value
      }
    }));
  };

  const handleSpacingChange = (key, value) => {
    setLocalTheme(prev => ({
      ...prev,
      spacing: {
        ...prev.spacing,
        [key]: `${value}rem`
      }
    }));
  };

  const handleBorderRadiusChange = (key, value) => {
    setLocalTheme(prev => ({
      ...prev,
      borderRadius: {
        ...prev.borderRadius,
        [key]: `${value}rem`
      }
    }));
  };

  const handleDarkModeToggle = () => {
    setLocalTheme(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveTheme(localTheme);
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setSaving(false);
    }
  };

  const availableFonts = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Montserrat',
    'Source Sans Pro', 'Raleway', 'Ubuntu', 'Fira Code', 'JetBrains Mono'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <EditorContainer
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        >
          <EditorHeader>
            <EditorTitle>Theme Editor</EditorTitle>
            <CloseButton onClick={onClose}>×</CloseButton>
          </EditorHeader>

          <Section>
            <SectionTitle>Colors</SectionTitle>
            <ColorGrid>
              {Object.entries(localTheme.colors).map(([key, value]) => (
                <ColorInput key={key}>
                  <ColorLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</ColorLabel>
                  <ColorPicker
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange('colors', key, e.target.value)}
                  />
                </ColorInput>
              ))}
            </ColorGrid>
          </Section>

          <Section>
            <SectionTitle>Fonts</SectionTitle>
            {Object.entries(localTheme.fonts).map(([key, value]) => (
              <ColorInput key={key}>
                <ColorLabel>{key.charAt(0).toUpperCase() + key.slice(1)}</ColorLabel>
                <FontSelect
                  value={value}
                  onChange={(e) => handleFontChange(key, e.target.value)}
                >
                  {availableFonts.map(font => (
                    <option key={font} value={font}>{font}</option>
                  ))}
                </FontSelect>
              </ColorInput>
            ))}
          </Section>

          <Section>
            <SectionTitle>Spacing</SectionTitle>
            {Object.entries(localTheme.spacing).map(([key, value]) => (
              <SpacingSlider key={key}>
                <SliderLabel>
                  {key.toUpperCase()}
                  <span>{parseFloat(value)}rem</span>
                </SliderLabel>
                <Slider
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={parseFloat(value)}
                  onChange={(e) => handleSpacingChange(key, parseFloat(e.target.value))}
                />
              </SpacingSlider>
            ))}
          </Section>

          <Section>
            <SectionTitle>Border Radius</SectionTitle>
            {Object.entries(localTheme.borderRadius).map(([key, value]) => (
              <SpacingSlider key={key}>
                <SliderLabel>
                  {key.toUpperCase()}
                  <span>{parseFloat(value)}rem</span>
                </SliderLabel>
                <Slider
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={parseFloat(value)}
                  onChange={(e) => handleBorderRadiusChange(key, parseFloat(e.target.value))}
                />
              </SpacingSlider>
            ))}
          </Section>

          <Section>
            <SectionTitle>Dark Mode</SectionTitle>
            <ToggleContainer>
              <Toggle>
                <ToggleInput
                  type="checkbox"
                  checked={localTheme.darkMode}
                  onChange={handleDarkModeToggle}
                />
                <ToggleSlider />
              </Toggle>
              <span>{localTheme.darkMode ? 'Enabled' : 'Disabled'}</span>
            </ToggleContainer>
          </Section>

          <SaveButton onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Theme'}
          </SaveButton>
        </EditorContainer>
      )}
    </AnimatePresence>
  );
};

export default ThemeEditor; 