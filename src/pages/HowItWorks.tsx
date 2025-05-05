
import PageLayout from "@/components/layout/PageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Check, ListChecks, ShieldCheck, User, Users, Vote } from "lucide-react";

/**
 * How it works page explaining the platform
 */
const HowItWorks = () => {
  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">How uVote Works</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our secure platform makes it easy to run elections of any size while maintaining integrity and transparency.
          </p>
        </div>

        <Tabs defaultValue="voters" className="max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="voters">For Voters</TabsTrigger>
            <TabsTrigger value="organizers">For Organizers</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          <TabsContent value="voters">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary" />
                    The Voter Experience
                  </h2>
                  
                  <ol className="relative border-l border-muted pl-8 space-y-8">
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Create Your Account</h3>
                      <p className="text-muted-foreground mt-2">
                        Sign up with your email address and create a secure password. Your personal information is kept private.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Access Your Election</h3>
                      <p className="text-muted-foreground mt-2">
                        Use the election link you've received or find public elections on the platform. For private elections, enter your access code.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Review Candidates</h3>
                      <p className="text-muted-foreground mt-2">
                        View detailed information about each candidate, including their bio, platform, and qualifications.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Cast Your Vote</h3>
                      <p className="text-muted-foreground mt-2">
                        Make your selection securely. Your vote is encrypted and anonymized to ensure privacy.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Get Confirmation</h3>
                      <p className="text-muted-foreground mt-2">
                        Receive a confirmation that your vote has been recorded, while maintaining anonymity.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">View Results</h3>
                      <p className="text-muted-foreground mt-2">
                        Once the election concludes, results are displayed with visual charts and detailed breakdowns.
                      </p>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="organizers">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <Users className="mr-2 h-5 w-5 text-primary" />
                    For Election Organizers
                  </h2>
                  
                  <ol className="relative border-l border-muted pl-8 space-y-8">
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Create an Election</h3>
                      <p className="text-muted-foreground mt-2">
                        Define your election details including title, description, start and end dates, and privacy settings.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Add Candidates</h3>
                      <p className="text-muted-foreground mt-2">
                        Input candidate information, upload photos, and add detailed descriptions of their platforms or qualifications.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Configure Settings</h3>
                      <p className="text-muted-foreground mt-2">
                        Customize voter eligibility, ballot design, and result display options according to your needs.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Invite Voters</h3>
                      <p className="text-muted-foreground mt-2">
                        Send invitations via email or share access codes for private elections. Monitor participation rates.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Monitor Progress</h3>
                      <p className="text-muted-foreground mt-2">
                        Track participation rates and engagement throughout the voting period without seeing individual votes.
                      </p>
                    </li>
                    <li className="step relative">
                      <h3 className="font-semibold pl-2">Analyze Results</h3>
                      <p className="text-muted-foreground mt-2">
                        Access comprehensive analytics and export data when the election concludes for transparency and record-keeping.
                      </p>
                    </li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center">
                    <ShieldCheck className="mr-2 h-5 w-5 text-primary" />
                    Security & Integrity
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="mr-4 mt-0.5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">End-to-End Encryption</h3>
                          <p className="text-muted-foreground mt-1">
                            All votes are encrypted from the moment they're cast to ensure they cannot be tampered with.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4 mt-0.5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Voter Anonymity</h3>
                          <p className="text-muted-foreground mt-1">
                            The system separates voter identity from their ballot to maintain complete anonymity.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4 mt-0.5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Audit Trails</h3>
                          <p className="text-muted-foreground mt-1">
                            Comprehensive logs of election activity are maintained for verification without compromising privacy.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex">
                        <div className="mr-4 mt-0.5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Authentication</h3>
                          <p className="text-muted-foreground mt-1">
                            Multi-factor authentication options ensure only eligible voters can access your elections.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4 mt-0.5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Protection Against Fraud</h3>
                          <p className="text-muted-foreground mt-1">
                            Advanced protection against duplicate voting and unauthorized access to maintain election integrity.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex">
                        <div className="mr-4 mt-0.5">
                          <Check className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Compliance</h3>
                          <p className="text-muted-foreground mt-1">
                            Our system meets industry standards for data protection and security compliance.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
};

export default HowItWorks;
