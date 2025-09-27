import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { attendanceAPI } from '../api/auth';
import WebcamCapture from '../components/WebcamCapture';
import { 
  Camera, 
  CheckCircle, 
  Eye, 
  RotateCcw, 
  Clock, 
  User,
  AlertCircle,
  Zap,
  Target,
  Activity
} from 'lucide-react';

const MarkAttendance = () => {
  const { user } = useAuth();
  const [step, setStep] = useState('ready'); // ready, capturing, processing, success, error
  const [capturedFrames, setCapturedFrames] = useState([]);
  const [probeImage, setProbeImage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [attendanceResult, setAttendanceResult] = useState(null);
  const [error, setError] = useState('');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const webcamRef = useRef(null);
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [instructionStep, setInstructionStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const today = new Date().toISOString().split('T')[0];

  const livenessInstructions = [
    { icon: Target, text: 'Position your face in the center', color: 'text-blue-400' },
    { icon: Eye, text: 'Look directly at the camera', color: 'text-green-400' },
    { icon: Activity, text: 'Blink your eyes twice slowly', color: 'text-purple-400' },
    { icon: RotateCcw, text: 'Turn your head left and right', color: 'text-orange-400' },
    { icon: Zap, text: 'Stay still for final capture', color: 'text-red-400' }
  ];

  const captureInstructions = [
    'Get ready... Look at the camera',
    'Now BLINK your eyes twice slowly',
    'Good! Now turn your head LEFT',
    'Now turn your head RIGHT', 
    'Perfect! Stay still for final capture'
  ];

  const captureSequence = useCallback(() => {
    setStep('capturing');
    setCountdown(3);
    setError('');
    setCapturedFrames([]);
    setInstructionStep(0);
    setProgress(0);
    
    // Countdown
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startCapturing();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const startCapturing = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    const frames = [];
    let frameCount = 0;
    const totalFrames = 8;
    
    if (!webcamRef.current || !webcamRef.current.isReady()) {
      setError('Camera not ready. Please try again.');
      setStep('error');
      return;
    }

    const showInstruction = (step) => {
      if (step < captureInstructions.length) {
        setCurrentInstruction(captureInstructions[step]);
        setInstructionStep(step);
      }
    };

    intervalRef.current = setInterval(() => {
      if (frameCount === 0) showInstruction(0);
      if (frameCount === 1) showInstruction(1);
      if (frameCount === 3) showInstruction(2);
      if (frameCount === 5) showInstruction(3);
      if (frameCount === 7) showInstruction(4);

      if (frameCount < totalFrames) {
        const frame = webcamRef.current.getScreenshot();
        
        if (frame) {
          frames.push(frame);
          frameCount++;
          setCapturedFrames([...frames]);
          setProgress((frameCount / totalFrames) * 100);
        }
      }

      if (frameCount >= totalFrames) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setCurrentInstruction('Processing...');
        
        timeoutRef.current = setTimeout(() => {
          const probe = webcamRef.current ? webcamRef.current.getScreenshot() : null;
          
          if (probe && frames.length === totalFrames) {
            setCapturedFrames(frames);
            setProbeImage(probe);
            processAttendance(frames, probe);
          } else {
            setError('Failed to capture all required images. Please try again.');
            setStep('error');
          }
          timeoutRef.current = null;
        }, 1000);
      }
    }, 1200);
  }, []);

  const processAttendance = async (frames, probe) => {
    setStep('processing');
    setCurrentInstruction('');
    setProgress(100);
    
    try {
      const response = await attendanceAPI.markAttendance({
        frames,
        probeImage: probe,
        date: today
      });

      setAttendanceResult(response.data);
      setStep('success');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to mark attendance';
      setError(errorMessage);
      setStep('error');
    }
  };

  const reset = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setStep('ready');
    setCapturedFrames([]);
    setProbeImage('');
    setAttendanceResult(null);
    setError('');
    setCountdown(0);
    setCurrentInstruction('');
    setInstructionStep(0);
    setProgress(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!user.isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 border border-yellow-600/50 rounded-2xl p-8 text-center backdrop-blur-sm">
            <div className="bg-yellow-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Eye className="w-10 h-10 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Face Not Enrolled</h2>
            <p className="text-yellow-200 mb-6 leading-relaxed">
              Please complete face enrollment before marking attendance. This helps us verify your identity securely.
            </p>
            <a
              href="/enroll"
              className="inline-flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <Camera className="w-5 h-5" />
              <span>Enroll Face Now</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="bg-blue-600/20 rounded-full p-3">
              <Camera className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Mark Attendance</h1>
          </div>
          <div className="flex items-center justify-center space-x-2 text-slate-300">
            <User className="w-4 h-4" />
            <span>{user.name}</span>
            <span className="text-slate-500">•</span>
            <span>{today}</span>
          </div>
        </div>

        {/* Success State */}
        {step === 'success' && attendanceResult && (
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border border-green-600/50 rounded-2xl p-8 text-center backdrop-blur-sm">
              <div className="bg-green-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center animate-pulse">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Attendance Marked!</h2>
              <p className="text-green-200 mb-6 text-lg">
                Your attendance has been successfully recorded.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-800/30 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {(attendanceResult.confidence * 100).toFixed(1)}%
                  </div>
                  <div className="text-green-200 text-sm">Confidence</div>
                </div>
                <div className="bg-green-800/30 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {(attendanceResult.livenessScore * 100).toFixed(1)}%
                  </div>
                  <div className="text-green-200 text-sm">Liveness</div>
                </div>
              </div>
              
              <div className="text-sm text-green-300 mb-6">
                Time: {new Date(attendanceResult.attendance.markedAt).toLocaleString()}
              </div>
              
              <button
                onClick={reset}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Mark Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {step === 'error' && (
          <div className="max-w-lg mx-auto mb-8">
            <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 border border-red-600/50 rounded-2xl p-8 text-center backdrop-blur-sm">
              <div className="bg-red-500/20 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Attendance Failed</h2>
              <p className="text-red-200 mb-6 leading-relaxed">{error}</p>
              
              {error.includes('does not match') && (
                <div className="bg-red-800/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 text-red-100 text-sm font-semibold mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Security Notice</span>
                  </div>
                  <p className="text-red-200 text-sm">
                    Only {user.name} can mark attendance for this account. 
                    If you are not {user.name}, please log out and use your own account.
                  </p>
                </div>
              )}
              
              <button
                onClick={reset}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all transform hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Interface */}
        {(step === 'ready' || step === 'capturing' || step === 'processing') && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Camera Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <Camera className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">Live Camera</h2>
                </div>
                
                <div className="relative">
                  <div className="bg-black rounded-xl overflow-hidden">
                    <WebcamCapture
                      ref={webcamRef}
                      instructions={[]}
                      isCapturing={step === 'capturing'}
                    />
                  </div>
                  
                  {/* Countdown Overlay */}
                  {countdown > 0 && (
                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-xl">
                      <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center animate-pulse">
                        <span className="text-4xl font-bold text-gray-800">{countdown}</span>
                      </div>
                    </div>
                  )}

                  {/* Live Instructions Overlay */}
                  {step === 'capturing' && currentInstruction && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm rounded-xl p-4">
                        <div className="text-center">
                          <p className="text-white font-semibold text-lg mb-3">{currentInstruction}</p>
                          <div className="flex justify-center space-x-2">
                            {captureInstructions.map((_, index) => (
                              <div
                                key={index}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                  index <= instructionStep ? 'bg-white scale-110' : 'bg-white/30'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Processing Overlay */}
                  {step === 'processing' && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center rounded-xl">
                      <div className="bg-black/70 rounded-xl px-8 py-6 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-white font-semibold">Processing attendance...</p>
                        <p className="text-blue-200 text-sm mt-2">Verifying identity and liveness</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {(step === 'capturing' || step === 'processing') && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-slate-300 mb-2">
                      <span>
                        {step === 'capturing' ? `Capturing frames... (${capturedFrames.length}/8)` : 'Processing...'}
                      </span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Panel */}
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  <span>Liveness Steps</span>
                </h2>
                
                <div className="space-y-3">
                  {livenessInstructions.map((instruction, index) => {
                    const Icon = instruction.icon;
                    const isActive = step === 'capturing' && instructionStep >= index;
                    const isCompleted = step === 'capturing' && instructionStep > index;
                    
                    return (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-300 ${
                          isActive 
                            ? 'bg-blue-600/30 border border-blue-500/50' 
                            : isCompleted
                            ? 'bg-green-600/20 border border-green-500/30'
                            : 'bg-slate-700/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted 
                            ? 'bg-green-600 text-white' 
                            : isActive 
                            ? 'bg-blue-600 text-white animate-pulse' 
                            : 'bg-slate-600 text-slate-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`font-medium ${
                          isActive ? 'text-blue-200' : isCompleted ? 'text-green-200' : 'text-slate-300'
                        }`}>
                          {instruction.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Start Button */}
              {step === 'ready' && (
                <button
                  onClick={captureSequence}
                  className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <Camera className="w-6 h-6" />
                  <span>Start Attendance</span>
                </button>
              )}

              {/* Tips */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-600/30 rounded-2xl p-6">
                <h3 className="text-yellow-200 font-semibold mb-3 flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Pro Tips</span>
                </h3>
                <ul className="text-yellow-100 text-sm space-y-2">
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Ensure good lighting on your face</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Follow instructions during capture</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Blink clearly when prompted</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Keep face centered in frame</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></span>
                    <span>One attendance per day only</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkAttendance;