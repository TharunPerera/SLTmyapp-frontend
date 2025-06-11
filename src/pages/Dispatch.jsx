import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const Dispatch = () => {
  const { user } = useAuth();
  const [pendingDispatches, setPendingDispatches] = useState([]);
  const [processedDispatches, setProcessedDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', isError: false });
  const [tabIndex, setTabIndex] = useState(0);
  const [verificationHistory, setVerificationHistory] = useState(null);

  useEffect(() => {
    if (user && user.serviceNumber) {
      fetchAllDispatches();
    }
  }, [user]);

  const fetchAllDispatches = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch pending dispatches
      const pendingResponse = await axios.get(
        `http://localhost:9077/api/dispatches/pending`
      );
      setPendingDispatches(pendingResponse.data);
      
      // Fetch processed dispatches
      const processedResponse = await axios.get(
        `http://localhost:9077/api/dispatches/security-officer/${user.serviceNumber}`
      );
      setProcessedDispatches(processedResponse.data);
      
    } catch (err) {
      console.error('Error fetching dispatches:', err);
      setError('Failed to fetch dispatches. Please try again.');
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (request) => {
    try {
      setLoading(true);
      setActionMessage({ text: '', isError: false });
      
      const requestId = request.refNo || request.requestId;
      console.log('Fetching details for request ID:', requestId);
      
      const response = await axios.get(
        `http://localhost:9077/api/gatepass/request/${requestId}`
      );
      
      console.log('Request details response:', response.data);
      
      try {
        const historyResponse = await axios.get(
          `http://localhost:9077/api/dispatches/request/${requestId}`
        );
        console.log('Verification history response:', historyResponse.data);
        setVerificationHistory(historyResponse.data);
      } catch (historyErr) {
        console.error('Error fetching verification history:', historyErr);
        setVerificationHistory(null);
      }
      
      setSelectedRequest({
        ...response.data,
        comments: request.comments || response.data.comments
      });
      setComment('');
      
    } catch (err) {
      console.error('Error fetching request details:', err);
      setActionMessage({
        text: 'Failed to load request details. Please try again.',
        isError: true
      });
      
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDispatch = async (status = "DISPATCHED") => {
    if (!selectedRequest || !selectedRequest.refNo || !comment.trim()) {
      setActionMessage({ 
        text: 'Please enter a comment before submitting', 
        isError: true 
      });
      return;
    }
  
    try {
      setActionLoading(true);
      setActionMessage({ text: '', isError: false });
  
      const dispatchData = {
        requestId: selectedRequest.refNo,
        dispatchedBy: user.serviceNumber,
        status: status,
        comments: comment
      };
  
      console.log('Submitting dispatch:', dispatchData);
  
      const response = await axios.post(
        'http://localhost:9077/api/dispatches', 
        dispatchData
      );
  
      console.log('Dispatch response:', response.data);
      
      setActionMessage({ 
        text: `Request ${status === 'DISPATCHED' ? 'dispatched' : 'rejected'} successfully!`, 
        isError: false 
      });
      
      setTimeout(() => {
        setSelectedRequest(null);
        fetchAllDispatches();
        setTabIndex(1);
      }, 1500);
      
    } catch (err) {
      console.error('Error processing dispatch:', err);
      setActionMessage({ 
        text: err.response?.data || 'Failed to process dispatch. Please try again.', 
        isError: true 
      });
    } finally {
      setActionLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    if (!status) return '';
    const upperStatus = status.toUpperCase();
    if (upperStatus === 'DISPATCHED' || upperStatus === 'REJECTED') {
      return upperStatus;
    }
    return status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
    } catch (e) {
      return 'N/A';
    }
  };

  // Helper functions to extract names
  const getSenderName = (dispatch) => {
    if (dispatch.sender?.firstName && dispatch.sender?.lastName) {
      return `${dispatch.sender.firstName} ${dispatch.sender.lastName}`;
    }
    if (dispatch.sender?.name) {
      return dispatch.sender.name;
    }
    if (dispatch.senderName) {
      return dispatch.senderName;
    }
    if (dispatch.senderServiceNumber) {
      return dispatch.senderServiceNumber;
    }
    if (dispatch.requestedBy?.firstName) {
      return `${dispatch.requestedBy.firstName} ${dispatch.requestedBy.lastName || ''}`.trim();
    }
    return 'N/A';
  };

  const getReceiverName = (dispatch) => {
    if (dispatch.receiver?.firstName && dispatch.receiver?.lastName) {
      return `${dispatch.receiver.firstName} ${dispatch.receiver.lastName}`;
    }
    if (dispatch.receiver?.name) {
      return dispatch.receiver.name;
    }
    if (dispatch.receiverName) {
      return dispatch.receiverName;
    }
    if (dispatch.receiverServiceNumber) {
      return dispatch.receiverServiceNumber;
    }
    return 'N/A';
  };

  const renderDispatchTable = (dispatches, showDetails = false) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            {/* Removed Requestor and Receiver columns */}
            {showDetails && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {dispatches.map((dispatch) => {
            console.log("Dispatch in table:", dispatch);
            const normalizedStatus = normalizeStatus(dispatch.status);
            
            return (
              <tr key={dispatch.requestId || dispatch.refNo || dispatch.dispatchId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {dispatch.requestId || dispatch.refNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(dispatch.createdDate || dispatch.requestDate || dispatch.dispatchDate)}
                </td>
                {/* Removed Requestor and Receiver columns */}
                {showDetails && (
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {dispatch.comments || 'No comments'}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    normalizedStatus === 'DISPATCHED' ? 'bg-green-100 text-green-800' :
                    normalizedStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    (dispatch.status === 'DutyOfficerApproved' || dispatch.status === 'VERIFIED') ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {dispatch.status || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(dispatch)}
                    className="text-blue-600 hover:text-blue-900 font-medium"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  if (loading && !selectedRequest) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8 p-4 bg-red-50 rounded-lg">
        {error}
        <button 
          onClick={fetchAllDispatches}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gate Pass Dispatch Management</h1>
        <div className="text-right">
          <p className="font-medium">{user?.fullName || user?.serviceNumber} (Security Officer)</p>
        </div>
      </div>
      
      <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
        <TabList>
          <Tab>Pending Dispatches ({pendingDispatches.length})</Tab>
          <Tab>Dispatched ({processedDispatches.length})</Tab>
        </TabList>
        
        <TabPanel>
          {pendingDispatches.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No pending dispatches</div>
          ) : (
            renderDispatchTable(pendingDispatches)
          )}
        </TabPanel>
        
        <TabPanel>
          {processedDispatches.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No dispatched requests</div>
          ) : (
            renderDispatchTable(processedDispatches, true)
          )}
        </TabPanel>
      </Tabs>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Request Details - {selectedRequest.refNo}</h2>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {/* General Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="font-semibold">Status:</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    normalizeStatus(selectedRequest.status) === 'DISPATCHED' ? 'bg-green-100 text-green-800' :
                    normalizeStatus(selectedRequest.status) === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    selectedRequest.status === 'DutyOfficerApproved' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedRequest.status || 'PENDING'}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">Created Date:</h3>
                  <p>{formatDate(selectedRequest.createdDate)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Sender:</h3>
                  <p>
                    {selectedRequest.sender?.firstName && selectedRequest.sender?.lastName 
                      ? `${selectedRequest.sender.firstName} ${selectedRequest.sender.lastName}`
                      : selectedRequest.sender?.name 
                      ? selectedRequest.sender.name 
                      : selectedRequest.senderName 
                      ? selectedRequest.senderName 
                      : 'N/A'} 
                    {selectedRequest.senderServiceNumber ? `(${selectedRequest.senderServiceNumber})` : ''}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Receiver:</h3>
                  <p>
                    {selectedRequest.receiver?.firstName && selectedRequest.receiver?.lastName 
                      ? `${selectedRequest.receiver.firstName} ${selectedRequest.receiver.lastName}`
                      : selectedRequest.receiver?.name 
                      ? selectedRequest.receiver.name 
                      : selectedRequest.receiverName 
                      ? selectedRequest.receiverName 
                      : 'N/A'} 
                    {selectedRequest.receiverServiceNumber ? `(${selectedRequest.receiverServiceNumber})` : ''}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Out Location:</h3>
                  <p>{selectedRequest.outLocation || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="font-semibold">In Location:</h3>
                  <p>{selectedRequest.inLocation || 'N/A'}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Items:</h3>
                {selectedRequest.items && selectedRequest.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRequest.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium">Item Name:</h4>
                            <p>{item.itemName}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Category:</h4>
                            <p>{item.categoryName}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Quantity:</h4>
                            <p>{item.quantity}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Serial Number:</h4>
                            <p>{item.serialNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Returnable:</h4>
                            <p>{item.returnable ? 'Yes' : 'No'}</p>
                          </div>
                          {item.returnable && (
                            <div>
                              <h4 className="font-medium">Due Date:</h4>
                              <p>{formatDate(item.dueDate)}</p>
                            </div>
                          )}
                          <div className="md:col-span-3">
                            <h4 className="font-medium">Description:</h4>
                            <p>{item.description || 'No description'}</p>
                          </div>
                        </div>
                        
                        {/* Item Images */}
                        {item.imageUrls && item.imageUrls.length > 0 && (
                          <div className="mt-3">
                            <h4 className="font-medium mb-2">Images:</h4>
                            <div className="flex flex-wrap gap-2">
                              {item.imageUrls.map((image, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={`http://localhost:9077/api/gatepass/items/images/${image}`}
                                  alt={`Item ${index + 1}`}
                                  className="h-24 w-24 object-cover border rounded"
                                  onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/100?text=Image+Not+Found';
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No items in this request</p>
                )}
              </div>

              {/* Verification History */}
              {verificationHistory && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Verification History:</h3>
                  <div className="space-y-4">
                    {/* Executive Officer Section */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-blue-700 mb-2">Executive Officer Verification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h5 className="font-medium">Officer:</h5>
                          <p>{verificationHistory.executiveOfficer?.name || 'N/A'} ({verificationHistory.executiveOfficer?.serviceNumber || 'N/A'})</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Status:</h5>
                          <p className={verificationHistory.executiveStatus === "APPROVED" ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                            {verificationHistory.executiveStatus || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium">Date:</h5>
                          <p>{formatDate(verificationHistory.executiveDate)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h5 className="font-medium">Comments:</h5>
                          <p>{verificationHistory.executiveComments || 'No comments'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Duty Officer Section */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-blue-700 mb-2">Duty Officer Verification</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <h5 className="font-medium">Officer:</h5>
                          <p>{verificationHistory.dutyOfficer?.name || 'N/A'} ({verificationHistory.dutyOfficer?.serviceNumber || 'N/A'})</p>
                        </div>
                        <div>
                          <h5 className="font-medium">Status:</h5>
                          <p className={verificationHistory.dutyStatus === "VERIFIED" ? "text-green-600 font-medium" : "text-yellow-600 font-medium"}>
                            {verificationHistory.dutyStatus || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-medium">Date:</h5>
                          <p>{formatDate(verificationHistory.dutyDate)}</p>
                        </div>
                        <div className="md:col-span-2">
                          <h5 className="font-medium">Comments:</h5>
                          <p>{verificationHistory.dutyComments || 'No comments'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Security Officer Section */}
                    {verificationHistory.securityStatus && (
                      <div className="border rounded-lg p-4 bg-gray-50">
                        <h4 className="font-medium text-blue-700 mb-2">Security Officer Verification</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <h5 className="font-medium">Officer:</h5>
                            <p>{verificationHistory.securityOfficer?.name || 'N/A'} ({verificationHistory.securityOfficer?.serviceNumber || 'N/A'})</p>
                          </div>
                          <div>
                            <h5 className="font-medium">Status:</h5>
                            <p className="text-green-600 font-medium">
                              {verificationHistory.securityStatus || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <h5 className="font-medium">Date:</h5>
                            <p>{formatDate(verificationHistory.securityDate)}</p>
                          </div>
                          <div className="md:col-span-2">
                            <h5 className="font-medium">Comments:</h5>
                            <p>{verificationHistory.securityComments || 'No comments'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Message */}
              {actionMessage.text && (
                <div className={`mb-4 p-3 rounded ${
                  actionMessage.isError ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                }`}>
                  {actionMessage.text}
                </div>
              )}

              {/* Dispatch Actions */}
              {selectedRequest.status === 'DutyOfficerApproved' && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Dispatch Action</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Your Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={4}
                      placeholder="Enter your verification comments..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleDispatch("REJECTED")}
                      disabled={actionLoading || !comment.trim()}
                      className={`px-6 py-2 rounded-md ${
                        actionLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                      } text-white`}
                    >
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </button>
                    
                    <button
                      onClick={() => handleDispatch("DISPATCHED")}
                      disabled={actionLoading || !comment.trim()}
                      className={`px-6 py-2 rounded-md ${
                        actionLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {actionLoading ? 'Processing...' : 'Dispatch'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dispatch;