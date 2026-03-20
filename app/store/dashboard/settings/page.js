export default function StoreSettingsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Store Settings</h2>
        <p className="text-sm text-gray-500">Configuration controls for profile, policy, and operational defaults.</p>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm text-sm text-gray-600">
        <p className="font-semibold text-gray-800">Planned controls</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>Store profile: public name, description, logo and banner.</li>
          <li>Shipping preferences and default fulfillment SLA.</li>
          <li>Return policy and communication preferences.</li>
          <li>Escrow release preferences and payout notification recipients.</li>
        </ul>
      </div>
    </div>
  );
}
