import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const ExecutiveApprovalPage = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [processedRequests, setProcessedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState({ text: '', isError: false });
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (user && user.serviceNumber) {
      fetchAllRequests();
    }
  }, [user]);

  const fetchAllRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch pending requests
      const pendingResponse = await axios.get(
        `http://localhost:9077/api/gatepass/pending/executive/${user.serviceNumber}`
      );
      setPendingRequests(pendingResponse.data);
      
      // Fetch processed requests (approved/rejected)
      const processedResponse = await axios.get(
        `http://localhost:9077/api/approvals/executive/${user.serviceNumber}`
      );
      
      // Enhance processed requests with full details
      const enhancedProcessedRequests = await Promise.all(
        processedResponse.data.map(async (request) => {
          try {
            // Fetch the complete request details to get sender/receiver info
            const requestId = request.refNo || request.requestId;
            const detailResponse = await axios.get(
              `http://localhost:9077/api/gatepass/request/${requestId}`
            );
            // Merge the approval data with the complete request data
            return {
              ...request,
              ...detailResponse.data,
              // Keep original approval data
              comments: request.comments,
              approvalStatus: request.approvalStatus || request.status,
              approvalDate: request.approvalDate
            };
          } catch (err) {
            console.error(`Error fetching details for request ${request.refNo || request.requestId}:`, err);
            return request; // Return original if fetch fails
          }
        })
      );
      
      setProcessedRequests(enhancedProcessedRequests);
      
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Failed to fetch requests. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (request) => {
    try {
      setLoading(true);
      // Clear any previous messages
      setActionMessage({ text: '', isError: false });
      
      // Determine the correct ID to use (refNo or requestId)
      const requestId = request.refNo || request.requestId;
      console.log('Fetching details for request ID:', requestId);
      
      // Make the API call to get request details
      const response = await axios.get(
        `http://localhost:9077/api/gatepass/request/${requestId}`
      );
      
      console.log('Request details response:', response.data);
      
      // Set the selected request and clear any previous comment
      setSelectedRequest({
        ...response.data,
        // If this is from processed requests, preserve the comments
        comments: request.comments || response.data.comments
      });
      setComment('');
      
    } catch (err) {
      console.error('Error fetching request details:', err);
      setActionMessage({
        text: 'Failed to load request details. Please try again.',
        isError: true
      });
      
      // For debugging - check what error we're getting
      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error status:', err.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (status) => {
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
  
      const approvalData = {
        requestId: selectedRequest.refNo,  // Changed from refNo to requestId to match backend
        approvedBy: user.serviceNumber,    // Changed from executiveId to approvedBy
        approvalStatus: status,            // Changed from status to approvalStatus
        comments: comment                  // Changed from comment to comments
      };
  
      console.log('Submitting approval:', approvalData); // Debug log
  
      const response = await axios.post(
        'http://localhost:9077/api/approvals', 
        approvalData
      );
  
      console.log('Approval response:', response.data); // Debug log
      
      setActionMessage({ 
        text: `Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully!`, 
        isError: false 
      });
      
      // Refresh data and switch tab after short delay
      setTimeout(() => {
        setSelectedRequest(null);
        fetchAllRequests();
        // Switch to appropriate tab based on action - tab index 1 for APPROVED, 2 for REJECTED
        setTabIndex(status === 'APPROVED' ? 1 : 2);
      }, 1500);
      
    } catch (err) {
      console.error('Error processing approval:', err);
      setActionMessage({ 
        text: err.response?.data || 'Failed to process approval. Please try again.', 
        isError: true 
      });
    } finally {
      setActionLoading(false);
    }
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

  const renderRequestTable = (requests, showComments = false) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
            {showComments && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>}
            {showComments && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => {
            // Debug logging to see what fields are available
            console.log("Request in table:", request);
            
            return (
              <tr key={request.requestId || request.refNo}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.requestId || request.refNo}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatDate(request.createdDate || request.approvalDate)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.senderName || 
                   (request.sender && request.sender.name) || 
                   request.senderServiceNumber || 
                   'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.receiverName || 
                   (request.receiver && request.receiver.name) || 
                   request.receiverServiceNumber || 
                   'N/A'}
                </td>
                {showComments && (
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {request.comments || 
                       (request.approvals && request.approvals[0] && request.approvals[0].comments) || 
                       'No comments'}
                    </div>
                  </td>
                )}
                {showComments && (
                  <td className="px-6 py-4">
                    {request.items && request.items.length > 0 && request.items.some(item => item.imageUrls && item.imageUrls.length > 0) ? (
                      <div className="flex flex-wrap gap-1">
                        {request.items.flatMap((item, itemIndex) => 
                          item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls.map((image, imgIndex) => (
                            <img
                              key={`${itemIndex}-${imgIndex}`}
                              src={`http://localhost:9077/api/gatepass/items/images/${image}`}
                              alt={`Item ${itemIndex + 1}`}
                              className="h-12 w-12 object-cover border rounded cursor-pointer"
                              onClick={() => handleViewDetails(request)}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100?text=Image+Not+Found';
                              }}
                            />
                          )) : []
                        ).slice(0, 3)}
                        {request.items.reduce((total, item) => total + (item.imageUrls?.length || 0), 0) > 3 && (
                          <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs">
                            +{request.items.reduce((total, item) => total + (item.imageUrls?.length || 0), 0) - 3}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">No images</span>
                    )}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    (request.status === 'APPROVED' || request.approvalStatus === 'APPROVED') ? 'bg-green-100 text-green-800' :
                    (request.status === 'REJECTED' || request.approvalStatus === 'REJECTED') ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status || request.approvalStatus || 'PENDING'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleViewDetails(request)}
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
          onClick={fetchAllRequests}
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
        <h1 className="text-2xl font-bold">Gate Pass Requests</h1>
        <div className="text-right">
          <p className="font-medium">{user?.fullName || user?.serviceNumber} (Executive Officer)</p>
        </div>
      </div>
      
      <Tabs selectedIndex={tabIndex} onSelect={index => setTabIndex(index)}>
        <TabList>
          <Tab>Pending ({pendingRequests.length})</Tab>
          <Tab>Approved ({processedRequests.filter(r => r.approvalStatus === 'APPROVED' || r.status === 'APPROVED').length})</Tab>
          <Tab>Rejected ({processedRequests.filter(r => r.approvalStatus === 'REJECTED' || r.status === 'REJECTED').length})</Tab>
        </TabList>
        
        <TabPanel>
          {pendingRequests.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No pending requests</div>
          ) : (
            renderRequestTable(pendingRequests)
          )}
        </TabPanel>
        
        <TabPanel>
          {processedRequests.filter(r => r.approvalStatus === 'APPROVED' || r.status === 'APPROVED').length === 0 ? (
            <div className="text-center text-gray-500 p-8">No approved requests</div>
          ) : (
            renderRequestTable(
              processedRequests.filter(r => r.approvalStatus === 'APPROVED' || r.status === 'APPROVED'),
              true // Show comments and images
            )
          )}
        </TabPanel>
        
        <TabPanel>
          {processedRequests.filter(r => r.approvalStatus === 'REJECTED' || r.status === 'REJECTED').length === 0 ? (
            <div className="text-center text-gray-500 p-8">No rejected requests</div>
          ) : (
            renderRequestTable(
              processedRequests.filter(r => r.approvalStatus === 'REJECTED' || r.status === 'REJECTED'),
              true // Show comments and images
            )
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
                    selectedRequest.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    selectedRequest.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
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
                  <p>{selectedRequest.senderName || 
                      (selectedRequest.sender && selectedRequest.sender.name) || 
                      selectedRequest.senderServiceNumber || 'N/A'} 
                     ({selectedRequest.senderServiceNumber || 'N/A'})</p>
                </div>
                <div>
                  <h3 className="font-semibold">Receiver:</h3>
                  <p>{selectedRequest.receiverName || 
                      (selectedRequest.receiver && selectedRequest.receiver.name) || 
                      selectedRequest.receiverServiceNumber || 'N/A'} 
                     ({selectedRequest.receiverServiceNumber || 'N/A'})</p>
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

              {/* Approval History */}
              {selectedRequest.approvals && selectedRequest.approvals.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Approval History:</h3>
                  <div className="space-y-3">
                    {selectedRequest.approvals.map((approval, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <h4 className="font-medium">Approved By:</h4>
                            <p>{approval.approvedByName || approval.approvedBy}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Status:</h4>
                            <p className={`${
                              approval.approvalStatus === 'APPROVED' ? 'text-green-600' :
                              approval.approvalStatus === 'REJECTED' ? 'text-red-600' :
                              'text-yellow-600'
                            } font-medium`}>
                              {approval.approvalStatus}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Date:</h4>
                            <p>{formatDate(approval.approvalDate)}</p>
                          </div>
                          <div className="md:col-span-3">
                            <h4 className="font-medium">Comments:</h4>
                            <p>{approval.comments || 'No comments'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Single Approval (for processed requests that might not have approvals array) */}
              {!selectedRequest.approvals && selectedRequest.comments && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Approval Details:</h3>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <h4 className="font-medium">Approved By:</h4>
                        <p>{selectedRequest.approvedByName || selectedRequest.approvedBy || user.serviceNumber}</p>
                      </div>
                      <div>
                        <h4 className="font-medium">Status:</h4>
                        <p className={`${
                          selectedRequest.approvalStatus === 'APPROVED' || selectedRequest.status === 'APPROVED' ? 'text-green-600' :
                          selectedRequest.approvalStatus === 'REJECTED' || selectedRequest.status === 'REJECTED' ? 'text-red-600' :
                          'text-yellow-600'
                        } font-medium`}>
                          {selectedRequest.approvalStatus || selectedRequest.status}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-medium">Date:</h4>
                        <p>{formatDate(selectedRequest.approvalDate)}</p>
                      </div>
                      <div className="md:col-span-3">
                        <h4 className="font-medium">Comments:</h4>
                        <p>{selectedRequest.comments || 'No comments'}</p>
                      </div>
                    </div>
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

              {/* Approval Actions - Updated status check */}
              {(selectedRequest.status?.toUpperCase() === 'PENDING' && 
                (!selectedRequest.approvals || selectedRequest.approvals.length === 0)) && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4">Approval Action</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 font-medium mb-2">
                      Your Comment <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={4}
                      placeholder="Enter your approval or rejection comments..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => handleApproveReject('REJECTED')}
                      disabled={actionLoading || !comment.trim()}
                      className={`px-6 py-2 rounded-md ${
                        actionLoading ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
                      } text-white`}
                    >
                      {actionLoading ? 'Processing...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleApproveReject('APPROVED')}
                      disabled={actionLoading || !comment.trim()}
                      className={`px-6 py-2 rounded-md ${
                        actionLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
                      } text-white`}
                    >
                      {actionLoading ? 'Processing...' : 'Approve'}
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

export default ExecutiveApprovalPage;