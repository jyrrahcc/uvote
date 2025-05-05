
import PageLayout from "@/components/layout/PageLayout";
import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    document.title = "Terms of Service | uVote";
  }, []);

  return (
    <PageLayout>
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Last updated: May 5, 2025
        </p>

        <div className="prose prose-slate max-w-none">
          <p>
            Welcome to uVote. These Terms of Service ("Terms") govern your access to and use of the uVote platform and services. 
            Please read these Terms carefully before using uVote.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p>
            By accessing or using uVote, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, 
            please do not use uVote.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Services Description</h2>
          <p>
            uVote provides a platform for creating, managing, and participating in secure online elections and voting processes. 
            Our services include but are not limited to:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Creating and managing elections</li>
            <li>Setting up candidates and voting options</li>
            <li>Distributing access to eligible voters</li>
            <li>Processing and tallying votes</li>
            <li>Displaying and reporting election results</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
          <p>
            To use certain features of uVote, you may need to create an account. You are responsible for:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Providing accurate and complete information when creating your account</li>
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use of your account</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Conduct</h2>
          <p>
            When using uVote, you agree not to:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on the rights of others</li>
            <li>Attempt to manipulate election results or engage in fraudulent voting</li>
            <li>Use the service to distribute spam, malware, or other harmful content</li>
            <li>Attempt to disrupt or compromise the security of the platform</li>
            <li>Use automated means to access or interact with the service without our permission</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Intellectual Property</h2>
          <p>
            All content and materials available on uVote, including but not limited to the logo, design, text, graphics, 
            and software, are the property of uVote or its licensors and are protected by copyright, trademark, and other 
            intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Privacy</h2>
          <p>
            Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information. 
            By using uVote, you agree to our collection and use of information as described in the Privacy Policy.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, uVote shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
            or any loss of data, use, goodwill, or other intangible losses resulting from:
          </p>
          <ul className="list-disc pl-6 my-4 space-y-2">
            <li>Your use or inability to use uVote</li>
            <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
            <li>Any interruption or cessation of transmission to or from uVote</li>
            <li>Any bugs, viruses, or other harmful code that may be transmitted by any third party</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Modifications to the Terms</h2>
          <p>
            We may revise these Terms from time to time. The most current version will always be posted on our website. 
            By continuing to use uVote after any changes, you accept the revised Terms.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Termination</h2>
          <p>
            We may terminate or suspend your access to uVote immediately, without prior notice or liability, for any reason, 
            including if you breach these Terms. Upon termination, your right to use uVote will cease immediately.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at support@uvote.com.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default Terms;
