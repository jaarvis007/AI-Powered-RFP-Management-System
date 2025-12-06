import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { proposalAPI, rfpAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProposalComparison = () => {
  const { rfpId } = useParams();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [rfpId]);

  const fetchData = async () => {
    try {
      const [rfpResponse, comparisonResponse] = await Promise.all([
        rfpAPI.getById(rfpId),
        proposalAPI.compare(rfpId),
      ]);

      setRfp(rfpResponse.data.rfp);
      setProposals(comparisonResponse.data.proposals);
      setComparison(comparisonResponse.data.comparison);
    } catch (error) {
      toast.error('Failed to load proposals');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreGradient = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-slate-600">Analyzing proposals with AI...</p>
        </div>
      </div>
    );
  }

  if (!rfp || proposals.length === 0) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          <div className="card text-center py-12">
            <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No proposals to compare
            </h3>
            <p className="text-slate-500 mb-6">
              Wait for vendors to respond to your RFP
            </p>
            <button onClick={() => navigate('/')} className="btn btn-primary">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const recommendedProposal = proposals.find(
    (p) => p.vendorId._id === comparison?.recommendedVendorId
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(`/rfp/${rfpId}`)}
            className="flex items-center space-x-2 text-slate-600 hover:text-primary-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to RFP</span>
          </button>

          <h1 className="text-4xl font-bold gradient-text mb-2">Proposal Comparison</h1>
          <p className="text-slate-600">{rfp.title}</p>
        </div>

        {/* AI Recommendation */}
        {comparison && recommendedProposal && (
          <div className="card-glass p-6 mb-8 border-2 border-primary-300 animate-fade-in">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                  AI Recommendation
                </h2>
                <div className="bg-white/60 rounded-xl p-4 mb-3">
                  <p className="text-lg font-semibold text-primary-700 mb-2">
                    Recommended Vendor: {recommendedProposal.vendorId.company}
                  </p>
                  <p className="text-slate-700 leading-relaxed">{comparison.reasoning}</p>
                </div>

                {comparison.riskFactors && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="font-semibold text-yellow-800 mb-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Risk Factors to Consider
                    </p>
                    <p className="text-sm text-yellow-700">{comparison.riskFactors}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Proposals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {proposals.map((proposal) => {
            const isRecommended = proposal.vendorId._id === comparison?.recommendedVendorId;

            return (
              <div
                key={proposal._id}
                className={`card relative ${
                  isRecommended ? 'ring-4 ring-primary-300 shadow-2xl' : ''
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 font-bold text-sm">
                    <Trophy className="w-4 h-4" />
                    <span>Recommended</span>
                  </div>
                )}

                {/* Vendor Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-800">
                      {proposal.vendorId.company}
                    </h3>
                    <p className="text-slate-500">{proposal.vendorId.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary-600">
                      ${proposal.parsedData?.totalPrice?.toLocaleString() || 'N/A'}
                    </p>
                    <p className="text-sm text-slate-500">Total Price</p>
                  </div>
                </div>

                {/* AI Scores */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div
                      className={`score-circle bg-gradient-to-br ${getScoreGradient(
                        proposal.aiAnalysis?.completenessScore || 0
                      )} mb-2 mx-auto`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {proposal.aiAnalysis?.completenessScore || 0}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Completeness</p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`score-circle bg-gradient-to-br ${getScoreGradient(
                        proposal.aiAnalysis?.competitivenessScore || 0
                      )} mb-2 mx-auto`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {proposal.aiAnalysis?.competitivenessScore || 0}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Competitiveness</p>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {proposal.aiAnalysis?.summary}
                  </p>
                </div>

                {/* Pros and Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pros
                    </h4>
                    <ul className="space-y-1">
                      {proposal.aiAnalysis?.pros?.map((pro, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Cons
                    </h4>
                    <ul className="space-y-1">
                      {proposal.aiAnalysis?.cons?.map((con, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-500" />
                      Delivery Time
                    </span>
                    <span className="font-semibold text-slate-800">
                      {proposal.parsedData?.deliveryTime || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2 text-green-500" />
                      Payment Terms
                    </span>
                    <span className="font-semibold text-slate-800">
                      {proposal.parsedData?.paymentTerms || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-purple-500" />
                      Warranty
                    </span>
                    <span className="font-semibold text-slate-800">
                      {proposal.parsedData?.warranty || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Item Breakdown */}
                {proposal.parsedData?.itemPrices?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <h4 className="font-semibold text-slate-700 mb-2">Item Breakdown</h4>
                    <div className="space-y-1">
                      {proposal.parsedData.itemPrices.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm bg-slate-50 p-2 rounded"
                        >
                          <span className="text-slate-600">
                            {item.item} (x{item.quantity})
                          </span>
                          <span className="font-semibold text-slate-800">
                            ${item.price?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        {comparison?.comparison && (
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Key Differences</h2>
            <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6">
              <p className="text-slate-700 leading-relaxed">{comparison.comparison}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProposalComparison;
