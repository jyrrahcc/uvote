
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Enhanced Footer component for site-wide footer content
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary mt-auto">
      {/* Main footer content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Link to="/" className="flex items-center">
              <span className="text-primary font-bold text-2xl">u</span>
              <span className="text-2xl font-bold">Vote</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Secure, transparent, and easy-to-use voting platform for elections of all sizes.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={18} />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={18} />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={18} />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="mailto:info@uvote.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail size={18} />
                <span className="sr-only">Mail</span>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/security" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Security
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors flex items-center">
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base font-semibold mb-4">Subscribe</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Stay updated with the latest features and election news.
            </p>
            <div className="flex gap-2">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="h-10 text-sm"
              />
              <Button type="submit" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright section */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} uVote. All rights reserved.
            </p>
            <div className="flex mt-4 md:mt-0 space-x-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Home</Link>
              <Link to="/elections" className="text-sm text-muted-foreground hover:text-primary">Elections</Link>
              <Link to="/how-it-works" className="text-sm text-muted-foreground hover:text-primary">How It Works</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
