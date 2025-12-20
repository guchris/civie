import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileText, Shield, ArrowLeft } from "lucide-react";
import { BackButton } from "@/components/back-button";

export const metadata: Metadata = {
  title: "Terms of Service | Civie",
  description: "Terms of Service for Civie - Your say, every day. Anonymous civic dialogue.",
};

export default function TermsPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">civie</span>
          </Link>
          <div className="flex items-center gap-1">
            <Link
              href="/terms"
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground"
              )}
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Terms of Service</span>
            </Link>
            <Link
              href="/privacy"
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Privacy Policy</span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Top row with back button and last updated */}
        <div className="mb-8 flex items-center justify-between">
          <BackButton />
          <div className="rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </div>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        </div>

      <Card className="shadow-none">
        <CardContent className="pt-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              By accessing or using Civie ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
              If you disagree with any part of these terms, you may not access the Service. These Terms apply to all 
              visitors, users, and others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Civie is a daily civic engagement platform that provides users with the opportunity to answer questions 
              on civic and political topics. The Service allows users to:
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-4">
              <li>Answer daily questions on civic and political topics</li>
              <li>View anonymized, aggregated results from other users' responses</li>
              <li>Access historical question results and demographic breakdowns</li>
              <li>Maintain a personal account to track participation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. User Accounts and Registration</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p>
                You must be at least 18 years old to use the Service. By using the Service, you represent and warrant 
                that you are at least 18 years of age.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. Identity Verification</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Civie requires identity verification to ensure data integrity and prevent abuse of the Service. You agree 
              to provide accurate demographic information (including birth date, gender, race/ethnicity, and zip code) 
              for verification purposes. This information is used solely for verification and demographic aggregation 
              and is not linked to your individual responses, which remain anonymous.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. User Conduct</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-4">
              <li>Use the Service for any illegal purpose or in violation of any laws</li>
              <li>Attempt to manipulate, game, or abuse the Service or its results</li>
              <li>Create multiple accounts to influence results</li>
              <li>Attempt to reverse engineer, decompile, or disassemble any part of the Service</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service</li>
              <li>Use automated systems, bots, or scripts to access or use the Service</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Violate any applicable local, state, national, or international law or regulation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. Anonymity and Data Collection</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Civie is designed to protect your anonymity. While we verify your identity to ensure data integrity, 
              your individual responses are stored anonymously and are not linked to your personal information. 
              Results are published only as anonymized aggregates with demographic breakdowns. For more information 
              about how we collect, use, and protect your data, please review our{" "}
              <Link href="/privacy" className="text-primary underline hover:no-underline">
                Privacy Policy
              </Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. Intellectual Property</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                The Service and its original content, features, and functionality are owned by Civie and are protected 
                by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p>
                You retain ownership of any content you submit through the Service. By submitting content, you grant 
                Civie a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, and 
                distribute your content solely for the purpose of operating and improving the Service, including 
                aggregating responses in anonymized form.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. Aggregated Data</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Civie may publish anonymized, aggregated data derived from user responses. This aggregated data may 
              include demographic breakdowns and statistical summaries. You acknowledge that once your response is 
              aggregated with other responses, it becomes part of the aggregated dataset and may be used by Civie 
              for research, publication, or other purposes consistent with our mission of promoting civic engagement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. Service Availability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We strive to provide a reliable Service, but we do not guarantee that the Service will be available 
              at all times or that it will be free from errors, interruptions, or defects. We reserve the right to 
              modify, suspend, or discontinue the Service (or any part thereof) at any time with or without notice. 
              We shall not be liable to you or any third party for any modification, suspension, or discontinuation 
              of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. Termination</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice 
              or liability, for any reason, including if you breach these Terms. Upon termination, your right to use 
              the Service will immediately cease. If you wish to terminate your account, you may discontinue using 
              the Service or contact us to request account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">11. Disclaimer of Warranties</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR 
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR 
              PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">12. Limitation of Liability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CIVIE, ITS AFFILIATES, AGENTS, 
              DIRECTORS, EMPLOYEES, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR EXEMPLARY DAMAGES, INCLUDING WITHOUT LIMITATION DAMAGES FOR LOSS OF PROFITS, GOODWILL, 
              USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATING TO THE USE OF, OR INABILITY TO USE, 
              THE SERVICE.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">13. Indemnification</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              You agree to defend, indemnify, and hold harmless Civie and its affiliates, officers, directors, 
              employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including 
              without limitation reasonable legal and accounting fees, arising out of or in any way connected with your 
              access to or use of the Service or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">14. Dispute Resolution</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                <strong>Informal Resolution:</strong> Before filing a claim, you agree to try to resolve the dispute 
                informally by contacting us. We'll try to resolve the dispute informally by contacting you via email.
              </p>
              <p>
                <strong>Binding Arbitration:</strong> If we can't resolve the dispute informally, you and Civie agree 
                to resolve any claims relating to these Terms or the Service through final and binding arbitration, 
                except as set forth below. The American Arbitration Association (AAA) will administer the arbitration 
                under its Commercial Arbitration Rules. The arbitration will be held in the United States, in the 
                state where Civie operates, or any other location we agree to.
              </p>
              <p>
                <strong>Exceptions:</strong> You may opt out of this arbitration agreement within 30 days of first 
                accepting these Terms by sending us written notice. Either party may bring a lawsuit solely for 
                injunctive relief to stop unauthorized use or abuse of the Service, or intellectual property 
                infringement, without first engaging in the informal dispute resolution process described above.
              </p>
              <p>
                <strong>Class Action Waiver:</strong> You and Civie agree that any dispute resolution proceedings will 
                be conducted only on an individual basis and not in a class, consolidated, or representative action. 
                If for any reason a claim proceeds in court rather than in arbitration, you and Civie each waive any 
                right to a jury trial.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">15. Governing Law</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the State of California, 
              United States, without regard to its conflict of law provisions. Any disputes arising under or in 
              connection with these Terms shall be subject to the exclusive jurisdiction of the state and federal 
              courts located in California, except as provided in the Dispute Resolution section above.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">16. Beta Service Disclaimer</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The Service is currently in beta testing. As a beta service, the Service may contain bugs, errors, and 
              other issues that could cause system failures, data loss, or other problems. You acknowledge that the 
              Service is provided "as is" and may not be fully functional. We reserve the right to modify, suspend, 
              or discontinue any aspect of the Service at any time during the beta period. Your use of the beta Service 
              is at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">17. Third-Party Services and Links</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The Service may contain links to third-party websites, services, or resources that are not owned or 
              controlled by Civie. We have no control over, and assume no responsibility for, the content, privacy 
              policies, or practices of any third-party websites or services. You acknowledge and agree that Civie 
              shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to 
              be caused by or in connection with the use of or reliance on any such content, goods, or services available 
              on or through any such websites or services. We strongly advise you to read the terms and conditions and 
              privacy policies of any third-party websites or services that you visit.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">18. Electronic Communications</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              When you use the Service or send emails to us, you are communicating with us electronically. You consent 
              to receive communications from us electronically. We may communicate with you by email or by posting 
              notices on the Service. You agree that all agreements, notices, disclosures, and other communications that 
              we provide to you electronically satisfy any legal requirement that such communications be in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">19. Export Restrictions</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The Service may be subject to export control laws and regulations. You agree that you will not, directly 
              or indirectly, export, re-export, or transfer the Service to any country, person, or entity subject to 
              U.S. or other applicable export restrictions, including without limitation any country subject to an 
              embargo or any person or entity on a restricted party list.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">20. Geographic Restrictions</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              The Service is intended for use in the United States. We make no claims that the Service is accessible 
              or appropriate outside of the United States. Access to the Service may not be legal by certain persons or 
              in certain countries. If you access the Service from outside the United States, you do so on your own 
              initiative and are responsible for compliance with local laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">21. Force Majeure</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We shall not be liable for any failure or delay in performance under these Terms which is due to 
              earthquake, fire, flood, act of God, act of war, terrorism, epidemic, pandemic, labor dispute, 
              government action, internet or telecommunications failure, or other cause which is beyond our reasonable 
              control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">22. Assignment</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              You may not assign or transfer these Terms, by operation of law or otherwise, without our prior written 
              consent. Any attempt by you to assign or transfer these Terms without such consent will be null and void. 
              We may freely assign or transfer these Terms without restriction. Subject to the foregoing, these Terms 
              will bind and inure to the benefit of the parties, their successors, and permitted assigns.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">23. Waiver</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              Our failure to enforce any right or provision of these Terms will not be considered a waiver of those 
              rights. If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining 
              provisions of these Terms will remain in effect.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">24. Changes to Terms</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision 
              is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes 
              a material change will be determined at our sole discretion. By continuing to access or use the Service 
              after those revisions become effective, you agree to be bound by the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">25. DMCA Copyright Policy</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
              <p>
                Civie respects the intellectual property rights of others and expects users to do the same. In 
                accordance with the Digital Millennium Copyright Act (DMCA), we will respond to notices of alleged 
                copyright infringement that comply with the DMCA and other applicable laws.
              </p>
              <p>
                If you believe that your copyrighted work has been copied in a way that constitutes copyright 
                infringement, please provide our Copyright Agent with the following information:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                <li>Identification of the copyrighted work claimed to have been infringed</li>
                <li>Identification of the material that is claimed to be infringing and information reasonably 
                    sufficient to permit us to locate the material</li>
                <li>Your contact information, including address, telephone number, and email address</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized</li>
                <li>A statement that the information in the notification is accurate and, under penalty of perjury, 
                    that you are authorized to act on behalf of the copyright owner</li>
              </ul>
              <p>
                Our Copyright Agent for notice of claims of copyright infringement can be reached through the contact 
                information provided on our website.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">26. Severability</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              If any provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions 
              of these Terms will remain in effect. These Terms constitute the entire agreement between you and Civie 
              regarding our Service and supersede and replace any prior agreements we might have between us regarding the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">27. Contact Information</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-4">
              If you have any questions about these Terms of Service, please contact us through the Service or at 
              the contact information provided on our website.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}

