import Sidebar from '@/components/Seller/Sidebar';
import Header from '@/components/Seller/Header';

export const metadata = {
  title: 'Seller Dashboard',
  description: 'Manage your store',
};

export default function SellerLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
