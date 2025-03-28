
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import GenerateKhutabModal from '@/components/GenerateKhutabModal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Server, Volume2 } from 'lucide-react';
import useSermon from '@/hooks/useSermon';
import { API_BASE_URL } from '@/lib/api';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';

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
  const [audioPreview, setAudioPreview] = useState<{url: string, title: string} | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState({title: '', message: ''});
  const { loading, generateSermon } = useSermon();
  const navigate = useNavigate();

  const handleCategoryClick = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    setIsModalOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedCategory(undefined);
    setIsModalOpen(true);
  };

  const handleAudioPreview = (audioPath: string, title: string) => {
    // Convert relative path to full URL
    const fullUrl = `${API_BASE_URL}${audioPath}`;
    setAudioPreview({url: fullUrl, title});
    
    // Show toast notification
    toast.success('Audio preview ready', {
      description: 'Click play to listen to the sermon',
      duration: 3000
    });
  };

  const showAlert = (title: string, message: string) => {
    setAlertContent({title, message});
    setIsAlertOpen(true);
  };

  const closeAudioPreview = () => {
    setAudioPreview(null);
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
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleCreateNew}
              className="animate-pulse-subtle"
              size="lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Generate New Sermon
            </Button>
            
            <Link to="/api-test">
              <Button 
                variant="outline"
                size="lg"
              >
                <Server className="mr-2 h-4 w-4" />
                API Testing
              </Button>
            </Link>
          </div>
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

      {/* Audio Preview Popover */}
      {audioPreview && (
        <Popover open={!!audioPreview} onOpenChange={() => closeAudioPreview()}>
          <PopoverContent className="w-80 p-4" side="top">
            <div className="space-y-2">
              <h3 className="font-medium text-lg flex items-center">
                <Volume2 className="w-4 h-4 mr-2" /> {audioPreview.title}
              </h3>
              <audio 
                controls 
                src={audioPreview.url} 
                className="w-full"
                autoPlay
              />
              <p className="text-xs text-muted-foreground mt-2">
                URL: <code className="bg-muted px-1 py-0.5 rounded text-[10px]">{audioPreview.url}</code>
              </p>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Alert Dialog for notifications */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertContent.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setIsAlertOpen(false)}>
              Close
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
