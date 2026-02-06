"use client";
import React from 'react';
import { FiPlus, FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi';

export default function AddressBook() {
  // Placeholder data
  const addresses = [
    { id: 1, type: 'Home', address: '123 Lekki Phase 1', city: 'Lagos', state: 'Lagos', phone: '+234 800 000 0000', isDefault: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Address Book</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#2E5C45] text-white rounded-lg font-medium hover:bg-[#254a38] transition-colors text-sm">
          <FiPlus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative group">
            {addr.isDefault && (
              <span className="absolute top-4 right-4 bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                Default
              </span>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-50 text-gray-600 rounded-full flex items-center justify-center">
                <FiMapPin className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900">{addr.type}</h3>
            </div>

            <div className="space-y-1 text-sm text-gray-600 mb-6">
              <p>{addr.address}</p>
              <p>{addr.city}, {addr.state}</p>
              <p className="pt-2 text-gray-900 font-medium">{addr.phone}</p>
            </div>

            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
              <button className="flex-1 py-2 text-sm font-medium text-gray-600 hover:text-[#2E5C45] hover:bg-green-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                <FiEdit2 className="w-4 h-4" /> Edit
              </button>
              <button className="flex-1 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2">
                <FiTrash2 className="w-4 h-4" /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
