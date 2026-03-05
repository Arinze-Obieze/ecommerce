"use client";
import React, { useState } from 'react';
import { FiUploadCloud, FiPlus, FiTrash2, FiSave, FiAlertCircle } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';

export default function AddProductPage() {
  const router = useRouter();
  const { success, error: toastError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock_quantity: '',
    category_id: '',
    // Strict requirements mock state
    imageUrls: [''],
    specifications: [
      { key: 'Material', value: '' },
      { key: 'Brand', value: '' }
    ]
  });

  const handleAddImage = () => {
    setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ''] }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({ 
        ...prev, 
        imageUrls: prev.imageUrls.filter((_, i) => i !== index) 
    }));
  };

  const handleImageChange = (index, value) => {
     const newImages = [...formData.imageUrls];
     newImages[index] = value;
     setFormData(prev => ({ ...prev, imageUrls: newImages }));
  };

  const handleSpecChange = (index, field, value) => {
     const newSpecs = [...formData.specifications];
     newSpecs[index][field] = value;
     setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const addSpec = () => {
     setFormData(prev => ({ 
        ...prev, 
        specifications: [...prev.specifications, { key: '', value: '' }] 
     }));
  };

  const removeSpec = (index) => {
    setFormData(prev => ({ 
        ...prev, 
        specifications: prev.specifications.filter((_, i) => i !== index) 
    }));
  };

  const validateForm = () => {
     const errors = [];
     
     if (!formData.name.trim()) errors.push("Product name is required.");
     if (!formData.description.trim()) errors.push("Description is required.");
     if (!formData.price || isNaN(formData.price) || Number(formData.price) <= 0) {
         errors.push("A valid main price is required.");
     }
     if (!formData.stock_quantity || isNaN(formData.stock_quantity) || Number(formData.stock_quantity) < 0) {
         errors.push("A valid stock quantity is required.");
     }

     // Strict validations specific to requirements
     const validImages = formData.imageUrls.filter(url => url.trim() !== '');
     if (validImages.length < 3) {
         errors.push(`At least 3 valid product images are required (You provided ${validImages.length}).`);
     }

     const emptySpecs = formData.specifications.filter(s => !s.key.trim() || !s.value.trim());
     if (emptySpecs.length > 0 || formData.specifications.length === 0) {
         errors.push("All specification fields must be completely filled out.");
     }

     return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationErrors([]);
    
    const errors = validateForm();
    if (errors.length > 0) {
        setValidationErrors(errors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setIsSubmitting(true);
    
    try {
      // Logic would normally interact with /api/seller/products/create here
      // For V1, simulating successful upload to verify UI validation behaves correctly
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      success("Product created successfully!");
      router.push('/seller/products');
      
    } catch (err) {
       console.error(err);
       toastError(err.message || "Failed to create product");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-500 mt-1">Fill out the details below to list a new item. Follow all strict quality guidelines.</p>
      </div>

      {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl space-y-2">
             <div className="flex items-center gap-2 font-bold mb-2">
                 <FiAlertCircle className="w-5 h-5"/> Please fix the following errors:
             </div>
             <ul className="list-disc pl-6 space-y-1 text-sm">
                 {validationErrors.map((err, i) => <li key={i}>{err}</li>)}
             </ul>
          </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
           <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Basic Information</h2>
           
           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input 
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45] focus:border-[#2E5C45] transition-all"
                 placeholder="e.g. Vintage Leather Jacket"
                 value={formData.name}
                 onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
           </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea 
                 rows="4"
                 className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45] focus:border-[#2E5C45] transition-all"
                 placeholder="Describe the product..."
                 value={formData.description}
                 onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                  <input 
                     type="number"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45] transition-all hide-number-spinners"
                     placeholder="0.00"
                     value={formData.price}
                     onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Discounted Price (₦)</label>
                  <input 
                     type="number"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45] transition-all hide-number-spinners"
                     placeholder="Optional"
                     value={formData.discount_price}
                     onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
                  />
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                  <input 
                     type="number"
                     className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45] transition-all hide-number-spinners"
                     placeholder="e.g. 50"
                     value={formData.stock_quantity}
                     onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  />
              </div>
           </div>
        </div>

        {/* Media Upload (Strict minimum 3) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between border-b border-gray-100 pb-4">
               <div>
                 <h2 className="text-lg font-bold text-gray-900">Media</h2>
                 <p className="text-sm text-gray-500 font-medium">Platform Policy: Minimum 3 images required</p>
               </div>
               <button 
                  type="button" 
                  onClick={handleAddImage}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#2E5C45]/10 text-[#2E5C45] rounded-lg hover:bg-[#2E5C45]/20 transition-colors"
                >
                  <FiPlus /> Add Image URL
               </button>
           </div>
           
           <div className="space-y-4">
             {formData.imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-start gap-4">
                   <div className="flex-1">
                      <input 
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45]"
                         placeholder={`Image URL ${idx + 1}`}
                         value={url}
                         onChange={(e) => handleImageChange(idx, e.target.value)}
                      />
                   </div>
                   <button 
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      disabled={formData.imageUrls.length <= 1}
                      className="p-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                   >
                      <FiTrash2 />
                   </button>
                </div>
             ))}
           </div>
        </div>

        {/* Specifications (Strict completeness) */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between border-b border-gray-100 pb-4">
               <div>
                 <h2 className="text-lg font-bold text-gray-900">Specifications</h2>
                 <p className="text-sm text-gray-500 font-medium">All specification keys and values must be completed.</p>
               </div>
               <button 
                  type="button" 
                  onClick={addSpec}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#2E5C45]/10 text-[#2E5C45] rounded-lg hover:bg-[#2E5C45]/20 transition-colors"
                >
                  <FiPlus /> Add Spec
               </button>
           </div>
           
           <div className="space-y-4">
             {formData.specifications.map((spec, idx) => (
                <div key={idx} className="flex items-start gap-4">
                   <div className="flex-1 grid grid-cols-2 gap-4">
                      <input 
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45]"
                         placeholder="Specification Name (e.g. Color)"
                         value={spec.key}
                         onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                      />
                      <input 
                         className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#2E5C45]"
                         placeholder="Value (e.g. Midnight Black)"
                         value={spec.value}
                         onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      />
                   </div>
                   <button 
                      type="button"
                      onClick={() => removeSpec(idx)}
                      disabled={formData.specifications.length <= 1}
                      className="p-3.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                   >
                      <FiTrash2 />
                   </button>
                </div>
             ))}
           </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-4 pt-4">
           <button 
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
           >
              Cancel
           </button>
           <button 
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 font-bold text-white bg-[#2E5C45] rounded-xl hover:bg-[#254a38] transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(46,92,69,0.3)]"
           >
              {isSubmitting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                 <><FiSave className="w-5 h-5"/> Publish Product</>
              )}
           </button>
        </div>
      </form>
    </div>
  );
}
