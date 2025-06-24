import { useEffect, useState } from 'react';

export default function APITest() {
  const [status, setStatus] = useState('');
  const apiURL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/health`;

  useEffect(() => {
    fetch(apiURL)
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => setStatus('Error: ' + err.message));
  }, []);

  // Color coding the status
  const getStatusStyle = () => {
    if (status === 'ok') return 'text-green-600';
    if (status.includes('Error')) return 'text-red-600';
    return 'text-yellow-600';
  };

  return (
    <div className="p-8 font-sans bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded shadow-lg max-w-xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4 text-blue-600 dark:text-blue-400">🌐 API Health Check</h1>

      <div className="mb-2">
        <span className="font-semibold">🔗 API URL:</span> <span className="text-sm break-all">{apiURL}</span>
      </div>

      <div className="mt-4">
        <span className="font-semibold">📶 Status:</span>{' '}
        <span className={`font-bold ${getStatusStyle()}`}>{status || 'Loading...'}</span>
      </div>

      <button
        onClick={() => window.location.reload()}
        className="mt-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded hover:shadow-xl transition duration-300"
      >
        🔄 Refresh Status
      </button>
    </div>
  );
}
