// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';

// const MyRequests = () => {
//   const { user } = useAuth();
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   useEffect(() => {
//     if (user && user.serviceNumber) {
//       fetchRequests();
//     }
//   }, [user]);

//   const fetchRequests = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const response = await axios.get(
//         `http://localhost:9077/api/gatepass/requests/by-user/${user.serviceNumber}`
//       );
      
//       const requestsWithDetails = await Promise.all(
//         response.data.map(async (requestId) => {
//           try {
//             const detailResponse = await axios.get(
//               `http://localhost:9077/api/gatepass/request/${requestId}`
//             );
//             return detailResponse.data;
//           } catch (err) {
//             console.error(`Error fetching details for request ${requestId}:`, err);
//             return { refNo: requestId, error: true };
//           }
//         })
//       );
      
//       setRequests(requestsWithDetails.filter(r => !r.error));
//     } catch (err) {
//       console.error('Error fetching requests:', err);
//       setError('Failed to fetch requests. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = async (request) => {
//     try {
//       setLoading(true);
      
//       // Added request to fetch receipt data
//       const [requestResponse, verificationResponse, receiptResponse] = await Promise.all([
//         axios.get(
//           `http://localhost:9077/api/gatepass/request/${request.refNo}?includeFullApprovalHistory=true`
//         ),
//         axios.get(
//           `http://localhost:9077/api/verifications/request/${request.refNo}`
//         ).catch(err => {
//           console.warn('Verification details not found:', err);
//           return { data: {} };
//         }),
//         axios.get(
//           `http://localhost:9077/api/receipts/request/${request.refNo}`
//         ).catch(err => {
//           console.warn('Receipt details not found:', err);
//           return { data: {} };
//         })
//       ]);
      
//       // Combine data from all responses
//       const combinedData = {
//         ...requestResponse.data,
//         verificationDetails: verificationResponse.data,
//         receiptDetails: receiptResponse.data,
//         // Use data from receipt API first, then fallback to verification API, then default
//         executiveOfficer: receiptResponse.data?.executiveOfficer || requestResponse.data.executiveOfficer,
//         executiveStatus: receiptResponse.data?.executiveStatus || verificationResponse.data?.executiveStatus || requestResponse.data.executiveStatus || 'PENDING',
//         executiveComments: receiptResponse.data?.executiveComments || requestResponse.data.executiveComments,
//         executiveDate: receiptResponse.data?.executiveDate || requestResponse.data.executiveDate,
        
//         dutyOfficer: receiptResponse.data?.dutyOfficer || requestResponse.data.dutyOfficer,
//         dutyStatus: receiptResponse.data?.dutyStatus || verificationResponse.data?.dutyStatus || requestResponse.data.dutyStatus || 'PENDING',
//         dutyComments: receiptResponse.data?.dutyComments || requestResponse.data.dutyComments,
//         dutyDate: receiptResponse.data?.dutyDate || requestResponse.data.dutyDate,
        
//         securityOfficer: receiptResponse.data?.securityOfficer || requestResponse.data.securityOfficer,
//         securityStatus: receiptResponse.data?.securityStatus || verificationResponse.data?.securityStatus || requestResponse.data.securityStatus || 'PENDING',
//         securityComments: receiptResponse.data?.securityComments || requestResponse.data.securityComments,
//         securityDate: receiptResponse.data?.securityDate || requestResponse.data.securityDate,
        
//         // Enhanced receiver information with various fallbacks
//         receiverStatus: verificationResponse.data?.receiverStatus || receiptResponse.data?.receiverStatus || requestResponse.data.receiverStatus || 'PENDING',
//         receiverComments: verificationResponse.data?.receiverComments || receiptResponse.data?.receiverComments || requestResponse.data.receiverComments,
//         receiverVerificationDate: verificationResponse.data?.receiverVerificationDate || receiptResponse.data?.receiverVerificationDate || requestResponse.data.receiverVerificationDate,
//         receiverServiceNumber: verificationResponse.data?.receiverServiceNumber || receiptResponse.data?.receiverServiceNumber || requestResponse.data.receiverServiceNumber,
//         receiverName: verificationResponse.data?.receiverName || receiptResponse.data?.receiverName || requestResponse.data.receiverName,
//         // Added specific flag for received status
//         isReceived: (verificationResponse.data?.receiverStatus === 'RECEIVED' || receiptResponse.data?.receiverStatus === 'RECEIVED' || requestResponse.data.receiverStatus === 'RECEIVED' || requestResponse.data.status === 'RECEIVED')
//       };
      
//       setSelectedRequest(combinedData);
//     } catch (err) {
//       console.error('Error fetching request details:', err);
//       setError('Failed to load request details. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//       });
//     } catch (e) {
//       return 'N/A';
//     }
//   };

//   const getStatusBadge = (status) => {
//     let bgColor = 'bg-gray-100';
//     let textColor = 'text-gray-800';
    
//     if (!status) return (
//       <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}>
//         UNKNOWN
//       </span>
//     );
    
//     switch(status.toUpperCase()) {
//       case 'APPROVED':
//       case 'VERIFIED':
//         bgColor = 'bg-green-100';
//         textColor = 'text-green-800';
//         break;
//       case 'REJECTED':
//         bgColor = 'bg-red-100';
//         textColor = 'text-red-800';
//         break;
//       case 'PENDING':
//         bgColor = 'bg-yellow-100';
//         textColor = 'text-yellow-800';
//         break;
//       case 'DISPATCHED':
//         bgColor = 'bg-blue-100';
//         textColor = 'text-blue-800';
//         break;
//       case 'RECEIVED':
//         bgColor = 'bg-teal-100';
//         textColor = 'text-teal-800';
//         break;
//       default:
//         bgColor = 'bg-gray-100';
//         textColor = 'text-gray-800';
//     }
    
//     return (
//       <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
//         {status.toUpperCase()}
//       </span>
//     );
//   };

//   const getRoleBadge = (role) => {
//     let bgColor = 'bg-blue-100';
//     let textColor = 'text-blue-800';
    
//     if (role === 'EXECUTIVE_OFFICER') {
//       bgColor = 'bg-purple-100';
//       textColor = 'text-purple-800';
//     } else if (role === 'DUTY_OFFICER') {
//       bgColor = 'bg-indigo-100';
//       textColor = 'text-indigo-800';
//     } else if (role === 'SECURITY_OFFICER') {
//       bgColor = 'bg-orange-100';
//       textColor = 'text-orange-800';
//     } else if (role === 'RECEIVER') {
//       bgColor = 'bg-teal-100';
//       textColor = 'text-teal-800';
//     }
    
//     return (
//       <span className={`ml-2 px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>
//         {role.replace(/_/g, ' ')}
//       </span>
//     );
//   };

//   const ApprovalStage = ({ number, title, approval, isActive, formatDate }) => {
//     const getStageClasses = (status, isActive) => {
//       if (!isActive) return 'bg-gray-100 opacity-50';
//       if (!status) return 'bg-gray-50';
      
//       switch(status.toUpperCase()) {
//         case 'APPROVED':
//         case 'VERIFIED':
//         case 'DISPATCHED':
//         case 'RECEIVED':
//           return 'bg-green-50';
//         case 'REJECTED':
//           return 'bg-red-50';
//         case 'PENDING':
//           return 'bg-yellow-50';
//         default:
//           return 'bg-gray-50';
//       }
//     };
    
//     const getStatusIconClass = (status, isActive) => {
//       if (!isActive) return 'bg-gray-200 text-gray-400';
//       if (!status) return 'bg-gray-200 text-gray-400';
      
//       switch(status.toUpperCase()) {
//         case 'APPROVED':
//         case 'VERIFIED':
//         case 'DISPATCHED':
//           return 'bg-green-100 text-green-600';
//         case 'REJECTED':
//           return 'bg-red-100 text-red-600';
//         case 'PENDING':
//           return 'bg-yellow-100 text-yellow-600';
//         case 'RECEIVED':
//           return 'bg-teal-100 text-teal-600';
//         default:
//           return 'bg-gray-200 text-gray-400';
//       }
//     };

//     return (
//       <div className={`flex-1 p-4 ${getStageClasses(approval.status, isActive)}`}>
//         <div className="flex items-center mb-2">
//           <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusIconClass(approval.status, isActive)}`}>
//             {number}
//           </div>
//           <h4 className="ml-2 font-medium">{title}</h4>
//         </div>
//         <p className="text-sm">
//           {!isActive ? 'Awaiting previous approval' :
//           !approval.status || approval.status === 'PENDING' ? 'Pending Approval' :
//           `${approval.status} by ${approval.name || 'Officer'}`}
//         </p>
//         {approval.comments && isActive && (
//           <p className="text-xs italic mt-1">"{approval.comments}"</p>
//         )}
//         {approval.date && isActive && (
//           <p className="text-xs text-gray-500 mt-1">{formatDate(approval.date)}</p>
//         )}
//       </div>
//     );
//   };

//   const ApprovalArrow = () => (
//     <div className="hidden md:flex items-center justify-center w-8 bg-gray-100">
//       <div className="w-4 h-4 border-t-2 border-r-2 border-gray-400 transform rotate-45"></div>
//     </div>
//   );

//   const ApprovalWorkflowSection = ({ request, formatDate }) => (
//     <div className="mb-6">
//       <h3 className="font-semibold text-lg mb-3">Approval Workflow:</h3>
//       <div className="border rounded-lg overflow-hidden">
//         <div className="flex flex-col md:flex-row relative">
//           <ApprovalStage
//             number={1}
//             title="Executive Officer"
//             approval={{
//               status: request.executiveStatus,
//               name: request.executiveOfficer?.name,
//               date: request.executiveDate,
//               comments: request.executiveComments
//             }}
//             isActive={true}
//             formatDate={formatDate}
//           />
//           <ApprovalArrow />
//           <ApprovalStage
//             number={2}
//             title="Duty Officer"
//             approval={{
//               status: request.dutyStatus,
//               name: request.dutyOfficer?.name,
//               date: request.dutyDate,
//               comments: request.dutyComments
//             }}
//             isActive={request.executiveStatus === 'APPROVED' || request.executiveStatus === 'VERIFIED'}
//             formatDate={formatDate}
//           />
//           <ApprovalArrow />
//           <ApprovalStage
//             number={3}
//             title="Security Officer"
//             approval={{
//               status: request.securityStatus,
//               name: request.securityOfficer?.name,
//               date: request.securityDate,
//               comments: request.securityComments
//             }}
//             isActive={(request.executiveStatus === 'APPROVED' || request.executiveStatus === 'VERIFIED') && 
//                      (request.dutyStatus === 'APPROVED' || request.dutyStatus === 'VERIFIED')}
//             formatDate={formatDate}
//           />
//           <ApprovalArrow />
//           <ApprovalStage
//             number={4}
//             title="Receiver Verification"
//             approval={{
//               status: request.receiverStatus,
//               name: request.receiverName,
//               date: request.receiverVerificationDate,
//               comments: request.receiverComments
//             }}
//             isActive={(request.executiveStatus === 'APPROVED' || request.executiveStatus === 'VERIFIED') && 
//                      (request.dutyStatus === 'APPROVED' || request.dutyStatus === 'VERIFIED') && 
//                      (request.securityStatus === 'APPROVED' || request.securityStatus === 'VERIFIED' || request.securityStatus === 'DISPATCHED')}
//             formatDate={formatDate}
//           />
//         </div>
//       </div>
//     </div>
//   );

//   // Modified to avoid duplicate executive officer in the approval history
//   const buildApprovalHistory = (request) => {
//     if (!request) return [];
    
//     const history = [];
//     const addedServiceNumbers = new Set(); // Track service numbers to avoid duplicates
    
//     // First check if we have approval data from the approval history
//     if (request.approvals && request.approvals.length > 0) {
//       request.approvals.forEach(approval => {
//         if (approval.approvedBy) {
//           addedServiceNumbers.add(approval.approvedBy);
//           history.push(approval);
//         }
//       });
//     }
    
//     // Only add executive officer if not already in history
//     if (request.executiveOfficer && request.executiveStatus && 
//         request.executiveStatus !== 'PENDING' && 
//         !addedServiceNumbers.has(request.executiveOfficer.serviceNumber)) {
//       addedServiceNumbers.add(request.executiveOfficer.serviceNumber);
//       history.push({
//         approvedByName: request.executiveOfficer.name,
//         approvedBy: request.executiveOfficer.serviceNumber,
//         approverRole: 'EXECUTIVE_OFFICER',
//         approvalStatus: request.executiveStatus,
//         approvalDate: request.executiveDate,
//         comments: request.executiveComments || ''
//       });
//     }
    
//     // Add duty officer if not already in history
//     if (request.dutyOfficer && request.dutyStatus && 
//         request.dutyStatus !== 'PENDING' && 
//         !addedServiceNumbers.has(request.dutyOfficer.serviceNumber)) {
//       addedServiceNumbers.add(request.dutyOfficer.serviceNumber);
//       history.push({
//         approvedByName: request.dutyOfficer.name,
//         approvedBy: request.dutyOfficer.serviceNumber,
//         approverRole: 'DUTY_OFFICER',
//         approvalStatus: request.dutyStatus,
//         approvalDate: request.dutyDate,
//         comments: request.dutyComments || ''
//       });
//     }
    
//     // Add security officer if not already in history
//     if (request.securityOfficer && request.securityStatus && 
//         request.securityStatus !== 'PENDING' && 
//         !addedServiceNumbers.has(request.securityOfficer.serviceNumber)) {
//       addedServiceNumbers.add(request.securityOfficer.serviceNumber);
//       history.push({
//         approvedByName: request.securityOfficer.name,
//         approvedBy: request.securityOfficer.serviceNumber,
//         approverRole: 'SECURITY_OFFICER',
//         approvalStatus: request.securityStatus,
//         approvalDate: request.securityDate,
//         comments: request.securityComments || ''
//       });
//     }
    
//     // Add receiver verification ONLY if status is RECEIVED and not already in history
//     if (request.isReceived && request.receiverName && 
//         request.receiverStatus === 'RECEIVED' && 
//         request.receiverServiceNumber && 
//         !addedServiceNumbers.has(request.receiverServiceNumber)) {
//       addedServiceNumbers.add(request.receiverServiceNumber);
//       history.push({
//         approvedByName: request.receiverName,
//         approvedBy: request.receiverServiceNumber,
//         approverRole: 'RECEIVER',
//         approvalStatus: request.receiverStatus,
//         approvalDate: request.receiverVerificationDate,
//         comments: request.receiverComments || ''
//       });
//     }
    
//     // Sort history by date
//     return history.sort((a, b) => {
//       return new Date(a.approvalDate) - new Date(b.approvalDate);
//     });
//   };

//   if (loading && !selectedRequest) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-red-500 text-center mt-8 p-4 bg-red-50 rounded-lg">
//         {error}
//         <button 
//           onClick={fetchRequests}
//           className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">My Gate Pass Requests</h1>
      
//       {requests.length === 0 ? (
//         <div className="bg-white rounded-lg shadow p-6 text-center">
//           <p className="text-gray-500">You haven't made any gate pass requests yet.</p>
//         </div>
//       ) : (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {requests.map((request) => (
//                   <tr key={request.refNo}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {request.refNo}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {formatDate(request.createdDate)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {request.receiverName || request.receiverServiceNumber || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-500">
//                       {request.items ? (
//                         <div className="flex flex-col space-y-1">
//                           {request.items.slice(0, 2).map((item, index) => (
//                             <div key={index} className="truncate max-w-xs">
//                               {item.itemName} ({item.quantity})
//                             </div>
//                           ))}
//                           {request.items.length > 2 && (
//                             <div className="text-xs text-gray-400">
//                               +{request.items.length - 2} more items
//                             </div>
//                           )}
//                         </div>
//                       ) : 'Loading...'}
//                     </td>
//                     <td className="px-6 py-4">
//                       {request.items && request.items.some(item => item.imageUrls?.length > 0) ? (
//                         <div className="flex space-x-1">
//                           {request.items.flatMap(item => 
//                             item.imageUrls?.slice(0, 1) || []
//                           ).map((image, index) => (
//                             <img
//                               key={index}
//                               src={`http://localhost:9077/api/gatepass/items/images/${image}`}
//                               alt={`Item ${index + 1}`}
//                               className="h-10 w-10 object-cover rounded border"
//                               onError={(e) => {
//                                 e.target.src = 'https://via.placeholder.com/40?text=Image';
//                               }}
//                             />
//                           ))}
//                         </div>
//                       ) : (
//                         <span className="text-gray-400 text-xs">No images</span>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {getStatusBadge(request.status)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => handleViewDetails(request)}
//                         className="text-blue-600 hover:text-blue-900"
//                       >
//                         View
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       )}

//       {selectedRequest && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start mb-4">
//                 <h2 className="text-xl font-bold">Request Details - {selectedRequest.refNo}</h2>
//                 <button
//                   onClick={() => setSelectedRequest(null)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   ✕
//                 </button>
//               </div>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
//                 <div>
//                   <h3 className="font-semibold">Status:</h3>
//                   {getStatusBadge(selectedRequest.status)}
//                   {selectedRequest.isReceived && (
//                     <span className="ml-2 text-teal-600 text-sm">
//                       Received by {selectedRequest.receiverName || selectedRequest.receiverServiceNumber}
//                     </span>
//                   )}
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Created Date:</h3>
//                   <p>{formatDate(selectedRequest.createdDate)}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Sender (You):</h3>
//                   <p>{selectedRequest.senderName || user.fullName} ({selectedRequest.senderServiceNumber || user.serviceNumber})</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Receiver:</h3>
//                   <p>{selectedRequest.receiverName || selectedRequest.receiverServiceNumber || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Out Location:</h3>
//                   <p>{selectedRequest.outLocation || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">In Location:</h3>
//                   <p>{selectedRequest.inLocation || 'N/A'}</p>
//                 </div>
//                 {/* Always show the received date if available */}
//                 {selectedRequest.receiverVerificationDate && (selectedRequest.isReceived || selectedRequest.receiverStatus === 'RECEIVED' || selectedRequest.status === 'RECEIVED') && (
//                   <div>
//                     <h3 className="font-semibold">Received Date:</h3>
//                     <p>{formatDate(selectedRequest.receiverVerificationDate)}</p>
//                   </div>
//                 )}
//               </div>

//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-3">Items:</h3>
//                 {selectedRequest.items && selectedRequest.items.length > 0 ? (
//                   <div className="space-y-4">
//                     {selectedRequest.items.map((item, index) => (
//                       <div key={index} className="border rounded-lg p-4 bg-gray-50">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                           <div>
//                             <h4 className="font-medium">Item Name:</h4>
//                             <p>{item.itemName}</p>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">Category:</h4>
//                             <p>{item.categoryName || 'N/A'}</p>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">Quantity:</h4>
//                             <p>{item.quantity}</p>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">Serial Number:</h4>
//                             <p>{item.serialNumber || 'N/A'}</p>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">Returnable:</h4>
//                             <p>{item.returnable ? 'Yes' : 'No'}</p>
//                           </div>
//                           {item.returnable && (
//                             <div>
//                               <h4 className="font-medium">Due Date:</h4>
//                               <p>{formatDate(item.dueDate)}</p>
//                             </div>
//                           )}
//                           <div className="md:col-span-3">
//                             <h4 className="font-medium">Description:</h4>
//                             <p>{item.description || 'No description'}</p>
//                           </div>
//                         </div>
                        
//                         {item.imageUrls && item.imageUrls.length > 0 && (
//                           <div className="mt-3">
//                             <h4 className="font-medium mb-2">Images:</h4>
//                             <div className="flex flex-wrap gap-2">
//                               {item.imageUrls.map((image, imgIndex) => (
//                                 <img
//                                   key={imgIndex}
//                                   src={`http://localhost:9077/api/gatepass/items/images/${image}`}
//                                   alt={`Item ${index + 1}`}
//                                   className="h-24 w-24 object-cover border rounded"
//                                   onError={(e) => {
//                                     e.target.src = 'https://via.placeholder.com/100?text=Image+Not+Found';
//                                   }}
//                                 />
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500">No items in this request</p>
//                 )}
//               </div>

//               <ApprovalWorkflowSection 
//                 request={selectedRequest}
//                 formatDate={formatDate}
//               />

//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-3">Approval History:</h3>
//                 {buildApprovalHistory(selectedRequest).length > 0 ? (
//                   <div className="space-y-3">
//                     {buildApprovalHistory(selectedRequest).map((approval, index) => (
//                       <div key={index} className="border rounded-lg p-3 bg-gray-50">
//                         <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
//                           <div>
//                             <h4 className="font-medium">Approved By:</h4>
//                             <p>
//                               {approval.approvedByName || approval.approvedBy}
//                               {approval.approverRole && getRoleBadge(approval.approverRole)}
//                             </p>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">Status:</h4>
//                             <p className={`${
//                               approval.approvalStatus === 'APPROVED' || approval.approvalStatus === 'VERIFIED' || approval.approvalStatus === 'DISPATCHED' ? 'text-green-600' :
//                               approval.approvalStatus === 'REJECTED' ? 'text-red-600' :
//                               approval.approvalStatus === 'RECEIVED' ? 'text-teal-600' :
//                               'text-yellow-600'} font-medium`}>
//                               {approval.approvalStatus}
//                             </p>
//                           </div>
//                           <div>
//                             <h4 className="font-medium">Date:</h4>
//                             <p>{formatDate(approval.approvalDate)}</p>
//                           </div>
//                           <div className="md:col-span-3">
//                             <h4 className="font-medium">Comments:</h4>
//                             <p>{approval.comments || 'No comments'}</p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="border rounded-lg p-4 bg-gray-50">
//                     <p className="text-gray-500">No approval history available</p>
//                     {selectedRequest.status === 'PENDING' && (
//                       <p className="text-yellow-600 font-medium mt-2">
//                         This request is awaiting approval
//                       </p>
//                     )}
//                   </div>
//                 )}
//               </div>
         
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default MyRequests;




"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const MyRequests = () => {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedRequest, setSelectedRequest] = useState(null)

  useEffect(() => {
    if (user && user.serviceNumber) {
      fetchRequests()
    }
  }, [user])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await axios.get(`http://localhost:9077/api/gatepass/requests/by-user/${user.serviceNumber}`)
      const requestsWithDetails = await Promise.all(
        response.data.map(async (requestId) => {
          try {
            const detailResponse = await axios.get(`http://localhost:9077/api/gatepass/request/${requestId}`)
            return detailResponse.data
          } catch (err) {
            console.error(`Error fetching details for request ${requestId}:`, err)
            return { refNo: requestId, error: true }
          }
        }),
      )
      setRequests(requestsWithDetails.filter((r) => !r.error))
    } catch (err) {
      console.error("Error fetching requests:", err)
      setError("Failed to fetch requests. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = async (request) => {
    try {
      setLoading(true)
      const [requestResponse, verificationResponse, receiptResponse] = await Promise.all([
        axios.get(`http://localhost:9077/api/gatepass/request/${request.refNo}?includeFullApprovalHistory=true`),
        axios.get(`http://localhost:9077/api/verifications/request/${request.refNo}`).catch((err) => {
          console.warn("Verification details not found:", err)
          return { data: {} }
        }),
        axios.get(`http://localhost:9077/api/receipts/request/${request.refNo}`).catch((err) => {
          console.warn("Receipt details not found:", err)
          return { data: {} }
        }),
      ])

      const combinedData = {
        ...requestResponse.data,
        verificationDetails: verificationResponse.data,
        receiptDetails: receiptResponse.data,
        executiveOfficer: receiptResponse.data?.executiveOfficer || requestResponse.data.executiveOfficer,
        executiveStatus:
          receiptResponse.data?.executiveStatus ||
          verificationResponse.data?.executiveStatus ||
          requestResponse.data.executiveStatus ||
          "PENDING",
        executiveComments: receiptResponse.data?.executiveComments || requestResponse.data.executiveComments,
        executiveDate: receiptResponse.data?.executiveDate || requestResponse.data.executiveDate,
        dutyOfficer: receiptResponse.data?.dutyOfficer || requestResponse.data.dutyOfficer,
        dutyStatus:
          receiptResponse.data?.dutyStatus ||
          verificationResponse.data?.dutyStatus ||
          requestResponse.data.dutyStatus ||
          "PENDING",
        dutyComments: receiptResponse.data?.dutyComments || requestResponse.data.dutyComments,
        dutyDate: receiptResponse.data?.dutyDate || requestResponse.data.dutyDate,
        receiverStatus:
          verificationResponse.data?.receiverStatus ||
          receiptResponse.data?.receiverStatus ||
          requestResponse.data.receiverStatus ||
          "PENDING",
        receiverComments:
          verificationResponse.data?.receiverComments ||
          receiptResponse.data?.receiverComments ||
          requestResponse.data.receiverComments,
        receiverVerificationDate:
          verificationResponse.data?.receiverVerificationDate ||
          receiptResponse.data?.receiverVerificationDate ||
          requestResponse.data.receiverVerificationDate,
        receiverServiceNumber:
          verificationResponse.data?.receiverServiceNumber ||
          receiptResponse.data?.receiverServiceNumber ||
          requestResponse.data.receiverServiceNumber,
        receiverName:
          verificationResponse.data?.receiverName ||
          receiptResponse.data?.receiverName ||
          requestResponse.data.receiverName,
        isReceived:
          verificationResponse.data?.receiverStatus === "RECEIVED" ||
          receiptResponse.data?.receiverStatus === "RECEIVED" ||
          requestResponse.data.receiverStatus === "RECEIVED" ||
          requestResponse.data.status === "RECEIVED",
        isColomboMain: requestResponse.data.outLocation === "Colombo Main",
      }

      setSelectedRequest(combinedData)
    } catch (err) {
      console.error("Error fetching request details:", err)
      setError("Failed to load request details. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime())
        ? "N/A"
        : date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
    } catch (e) {
      return "N/A"
    }
  }

  const getStatusBadge = (status) => {
    let bgColor = "bg-gray-100"
    let textColor = "text-gray-800"

    if (!status) return <span className={`px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800`}>UNKNOWN</span>

    switch (status.toUpperCase()) {
      case "APPROVED":
      case "VERIFIED":
      case "EXECUTIVEAPPROVED":
      case "DUTYOFFICERAPPROVED":
        bgColor = "bg-green-100"
        textColor = "text-green-800"
        break
      case "REJECTED":
      case "EXECUTIVEREJECTED":
      case "DUTYOFFICERREJECTED":
      case "RECEIVERREJECTED":
        bgColor = "bg-red-100"
        textColor = "text-red-800"
        break
      case "PENDING":
        bgColor = "bg-yellow-100"
        textColor = "text-yellow-800"
        break
      case "RECEIVED":
        bgColor = "bg-teal-100"
        textColor = "text-teal-800"
        break
      default:
        bgColor = "bg-gray-100"
        textColor = "text-gray-800"
    }

    return <span className={`px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>{status.toUpperCase()}</span>
  }

  const getRoleBadge = (role) => {
    let bgColor = "bg-blue-100"
    let textColor = "text-blue-800"

    if (role === "EXECUTIVE_OFFICER") {
      bgColor = "bg-purple-100"
      textColor = "text-purple-800"
    } else if (role === "DUTY_OFFICER") {
      bgColor = "bg-indigo-100"
      textColor = "text-indigo-800"
    } else if (role === "RECEIVER") {
      bgColor = "bg-teal-100"
      textColor = "text-teal-800"
    }

    return (
      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${bgColor} ${textColor}`}>{role.replace(/_/g, " ")}</span>
    )
  }

  const ApprovalStage = ({ number, title, approval, isActive, formatDate }) => {
    const getStageClasses = (status, isActive) => {
      if (!isActive) return "bg-gray-100 opacity-50"
      if (!status || status === "PENDING") return "bg-gray-50"

      switch (status.toUpperCase()) {
        case "APPROVED":
        case "VERIFIED":
        case "EXECUTIVEAPPROVED":
        case "DUTYOFFICERAPPROVED":
        case "RECEIVED":
          return "bg-green-50"
        case "REJECTED":
        case "EXECUTIVEREJECTED":
        case "DUTYOFFICERREJECTED":
        case "RECEIVERREJECTED":
          return "bg-red-50"
        case "PENDING":
          return "bg-yellow-50"
        default:
          return "bg-gray-50"
      }
    }

    const getStatusIconClass = (status, isActive) => {
      if (!isActive) return "bg-gray-200 text-gray-400"
      if (!status || status === "PENDING") return "bg-gray-200 text-gray-400"

      switch (status.toUpperCase()) {
        case "APPROVED":
        case "VERIFIED":
        case "EXECUTIVEAPPROVED":
        case "DUTYOFFICERAPPROVED":
          return "bg-green-100 text-green-600"
        case "REJECTED":
        case "EXECUTIVEREJECTED":
        case "DUTYOFFICERREJECTED":
        case "RECEIVERREJECTED":
          return "bg-red-100 text-red-600"
        case "PENDING":
          return "bg-yellow-100 text-yellow-600"
        case "RECEIVED":
          return "bg-teal-100 text-teal-600"
        default:
          return "bg-gray-200 text-gray-400"
      }
    }

    return (
      <div className={`flex-1 p-4 ${getStageClasses(approval.status, isActive)}`}>
        <div className="flex items-center mb-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${getStatusIconClass(approval.status, isActive)}`}
          >
            {number}
          </div>
          <h4 className="ml-2 font-medium">{title}</h4>
        </div>
        <p className="text-sm">
          {!isActive
            ? "Awaiting previous approval"
            : !approval.status || approval.status === "PENDING"
              ? "Pending Approval"
              : `${approval.status} by ${approval.name || "Officer"}`}
        </p>
        {approval.comments && isActive && <p className="text-xs italic mt-1">"{approval.comments}"</p>}
        {approval.date && isActive && <p className="text-xs text-gray-500 mt-1">{formatDate(approval.date)}</p>}
      </div>
    )
  }

  const ApprovalArrow = () => (
    <div className="hidden md:flex items-center justify-center w-8 bg-gray-100">
      <div className="w-4 h-4 border-t-2 border-r-2 border-gray-400 transform rotate-45"></div>
    </div>
  )

  const ApprovalWorkflowSection = ({ request, formatDate }) => {
    const isColomboMain = request.isColomboMain

    return (
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-3">Approval Workflow:</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row relative">
            <ApprovalStage
              number={1}
              title="Executive Officer"
              approval={{
                status: request.executiveStatus,
                name: request.executiveOfficer?.name,
                date: request.executiveDate,
                comments: request.executiveComments,
              }}
              isActive={true}
              formatDate={formatDate}
            />
            <ApprovalArrow />

            {isColomboMain && (
              <>
                <ApprovalStage
                  number={2}
                  title="Duty Officer"
                  approval={{
                    status: request.dutyStatus,
                    name: request.dutyOfficer?.name,
                    date: request.dutyDate,
                    comments: request.dutyComments,
                  }}
                  isActive={request.executiveStatus === "APPROVED" || request.executiveStatus === "ExecutiveApproved"}
                  formatDate={formatDate}
                />
                <ApprovalArrow />
              </>
            )}

            <ApprovalStage
              number={isColomboMain ? 3 : 2}
              title="Receiver Verification"
              approval={{
                status: request.receiverStatus,
                name: request.receiverName,
                date: request.receiverVerificationDate,
                comments: request.receiverComments,
              }}
              isActive={
                isColomboMain
                  ? request.dutyStatus === "VERIFIED" || request.dutyStatus === "DutyOfficerApproved"
                  : request.executiveStatus === "APPROVED" || request.executiveStatus === "ExecutiveApproved"
              }
              formatDate={formatDate}
            />
          </div>
        </div>
      </div>
    )
  }

  const buildApprovalHistory = (request) => {
    if (!request) return []
    const history = []
    const addedServiceNumbers = new Set()

    if (request.approvals && request.approvals.length > 0) {
      request.approvals.forEach((approval) => {
        if (approval.approvedBy) {
          addedServiceNumbers.add(approval.approvedBy)
          history.push(approval)
        }
      })
    }

    if (
      request.executiveOfficer &&
      request.executiveStatus &&
      request.executiveStatus !== "PENDING" &&
      !addedServiceNumbers.has(request.executiveOfficer.serviceNumber)
    ) {
      addedServiceNumbers.add(request.executiveOfficer.serviceNumber)
      history.push({
        approvedByName: request.executiveOfficer.name,
        approvedBy: request.executiveOfficer.serviceNumber,
        approverRole: "EXECUTIVE_OFFICER",
        approvalStatus: request.executiveStatus,
        approvalDate: request.executiveDate,
        comments: request.executiveComments || "",
      })
    }

    if (
      request.dutyOfficer &&
      request.dutyStatus &&
      request.dutyStatus !== "PENDING" &&
      !addedServiceNumbers.has(request.dutyOfficer.serviceNumber)
    ) {
      addedServiceNumbers.add(request.dutyOfficer.serviceNumber)
      history.push({
        approvedByName: request.dutyOfficer.name,
        approvedBy: request.dutyOfficer.serviceNumber,
        approverRole: "DUTY_OFFICER",
        approvalStatus: request.dutyStatus,
        approvalDate: request.dutyDate,
        comments: request.dutyComments || "",
      })
    }

    if (
      request.isReceived &&
      request.receiverName &&
      request.receiverStatus === "RECEIVED" &&
      request.receiverServiceNumber &&
      !addedServiceNumbers.has(request.receiverServiceNumber)
    ) {
      addedServiceNumbers.add(request.receiverServiceNumber)
      history.push({
        approvedByName: request.receiverName,
        approvedBy: request.receiverServiceNumber,
        approverRole: "RECEIVER",
        approvalStatus: request.receiverStatus,
        approvalDate: request.receiverVerificationDate,
        comments: request.receiverComments || "",
      })
    }

    return history.sort((a, b) => {
      return new Date(a.approvalDate) - new Date(b.approvalDate)
    })
  }

  if (loading && !selectedRequest) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500 text-center mt-8 p-4 bg-red-50 rounded-lg">
        {error}
        <button onClick={fetchRequests} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Gate Pass Requests</h1>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">You haven't made any gate pass requests yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Images
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.refNo}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.refNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.receiverName || request.receiverServiceNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {request.items ? (
                        <div className="flex flex-col space-y-1">
                          {request.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="truncate max-w-xs">
                              {item.itemName} ({item.quantity})
                            </div>
                          ))}
                          {request.items.length > 2 && (
                            <div className="text-xs text-gray-400">+{request.items.length - 2} more items</div>
                          )}
                        </div>
                      ) : (
                        "Loading..."
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {request.items && request.items.some((item) => item.imageUrls?.length > 0) ? (
                        <div className="flex space-x-1">
                          {request.items
                            .flatMap((item) => item.imageUrls?.slice(0, 1) || [])
                            .map((image, index) => (
                              <img
                                key={index}
                                src={`http://localhost:9077/api/gatepass/items/images/${image}`}
                                alt={`Item ${index + 1}`}
                                className="h-10 w-10 object-cover rounded border"
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/40?text=Image"
                                }}
                              />
                            ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No images</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleViewDetails(request)} className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">Request Details - {selectedRequest.refNo}</h2>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="font-semibold">Status:</h3>
                  {getStatusBadge(selectedRequest.status)}
                  {selectedRequest.isReceived && (
                    <span className="ml-2 text-teal-600 text-sm">
                      Received by {selectedRequest.receiverName || selectedRequest.receiverServiceNumber}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">Created Date:</h3>
                  <p>{formatDate(selectedRequest.createdDate)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Sender (You):</h3>
                  <p>
                    {selectedRequest.senderName || user.fullName} (
                    {selectedRequest.senderServiceNumber || user.serviceNumber})
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold">Receiver:</h3>
                  <p>{selectedRequest.receiverName || selectedRequest.receiverServiceNumber || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Out Location:</h3>
                  <p>{selectedRequest.outLocation || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">In Location:</h3>
                  <p>{selectedRequest.inLocation || "N/A"}</p>
                </div>
                {selectedRequest.receiverVerificationDate &&
                  (selectedRequest.isReceived ||
                    selectedRequest.receiverStatus === "RECEIVED" ||
                    selectedRequest.status === "RECEIVED") && (
                    <div>
                      <h3 className="font-semibold">Received Date:</h3>
                      <p>{formatDate(selectedRequest.receiverVerificationDate)}</p>
                    </div>
                  )}
              </div>

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
                            <p>{item.categoryName || "N/A"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Quantity:</h4>
                            <p>{item.quantity}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Serial Number:</h4>
                            <p>{item.serialNumber || "N/A"}</p>
                          </div>
                          <div>
                            <h4 className="font-medium">Returnable:</h4>
                            <p>{item.returnable ? "Yes" : "No"}</p>
                          </div>
                          {item.returnable && (
                            <div>
                              <h4 className="font-medium">Due Date:</h4>
                              <p>{formatDate(item.dueDate)}</p>
                            </div>
                          )}
                          <div className="md:col-span-3">
                            <h4 className="font-medium">Description:</h4>
                            <p>{item.description || "No description"}</p>
                          </div>
                        </div>
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
                                    e.target.src = "https://via.placeholder.com/100?text=Image+Not+Found"
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

              <ApprovalWorkflowSection request={selectedRequest} formatDate={formatDate} />

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Approval History:</h3>
                {buildApprovalHistory(selectedRequest).length > 0 ? (
                  <div className="space-y-3">
                    {buildApprovalHistory(selectedRequest).map((approval, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <h4 className="font-medium">Approved By:</h4>
                            <p>
                              {approval.approvedByName || approval.approvedBy}
                              {approval.approverRole && getRoleBadge(approval.approverRole)}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Status:</h4>
                            <p
                              className={`${
                                approval.approvalStatus === "APPROVED" ||
                                approval.approvalStatus === "VERIFIED" ||
                                approval.approvalStatus === "ExecutiveApproved" ||
                                approval.approvalStatus === "DutyOfficerApproved"
                                  ? "text-green-600"
                                  : approval.approvalStatus === "REJECTED" ||
                                      approval.approvalStatus === "ExecutiveRejected" ||
                                      approval.approvalStatus === "DutyOfficerRejected"
                                    ? "text-red-600"
                                    : approval.approvalStatus === "RECEIVED"
                                      ? "text-teal-600"
                                      : "text-yellow-600"
                              } font-medium`}
                            >
                              {approval.approvalStatus}
                            </p>
                          </div>
                          <div>
                            <h4 className="font-medium">Date:</h4>
                            <p>{formatDate(approval.approvalDate)}</p>
                          </div>
                          <div className="md:col-span-3">
                            <h4 className="font-medium">Comments:</h4>
                            <p>{approval.comments || "No comments"}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-gray-500">No approval history available</p>
                    {selectedRequest.status === "PENDING" && (
                      <p className="text-yellow-600 font-medium mt-2">This request is awaiting approval</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyRequests
