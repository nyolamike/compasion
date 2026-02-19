import React, { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import type { DbParticipantRegistration, DbUploadedDocument } from '@/lib/database';
import {
  UsersIcon,
  XIcon,
  DownloadIcon,
  EyeIcon,
  FileIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BabyIcon,
} from '@/components/icons/Icons';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface ParticipantRegistrationListProps {
  trainingSessionId: string;
  onClose: () => void;
}

const ParticipantRegistrationList: React.FC<ParticipantRegistrationListProps> = ({
  trainingSessionId,
  onClose,
}) => {
  const [registrations, setRegistrations] = useState<DbParticipantRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<DbParticipantRegistration | null>(null);
  const [documents, setDocuments] = useState<DbUploadedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegistrations();
  }, [trainingSessionId]);

  const loadRegistrations = async () => {
    try {
      setIsLoading(true);
      const data = await db.getRegistrationsBySessionId(trainingSessionId);
      setRegistrations(data);
    } catch (error) {
      console.error('Failed to load registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load participant registrations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async (registrationId: string) => {
    try {
      const docs = await db.getUploadedDocuments(registrationId);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleViewDetails = async (registration: DbParticipantRegistration) => {
    setSelectedRegistration(registration);
    if (registration.attending_with_baby) {
      await loadDocuments(registration.id);
    }
  };

  const handleExportContacts = () => {
    if (registrations.length === 0) {
      toast({
        title: 'No Data',
        description: 'No registrations to export',
      });
      return;
    }

    // Create CSV content
    const headers = ['Name', 'Email', 'Mobile', 'Position', 'FCP Number', 'FCP Name', 'Cluster', 'Region', 'Baby Attendance', 'Registration Date'];
    const rows = registrations.map(reg => [
      reg.participant_name,
      reg.email_address,
      reg.mobile_number,
      reg.participant_position,
      reg.fcp_number,
      reg.fcp_name,
      reg.cluster,
      reg.region,
      reg.attending_with_baby ? 'Yes' : 'No',
      new Date(reg.registered_at).toLocaleString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `participant-registrations-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Export Successful',
      description: `Exported ${registrations.length} participant contacts`,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <UsersIcon size={20} className="text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Registered Participants</h2>
                <p className="text-sm text-slate-500">{registrations.length} participants registered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportContacts}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <DownloadIcon size={16} />
                Export CSV
              </Button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : registrations.length === 0 ? (
              <div className="text-center py-12">
                <UsersIcon size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-lg font-medium text-slate-800">No Registrations Yet</h3>
                <p className="text-slate-500 mt-2">Participants will appear here once they register</p>
              </div>
            ) : (
              <div className="space-y-3">
                {registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-slate-800">{registration.participant_name}</h4>
                          {registration.attending_with_baby && (
                            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs font-medium flex items-center gap-1">
                              <BabyIcon size={12} />
                              With Baby
                            </span>
                          )}
                          {registration.attendance_confirmed && (
                            <CheckCircleIcon size={16} className="text-emerald-500" />
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                          <div>
                            <span className="text-slate-500">Email:</span> {registration.email_address}
                          </div>
                          <div>
                            <span className="text-slate-500">Mobile:</span> {registration.mobile_number}
                          </div>
                          <div>
                            <span className="text-slate-500">Position:</span> {registration.participant_position}
                          </div>
                          <div>
                            <span className="text-slate-500">FCP:</span> {registration.fcp_name} ({registration.fcp_number})
                          </div>
                          <div>
                            <span className="text-slate-500">Cluster:</span> {registration.cluster}
                          </div>
                          <div>
                            <span className="text-slate-500">Region:</span> {registration.region}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-400">
                          Registered: {new Date(registration.registered_at).toLocaleString()}
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewDetails(registration)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <EyeIcon size={16} />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Participant Details Modal */}
      {selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold text-slate-800">Participant Details</h3>
              <button
                onClick={() => {
                  setSelectedRegistration(null);
                  setDocuments([]);
                }}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Personal Information */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Personal Information</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Full Name</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.participant_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Position</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.participant_position}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Email Address</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.email_address}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Mobile Number</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.mobile_number}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* FCP Information */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">FCP Information</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">FCP Number</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.fcp_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">FCP Name</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.fcp_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Cluster</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.cluster}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Region</p>
                      <p className="font-medium text-slate-800">{selectedRegistration.region}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Registration Details */}
              <div>
                <h4 className="text-sm font-semibold text-slate-700 mb-3">Registration Details</h4>
                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Registration Reference</p>
                      <p className="font-medium text-slate-800 font-mono">{selectedRegistration.registration_reference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Registration Date</p>
                      <p className="font-medium text-slate-800">
                        {new Date(selectedRegistration.registered_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Attendance Confirmed</p>
                      <p className="font-medium text-slate-800 flex items-center gap-2">
                        {selectedRegistration.attendance_confirmed ? (
                          <>
                            <CheckCircleIcon size={16} className="text-emerald-500" />
                            Yes
                          </>
                        ) : (
                          <>
                            <AlertCircleIcon size={16} className="text-amber-500" />
                            No
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Baby Attendance</p>
                      <p className="font-medium text-slate-800">
                        {selectedRegistration.attending_with_baby ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              {selectedRegistration.attending_with_baby && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">Uploaded Documents</h4>
                  <div className="bg-slate-50 rounded-xl p-4">
                    {documents.length === 0 ? (
                      <p className="text-sm text-slate-500">No documents uploaded</p>
                    ) : (
                      <div className="space-y-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 bg-white rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <FileIcon size={20} className="text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-800">{doc.file_name}</p>
                                <p className="text-xs text-slate-500">
                                  {doc.document_type === 'nanny_approval' ? 'Nanny Approval' : 'Waiver of Liability'} •{' '}
                                  {(doc.file_size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_path, '_blank')}
                            >
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantRegistrationList;
