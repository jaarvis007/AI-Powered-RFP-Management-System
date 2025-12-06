import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Package,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  Mail,
  BarChart3,
} from 'lucide-react';
import { rfpAPI, vendorAPI, proposalAPI } from '../services/api';
import toast from 'react-hot-toast';

const RFPDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [rfpResponse, vendorsResponse] = await Promise.all([
        rfpAPI.getById(id),
        vendorAPI.getAll(),
      ]);
      
      setRfp(rfpResponse.data.rfp);
      setVendors(vendorsResponse.data.vendors);
      setSelectedVendors(rfpResponse.data.rfp.selectedVendors?.map(v => v._id || v) || []);
    } catch (error) {
      toast.error('Failed to load RFP details');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      toast.error('Please select at least one vendor');
      return;
    }

    setSending(true);
    try {
      await rfpAPI.send(id, selectedVendors);
      toast.success(`RFP sent to ${selectedVendors.length} vendor(s)`);
      fetchData();
    } catch (error) {
      toast.error('Failed to send RFP');
    } finally {
      setSending(false);
    }
  };

  const toggleVendor = (vendorId) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!rfp) return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">{rfp.title}</h1>
              <div className="flex items-center space-x-4">
                <span className={`badge badge-${rfp.status}`}>
                  {rfp.status.charAt(0).toUpperCase() + rfp.status.slice(1)}
                </span>
                <span className="text-slate-500 text-sm">
                  Created {new Date(rfp.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {rfp.proposals?.length > 0 && (
              <Link
                to={`/compare/${rfp._id}`}
                className="btn btn-primary flex items-center space-x-2"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Compare Proposals ({rfp.proposals.length})</span>
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Description</h2>
              <p className="text-slate-600 leading-relaxed">{rfp.description}</p>
            </div>

            {/* Items */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Package className="w-6 h-6 mr-2 text-primary-600" />
                Required Items
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Item</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rfp.structuredData?.items?.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100">
                        <td className="py-3 px-4 text-slate-800 font-medium">{item.name}</td>
                        <td className="py-3 px-4 text-slate-600">{item.quantity}</td>
                        <td className="py-3 px-4 text-slate-600">{item.specifications || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Requirements */}
            <div className="card">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <DollarSign className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Budget</p>
                    <p className="text-slate-600">
                      ${rfp.structuredData?.budget?.toLocaleString() || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Delivery Deadline</p>
                    <p className="text-slate-600">
                      {rfp.structuredData?.deliveryDeadline
                        ? new Date(rfp.structuredData.deliveryDeadline).toLocaleDateString()
                        : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Payment Terms</p>
                    <p className="text-slate-600">
                      {rfp.structuredData?.paymentTerms || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold text-slate-700">Warranty</p>
                    <p className="text-slate-600">
                      {rfp.structuredData?.warrantyRequirements || 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>

              {rfp.structuredData?.additionalRequirements?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="font-semibold text-slate-700 mb-2">Additional Requirements:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {rfp.structuredData.additionalRequirements.map((req, idx) => (
                      <li key={idx} className="text-slate-600">{req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-primary-600" />
                Send to Vendors
              </h2>

              {rfp.status === 'sent' && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-700">
                    ✓ Sent to {rfp.selectedVendors?.length || 0} vendor(s) on{' '}
                    {new Date(rfp.sentAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                {vendors.map((vendor) => (
                  <label
                    key={vendor._id}
                    className={`flex items-center space-x-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedVendors.includes(vendor._id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor._id)}
                      onChange={() => toggleVendor(vendor._id)}
                      className="w-5 h-5 text-primary-600 rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{vendor.name}</p>
                      <p className="text-sm text-slate-500">{vendor.company}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={handleSendRFP}
                disabled={sending || selectedVendors.length === 0}
                className="btn btn-primary w-full flex items-center justify-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="spinner"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send RFP ({selectedVendors.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RFPDetails;
