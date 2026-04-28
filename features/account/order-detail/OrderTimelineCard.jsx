import { FiCheckCircle, FiClock } from 'react-icons/fi';
import DetailCard from '@/features/account/order-detail/DetailCard';

export default function OrderTimelineCard({ timeline, formatDateTime }) {
  return (
    <DetailCard title="Order timeline">
      <div className="space-y-4">
        {timeline.map((entry, index) => {
          const isComplete = entry.state === 'complete';
          const isActive = entry.state === 'active';
          const isCancelled = entry.state === 'cancelled';
          return (
            <div key={entry.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isComplete ? 'var(--zova-green-soft)' : isActive ? '#FFF7ED' : 'var(--zova-surface-alt)',
                    border: `1px solid ${isComplete ? '#B8D4A0' : isActive ? '#FED7AA' : 'var(--zova-border)'}`,
                    color: isCancelled ? '#E53935' : isComplete ? 'var(--zova-primary-action)' : isActive ? '#EA580C' : 'var(--zova-text-muted)',
                  }}
                >
                  {isComplete ? <FiCheckCircle size={14} /> : <FiClock size={14} />}
                </div>
                {index < timeline.length - 1 ? <div style={{ width: 1, flex: 1, minHeight: 26, background: 'var(--zova-border)', marginTop: 6 }} /> : null}
              </div>
              <div style={{ paddingTop: 2 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--zova-text-strong)' }}>{entry.title}</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--zova-text-body)', lineHeight: 1.6 }}>{entry.description}</p>
                {entry.timestamp ? <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--zova-text-muted)' }}>{formatDateTime(entry.timestamp)}</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </DetailCard>
  );
}
