import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../api/auth';
import { Camera, Mail, Lock, User, Hash, UserCheck } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNo: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.register(formData);
      login(response.data.user, response.data.token);
      navigate('/enroll');
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600/20 p-4 rounded-full backdrop-blur-sm border border-blue-500/30">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-slate-300 text-lg">Join the attendance system</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                name="name"
                required
                className="block w-full pl-10 pr-3 py-4 border border-slate-600/50 rounded-xl bg-slate-700/30 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                required
                className="block w-full pl-10 pr-3 py-4 border border-slate-600/50 rounded-xl bg-slate-700/30 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                name="password"
                required
                minLength="6"
                className="block w-full pl-10 pr-3 py-4 border border-slate-600/50 rounded-xl bg-slate-700/30 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserCheck className="h-5 w-5 text-slate-400" />
              </div>
              <select
                name="role"
                className="block w-full pl-10 pr-3 py-4 border border-slate-600/50 rounded-xl bg-slate-700/30 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none text-lg"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="rollNo"
                  required
                  className="block w-full pl-10 pr-3 py-4 border border-slate-600/50 rounded-xl bg-slate-700/30 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                  placeholder="Roll number"
                  value={formData.rollNo}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600/50 rounded-xl p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-6 border border-transparent rounded-xl text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
          >
            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
              <UserCheck className="h-5 w-5 text-blue-300 group-hover:text-blue-200" />
            </span>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>

          <div className="text-center">
            <span className="text-slate-300">Already have an account? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;