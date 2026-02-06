/**
 * Settings Page
 * Deployment configuration, license management, and system settings
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Cloud,
  Server,
  Key,
  Shield,
  Bell,
  Database,
  Lock,
  CheckCircle,
  Info,
  Globe,
} from 'lucide-react';
import { getCurrentLicense, getPlanDisplayName, PlanType } from '@/lib/license';
import { getDeploymentMode, DeploymentMode } from '@/lib/features';
import { FeatureFlag, getFeatureDisplayName } from '@/lib/license';
import { LanguageSelector } from '@/components/language-selector';

interface SystemSetting {
  key: string;
  value: string;
  category: string;
  description: string;
}

export default function SettingsPage() {
  const [deploymentMode, setDeploymentMode] = useState<DeploymentMode>(DeploymentMode.CLOUD);
  const [licenseInfo, setLicenseInfo] = useState(getCurrentLicense());
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDeploymentMode(getDeploymentMode());
    loadSettings();
  }, []);

  const loadSettings = async () => {
    // This would fetch settings from API
    setSettings([
      { key: 'app_name', value: 'CMAMSys', category: 'GENERAL', description: 'Application name' },
      { key: 'app_url', value: 'http://localhost:5000', category: 'GENERAL', description: 'Application URL' },
      { key: 'email_smtp_host', value: 'smtp.gmail.com', category: 'EMAIL', description: 'SMTP host' },
      { key: 'email_smtp_port', value: '587', category: 'EMAIL', description: 'SMTP port' },
      { key: 'storage_type', value: 'local', category: 'STORAGE', description: 'Storage backend' },
    ]);
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const getDeploymentModeBadge = (mode: DeploymentMode) => {
    switch (mode) {
      case DeploymentMode.CLOUD:
        return <Badge className="bg-blue-500"><Cloud className="w-3 h-3 mr-1" /> Cloud</Badge>;
      case DeploymentMode.SELF_HOSTED:
        return <Badge className="bg-green-500"><Server className="w-3 h-3 mr-1" /> Self-Hosted</Badge>;
      case DeploymentMode.SELF_HOSTED_PAID:
        return <Badge className="bg-purple-500"><Server className="w-3 h-3 mr-1" /> Self-Hosted (Paid)</Badge>;
    }
  };

  const coreFeatures = [
    { flag: FeatureFlag.BASIC_AUTH, name: 'Basic Authentication', available: true },
    { flag: FeatureFlag.DASHBOARD, name: 'Dashboard', available: true },
    { flag: FeatureFlag.SINGLE_USER, name: 'Single User', available: true },
    { flag: FeatureFlag.BASIC_MODELING, name: 'Basic Modeling', available: true },
    { flag: FeatureFlag.UP_TO_3_COMPETITIONS, name: 'Up to 3 Competitions', available: true },
    { flag: FeatureFlag.KNOWLEDGE_BASE, name: 'Knowledge Base', available: true },
  ];

  const professionalFeatures = [
    { flag: FeatureFlag.TEAM_COLLABORATION, name: 'Team Collaboration', available: false },
    { flag: FeatureFlag.UNLIMITED_COMPETITIONS, name: 'Unlimited Competitions', available: false },
    { flag: FeatureFlag.MULTIPLE_AI_PROVIDERS, name: 'Multiple AI Providers', available: false },
    { flag: FeatureFlag.ADVANCED_MODELING, name: 'Advanced Modeling', available: false },
    { flag: FeatureFlag.EMAIL_NOTIFICATIONS, name: 'Email Notifications', available: false },
  ];

  const enterpriseFeatures = [
    { flag: FeatureFlag.WHITE_LABEL, name: 'White Label', available: false },
    { flag: FeatureFlag.SSO_INTEGRATION, name: 'SSO Integration', available: false },
    { flag: FeatureFlag.API_ACCESS, name: 'API Access', available: false },
    { flag: FeatureFlag.ON_PREMISE_DEPLOYMENT, name: 'On-Premise Deployment', available: false },
  ];

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Configure your system settings, deployment mode, and license
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Information</CardTitle>
                <CardDescription>
                  Current deployment mode and system information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Deployment Mode</div>
                    <div className="text-sm text-muted-foreground">
                      {deploymentMode === DeploymentMode.CLOUD && 'Hosted on CMAMSys cloud infrastructure'}
                      {deploymentMode === DeploymentMode.SELF_HOSTED && 'Self-hosted with Community license'}
                      {deploymentMode === DeploymentMode.SELF_HOSTED_PAID && 'Self-hosted with paid license'}
                    </div>
                  </div>
                  {getDeploymentModeBadge(deploymentMode)}
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {deploymentMode === DeploymentMode.CLOUD
                      ? 'You are using the cloud-hosted version. All data is stored securely on CMAMSys servers.'
                      : 'You are using a self-hosted deployment. All data is stored on your own servers.'}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label>Application URL</Label>
                  <Input
                    value={deploymentMode === DeploymentMode.CLOUD ? 'https://cmamsys.com' : window.location.origin}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    This URL is used for redirects and API calls
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Environment</Label>
                  <Input value={process.env.NODE_ENV || 'development'} disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Configure application-wide settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <Label>Language</Label>
                  </div>
                  <LanguageSelector />
                  <p className="text-xs text-muted-foreground">
                    Select your preferred language for the interface
                  </p>
                </div>

                <div className="border-t pt-4">
                  <Label className="text-sm font-semibold">Advanced Settings</Label>
                </div>

                {settings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <Label htmlFor={setting.key}>{setting.key.replace(/_/g, ' ').toUpperCase()}</Label>
                    <Input
                      id={setting.key}
                      value={setting.value}
                      onChange={(e) => {
                        const newSettings = settings.map((s) =>
                          s.key === setting.key ? { ...s, value: e.target.value } : s
                        );
                        setSettings(newSettings);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                ))}

                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Settings'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Tab */}
          <TabsContent value="license" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>License Information</CardTitle>
                    <CardDescription>
                      View and manage your license
                    </CardDescription>
                  </div>
                  {licenseInfo.isValid ? (
                    <Badge className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <Lock className="w-3 h-3 mr-1" />
                      Invalid
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Plan Type</Label>
                    <div className="text-2xl font-bold mt-1">
                      {getPlanDisplayName(licenseInfo.plan)}
                    </div>
                  </div>

                  <div>
                    <Label>Days Until Expiry</Label>
                    <div className="text-2xl font-bold mt-1">
                      {licenseInfo.daysUntilExpiry}
                    </div>
                  </div>

                  {licenseInfo.organization && (
                    <div>
                      <Label>Organization</Label>
                      <div className="text-lg mt-1">{licenseInfo.organization}</div>
                    </div>
                  )}

                  {licenseInfo.maxUsers && (
                    <div>
                      <Label>Max Users</Label>
                      <div className="text-lg mt-1">{licenseInfo.maxUsers}</div>
                    </div>
                  )}
                </div>

                {licenseInfo.restrictions && (
                  <div className="space-y-2">
                    <Label>Restrictions</Label>
                    <div className="bg-muted p-4 rounded-lg space-y-1">
                      {licenseInfo.restrictions.maxCompetitions && (
                        <div className="text-sm">
                          Max Competitions: {licenseInfo.restrictions.maxCompetitions}
                        </div>
                      )}
                      {licenseInfo.restrictions.maxStorageGB && (
                        <div className="text-sm">
                          Max Storage: {licenseInfo.restrictions.maxStorageGB} GB
                        </div>
                      )}
                      {licenseInfo.restrictions.maxApiCallsPerMonth && (
                        <div className="text-sm">
                          Max API Calls: {licenseInfo.restrictions.maxApiCallsPerMonth} / month
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {licenseInfo.plan !== PlanType.ENTERPRISE && (
                    <Button asChild>
                      <Link href="/settings/license/activate">Upgrade License</Link>
                    </Button>
                  )}
                  <Button variant="outline">Refresh License</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Features</CardTitle>
                <CardDescription>
                  Features available in all plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {coreFeatures.map((feature) => (
                    <div key={feature.flag} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getFeatureDisplayName(feature.flag)}
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Features</CardTitle>
                <CardDescription>
                  Features available in Professional and Enterprise plans
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {professionalFeatures.map((feature) => (
                    <div key={feature.flag} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getFeatureDisplayName(feature.flag)}
                        </div>
                      </div>
                      {feature.available ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                {!professionalFeatures.some((f) => f.available) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Upgrade to Professional or Enterprise plan to unlock these features.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise Features</CardTitle>
                <CardDescription>
                  Features available in Enterprise plan only
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enterpriseFeatures.map((feature) => (
                    <div key={feature.flag} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{feature.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {getFeatureDisplayName(feature.flag)}
                        </div>
                      </div>
                      {feature.available ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>

                {!enterpriseFeatures.some((f) => f.available) && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Upgrade to Enterprise plan to unlock these features.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options for your deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Two-Factor Authentication</div>
                    <div className="text-sm text-muted-foreground">
                      Require MFA for all users
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">IP Whitelist</div>
                    <div className="text-sm text-muted-foreground">
                      Only allow access from specific IP addresses
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Session Timeout</div>
                    <div className="text-sm text-muted-foreground">
                      Automatically log out inactive users
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Max Login Attempts</Label>
                  <Input type="number" defaultValue="5" />
                  <p className="text-xs text-muted-foreground">
                    Number of failed login attempts before account lockout
                  </p>
                </div>

                <Button>Save Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">
                        Receive updates via email
                      </div>
                    </div>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Task Completion Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Notify when modeling tasks complete
                      </div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Security Alerts</div>
                      <div className="text-sm text-muted-foreground">
                        Notify about security events
                      </div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Notification Email</Label>
                  <Input type="email" placeholder="your-email@example.com" />
                </div>

                <Button>Save Notification Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </div>
  );
}
