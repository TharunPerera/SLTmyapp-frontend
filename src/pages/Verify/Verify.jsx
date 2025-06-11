// src/pages/Verify/Verify.jsx
import React from 'react';

export default function Verify() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Verify Requests</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the Verify page where requests can be verified before processing.</p>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Request #12350 - Office Equipment</span>
              <div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md">Verify</button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Status: Pending Verification</p>
          </div>
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Request #12351 - Network Access</span>
              <div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded-md">Verify</button>
              </div>
            </div>
            <p className="text-sm text-gray-500">Status: Pending Verification</p>
          </div>
        </div>
      </div>
    </div>
  );
}