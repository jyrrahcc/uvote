
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Shield, Users, Vote, Clock, ChevronRight, BarChart3, Star, Lock } from "lucide-react";

/**
 * Enhanced How It Works page explaining the platform
 */
const HowItWorks = () => {
  return (
    <PageLayout>
      {/* Hero section */}
      <section className="relative bg-gradient-to-r from-primary to-primary/80 py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10 bg-[length:20px_20px]"></div>
        <div className="container relative mx-auto text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">How uVote Works</h1>
          <p className="text-xl max-w-2xl mx-auto opacity-90">
            A comprehensive guide to our secure, transparent voting platform
          </p>
        </div>
        
        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="fill-background">
            <path d="M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z"></path>
          </svg>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Your Journey with uVote</h2>
            
            <div className="space-y-12 relative">
              {/* Vertical line connecting steps */}
              <div className="absolute left-[25px] top-2 bottom-0 w-0.5 bg-primary/20 hidden md:block"></div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 relative">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold z-10 relative">
                    1
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Create Your Account
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Start by signing up for a free account. We'll ask for basic information to verify your identity 
                    and ensure secure access to the platform.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Simple registration process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Secure email verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Optional profile customization</span>
                    </li>
                  </ul>
                  <Button asChild className="mt-6">
                    <Link to="/register">Sign Up Now</Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 relative">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold z-10 relative">
                    2
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Vote className="h-6 w-6 text-primary" />
                    Set Up Your Election
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Create your election by defining all necessary parameters. Our intuitive interface makes it easy to set up even complex elections.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Define election title, description, and settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Add candidates with photos and biographies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Set voting period start and end dates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Configure public or private access controls</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 relative">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold z-10 relative">
                    3
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-6 w-6 text-primary" />
                    Invite Voters
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Share your election with voters using our built-in invitation system.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Email invitations with secure access links</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Optional access codes for additional security</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Public link sharing for open elections</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 relative">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold z-10 relative">
                    4
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="h-6 w-6 text-primary" />
                    Voting Period
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    During the active voting period, registered voters can cast their votes securely.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Simple and intuitive voting interface</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Encrypted, anonymous vote storage</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>One vote per user verification</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Mobile-friendly experience</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 relative">
                  <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold z-10 relative">
                    5
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-6 w-6 text-primary" />
                    View Results
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Once the voting period ends, results are automatically tabulated and displayed.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Real-time or post-election results display</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Visual charts and analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Exportable results for record-keeping</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5" />
                      <span>Transparent vote counting process</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security features */}
      <section className="py-20 px-4 bg-secondary/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Security & Transparency Features</h2>
          <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-16">
            We've implemented industry-leading security measures to ensure every vote counts and is protected
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all">
              <div className="bg-primary/10 rounded-full p-3 inline-block mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Encryption</h3>
              <p className="text-muted-foreground">
                All votes and user data are encrypted using industry-standard protocols to ensure maximum security.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all">
              <div className="bg-primary/10 rounded-full p-3 inline-block mb-4">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Verification</h3>
              <p className="text-muted-foreground">
                Multi-factor authentication and verification systems prevent fraud and ensure voter legitimacy.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all">
              <div className="bg-primary/10 rounded-full p-3 inline-block mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Counting</h3>
              <p className="text-muted-foreground">
                Our transparent counting process ensures accurate results while maintaining voter anonymity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium mb-2">Is my vote really anonymous?</h3>
              <p className="text-muted-foreground">
                Yes! While we verify your identity to prevent fraud, your actual vote is stored separately from your identifying information. No one can see who you voted for.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium mb-2">How much does it cost to use uVote?</h3>
              <p className="text-muted-foreground">
                We offer both free and premium plans. Basic elections are free, while more advanced features like custom branding and API access are available in our premium tiers.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium mb-2">Can I customize the look of my election?</h3>
              <p className="text-muted-foreground">
                Yes! Premium users can customize colors, logos, and the overall appearance of their election pages to match their organization's branding.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium mb-2">What types of elections can I run?</h3>
              <p className="text-muted-foreground">
                uVote supports a wide range of election types, from simple yes/no votes to multi-candidate elections, ranked-choice voting, and more.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-border">
              <h3 className="text-lg font-medium mb-2">Can I integrate uVote with other systems?</h3>
              <p className="text-muted-foreground">
                Yes! We offer API access for enterprise users to integrate with membership databases, internal systems, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 py-16 px-4 text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your First Election?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of organizations that trust uVote for their democratic processes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
                <Link to="/register">
                  Create Your Account
                  <ChevronRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/20" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorks;
