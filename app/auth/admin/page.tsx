'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, ArrowLeft, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        alert('Invalid administrator credentials');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (error) {
      alert('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,119,119,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,119,119,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative">
              <Shield className="w-8 h-8 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse border-2 border-black"></div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent mb-2">
              Administrator Access
            </CardTitle>
            <CardDescription className="text-gray-300 text-lg">
              Restricted access for system administrators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90 font-medium">Administrator Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 h-12 rounded-xl"
                  placeholder="admin@carsor.ai"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-red-400 focus:ring-red-400/20 h-12 rounded-xl pr-12"
                    placeholder="Enter administrator password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white h-12 rounded-xl font-semibold shadow-2xl transform hover:scale-105 transition-all duration-300" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Authenticating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Access Admin Panel
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <Button 
                variant="link" 
                onClick={() => router.push('/auth/signin')} 
                className="text-gray-400 hover:text-white p-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to User Login
              </Button>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-300">Demo Credentials</span>
                </div>
                <div className="text-xs text-red-200 space-y-1">
                  <p><strong>Email:</strong> test@example.com</p>
                  <p><strong>Password:</strong> Password@1234</p>
                </div>
              </div>
            </div>

            <div className="pt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => router.push('/')} 
                className="text-gray-400 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}