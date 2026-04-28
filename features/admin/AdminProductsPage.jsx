'use client';

import {
  AdminProductsIntro,
  AdminProductsTable,
} from '@/features/admin/products/AdminProductsSections';
import useAdminProducts from '@/features/admin/products/useAdminProducts';

export default function AdminProductsPage() {
  const products = useAdminProducts();

  return (
    <div className="space-y-4">
      <AdminProductsIntro rows={products.rows} />
      <AdminProductsTable
        rows={products.rows}
        loading={products.loading}
        error={products.error}
        notice={products.notice}
        statusFilter={products.statusFilter}
        reviewingId={products.reviewingId}
        onStatusFilterChange={products.setStatusFilter}
        onReview={products.review}
      />
    </div>
  );
}
