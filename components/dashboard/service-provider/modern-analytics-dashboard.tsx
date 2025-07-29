'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Car, 
  TrendingUp, 
  AlertTriangle, 
  Wrench, 
  Users, 
  Clock,
  Download,
  Calendar,
  MapPin,
  Factory,
  Target,
  Globe,
  Activity,
  Shield,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

interface Issue {
  _id: string;
  description: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'resolved';
  vehicleModel: string;
  createdAt: string;
  resolvedAt?: string;
  userId: string;
}

interface AnalyticsData {
  overview: {
    totalIssues: number;
    resolvedIssues: number;
    activeIssues: number;
    criticalIssues: number;
    totalUsers: number;
    avgResolutionTime: number;
  };
  issuesByModel: Array<{
    model: string;
    issues: number;
    resolved: number;
    resolutionRate: number;
  }>;
  issuesByCategory: Array<{
    category: string;
    count: number;
    color: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    issues: number;
    resolved: number;
  }>;
  commonFlaws: Array<{
    issue: string;
    frequency: number;
    severity: string;
    affectedModels: string[];
  }>;
  severityDistribution: Array<{
    severity: string;
    count: number;
    percentage: number;
  }>;
}

interface ModernAnalyticsDashboardProps {
  activeTab?: string;
}

export default function ModernAnalyticsDashboard({ activeTab = 'overview' }: ModernAnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/issues');
      if (response.ok) {
        const issuesData = await response.json();
        setIssues(issuesData);
        processAnalyticsData(issuesData);
      }
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (issuesData: Issue[]) => {
    if (!issuesData || issuesData.length === 0) {
      setData({
        overview: {
          totalIssues: 0,
          resolvedIssues: 0,
          activeIssues: 0,
          criticalIssues: 0,
          totalUsers: 0,
          avgResolutionTime: 0,
        },
        issuesByModel: [],
        issuesByCategory: [],
        monthlyTrends: [],
        commonFlaws: [],
        severityDistribution: [],
      });
      return;
    }

    // Overview calculations
    const totalIssues = issuesData.length;
    const resolvedIssues = issuesData.filter(issue => issue.status === 'resolved').length;
    const activeIssues = totalIssues - resolvedIssues;
    const criticalIssues = issuesData.filter(issue => issue.severity === 'high').length;
    const uniqueUsers = new Set(issuesData.map(issue => issue.userId)).size;

    // Calculate average resolution time
    const resolvedWithTime = issuesData.filter(issue => issue.status === 'resolved' && issue.resolvedAt);
    const avgResolutionTime = resolvedWithTime.length > 0 
      ? resolvedWithTime.reduce((acc, issue) => {
          const created = new Date(issue.createdAt);
          const resolved = new Date(issue.resolvedAt!);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedWithTime.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Issues by model
    const modelCounts = issuesData.reduce((acc, issue) => {
      const model = issue.vehicleModel || 'Unknown';
      if (!acc[model]) {
        acc[model] = { total: 0, resolved: 0 };
      }
      acc[model].total++;
      if (issue.status === 'resolved') {
        acc[model].resolved++;
      }
      return acc;
    }, {} as Record<string, { total: number; resolved: number }>);

    const issuesByModel = Object.entries(modelCounts).map(([model, counts]) => ({
      model,
      issues: counts.total,
      resolved: counts.resolved,
      resolutionRate: counts.total > 0 ? Math.round((counts.resolved / counts.total) * 100) : 0,
    })).sort((a, b) => b.issues - a.issues);

    // Issues by category
    const categoryCounts = issuesData.reduce((acc, issue) => {
      const category = issue.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#ef4444', '#f97316', '#eab308', '#22c55e', '#8b5cf6', '#6b7280'];
    const issuesByCategory = Object.entries(categoryCounts).map(([category, count], index) => ({
      category,
      count,
      color: colors[index % colors.length],
    })).sort((a, b) => b.count - a.count);

    // Monthly trends (last 6 months)
    const monthlyData = {} as Record<string, { issues: number; resolved: number }>;
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      monthlyData[monthKey] = { issues: 0, resolved: 0 };
    }

    issuesData.forEach(issue => {
      const issueDate = new Date(issue.createdAt);
      const monthKey = issueDate.toLocaleDateString('en-US', { month: 'short' });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].issues++;
        if (issue.status === 'resolved') {
          monthlyData[monthKey].resolved++;
        }
      }
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      issues: data.issues,
      resolved: data.resolved,
    }));

    // Common flaws analysis
    const flawPatterns = {} as Record<string, {
      frequency: number;
      severity: Record<string, number>;
      models: Set<string>;
      descriptions: string[];
    }>;

    issuesData.forEach(issue => {
      const category = issue.category || 'Other';
      
      if (!flawPatterns[category]) {
        flawPatterns[category] = {
          frequency: 0,
          severity: { low: 0, medium: 0, high: 0 },
          models: new Set(),
          descriptions: [],
        };
      }
      
      flawPatterns[category].frequency++;
      flawPatterns[category].severity[issue.severity]++;
      flawPatterns[category].models.add(issue.vehicleModel);
      flawPatterns[category].descriptions.push(issue.description);
    });

    const commonFlaws = Object.entries(flawPatterns)
      .map(([pattern, data]) => {
        const mostCommonSeverity = Object.entries(data.severity)
          .sort(([,a], [,b]) => b - a)[0][0];
        
        return {
          issue: `${pattern} related issues`,
          frequency: data.frequency,
          severity: mostCommonSeverity,
          affectedModels: Array.from(data.models),
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Severity distribution
    const severityCounts = issuesData.reduce((acc, issue) => {
      acc[issue.severity] = (acc[issue.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityDistribution = Object.entries(severityCounts).map(([severity, count]) => ({
      severity: severity.charAt(0).toUpperCase() + severity.slice(1),
      count,
      percentage: Math.round((count / totalIssues) * 100),
    }));

    setData({
      overview: {
        totalIssues,
        resolvedIssues,
        activeIssues,
        criticalIssues,
        totalUsers: uniqueUsers,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      },
      issuesByModel,
      issuesByCategory,
      monthlyTrends,
      commonFlaws,
      severityDistribution,
    });
  };

  const exportData = async () => {
    try {
      if (!data) {
        alert('No data available to export');
        return;
      }

      // Create comprehensive export data
      const exportData = {
        generatedAt: new Date().toISOString(),
        reportTitle: 'Carsor AI Analytics Report',
        summary: {
          totalIssues: data.overview.totalIssues,
          resolutionRate: data.overview.totalIssues > 0 ? Math.round((data.overview.resolvedIssues / data.overview.totalIssues) * 100) : 0,
          avgResolutionTime: data.overview.avgResolutionTime,
          criticalIssuesPercentage: data.overview.totalIssues > 0 ? Math.round((data.overview.criticalIssues / data.overview.totalIssues) * 100) : 0
        },
        overview: data.overview,
        issuesByModel: data.issuesByModel,
        issuesByCategory: data.issuesByCategory,
        monthlyTrends: data.monthlyTrends,
        commonFlaws: data.commonFlaws,
        severityDistribution: data.severityDistribution,
        rawIssues: issues.map(issue => ({
          id: issue._id,
          description: issue.description,
          category: issue.category,
          severity: issue.severity,
          status: issue.status,
          vehicleModel: issue.vehicleModel,
          createdAt: issue.createdAt,
          resolvedAt: issue.resolvedAt || null,
          userId: issue.userId
        }))
      };

      // Generate JSON export
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Generate CSV export with better formatting
      // Also create CSV export for easier analysis
      const csvData = [
        ['Issue ID', 'Description', 'Category', 'Severity', 'Status', 'Vehicle Model', 'Created Date', 'Resolved Date', 'Days to Resolution'],
        ...issues.map(issue => [
          issue._id,
          `"${issue.description.replace(/"/g, '""')}"`, // Properly escape quotes for CSV
          issue.category,
          issue.severity,
          issue.status,
          issue.vehicleModel,
          new Date(issue.createdAt).toLocaleDateString(),
          issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleDateString() : 'Not resolved',
          issue.resolvedAt ? Math.ceil((new Date(issue.resolvedAt).getTime() - new Date(issue.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 'N/A'
        ])
      ];

      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const csvBlob = new Blob([csvContent], { type: 'text/csv' });
      const csvUrl = URL.createObjectURL(csvBlob);
      const csvLink = document.createElement('a');
      csvLink.href = csvUrl;
      csvLink.download = `analytics-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(csvLink);
      csvLink.click();
      document.body.removeChild(csvLink);
      URL.revokeObjectURL(csvUrl);

      // Show success message with details
      const successMessage = `
Data exported successfully! 

Files generated:
• analytics-report-${new Date().toISOString().split('T')[0]}.json (Complete data)
• analytics-data-${new Date().toISOString().split('T')[0]}.csv (Spreadsheet format)

Check your downloads folder.`;
      alert(successMessage);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  const renderOverviewContent = () => (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center">
                <Car className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.overview.totalIssues || 0}</p>
                <p className="text-sm text-gray-400">Total Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.overview.resolvedIssues || 0}</p>
                <p className="text-sm text-gray-400">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.overview.activeIssues || 0}</p>
                <p className="text-sm text-gray-400">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.overview.criticalIssues || 0}</p>
                <p className="text-sm text-gray-400">Critical</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.overview.totalUsers || 0}</p>
                <p className="text-sm text-gray-400">Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/20 backdrop-blur-xl border border-white/10 shadow-2xl hover:bg-black/30 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{data?.overview.avgResolutionTime || 0}d</p>
                <p className="text-sm text-gray-400">Avg Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button 
          onClick={exportData}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 hover:bg-gradient-to-r hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl backdrop-blur-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
        <Button className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-300 hover:bg-gradient-to-r hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl backdrop-blur-sm">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Report
        </Button>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Issues by Category Chart */}
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <PieChart className="w-6 h-6 text-cyan-400" />
              Issues by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.issuesByCategory && data.issuesByCategory.length > 0 ? (
              <div className="space-y-4">
                {data.issuesByCategory.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-white font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{category.count}</span>
                      <div className="w-24 bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="h-2 rounded-full transition-all duration-300"
                          style={{ 
                            backgroundColor: category.color,
                            width: `${(category.count / (data?.overview.totalIssues || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No category data available</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Trends Chart */}
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <LineChart className="w-6 h-6 text-green-400" />
              Monthly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.monthlyTrends && data.monthlyTrends.some(month => month.issues > 0) ? (
              <div className="space-y-4">
                {data.monthlyTrends.map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-medium">{trend.month}</span>
                      <div className="flex gap-4">
                        <span className="text-red-400">Issues: {trend.issues}</span>
                        <span className="text-green-400">Resolved: {trend.resolved}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-red-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${trend.issues > 0 ? (trend.issues / Math.max(...data.monthlyTrends.map(t => t.issues))) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <div className="flex-1 bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${trend.resolved > 0 ? (trend.resolved / Math.max(...data.monthlyTrends.map(t => t.resolved))) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No trend data available</p>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Models Performance */}
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <BarChart3 className="w-6 h-6 text-blue-400" />
              Vehicle Models Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.issuesByModel && data.issuesByModel.length > 0 ? (
              <div className="space-y-4">
                {data.issuesByModel.slice(0, 5).map((model, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-medium">{model.model}</span>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        {model.resolutionRate}% resolved
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-gray-400">Total: {model.issues}</span>
                      <span className="text-green-400">Resolved: {model.resolved}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${model.resolutionRate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No model data available</p>
            )}
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <Target className="w-6 h-6 text-purple-400" />
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.severityDistribution && data.severityDistribution.length > 0 ? (
              <div className="space-y-4">
                {data.severityDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${
                        item.severity === 'High' ? 'bg-red-500' : 
                        item.severity === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <span className="text-white font-medium">{item.severity} Severity</span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-bold">{item.count}</span>
                      <span className="text-gray-400 text-sm ml-2">({item.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">No severity data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderVehicleModelsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-white">Vehicle Models Analysis</h3>
        <Select>
          <SelectTrigger className="w-48 bg-black/20 border-white/20 text-white">
            <SelectValue placeholder="Filter by model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Models</SelectItem>
            <SelectItem value="nexon">Tata Nexon</SelectItem>
            <SelectItem value="harrier">Tata Harrier</SelectItem>
            <SelectItem value="safari">Tata Safari</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.issuesByModel.map((model, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{model.model}</h4>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                  {model.resolutionRate}% resolved
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Issues</span>
                  <span className="text-white font-medium">{model.issues}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Resolved</span>
                  <span className="text-green-400 font-medium">{model.resolved}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${model.resolutionRate}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderManufacturingContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl flex items-center justify-center">
          <Factory className="w-6 h-6 text-orange-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Manufacturing Insights</h3>
          <p className="text-gray-400">Quality control and production analysis</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {data?.commonFlaws.map((flaw, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">{flaw.issue}</h4>
                <Badge 
                  className={`${
                    flaw.severity === 'high' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                    flaw.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30' :
                    'bg-green-500/20 text-green-300 border-green-400/30'
                  }`}
                >
                  {flaw.severity} priority
                </Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Frequency</span>
                  <span className="text-white font-medium">{flaw.frequency} reports</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-400">Affected Models:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {flaw.affectedModels.map((model, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs border-cyan-400/30 text-cyan-300 bg-cyan-500/10">
                        {model}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTrendsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center">
          <TrendingUp className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Trend Analysis</h3>
          <p className="text-gray-400">Monthly patterns and forecasting</p>
        </div>
      </div>
      
      <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
        <CardContent className="p-6">
          <h4 className="text-lg font-semibold text-white mb-4">Monthly Issue Trends</h4>
          <div className="space-y-4">
            {data?.monthlyTrends.map((trend, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <span className="text-white font-medium">{trend.month}</span>
                <div className="flex gap-4">
                  <span className="text-red-400">Issues: {trend.issues}</span>
                  <span className="text-green-400">Resolved: {trend.resolved}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderQualityContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Quality Metrics</h3>
          <p className="text-gray-400">Performance and reliability indicators</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {data?.severityDistribution.map((item, index) => (
          <Card key={index} className="bg-black/20 backdrop-blur-xl border border-white/10">
            <CardContent className="p-6 text-center">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                item.severity === 'High' ? 'bg-red-500/20' :
                item.severity === 'Medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
              }`}>
                <Target className={`w-8 h-8 ${
                  item.severity === 'High' ? 'text-red-400' :
                  item.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                }`} />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">{item.severity} Severity</h4>
              <p className="text-3xl font-bold text-white mb-1">{item.count}</p>
              <p className="text-sm text-gray-400">{item.percentage}% of total</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderGeographicContent = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center">
          <Globe className="w-6 h-6 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-white">Geographic Distribution</h3>
          <p className="text-gray-400">Regional analysis and service coverage</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Service Centers</h4>
            <div className="space-y-3">
              {['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'].map((city, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span className="text-white">{city}</span>
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-400/30">
                    Active
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/20 backdrop-blur-xl border border-white/10">
          <CardContent className="p-6">
            <h4 className="text-lg font-semibold text-white mb-4">Regional Performance</h4>
            <div className="space-y-3">
              {[
                { region: 'North India', performance: 92 },
                { region: 'South India', performance: 88 },
                { region: 'West India', performance: 95 },
                { region: 'East India', performance: 85 }
              ].map((region, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white">{region.region}</span>
                    <span className="text-cyan-400">{region.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${region.performance}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  if (data.overview.totalIssues === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Available</h3>
        <p className="text-gray-500">No vehicle issues have been reported yet. Analytics will appear once users start submitting issues.</p>
      </div>
    );
  }

  // Render content based on active tab
  switch (activeTab) {
    case 'overview':
      return renderOverviewContent();
    case 'vehicle-models':
      return renderVehicleModelsContent();
    case 'manufacturing':
      return renderManufacturingContent();
    case 'trends':
      return renderTrendsContent();
    case 'quality':
      return renderQualityContent();
    case 'geographic':
      return renderGeographicContent();
    default:
      return renderOverviewContent();
  }
}