'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { tataModels } from '@/lib/tata-models';
import { Save, X, User, Car, Phone, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface EditProfileProps {
  userProfile: any;
  onSave: (updatedProfile: any) => void;
  onCancel: () => void;
}

export default function EditProfile({ userProfile, onSave, onCancel }: EditProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleRegistration: ''
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        vehicleModel: userProfile.vehicleModel || '',
        vehicleYear: userProfile.vehicleYear?.toString() || '',
        vehicleRegistration: userProfile.vehicleRegistration || ''
      });
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          vehicleYear: parseInt(formData.vehicleYear)
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        onSave(updatedProfile);
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      if (response.ok) {
        alert('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to change password');
      }
    } catch (error) {
      alert('Network error occurred');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getModelName = (modelId: string) => {
    const model = tataModels.find(m => m.id === modelId);
    return model ? `${model.name} (${model.category})` : modelId;
  };

  return (
    <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-b border-white/10 rounded-t-3xl">
        <CardTitle className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
            <User className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <span className="text-2xl font-bold text-white">Edit Profile</span>
            <p className="text-gray-400 font-normal">Update your account information</p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2 text-white/90 font-medium">
                <User className="w-4 h-4 text-cyan-400" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2 text-white/90 font-medium">
                <Phone className="w-4 h-4 text-cyan-400" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-white/90 font-medium">
              <Mail className="w-4 h-4 text-cyan-400" />
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={userProfile?.email || ''}
              disabled
              className="bg-white/5 border-white/20 text-gray-400 rounded-xl h-12 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400">Email cannot be changed</p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
              <Car className="w-5 h-5 text-cyan-400" />
              Vehicle Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleModel" className="text-white/90 font-medium">
                  Tata Vehicle Model
                </Label>
                <Select 
                  value={formData.vehicleModel} 
                  onValueChange={(value) => setFormData({ ...formData, vehicleModel: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-400 rounded-xl h-12">
                    <SelectValue placeholder="Select your Tata model" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {tataModels.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="text-white hover:bg-white/10">
                        {model.name} ({model.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear" className="text-white/90 font-medium">
                    Manufacturing Year
                  </Label>
                  <Input
                    id="vehicleYear"
                    type="number"
                    min="2010"
                    max="2024"
                    required
                    value={formData.vehicleYear}
                    onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleRegistration" className="text-white/90 font-medium">
                    Registration Number
                  </Label>
                  <Input
                    id="vehicleRegistration"
                    type="text"
                    required
                    placeholder="e.g., MH01AB1234"
                    value={formData.vehicleRegistration}
                    onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value.toUpperCase() })}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-6 border-t border-white/10">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white rounded-xl py-3 shadow-2xl"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </div>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-xl py-3"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Change Password Section */}
          <div className="border-t border-white/10 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Lock className="w-5 h-5 text-red-400" />
                Security Settings
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline"
                    className="border-red-400/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Change Password</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update your account password for enhanced security
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          required
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12 pr-12"
                          placeholder="Enter current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12 pr-12"
                          placeholder="Enter new password (min 8 characters)"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 rounded-xl h-12 pr-12"
                          placeholder="Confirm new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-xl py-3" 
                      disabled={isChangingPassword}
                    >
                      {isChangingPassword ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Changing Password...
                        </div>
                      ) : (
                        'Change Password'
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-gray-400">
              Keep your account secure by using a strong, unique password
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}