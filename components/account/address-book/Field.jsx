export default function Field({ label, children }) {
  return (
    <div>
      <label className="zova-account-label">{label}</label>
      {children}
    </div>
  );
}
