import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Package, Clock } from 'lucide-react';

const RFPCard = ({ rfp }) => {
  const statusColors = {
    draft: 'badge-draft',
    sent: 'badge-sent',
    closed: 'badge-closed',
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Link to={`/rfp/${rfp._id}`}>
      <div className="card group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 group-hover:text-primary-600 transition-colors mb-2">
              {rfp.title}
            </h3>
            <p className="text-slate-600 text-sm line-clamp-2">{rfp.description}</p>
          </div>
          <span className={`badge ${statusColors[rfp.status]} ml-4`}>
            {rfp.status.charAt(0).toUpperCase() + rfp.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Package className="w-4 h-4 text-primary-500" />
            <span className="text-slate-600">
              {rfp.structuredData?.items?.length || 0} items
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-slate-600">
              ${rfp.structuredData?.budget?.toLocaleString() || 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(rfp.createdAt)}</span>
          </div>
          
          {rfp.proposals?.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {rfp.proposals.slice(0, 3).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                  >
                    {idx + 1}
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-primary-600">
                {rfp.proposals.length} proposal{rfp.proposals.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default RFPCard;
