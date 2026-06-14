import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { analyticsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, ArcElement, Title, Tooltip, Legend 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ArrowLeft, Globe, Monitor, Smartphone, Clock } from 'lucide-react';
import { buildShortUrl } from '../utils/urlHelpers';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await analyticsAPI.getUrlAnalytics(id, timeframe);
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load analytics');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, timeframe, navigate]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!data) return null;

  const { url, dailyClicks, byCountry, byBrowser, byDevice, summary } = data;

  // Chart data preparation
  const lineChartData = {
    labels: dailyClicks.map(d => d._id),
    datasets: [
      {
        label: 'Total Clicks',
        data: dailyClicks.map(d => d.total),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Unique Clicks',
        data: dailyClicks.map(d => d.unique),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const countryChartData = {
    labels: byCountry.map(d => d._id || 'Unknown'),
    datasets: [{
      data: byCountry.map(d => d.count),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
    }]
  };

  const browserChartData = {
    labels: byBrowser.map(d => d._id || 'Unknown'),
    datasets: [{
      data: byBrowser.map(d => d.count),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    }]
  };

  const deviceChartData = {
    labels: byDevice.map(d => d._id || 'Unknown'),
    datasets: [{
      data: byDevice.map(d => d.count),
      backgroundColor: ['#3b82f6', '#10b981', '#f59e0b']
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: document.documentElement.classList.contains('dark') ? '#fff' : '#000' } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563' } },
      x: { ticks: { color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#4b5563' } }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate('/dashboard')} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{url.title}</h1>
        <a 
          href={buildShortUrl(url.shortCode)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary-600 hover:underline break-all"
        >
          {buildShortUrl(url.shortCode)}
        </a>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Globe className="h-6 w-6 text-blue-600" /></div>
          <div><p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p><p className="text-2xl font-bold">{summary.totalClicks}</p></div>
        </div>
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg"><Monitor className="h-6 w-6 text-green-600" /></div>
          <div><p className="text-sm text-gray-600 dark:text-gray-400">Unique Clicks</p><p className="text-2xl font-bold">{summary.uniqueClicks}</p></div>
        </div>
        <div className="card flex items-center space-x-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Clock className="h-6 w-6 text-purple-600" /></div>
          <div><p className="text-sm text-gray-600 dark:text-gray-400">Last Clicked</p><p className="text-sm font-semibold">{summary.lastClicked ? new Date(summary.lastClicked).toLocaleString() : 'Never'}</p></div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 mb-6">
        {['7d', '30d', '90d'].map(tf => (
          <button key={tf} onClick={() => setTimeframe(tf)} className={`px-4 py-2 rounded-lg text-sm font-medium ${timeframe === tf ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
            Last {tf === '7d' ? '7 Days' : tf === '30d' ? '30 Days' : '90 Days'}
          </button>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Click Trends</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h3>
          <Doughnut data={countryChartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Browsers</h3>
          <Bar data={browserChartData} options={{ ...chartOptions, indexAxis: 'y' }} />
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Devices</h3>
          <Doughnut data={deviceChartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;