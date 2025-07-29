'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, Users, Wrench, Plus, Edit, Trash2, Eye, EyeOff, LogOut, Car, Settings, Activity, Database, Server, Lock } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface User {
  _id: string;
  name: string;
  email: string;
  userType: string;
  phone?: string;
  vehicleModel?: string;
  vehicleRegistration?: string;
  companyName?: string;
  serviceLocation?: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [serviceProviders, setServiceProviders] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProvider, setIsAddingProvider] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newProvider, setNewProvider] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    companyName: '',
    serviceLocation: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/admin');
    } else if (session?.user && (session.user as any).userType !== 'admin') {
      router.push('/dashboard');
    } else if (session?.user) {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [usersRes, providersRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/service-providers')
      ]);
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
      
      if (providersRes.ok) {
        const providersData = await providersRes.json();
        setServiceProviders(providersData);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProvider(true);

    try {
      const response = await fetch('/api/admin/service-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newProvider, userType: 'service_provider' }),
      });

      if (response.ok) {
        setNewProvider({ name: '', email: '', password: '', phone: '', companyName: '', serviceLocation: '' });
        fetchData();
        alert('Service provider added successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to add service provider');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setIsAddingProvider(false);
    }
  };

  const handleUpdatePassword = async (userId: string, newPassword: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert('Password updated successfully');
      } else {
        alert('Failed to update password');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  const handleDeleteUser = async (userId: string, userType: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchData();
        alert('User deleted successfully');
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      alert('Network error occurred');
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium text-white">Loading Admin Dashboard...</p>
          <p className="text-gray-400 mt-2">Initializing system controls...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user as any)?.userType !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000"></div>
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,119,119,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,119,119,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Shield className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full animate-pulse border-2 border-black"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                  Carsor AI Admin
                </h1>
                <p className="text-xs text-gray-400 font-medium">System Administration Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                <Avatar className="w-10 h-10 border-2 border-red-400/30">
                  <AvatarFallback className="bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold">
                    {session.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-semibold">{session.user?.name}</p>
                  <Badge className="bg-red-500/20 text-red-300 border-red-400/30 text-xs">
                    Administrator
                  </Badge>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="border-red-400/30 text-red-400 hover:bg-red-500/10 rounded-2xl"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            System Administration
          </h2>
          <p className="text-gray-400 text-lg">Manage users, service providers, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{users.length}</p>
                  <p className="text-blue-200 font-medium">Vehicle Owners</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
                  <Wrench className="w-8 h-8 text-green-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{serviceProviders.length}</p>
                  <p className="text-green-200 font-medium">Service Providers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                  <Database className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">{users.length + serviceProviders.length}</p>
                  <p className="text-purple-200 font-medium">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="bg-black/20 backdrop-blur-xl border border-white/10 p-1 rounded-2xl">
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-cyan-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-blue-400/30 text-gray-400 rounded-xl px-6 py-3"
            >
              <Users className="w-4 h-4 mr-2" />
              Vehicle Owners
            </TabsTrigger>
            <TabsTrigger 
              value="providers" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-green-400/30 text-gray-400 rounded-xl px-6 py-3"
            >
              <Wrench className="w-4 h-4 mr-2" />
              Service Providers
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-purple-400/30 text-gray-400 rounded-xl px-6 py-3"
            >
              <Settings className="w-4 h-4 mr-2" />
              System Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-b border-white/10 rounded-t-3xl">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-white">Vehicle Owners Management</span>
                    <p className="text-gray-400 font-normal">Manage customer accounts and profiles</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {users.length === 0 ? (
                    <div className="text-center py-12">
                      <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No vehicle owners registered yet</p>
                    </div>
                  ) : (
                    users.map((user) => (
                      <Card key={user._id} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12 border-2 border-blue-400/30">
                                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white text-lg">{user.name}</h4>
                                <p className="text-gray-400">{user.email}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <Car className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-gray-300">{user.vehicleModel}</span>
                                  </div>
                                  <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-400/30 text-xs">
                                    {user.vehicleRegistration}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-orange-400/30 text-orange-400 hover:bg-orange-500/10 rounded-xl"
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Reset Password
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/10">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Reset Password</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Enter a new password for {user.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const newPassword = formData.get('password') as string;
                                    handleUpdatePassword(user._id, newPassword);
                                  }}>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="password" className="text-white">New Password</Label>
                                        <Input
                                          id="password"
                                          name="password"
                                          type="password"
                                          required
                                          minLength={8}
                                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                                          placeholder="Enter new password (min 8 characters)"
                                        />
                                      </div>
                                      <Button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl"
                                      >
                                        Update Password
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteUser(user._id, 'vehicle_owner')}
                                className="bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-white/10 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-white">Service Providers Management</CardTitle>
                      <p className="text-gray-400 font-normal">Manage authorized service centers</p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl px-6 py-3 shadow-2xl">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Service Provider
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/10 max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-white text-xl">Add New Service Provider</DialogTitle>
                        <DialogDescription className="text-gray-400">
                          Create a new authorized service provider account
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleAddProvider} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="text-white">Full Name</Label>
                            <Input
                              id="name"
                              required
                              value={newProvider.name}
                              onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                              placeholder="Provider name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone" className="text-white">Phone</Label>
                            <Input
                              id="phone"
                              required
                              value={newProvider.phone}
                              onChange={(e) => setNewProvider({ ...newProvider, phone: e.target.value })}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                              placeholder="Phone number"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            value={newProvider.email}
                            onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                            placeholder="Email address"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password" className="text-white">Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              required
                              minLength={8}
                              value={newProvider.password}
                              onChange={(e) => setNewProvider({ ...newProvider, password: e.target.value })}
                              className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-400 pr-12"
                              placeholder="Create secure password"
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
                        <div>
                          <Label htmlFor="companyName" className="text-white">Company Name</Label>
                          <Input
                            id="companyName"
                            required
                            value={newProvider.companyName}
                            onChange={(e) => setNewProvider({ ...newProvider, companyName: e.target.value })}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                            placeholder="Service center name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="serviceLocation" className="text-white">Service Location</Label>
                          <Input
                            id="serviceLocation"
                            required
                            placeholder="City, State"
                            value={newProvider.serviceLocation}
                            onChange={(e) => setNewProvider({ ...newProvider, serviceLocation: e.target.value })}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-green-400"
                          />
                        </div>
                        <Button 
                          type="submit" 
                          className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl py-3" 
                          disabled={isAddingProvider}
                        >
                          {isAddingProvider ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Adding Provider...
                            </div>
                          ) : (
                            'Add Service Provider'
                          )}
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {serviceProviders.length === 0 ? (
                    <div className="text-center py-12">
                      <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No service providers registered yet</p>
                    </div>
                  ) : (
                    serviceProviders.map((provider) => (
                      <Card key={provider._id} className="bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <Avatar className="w-12 h-12 border-2 border-green-400/30">
                                <AvatarFallback className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold">
                                  {provider.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h4 className="font-semibold text-white text-lg">{provider.name}</h4>
                                <p className="text-gray-400">{provider.email}</p>
                                <div className="flex items-center gap-4 mt-2">
                                  <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-green-400" />
                                    <span className="text-sm text-gray-300">{provider.companyName}</span>
                                  </div>
                                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30 text-xs">
                                    {provider.serviceLocation}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-orange-400/30 text-orange-400 hover:bg-orange-500/10 rounded-xl"
                                  >
                                    <Lock className="w-4 h-4 mr-2" />
                                    Reset Password
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/10">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Reset Password</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                      Enter a new password for {provider.name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(e.target as HTMLFormElement);
                                    const newPassword = formData.get('password') as string;
                                    handleUpdatePassword(provider._id, newPassword);
                                  }}>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="password" className="text-white">New Password</Label>
                                        <Input
                                          id="password"
                                          name="password"
                                          type="password"
                                          required
                                          minLength={8}
                                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-orange-400"
                                          placeholder="Enter new password (min 8 characters)"
                                        />
                                      </div>
                                      <Button 
                                        type="submit" 
                                        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl"
                                      >
                                        Update Password
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleDeleteUser(provider._id, 'service_provider')}
                                className="bg-red-500/20 border border-red-400/30 text-red-400 hover:bg-red-500/30 rounded-xl"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/10 rounded-t-3xl">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-white">System Settings</span>
                    <p className="text-gray-400 font-normal">Monitor system health and configuration</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl flex items-center justify-center">
                          <Database className="w-5 h-5 text-blue-400" />
                        </div>
                        <h4 className="font-semibold text-white">Database Status</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Connection</span>
                          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Connected</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type</span>
                          <span className="text-white">MongoDB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Collections</span>
                          <span className="text-white">3 Active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center">
                          <Shield className="w-5 h-5 text-green-400" />
                        </div>
                        <h4 className="font-semibold text-white">Authentication</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Provider</span>
                          <span className="text-white">NextAuth.js</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Security</span>
                          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Secure</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Encryption</span>
                          <span className="text-white">bcrypt</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center">
                          <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                        <h4 className="font-semibold text-white">AI Services</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Voice Processing</span>
                          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">AI Analysis</span>
                          <Badge className="bg-green-500/20 text-green-300 border-green-400/30">Running</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Provider</span>
                          <span className="text-white">Gemini AI</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/5 border border-white/10">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
                          <Server className="w-5 h-5 text-orange-400" />
                        </div>
                        <h4 className="font-semibold text-white">Server Status</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Platform</span>
                          <span className="text-white">Next.js 13</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Environment</span>
                          <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">Production</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Uptime</span>
                          <span className="text-white">99.9%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}