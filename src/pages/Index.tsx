
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import GenerateKhutabModal from '@/components/GenerateKhutabModal';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import useSermon from '@/hooks/useSermon';

const categories = [
  {
    title: "Learning About Islam's Fundamentals",
    description: "Gain a clear understanding of core beliefs, the Five Pillars, and the history of Islam.",
    value: "fundamentals"
  },
  {
    title: "Exploring Specific Topics",
    description: "Delve into focused subjects—whether it's Islamic jurisprudence, ethics, or historical events.",
    value: "topics"
  },
  {
    title: "Seeking Spiritual Motivation",
    description: "Find inspiration and encouragement to strengthen your faith and overcome daily challenges.",
    value: "motivation"
  },
  {
    title: "Practical Guidance for Everyday Life",
    description: "Discover how Islamic teachings can help navigate modern life's dilemmas and improve personal decision-making.",
    value: "guidance"
  },
  {
    title: "Fostering Community Connection",
    description: "Engage with the communal aspects of worship, feeling part of a supportive and like-minded group.",
    value: "community"
  },
  {
    title: "Encouraging Personal Reflection and Growth",
    description: "Use the insights shared to reflect on personal behaviors, improve character, and pursue self-improvement.",
    value: "reflection"
  }
];

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const { loading, generateSermon } = useSermon();
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-secondary/50 to-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="max-w-4xl mx-auto text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 tracking-tight">Islamic AI Sermons</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Explore inspirational sermons powered by AI to deepen your spiritual journey.
          </p>
          
          <Button 
            onClick={handleCreateNew}
            className="animate-pulse-subtle"
            size="lg"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Generate New Sermon
          </Button>
        </section>
        
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Explore Sermon Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <CategoryCard 
                key={category.value}
                title={category.title}
                description={category.description}
                onClick={() => handleCategoryClick(category.value)}
                index={index}
              />
            ))}
          </div>
        </section>
      </main>
      
      <footer className="py-6 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Islamic AI Sermons. All rights reserved.</p>
        </div>
      </footer>
      
      <GenerateKhutabModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default Index;
