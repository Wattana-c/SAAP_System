const { useState, useEffect } = React;

function App() {
    const [status, setStatus] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [logs, setLogs] = useState([]);
    const [newUrl, setNewUrl] = useState('');

    const fetchData = async () => {
        try {
            const [statusRes, dashRes, logsRes] = await Promise.all([
                axios.get('/api/admin/status'),
                axios.get('/api/dashboard'),
                axios.get('/api/admin/logs')
            ]);
            setStatus(statusRes.data.data);
            setDashboard(dashRes.data.data);
            setLogs(logsRes.data.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    const toggleAutomation = async () => {
        if (!status) return;
        const newStatus = !status.automationEnabled;
        try {
            await axios.post('/api/admin/toggle-automation', { enable: newStatus });
            fetchData();
        } catch (error) {
            alert('Failed to toggle automation');
        }
    };

    const addProduct = async (e) => {
        e.preventDefault();
        if (!newUrl) return;
        try {
            await axios.post('/api/products', { url: newUrl });
            setNewUrl('');
            alert('Product added to queue!');
            fetchData();
        } catch (error) {
            alert('Failed to add product');
        }
    };

    if (!status || !dashboard) return <div className="p-8 text-center">Loading...</div>;

    const isSafeMode = status.monitorStatus?.safeModeActive;

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
            <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold text-gray-800">Affiliate Auto Post</h1>
                <div className="flex items-center mt-4 md:mt-0 space-x-4">
                    <span className={\`px-3 py-1 rounded-full text-sm font-semibold \${status.automationEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                        {status.automationEnabled ? 'Automation: ON' : 'Automation: OFF'}
                    </span>
                    {isSafeMode && (
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800">
                            SAFE MODE ACTIVE
                        </span>
                    )}
                    <button
                        onClick={toggleAutomation}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                    >
                        Toggle Power
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Posts Today</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{dashboard.daily_stats?.total_posted_today || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Failed Posts</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">{dashboard.daily_stats?.total_failed_today || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-gray-500 text-sm font-medium">Recent Errors (Threshold: {status.monitorStatus?.threshold})</h3>
                    <p className="text-3xl font-bold text-orange-500 mt-2">{status.monitorStatus?.recentErrors || 0}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Manual Trigger</h2>
                <form onSubmit={addProduct} className="flex flex-col md:flex-row gap-4">
                    <input
                        type="url"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="Enter Shopee URL..."
                        className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition">
                        Add to Queue
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Top Performing Products</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="px-4 py-2">Product</th>
                                    <th className="px-4 py-2">Score (CTR)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.top_products?.map((p, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-2 truncate max-w-[200px]">{p.title}</td>
                                        <td className="px-4 py-2 font-bold text-blue-600">{p.score}</td>
                                    </tr>
                                ))}
                                {(!dashboard.top_products || dashboard.top_products.length === 0) && (
                                    <tr><td colSpan="2" className="px-4 py-4 text-center text-gray-500">No data available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-96">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">System Logs</h2>
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded border border-gray-200 font-mono text-xs">
                        {logs.map((log, i) => (
                            <div key={i} className={\`mb-1 \${log.level === 'error' ? 'text-red-600' : 'text-gray-700'}\`}>
                                <span className="text-gray-400">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                <span className="font-semibold ml-1">[{log.component}]</span>: {log.message}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
