import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DbTrainingMaterial } from '@/lib/database';
import {
  PlusIcon,
  SearchIcon,
  FilterIcon,
  UploadIcon,
  DownloadIcon,
  FileTextIcon,
  VideoIcon,
  PresentationIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EditIcon,
  EyeIcon,
  XIcon,
  FolderIcon,
} from '@/components/icons/Icons';

type MaterialFormat = 'Presentation' | 'Handout' | 'Video' | 'Interactive Activity';
type MaterialStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

const MaterialsLibrary: React.FC = () => {
  const { trainingMaterials, trainingPlans, addTrainingMaterial, updateTrainingMaterial, currentUser } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<MaterialFormat | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<MaterialStatus | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<DbTrainingMaterial | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    format: 'Presentation' as MaterialFormat,
    trainingPlanId: '',
    file: null as File | null,
  });

  const filteredMaterials = trainingMaterials.filter(material => {
    const matchesSearch = (material.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFormat = formatFilter === 'all' || material.format === formatFilter;
    const matchesStatus = statusFilter === 'all' || material.status === statusFilter;
    return matchesSearch && matchesFormat && matchesStatus;
  });

  const getFormatIcon = (format: MaterialFormat) => {
    switch (format) {
      case 'Presentation': return <PresentationIcon size={20} className="text-orange-500" />;
      case 'Video': return <VideoIcon size={20} className="text-purple-500" />;
      case 'Handout': return <FileTextIcon size={20} className="text-blue-500" />;
      case 'Interactive Activity': return <FolderIcon size={20} className="text-teal-500" />;
    }
  };

  const getStatusBadge = (status: MaterialStatus) => {
    const styles = {
      draft: 'bg-slate-100 text-slate-600',
      submitted: 'bg-amber-100 text-amber-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-red-100 text-red-700',
    };
    const icons = {
      draft: <EditIcon size={12} />,
      submitted: <ClockIcon size={12} />,
      approved: <CheckCircleIcon size={12} />,
      rejected: <XCircleIcon size={12} />,
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleUpload = async () => {
    if (!formData.title || !formData.trainingPlanId) return;
    
    try {
      await addTrainingMaterial({
        training_plan_id: formData.trainingPlanId,
        title: formData.title,
        format: formData.format,
        file_path: `/materials/${formData.title.toLowerCase().replace(/\s+/g, '-')}.${formData.format === 'Video' ? 'mp4' : formData.format === 'Presentation' ? 'pptx' : 'pdf'}`,
        file_size: formData.file ? `${(formData.file.size / 1024 / 1024).toFixed(1)} MB` : '1.2 MB',
        status: 'draft',
        uploaded_by: currentUser?.id || '',
        version: 1,
      });
      setShowUploadModal(false);
      setFormData({ title: '', format: 'Presentation', trainingPlanId: '', file: null });
    } catch (err) {
      console.error('Failed to upload material:', err);
    }
  };

  const handleSubmitForApproval = async (materialId: string) => {
    try {
      await updateTrainingMaterial(materialId, { status: 'submitted' });
    } catch (err) {
      console.error('Failed to submit material:', err);
    }
  };

  const getPlanTitle = (planId: string) => {
    const plan = trainingPlans.find(p => p.id === planId);
    return plan?.title || 'Unknown Plan';
  };

  const formatStats = [
    { format: 'Presentation', count: trainingMaterials.filter(m => m.format === 'Presentation').length, color: 'bg-orange-100 text-orange-600' },
    { format: 'Handout', count: trainingMaterials.filter(m => m.format === 'Handout').length, color: 'bg-blue-100 text-blue-600' },
    { format: 'Video', count: trainingMaterials.filter(m => m.format === 'Video').length, color: 'bg-purple-100 text-purple-600' },
    { format: 'Interactive Activity', count: trainingMaterials.filter(m => m.format === 'Interactive Activity').length, color: 'bg-teal-100 text-teal-600' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Materials Library</h1>
          <p className="text-slate-500 mt-1">Manage training materials and resources</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
        >
          <UploadIcon size={20} />
          Upload Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {formatStats.map((stat) => (
          <div key={stat.format} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{stat.format}s</span>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${stat.color}`}>{stat.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as MaterialFormat | 'all')}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Formats</option>
            <option value="Presentation">Presentation</option>
            <option value="Handout">Handout</option>
            <option value="Video">Video</option>
            <option value="Interactive Activity">Interactive Activity</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as MaterialStatus | 'all')}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Material</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Training Plan</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Format</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Size</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMaterials.map((material) => (
                <tr key={material.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        {getFormatIcon(material.format)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{material.title}</p>
                        <p className="text-xs text-slate-500">v{material.version} {material.created_at ? `• ${new Date(material.created_at).toLocaleDateString()}` : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{getPlanTitle(material.training_plan_id)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{material.format}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-600">{material.file_size}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(material.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedMaterial(material)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View"
                      >
                        <EyeIcon size={16} className="text-slate-500" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Download"
                      >
                        <DownloadIcon size={16} className="text-slate-500" />
                      </button>
                      {material.status === 'draft' && (
                        <button
                          onClick={() => handleSubmitForApproval(material.id)}
                          className="px-3 py-1 bg-teal-500 text-white text-xs font-medium rounded-lg hover:bg-teal-600 transition-colors"
                        >
                          Submit
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredMaterials.length === 0 && (
          <div className="text-center py-12">
            <FolderIcon size={40} className="mx-auto text-slate-300 mb-2" />
            <h3 className="text-lg font-medium text-slate-800">No materials found</h3>
            <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Upload Material</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <XIcon size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Material Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter material title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Training Plan</label>
                <select
                  value={formData.trainingPlanId}
                  onChange={(e) => setFormData({ ...formData, trainingPlanId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select training plan</option>
                  {trainingPlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.title}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Format</label>
                <select
                  value={formData.format}
                  onChange={(e) => setFormData({ ...formData, format: e.target.value as MaterialFormat })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Presentation">Presentation</option>
                  <option value="Handout">Handout</option>
                  <option value="Video">Video</option>
                  <option value="Interactive Activity">Interactive Activity</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">File</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-400 transition-colors cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <UploadIcon size={32} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm text-slate-600">
                      {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">PDF, PPTX, DOCX, MP4 up to 100MB</p>
                  </label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!formData.title || !formData.trainingPlanId}
                className="px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsLibrary;
