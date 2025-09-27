import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

const AttendanceCard = ({ attendance }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'text-green-400 bg-green-900/20';
      case 'absent':
        return 'text-red-400 bg-red-900/20';
      case 'late':
        return 'text-yellow-400 bg-yellow-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-white font-medium">{attendance.date}</span>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${getStatusColor(attendance.status)}`}>
          {getStatusIcon(attendance.status)}
          <span className="text-sm font-medium capitalize">{attendance.status}</span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-300">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4" />
          <span>Marked at: {new Date(attendance.markedAt).toLocaleString()}</span>
        </div>

        {attendance.userId && typeof attendance.userId === 'object' && (
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>{attendance.userId.name} ({attendance.userId.rollNo || attendance.userId.email})</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Method: {attendance.method.replace('_', ' ')}</span>
          {attendance.confidence && (
            <span>Confidence: {(attendance.confidence * 100).toFixed(1)}%</span>
          )}
        </div>

        {attendance.livenessScore && (
          <div className="text-xs text-blue-300">
            Liveness Score: {(attendance.livenessScore * 100).toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceCard;