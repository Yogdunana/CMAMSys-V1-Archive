'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Database,
  Globe,
  Key,
  User,
  Server,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface InstallConfig {
  // 数据库配置
  databaseType: 'postgresql' | 'mysql' | 'sqlite';
  useExistingDatabase: boolean;
  databaseHost?: string;
  databasePort?: number;
  databaseName?: string;
  databaseUser?: string;
  databasePassword?: string;
  
  // 管理员账户
  adminUsername: string;
  adminEmail: string;
  adminPassword: string;
  adminConfirmPassword: string;
  
  // 应用配置
  appName: string;
  appUrl: string;
  appPort: number;
  
  // 安全配置
  jwtSecret?: string;
  csrfSecret?: string;
  encryptionKey?: string;
  sessionSecret?: string;
  
  // 邮件配置
  enableEmail: boolean;
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  smtpFrom?: string;
  smtpFromName?: string;
  
  // 其他配置
  enableRedis: boolean;
  redisUrl?: string;
  enableSentry: boolean;
  sentryDsn?: string;
  
  // 安装路径配置
  installPath: string;
  dataPath: string;
  logPath: string;
  uploadPath: string;
}

export default function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installProgress, setInstallProgress] = useState(0);
  const [installStatus, setInstallStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [config, setConfig] = useState<InstallConfig>({
    databaseType: 'postgresql',
    useExistingDatabase: false,
    adminUsername: '',
    adminEmail: '',
    adminPassword: '',
    adminConfirmPassword: '',
    appName: 'CMAMSys',
    appUrl: 'http://localhost:5000',
    appPort: 5000,
    enableEmail: false,
    enableRedis: false,
    enableSentry: false,
    installPath: process.cwd(),
    dataPath: './data',
    logPath: './logs',
    uploadPath: './uploads',
  });
  
  const [envChecks, setEnvChecks] = useState<Record<string, boolean>>({});
  const [isCheckingEnv, setIsCheckingEnv] = useState(false);
  const [isTestingDb, setIsTestingDb] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockInfo, setLockInfo] = useState<{ installedAt?: string; version?: string } | null>(null);

  useEffect(() => {
    checkInstallLock();
  }, []);

  const checkInstallLock = async () => {
    try {
      const response = await fetch('/api/install/lock');
      if (response.status === 403) {
        const data = await response.json();
        setIsLocked(true);
        setLockInfo(data);
        toast.error(data.message || '系统已完成安装，禁止重复安装');
        return;
      }
      
      // 如果没有锁，继续检查环境
      checkEnvironment();
    } catch (error) {
      console.error('检查安装锁失败:', error);
      // 即使检查失败，也允许继续访问
      checkEnvironment();
    }
  };

  const checkEnvironment = async () => {
    setIsCheckingEnv(true);
    try {
      const response = await fetch('/api/install/check-env');
      const data = await response.json();
      setEnvChecks(data.checks || {});
    } catch (error) {
      toast.error('环境检查失败');
      console.error(error);
    } finally {
      setIsCheckingEnv(false);
    }
  };

  const steps = [
    { title: '欢迎使用', icon: Rocket },
    { title: '环境检查', icon: CheckCircle2 },
    { title: '数据库配置', icon: Database },
    { title: '管理员账户', icon: User },
    { title: '应用配置', icon: Globe },
    { title: '邮件配置', icon: Key },
    { title: '路径配置', icon: Server },
    { title: '安全配置', icon: Key },
    { title: '安装中...', icon: Loader2 },
    { title: '完成', icon: CheckCircle2 },
  ];

  const testDatabaseConnection = async () => {
    setIsTestingDb(true);
    setDbTestResult(null);
    try {
      const response = await fetch('/api/install/test-db', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.databaseType,
          useExisting: config.useExistingDatabase,
          host: config.databaseHost,
          port: config.databasePort,
          name: config.databaseName,
          user: config.databaseUser,
          password: config.databasePassword,
        }),
      });
      const data = await response.json();
      setDbTestResult(data);
      if (data.success) {
        toast.success('数据库连接成功');
      } else {
        toast.error(data.message || '数据库连接失败');
      }
    } catch (error) {
      toast.error('数据库测试失败');
      setDbTestResult({ success: false, message: '连接测试失败' });
    } finally {
      setIsTestingDb(false);
    }
  };

  const generateSecret = () => {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const autoGenerateSecrets = () => {
    setConfig({
      ...config,
      jwtSecret: generateSecret(),
      csrfSecret: generateSecret(),
      encryptionKey: generateSecret(),
      sessionSecret: generateSecret(),
    });
    toast.success('已自动生成安全密钥');
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    setInstallProgress(0);
    setInstallStatus('pending');
    
    try {
      const response = await fetch('/api/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error('安装请求失败');
      }
      
      // 处理SSE流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              setInstallProgress(data.progress || 0);
              
              if (data.status === 'success') {
                setInstallStatus('success');
                toast.success('安装完成！');
                // 自动跳转到完成页面
                setTimeout(() => setCurrentStep(9), 1500);
              } else if (data.status === 'error') {
                setInstallStatus('error');
                toast.error(data.message || '安装失败');
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e);
            }
          }
        }
      }
    } catch (error) {
      setInstallStatus('error');
      toast.error(error instanceof Error ? error.message : '安装失败');
    } finally {
      setIsInstalling(false);
    }
  };

  const nextStep = () => {
    // 验证当前步骤
    if (currentStep === 2) {
      // 数据库配置验证
      if (!config.useExistingDatabase) {
        // 新建数据库，不需要测试连接
      } else {
        // 使用已有数据库，需要测试连接
        if (!dbTestResult?.success) {
          toast.error('请先测试数据库连接');
          return;
        }
      }
    }
    
    if (currentStep === 3) {
      // 管理员账户验证
      if (!config.adminUsername || !config.adminEmail || !config.adminPassword) {
        toast.error('请填写完整的管理员账户信息');
        return;
      }
      if (config.adminPassword !== config.adminConfirmPassword) {
        toast.error('两次输入的密码不一致');
        return;
      }
    }
    
    if (currentStep === 5) {
      // 邮件配置验证
      if (config.enableEmail) {
        if (!config.smtpHost || !config.smtpPort || !config.smtpUser || !config.smtpPassword || !config.smtpFrom) {
          toast.error('启用邮件服务时，必须填写所有 SMTP 配置');
          return;
        }
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl shadow-2xl">
        {isLocked ? (
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <XCircle className="w-20 h-20 mx-auto text-red-500" />
              <div>
                <h2 className="text-3xl font-bold mb-2">系统已安装</h2>
                <p className="text-muted-foreground text-lg">
                  该系统已完成安装，禁止重复安装
                </p>
              </div>
              {lockInfo && (
                <div className="bg-muted rounded-lg p-6 space-y-2 text-left max-w-md mx-auto">
                  <p className="text-sm text-muted-foreground">
                    <strong>安装时间:</strong> {lockInfo.installedAt ? new Date(lockInfo.installedAt).toLocaleString('zh-CN') : '未知'}
                  </p>
                  {lockInfo.version && (
                    <p className="text-sm text-muted-foreground">
                      <strong>版本:</strong> {lockInfo.version}
                    </p>
                  )}
                </div>
              )}
              <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 max-w-md mx-auto">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  如需重新安装系统，请先删除项目根目录下的 install.lock 文件
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        ) : (
          <>
            <CardHeader className="border-b">
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-2xl font-bold">CMAMSys 安装向导</CardTitle>
                  <CardDescription>企业级数学建模竞赛自动化系统</CardDescription>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                  {steps.map((step, index) => (
                    <div key={index} className="flex items-center shrink-0">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                          index === currentStep
                            ? 'bg-primary text-primary-foreground'
                            : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-muted'
                        }`}
                      >
                        {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                      </div>
                      <span className={`ml-2 text-sm whitespace-nowrap ${
                        index === currentStep
                          ? 'text-foreground font-medium'
                          : index < currentStep
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      }`}>
                        {step.title}
                      </span>
                      {index < steps.length - 1 && (
                        <div
                          className={`w-6 h-0.5 mx-2 shrink-0 ${
                            index < currentStep ? 'bg-green-500' : 'bg-muted'
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
            {currentStep === 0 && <WelcomeStep onNext={() => setCurrentStep(1)} />}
            {currentStep === 1 && (
              <EnvironmentCheckStep
                checks={envChecks}
                isChecking={isCheckingEnv}
                onRetry={checkEnvironment}
                onNext={nextStep}
                onPrev={() => setCurrentStep(0)}
              />
            )}
            {currentStep === 2 && (
              <DatabaseConfigStep
                config={config}
                onConfigChange={setConfig}
                onTestDb={testDatabaseConnection}
                isTesting={isTestingDb}
                dbTestResult={dbTestResult}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 3 && (
              <AdminAccountStep
                config={config}
                onConfigChange={setConfig}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 4 && (
              <AppConfigStep
                config={config}
                onConfigChange={setConfig}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 5 && (
              <EmailConfigStep
                config={config}
                onConfigChange={setConfig}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 6 && (
              <PathConfigStep
                config={config}
                onConfigChange={setConfig}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 7 && (
              <SecurityConfigStep
                config={config}
                onConfigChange={setConfig}
                onAutoGenerate={autoGenerateSecrets}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {currentStep === 8 && (
              <InstallStep
                progress={installProgress}
                status={installStatus}
                onRetry={handleInstall}
                onPrev={prevStep}
              />
            )}
            {currentStep === 9 && <CompleteStep />}
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

// 欢迎页面
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="space-y-6">
      <div className="text-center py-8">
        <div className="flex justify-center items-center mb-6">
          <img
            src="/logo-withtext.svg"
            alt="CMAMSys Logo"
            className="h-16 w-auto"
          />
        </div>
        <h2 className="text-3xl font-bold mb-2">欢迎使用 CMAMSys</h2>
        <p className="text-muted-foreground text-lg">
          企业级数学建模竞赛自动化系统
        </p>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold">系统功能：</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
            <span>全自动化建模流程（讨论 → 代码 → 校验 → 论文）</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
            <span>智能 AI Provider 选择和回溯机制</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
            <span>企业级安全和权限控制</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-500" />
            <span>团队协作和版本管理</span>
          </li>
        </ul>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 提示：安装过程大约需要 5-10 分钟，请确保网络连接正常。
        </p>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={onNext} size="lg" className="gap-2">
          开始安装
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// 环境检查步骤
function EnvironmentCheckStep({
  checks,
  isChecking,
  onRetry,
  onNext,
  onPrev,
}: {
  checks: Record<string, boolean>;
  isChecking: boolean;
  onRetry: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const allPassed = Object.values(checks).every(Boolean) && Object.keys(checks).length > 0;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">环境检查</h2>
        <p className="text-muted-foreground">检查系统环境是否满足安装要求</p>
      </div>
      
      <div className="space-y-3">
        {isChecking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>正在检查环境...</span>
          </div>
        ) : (
          Object.entries(checks).map(([key, passed]) => (
            <div
              key={key}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                passed ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
              }`}
            >
              <span className="flex-1">{key}</span>
              {passed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
            </div>
          ))
        )}
      </div>
      
      {allPassed ? (
        <Alert className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            所有检查通过！可以继续安装。
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            部分检查未通过，请解决后再继续。
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={isChecking}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onRetry} disabled={isChecking}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            重新检查
          </Button>
          <Button onClick={onNext} disabled={!allPassed || isChecking}>
            下一步
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// 数据库配置步骤
function DatabaseConfigStep({
  config,
  onConfigChange,
  onTestDb,
  isTesting,
  dbTestResult,
  onNext,
  onPrev,
}: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Database className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">数据库配置</h2>
        <p className="text-muted-foreground">配置数据库连接信息</p>
      </div>
      
      <Tabs value={config.databaseType} onValueChange={(v) => onConfigChange({ ...config, databaseType: v })}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="postgresql">PostgreSQL</TabsTrigger>
          <TabsTrigger value="mysql">MySQL</TabsTrigger>
          <TabsTrigger value="sqlite">SQLite</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="useExisting"
            checked={config.useExistingDatabase}
            onCheckedChange={(checked) =>
              onConfigChange({ ...config, useExistingDatabase: checked as boolean })
            }
          />
          <Label htmlFor="useExisting">使用已有数据库</Label>
        </div>
        
        {config.useExistingDatabase && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbHost">数据库地址</Label>
                <Input
                  id="dbHost"
                  placeholder="localhost"
                  value={config.databaseHost || ''}
                  onChange={(e) => onConfigChange({ ...config, databaseHost: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPort">端口</Label>
                <Input
                  id="dbPort"
                  type="number"
                  placeholder="5432"
                  value={config.databasePort || ''}
                  onChange={(e) => onConfigChange({ ...config, databasePort: parseInt(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dbName">数据库名称</Label>
              <Input
                id="dbName"
                placeholder="cmamsys"
                value={config.databaseName || ''}
                onChange={(e) => onConfigChange({ ...config, databaseName: e.target.value })}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dbUser">用户名</Label>
                <Input
                  id="dbUser"
                  placeholder="postgres"
                  value={config.databaseUser || ''}
                  onChange={(e) => onConfigChange({ ...config, databaseUser: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dbPassword">密码</Label>
                <Input
                  id="dbPassword"
                  type="password"
                  placeholder="••••••••"
                  value={config.databasePassword || ''}
                  onChange={(e) => onConfigChange({ ...config, databasePassword: e.target.value })}
                />
              </div>
            </div>
            
            <Button onClick={onTestDb} disabled={isTesting} variant="outline" className="w-full">
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  测试中...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  测试连接
                </>
              )}
            </Button>
            
            {dbTestResult && (
              <Alert
                className={
                  dbTestResult.success
                    ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
                }
              >
                {dbTestResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription
                  className={
                    dbTestResult.success
                      ? 'text-green-800 dark:text-green-200'
                      : 'text-red-800 dark:text-red-200'
                  }
                >
                  {dbTestResult.message}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={onNext}>
          下一步
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 管理员账户步骤
function AdminAccountStep({ config, onConfigChange, onNext, onPrev }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <User className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">管理员账户</h2>
        <p className="text-muted-foreground">创建系统管理员账户</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="adminUsername">用户名</Label>
          <Input
            id="adminUsername"
            placeholder="admin"
            value={config.adminUsername}
            onChange={(e) => onConfigChange({ ...config, adminUsername: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminEmail">邮箱</Label>
          <Input
            id="adminEmail"
            type="email"
            placeholder="admin@example.com"
            value={config.adminEmail}
            onChange={(e) => onConfigChange({ ...config, adminEmail: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminPassword">密码</Label>
          <Input
            id="adminPassword"
            type="password"
            placeholder="至少 8 个字符"
            value={config.adminPassword}
            onChange={(e) => onConfigChange({ ...config, adminPassword: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminConfirmPassword">确认密码</Label>
          <Input
            id="adminConfirmPassword"
            type="password"
            placeholder="再次输入密码"
            value={config.adminConfirmPassword}
            onChange={(e) => onConfigChange({ ...config, adminConfirmPassword: e.target.value })}
          />
        </div>
        
        {config.adminPassword && config.adminPassword !== config.adminConfirmPassword && (
          <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              两次输入的密码不一致
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={onNext}>
          下一步
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 应用配置步骤
function AppConfigStep({ config, onConfigChange, onNext, onPrev }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Globe className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">应用配置</h2>
        <p className="text-muted-foreground">配置应用程序基本信息</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="appName">应用名称</Label>
          <Input
            id="appName"
            placeholder="CMAMSys"
            value={config.appName}
            onChange={(e) => onConfigChange({ ...config, appName: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="appUrl">应用 URL</Label>
          <Input
            id="appUrl"
            placeholder="http://localhost:5000"
            value={config.appUrl}
            onChange={(e) => onConfigChange({ ...config, appUrl: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="appPort">应用端口</Label>
          <Input
            id="appPort"
            type="number"
            placeholder="5000"
            value={config.appPort}
            onChange={(e) => onConfigChange({ ...config, appPort: parseInt(e.target.value) })}
          />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableRedis"
              checked={config.enableRedis}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, enableRedis: checked as boolean })
              }
            />
            <Label htmlFor="enableRedis">启用 Redis（可选，用于缓存和会话管理）</Label>
          </div>
          
          {config.enableRedis && (
            <div className="space-y-2 mt-2">
              <Label htmlFor="redisUrl">Redis URL</Label>
              <Input
                id="redisUrl"
                placeholder="redis://localhost:6379"
                value={config.redisUrl || ''}
                onChange={(e) => onConfigChange({ ...config, redisUrl: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={onNext}>
          下一步
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 邮件配置步骤
function EmailConfigStep({ config, onConfigChange, onNext, onPrev }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">邮件配置</h2>
        <p className="text-muted-foreground">配置邮件服务器，用于发送通知和重置密码</p>
      </div>
      
      <Alert>
        <AlertDescription>
          如果不配置邮件服务，某些功能（如邮件通知、密码重置）将不可用。可以稍后在系统设置中配置。
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableEmail"
              checked={config.enableEmail}
              onCheckedChange={(checked) =>
                onConfigChange({ ...config, enableEmail: checked as boolean })
              }
            />
            <Label htmlFor="enableEmail">启用邮件服务</Label>
          </div>
        </div>
        
        {config.enableEmail && (
          <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label htmlFor="smtpHost">SMTP 服务器地址</Label>
              <Input
                id="smtpHost"
                placeholder="smtp.gmail.com"
                value={config.smtpHost || ''}
                onChange={(e) => onConfigChange({ ...config, smtpHost: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                例如：smtp.gmail.com, smtp.qq.com, smtp.aliyun.com
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP 端口</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  placeholder="587"
                  value={config.smtpPort || ''}
                  onChange={(e) => onConfigChange({ ...config, smtpPort: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground">
                  SSL: 465, TLS: 587
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2 pt-6">
                  <Checkbox
                    id="smtpSecure"
                    checked={config.smtpSecure || false}
                    onCheckedChange={(checked) =>
                      onConfigChange({ ...config, smtpSecure: checked as boolean })
                    }
                  />
                  <Label htmlFor="smtpSecure">使用 SSL/TLS</Label>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP 用户名</Label>
                <Input
                  id="smtpUser"
                  placeholder="your-email@example.com"
                  value={config.smtpUser || ''}
                  onChange={(e) => onConfigChange({ ...config, smtpUser: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP 密码</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={config.smtpPassword || ''}
                  onChange={(e) => onConfigChange({ ...config, smtpPassword: e.target.value })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpFrom">发件人邮箱</Label>
              <Input
                id="smtpFrom"
                placeholder="noreply@example.com"
                value={config.smtpFrom || ''}
                onChange={(e) => onConfigChange({ ...config, smtpFrom: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smtpFromName">发件人名称</Label>
              <Input
                id="smtpFromName"
                placeholder="CMAMSys"
                value={config.smtpFromName || ''}
                onChange={(e) => onConfigChange({ ...config, smtpFromName: e.target.value })}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={onNext}>
          下一步
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 路径配置步骤
function PathConfigStep({ config, onConfigChange, onNext, onPrev }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Server className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">路径配置</h2>
        <p className="text-muted-foreground">配置系统文件存储路径</p>
      </div>
      
      <Alert>
        <AlertDescription>
          路径可以是绝对路径（如 /var/lib/cmamsys）或相对路径（如 ./data）。
          确保指定的目录具有读写权限。
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="installPath">安装路径</Label>
          <Input
            id="installPath"
            placeholder="/workspace/projects"
            value={config.installPath}
            onChange={(e) => onConfigChange({ ...config, installPath: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            CMAMSys 主程序所在路径
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="dataPath">数据存储路径</Label>
          <Input
            id="dataPath"
            placeholder="./data"
            value={config.dataPath}
            onChange={(e) => onConfigChange({ ...config, dataPath: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            存储应用数据、配置文件等
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="logPath">日志存储路径</Label>
          <Input
            id="logPath"
            placeholder="./logs"
            value={config.logPath}
            onChange={(e) => onConfigChange({ ...config, logPath: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            存储系统日志文件
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="uploadPath">上传文件路径</Label>
          <Input
            id="uploadPath"
            placeholder="./uploads"
            value={config.uploadPath}
            onChange={(e) => onConfigChange({ ...config, uploadPath: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            存储用户上传的文件（论文、附件等）
          </p>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={onNext}>
          下一步
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 安全配置步骤
function SecurityConfigStep({ config, onConfigChange, onAutoGenerate, onNext, onPrev }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Key className="w-12 h-12 mx-auto mb-3 text-primary" />
        <h2 className="text-2xl font-bold">安全配置</h2>
        <p className="text-muted-foreground">配置系统安全密钥</p>
      </div>
      
      <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <Key className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          这些密钥用于保护系统安全，请妥善保管。建议使用强随机值。
        </AlertDescription>
      </Alert>
      
      <Button onClick={onAutoGenerate} variant="outline" className="w-full">
        <RefreshCw className="w-4 h-4 mr-2" />
        自动生成所有密钥
      </Button>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="jwtSecret">JWT Secret（访问令牌）</Label>
          <Input
            id="jwtSecret"
            type="password"
            placeholder='点击"自动生成所有密钥"或手动输入'
            value={config.jwtSecret || ''}
            onChange={(e) => onConfigChange({ ...config, jwtSecret: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="csrfSecret">CSRF Secret（跨站请求保护）</Label>
          <Input
            id="csrfSecret"
            type="password"
            placeholder='点击"自动生成所有密钥"或手动输入'
            value={config.csrfSecret || ''}
            onChange={(e) => onConfigChange({ ...config, csrfSecret: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="encryptionKey">Encryption Key（数据加密）</Label>
          <Input
            id="encryptionKey"
            type="password"
            placeholder='点击"自动生成所有密钥"或手动输入'
            value={config.encryptionKey || ''}
            onChange={(e) => onConfigChange({ ...config, encryptionKey: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sessionSecret">Session Secret（会话管理）</Label>
          <Input
            id="sessionSecret"
            type="password"
            placeholder='点击"自动生成所有密钥"或手动输入'
            value={config.sessionSecret || ''}
            onChange={(e) => onConfigChange({ ...config, sessionSecret: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        <Button onClick={onNext}>
          开始安装
          <Rocket className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}

// 安装步骤
function InstallStep({ progress, status, onRetry, onPrev }: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Loader2 className={`w-12 h-12 mx-auto mb-3 text-primary ${status === 'pending' ? 'animate-spin' : ''}`} />
        <h2 className="text-2xl font-bold">安装中...</h2>
        <p className="text-muted-foreground">正在安装系统，请稍候</p>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress >= 20 ? 'bg-green-500' : 'bg-muted'}`} />
          <span>检查环境</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress >= 40 ? 'bg-green-500' : 'bg-muted'}`} />
          <span>配置数据库</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress >= 60 ? 'bg-green-500' : 'bg-muted'}`} />
          <span>运行数据库迁移</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress >= 80 ? 'bg-green-500' : 'bg-muted'}`} />
          <span>创建管理员账户</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-muted'}`} />
          <span>配置完成</span>
        </div>
      </div>
      
      {status === 'error' && (
        <Alert className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            安装失败，请重试
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} disabled={status === 'pending'}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        {status === 'error' && (
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
        )}
      </div>
    </div>
  );
}

// 完成步骤
function CompleteStep() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
        <h2 className="text-3xl font-bold mb-2">安装完成！</h2>
        <p className="text-muted-foreground text-lg">
          CMAMSys 已成功安装
        </p>
      </div>
      
      <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-green-900 dark:text-green-100">下一步操作：</h3>
        <ul className="space-y-2 text-sm text-green-800 dark:text-green-200">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>使用管理员账户登录系统</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>配置 AI Provider（可选）</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>创建团队和项目</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 mt-0.5" />
            <span>开始使用自动化建模功能</span>
          </li>
        </ul>
      </div>
      
      <Button asChild size="lg" className="w-full gap-2">
        <a href="/auth/login">
          前往登录页面
          <ArrowRight className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
}
