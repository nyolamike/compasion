import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/database';
import type { DbParticipantRegistration } from '@/lib/database';
import {
  SearchIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  WifiIcon,
  WifiOffIcon,
  RefreshIcon,
  CalendarIcon,
  UsersIcon,
  CheckIcon,
  UserCheckIcon,
} from '@/components/icons/Icons';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface CombinedParticipant {
  id: string;
  name: string;
  organization: string;
  type: 'manual' | 'registered';
  registrationData?: DbParticipantRegistration;
}

const AttendanceSheet: React.FC = () => {
  const { 
    trainingSessions, 
    attendanceRecords, 
    updateAttendance, 
    addAttendanceRecord,
    participants,
    isOnline,
    pendingSyncCount,
    syncData,
  } = useApp();
  
  const [selectedSession, setSelectedSession] = useState<string>(trainingSessions[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [registeredParticipants, setRegisteredParticipants] = useState<DbParticipantRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  const currentSession = trainingSessions.find(s => s.id === selectedSession);
  
  const sessionAttendance = attendanceRecords.filter(r => r.session_id === selectedSession);
  
  const sessionParticipants = currentSession 
    ? participants.filter(p => currentSession.participants.includes(p.id))
    : [];

  // Load registered participants when session changes
  useEffect(() => {
    if (selectedSession) {
      loadRegisteredParticipants();
    }
  }, [selectedSession]);

  const loadRegisteredParticipants = async () => {
    setLoadingRegistrations(true);
    try {
      const registrations = await db.getRegisteredParticipantsForSession(selectedSession);
      setRegisteredParticipants(registrations);
    } catch (error) {
      console.error('Failed to load registered participants:', error);
      setRegisteredParticipants([]);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Combine manual and registered participants
  const combinedParticipants: CombinedParticipant[] = [
    ...sessionParticipants.map(p => ({
      id: p.id,
      name: p.name,
      organization: p.organization,
      type: 'manual' as const,
    })),
    ...registeredParticipants.map(r => ({
      id: r.id,
      name: r.participant_name,
      organization: r.fcp_name,
      type: 'registered' as const,
      registrationData: r,
    })),
  ];

  const filteredParticipants = combinedParticipants.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAttendanceForParticipant = (participantId: string) => {
    return sessionAttendance.find(a => a.participant_id === participantId);
  };

  const handleAttendanceChange = async (participantId: string, status: AttendanceStatus, isRegistered: boolean) => {
    const existing = getAttendanceForParticipant(participantId);
    
    if (existing) {
      try {
        await updateAttendance(existing.id, status);
      } catch (err) {
        console.error('Failed to update attendance:', err);
      }
    } else {
      try {
        if (isRegistered) {
          // For registered participants, use their registration data
          await db.createAttendanceForRegisteredParticipant(participantId, selectedSession, status);
          // Reload attendance records to reflect the change
          window.location.reload(); // Simple refresh for now
        } else {
          // For manual participants, use the existing flow
          const participant = participants.find(p => p.id === participantId);
          await addAttendanceRecord({
            session_id: selectedSession,
            participant_id: participantId,
            participant_name: participant?.name || '',
            attendance_date: selectedDate,
            status,
            synced: isOnline,
          });
        }
      } catch (err) {
        console.error('Failed to add attendance:', err);
      }
    }
  };

  const getStatusButton = (status: AttendanceStatus, currentStatus?: AttendanceStatus) => {
    const isActive = currentStatus === status;
    const baseClasses = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all";
    
    switch (status) {
      case 'present':
        return `${baseClasses} ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`;
      case 'absent':
        return `${baseClasses} ${isActive ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-red-50 text-red-600 hover:bg-red-100'}`;
      case 'late':
        return `${baseClasses} ${isActive ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`;
      case 'excused':
        return `${baseClasses} ${isActive ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`;
    }
  };

  const attendanceStats = {
    present: sessionAttendance.filter(a => a.status === 'present').length,
    absent: sessionAttendance.filter(a => a.status === 'absent').length,
    late: sessionAttendance.filter(a => a.status === 'late').length,
    excused: sessionAttendance.filter(a => a.status === 'excused').length,
    pending: combinedParticipants.length - sessionAttendance.length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Attendance Sheet</h1>
          <p className="text-slate-500 mt-1">Record and track participant attendance</p>
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
            isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}>
            {isOnline ? <WifiIcon size={18} /> : <WifiOffIcon size={18} />}
            <span className="font-medium">{isOnline ? 'Online' : 'Offline Mode'}</span>
          </div>
          {pendingSyncCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 rounded-xl">
              <RefreshIcon size={18} className={isOnline ? 'animate-spin' : ''} />
              <span className="font-medium">{pendingSyncCount} pending sync</span>
            </div>
          )}
        </div>
      </div>

      {/* Session Selector */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {trainingSessions.map(session => (
                <option key={session.id} value={session.id}>
                  {session.training_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Search Participants</label>
            <div className="relative">
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      {currentSession && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl p-5 text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">{currentSession.training_name}</h2>
              <div className="flex items-center gap-4 mt-2 text-slate-300 text-sm">
                <span className="flex items-center gap-1.5">
                  <CalendarIcon size={16} />
                  {new Date(currentSession.session_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <UsersIcon size={16} />
                  {combinedParticipants.length} participants ({sessionParticipants.length} manual, {registeredParticipants.length} registered)
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-emerald-400">{attendanceStats.present}</p>
                <p className="text-xs text-slate-300">Present</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-red-400">{attendanceStats.absent}</p>
                <p className="text-xs text-slate-300">Absent</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-amber-400">{attendanceStats.late}</p>
                <p className="text-xs text-slate-300">Late</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 text-center">
                <p className="text-2xl font-bold text-slate-300">{attendanceStats.pending}</p>
                <p className="text-xs text-slate-300">Pending</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">Participant Attendance</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div> Absent
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div> Late
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div> Excused
            </span>
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {loadingRegistrations && filteredParticipants.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <RefreshIcon size={40} className="mx-auto text-slate-300 mb-2 animate-spin" />
              <p>Loading participants...</p>
            </div>
          ) : (
            filteredParticipants.map((participant) => {
              const attendance = getAttendanceForParticipant(participant.id);
              const isRegistered = participant.type === 'registered';
              return (
                <div key={participant.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 ${isRegistered ? 'bg-gradient-to-br from-purple-400 to-pink-500' : 'bg-gradient-to-br from-teal-400 to-emerald-500'} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                        {participant.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-800">{participant.name}</p>
                          {isRegistered && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full text-xs font-medium">
                              <UserCheckIcon size={12} />
                              Self-Registered
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{participant.organization}</p>
                      </div>
                      {attendance && !attendance.synced && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs">
                          <AlertCircleIcon size={12} />
                          Not synced
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleAttendanceChange(participant.id, 'present', isRegistered)}
                        className={getStatusButton('present', attendance?.status)}
                      >
                        <CheckCircleIcon size={16} />
                        Present
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(participant.id, 'absent', isRegistered)}
                        className={getStatusButton('absent', attendance?.status)}
                      >
                        <XCircleIcon size={16} />
                        Absent
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(participant.id, 'late', isRegistered)}
                        className={getStatusButton('late', attendance?.status)}
                      >
                        <ClockIcon size={16} />
                        Late
                      </button>
                      <button
                        onClick={() => handleAttendanceChange(participant.id, 'excused', isRegistered)}
                        className={getStatusButton('excused', attendance?.status)}
                      >
                        <AlertCircleIcon size={16} />
                        Excused
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filteredParticipants.length === 0 && !loadingRegistrations && (
          <div className="text-center py-12">
            <UsersIcon size={40} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-lg font-medium text-slate-800">No participants found</h3>
            <p className="text-slate-500 mt-1">Select a session or adjust your search</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => {
            filteredParticipants.forEach(p => {
              if (!getAttendanceForParticipant(p.id)) {
                handleAttendanceChange(p.id, 'present', p.type === 'registered');
              }
            });
          }}
          className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center gap-2"
        >
          <CheckIcon size={18} />
          Mark All Present
        </button>
        <button
          onClick={() => syncData()}
          className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <RefreshIcon size={18} />
          Sync Now
        </button>
        <button
          onClick={loadRegisteredParticipants}
          className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <RefreshIcon size={18} />
          Refresh Registrations
        </button>
      </div>
    </div>
  );
};

export default AttendanceSheet;
