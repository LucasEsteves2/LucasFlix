import React from 'react';
import './Badge.css';

interface BadgeProps {
  text: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'small' | 'default';
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'default', size = 'default' }) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {text}
    </span>
  );
};
