// src/pages/ItemTracker/ItemTracker.jsx
import React from 'react';

export default function ItemTracker() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Item Tracker</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600 mb-4">This is the Item Tracker page where users can track their requested items.</p>
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Item #IT001 - Laptop</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">In Transit</span>
            </div>
            <div className="mt-2">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div style={{ width: "75%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ordered</span>
                <span>Shipped</span>
                <span>Delivered</span>
              </div>
            </div>
          </div>
          <div className="py-3 border-b">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Item #IT002 - Monitor</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Delivered</span>
            </div>
            <div className="mt-2">
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                  <div style={{ width: "100%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Ordered</span>
                <span>Shipped</span>
                <span>Delivered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}