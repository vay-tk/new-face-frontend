import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import WebcamCapture from '../components/WebcamCapture';
import { Camera, CheckCircle, Upload, X } from 'lucide-react';

const FaceEnrollment = () => {
  const [capturedImages, setCapturedImages] = useState([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const instructions = [
    'Position your face in the center of the frame',
    'Ensure good lighting on your face',
    'Look directly at the camera',
    'Capture 3-5 different angles (front, slight left, slight right)',
    'Keep a neutral expression'
  ];

  const handleCapture = (imageSrc) => {
    if (capturedImages.length < 5) {
      setCapturedImages(prev => [...prev, imageSrc]);
      setError('');
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/') && file.size < 5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (capturedImages.length < 5) {
            setCapturedImages(prev => [...prev, e.target.result]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleEnroll = async () => {
    if (capturedImages.length < 3) {
      setError('Please capture at least 3 images for enrollment');
      return;
    }

    setEnrolling(true);
    setError('');

    try {
      await authAPI.enrollFace(capturedImages);
      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.error || 'Face enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-900/50 border border-green-600 rounded-xl p-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Enrollment Successful!</h2>
          <p className="text-green-200">
            Your face has been successfully enrolled. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Face Enrollment</h1>
        <p className="text-slate-400">
          Capture 3-5 clear images of your face from different angles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Capture Images</h2>
          <WebcamCapture
            onCapture={handleCapture}
            isCapturing={isCapturing}
            instructions={instructions}
          />
          
          <div className="text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 mx-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Images</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Captured Images Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Captured Images ({capturedImages.length}/5)
            </h2>
            <div className="text-sm text-slate-400">
              {capturedImages.length >= 3 ? 'Ready to enroll' : 'Need at least 3 images'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {capturedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Capture ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-slate-600"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({ length: 5 - capturedImages.length }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="w-full h-32 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center"
              >
                <Camera className="w-8 h-8 text-slate-500" />
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-blue-900/50 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Tips for better enrollment:</h3>
              <ul className="text-blue-200 text-sm space-y-1">
                <li>• Use good lighting, avoid shadows</li>
                <li>• Face the camera directly</li>
                <li>• Include slight head rotations (left/right)</li>
                <li>• Keep a neutral facial expression</li>
                <li>• Remove glasses if possible</li>
              </ul>
            </div>

            <button
              onClick={handleEnroll}
              disabled={capturedImages.length < 3 || enrolling}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {enrolling ? 'Enrolling...' : `Enroll with ${capturedImages.length} images`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceEnrollment;