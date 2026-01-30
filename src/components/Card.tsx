import React, { ReactNode } from 'react';
import './Card.css';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, onClick, className = '', hover = true }) => {
  return (
    <div 
      className={`card ${hover ? 'card-hover' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};
