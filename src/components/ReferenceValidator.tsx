import React, { useState } from 'react';
import { Shield, Check, X, AlertCircle, Loader } from 'lucide-react';

interface ValidationResult {
  success: boolean;
  message: string;
}

interface ReferenceValidatorProps {
  onValidationComplete: (isValid: boolean, message: string) => void;
}

export const ReferenceValidator: React.FC<ReferenceValidatorProps> = ({ onValidationComplete }) => {
  const [referenceCode, setReferenceCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

  const validateReferenceCode = async () => {
    if (!referenceCode.trim()) {
      setValidationResult({
        success: false,
        message: 'Please enter a reference code'
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Simulate API call to backend validation service
      const response = await fetch('/api/validate-reference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          referenceCode: referenceCode.trim(),
          timestamp: new Date().toISOString()
        })
      });

      const result = await response.json();
      
      setValidationResult(result);
      onValidationComplete(result.success, result.message);
      
    } catch (error) {
      const errorResult = {
        success: false,
        message: 'Validation service temporarily unavailable. Please try again.'
      };
      setValidationResult(errorResult);
      onValidationComplete(false, errorResult.message);
    } finally {
      setIsValidating(false);
    }
  };

  const getValidationIcon = () => {
    if (isValidating) return <Loader className="w-5 h-5 animate-spin" />;
    if (validationResult?.success) return <Check className="w-5 h-5 text-green-400" />;
    if (validationResult && !validationResult.success) return <X className="w-5 h-5 text-red-400" />;
    return <Shield className="w-5 h-5" />;
  };

  const getValidationColor = () => {
    if (validationResult?.success) return 'border-green-400 bg-green-400/10';
    if (validationResult && !validationResult.success) return 'border-red-400 bg-red-400/10';
    return 'border-yellow-400/30 bg-white/10';
  };

  return (
    <div className="bg-gradient-to-br from-blue-800/40 to-purple-800/40 backdrop-blur-md rounded-2xl p-6 border-2 border-blue-400/30">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <Shield className="w-6 h-6 mr-2 text-blue-300" />
        Reference Code Validation
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white mb-2 font-semibold">
            Enter Your Reference Code *
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={referenceCode}
              onChange={(e) => setReferenceCode(e.target.value.toUpperCase())}
              placeholder="NRL123456ABCD1234"
              className={`flex-1 px-4 py-3 rounded-lg border-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-300/50 transition-all duration-300 ${getValidationColor()}`}
              disabled={isValidating}
            />
            <button
              onClick={validateReferenceCode}
              disabled={isValidating || !referenceCode.trim()}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center"
            >
              {getValidationIcon()}
              <span className="ml-2 hidden sm:inline">
                {isValidating ? 'Validating...' : 'Validate'}
              </span>
            </button>
          </div>
        </div>

        {validationResult && (
          <div className={`p-4 rounded-lg border-2 ${
            validationResult.success 
              ? 'border-green-400 bg-green-400/10' 
              : 'border-red-400 bg-red-400/10'
          }`}>
            <div className="flex items-center mb-2">
              {validationResult.success ? (
                <Check className="w-5 h-5 text-green-400 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              )}
              <span className={`font-semibold ${
                validationResult.success ? 'text-green-300' : 'text-red-300'
              }`}>
                {validationResult.success ? 'Validation Successful' : 'Validation Failed'}
              </span>
            </div>
            <p className={`text-sm ${
              validationResult.success ? 'text-green-200' : 'text-red-200'
            }`}>
              {validationResult.message}
            </p>
          </div>
        )}

        <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-yellow-200 text-sm">
              <p className="font-semibold mb-1">Important:</p>
              <ul className="space-y-1 text-xs">
                <li>• Reference codes are case-sensitive</li>
                <li>• Only codes generated through our website are valid</li>
                <li>• Each code can only be used once</li>
                <li>• Validation is required before payment processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};