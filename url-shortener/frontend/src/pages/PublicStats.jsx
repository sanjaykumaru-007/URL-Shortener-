import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { urlAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Link as LinkIcon, BarChart3, ExternalLink } from 'lucide-react';
import { buildShortUrl } from '../utils/urlHelpers';

const PublicStats = () => {
  const { shortCode } = useParams();
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrl = async () => {
      try {
        const res = await urlAPI.getPublicUrl(shortCode);
        setUrl(res.data);
      } catch (error) {
        toast.error('URL not found or has expired');
      } finally {
        setLoading(false);
      }
    };
    fetchUrl();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Link Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">This link may have expired or been deleted.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card text-center">
        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <LinkIcon className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{url.title}</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 break-all">{url.originalUrl}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Clicks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{url.clickCount}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Unique Clicks</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{url.uniqueClickCount}</p>
          </div>
        </div>

        <a 
          href={buildShortUrl(url.shortCode)} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn-primary inline-flex items-center space-x-2"
        >
          <span>Visit Short Link</span>
          <ExternalLink className="h-4 w-4" />
        </a>
        
        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Created on {new Date(url.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default PublicStats;