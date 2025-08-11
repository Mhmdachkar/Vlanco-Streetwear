import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, User, Brain, TrendingUp, CheckCircle, AlertCircle, Info } from 'lucide-react';

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSizeChange: (size: string) => void;
  productCategory?: string;
  productFit?: 'slim' | 'regular' | 'oversized';
}

interface UserMeasurements {
  height: number;
  weight: number;
  chest: number;
  waist: number;
  preferredFit: 'tight' | 'fitted' | 'regular' | 'loose' | 'oversized';
}

interface SizeRecommendation {
  size: string;
  confidence: number;
  reason: string;
  fitPrediction: 'too_small' | 'perfect' | 'too_large';
}

const SmartSizeSelector: React.FC<SizeSelectorProps> = ({
  sizes,
  selectedSize,
  onSizeChange,
  productCategory = 'tops',
  productFit = 'regular'
}) => {
  const [showMeasurements, setShowMeasurements] = useState(false);
  const [userMeasurements, setUserMeasurements] = useState<UserMeasurements>({
    height: 0,
    weight: 0,
    chest: 0,
    waist: 0,
    preferredFit: 'regular'
  });
  const [recommendations, setRecommendations] = useState<SizeRecommendation[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Size guide data (mock data - would come from API)
  const sizeGuide = {
    'XS': { chest: 34, waist: 28, length: 26 },
    'S': { chest: 36, waist: 30, length: 27 },
    'M': { chest: 38, waist: 32, length: 28 },
    'L': { chest: 40, waist: 34, length: 29 },
    'XL': { chest: 42, waist: 36, length: 30 },
    'XXL': { chest: 44, waist: 38, length: 31 }
  };

  // AI-powered size recommendation algorithm
  const calculateSizeRecommendations = (measurements: UserMeasurements): SizeRecommendation[] => {
    if (!measurements.chest || !measurements.height) return [];

    const recommendations: SizeRecommendation[] = [];

    sizes.forEach(size => {
      const sizeData = sizeGuide[size as keyof typeof sizeGuide];
      if (!sizeData) return;

      // Calculate fit based on measurements and preferences
      let confidence = 0;
      let fitPrediction: 'too_small' | 'perfect' | 'too_large' = 'perfect';
      let reason = '';

      // Chest fit calculation
      const chestDiff = sizeData.chest - measurements.chest;
      
      if (measurements.preferredFit === 'tight') {
        if (chestDiff >= -1 && chestDiff <= 1) {
          confidence += 40;
          reason += 'Perfect tight fit for chest. ';
        } else if (chestDiff > 1) {
          confidence += 20;
          fitPrediction = 'too_large';
          reason += 'May be loose in chest area. ';
        } else {
          confidence += 10;
          fitPrediction = 'too_small';
          reason += 'Might be tight in chest. ';
        }
      } else if (measurements.preferredFit === 'regular') {
        if (chestDiff >= 1 && chestDiff <= 3) {
          confidence += 40;
          reason += 'Ideal regular fit for chest. ';
        } else if (chestDiff > 3) {
          confidence += 25;
          fitPrediction = 'too_large';
          reason += 'Relaxed fit in chest. ';
        } else {
          confidence += 15;
          fitPrediction = 'too_small';
          reason += 'Snug fit in chest. ';
        }
      } else if (measurements.preferredFit === 'oversized') {
        if (chestDiff >= 3 && chestDiff <= 6) {
          confidence += 40;
          reason += 'Perfect oversized fit. ';
        } else if (chestDiff < 3) {
          confidence += 20;
          fitPrediction = 'too_small';
          reason += 'Not oversized enough. ';
        }
      }

      // Adjust for product fit style
      if (productFit === 'slim' && measurements.preferredFit !== 'tight') {
        confidence -= 10;
        reason += 'Slim fit style. ';
      } else if (productFit === 'oversized' && measurements.preferredFit === 'tight') {
        confidence -= 15;
        reason += 'Oversized style may not suit tight preference. ';
      }

      // Height adjustment for length
      if (measurements.height > 180 && size === 'S') {
        confidence -= 10;
        reason += 'Consider length for your height. ';
      } else if (measurements.height < 165 && size === 'XL') {
        confidence -= 5;
        reason += 'May be long for your height. ';
      }

      recommendations.push({
        size,
        confidence: Math.max(0, Math.min(100, confidence)),
        reason: reason.trim(),
        fitPrediction
      });
    });

    return recommendations.sort((a, b) => b.confidence - a.confidence);
  };

  const handleCalculateSize = async () => {
    setIsCalculating(true);
    
    // Simulate AI calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const recs = calculateSizeRecommendations(userMeasurements);
    setRecommendations(recs);
    setIsCalculating(false);
    
    // Auto-select the best recommendation
    if (recs.length > 0 && recs[0].confidence > 70) {
      onSizeChange(recs[0].size);
    }
  };

  const getSizeConfidence = (size: string) => {
    const rec = recommendations.find(r => r.size === size);
    return rec ? rec.confidence : 0;
  };

  const getSizeFitColor = (size: string) => {
    const rec = recommendations.find(r => r.size === size);
    if (!rec) return 'border-border';
    
    if (rec.confidence > 80) return 'border-green-500 bg-green-500/10';
    if (rec.confidence > 60) return 'border-yellow-500 bg-yellow-500/10';
    if (rec.confidence > 40) return 'border-orange-500 bg-orange-500/10';
    return 'border-red-500 bg-red-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header with AI indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Ruler className="w-5 h-5" />
          Smart Size Selection
        </h3>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm text-primary font-medium">AI Powered</span>
        </div>
      </div>

      {/* Size Options */}
      <div className="space-y-4">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {sizes.map((size) => {
            const confidence = getSizeConfidence(size);
            const isSelected = selectedSize === size;
            const borderClass = recommendations.length > 0 ? getSizeFitColor(size) : 'border-border';
            
            return (
              <motion.button
                key={size}
                onClick={() => onSizeChange(size)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                    : borderClass + ' hover:border-primary/50'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-semibold text-lg">{size}</span>
                
                {/* Confidence indicator */}
                {confidence > 0 && (
                  <div className="absolute -top-1 -right-1">
                    {confidence > 80 ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : confidence > 60 ? (
                      <TrendingUp className="w-5 h-5 text-yellow-500" />
                    ) : confidence > 40 ? (
                      <AlertCircle className="w-5 h-5 text-orange-500" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                )}
                
                {/* Confidence percentage */}
                {confidence > 0 && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <span className="text-xs bg-background px-1 rounded border">
                      {confidence}%
                    </span>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Recommendation Details */}
        <AnimatePresence>
          {selectedSize && recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-muted/50 rounded-lg p-4"
            >
              {(() => {
                const rec = recommendations.find(r => r.size === selectedSize);
                if (!rec) return null;
                
                return (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {rec.confidence > 80 ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      ) : rec.confidence > 60 ? (
                        <TrendingUp className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">
                        {rec.confidence > 80 ? 'Excellent Match!' : 
                         rec.confidence > 60 ? 'Good Fit' : 
                         rec.confidence > 40 ? 'Possible Fit' : 'Consider Other Sizes'}
                      </h4>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs font-medium">Confidence:</span>
                        <div className="flex-1 bg-background rounded-full h-2 max-w-[100px]">
                          <motion.div
                            className={`h-full rounded-full ${
                              rec.confidence > 80 ? 'bg-green-500' :
                              rec.confidence > 60 ? 'bg-yellow-500' :
                              rec.confidence > 40 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            initial={{ width: 0 }}
                            animate={{ width: `${rec.confidence}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                        <span className="text-xs font-bold">{rec.confidence}%</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <motion.button
          onClick={() => setShowMeasurements(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <User className="w-4 h-4" />
          Get AI Recommendation
        </motion.button>
        
        <motion.button
          onClick={() => setShowSizeGuide(true)}
          className="flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-lg font-medium hover:bg-muted transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Info className="w-4 h-4" />
          Size Guide
        </motion.button>
      </div>

      {/* Measurements Modal */}
      <AnimatePresence>
        {showMeasurements && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowMeasurements(false)}
            />
            <motion.div
              className="relative bg-background rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <h3 className="text-xl font-bold mb-4">Your Measurements</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Provide your measurements for AI-powered size recommendations
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={userMeasurements.height || ''}
                      onChange={(e) => setUserMeasurements(prev => ({
                        ...prev,
                        height: Number(e.target.value)
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="175"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={userMeasurements.weight || ''}
                      onChange={(e) => setUserMeasurements(prev => ({
                        ...prev,
                        weight: Number(e.target.value)
                      }))}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="70"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Chest (cm)</label>
                  <input
                    type="number"
                    value={userMeasurements.chest || ''}
                    onChange={(e) => setUserMeasurements(prev => ({
                      ...prev,
                      chest: Number(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="96"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Waist (cm)</label>
                  <input
                    type="number"
                    value={userMeasurements.waist || ''}
                    onChange={(e) => setUserMeasurements(prev => ({
                      ...prev,
                      waist: Number(e.target.value)
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="81"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Fit</label>
                  <select
                    value={userMeasurements.preferredFit}
                    onChange={(e) => setUserMeasurements(prev => ({
                      ...prev,
                      preferredFit: e.target.value as any
                    }))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="tight">Tight</option>
                    <option value="fitted">Fitted</option>
                    <option value="regular">Regular</option>
                    <option value="loose">Loose</option>
                    <option value="oversized">Oversized</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <motion.button
                  onClick={handleCalculateSize}
                  disabled={isCalculating || !userMeasurements.chest || !userMeasurements.height}
                  className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: isCalculating ? 1 : 1.02 }}
                  whileTap={{ scale: isCalculating ? 1 : 0.98 }}
                >
                  {isCalculating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4" />
                      Get AI Recommendation
                    </>
                  )}
                </motion.button>
                
                <motion.button
                  onClick={() => setShowMeasurements(false)}
                  className="px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowSizeGuide(false)}
            />
            <motion.div
              className="relative bg-background rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
            >
              <h3 className="text-xl font-bold mb-4">Size Guide</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium">Size</th>
                      <th className="text-left py-3 px-4 font-medium">Chest (cm)</th>
                      <th className="text-left py-3 px-4 font-medium">Waist (cm)</th>
                      <th className="text-left py-3 px-4 font-medium">Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(sizeGuide).map(([size, measurements]) => (
                      <tr key={size} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{size}</td>
                        <td className="py-3 px-4">{measurements.chest}</td>
                        <td className="py-3 px-4">{measurements.waist}</td>
                        <td className="py-3 px-4">{measurements.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">How to Measure</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                  <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                  <li>• <strong>Length:</strong> Measure from shoulder to hem</li>
                </ul>
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  onClick={() => setShowSizeGuide(false)}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Got it
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartSizeSelector; 