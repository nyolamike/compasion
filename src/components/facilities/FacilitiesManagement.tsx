import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  SearchIcon,
  FilterIcon,
  BuildingIcon,
  VideoIcon,
  UsersIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarIcon,
  WifiIcon,
  PlusIcon,
} from '@/components/icons/Icons';

const regions = [
  'Central Region',
  'Eastern Region',
  'Northern Region',
  'Western Region',
  'Kampala',
];

const FacilitiesManagement: React.FC = () => {
  const { trainingSessions, facilities } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Hotel Facility' | 'Online Platform'>('all');
  const [regionFilter, setRegionFilter] = useState<string>('all');

  const filteredFacilities = facilities.filter(f => {
    const matchesSearch = (f.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || f.type === typeFilter;
    const matchesRegion = regionFilter === 'all' || f.region === regionFilter;
    return matchesSearch && matchesType && matchesRegion;
  });

  const getBookingsForFacility = (facilityId: string) => {
    return trainingSessions.filter(s => s.facility_id === facilityId && s.status !== 'cancelled');
  };

  const stats = {
    total: facilities.length,
    physical: facilities.filter(f => f.type === 'Hotel Facility').length,
    virtual: facilities.filter(f => f.type === 'Online Platform').length,
    available: facilities.filter(f => f.is_available).length,
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Facilities Management</h1>
          <p className="text-slate-500 mt-1">Manage training venues and online platforms</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-medium hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
        >
          <PlusIcon size={20} />
          Add Facility
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-5 border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Facilities</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-500 rounded-xl flex items-center justify-center">
              <BuildingIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600 font-medium">Physical Venues</p>
              <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.physical}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
              <BuildingIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-5 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Online Platforms</p>
              <p className="text-3xl font-bold text-purple-700 mt-1">{stats.virtual}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <VideoIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Available Now</p>
              <p className="text-3xl font-bold text-blue-700 mt-1">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <CheckCircleIcon size={24} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search facilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterIcon size={18} className="text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Types</option>
            <option value="Hotel Facility">Physical Venues</option>
            <option value="Online Platform">Online Platforms</option>
          </select>
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => {
          const bookings = getBookingsForFacility(facility.id);
          return (
            <div
              key={facility.id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              <div className={`h-2 ${facility.type === 'Hotel Facility' ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-purple-400 to-violet-400'}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    facility.type === 'Hotel Facility' 
                      ? 'bg-emerald-100' 
                      : 'bg-purple-100'
                  }`}>
                    {facility.type === 'Hotel Facility' 
                      ? <BuildingIcon size={24} className="text-emerald-600" />
                      : <VideoIcon size={24} className="text-purple-600" />
                    }
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    facility.is_available 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {facility.is_available ? <CheckCircleIcon size={12} /> : <XCircleIcon size={12} />}
                    {facility.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-slate-800 text-lg mb-1">{facility.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{facility.type}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <UsersIcon size={16} className="text-slate-400" />
                    <span>Capacity: {facility.capacity} people</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPinIcon size={16} className="text-slate-400" />
                    <span>{facility.region}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarIcon size={16} className="text-slate-400" />
                    <span>{bookings.length} upcoming bookings</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2">Equipment Available:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(facility.equipment || []).map((eq, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                <button className="text-sm text-slate-600 hover:text-slate-800 font-medium">
                  View Calendar
                </button>
                <button className="px-3 py-1.5 bg-teal-500 text-white text-xs font-medium rounded-lg hover:bg-teal-600 transition-colors">
                  Book Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFacilities.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
          <BuildingIcon size={40} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-lg font-medium text-slate-800">No facilities found</h3>
          <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default FacilitiesManagement;
