import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { urlAPI, analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Link as LinkIcon, BarChart3, Clock, Trash2, Copy, Edit, 
  Plus, Search, Loader2, QrCode, ExternalLink 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { buildShortUrl, isLocalhostBackend } from '../utils/urlHelpers';

const Dashboard = () => {
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState({ totalUrls: 0, activeUrls: 0, expiredUrls: 0, totalClicks: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, urlsRes] = await Promise.all([
        analyticsAPI.getDashboardStats(),
        urlAPI.getUrls({ page, limit: 10, search })
      ]);
      setStats(statsRes.data);
      setUrls(urlsRes.data.urls);
      setTotalPages(urlsRes.data.totalPages);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await urlAPI.shorten(formData);
      toast.success('URL shortened successfully!');
      setShowCreateModal(false);
      setFormData({ originalUrl: '', customAlias: '', title: '', expiresAt: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this URL?')) return;
    try {
      await urlAPI.deleteUrl(id);
      toast.success('URL deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete URL');
    }
  };

  const copyToClipboard = (shortCode) => {
    const url = buildShortUrl(shortCode);
    navigator.clipboard.writeText(url);
    toast.success('Copied to clipboard!');
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Shorten URL</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total URLs" value={stats.totalUrls} icon={LinkIcon} color="bg-blue-500" />
        <StatCard title="Total Clicks" value={stats.totalClicks} icon={BarChart3} color="bg-green-500" />
        <StatCard title="Active URLs" value={stats.activeUrls} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Expired URLs" value={stats.expiredUrls} icon={Trash2} color="bg-red-500" />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search URLs..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* URLs Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary-600" /></div>
        ) : urls.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No URLs found. Create your first shortened URL!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title / URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expires</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {urls.map((url) => (
                  <tr key={url._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{url.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{url.originalUrl}</p>
                      <a href={buildShortUrl(url.shortCode)} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center mt-1">
                        {buildShortUrl(url.shortCode)} <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{url.clickCount}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(url.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {url.expiresAt ? (
                        <span className={`px-2 py-1 text-xs rounded-full ${new Date(url.expiresAt) < new Date() ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {new Date(url.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button onClick={() => copyToClipboard(url.shortCode)} className="text-gray-400 hover:text-primary-600" title="Copy">
                          <Copy className="h-4 w-4" />
                        </button>
                        <button onClick={() => { setSelectedUrl(url); setShowQrModal(true); }} className="text-gray-400 hover:text-primary-600" title="QR Code">
                          <QrCode className="h-4 w-4" />
                        </button>
                        <Link to={`/analytics/${url._id}`} className="text-gray-400 hover:text-primary-600" title="Analytics">
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(url._id)} className="text-gray-400 hover:text-red-600" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary disabled:opacity-50">Previous</button>
            <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary disabled:opacity-50">Next</button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shorten a URL</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination URL *</label>
                <input type="url" required className="input-field" placeholder="https://example.com/very/long/url" 
                  value={formData.originalUrl} onChange={e => setFormData({...formData, originalUrl: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input type="text" className="input-field" placeholder="My Awesome Link" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Alias (optional)</label>
                <input type="text" className="input-field" placeholder="my-link" 
                  value={formData.customAlias} onChange={e => setFormData({...formData, customAlias: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date (optional)</label>
                <input type="datetime-local" className="input-field" 
                  value={formData.expiresAt} onChange={e => setFormData({...formData, expiresAt: e.target.value})} />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex items-center space-x-2">
                  {creating ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>Create</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && selectedUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">QR Code</h2>
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              {(() => {
                const shortUrl = buildShortUrl(selectedUrl.shortCode);
                return <QRCodeSVG value={shortUrl} size={200} />;
              })()}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 break-all">
              {(() => {
                return buildShortUrl(selectedUrl.shortCode);
              })()}
            </p>
            {isLocalhostBackend() && (
              <p className="text-xs text-yellow-600 dark:text-yellow-300">
                Warning: QR links generated with localhost only work on this machine. Use your computer's LAN IP in `frontend/.env` for phone scanning.
              </p>
            )}
            <button onClick={() => setShowQrModal(false)} className="btn-primary w-full">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;