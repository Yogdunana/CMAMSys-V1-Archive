/**
 * License Activation Page
 * Activate or upgrade your license
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Key, Shield, Zap, Crown } from 'lucide-react';

export default function LicenseActivationPage() {
  const [licenseKey, setLicenseKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      // This would call an API to activate the license
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate license');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      id: 'community',
      name: 'Community',
      icon: Shield,
      color: 'bg-green-500',
      price: 'Free',
      description: 'For individual users and small projects',
      features: [
        'Basic Authentication',
        'Single User',
        'Up to 3 Competitions',
        'Basic Modeling',
        'Knowledge Base',
        'Community Support',
      ],
      current: true,
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Zap,
      color: 'bg-blue-500',
      price: '$49/month',
      description: 'For teams and growing organizations',
      features: [
        'Everything in Community',
        'Team Collaboration',
        'Unlimited Competitions',
        'Multiple AI Providers',
        'Advanced Modeling',
        'Email Notifications',
        'Priority Support',
        'Up to 10 Users',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      color: 'bg-purple-500',
      price: 'Custom',
      description: 'For large organizations with custom needs',
      features: [
        'Everything in Professional',
        'Unlimited Users',
        'White Label Customization',
        'SSO Integration',
        'Full API Access',
        'Dedicated Support',
        'Custom Training',
        'On-Premise Deployment',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Key className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">License Management</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Activate your license or upgrade to unlock advanced features for team collaboration,
            multiple AI providers, and enterprise-grade capabilities.
          </p>
        </div>

        {/* License Activation Form */}
        <div className="max-w-2xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Activate License</CardTitle>
              <CardDescription>
                Enter your license key to activate your CMAMSys license
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleActivate} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="border-green-500 text-green-700 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-700" />
                    <AlertDescription className="text-green-700">
                      License activated successfully! Your features have been unlocked.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="licenseKey">License Key</Label>
                  <Textarea
                    id="licenseKey"
                    placeholder="Enter your license key here..."
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Your license key should have been sent to your email after purchase
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Activating...' : 'Activate License'}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
                  ← Back to Settings
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Plans */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Choose Your Plan</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.current ? 'border-2 border-primary' : ''
                  }`}
                >
                  {plan.current && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Current Plan</Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${plan.color} text-white`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{plan.name}</CardTitle>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold">{plan.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.current ? (
                      <Button variant="outline" className="w-full" disabled>
                        Current Plan
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        asChild
                      >
                        <a href="https://cmamsys.com/pricing" target="_blank" rel="noopener noreferrer">
                          Upgrade to {plan.name}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: 'How do I get a license key?',
                a: 'You can purchase a license from our pricing page. After purchase, you will receive a license key via email.',
              },
              {
                q: 'Can I upgrade my plan later?',
                a: 'Yes! You can upgrade your plan at any time. Your license key will be updated automatically.',
              },
              {
                q: 'What happens when my license expires?',
                a: 'You will receive a notification before your license expires. You can renew your license to continue using advanced features.',
              },
              {
                q: 'Can I use multiple AI providers with Community plan?',
                a: 'No, multiple AI providers is a Professional feature. Community plan allows only basic modeling capabilities.',
              },
            ].map((faq, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="text-center mt-16 pb-8">
          <p className="text-muted-foreground mb-4">
            Need help choosing a plan or have questions?
          </p>
          <Button variant="outline" asChild>
            <a href="mailto:support@cmamsys.com">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
