/**
 * CMAMSys Homepage
 * Landing page for CompetiMath AutoModel System
 */

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Rocket,
  Database,
  BrainCircuit,
  Shield,
  Zap,
  Users,
  BarChart3,
  FileText,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-20 sm:py-32">
          <div className="flex flex-col items-center text-center">
            {/* Logo */}
            <div className="mb-8">
              <img
                src="/logo-withtext.svg"
                alt="CMAMSys Logo"
                className="h-32 w-auto object-contain dark:invert"
              />
            </div>

            <div className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="mr-2 h-4 w-4" />
              Enterprise-Grade Mathematical Modeling Platform
            </div>

            <h1 className="mb-6 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
              CompetiMath AutoModel System
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Automated mathematical modeling platform for individuals and teams.
              Build, train, and deploy models with enterprise-grade security.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/auth/register">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Rocket className="h-5 w-5 text-primary" />
                <span>Automated Pipeline</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Powerful Features</h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to excel in mathematical modeling competitions
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <BrainCircuit className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Automated Modeling</CardTitle>
              <CardDescription>
                Complete pipeline from data preprocessing to model training, evaluation, and report generation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Database className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Multi-Algorithm Support</CardTitle>
              <CardDescription>
                Scikit-learn, XGBoost, LightGBM, PyTorch integration for diverse modeling needs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Competition Templates</CardTitle>
              <CardDescription>
                Pre-configured for MCM, ICM, CUMCM, and 10+ other competitions worldwide
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Learning Module</CardTitle>
              <CardDescription>
                Automated learning from Bilibili and user-provided materials to build knowledge base
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Enterprise Security</CardTitle>
              <CardDescription>
                JWT authentication, MFA, SSO, and comprehensive anti-attack measures
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Real-Time Monitoring</CardTitle>
              <CardDescription>
                Live task execution logs, AI thinking process visualization, and real-time progress tracking
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Supported Competitions */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Supported Competitions
            </h2>
            <p className="text-lg text-muted-foreground">
              Optimized for major mathematical modeling competitions worldwide
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              'MCM / ICM',
              'CUMCM',
              'Shenzhen Cup',
              'IMMC',
              'MathorCup',
              'EMMC',
              'TeddyCup',
              'BlueBridge Math',
            ].map((competition) => (
              <div
                key={competition}
                className="rounded-lg border bg-card p-4 text-center transition-colors hover:bg-accent"
              >
                <span className="font-semibold">{competition}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
            Ready to Excel in Competitions?
          </h2>
          <p className="mb-8 max-w-2xl mx-auto text-lg text-muted-foreground">
            Join thousands of students and researchers who trust CMAMSys for their mathematical modeling needs
          </p>
          <Button size="lg" asChild>
            <Link href="/auth/register">Start Building Now</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              © 2026 CMAMSys. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link href="/docs" className="hover:text-foreground">
                Documentation
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
