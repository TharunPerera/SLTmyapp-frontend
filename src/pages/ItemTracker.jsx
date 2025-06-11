// import React, { useState } from 'react';
// import axios from 'axios';

// const ItemTracker = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [searchType, setSearchType] = useState('refNo'); // Default search by reference number
//   const [results, setResults] = useState([]);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSearch = async (e) => {
//     e.preventDefault();
    
//     if (!searchTerm.trim()) {
//       setError('Please enter a search term');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError('');
      
//       let endpoint;
//       if (searchType === 'refNo') {
//         // Direct fetch by reference number
//         endpoint = `http://localhost:9077/api/gatepass/request/${searchTerm}?includeFullApprovalHistory=true`;
//         const response = await axios.get(endpoint);
//         setResults([response.data]);
//       } else {
//         // Search by sender name
//         endpoint = `http://localhost:9077/api/gatepass/requests/search?senderName=${encodeURIComponent(searchTerm)}`;
//         const response = await axios.get(endpoint);
        
//         if (response.data && response.data.length > 0) {
//           // Fetch details for each request
//           const detailedResults = await Promise.all(
//             response.data.map(async (refNo) => {
//               try {
//                 const detailResponse = await axios.get(
//                   `http://localhost:9077/api/gatepass/request/${refNo}?includeFullApprovalHistory=true`
//                 );
//                 return detailResponse.data;
//               } catch (err) {
//                 console.error(`Error fetching details for request ${refNo}:`, err);
//                 return { refNo, error: true };
//               }
//             })
//           );
          
//           setResults(detailedResults.filter(r => !r.error));
//         } else {
//           setResults([]);
//         }
//       }
//     } catch (err) {
//       console.error('Error searching for requests:', err);
//       setError('Failed to find results. Please check the search term and try again.');
//       setResults([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = async (request) => {
//     try {
//       setLoading(true);
      
//       // Fetch complete details including verification and receipt data
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
        
//         // Receiver information with various fallbacks
//         receiverStatus: verificationResponse.data?.receiverStatus || receiptResponse.data?.receiverStatus || requestResponse.data.receiverStatus || 'PENDING',
//         receiverComments: verificationResponse.data?.receiverComments || receiptResponse.data?.receiverComments || requestResponse.data.receiverComments,
//         receiverVerificationDate: verificationResponse.data?.receiverVerificationDate || receiptResponse.data?.receiverVerificationDate || requestResponse.data.receiverVerificationDate,
//         receiverServiceNumber: verificationResponse.data?.receiverServiceNumber || receiptResponse.data?.receiverServiceNumber || requestResponse.data.receiverServiceNumber,
//         receiverName: verificationResponse.data?.receiverName || receiptResponse.data?.receiverName || requestResponse.data.receiverName
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
//     if (!role) return null;
    
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

//   const buildApprovalHistory = (request) => {
//     if (!request) return [];
    
//     const history = [];
    
//     // Add executive officer approval if available
//     if (request.executiveOfficer && request.executiveStatus && request.executiveStatus !== 'PENDING') {
//       history.push({
//         approvedByName: request.executiveOfficer.name,
//         approvedBy: request.executiveOfficer.serviceNumber,
//         approverRole: 'EXECUTIVE_OFFICER',
//         approvalStatus: request.executiveStatus,
//         approvalDate: request.executiveDate,
//         comments: request.executiveComments || ''
//       });
//     }
    
//     // Add duty officer approval if available
//     if (request.dutyOfficer && request.dutyStatus && request.dutyStatus !== 'PENDING') {
//       history.push({
//         approvedByName: request.dutyOfficer.name,
//         approvedBy: request.dutyOfficer.serviceNumber,
//         approverRole: 'DUTY_OFFICER',
//         approvalStatus: request.dutyStatus,
//         approvalDate: request.dutyDate,
//         comments: request.dutyComments || ''
//       });
//     }
    
//     // Add security officer approval if available
//     if (request.securityOfficer && request.securityStatus && request.securityStatus !== 'PENDING') {
//       history.push({
//         approvedByName: request.securityOfficer.name,
//         approvedBy: request.securityOfficer.serviceNumber,
//         approverRole: 'SECURITY_OFFICER',
//         approvalStatus: request.securityStatus,
//         approvalDate: request.securityDate,
//         comments: request.securityComments || ''
//       });
//     }
    
//     // Add receiver verification if available - without a special role designation
//     if (request.receiverName && request.receiverStatus === 'RECEIVED') {
//       history.push({
//         approvedByName: request.receiverName,
//         approvedBy: request.receiverServiceNumber,
//         approverRole: '', // No role for receiver
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

//   const buildItemJourney = (request) => {
//     if (!request) return [];
    
//     const journey = [];
//     const approvalHistory = buildApprovalHistory(request);
    
//     // Add request creation as first step
//     journey.push({
//       timestamp: request.createdDate,
//       title: 'Request Created',
//       description: `Gate pass request created by ${request.senderName || request.senderServiceNumber}`,
//       location: request.outLocation || 'N/A',
//       icon: '📝',
//       status: 'CREATED'
//     });
    
//     // Add approval steps from history
//     approvalHistory.forEach(approval => {
//       let title = '';
//       let icon = '✅';
//       let location = '';
      
//       if (approval.approverRole === 'EXECUTIVE_OFFICER') {
//         title = 'Executive Officer Review';
//         location = request.outLocation || 'N/A';
//       } else if (approval.approverRole === 'DUTY_OFFICER') {
//         title = 'Duty Officer Review';
//         location = request.outLocation || 'N/A';
//       } else if (approval.approverRole === 'SECURITY_OFFICER') {
//         if (approval.approvalStatus === 'DISPATCHED') {
//           title = 'Item Dispatched by Security';
//           icon = '🚚';
//         } else {
//           title = 'Security Officer Review';
//         }
//         location = request.outLocation || 'N/A';
//       } else if (approval.approvalStatus === 'RECEIVED') {
//         title = 'Item Received';
//         icon = '📦';
//         location = request.inLocation || 'N/A';
//       }
      
//       if (approval.approvalStatus === 'REJECTED') {
//         icon = '❌';
//       }
      
//       journey.push({
//         timestamp: approval.approvalDate,
//         title: title,
//         description: `${approval.approvalStatus} by ${approval.approvedByName || approval.approvedBy}`,
//         comments: approval.comments,
//         location: location,
//         icon: icon,
//         status: approval.approvalStatus
//       });
//     });
    
//     // Sort by timestamp
//     return journey.sort((a, b) => {
//       return new Date(a.timestamp) - new Date(b.timestamp);
//     });
//   };

//   const generateTimelineClasses = (status) => {
//     if (!status) return 'border-gray-300';
    
//     switch(status.toUpperCase()) {
//       case 'APPROVED':
//       case 'VERIFIED':
//       case 'CREATED':
//         return 'border-green-500';
//       case 'REJECTED':
//         return 'border-red-500';
//       case 'PENDING':
//         return 'border-yellow-500';
//       case 'DISPATCHED':
//         return 'border-blue-500';
//       case 'RECEIVED':
//         return 'border-teal-500';
//       default:
//         return 'border-gray-300';
//     }
//   };
  
//   const generateIconClasses = (status) => {
//     if (!status) return 'bg-gray-200';
    
//     switch(status.toUpperCase()) {
//       case 'APPROVED':
//       case 'VERIFIED':
//       case 'CREATED':
//         return 'bg-green-100 border-green-500 text-green-500';
//       case 'REJECTED':
//         return 'bg-red-100 border-red-500 text-red-500';
//       case 'PENDING':
//         return 'bg-yellow-100 border-yellow-500 text-yellow-500';
//       case 'DISPATCHED':
//         return 'bg-blue-100 border-blue-500 text-blue-500';
//       case 'RECEIVED':
//         return 'bg-teal-100 border-teal-500 text-teal-500';
//       default:
//         return 'bg-gray-100 border-gray-400 text-gray-500';
//     }
//   };

//   if (loading && !selectedRequest && results.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Item Tracker</h1>
      
//       <div className="bg-white rounded-lg shadow p-6 mb-6">
//         <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
//           <div className="flex-1">
//             <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">Search By</label>
//             <select
//               id="searchType"
//               value={searchType}
//               onChange={(e) => setSearchType(e.target.value)}
//               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             >
//               <option value="refNo">Reference Number</option>
//               <option value="senderName">Sender Name</option>
//             </select>
//           </div>
          
//           <div className="flex-grow md:flex-grow-[3]">
//             <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
//               {searchType === 'refNo' ? 'Enter Reference Number' : 'Enter Sender Name'}
//             </label>
//             <input
//               type="text"
//               id="searchTerm"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder={searchType === 'refNo' ? 'e.g. GP12345' : 'e.g. John Smith'}
//               className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>
          
//           <div className="self-end">
//             <button
//               type="submit"
//               className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
//               disabled={loading}
//             >
//               {loading ? 'Searching...' : 'Track'}
//             </button>
//           </div>
//         </form>
        
//         {error && (
//           <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
//             {error}
//           </div>
//         )}
//       </div>
      
//       {results.length > 0 && (
//         <div className="bg-white rounded-lg shadow overflow-hidden">
//           <h2 className="text-xl font-semibold p-4 border-b">Search Results</h2>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference ID</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receiver</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                   <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {results.map((request) => (
//                   <tr key={request.refNo}>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                       {request.refNo}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {formatDate(request.createdDate)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {request.senderName || request.senderServiceNumber || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {request.receiverName || request.receiverServiceNumber || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {request.outLocation || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                       {request.inLocation || 'N/A'}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap">
//                       {getStatusBadge(request.status)}
//                     </td>
//                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                       <button
//                         onClick={() => handleViewDetails(request)}
//                         className="text-blue-600 hover:text-blue-900"
//                       >
//                         Track Journey
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
//                 <h2 className="text-xl font-bold">Item Journey - {selectedRequest.refNo}</h2>
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
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Created Date:</h3>
//                   <p>{formatDate(selectedRequest.createdDate)}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Sender:</h3>
//                   <p>{selectedRequest.senderName || selectedRequest.senderServiceNumber || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">Receiver:</h3>
//                   <p>{selectedRequest.receiverName || selectedRequest.receiverServiceNumber || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">From Location:</h3>
//                   <p>{selectedRequest.outLocation || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <h3 className="font-semibold">To Location:</h3>
//                   <p>{selectedRequest.inLocation || 'N/A'}</p>
//                 </div>
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
//                               <p>{item.dueDate ? formatDate(item.dueDate) : 'N/A'}</p>
//                             </div>
//                           )}
//                         </div>
//                         {item.description && (
//                           <div className="mt-2">
//                             <h4 className="font-medium">Description:</h4>
//                             <p className="text-sm text-gray-700">{item.description}</p>
//                           </div>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No items found</p>
//                 )}
//               </div>
              
//               <ApprovalWorkflowSection request={selectedRequest} formatDate={formatDate} />
              
//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-3">Item Journey:</h3>
//                 <div className="space-y-0 relative">
//                   {buildItemJourney(selectedRequest).map((step, index, array) => (
//                     <div key={index} className="flex">
//                       <div className="flex flex-col items-center mr-4">
//                         <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${generateIconClasses(step.status)}`}>
//                           <span className="text-lg">{step.icon}</span>
//                         </div>
//                         {index < array.length - 1 && (
//                           <div className={`h-full w-0 border-l-2 my-1 ${generateTimelineClasses(step.status)}`}></div>
//                         )}
//                       </div>
//                       <div className="pb-6">
//                         <div className="flex items-center">
//                           <h4 className="font-medium">{step.title}</h4>
//                           {getStatusBadge(step.status)}
//                         </div>
//                         <p className="text-sm text-gray-600">{formatDate(step.timestamp)}</p>
//                         <p className="text-sm mt-1">{step.description}</p>
//                         {step.comments && <p className="text-sm italic mt-1">"{step.comments}"</p>}
//                         {step.location && <p className="text-xs mt-1">Location: {step.location}</p>}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
              
//               {selectedRequest.approvalHistory && selectedRequest.approvalHistory.length > 0 && (
//                 <div className="mb-6">
//                   <h3 className="font-semibold text-lg mb-3">Approval History:</h3>
//                   <div className="border rounded-lg overflow-hidden">
//                     <table className="min-w-full divide-y divide-gray-200">
//                       <thead className="bg-gray-50">
//                         <tr>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
//                         </tr>
//                       </thead>
//                       <tbody className="bg-white divide-y divide-gray-200">
//                         {selectedRequest.approvalHistory.map((approval, index) => (
//                           <tr key={index}>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                               {formatDate(approval.approvalDate)}
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
//                               <div className="flex items-center">
//                                 <span>{approval.approvedByName || approval.approvedBy}</span>
//                                 {getRoleBadge(approval.approverRole)}
//                               </div>
//                             </td>
//                             <td className="px-6 py-4 whitespace-nowrap">
//                               {getStatusBadge(approval.approvalStatus)}
//                             </td>
//                             <td className="px-6 py-4 text-sm text-gray-500">
//                               {approval.comments || '-'}
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               )}
              
//               <div className="flex justify-end">
//                 <button
//                   onClick={() => setSelectedRequest(null)}
//                   className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )} 
//     </div>
//   );
// };

// export default ItemTracker;


"use client"

import { useState } from "react"
import axios from "axios"

const ItemTracker = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("refNo")
  const [results, setResults] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchTerm.trim()) {
      setError("Please enter a search term")
      return
    }

    try {
      setLoading(true)
      setError("")
      let endpoint

      if (searchType === "refNo") {
        endpoint = `http://localhost:9077/api/gatepass/request/${searchTerm}?includeFullApprovalHistory=true`
        const response = await axios.get(endpoint)
        setResults([response.data])
      } else {
        endpoint = `http://localhost:9077/api/gatepass/requests/search?senderName=${encodeURIComponent(searchTerm)}`
        const response = await axios.get(endpoint)
        if (response.data && response.data.length > 0) {
          const detailedResults = await Promise.all(
            response.data.map(async (refNo) => {
              try {
                const detailResponse = await axios.get(
                  `http://localhost:9077/api/gatepass/request/${refNo}?includeFullApprovalHistory=true`,
                )
                return detailResponse.data
              } catch (err) {
                console.error(`Error fetching details for request ${refNo}:`, err)
                return { refNo, error: true }
              }
            }),
          )
          setResults(detailedResults.filter((r) => !r.error))
        } else {
          setResults([])
        }
      }
    } catch (err) {
      console.error("Error searching for requests:", err)
      setError("Failed to find results. Please check the search term and try again.")
      setResults([])
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

  if (loading && !selectedRequest && results.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Item Tracker</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="searchType" className="block text-sm font-medium text-gray-700 mb-1">
              Search By
            </label>
            <select
              id="searchType"
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="refNo">Reference Number</option>
              <option value="senderName">Sender Name</option>
            </select>
          </div>
          <div className="flex-grow md:flex-grow-[3]">
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              {searchType === "refNo" ? "Enter Reference Number" : "Enter Sender Name"}
            </label>
            <input
              type="text"
              id="searchTerm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchType === "refNo" ? "e.g. GP12345" : "e.g. John Smith"}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
              disabled={loading}
            >
              {loading ? "Searching..." : "Track"}
            </button>
          </div>
        </form>

        {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">{error}</div>}
      </div>

      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h2 className="text-xl font-semibold p-4 border-b">Search Results</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receiver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    From
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((request) => (
                  <tr key={request.refNo}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.refNo}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.createdDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.senderName || request.senderServiceNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.receiverName || request.receiverServiceNumber || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {request.outLocation || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.inLocation || "N/A"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(request.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => handleViewDetails(request)} className="text-blue-600 hover:text-blue-900">
                        Track Journey
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
                <h2 className="text-xl font-bold">Item Journey - {selectedRequest.refNo}</h2>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <h3 className="font-semibold">Status:</h3>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div>
                  <h3 className="font-semibold">Created Date:</h3>
                  <p>{formatDate(selectedRequest.createdDate)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Sender:</h3>
                  <p>{selectedRequest.senderName || selectedRequest.senderServiceNumber || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Receiver:</h3>
                  <p>{selectedRequest.receiverName || selectedRequest.receiverServiceNumber || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">From Location:</h3>
                  <p>{selectedRequest.outLocation || "N/A"}</p>
                </div>
                <div>
                  <h3 className="font-semibold">To Location:</h3>
                  <p>{selectedRequest.inLocation || "N/A"}</p>
                </div>
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
                              <p>{item.dueDate ? formatDate(item.dueDate) : "N/A"}</p>
                            </div>
                          )}
                        </div>
                        {item.description && (
                          <div className="mt-2">
                            <h4 className="font-medium">Description:</h4>
                            <p className="text-sm text-gray-700">{item.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No items found</p>
                )}
              </div>

              <ApprovalWorkflowSection request={selectedRequest} formatDate={formatDate} />

              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemTracker
