import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import CreateRFP from './pages/CreateRFP';
import VendorManagement from './pages/VendorManagement';
import RFPDetails from './pages/RFPDetails';
import ProposalComparison from './pages/ProposalComparison';

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create-rfp" element={<CreateRFP />} />
          <Route path="/vendors" element={<VendorManagement />} />
          <Route path="/rfp/:id" element={<RFPDetails />} />
          <Route path="/compare/:rfpId" element={<ProposalComparison />} />
        </Routes>
        
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#1e293b',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
