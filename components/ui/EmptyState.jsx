'use client';

export default function EmptyState({
  icon,
  title,
  description,
  action = null,
  tone = 'default',
}) {
  const toneStyles = tone === 'error'
    ? {
        iconWrap: 'bg-[#FEF2F2]',
        iconColor: '#DC2626',
      }
    : {
        iconWrap: 'bg-(--zova-green-soft)',
        iconColor: 'var(--zova-primary-action)',
      };

  return (
    <div className="flex flex-col items-center justify-center rounded-[18px] border-[1.5px] border-dashed border-(--zova-border) bg-white px-6 py-16 text-center">
      {icon ? (
        <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full ${toneStyles.iconWrap}`}>
          <span style={{ color: toneStyles.iconColor }}>{icon}</span>
        </div>
      ) : null}
      <h3 className="mb-1 text-[17px] font-extrabold tracking-[-0.02em] text-(--zova-ink)">{title}</h3>
      {description ? (
        <p className="mb-6 max-w-[300px] text-[13px] leading-6 text-(--zova-text-muted)">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
