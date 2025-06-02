
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Linkedin, Twitter, Mail, Users, Shield, Vote, Heart } from "lucide-react";
import { toast } from "sonner";

interface Developer {
  id: string;
  name: string;
  role: string;
  bio: string | null;
  image_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  email: string | null;
  display_order: number;
  is_active: boolean;
}

const About = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevelopers();
  }, []);

  const fetchDevelopers = async () => {
    try {
      const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching developers:', error);
        toast.error('Failed to load developers');
        return;
      }

      setDevelopers(data || []);
    } catch (error) {
      console.error('Error fetching developers:', error);
      toast.error('Failed to load developers');
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'github':
        return <Github className="h-5 w-5" />;
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'email':
        return <Mail className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">About uVote</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            uVote is a secure, transparent, and user-friendly voting platform designed for 
            De La Salle University - Dasmariñas. We're committed to making democratic 
            participation accessible, reliable, and engaging for everyone.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <div className="flex items-center mb-4">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To provide a secure, transparent, and accessible digital voting platform 
              that empowers students, faculty, and staff to participate in democratic 
              processes with confidence and ease.
            </p>
          </Card>

          <Card className="p-8">
            <div className="flex items-center mb-4">
              <Vote className="h-8 w-8 text-primary mr-3" />
              <h2 className="text-2xl font-bold">Our Vision</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              To be the leading platform for educational institution elections, 
              fostering civic engagement and democratic participation in academic 
              communities worldwide.
            </p>
          </Card>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Security</h3>
              <p className="text-muted-foreground">
                Bank-level encryption and security measures to protect every vote
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-muted-foreground">
                Open processes and clear communication at every step
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
              <p className="text-muted-foreground">
                Easy-to-use interface designed for everyone
              </p>
            </div>
          </div>
        </section>

        {/* Developers Section */}
        {developers.length > 0 && (
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The passionate developers behind uVote, working to make democratic 
                participation more accessible and secure.
              </p>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading team members...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {developers.map((developer) => (
                  <Card key={developer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/20">
                          <AvatarImage src={developer.image_url || undefined} alt={developer.name} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg">
                            {developer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="text-xl font-semibold">{developer.name}</h3>
                        <Badge variant="secondary" className="mt-2">{developer.role}</Badge>
                      </div>

                      {developer.bio && (
                        <p className="text-muted-foreground text-sm text-center mb-4 leading-relaxed">
                          {developer.bio}
                        </p>
                      )}

                      <div className="flex justify-center space-x-3">
                        {developer.github_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={developer.github_url} target="_blank" rel="noopener noreferrer">
                              {getSocialIcon('github')}
                            </a>
                          </Button>
                        )}
                        {developer.linkedin_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={developer.linkedin_url} target="_blank" rel="noopener noreferrer">
                              {getSocialIcon('linkedin')}
                            </a>
                          </Button>
                        )}
                        {developer.twitter_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={developer.twitter_url} target="_blank" rel="noopener noreferrer">
                              {getSocialIcon('twitter')}
                            </a>
                          </Button>
                        )}
                        {developer.email && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={`mailto:${developer.email}`}>
                              {getSocialIcon('email')}
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Contact Section */}
        <section className="text-center bg-secondary/50 rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Have questions about uVote or need support? We're here to help you make 
            the most of our platform.
          </p>
          <Button asChild>
            <a href="mailto:support@uvote.edu">Contact Support</a>
          </Button>
        </section>
      </div>
    </PageLayout>
  );
};

export default About;
