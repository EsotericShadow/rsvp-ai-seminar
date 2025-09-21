import VisitsTrendChart from './VisitsTrendChart';
import RSVPsTrendChart from './RSVPsTrendChart';
import HourlyPatternsChart from './HourlyPatternsChart';
import DailyPatternsChart from './DailyPatternsChart';

interface TimelineTabProps {
  visitsTrend: Array<{ label: string; count: number }>;
  rsvpsTrend: Array<{ label: string; count: number }>;
  hourlyData: Array<{ hour: number; count: number; label: string }>;
  dailyData: Array<{ day: number; name: string; count: number }>;
}

export default function TimelineTab({ visitsTrend, rsvpsTrend, hourlyData, dailyData }: TimelineTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Timeline Analytics</h2>
          <p className="text-neutral-300 mt-1">Time-based trends, patterns, and historical data</p>
        </div>
      </div>

      {/* Timeline Charts */}
      <div className="grid grid-cols-1 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Visits Trend</h3>
          <VisitsTrendChart data={visitsTrend} />
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">RSVP Timeline</h3>
          <RSVPsTrendChart data={rsvpsTrend} />
        </div>
      </div>

      {/* Hourly/Daily Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Patterns</h3>
          <HourlyPatternsChart data={hourlyData} />
        </div>

        <div className="glass rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Patterns</h3>
          <DailyPatternsChart data={dailyData} />
        </div>
      </div>
    </div>
  );
}
