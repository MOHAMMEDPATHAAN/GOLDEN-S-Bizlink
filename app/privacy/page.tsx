"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function PrivacyPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b-4 border-foreground sticky top-0 z-40">
        <div className="flex items-center gap-4 p-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted transition-colors border-2 border-transparent hover:border-foreground"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Privacy Policy</h1>
        </div>
      </header>

      <div className="p-4 max-w-3xl mx-auto pb-20">
        <div className="brutalist-card p-6 space-y-6">
          <div>
            <p className="text-sm text-muted-foreground">Last updated: May 2026</p>
          </div>

          <section>
            <h2 className="text-lg font-bold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              Golden techS ("we", "our", or "us") operates Bizlink. This Privacy Policy explains how we 
              collect, use, disclose, and safeguard your information when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">2. Information We Collect</h2>
            <h3 className="font-bold mb-2">Personal Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
              <li>Name, email address, and phone number</li>
              <li>Company information (name, address, industry)</li>
              <li>Profile photos and company logos</li>
              <li>Payment and billing information</li>
              <li>Tax identification numbers (for verification)</li>
            </ul>
            
            <h3 className="font-bold mb-2">Usage Information</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Device information and IP addresses</li>
              <li>Browser type and operating system</li>
              <li>Pages visited and features used</li>
              <li>Search queries and interactions</li>
              <li>Communication logs and messages</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Provide and maintain our services</li>
              <li>Process transactions and send related information</li>
              <li>Send promotional communications (with your consent)</li>
              <li>Improve our platform and user experience</li>
              <li>Detect and prevent fraud and abuse</li>
              <li>Comply with legal obligations</li>
              <li>Personalize your experience and recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">4. Information Sharing</h2>
            <p className="text-muted-foreground mb-2">We may share your information with:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong>Other Users:</strong> Your public profile and product listings are visible to other users</li>
              <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">5. Data Security</h2>
            <p className="text-muted-foreground">
              We implement industry-standard security measures to protect your information, including 
              encryption, secure servers, and access controls. However, no method of transmission over 
              the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">6. Your Rights</h2>
            <p className="text-muted-foreground mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">7. Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar tracking technologies to enhance your experience. You can 
              control cookie preferences through your browser settings. Disabling cookies may affect 
              some features of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">8. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide 
              services. We may retain certain information for legal compliance, dispute resolution, 
              and enforcement of agreements.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">9. International Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place for such transfers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">10. Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our services are not intended for individuals under 18 years of age. We do not knowingly 
              collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">11. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of significant 
              changes by email or through the platform.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3">12. Contact Us</h2>
            <p className="text-muted-foreground">
              For questions about this Privacy Policy or to exercise your rights, contact us at:
            </p>
            <div className="mt-2 p-3 bg-muted border-2 border-foreground">
              <p className="font-bold">Golden techS - Privacy Team</p>
              <p className="text-muted-foreground">Email: privacy@bizlink.app</p>
            </div>
          </section>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Golden techS - Bizlink Platform
        </p>
      </div>
    </div>
  )
}
