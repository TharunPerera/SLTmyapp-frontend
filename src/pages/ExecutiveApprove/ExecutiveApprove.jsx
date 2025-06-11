// src/pages/ExecutiveApprove/ExecutiveApprove.jsx
import React from 'react';

export default function ExecutiveApprove() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Executive Approval</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the Executive Approve page where executives can approve or reject requests.</p>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Request #12348 - Laptop</span>
              <div>
                <button className="px-3 py-1 bg-green-600 text-white rounded-md mr-2">Approve</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded-md">Reject</button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Submitted by: John Doe</p>
          </div>
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Request #12349 - Software License</span>
              <div>
                <button className="px-3 py-1 bg-green-600 text-white rounded-md mr-2">Approve</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded-md">Reject</button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Submitted by: Jane Smith</p>
          </div>
        </div>
      </div>
    </div>
  );
}