import React, { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';
import Header from '@/components/Header';
import CategoryCard from '@/components/CategoryCard';
import GenerateKhutabModal from '@/components/GenerateKhutabModal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Server, Volume2, BookOpen, Star, Users, Sparkles, MessageSquare } from 'lucide-react';
import useSermon from '@/hooks/useSermon';
import { API_BASE_URL } from '@/lib/api';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const categories = [
  {
    title: "Learning About Islam's Fundamentals",
    description: "Gain a clear understanding of core beliefs, the Five Pillars, and the history of Islam.",
    value: "fundamentals",
    icon: <BookOpen className="h-6 w-6" />
  },
  {
    title: "Exploring Specific Topics",
    description: "Delve into focused subjects—whether it's Islamic jurisprudence, ethics, or historical events.",
    value: "topics",
    icon: <Star className="h-6 w-6" />
  },
  {
    title: "Seeking Spiritual Motivation",
    description: "Find inspiration and encouragement to strengthen your faith and overcome daily challenges.",
    value: "motivation",
    icon: <Sparkles className="h-6 w-6" />
  },
  {
    title: "Practical Guidance for Everyday Life",
    description: "Discover how Islamic teachings can help navigate modern life's dilemmas and improve personal decision-making.",
    value: "guidance",
    icon: <MessageSquare className="h-6 w-6" />
  },
  {
    title: "Fostering Community Connection",
    description: "Engage with the communal aspects of worship, feeling part of a supportive and like-minded group.",
    value: "community",
    icon: <Users className="h-6 w-6" />
  },
  {
    title: "Encouraging Personal Reflection and Growth",
    description: "Use the insights shared to reflect on personal behaviors, improve character, and pursue self-improvement.",
    value: "reflection",
    icon: <Star className="h-6 w-6" />
  }
];

const testimonials = [
  {
    name: "Ahmed Hassan",
    role: "Student",
    content: "These AI-generated sermons have helped me understand complex Islamic concepts in a way that's easy to comprehend. The audio quality is excellent!"
  },
  {
    name: "Fatima Ali",
    role: "Teacher",
    content: "As an educator, I find these sermons to be well-researched and thoughtfully prepared. They serve as excellent supplementary material for my classes."
  },
  {
    name: "Ibrahim Khan",
    role: "Community Leader",
    content: "Our community has benefited greatly from this resource. The variety of topics covered helps address the diverse needs of our members."
  }
];

const features = [
  {
    title: "AI-Generated Content",
    description: "Leveraging advanced AI to create meaningful, accurate, and inspiring Islamic sermons",
    icon: <Sparkles className="h-10 w-10 text-primary" />
  },
  {
    title: "High-Quality Audio",
    description: "Clear, professionally narrated sermons with optional background sounds for an immersive experience",
    icon: <Volume2 className="h-10 w-10 text-primary" />
  },
  {
    title: "Diverse Topics",
    description: "Explore a wide range of subjects from fundamentals to specific theological discussions",
    icon: <BookOpen className="h-10 w-10 text-primary" />
  },
  {
    title: "Community Focus",
    description: "Content designed to strengthen community bonds and foster collective spiritual growth",
    icon: <Users className="h-10 w-10 text-primary" />
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
    const fullUrl = `${API_BASE_URL}${audioPath}`;
    setAudioPreview({url: fullUrl, title});
    
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
      
      <section className="relative py-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 z-0"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Islamic AI Sermons
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Discover a new way to connect with Islamic teachings through AI-generated sermons that inspire, educate, and uplift your spiritual journey.
            </p>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleCreateNew}
                className="animate-pulse-subtle text-lg px-8 py-6 h-auto"
                size="lg"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Generate New Sermon
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6 bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Why Choose Our Platform</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered Islamic sermons provide unique benefits designed to enhance your spiritual learning experience.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border border-primary/10 bg-card/60 backdrop-blur-sm hover:shadow-md transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-6">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl mb-3 text-center">{feature.title}</CardTitle>
                  <CardDescription className="text-center">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Explore Sermon Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse through our comprehensive collection of sermon categories tailored to address various aspects of Islamic teachings.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <CategoryCard 
                key={category.value}
                title={category.title}
                description={category.description}
                onClick={() => handleCategoryClick(category.value)}
                index={index}
                icon={category.icon}
              />
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-secondary/20 to-primary/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Generating a personalized Islamic sermon is simple and straightforward with our intuitive process.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a Category</h3>
              <p className="text-muted-foreground">Choose from our diverse categories of Islamic teachings that resonate with your interests.</p>
            </div>
            
            <div className="flex flex-col items-center text-center animate-fade-in delay-100">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Customize Options</h3>
              <p className="text-muted-foreground">Tailor the sermon to your preferences with our customization options.</p>
            </div>
            
            <div className="flex flex-col items-center text-center animate-fade-in delay-200">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Listen & Learn</h3>
              <p className="text-muted-foreground">Immerse yourself in the generated sermon, available in high-quality audio format.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Users Say</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Hear from our community about how AI Islamic sermons have enriched their spiritual journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-primary/10 bg-card/60 hover:shadow-md transition-all duration-300 animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <p className="italic mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-16 px-4 sm:px-6 bg-primary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Spiritual Journey?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
            Generate your first Islamic sermon today and experience the power of AI-enhanced spiritual learning.
          </p>
          <Button 
            onClick={handleCreateNew}
            size="lg"
            className="text-lg px-8 py-6 h-auto animate-pulse-subtle"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Generate Your First Sermon
          </Button>
        </div>
      </section>
      
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Islamic AI Sermons. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact
              </Link>
              <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
      
      <GenerateKhutabModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen}
        selectedCategory={selectedCategory}
      />

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
