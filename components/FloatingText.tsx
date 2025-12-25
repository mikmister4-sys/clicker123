import React from 'react';
import { FloatingText as FloatingTextType } from '../types';

interface FloatingTextProps {
  items: FloatingTextType[];
}

const FloatingTextOverlay: React.FC<FloatingTextProps> = ({ items }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute text-2xl font-bold text-white animate-float-up select-none"
          style={{
            left: item.x,
            top: item.y,
            textShadow: '0 0 10px rgba(99, 102, 241, 0.8)',
          }}
        >
          +{item.text}
        </div>
      ))}
    </div>
  );
};

export default FloatingTextOverlay;