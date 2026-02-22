import { requireAdminPage } from '@/utils/adminAuth';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const { adminClient } = await requireAdminPage();

  const { data: products, error } = await adminClient
    .from('products')
    .select('id, name, slug, store_id, price, discount_price, stock_quantity, is_active, created_at')
    .order('created_at', { ascending: false })
    .limit(150);

  if (error) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error.message}</div>;
  }

  const storeIds = [...new Set((products || []).map((p) => p.store_id).filter(Boolean))];
  const { data: stores } = storeIds.length
    ? await adminClient.from('stores').select('id, name, status').in('id', storeIds)
    : { data: [] };

  const storeMap = new Map((stores || []).map((s) => [s.id, s]));

  const outOfStock = (products || []).filter((p) => Number(p.stock_quantity) <= 0).length;
  const lowStock = (products || []).filter((p) => Number(p.stock_quantity) > 0 && Number(p.stock_quantity) <= 5).length;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Catalog Health</h2>
        <p className="text-sm text-gray-500">Track inactive listings, low inventory risk, and store catalog quality.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-[#f3f8f5] px-3 py-2 text-sm">Total products: <strong>{products?.length || 0}</strong></div>
          <div className="rounded-xl bg-[#f3f8f5] px-3 py-2 text-sm">Out of stock: <strong>{outOfStock}</strong></div>
          <div className="rounded-xl bg-[#f3f8f5] px-3 py-2 text-sm">Low stock (≤5): <strong>{lowStock}</strong></div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#dbe7e0] bg-white p-5 shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Product</th>
                <th className="py-2 pr-3">Store</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Stock</th>
                <th className="py-2 pr-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {(products || []).map((product) => {
                const store = storeMap.get(product.store_id);
                return (
                  <tr key={product.id} className="border-b border-gray-50">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">/{product.slug}</div>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{store?.name || 'Unassigned'}</td>
                    <td className="py-2 pr-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.is_active ? 'bg-[#e9f5ef] text-[#2E5C45]' : 'bg-gray-100 text-gray-600'}`}>
                        {product.is_active ? 'active' : 'inactive'}
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{product.stock_quantity}</td>
                    <td className="py-2 pr-3 text-gray-900">₦{Number(product.discount_price ?? product.price ?? 0).toLocaleString()}</td>
                  </tr>
                );
              })}
              {products?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-gray-500">No products found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
