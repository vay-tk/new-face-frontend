import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { attendanceAPI } from '../api/auth';
import { 
  User, 
  Calendar, 
  CheckCircle, 
  Camera, 
  UserPlus, 
  BarChart3,
  Clock,
  TrendingUp
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await attendanceAPI.getAttendance(user._id, { limit: 5 });
      setStats(response.data.stats);
      setRecentAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const attendancePercentage = stats?.total > 0 
    ? ((stats.present / stats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 py-8">
      <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-blue-600/20 rounded-full p-3">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-5xl font-bold text-white">
            Welcome back, {user.name}!
          </h1>
        </div>
        <p className="text-slate-300 text-lg">
          {user.role === 'student' ? 'Track your attendance and manage your profile' : 'Manage attendance records and student data'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {user.role === 'student' && (
          <>
            {!user.isEnrolled && (
              <Link
                to="/enroll"
                className="group bg-gradient-to-br from-blue-600/80 to-blue-700/80 hover:from-blue-600 hover:to-blue-700 border border-blue-500/30 rounded-2xl p-8 text-white transition-all transform hover:scale-105 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-white/20 rounded-full p-4 group-hover:bg-white/30 transition-colors">
                    <UserPlus className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Face Enrollment</h3>
                    <p className="text-blue-200 text-lg">Set up face recognition</p>
                  </div>
                </div>
                <p className="text-blue-100 text-sm">Complete your face enrollment to start marking attendance securely.</p>
              </Link>
            )}

            {user.isEnrolled && (
              <Link
                to="/mark-attendance"
                className="group bg-gradient-to-br from-green-600/80 to-green-700/80 hover:from-green-600 hover:to-green-700 border border-green-500/30 rounded-2xl p-8 text-white transition-all transform hover:scale-105 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="bg-white/20 rounded-full p-4 group-hover:bg-white/30 transition-colors">
                    <Camera className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Mark Attendance</h3>
                    <p className="text-green-200 text-lg">Check in for today</p>
                  </div>
                </div>
                <p className="text-green-100 text-sm">Use face recognition to mark your attendance quickly and securely.</p>
              </Link>
            )}

            <Link
              to="/attendance"
              className="group bg-gradient-to-br from-purple-600/80 to-purple-700/80 hover:from-purple-600 hover:to-purple-700 border border-purple-500/30 rounded-2xl p-8 text-white transition-all transform hover:scale-105 shadow-xl backdrop-blur-sm"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-white/20 rounded-full p-4 group-hover:bg-white/30 transition-colors">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">View History</h3>
                  <p className="text-purple-200 text-lg">Check past attendance</p>
                </div>
              </div>
              <p className="text-purple-100 text-sm">Review your attendance history and track your progress over time.</p>
            </Link>
          </>
        )}

        {user.role === 'faculty' && (
          <Link
            to="/attendance"
            className="group bg-gradient-to-br from-indigo-600/80 to-indigo-700/80 hover:from-indigo-600 hover:to-indigo-700 border border-indigo-500/30 rounded-2xl p-8 text-white transition-all transform hover:scale-105 shadow-xl backdrop-blur-sm"
          >
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-white/20 rounded-full p-4 group-hover:bg-white/30 transition-colors">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">All Attendance</h3>
                <p className="text-indigo-200 text-lg">View student records</p>
              </div>
            </div>
            <p className="text-indigo-100 text-sm">Monitor and manage attendance records for all students in your classes.</p>
          </Link>
        )}
      </div>

      {/* Stats Cards */}
      {user.role === 'student' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Days</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <div className="bg-blue-500/20 rounded-full p-3">
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Present</p>
                <p className="text-3xl font-bold text-green-400">{stats.present}</p>
              </div>
              <div className="bg-green-500/20 rounded-full p-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Late</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.late}</p>
              </div>
              <div className="bg-yellow-500/20 rounded-full p-3">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Attendance %</p>
                <p className="text-3xl font-bold text-blue-400">{attendancePercentage}%</p>
              </div>
              <div className="bg-blue-500/20 rounded-full p-3">
                <TrendingUp className="w-8 h-8 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Attendance */}
      {user.role === 'student' && recentAttendance.length > 0 && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <Clock className="w-6 h-6 text-blue-400" />
            <span>Recent Attendance</span>
          </h2>
          <div className="space-y-3">
            {recentAttendance.map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    record.status === 'present' ? 'bg-green-400' :
                    record.status === 'late' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-white font-semibold">{record.date}</span>
                </div>
                <div className="text-right">
                  <span className={`capitalize text-sm font-medium ${
                    record.status === 'present' ? 'text-green-400' :
                    record.status === 'late' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {record.status}
                  </span>
                  <p className="text-xs text-slate-400">
                    {new Date(record.markedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <User className="w-6 h-6 text-purple-400" />
          <span>Profile Information</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm font-medium">Name</label>
              <p className="text-white font-semibold text-lg">{user.name}</p>
            </div>
            <div>
              <label className="text-slate-400 text-sm font-medium">Email</label>
              <p className="text-white font-semibold text-lg">{user.email}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-slate-400 text-sm font-medium">Role</label>
              <p className="text-white font-semibold text-lg capitalize">{user.role}</p>
            </div>
            {user.rollNo && (
              <div>
                <label className="text-slate-400 text-sm font-medium">Roll Number</label>
                <p className="text-white font-semibold text-lg">{user.rollNo}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;