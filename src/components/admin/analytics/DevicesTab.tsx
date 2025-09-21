import DeviceBreakdownChart from './DeviceBreakdownChart';
import BrowserBreakdownChart from './BrowserBreakdownChart';

interface DevicesTabProps {
  deviceBreakdown: Array<{ name: string; count: number }>;
  platformBreakdown: Array<{ name: string; count: number }>;
  topBrowsers: Array<{ browser: string; count: number }>;
}

export default function DevicesTab({ deviceBreakdown, platformBreakdown, topBrowsers }: DevicesTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Device Analytics</h2>
          <p className="text-neutral-300 mt-1">Device, browser, and platform breakdown analysis</p>
        </div>
      </div>

      {/* Device Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
          <DeviceBreakdownChart data={deviceBreakdown} />
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Browser Breakdown</h3>
          <BrowserBreakdownChart data={topBrowsers.map(b => ({ name: b.browser, count: b.count }))} />
        </div>
      </div>

      {/* Platform Details */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {platformBreakdown.map((platform, index) => (
              <div key={platform.name} className="bg-secondary-800/20 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-300">{platform.name}</p>
                    <p className="text-2xl font-bold text-white">{platform.count}</p>
                  </div>
                  <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <span className="text-primary-400 text-sm font-bold">
                      {((platform.count / platformBreakdown.reduce((sum, p) => sum + p.count, 0)) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
