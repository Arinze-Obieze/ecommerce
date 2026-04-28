export default function SectionHeader({ kicker, title, copy }) {
  return (
    <div className="zova-info-section-head">
      <div className="zova-info-section-kicker">{kicker}</div>
      <h2 className="zova-info-section-title">{title}</h2>
      {copy ? <p className="zova-info-section-copy">{copy}</p> : null}
    </div>
  );
}
