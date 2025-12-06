import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Loader2, CheckCircle } from 'lucide-react';
import { rfpAPI } from '../services/api';
import toast from 'react-hot-toast';

const CreateRFP = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdRFP, setCreatedRFP] = useState(null);

  const examplePrompts = [
    "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty.",
    "Looking for office furniture for 50 employees. Need ergonomic chairs, standing desks, and filing cabinets. Budget: $75,000. Delivery needed by end of next month. Require 2-year warranty.",
    "Need to purchase 100 smartphones for company employees. Budget $40,000. Must have 128GB storage, 5G capability. Delivery within 2 weeks. Net 60 payment terms."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    setLoading(true);
    try {
      const response = await rfpAPI.create(description);
      setCreatedRFP(response.data.rfp);
      toast.success('RFP created successfully!');
      
      // Navigate to RFP details after a short delay
      setTimeout(() => {
        navigate(`/rfp/${response.data.rfp._id}`);
      }, 1500);
    } catch (error) {
      console.error('Error creating RFP:', error);
      toast.error('Failed to create RFP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useExample = (example) => {
    setDescription(example);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold gradient-text">Create New RFP</h1>
              <p className="text-slate-600">Describe your procurement needs in natural language</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card-glass p-8">
              <label className="block mb-4">
                <span className="text-slate-700 font-semibold text-lg mb-2 block">
                  What do you need to procure?
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days..."
                  className="textarea"
                  rows="12"
                  disabled={loading}
                />
              </label>

              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  AI will automatically structure your RFP
                </p>
                <button
                  type="submit"
                  disabled={loading || !description.trim()}
                  className={`btn btn-primary flex items-center space-x-2 ${
                    loading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Create RFP</span>
                    </>
                  )}
                </button>
              </div>

              {loading && (
                <div className="mt-6 p-4 bg-primary-50 border-2 border-primary-200 rounded-xl pulse-glow">
                  <div className="flex items-center space-x-3">
                    <div className="spinner"></div>
                    <div>
                      <p className="font-semibold text-primary-700">AI Processing...</p>
                      <p className="text-sm text-primary-600">
                        Analyzing your requirements and structuring the RFP
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {createdRFP && (
                <div className="mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-xl animate-fade-in">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-700">RFP Created Successfully!</p>
                      <p className="text-sm text-green-600">
                        Redirecting to RFP details...
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Examples Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-glass p-6 sticky top-24">
              <h3 className="font-bold text-lg text-slate-800 mb-4">
                💡 Example Prompts
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Click an example to use it as a template:
              </p>
              <div className="space-y-3">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => useExample(example)}
                    className="w-full text-left p-4 bg-white/60 hover:bg-white rounded-xl border border-slate-200 hover:border-primary-300 transition-all duration-200 text-sm text-slate-700 hover:shadow-md"
                    disabled={loading}
                  >
                    <span className="font-semibold text-primary-600 block mb-1">
                      Example {index + 1}
                    </span>
                    {example.substring(0, 80)}...
                  </button>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl border border-primary-100">
                <h4 className="font-semibold text-slate-800 mb-2 text-sm">
                  ✨ Tips for best results:
                </h4>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Include specific quantities</li>
                  <li>• Mention your budget</li>
                  <li>• Specify delivery timeline</li>
                  <li>• Add payment terms if known</li>
                  <li>• Include warranty requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRFP;
