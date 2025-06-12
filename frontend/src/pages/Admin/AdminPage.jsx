import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Users, 
  Activity, 
  BarChart3, 
  Server,
  TrendingUp,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { adminAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import StatCard from '../../components/UI/StatCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, analyticsRes, healthRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getAnalytics({ period: '30d' }),
        adminAPI.getSystemHealth()
      ]);

      setStats(statsRes.data.stats);
      setAnalytics(analyticsRes.data.analytics);
      setSystemHealth(healthRes.data.systemHealth);
    } catch (error) {
      console.error('Error loading admin dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Shield className="w-8 h-8 mr-3 text-red-500" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              System overview and user management
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Button variant="outline" onClick={loadDashboardData}>
              <RefreshCw className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Refresh</span>
            </Button>
            <Link to="/admin/users">
              <Button>
                <Users className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">Manage Users</span>
              </Button>
            </Link>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            subtitle={`${stats?.users?.recentRegistrations || 0} new this week`}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Active Users"
            value={stats?.users?.active || 0}
            subtitle={`${stats?.users?.activeInLast30Days || 0} active (30d)`}
            icon={UserCheck}
            color="green"
          />
          <StatCard
            title="Diet Plans"
            value={stats?.content?.dietPlans || 0}
            subtitle={`${stats?.engagement?.avgDietPlansPerUser || 0} avg per user`}
            icon={Activity}
            color="purple"
          />
          <StatCard
            title="Exercise Plans"
            value={stats?.content?.exercisePlans || 0}
            subtitle={`${stats?.engagement?.avgExercisePlansPerUser || 0} avg per user`}
            icon={TrendingUp}
            color="orange"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Growth Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">User Growth (30 Days)</h3>
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              
              {analytics?.userGrowth?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="_id" 
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value) => [value, 'New Users']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No growth data available</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Fitness Goals Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Fitness Goals Distribution</h3>
                <Activity className="w-6 h-6 text-green-500" />
              </div>
              
              {analytics?.fitnessGoals?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.fitnessGoals}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="_id"
                      >
                        {analytics.fitnessGoals.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No fitness goals data available</p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <Server className="w-6 h-6 text-purple-500" />
            </div>
            
            {systemHealth && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Database Status */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Database</h4>
                  <p className="text-sm text-green-700 mb-3">Status: {systemHealth.database.status}</p>
                  <div className="space-y-1 text-xs text-green-600">
                    <p>Users: {systemHealth.database.collections.users}</p>
                    <p>Diet Plans: {systemHealth.database.collections.dietPlans}</p>
                    <p>Exercise Plans: {systemHealth.database.collections.exercisePlans}</p>
                    <p>Health Records: {systemHealth.database.collections.healthRecords}</p>
                  </div>
                </div>

                {/* Server Status */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Server</h4>
                  <div className="space-y-1 text-xs text-blue-600">
                    <p>Uptime: {Math.floor(systemHealth.server.uptime / 3600)}h {Math.floor((systemHealth.server.uptime % 3600) / 60)}m</p>
                    <p>Memory: {Math.round(systemHealth.server.memory.heapUsed / 1024 / 1024)}MB used</p>
                    <p>Node.js: {systemHealth.server.version}</p>
                    <p>Environment: {systemHealth.server.environment}</p>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Last Updated</h4>
                  <p className="text-sm text-gray-600">
                    {format(new Date(systemHealth.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={loadDashboardData}
                    className="mt-3"
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    isActive: '',
    role: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadUsers();
  }, [pagination.page, filters, searchTerm]); // Added dependencies

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Clean filters to remove empty values
      const cleanedFilters = {};
      if (filters.isActive !== '') cleanedFilters.isActive = filters.isActive;
      if (filters.role !== '') cleanedFilters.role = filters.role;

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(searchTerm && { search: searchTerm }),
        ...cleanedFilters
      };

      const response = await adminAPI.getAllUsers(params);

      setUsers(response.data.users);
      setPagination({
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages
      });
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  // Improved toggleUserStatus function
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await adminAPI.updateUserStatus(userId, { isActive: newStatus });
      
      setUsers(users.map(user => 
        user._id === userId ? { ...user, isActive: newStatus } : user
      ));
      
      toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  // Improved deleteUser function
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      
      // Update pagination total count
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1,
        pages: Math.ceil((prev.total - 1) / prev.limit)
      }));
      
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  // Handle pagination navigation
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading users..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="w-8 h-8 mr-3 text-blue-500" />
              User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage and monitor all registered users
            </p>
          </div>
          <Link to="/admin">
            <Button variant="outline">
              ← Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Search by name or email..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.isActive}
                  onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Users</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Roles</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ isActive: '', role: '' });
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name || 'No name'}</div>
                              <div className="text-sm text-gray-500">{user.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.mobile || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.lastLogin 
                            ? format(new Date(user.lastLogin), 'MMM dd, yyyy')
                            : 'Never'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => toggleUserStatus(user._id, user.isActive)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.isActive
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                            >
                              {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => deleteUser(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const AdminPage = () => {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<UserManagement />} />
    </Routes>
  );
};

export default AdminPage;