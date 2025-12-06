import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, Mail, Phone, Tag } from 'lucide-react';
import { vendorAPI } from '../services/api';
import toast from 'react-hot-toast';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    category: '',
    notes: '',
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAll();
      setVendors(response.data.vendors);
    } catch (error) {
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const vendorData = {
      ...formData,
      category: formData.category.split(',').map(c => c.trim()).filter(c => c),
    };

    try {
      if (editingVendor) {
        await vendorAPI.update(editingVendor._id, vendorData);
        toast.success('Vendor updated successfully');
      } else {
        await vendorAPI.create(vendorData);
        toast.success('Vendor created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      toast.error('Failed to save vendor');
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || '',
      company: vendor.company,
      category: vendor.category?.join(', ') || '',
      notes: vendor.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      await vendorAPI.delete(id);
      toast.success('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      toast.error('Failed to delete vendor');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      category: '',
      notes: '',
    });
    setEditingVendor(null);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Vendor Management</h1>
            <p className="text-slate-600">Manage your vendor database</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Vendor</span>
          </button>
        </div>

        {/* Vendors Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="spinner"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="card text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No vendors yet</h3>
            <p className="text-slate-500 mb-6">Add your first vendor to get started</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Vendor</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <div key={vendor._id} className="card">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                      {vendor.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800">{vendor.name}</h3>
                      <p className="text-sm text-slate-500">{vendor.company}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(vendor)}
                      className="p-2 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-primary-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(vendor._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-primary-500" />
                    <span>{vendor.email}</span>
                  </div>
                  {vendor.phone && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4 text-primary-500" />
                      <span>{vendor.phone}</span>
                    </div>
                  )}
                </div>

                {vendor.category?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {vendor.category.map((cat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Company *
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Categories (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    placeholder="e.g., Electronics, IT Equipment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="textarea"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingVendor ? 'Update' : 'Create'} Vendor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorManagement;
