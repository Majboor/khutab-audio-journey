
import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  description: string;
  onClick: () => void;
  index: number;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ 
  title, 
  description, 
  onClick, 
  index,
  className
}) => {
  // Calculate delay for staggered animation
  const delay = `delay-${(index % 5) * 100}`;
  
  return (
    <div 
      className={cn(
        "p-6 rounded-lg shadow-sm border border-border",
        "bg-card text-card-foreground",
        "flex flex-col",
        "card-hover animate-scale-in cursor-pointer",
        delay,
        className
      )}
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default CategoryCard;
