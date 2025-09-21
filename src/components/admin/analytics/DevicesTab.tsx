import DeviceBreakdownChart from './DeviceBreakdownChart';

interface DevicesTabProps {
  // Add device data props here
}

export default function DevicesTab({}: DevicesTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Device Analytics</h2>
          <p className="text-gray-300 mt-1">Device, browser, and platform breakdown analysis</p>
        </div>
      </div>

      {/* Device Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Device Breakdown</h3>
          <DeviceBreakdownChart data={[]} />
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Browser Breakdown</h3>
          <div className="space-y-4">
            <div className="text-center text-gray-400 py-8">
              Browser analytics chart coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Platform Details */}
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Platform Details</h3>
        <div className="space-y-4">
          <div className="text-center text-gray-400 py-8">
            Detailed platform and operating system analytics coming soon
          </div>
        </div>
      </div>
    </div>
  );
}
