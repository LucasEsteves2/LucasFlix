import React, { ReactNode } from 'react';
import './Row.css';

interface RowProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const Row: React.FC<RowProps> = ({ title, children, action, className }) => {
  return (
    <div className="row">
      <div className={`row-header ${className ? 'ranking-header' : ''}`}>
        <h2 className="row-title">{title}</h2>
        {action && <div className="row-action">{action}</div>}
      </div>
      <div className={`row-content ${className || ''}`}>
        {children}
      </div>
    </div>
  );
};
