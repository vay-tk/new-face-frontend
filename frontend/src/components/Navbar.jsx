import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { User, LogOut, Camera, Calendar, Home } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  if (!user) return null;

  return (
    <nav className="bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600/20 rounded-full p-2">
              <Camera className="w-8 h-8 text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-white">FaceAttend</span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                isActive('/') 
                  ? 'bg-blue-600/80 text-white shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </Link>

            {user.role === 'student' && (
              <>
                <Link
                  to="/mark-attendance"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isActive('/mark-attendance')
                      ? 'bg-blue-600/80 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span className="font-medium">Mark Attendance</span>
                </Link>

                <Link
                  to="/attendance"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                    isActive('/attendance')
                      ? 'bg-blue-600/80 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">History</span>
                </Link>
              </>
            )}

            {user.role === 'faculty' && (
              <Link
                to="/attendance"
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                  isActive('/attendance')
                    ? 'bg-blue-600/80 text-white shadow-lg'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span className="font-medium">All Attendance</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="bg-slate-700/50 rounded-full p-2">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block">
                <span className="text-sm font-medium">{user.name}</span>
                <span className="text-xs bg-blue-600/80 px-2 py-1 rounded-full ml-2">
                {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-red-600/20 hover:border-red-500/30 border border-transparent transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;