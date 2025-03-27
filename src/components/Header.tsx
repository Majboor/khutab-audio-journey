
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-10 glass px-4 py-4 animate-fade-in">
      <div className="container mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-semibold tracking-tight text-primary transition-transform duration-300 hover:scale-[1.02] flex items-center"
        >
          <span className="mr-2">✨</span>
          <span>Islamic Sermons</span>
        </Link>
        
        <nav className="hidden md:flex space-x-6">
          <Link to="/" className="text-sm font-medium text-primary/80 transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/library" className="text-sm font-medium text-primary/80 transition-colors hover:text-primary">
            Library
          </Link>
          <Link to="/about" className="text-sm font-medium text-primary/80 transition-colors hover:text-primary">
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
