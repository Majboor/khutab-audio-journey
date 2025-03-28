
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  onClick: () => void;
  index: number;
  icon?: React.ReactNode;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ title, description, onClick, index, icon }) => {
  return (
    <Card 
      className="border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden group animate-fade-in card-hover"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-primary/5 rounded-md mb-4 text-primary">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl tracking-tight group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full justify-between hover:bg-primary/5 group-hover:text-primary"
          onClick={onClick}
        >
          <span>Explore</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CategoryCard;
