import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ColorSelectorProps {
  colors: string[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

const ColorSelector = ({ colors, selectedColor, onColorChange }: ColorSelectorProps) => {
  const getColorValue = (colorName: string): string => {
    const colorMap: Record<string, string> = {
      black: '#000000',
      white: '#ffffff',
      gray: '#808080',
      grey: '#808080',
      red: '#dc2626',
      blue: '#2563eb',
      green: '#16a34a',
      yellow: '#eab308',
      orange: '#ea580c',
      purple: '#9333ea',
      pink: '#ec4899',
      brown: '#92400e',
      navy: '#1e3a8a',
      maroon: '#7f1d1d',
      olive: '#365314',
      teal: '#0f766e',
      lime: '#65a30d',
      indigo: '#4338ca',
      cyan: '#0891b2',
      rose: '#e11d48',
      amber: '#d97706',
      emerald: '#059669',
      violet: '#7c3aed',
      fuchsia: '#c026d3',
      sky: '#0284c7',
      slate: '#475569',
      zinc: '#52525b',
      neutral: '#525252',
      stone: '#57534e',
    };

    return colorMap[colorName.toLowerCase()] || colorName;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">Color</h3>
      <div className="flex flex-wrap gap-3">
        {colors.map((color) => {
          const colorValue = getColorValue(color);
          const isSelected = selectedColor === color;
          
          return (
            <motion.button
              key={color}
              onClick={() => onColorChange(color)}
              className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                isSelected 
                  ? 'border-primary ring-2 ring-primary/20 shadow-lg' 
                  : 'border-border hover:border-primary/50'
              }`}
              style={{ backgroundColor: colorValue }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check 
                    className={`w-6 h-6 ${
                      colorValue === '#ffffff' || colorValue === '#f8fafc' 
                        ? 'text-black' 
                        : 'text-white'
                    }`} 
                  />
                </motion.div>
              )}
              
              {/* Color name tooltip */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-background border border-border rounded text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </div>
            </motion.button>
          );
        })}
      </div>
      
      {selectedColor && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground"
        >
          Selected: <span className="font-medium text-foreground capitalize">{selectedColor}</span>
        </motion.p>
      )}
    </div>
  );
};

export default ColorSelector;