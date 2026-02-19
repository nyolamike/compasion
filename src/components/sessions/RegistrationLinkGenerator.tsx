import React, { useState, useEffect } from 'react';
import { RegistrationLinkService } from '@/lib/registrationLinkService';
import { db } from '@/lib/database';
import type { RegistrationLink } from '@/types';
import { 
  LinkIcon, 
  CheckCircleIcon, 
  AlertCircleIcon,
  CopyIcon
} from '@/components/icons/Icons';

interface RegistrationLinkGeneratorProps {
  trainingSessionId: string;
  currentUserId: string;
  onClose?: () => void;
}

const RegistrationLinkGenerator: React.FC<RegistrationLinkGeneratorProps> = ({
  trainingSessionId,
  currentUserId,
  onClose
}) => {
  const [registrationLink, setRegistrationLink] = useState<RegistrationLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [linkService] = useState(() => new RegistrationLinkService(db));

  useEffect(() => {
    loadExistingLink();
  }, [trainingSessionId]);

  const loadExistingLink = async () => {
    try {
      setLoading(true);
      const existingLink = await linkService.getLinkBySessionId(trainingSessionId);
      if (existingLink && existingLink.isActive) {
        setRegistrationLink(existingLink);
      }
    } catch (err) {
      console.error('Error loading existing link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const link = await linkService.generateLink(trainingSessionId, currentUserId);
      setRegistrationLink(link);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate registration link');
      console.error('Error generating link:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!registrationLink) return;

    const fullUrl = `${window.location.origin}/register/${registrationLink.token}`;
    
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFullUrl = () => {
    if (!registrationLink) return '';
    return `${window.location.origin}/register/${registrationLink.token}`;
  };

  const formatExpiryDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircleIcon size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {!registrationLink ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <LinkIcon size={32} className="text-teal-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Generate Registration Link
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Create a unique registration link that participants can use to self-register for this training session.
          </p>
          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <LinkIcon size={20} />
                Generate Link
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircleIcon size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Registration Link Active</p>
                <p className="text-xs text-emerald-600 mt-1">
                  Expires on {formatExpiryDate(registrationLink.expiresAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Registration URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={getFullUrl()}
                readOnly
                className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleCopyLink}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-teal-500 text-white hover:bg-teal-600'
                }`}
              >
                {copied ? (
                  <>
                    <CheckCircleIcon size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <CopyIcon size={18} />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm font-medium text-blue-800 mb-2">How to use this link:</p>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Share this link with potential participants via email, SMS, or messaging apps</li>
              <li>Participants can register without needing system access</li>
              <li>The link will automatically expire on the training session date</li>
              <li>You can view all registrations in the session details</li>
            </ul>
          </div>
        </div>
      )}

      {onClose && (
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default RegistrationLinkGenerator;
