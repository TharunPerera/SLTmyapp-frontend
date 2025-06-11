// src/pages/MyReceipt/MyReceipt.jsx
import React from 'react';

export default function MyReceipt() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Receipts</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the My Receipt page where users can view their receipts.</p>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Receipt #5001 - Laptop</span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md">View</button>
            </div>
            <p className="text-sm text-gray-500">Date: March 15, 2025</p>
          </div>
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Receipt #5002 - Software</span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded-md">View</button>
            </div>
            <p className="text-sm text-gray-500">Date: March 10, 2025</p>
          </div>
        </div>
      </div>
    </div>
  );
}