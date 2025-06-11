// src/pages/MyRequest/MyRequest.jsx
import React from 'react';

export default function MyRequest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Requests</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the My Request page where users can view all their requests.</p>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Request #12345</span>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Pending</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Request #12346</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Approved</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-medium">Request #12347</span>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">Rejected</span>
          </div>
        </div>
      </div>
    </div>
  );
}