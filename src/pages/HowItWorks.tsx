
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PageLayout from "@/components/layout/PageLayout";
import { CheckCircle, ArrowRight, HelpCircle, Search, VoteIcon, Users, BarChart3 } from "lucide-react";
import { useEffect } from "react";

const HowItWorks = () => {
  useEffect(() => {
    document.title = "How It Works | uVote";
  }, []);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-r from-secondary/50 to-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-primary/5 bg-[length:20px_20px]"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How uVote Works</h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              uVote provides a secure, transparent platform for creating and managing
              elections of all sizes. Learn how our system works below.
            </p>
            <Button className="bg-primary hover:bg-primary/90" size="lg" asChild>
              <Link to="/register">Get Started for Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <VoteIcon className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Create Your Election</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Setting up an election is simple. Define the title, description, voting period,
                and access settings. You can create both public and private elections with custom
                access codes for selective participation.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Customize election details and duration</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Set public or private access controls</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Add candidates with profiles and positions</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-border">
              <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center mb-4">
                <VoteIcon className="h-16 w-16 text-primary/50" />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-secondary/40 rounded-md w-2/3"></div>
                <div className="h-4 bg-secondary/30 rounded-md"></div>
                <div className="h-4 bg-secondary/30 rounded-md w-4/5"></div>
                <div className="h-10 bg-secondary/50 rounded-md"></div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div className="order-2 md:order-1 bg-white rounded-xl shadow-md p-6 border border-border">
              <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-16 w-16 text-primary/50" />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-secondary/40 rounded-md w-1/2"></div>
                <div className="h-4 bg-secondary/30 rounded-md"></div>
                <div className="h-4 bg-secondary/30 rounded-md w-3/4"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-10 bg-secondary/50 rounded-md"></div>
                  <div className="h-10 bg-secondary/40 rounded-md"></div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Invite Voters</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Share your election with voters using a direct link or access code. Our platform
                ensures that each voter can only vote once, maintaining the integrity of your election.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Share election links via email or messaging</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Provide private access codes for secure voting</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>One vote per user ensures fair participation</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold">Track Results</h2>
              </div>
              <p className="text-muted-foreground mb-6">
                Monitor real-time voting statistics and results. After your election concludes,
                review detailed breakdowns and export data for further analysis.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>View real-time voting progress</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Access detailed results after election closing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>Export results for reporting and transparency</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-border">
              <div className="aspect-video bg-secondary/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-16 w-16 text-primary/50" />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-secondary/40 rounded-md w-3/5"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="h-4 bg-secondary/30 rounded-md mb-2"></div>
                    <div className="h-20 bg-primary/30 rounded-md"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-secondary/30 rounded-md mb-2"></div>
                    <div className="h-12 bg-primary/20 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built with Security in Mind</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform incorporates multiple layers of security to ensure the integrity
              and confidentiality of every election.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voter Authentication</h3>
              <p className="text-muted-foreground">
                Secure user accounts with email verification and optional access codes 
                provide multiple layers of authentication.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparent Auditing</h3>
              <p className="text-muted-foreground">
                Complete audit trails and voter verification receipts ensure
                the integrity of each election can be verified.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Data Protection</h3>
              <p className="text-muted-foreground">
                All data is encrypted in transit and at rest, with strict access controls
                protecting sensitive information.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 bg-primary text-white text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Election?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of organizations using uVote for secure, transparent elections of all types and sizes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/register">
                Create Your Account
              </Link>
            </Button>
            <Button 
              size="lg" 
              className="bg-secondary text-primary hover:bg-secondary/80 border border-white/20" 
              asChild
            >
              <Link to="/security">
                Learn About Security
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default HowItWorks;
