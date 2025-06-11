// src/pages/Dispatch/Dispatch.jsx
import React from 'react';

export default function Dispatch() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dispatch</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the Dispatch page where items can be dispatched to requesters.</p>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Request #12352 - Monitor</span>
              <button className="px-3 py-1 bg-green-600 text-white rounded-md">Dispatch</button>
            </div>
            <p className="text-sm text-gray-500">Status: Ready for Dispatch</p>
          </div>
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Request #12353 - Keyboard</span>
              <button className="px-3 py-1 bg-green-600 text-white rounded-md">Dispatch</button>
            </div>
            <p className="text-sm text-gray-500">Status: Ready for Dispatch</p>
          </div>
        </div>
      </div>
    </div>
  );
}