import { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import { Camera, RotateCcw } from 'lucide-react';

const WebcamCapture = forwardRef(({ onCapture, isCapturing, instructions = [] }, ref) => {
  const webcamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('user');

  useImperativeHandle(ref, () => ({
    getScreenshot: () => {
      if (webcamRef.current) {
        try {
          const screenshot = webcamRef.current.getScreenshot();
          console.log('WebcamCapture getScreenshot called:', screenshot ? 'Success' : 'Failed');
          return screenshot;
        } catch (error) {
          console.error('Error taking screenshot:', error);
          return null;
        }
      }
      console.warn('Webcam ref not available');
      return null;
    },
    isReady: () => {
      return webcamRef.current !== null;
    }
  }));

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const captureFrame = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc && onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [onCapture]);

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: facingMode
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-black rounded-lg overflow-hidden">
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          screenshotQuality={0.8}
          videoConstraints={videoConstraints}
          className="w-full h-auto"
          style={{ maxHeight: '480px' }}
          onUserMedia={() => console.log('Webcam ready')}
          onUserMediaError={(error) => console.error('Webcam error:', error)}
        />
        
        {isCapturing && (
          <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
            <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2">
              <p className="text-white text-center">Capturing...</p>
            </div>
          </div>
        )}

        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-70 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {instructions.length > 0 && (
        <div className="bg-blue-900/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Instructions:</h3>
          <ul className="text-blue-200 space-y-1">
            {instructions.map((instruction, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center space-x-4">
        <button
          onClick={captureFrame}
          disabled={isCapturing}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-semibold transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>{isCapturing ? 'Capturing...' : 'Capture'}</span>
        </button>
      </div>
    </div>
  );
});

WebcamCapture.displayName = 'WebcamCapture';

export default WebcamCapture;