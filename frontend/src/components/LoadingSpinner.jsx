import { Camera } from 'lucide-react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="relative">
          <Camera className="w-12 h-12 text-blue-400 mx-auto animate-pulse" />
          <div className="absolute inset-0 w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-300">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;