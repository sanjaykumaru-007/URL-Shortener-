import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, BarChart3, Shield, Copy, Loader2 } from 'lucide-react';
import { urlAPI } from '../services/api';
import { toast } from 'react-toastify';
import { buildShortUrl, isLocalhostBackend } from '../utils/urlHelpers';

const Landing = () => {
  const [longUrl, setLongUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateShortUrl = async () => {
    if (!longUrl) {
      toast.error('Please enter a URL');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = token
        ? await urlAPI.shorten({ originalUrl: longUrl })
        : await urlAPI.shortenPublic({ originalUrl: longUrl });
      const url = buildShortUrl(response.data.shortCode);
      setShortUrl(url);
      toast.success('URL shortened successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.error || 'Failed to shorten URL');
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied to clipboard!');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      generateShortUrl();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">

        

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
          Shorten URLs,
          <span className="text-primary-600"> Amplify Results</span>
        </h1>

        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
          Create short, memorable links with powerful analytics.
        </p>

        {/* URL SHORTENER BOX */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 mb-10">

          <input
            type="url"
            placeholder="Paste your long URL here..."
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full border border-gray-300 rounded-lg p-3 mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          <button
            onClick={generateShortUrl}
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white py-3 rounded-lg font-semibold mb-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Zap className="h-5 w-5" />}
            {loading ? 'Shortening...' : 'Shorten URL'}
          </button>

          <input
            type="text"
            value={shortUrl}
            readOnly
            placeholder="Short URL will appear here"
            className="w-full border border-gray-300 rounded-lg p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />

          {shortUrl && (
            <>
              <button
                onClick={copyUrl}
                className="mt-4 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg mx-auto"
              >
                <Copy size={18} />
                Copy URL
              </button>
              {isLocalhostBackend() && (
                <p className="mt-3 text-sm text-yellow-600 dark:text-yellow-300">
                  Note: QR scanning may not work from another device when backend is set to localhost.
                </p>
              )}
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/signup"
            className="btn-primary px-8 py-3 text-lg"
          >
            Get Started Free
          </Link>

          <Link
            to="/login"
            className="btn-secondary px-8 py-3 text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">

          <div className="card text-center">
            <Zap className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Lightning Fast
            </h3>
            <p>
              Generate short URLs instantly.
            </p>
          </div>

          <div className="card text-center">
            <BarChart3 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Analytics
            </h3>
            <p>
              Track clicks and visitors.
            </p>
          </div>

          <div className="card text-center">
            <Shield className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Secure
            </h3>
            <p>
              Safe and reliable URL management.
            </p>
          </div>

        </div>
      </div>

      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="text-center text-gray-500">
          © {new Date().getFullYear()} LinkShrink. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Landing;