import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

const SizeSelector = ({ sizes, selectedSize, onSizeChange }: SizeSelectorProps) => {
  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  
  // Sort sizes based on standard order
  const sortedSizes = [...sizes].sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a.toUpperCase());
    const bIndex = sizeOrder.indexOf(b.toUpperCase());
    
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    
    return aIndex - bIndex;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Size</h3>
        <button className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors">
          <Ruler className="w-4 h-4" />
          Size Guide
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {sortedSizes.map((size) => {
          const isSelected = selectedSize === size;
          
          return (
            <motion.button
              key={size}
              onClick={() => onSizeChange(size)}
              className={`relative h-12 rounded-lg border-2 font-medium text-sm transition-all ${
                isSelected
                  ? 'border-primary bg-primary text-primary-foreground shadow-lg'
                  : 'border-border bg-background text-foreground hover:border-primary/50 hover:bg-muted'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {size.toUpperCase()}
              
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 via-transparent to-primary/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {selectedSize && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-muted rounded-lg"
        >
          <p className="text-sm text-muted-foreground mb-2">
            Selected: <span className="font-medium text-foreground">{selectedSize.toUpperCase()}</span>
          </p>
          <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
            <div>
              <div className="font-medium">Chest</div>
              <div>38-40"</div>
            </div>
            <div>
              <div className="font-medium">Waist</div>
              <div>32-34"</div>
            </div>
            <div>
              <div className="font-medium">Length</div>
              <div>28"</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SizeSelector;