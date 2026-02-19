import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { db } from '@/lib/database';
import { exportToCSV, exportToPDF, RegistrationReportRow } from '@/lib/reportExportService';
import {
  ChartIcon,
  DownloadIcon,
  CalendarIcon,
  UsersIcon,
  TrainingIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  FilterIcon,
  FileTextIcon,
} from '@/components/icons/Icons';

type ReportType = 'completion' | 'attendance' | 'performance' | 'feedback' | 'calendar' | 'registration';

const regions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
];

const clusters = [
  'Cluster A',
  'Cluster B',
  'Cluster C',
  'Cluster D',
  'Cluster E',
];

const trainingTypes = [
  'In-Person',
  'Virtual',
];

const ReportsModule: React.FC = () => {
  const { trainingPlans, trainingSessions, participants, attendanceRecords } = useApp();
  const [selectedReport, setSelectedReport] = useState<ReportType>('completion');
  const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-12-31' });
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedTrainingType, setSelectedTrainingType] = useState<string>('all');
  
  // Registration report state
  const [registrationData, setRegistrationData] = useState<RegistrationReportRow[]>([]);
  const [registrationStats, setRegistrationStats] = useState<any>(null);
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

  const reportTypes = [
    { id: 'completion' as ReportType, label: 'Training Completion', icon: <CheckCircleIcon size={20} />, color: 'bg-emerald-500' },
    { id: 'attendance' as ReportType, label: 'Attendance Report', icon: <UsersIcon size={20} />, color: 'bg-blue-500' },
    { id: 'registration' as ReportType, label: 'Participant Registration', icon: <FileTextIcon size={20} />, color: 'bg-teal-500' },
    { id: 'performance' as ReportType, label: 'Participant Performance', icon: <TrendingUpIcon size={20} />, color: 'bg-purple-500' },
    { id: 'feedback' as ReportType, label: 'Feedback Summary', icon: <ChartIcon size={20} />, color: 'bg-amber-500' },
    { id: 'calendar' as ReportType, label: 'Training Calendar', icon: <CalendarIcon size={20} />, color: 'bg-rose-500' },
  ];

  // Load registration report data when filters change
  useEffect(() => {
    if (selectedReport === 'registration') {
      loadRegistrationReport();
    }
  }, [selectedReport, dateRange, selectedRegion, selectedCluster, selectedTrainingType]);

  const loadRegistrationReport = async () => {
    setIsLoadingReport(true);
    try {
      const filters = {
        startDate: dateRange.start,
        endDate: dateRange.end,
        trainingType: selectedTrainingType,
        region: selectedRegion,
        cluster: selectedCluster,
      };

      const [data, stats, completion] = await Promise.all([
        db.getRegistrationReportData(filters),
        db.getRegistrationStatistics(filters),
        db.getCompletionRateStatistics(filters),
      ]);

      setRegistrationData(data);
      setRegistrationStats(stats);
      setCompletionStats(completion);
    } catch (error) {
      console.error('Failed to load registration report:', error);
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Calculate report data
  const completedTrainings = trainingPlans.filter(p => p.status === 'approved').length;
  const totalParticipants = participants.length;
  const avgAttendance = attendanceRecords.length > 0 
    ? Math.round((attendanceRecords.filter(a => a.status === 'present').length / attendanceRecords.length) * 100)
    : 0;
  const avgScore = participants.length > 0 
    ? Math.round(participants.reduce((acc, p) => acc + (p.average_score || 0), 0) / participants.length)
    : 0;

  const handleExport = (format: 'excel' | 'pdf') => {
    if (selectedReport === 'registration') {
      if (format === 'excel') {
        exportToCSV(registrationData, `registration_report_${dateRange.start}_${dateRange.end}.csv`);
      } else {
        exportToPDF(registrationData, registrationStats, {
          startDate: dateRange.start,
          endDate: dateRange.end,
          trainingType: selectedTrainingType,
          region: selectedRegion,
          cluster: selectedCluster,
        });
      }
    } else {
      alert(`Exporting ${selectedReport} report as ${format.toUpperCase()}...`);
    }
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'completion':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium">Completed Trainings</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{completedTrainings}</p>
                <p className="text-xs text-emerald-500 mt-1">Out of {trainingPlans.length} total</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {trainingPlans.length > 0 ? Math.round((completedTrainings / trainingPlans.length) * 100) : 0}%
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                <p className="text-sm text-purple-600 font-medium">Participants Trained</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{totalParticipants * 5}</p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-semibold text-slate-800">Training Completion by Region</h4>
              </div>
              <div className="p-4">
                {regions.map(region => {
                  const regionTrainings = trainingPlans.filter(p => p.region === region);
                  const completed = regionTrainings.filter(p => p.status === 'approved').length;
                  const percentage = regionTrainings.length > 0 ? Math.round((completed / regionTrainings.length) * 100) : 0;
                  return (
                    <div key={region} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                      <span className="w-32 text-sm text-slate-600">{region}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm font-medium text-slate-700 text-right">{percentage}%</span>
                      <span className="w-20 text-xs text-slate-500 text-right">{completed}/{regionTrainings.length}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-5 border border-slate-100">
                <p className="text-sm text-slate-600">Total Records</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{attendanceRecords.length}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-sm text-emerald-600">Present</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">
                  {attendanceRecords.filter(a => a.status === 'present').length}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="text-sm text-red-600">Absent</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {attendanceRecords.filter(a => a.status === 'absent').length}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
                <p className="text-sm text-amber-600">Late</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {attendanceRecords.filter(a => a.status === 'late').length}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-100 p-6">
              <h4 className="font-semibold text-slate-800 mb-4">Average Attendance Rate</h4>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" fill="none" stroke="#e2e8f0" strokeWidth="12" />
                    <circle 
                      cx="64" cy="64" r="56" fill="none" 
                      stroke="url(#gradient)" strokeWidth="12"
                      strokeDasharray={`${avgAttendance * 3.52} 352`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-800">{avgAttendance}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600">Overall attendance rate across all training sessions</p>
                  <p className="text-sm text-slate-500 mt-2">Based on {attendanceRecords.length} attendance records</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'performance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                <p className="text-sm text-purple-600 font-medium">Average Score</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{avgScore}%</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium">Top Performers</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">
                  {participants.filter(p => (p.average_score || 0) >= 90).length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                <p className="text-sm text-amber-600 font-medium">Need Improvement</p>
                <p className="text-3xl font-bold text-amber-700 mt-1">
                  {participants.filter(p => (p.average_score || 0) < 70).length}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-semibold text-slate-800">Top Performing Participants</h4>
              </div>
              <div className="divide-y divide-slate-50">
                {[...participants]
                  .sort((a, b) => (b.average_score || 0) - (a.average_score || 0))
                  .slice(0, 5)
                  .map((p, i) => (
                    <div key={p.id} className="p-4 flex items-center gap-4">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-amber-100 text-amber-700' :
                        i === 1 ? 'bg-slate-200 text-slate-700' :
                        i === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-800">{p.name}</p>
                        <p className="text-sm text-slate-500">{p.organization}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        (p.average_score || 0) >= 90 ? 'bg-emerald-100 text-emerald-700' :
                        (p.average_score || 0) >= 80 ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.average_score || 0}%
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'registration':
        if (isLoadingReport) {
          return (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Loading registration report...</p>
            </div>
          );
        }

        if (!registrationStats) {
          return (
            <div className="text-center py-12">
              <FileTextIcon size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-800">No Data Available</h3>
              <p className="text-slate-500 mt-2">No registration data found for the selected filters</p>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-100">
                <p className="text-sm text-teal-600 font-medium">Total Registrations</p>
                <p className="text-3xl font-bold text-teal-700 mt-1">{registrationStats.totalRegistrations}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-5 border border-emerald-100">
                <p className="text-sm text-emerald-600 font-medium">Confirmed Attendance</p>
                <p className="text-3xl font-bold text-emerald-700 mt-1">{registrationStats.confirmedAttendance}</p>
                <p className="text-xs text-emerald-500 mt-1">
                  {registrationStats.totalRegistrations > 0 
                    ? Math.round((registrationStats.confirmedAttendance / registrationStats.totalRegistrations) * 100) 
                    : 0}% confirmation rate
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                <p className="text-sm text-purple-600 font-medium">With Baby</p>
                <p className="text-3xl font-bold text-purple-700 mt-1">{registrationStats.withBaby}</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm text-blue-600 font-medium">Completion Rate</p>
                <p className="text-3xl font-bold text-blue-700 mt-1">
                  {completionStats?.completionRate || 0}%
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {completionStats?.totalAttended || 0} attended
                </p>
              </div>
            </div>

            {/* Registrations by Region */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-semibold text-slate-800">Registrations by Region</h4>
              </div>
              <div className="p-4">
                {Object.entries(registrationStats.byRegion)
                  .sort(([, a], [, b]) => (b as number) - (a as number))
                  .map(([region, count]) => {
                    const percentage = registrationStats.totalRegistrations > 0 
                      ? Math.round(((count as number) / registrationStats.totalRegistrations) * 100) 
                      : 0;
                    return (
                      <div key={region} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                        <span className="w-32 text-sm text-slate-600">{region}</span>
                        <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-16 text-sm font-medium text-slate-700 text-right">{percentage}%</span>
                        <span className="w-20 text-xs text-slate-500 text-right">{count as number}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Monthly Trend */}
            {registrationStats.monthlyTrend.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-semibold text-slate-800">Monthly Registration Trend</h4>
                </div>
                <div className="p-4">
                  <div className="flex items-end gap-2 h-48">
                    {registrationStats.monthlyTrend.map((item: any) => {
                      const maxCount = Math.max(...registrationStats.monthlyTrend.map((t: any) => t.count));
                      const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                      return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full bg-teal-500 rounded-t hover:bg-teal-600 transition-colors relative group" 
                               style={{ height: `${height}%`, minHeight: '20px' }}>
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              {item.count} registrations
                            </div>
                          </div>
                          <span className="text-xs text-slate-500 transform -rotate-45 origin-top-left mt-2">
                            {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Completion Rate by Training Type */}
            {completionStats && Object.keys(completionStats.byTrainingType).length > 0 && (
              <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h4 className="font-semibold text-slate-800">Completion Rate by Training Type</h4>
                </div>
                <div className="p-4">
                  {Object.entries(completionStats.byTrainingType).map(([type, stats]: [string, any]) => (
                    <div key={type} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                      <span className="w-32 text-sm text-slate-600">{type}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${stats.rate}%` }}
                        />
                      </div>
                      <span className="w-16 text-sm font-medium text-slate-700 text-right">{stats.rate}%</span>
                      <span className="w-32 text-xs text-slate-500 text-right">
                        {stats.attended}/{stats.registered} attended
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Details Table */}
            <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-4 border-b border-slate-100 bg-slate-50">
                <h4 className="font-semibold text-slate-800">Registration Details</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Ref</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Region</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Training</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {registrationData.slice(0, 50).map((reg) => (
                      <tr key={reg.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-600">{reg.registration_reference}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-800">{reg.participant_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{reg.email_address}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{reg.region}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{reg.training_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {new Date(reg.session_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            reg.attendance_confirmed 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {reg.attendance_confirmed ? 'Confirmed' : 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {registrationData.length > 50 && (
                  <div className="p-4 text-center text-sm text-slate-500 bg-slate-50">
                    Showing 50 of {registrationData.length} registrations. Export to see all records.
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <ChartIcon size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-800">Report Coming Soon</h3>
            <p className="text-slate-500 mt-2">This report type is under development</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
          <p className="text-slate-500 mt-1">Generate and export training reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('excel')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
          >
            <DownloadIcon size={18} />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors"
          >
            <FileTextIcon size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="flex flex-wrap gap-3">
        {reportTypes.map((report) => (
          <button
            key={report.id}
            onClick={() => setSelectedReport(report.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              selectedReport === report.id
                ? `${report.color} text-white shadow-lg`
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            {report.icon}
            {report.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 flex flex-wrap items-center gap-4">
        <FilterIcon size={18} className="text-slate-400" />
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">From:</label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">To:</label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Regions</option>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        {selectedReport === 'registration' && (
          <>
            <select
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Clusters</option>
              {clusters.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={selectedTrainingType}
              onChange={(e) => setSelectedTrainingType(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Training Types</option>
              {trainingTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </>
        )}
      </div>

      {/* Report Content */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
            reportTypes.find(r => r.id === selectedReport)?.color || 'bg-slate-500'
          }`}>
            {reportTypes.find(r => r.id === selectedReport)?.icon}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {reportTypes.find(r => r.id === selectedReport)?.label}
            </h3>
            <p className="text-sm text-slate-500">
              {dateRange.start} to {dateRange.end} {selectedRegion === 'all' ? '• All Regions' : `• ${selectedRegion}`}
            </p>
          </div>
        </div>
        
        {renderReportContent()}
      </div>
    </div>
  );
};

export default ReportsModule;
