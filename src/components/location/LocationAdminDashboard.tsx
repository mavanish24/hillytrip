import React, { useState, useEffect } from 'react';
import {
  LocationItem,
  EntityType,
  RouteDefinition,
  TravelCircuit,
  LocationAnalytics
} from '../../types/location';
import {
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  BarChart2,
  Globe,
  Layers,
  Edit2,
  Trash2,
  Save,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

export const LocationAdminDashboard: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'locations' | 'routes' | 'analytics'>('locations');

  // Form State for creating/editing location
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<LocationItem>>({
    name: '',
    entityType: 'attraction',
    description: '',
    lat: 27.0428,
    lng: 88.2663,
    elevation: 1500,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Darjeeling Sadar',
    accuracy: 'verified_gps',
    tags: []
  });

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resLoc, resAna] = await Promise.all([
        fetch('/api/location/items'),
        fetch('/api/admin/location/analytics')
      ]);
      const dataLoc = await resLoc.json();
      const dataAna = await resAna.json();

      if (dataLoc.success) setLocations(dataLoc.locations);
      if (dataAna.success) setAnalytics(dataAna.analytics);
    } catch (e) {
      console.error('Failed fetching admin location data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/location/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editItem)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditing(false);
        fetchData();
      } else {
        alert('Failed saving location: ' + data.error);
      }
    } catch (err: any) {
      alert('Error saving location: ' + err.message);
    }
  };

  const filteredLocations = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.entityType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-900 text-slate-100 min-h-screen p-6 font-sans space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            Location & Map Platform Admin Manager
          </h1>
          <p className="text-xs text-slate-400">Manage POIs, Coordinates, Geo Indexing, Routes and Analytics</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditItem({
                name: '',
                entityType: 'attraction',
                description: '',
                lat: 27.0428,
                lng: 88.2663,
                elevation: 1500,
                country: 'India',
                state: 'West Bengal',
                district: 'Darjeeling',
                accuracy: 'verified_gps'
              });
              setIsEditing(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Add Location / POI
          </button>
          <button
            onClick={fetchData}
            className="p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'locations' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Locations Directory ({locations.length})
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Spatial Analytics & Index
        </button>
      </div>

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                {editItem.id ? 'Edit Location POI' : 'Create New Location POI'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLocation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Name</label>
                  <input
                    type="text"
                    required
                    value={editItem.name || ''}
                    onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="e.g. Batasia Loop"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Entity Type</label>
                  <select
                    value={editItem.entityType || 'attraction'}
                    onChange={(e) => setEditItem({ ...editItem, entityType: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="destination">Destination</option>
                    <option value="attraction">Attraction</option>
                    <option value="homestay">Homestay</option>
                    <option value="taxi_stand">Taxi Stand</option>
                    <option value="business">Business</option>
                    <option value="guide">Guide</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editItem.lat || 0}
                    onChange={(e) => setEditItem({ ...editItem, lat: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={editItem.lng || 0}
                    onChange={(e) => setEditItem({ ...editItem, lng: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Elevation (m)</label>
                  <input
                    type="number"
                    value={editItem.elevation || 1500}
                    onChange={(e) => setEditItem({ ...editItem, elevation: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">District</label>
                  <input
                    type="text"
                    required
                    value={editItem.district || ''}
                    onChange={(e) => setEditItem({ ...editItem, district: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">State</label>
                  <input
                    type="text"
                    required
                    value={editItem.state || ''}
                    onChange={(e) => setEditItem({ ...editItem, state: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={3}
                  value={editItem.description || ''}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Directory Tab */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, district, or entity..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Name</th>
                  <th className="p-3.5">Entity</th>
                  <th className="p-3.5">District</th>
                  <th className="p-3.5">Coordinates</th>
                  <th className="p-3.5">Elevation</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-slate-800/60 transition">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      {loc.imageUrl && (
                        <img src={loc.imageUrl} alt={loc.name} className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      {loc.name}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono text-[10px]">
                        {loc.entityType}
                      </span>
                    </td>
                    <td className="p-3.5">{loc.district}, {loc.state}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">{loc.lat.toFixed(3)}, {loc.lng.toFixed(3)}</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">⛰️ {loc.elevation || 1500}m</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => {
                          setEditItem(loc);
                          setIsEditing(true);
                        }}
                        className="p-1.5 hover:bg-slate-700 rounded-lg text-indigo-400 transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Locations Indexed</span>
            <div className="text-3xl font-extrabold text-white">{analytics.totalLocations}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Popular Routes</span>
            <div className="text-3xl font-extrabold text-indigo-400">{analytics.totalRoutes}</div>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 p-5 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Travel Circuits</span>
            <div className="text-3xl font-extrabold text-emerald-400">{analytics.totalCircuits}</div>
          </div>
        </div>
      )}
    </div>
  );
};
