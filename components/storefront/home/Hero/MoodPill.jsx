export default function MoodPill({ label, small = false }) {
  return (
    <span className={`zova-hero-pill ${small ? 'zova-hero-pill-sm' : ''}`}>
      {label}
    </span>
  );
}
