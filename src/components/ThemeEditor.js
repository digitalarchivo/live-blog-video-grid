import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { useTheme } from '../contexts/ThemeContext';

// Professional Color Palettes
const PROFESSIONAL_PALETTES = {
  'Modern Blue': {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#06B6D4',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1E293B',
    border: '#E2E8F0'
  },
  'Dark Elegant': {
    primary: '#8B5CF6',
    secondary: '#4C1D95',
    accent: '#EC4899',
    background: '#0F172A',
    surface: '#1E293B',
    text: '#F1F5F9',
    border: '#334155'
  },
  'Warm Sunset': {
    primary: '#F59E0B',
    secondary: '#D97706',
    accent: '#EF4444',
    background: '#FEF7ED',
    surface: '#FEF3C7',
    text: '#451A03',
    border: '#FCD34D'
  },
  'Forest Green': {
    primary: '#10B981',
    secondary: '#059669',
    accent: '#84CC16',
    background: '#F0FDF4',
    surface: '#DCFCE7',
    text: '#14532D',
    border: '#86EFAC'
  },
  'Ocean Deep': {
    primary: '#0891B2',
    secondary: '#0E7490',
    accent: '#0EA5E9',
    background: '#F0F9FF',
    surface: '#E0F2FE',
    text: '#0C4A6E',
    border: '#7DD3FC'
  },
  'Midnight Purple': {
    primary: '#7C3AED',
    secondary: '#5B21B6',
    accent: '#A855F7',
    background: '#FAF5FF',
    surface: '#F3E8FF',
    text: '#581C87',
    border: '#C4B5FD'
  }
};

// Professional Font Stacks
const PROFESSIONAL_FONTS = {
  'Inter': 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  'Roboto': 'Roboto, -apple-system, BlinkMacSystemFont, sans-serif',
  'Open Sans': 'Open Sans, -apple-system, BlinkMacSystemFont, sans-serif',
  'Lato': 'Lato, -apple-system, BlinkMacSystemFont, sans-serif',
  'Poppins': 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
  'Montserrat': 'Montserrat, -apple-system, BlinkMacSystemFont, sans-serif',
  'Source Sans Pro': 'Source Sans Pro, -apple-system, BlinkMacSystemFont, sans-serif',
  'Ubuntu': 'Ubuntu, -apple-system, BlinkMacSystemFont, sans-serif'
};

const EditorContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 450px;
  height: 100vh;
  background: #ffffff;
  border-left: 3px solid #3B82F6;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25);
  overflow-y: auto;
  z-index: 9999;
  padding: 20px;
  border-radius: 0 0 0 20px;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-md);
  border-bottom: 2px solid var(--color-border);
`;

const EditorTitle = styled.h2`
  margin: 0;
  color: var(--color-primary);
  font-family: var(--font-heading);
  font-size: var(--font-size-xl);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, var(--color-accent), var(--color-primary));
  color: white;
  border: none;
  border-radius: var(--border-radius-full);
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const Section = styled.div`
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--color-border);
`;

const SectionTitle = styled.h3`
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
  font-size: var(--font-size-lg);
  font-family: var(--font-heading);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const PaletteGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const PaletteCard = styled.div`
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 2px solid ${props => props.active ? 'var(--color-primary)' : 'var(--color-border)'};
  cursor: pointer;
  transition: all var(--transition-fast);
  background: ${props => props.active ? 'rgba(59, 130, 246, 0.1)' : 'transparent'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    border-color: var(--color-primary);
  }
`;

const PalettePreview = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: var(--spacing-sm);
`;

const ColorSwatch = styled.div`
  width: 20px;
  height: 20px;
  border-radius: var(--border-radius-sm);
  background: ${props => props.color};
  border: 1px solid rgba(0,0,0,0.1);
`;

const PaletteName = styled.div`
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
`;

const ColorInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const ColorLabel = styled.label`
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: 600;
  text-transform: capitalize;
`;

const ColorPicker = styled.input`
  width: 100%;
  height: 45px;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    border-color: var(--color-primary);
    transform: scale(1.02);
  }
  
  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const FontSelect = styled.select`
  width: 100%;
  padding: var(--spacing-md);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  cursor: pointer;
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

const SizeSlider = styled.div`
  margin: var(--spacing-md) 0;
`;

const SizeLabel = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-text);
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: var(--border-radius-full);
  background: var(--color-border);
  outline: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    box-shadow: var(--shadow-md);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--color-primary);
    cursor: pointer;
    border: none;
    box-shadow: var(--shadow-md);
  }
`;

const SizeValue = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-accent);
  font-weight: 600;
  margin-left: var(--spacing-sm);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
`;

const ActionButton = styled.button`
  flex: 1;
  padding: var(--spacing-md);
  border: none;
  border-radius: var(--border-radius-md);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-base);
  
  &.primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
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

const LivePreview = styled.div`
  padding: var(--spacing-lg);
  background: var(--color-background);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
`;

const PreviewTitle = styled.h4`
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text);
  font-family: var(--font-heading);
  font-size: var(--font-size-lg);
`;

const PreviewText = styled.p`
  margin: 0;
  color: var(--color-text);
  font-family: var(--font-body);
  font-size: var(--font-size-base);
  line-height: 1.6;
`;

const ThemeEditor = ({ isOpen, onClose }) => {
  const { currentTheme, updateTheme, saveTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState(currentTheme);
  const [selectedPalette, setSelectedPalette] = useState(null);

  useEffect(() => {
    setLocalTheme(currentTheme);
  }, [currentTheme, isOpen]);

  const handleColorChange = (key, value) => {
    const newTheme = { ...localTheme, colors: { ...localTheme.colors, [key]: value } };
    setLocalTheme(newTheme);
    updateTheme(newTheme);
  };

  const handleFontChange = (key, value) => {
    const newTheme = { ...localTheme, fonts: { ...localTheme.fonts, [key]: value } };
    setLocalTheme(newTheme);
    updateTheme(newTheme);
  };

  const handleSizeChange = (key, value) => {
    const newTheme = { ...localTheme, fonts: { ...localTheme.fonts, [key]: value } };
    setLocalTheme(newTheme);
    updateTheme(newTheme);
  };

  const applyPalette = (paletteName) => {
    const palette = PROFESSIONAL_PALETTES[paletteName];
    const newTheme = { ...localTheme, colors: { ...localTheme.colors, ...palette } };
    setLocalTheme(newTheme);
    updateTheme(newTheme);
    setSelectedPalette(paletteName);
  };

  const handleSave = async () => {
    try {
      await saveTheme(localTheme);
      onClose();
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const handleReset = () => {
    setLocalTheme(currentTheme);
    setSelectedPalette(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <EditorContainer
          initial={{ x: 450 }}
          animate={{ x: 0 }}
          exit={{ x: 450 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <EditorHeader>
            <EditorTitle>🎨 Theme Studio</EditorTitle>
            <CloseButton onClick={onClose}>✕</CloseButton>
          </EditorHeader>

          <Section>
            <SectionTitle>🎨 Professional Palettes</SectionTitle>
            <PaletteGrid>
              {Object.entries(PROFESSIONAL_PALETTES).map(([name, colors]) => (
                <PaletteCard
                  key={name}
                  active={selectedPalette === name}
                  onClick={() => applyPalette(name)}
                >
                  <PalettePreview>
                    {Object.values(colors).slice(0, 6).map((color, index) => (
                      <ColorSwatch key={index} color={color} />
                    ))}
                  </PalettePreview>
                  <PaletteName>{name}</PaletteName>
                </PaletteCard>
              ))}
            </PaletteGrid>
          </Section>

          <Section>
            <SectionTitle>🎨 Custom Colors</SectionTitle>
            <ColorGrid>
              {Object.entries(localTheme.colors).map(([key, value]) => (
                <ColorInput key={key}>
                  <ColorLabel>{key}</ColorLabel>
                  <ColorPicker
                    type="color"
                    value={value}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                  />
                </ColorInput>
              ))}
            </ColorGrid>
          </Section>

          <Section>
            <SectionTitle>🔤 Typography</SectionTitle>
            <ColorInput>
              <ColorLabel>Heading Font</ColorLabel>
              <FontSelect
                value={localTheme.fonts.heading}
                onChange={(e) => handleFontChange('heading', e.target.value)}
              >
                {Object.entries(PROFESSIONAL_FONTS).map(([name, stack]) => (
                  <option key={name} value={stack}>{name}</option>
                ))}
              </FontSelect>
            </ColorInput>
            
            <ColorInput>
              <ColorLabel>Body Font</ColorLabel>
              <FontSelect
                value={localTheme.fonts.body}
                onChange={(e) => handleFontChange('body', e.target.value)}
              >
                {Object.entries(PROFESSIONAL_FONTS).map(([name, stack]) => (
                  <option key={name} value={stack}>{name}</option>
                ))}
              </FontSelect>
            </ColorInput>

            <SizeSlider>
              <SizeLabel>
                Heading Size: <SizeValue>{localTheme.fonts.headingSize || '2rem'}</SizeValue>
              </SizeLabel>
              <Slider
                type="range"
                min="1"
                max="4"
                step="0.1"
                value={parseFloat(localTheme.fonts.headingSize || '2rem')}
                onChange={(e) => handleSizeChange('headingSize', `${e.target.value}rem`)}
              />
            </SizeSlider>

            <SizeSlider>
              <SizeLabel>
                Body Size: <SizeValue>{localTheme.fonts.bodySize || '1rem'}</SizeValue>
              </SizeLabel>
              <Slider
                type="range"
                min="0.75"
                max="1.5"
                step="0.05"
                value={parseFloat(localTheme.fonts.bodySize || '1rem')}
                onChange={(e) => handleSizeChange('bodySize', `${e.target.value}rem`)}
              />
            </SizeSlider>
          </Section>

          <Section>
            <SectionTitle>👁️ Live Preview</SectionTitle>
            <LivePreview>
              <PreviewTitle>Sample Heading</PreviewTitle>
              <PreviewText>
                This is how your text will look with the current theme settings. 
                The preview updates in real-time as you make changes.
              </PreviewText>
            </LivePreview>
          </Section>

          <ActionButtons>
            <ActionButton className="secondary" onClick={handleReset}>
              Reset
            </ActionButton>
            <ActionButton className="primary" onClick={handleSave}>
              Save Theme
            </ActionButton>
          </ActionButtons>
        </EditorContainer>
      )}
    </AnimatePresence>
  );
};

export default ThemeEditor; 