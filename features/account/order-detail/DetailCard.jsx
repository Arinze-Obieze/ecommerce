export default function DetailCard({ title, children }) {
  return (
    <section className="zova-account-card sm:p-6">
      <h2 className="zova-account-title">{title}</h2>
      {children}
    </section>
  );
}
