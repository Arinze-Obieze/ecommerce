'use client';

export function AdminReturnPolicyIntro() {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-gray-900">Generic Return Policy</h2>
      <p className="text-sm text-gray-500">
        This policy is shown on every product page. Admins can edit the summary text and the table rows below.
      </p>
    </div>
  );
}

export function AdminReturnPolicyLoading() {
  return <div className="rounded-2xl border border-border bg-white p-6 text-sm text-gray-500">Loading return policy...</div>;
}

function AdminReturnPolicyRowEditor({ row, disableRemove, onUpdateRow, onRemoveRow }) {
  const cells = [
    { field: 'scenario', width: 'w-44' },
    { field: 'window', width: 'w-40' },
    { field: 'condition', width: 'w-52' },
    { field: 'resolution', width: 'w-44' },
    { field: 'notes', width: 'w-56' },
  ];

  return (
    <tr className="border-b border-gray-50 align-top">
      {cells.map((cell) => (
        <td key={cell.field} className="p-2">
          <textarea
            className={`min-h-20 rounded-xl border border-gray-200 px-3 py-2 text-sm ${cell.width}`}
            value={row[cell.field]}
            onChange={(event) => onUpdateRow(row.id, cell.field, event.target.value)}
          />
        </td>
      ))}
      <td className="p-2">
        <button
          type="button"
          onClick={() => onRemoveRow(row.id)}
          disabled={disableRemove}
          className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-50"
        >
          Remove
        </button>
      </td>
    </tr>
  );
}

export function AdminReturnPolicyForm({
  error,
  notice,
  form,
  saving,
  changed,
  onUpdateField,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onRefresh,
  onSave,
}) {
  return (
    <form onSubmit={onSave} className="rounded-2xl border border-border bg-white p-5 shadow-sm">
      {error ? <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
      {notice ? <div className="mb-3 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{notice}</div> : null}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Title</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={form.title}
            onChange={(event) => onUpdateField('title', event.target.value)}
            maxLength={120}
            required
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-semibold text-gray-700">Support Note</span>
          <input
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={form.support_text}
            onChange={(event) => onUpdateField('support_text', event.target.value)}
            maxLength={240}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block font-semibold text-gray-700">Subtitle</span>
          <textarea
            className="min-h-24 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            value={form.subtitle}
            onChange={(event) => onUpdateField('subtitle', event.target.value)}
            maxLength={240}
          />
        </label>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
              <th className="px-2 py-2">Scenario</th>
              <th className="px-2 py-2">Window</th>
              <th className="px-2 py-2">Condition</th>
              <th className="px-2 py-2">Resolution</th>
              <th className="px-2 py-2">Notes</th>
              <th className="px-2 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {form.rows.map((row) => (
              <AdminReturnPolicyRowEditor
                key={row.id}
                row={row}
                disableRemove={form.rows.length <= 1}
                onUpdateRow={onUpdateRow}
                onRemoveRow={onRemoveRow}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAddRow}
          className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary"
        >
          Add Row
        </button>
        <button
          type="submit"
          disabled={!changed || saving}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save Policy'}
        </button>
        <button
          type="button"
          onClick={onRefresh}
          disabled={saving}
          className="rounded-xl border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60"
        >
          Refresh
        </button>
      </div>
    </form>
  );
}
