import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { attendanceAPI } from '../api/auth';
import AttendanceCard from '../components/AttendanceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Calendar, Download, Filter, Search } from 'lucide-react';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchAttendance();
  }, [currentPage, dateFilter]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20
      };

      if (dateFilter) {
        params.date = dateFilter;
      }

      let response;
      if (user.role === 'faculty') {
        response = await attendanceAPI.getAllAttendance(params);
      } else {
        response = await attendanceAPI.getAttendance(user._id, params);
      }

      setAttendance(response.data.attendance);
      setPagination(response.data.pagination);
      
      if (response.data.stats) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const exportAttendance = () => {
    // Simple CSV export
    const csvContent = [
      ['Date', 'Status', 'Marked At', 'Method', 'Confidence'].join(','),
      ...attendance.map(record => [
        record.date,
        record.status,
        new Date(record.markedAt).toLocaleString(),
        record.method,
        record.confidence ? (record.confidence * 100).toFixed(1) + '%' : ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${user.name}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading && currentPage === 1) {
    return <LoadingSpinner message="Loading attendance history..." />;
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {user.role === 'faculty' ? 'All Attendance Records' : 'Attendance History'}
        </h1>
        <p className="text-slate-400">
          {user.role === 'faculty' ? 'View and manage student attendance' : 'Track your attendance over time'}
        </p>
      </div>

      {/* Stats Cards */}
      {user.role === 'student' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-slate-400">Total Days</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-green-400">{stats.present}</p>
            <p className="text-slate-400">Present</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-yellow-400">{stats.late}</p>
            <p className="text-slate-400">Late</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-center">
            <p className="text-2xl font-bold text-blue-400">
              {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%
            </p>
            <p className="text-slate-400">Attendance Rate</p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {user.role === 'student' && (
          <button
            onClick={exportAttendance}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* Attendance Records */}
      {attendance.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-300 mb-2">No Attendance Records</h3>
          <p className="text-slate-400">
            {dateFilter ? 'No records found for the selected date.' : 'Start marking attendance to see your history here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attendance.map((record) => (
              <AttendanceCard key={record._id} attendance={record} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-slate-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AttendanceHistory;