import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, TrendingUp, Users, Mail, Sparkles } from 'lucide-react';
import { rfpAPI, proposalAPI } from '../services/api';
import RFPCard from '../components/RFPCard';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    proposals: 0,
  });

  useEffect(() => {
    fetchRFPs();
  }, []);

  const fetchRFPs = async () => {
    try {
      const response = await rfpAPI.getAll();
      const rfpData = response.data.rfps;
      setRfps(rfpData);

      // Calculate stats
      setStats({
        total: rfpData.length,
        sent: rfpData.filter((r) => r.status === 'sent').length,
        proposals: rfpData.reduce((acc, r) => acc + (r.proposals?.length || 0), 0),
      });
    } catch (error) {
      console.error('Error fetching RFPs:', error);
      toast.error('Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckEmails = async () => {
    const loadingToast = toast.loading('Checking for new vendor responses...');
    try {
      const response = await proposalAPI.checkEmails();
      toast.success(response.data.message, { id: loadingToast });
      if (response.data.processed > 0) {
        fetchRFPs(); // Refresh data
      }
    } catch (error) {
      toast.error('Failed to check emails', { id: loadingToast });
    }
  };

  const statCards = [
    {
      title: 'Total RFPs',
      value: stats.total,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Sent RFPs',
      value: stats.sent,
      icon: Mail,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Proposals Received',
      value: stats.proposals,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome to RFP Manager
          </h1>
          <p className="text-slate-600 text-lg">
            Streamline your procurement process with AI-powered automation
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="card-glass p-6 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-600 text-sm font-medium mb-1">
                      {stat.title}
                    </p>
                    <p className="text-4xl font-bold text-slate-800">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link to="/create-rfp" className="btn btn-primary flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span>Create New RFP</span>
          </Link>
          <Link to="/vendors" className="btn btn-secondary flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Manage Vendors</span>
          </Link>
          <button
            onClick={handleCheckEmails}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Mail className="w-5 h-5" />
            <span>Check for Responses</span>
          </button>
        </div>

        {/* RFPs List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent RFPs</h2>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="spinner"></div>
            </div>
          ) : rfps.length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">
                No RFPs yet
              </h3>
              <p className="text-slate-500 mb-6">
                Get started by creating your first RFP
              </p>
              <Link to="/create-rfp" className="btn btn-primary inline-flex items-center space-x-2">
                <Plus className="w-5 h-5" />
                <span>Create RFP</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rfps.map((rfp) => (
                <RFPCard key={rfp._id} rfp={rfp} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
