import { Link } from 'react-router-dom';
import { CircleCheck, Zap, Users, TrendingUp } from 'lucide-react';

 function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl mb-6">
            Convert Meta Ad Leads into WhatsApp Conversations — Instantly
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            JarvisCalling.ai automatically fetches leads from your Meta ads, identifies interested prospects, and sends personalized WhatsApp messages in real time — so your sales team never misses a high-intent lead.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              to="/signup" 
              className="px-8 py-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Get Started
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 border border-border rounded-lg hover:bg-card transition-colors font-medium"
            >
              View How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="container mx-auto px-6 py-12">
        <p className="text-center text-muted-foreground">
          Trusted by performance marketers, agencies, and growing businesses.
        </p>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-heading">1</span>
            </div>
            <h3 className="text-2xl mb-4">Connect Your Meta Ads</h3>
            <p className="text-muted-foreground">
              Securely connect your Facebook and Instagram ad accounts to JarvisCalling.ai.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-heading">2</span>
            </div>
            <h3 className="text-2xl mb-4">Capture High-Intent Leads</h3>
            <p className="text-muted-foreground">
              We automatically fetch lead data and identify users who show genuine interest in your ads.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-heading">3</span>
            </div>
            <h3 className="text-2xl mb-4">Engage on WhatsApp Instantly</h3>
            <p className="text-muted-foreground">
              Personalized WhatsApp messages are sent automatically to start conversations while intent is highest.
            </p>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16">Key Benefits</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-card border border-border rounded-lg p-8">
            <Zap className="w-10 h-10 mb-4 text-foreground" />
            <h3 className="text-2xl mb-3">Real-Time Lead Engagement</h3>
            <p className="text-muted-foreground">
              Respond to leads within seconds — not hours.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <TrendingUp className="w-10 h-10 mb-4 text-foreground" />
            <h3 className="text-2xl mb-3">Higher Conversion Rates</h3>
            <p className="text-muted-foreground">
              WhatsApp conversations outperform traditional email and CRM follow-ups.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <CircleCheck className="w-10 h-10 mb-4 text-foreground" />
            <h3 className="text-2xl mb-3">Fully Automated Workflow</h3>
            <p className="text-muted-foreground">
              No manual exports. No missed leads. No delays.
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-8">
            <Users className="w-10 h-10 mb-4 text-foreground" />
            <h3 className="text-2xl mb-3">Built for Scale</h3>
            <p className="text-muted-foreground">
              Handle hundreds or thousands of daily leads effortlessly.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16">Use Cases</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            'Performance marketing teams',
            'Lead generation agencies',
            'Sales-driven businesses',
            'Coaches, consultants, and service providers'
          ].map((useCase, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6 text-center">
              <p className="text-foreground">{useCase}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-card border border-border rounded-lg p-12">
          <h2 className="text-3xl mb-4">Start converting Meta ad leads today.</h2>
          <p className="text-muted-foreground mb-8">
            Create your account and activate WhatsApp automation in minutes.
          </p>
          <Link 
            to="/signup" 
            className="inline-block px-8 py-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home