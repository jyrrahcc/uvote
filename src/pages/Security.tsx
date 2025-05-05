
import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, FileCheck, Server, Eye, Users, CheckSquare } from "lucide-react";
import { useEffect } from "react";

const Security = () => {
  useEffect(() => {
    document.title = "Security | uVote";
  }, []);

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-2">Security</h1>
        <p className="text-muted-foreground text-lg mb-10">
          How we protect your data and ensure election integrity
        </p>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <CardTitle>Our Security Commitment</CardTitle>
              </div>
              <CardDescription>
                Security is at the core of our platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                At uVote, we understand that the integrity and security of elections is paramount. 
                Our platform is built with security as the foundation, ensuring that your voting 
                process remains trustworthy, transparent, and tamper-resistant.
              </p>
              <p>
                We employ industry-leading security practices and continuously improve our 
                safeguards to protect against emerging threats.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary" />
                  <CardTitle>Data Encryption</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  All data transmitted between your browser and our servers is encrypted using TLS. 
                  Additionally, sensitive information is encrypted at rest using AES-256 encryption.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileCheck className="h-6 w-6 text-primary" />
                  <CardTitle>Vote Verification</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Our platform provides confirmation receipts for every vote cast, allowing voters to 
                  verify their votes were correctly recorded without compromising ballot secrecy.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Server className="h-6 w-6 text-primary" />
                  <CardTitle>Infrastructure Security</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Our infrastructure is hosted on secure cloud platforms with multiple layers of protection, 
                  including firewalls, intrusion detection, and regular security audits.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  <CardTitle>Transparent Process</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p>
                  Our voting system is designed for transparency, allowing for verification of results 
                  while maintaining the privacy of individual voters.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle>Access Controls</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Role-based access control ensures only authorized administrators can manage elections</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Multi-factor authentication available for administrative accounts</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Private elections can be protected with access codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckSquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Comprehensive audit logs track all system activities</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default Security;
