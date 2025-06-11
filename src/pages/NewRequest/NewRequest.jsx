// src/pages/NewRequest/NewRequest.jsx
import React from 'react';

export default function NewRequest() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">New Request</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the New Request page where users can create new requests.</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Submit Request
        </button>
      </div>
    </div>
  );
}