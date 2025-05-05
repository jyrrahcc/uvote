
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const blogPosts = [
  {
    id: "1",
    title: "Enhancing Election Security in the Digital Age",
    excerpt: "As voting increasingly moves online, ensuring security and integrity becomes more critical than ever. Learn about the latest security measures in digital voting.",
    author: "Jane Cooper",
    role: "Security Specialist",
    date: "May 1, 2025",
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2072&q=80",
    category: "Security"
  },
  {
    id: "2",
    title: "The Future of Democratic Participation",
    excerpt: "Online voting platforms are changing how people engage with democratic processes. Discover how technology is making participation more accessible.",
    author: "Alex Morgan",
    role: "Political Analyst",
    date: "April 22, 2025",
    imageUrl: "https://images.unsplash.com/photo-1605902394697-1fe0eb10aad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
    category: "Trends"
  },
  {
    id: "3",
    title: "Best Practices for Running Fair Elections",
    excerpt: "Whether you're organizing a student council vote or a corporate board election, follow these guidelines to ensure a fair and transparent process.",
    author: "Marcus Johnson",
    role: "Election Coordinator",
    date: "April 15, 2025",
    imageUrl: "https://images.unsplash.com/photo-1519452575417-564c1401ecc0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "Guide"
  },
  {
    id: "4",
    title: "How Blockchain is Revolutionizing Voting Systems",
    excerpt: "Blockchain technology offers unprecedented transparency and security for voting systems. Learn how this technology is being implemented.",
    author: "Samantha Lee",
    role: "Technology Researcher",
    date: "April 8, 2025",
    imageUrl: "https://images.unsplash.com/photo-1639762681057-408e52192e55?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "Technology"
  },
  {
    id: "5",
    title: "Case Study: University Student Government Elections",
    excerpt: "How one university transformed their student elections with digital voting, increasing participation by 300% and improving transparency.",
    author: "David Wilson",
    role: "Education Consultant",
    date: "March 30, 2025",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "Case Study"
  },
  {
    id: "6",
    title: "Accessible Voting: Making Democracy Available to All",
    excerpt: "Digital voting platforms have the potential to make voting more accessible to people with disabilities. Here's how uVote is leading the way.",
    author: "Elena Rodriguez",
    role: "Accessibility Advocate",
    date: "March 23, 2025",
    imageUrl: "https://images.unsplash.com/photo-1560439514-4e9645039924?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    category: "Accessibility"
  }
];

const Blog = () => {
  useEffect(() => {
    document.title = "Blog | uVote";
  }, []);

  return (
    <PageLayout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">uVote Blog</h1>
          <p className="text-muted-foreground text-lg mb-10">
            Insights and updates on digital voting, election security, and democratic participation
          </p>

          {/* Featured post */}
          <div className="mb-12">
            <Card className="overflow-hidden">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="h-64 md:h-full bg-muted">
                  <img 
                    src={blogPosts[0].imageUrl} 
                    alt={blogPosts[0].title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8">
                  <span className="text-sm font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">
                    {blogPosts[0].category}
                  </span>
                  <h2 className="text-2xl font-bold mt-4">{blogPosts[0].title}</h2>
                  <p className="text-muted-foreground mt-3">{blogPosts[0].excerpt}</p>
                  <div className="flex items-center mt-4 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                      <span className="font-medium text-primary">
                        {blogPosts[0].author.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{blogPosts[0].author}</p>
                      <p className="text-sm text-muted-foreground">{blogPosts[0].date}</p>
                    </div>
                  </div>
                  <Button className="mt-2">
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Blog grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map(post => (
              <Card key={post.id} className="overflow-hidden flex flex-col">
                <div className="h-48 bg-muted">
                  <img 
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                  </div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <CardDescription className="text-sm">{post.excerpt}</CardDescription>
                </CardContent>
                <CardFooter className="pt-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                        <span className="font-medium text-primary text-xs">
                          {post.author.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs font-medium">{post.author}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">
                      Read More
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Blog;
