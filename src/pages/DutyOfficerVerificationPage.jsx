// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useAuth } from "../context/AuthContext";
// import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
// import "react-tabs/style/react-tabs.css";
// import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// const DutyOfficerVerificationPage = () => {
//   const { user } = useAuth();
//   const [pendingRequests, setPendingRequests] = useState([]);
//   const [processedRequests, setProcessedRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [comment, setComment] = useState("");
//   const [actionLoading, setActionLoading] = useState(false);
//   const [actionMessage, setActionMessage] = useState({
//     text: "",
//     isError: false,
//   });
//   const [tabIndex, setTabIndex] = useState(0);

//   useEffect(() => {
//     if (user && user.serviceNumber) {
//       fetchAllRequests();
//     }
//   }, [user]);

//   const fetchAllRequests = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       // Fetch pending requests for verification
//       const pendingResponse = await axios.get(
//         "http://localhost:9077/api/verifications/pending"
//       );
//       setPendingRequests(pendingResponse.data);

//       // Fetch processed verifications by duty officer
//       const processedResponse = await axios.get(
//         `http://localhost:9077/api/verifications/duty-officer/${user.serviceNumber}`
//       );

//       // Enhance processed requests with full details
//       const enhancedProcessedRequests = await Promise.all(
//         processedResponse.data.map(async (verification) => {
//           try {
//             // Fetch the complete request details to get sender/receiver info
//             const requestId = verification.requestId;
//             const detailResponse = await axios.get(
//               `http://localhost:9077/api/gatepass/request/${requestId}`
//             );
//             // Merge the verification data with the complete request data
//             return {
//               ...verification,
//               ...detailResponse.data,
//               // Keep original verification data
//               comments: verification.comments,
//               verificationStatus: verification.verificationStatus,
//               verificationDate: verification.verificationDate,
//             };
//           } catch (err) {
//             console.error(
//               `Error fetching details for request ${verification.requestId}:`,
//               err
//             );
//             return verification; // Return original if fetch fails
//           }
//         })
//       );

//       setProcessedRequests(enhancedProcessedRequests);
//     } catch (err) {
//       console.error("Error fetching requests:", err);
//       setError("Failed to fetch requests. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleViewDetails = async (request) => {
//     try {
//       setLoading(true);
//       setActionMessage({ text: "", isError: false });
  
//       const requestId = request.refNo || request.requestId;
//       console.log("Fetching details for request ID:", requestId);
  
//       // Always fetch the basic request details
//       const response = await axios.get(
//         `http://localhost:9077/api/gatepass/request/${requestId}`
//       );
  
//       // Make sure we have sender and receiver information
//       let requestData = {
//         ...response.data,
//         // Preserve any existing comments
//         comments: request.comments || response.data.comments,
//         // Ensure sender and receiver info is available
//         senderName: response.data.sender?.name || response.data.senderName || response.data.senderServiceNumber,
//         receiverName: response.data.receiver?.name || response.data.receiverName || response.data.receiverServiceNumber
//       };
  
//       // For pending tab, we don't need verification history
//       if (tabIndex === 0) {
//         setSelectedRequest(requestData);
//         setComment("");
//         return;
//       }
  
//       // For verified/rejected tabs, fetch verification details
//       try {
//         const verificationResponse = await axios.get(
//           `http://localhost:9077/api/verifications/request/${requestId}`
//         );
  
//         // Merge the verification data with the request data
//         setSelectedRequest({
//           ...requestData,
//           verificationDetails: verificationResponse.data,
//         });
//       } catch (verificationError) {
//         console.error("Error fetching verification details:", verificationError);
//         // If no verification data, just use the request data
//         setSelectedRequest(requestData);
//       }
  
//       setComment("");
//     } catch (err) {
//       console.error("Error fetching request details:", err);
//       setActionMessage({
//         text: "Failed to load request details. Please try again.",
//         isError: true,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
  

//   const handleVerifyReject = async (status) => {
//     if (!selectedRequest || !selectedRequest.refNo || !comment.trim()) {
//       setActionMessage({
//         text: "Please enter a comment before submitting",
//         isError: true,
//       });
//       return;
//     }

//     try {
//       setActionLoading(true);
//       setActionMessage({ text: "", isError: false });

//       const verificationData = {
//         requestId: selectedRequest.refNo,
//         verifiedBy: user.serviceNumber,
//         verificationStatus: status,
//         comments: comment,
//       };

//       console.log("Submitting verification:", verificationData);

//       const response = await axios.post(
//         "http://localhost:9077/api/verifications",
//         verificationData
//       );

//       console.log("Verification response:", response.data);

//       setActionMessage({
//         text: `Request ${
//           status === "VERIFIED" ? "verified" : "rejected"
//         } successfully!`,
//         isError: false,
//       });

//       // Refresh data and switch tab after short delay
//       setTimeout(() => {
//         setSelectedRequest(null);
//         fetchAllRequests();
//         // Switch to appropriate tab based on action - tab index 1 for VERIFIED, 2 for REJECTED
//         setTabIndex(status === "VERIFIED" ? 1 : 2);
//       }, 1500);
//     } catch (err) {
//       console.error("Error processing verification:", err);
//       setActionMessage({
//         text:
//           err.response?.data ||
//           "Failed to process verification. Please try again.",
//         isError: true,
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     try {
//       const date = new Date(dateString);
//       return isNaN(date.getTime()) ? "N/A" : date.toLocaleString();
//     } catch (e) {
//       return "N/A";
//     }
//   };

//   const generateSummaryPDF = async (request) => {
//     try {
//       setActionLoading(true);
  
//       // If the request details are incomplete, fetch complete details first
//       if (!request.items || !request.verificationDetails) {
//         try {
//           const requestId = request.refNo || request.requestId;
//           // Fetch complete request details
//           const requestResponse = await axios.get(
//             `http://localhost:9077/api/gatepass/request/${requestId}`
//           );
          
//           // Try to fetch verification details
//           try {
//             const verificationResponse = await axios.get(
//               `http://localhost:9077/api/verifications/request/${requestId}`
//             );
            
//             // Merge all data
//             request = {
//               ...request,
//               ...requestResponse.data,
//               verificationDetails: verificationResponse.data
//             };
//           } catch (verificationError) {
//             console.error("Error fetching verification details:", verificationError);
//             request = {
//               ...request,
//               ...requestResponse.data
//             };
//           }
//         } catch (fetchErr) {
//           console.error("Error fetching complete request details:", fetchErr);
//         }
//       }
  
//       // Create a new PDF document
//       const pdfDoc = await PDFDocument.create();
//       const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
//       const { width, height } = page.getSize();
  
//       // Fonts
//       const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//       const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
//       // Add title
//       page.drawText(`Request Details: ${request.refNo || request.requestId}`, {
//         x: 50,
//         y: height - 50,
//         size: 16,
//         font: titleFont,
//         color: rgb(0, 0, 0),
//       });
  
//       let yPosition = height - 80;
  
//       // Basic Information Section
//       page.drawText("Basic Information", {
//         x: 50,
//         y: yPosition,
//         size: 14,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });
//       yPosition -= 25;
  
//       // Status
//       page.drawText("Status:", {
//         x: 50,
//         y: yPosition,
//         size: 12,
//         font: boldFont,
//       });
      
//       const status = request.status || request.verificationStatus || "PENDING";
//       page.drawText(status, {
//         x: 120,
//         y: yPosition,
//         size: 12,
//         font: regularFont,
//       });
//       yPosition -= 20;
  
//       // Created Date
//       page.drawText("Created:", {
//         x: 50,
//         y: yPosition,
//         size: 12,
//         font: boldFont,
//       });
//       page.drawText(formatDate(request.createdDate), {
//         x: 120,
//         y: yPosition,
//         size: 12,
//         font: regularFont,
//       });
//       yPosition -= 20;
  
//       // Sender
//       page.drawText("Sender:", {
//         x: 50,
//         y: yPosition,
//         size: 12,
//         font: boldFont,
//       });
//       page.drawText(
//         request.sender?.name || request.senderName || request.senderServiceNumber || "N/A",
//         {
//           x: 120,
//           y: yPosition,
//           size: 12,
//           font: regularFont,
//         }
//       );
//       yPosition -= 20;
  
//       // Receiver
//       page.drawText("Receiver:", {
//         x: 50,
//         y: yPosition, 
//         size: 12,
//         font: boldFont,
//       });
//       page.drawText(
//         request.receiver?.name || request.receiverName || request.receiverServiceNumber || "N/A",
//         {
//           x: 120,
//           y: yPosition,
//           size: 12,
//           font: regularFont,
//         }
//       );
//       yPosition -= 20;
  
//       // Out Location
//       page.drawText("Out Location:", {
//         x: 50,
//         y: yPosition,
//         size: 12,
//         font: boldFont,
//       });
//       page.drawText(request.outLocation || "N/A", {
//         x: 120,
//         y: yPosition, 
//         size: 12,
//         font: regularFont,
//       });
//       yPosition -= 20;
  
//       // In Location
//       page.drawText("In Location:", {
//         x: 50,
//         y: yPosition,
//         size: 12,
//         font: boldFont,
//       });
//       page.drawText(request.inLocation || "N/A", {
//         x: 120,
//         y: yPosition,
//         size: 12,
//         font: regularFont,
//       });
//       yPosition -= 40;
  
//       // Items Section
//       page.drawText("Items", {
//         x: 50,
//         y: yPosition,
//         size: 14,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });
//       yPosition -= 25;
  
//       if (request.items && request.items.length > 0) {
//         for (let i = 0; i < request.items.length; i++) {
//           const item = request.items[i];
          
//           // Item header
//           page.drawText(`${i + 1}. ${item.itemName}`, {
//             x: 50,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           yPosition -= 20;
          
//           // Item details
//           page.drawText(`Quantity: ${item.quantity}`, {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText(`Category: ${item.categoryName}`, {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           if (item.serialNumber) {
//             page.drawText(`Serial Number: ${item.serialNumber}`, {
//               x: 70,
//               y: yPosition,
//               size: 12,
//               font: regularFont,
//             });
//             yPosition -= 18;
//           }
          
//           page.drawText(`Returnable: ${item.returnable ? "Yes" : "No"}`, {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           if (item.returnable && item.dueDate) {
//             page.drawText(`Due Date: ${formatDate(item.dueDate)}`, {
//               x: 70,
//               y: yPosition,
//               size: 12,
//               font: regularFont,
//             });
//             yPosition -= 18;
//           }
          
//           yPosition -= 10; // Space between items
//         }
//       } else {
//         page.drawText("No items in this request", {
//           x: 70,
//           y: yPosition,
//           size: 12,
//           font: regularFont,
//         });
//         yPosition -= 20;
//       }
      
//       yPosition -= 20;
  
//       // Verification History Section (if available)
//       const verificationDetails = request.verificationDetails;
//       if (verificationDetails) {
//         page.drawText("Verification History", {
//           x: 50,
//           y: yPosition,
//           size: 14,
//           font: boldFont,
//           color: rgb(0, 0, 0),
//         });
//         yPosition -= 25;
        
//         // Executive Officer Approval
//         if (verificationDetails.executiveOfficer || verificationDetails.executiveStatus) {
//           page.drawText("Executive Officer Approval", {
//             x: 50,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           yPosition -= 20;
          
//           page.drawText("Officer:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(verificationDetails.executiveOfficer?.name || "N/A", {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText("Status:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(verificationDetails.executiveStatus || "N/A", {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText("Date:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(formatDate(verificationDetails.executiveDate), {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText("Comments:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(verificationDetails.executiveComments || "No comments", {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 25;
//         }
        
//         // Duty Officer Verification
//         if (verificationDetails.dutyOfficer || verificationDetails.dutyStatus) {
//           page.drawText("Duty Officer Verification", {
//             x: 50,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           yPosition -= 20;
          
//           page.drawText("Officer:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(verificationDetails.dutyOfficer?.name || "N/A", {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText("Status:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(verificationDetails.dutyStatus || "N/A", {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText("Date:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(formatDate(verificationDetails.dutyDate), {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//           yPosition -= 18;
          
//           page.drawText("Comments:", {
//             x: 70,
//             y: yPosition,
//             size: 12,
//             font: boldFont,
//           });
//           page.drawText(verificationDetails.dutyComments || "No comments", {
//             x: 170,
//             y: yPosition,
//             size: 12,
//             font: regularFont,
//           });
//         }
//       }
  
//       // Save and download the PDF
//       const pdfBytes = await pdfDoc.save();
  
//       // Create a download link
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `gate-pass-summary-${request.refNo || request.requestId}.pdf`;
//       link.click();
  
//       // Clean up
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Error generating PDF:", err);
//       setActionMessage({
//         text: "Failed to generate PDF. Please try again.",
//         isError: true,
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   const generateVerificationChecklistPDF = async (request) => {
//     try {
//       setActionLoading(true);

//       // Fetch complete details if items are missing
//       if (!request.items || request.items.length === 0) {
//         try {
//           const requestId = request.refNo || request.requestId;
//           const response = await axios.get(
//             `http://localhost:9077/api/gatepass/request/${requestId}`
//           );
//           request = { ...request, ...response.data };
//         } catch (fetchErr) {
//           console.error("Error fetching complete request details:", fetchErr);
//         }
//       }

//       // Create PDF document
//       const pdfDoc = await PDFDocument.create();
//       let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
//       const { width, height } = page.getSize();
//       const margin = 40;
//       const tableWidth = width - 2 * margin;

//       // Fonts
//       const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//       const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//       const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

//       // Header
//       page.drawText("Gate Pass Verification Checklist", {
//         x: margin,
//         y: height - 40,
//         size: 18,
//         font: titleFont,
//         color: rgb(0, 0, 0),
//       });

//       // Document border
//       page.drawRectangle({
//         x: margin - 5,
//         y: 30,
//         width: tableWidth + 10,
//         height: height - 60,
//         borderWidth: 1,
//         borderColor: rgb(0.2, 0.2, 0.2),
//       });

//       // Request Details
//       let yPosition = height - 80;
//       const details = [
//         `Request ID: ${request.refNo || request.requestId}`,
//         `Date: ${formatDate(request.createdDate)}`,
//         `Sender: ${request.sender?.name || request.senderName || request.senderServiceNumber || "N/A"}`,
//         `Receiver: ${request.receiver?.name || request.receiverName || request.receiverServiceNumber || "N/A"}`,
//       ];

//       details.forEach((text) => {
//         page.drawText(text, {
//           x: margin,
//           y: yPosition,
//           size: 11,
//           font: regularFont,
//           color: rgb(0, 0, 0),
//         });
//         yPosition -= 20;
//       });

//       // Table Header
//       yPosition -= 10;
//       const tableTop = yPosition;
//       const columnWidths = {
//         number: 40,
//         name: 140,
//         details: 180,
//         image: 100,
//         verified: 60,
//       };

//       const headers = [
//         { text: "No.", x: margin, width: columnWidths.number },
//         { text: "Item Name", x: margin + columnWidths.number, width: columnWidths.name },
//         { text: "Details", x: margin + columnWidths.number + columnWidths.name, width: columnWidths.details },
//         { text: "Image", x: margin + columnWidths.number + columnWidths.name + columnWidths.details, width: columnWidths.image },
//         { text: "Verified", x: margin + columnWidths.number + columnWidths.name + columnWidths.details + columnWidths.image, width: columnWidths.verified },
//       ];

//       // Draw header background
//       page.drawRectangle({
//         x: margin,
//         y: tableTop - 20,
//         width: tableWidth,
//         height: 25,
//         color: rgb(0.95, 0.95, 0.95),
//       });

//       // Draw header texts and borders
//       headers.forEach((header) => {
//         page.drawText(header.text, {
//           x: header.x + 5,
//           y: tableTop - 15,
//           size: 11,
//           font: boldFont,
//           color: rgb(0, 0, 0),
//         });
//         page.drawRectangle({
//           x: header.x,
//           y: tableTop - 20,
//           width: header.width,
//           height: 25,
//           borderWidth: 1,
//           borderColor: rgb(0.7, 0.7, 0.7),
//         });
//       });

//       yPosition -= 40;

//       // Items Table
//       if (request.items && request.items.length > 0) {
//         for (let index = 0; index < request.items.length; index++) {
//           const item = request.items[index];
//           const imageCount = item.imageUrls ? item.imageUrls.length : 0;
//           const imgHeight = 60; // Height of each image
//           const imgSpacing = 5; // Spacing between images
//           const baseItemHeight = 80; // Base height for item without images
//           const imagesTotalHeight = imageCount > 0 ? (imageCount * (imgHeight + imgSpacing)) - imgSpacing : 0;
//           const itemHeight = Math.max(baseItemHeight, imagesTotalHeight + 20); // Ensure enough height for images or base content

//           // Check if new page is needed
//           if (yPosition - itemHeight < 100) {
//             page = pdfDoc.addPage([595.28, 841.89]);
//             yPosition = height - 40;

//             // Redraw headers on new page
//             page.drawText("Gate Pass Verification Checklist (continued)", {
//               x: margin,
//               y: height - 40,
//               size: 18,
//               font: titleFont,
//               color: rgb(0, 0, 0),
//             });

//             page.drawRectangle({
//               x: margin - 5,
//               y: 30,
//               width: tableWidth + 10,
//               height: height - 60,
//               borderWidth: 1,
//               borderColor: rgb(0.2, 0.2, 0.2),
//             });

//             yPosition -= 40;
//             page.drawRectangle({
//               x: margin,
//               y: yPosition - 20,
//               width: tableWidth,
//               height: 25,
//               color: rgb(0.95, 0.95, 0.95),
//             });

//             headers.forEach((header) => {
//               page.drawText(header.text, {
//                 x: header.x + 5,
//                 y: yPosition - 15,
//                 size: 11,
//                 font: boldFont,
//                 color: rgb(0, 0, 0),
//               });
//               page.drawRectangle({
//                 x: header.x,
//                 y: yPosition - 20,
//                 width: header.width,
//                 height: 25,
//                 borderWidth: 1,
//                 borderColor: rgb(0.7, 0.7, 0.7),
//               });
//             });
//             yPosition -= 40;
//           }

//           // Draw row border
//           page.drawRectangle({
//             x: margin,
//             y: yPosition - itemHeight,
//             width: tableWidth,
//             height: itemHeight,
//             borderWidth: 1,
//             borderColor: rgb(0.7, 0.7, 0.7),
//           });

//           // Item Number
//           page.drawText(`${index + 1}`, {
//             x: margin + 5,
//             y: yPosition - 20,
//             size: 11,
//             font: regularFont,
//             color: rgb(0, 0, 0),
//           });

//           // Item Name
//           page.drawText(item.itemName, {
//             x: margin + columnWidths.number + 5,
//             y: yPosition - 20,
//             size: 11,
//             font: regularFont,
//             color: rgb(0, 0, 0),
//             maxWidth: columnWidths.name - 10,
//             lineHeight: 14,
//           });

//           // Item Details
//           let detailsText = [
//             `Qty: ${item.quantity}`,
//             `Cat: ${item.categoryName}`,
//             item.serialNumber ? `SN: ${item.serialNumber}` : "",
//             `${item.returnable ? "Returnable" : "Non-returnable"}`,
//           ].filter(Boolean).join("\n");

//           page.drawText(detailsText, {
//             x: margin + columnWidths.number + columnWidths.name + 5,
//             y: yPosition - 20,
//             size: 10,
//             font: regularFont,
//             color: rgb(0, 0, 0),
//             lineHeight: 14,
//           });

//           // Image Column
//           if (item.imageUrls && item.imageUrls.length > 0) {
//             let imgYPosition = yPosition - imgHeight - 10;
//             for (let imgIndex = 0; imgIndex < item.imageUrls.length; imgIndex++) {
//               try {
//                 const imageUrl = `http://localhost:9077/api/gatepass/items/images/${item.imageUrls[imgIndex]}`;
//                 const imageResponse = await fetch(imageUrl);

//                 if (imageResponse.ok) {
//                   const imageArrayBuffer = await imageResponse.arrayBuffer();
//                   let pdfImage;

//                   if (
//                     imageUrl.toLowerCase().endsWith(".jpg") ||
//                     imageUrl.toLowerCase().endsWith(".jpeg")
//                   ) {
//                     pdfImage = await pdfDoc.embedJpg(imageArrayBuffer);
//                   } else if (imageUrl.toLowerCase().endsWith(".png")) {
//                     pdfImage = await pdfDoc.embedPng(imageArrayBuffer);
//                   } else {
//                     try {
//                       pdfImage = await pdfDoc.embedPng(imageArrayBuffer);
//                     } catch {
//                       pdfImage = await pdfDoc.embedJpg(imageArrayBuffer);
//                     }
//                   }

//                   const imgWidth = 60;
//                   page.drawImage(pdfImage, {
//                     x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 5,
//                     y: imgYPosition,
//                     width: imgWidth,
//                     height: imgHeight,
//                   });
//                 }
//               } catch (imgError) {
//                 console.error("Error embedding image:", imgError);
//                 page.drawRectangle({
//                   x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 5,
//                   y: imgYPosition,
//                   width: 60,
//                   height: imgHeight,
//                   borderWidth: 1,
//                   borderColor: rgb(0.8, 0.8, 0.8),
//                 });
//                 page.drawText("No Image", {
//                   x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 15,
//                   y: imgYPosition + imgHeight / 2,
//                   size: 10,
//                   font: regularFont,
//                   color: rgb(0.5, 0.5, 0.5),
//                 });
//               }
//               imgYPosition -= (imgHeight + imgSpacing); // Move down for the next image
//             }
//           } else {
//             page.drawText("No Image", {
//               x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 15,
//               y: yPosition - 45,
//               size: 10,
//               font: regularFont,
//               color: rgb(0.5, 0.5, 0.5),
//             });
//           }

//           // Verified Checkbox
//           page.drawRectangle({
//             x: margin + columnWidths.number + columnWidths.name + columnWidths.details + columnWidths.image + 20,
//             y: yPosition - 25,
//             width: 15,
//             height: 15,
//             borderWidth: 1,
//             borderColor: rgb(0, 0, 0),
//           });

//           yPosition -= itemHeight + 10;
//         }
//       } else {
//         page.drawText("No items in this request", {
//           x: margin + 5,
//           y: yPosition - 20,
//           size: 11,
//           font: regularFont,
//           color: rgb(0.5, 0.5, 0.5),
//         });
//         yPosition -= 40;
//       }

//       // Signature Section
//       yPosition = Math.min(yPosition - 20, 120);
//       page.drawRectangle({
//         x: margin,
//         y: yPosition - 60,
//         width: tableWidth,
//         height: 80,
//         borderWidth: 1,
//         borderColor: rgb(0.7, 0.7, 0.7),
//       });

//       page.drawText("Duty Officer Signature:", {
//         x: margin + 5,
//         y: yPosition - 20,
//         size: 11,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       page.drawLine({
//         start: { x: margin + 120, y: yPosition - 20 },
//         end: { x: margin + 300, y: yPosition - 20 },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//       });

//       page.drawText("Date:", {
//         x: margin + 320,
//         y: yPosition - 20,
//         size: 11,
//         font: boldFont,
//         color: rgb(0, 0, 0),
//       });

//       page.drawLine({
//         start: { x: margin + 350, y: yPosition - 20 },
//         end: { x: margin + 500, y: yPosition - 20 },
//         thickness: 1,
//         color: rgb(0, 0, 0),
//       });

//       // Save and download
//       const pdfBytes = await pdfDoc.save();
//       const blob = new Blob([pdfBytes], { type: "application/pdf" });
//       const url = URL.createObjectURL(blob);
//       const link = document.createElement("a");
//       link.href = url;
//       link.download = `verification-checklist-${request.refNo || request.requestId}.pdf`;
//       link.click();
//       URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error("Error generating verification checklist PDF:", err);
//       setActionMessage({
//         text: "Failed to generate verification checklist. Please try again.",
//         isError: true,
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   };

  
//  // Helper function to extract name consistently
// const extractName = (request, type) => {
//     if (type === 'sender') {
//       return request.sender?.name || 
//              request.senderName || 
//              request.senderServiceNumber || 
//              "N/A";
//     } else {
//       return request.receiver?.name || 
//              request.receiverName || 
//              request.receiverServiceNumber || 
//              "N/A";
//     }
//   };
  
//   // Main renderRequestTable function
//   const renderRequestTable = (
//     requests,
//     showComments = false,
//     isPendingTab = false
//   ) => (
//     <div className="overflow-x-auto bg-white rounded-lg shadow">
//       <table className="min-w-full divide-y divide-gray-200">
//       <thead className="bg-gray-50">
//   <tr>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//       Request ID
//     </th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//       {showComments ? "Verification Date" : "Created Date"}
//     </th>
//     {!isPendingTab && (
//       <>
//         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//           Sender
//         </th>
//         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//           Receiver
//         </th>
//       </>
//     )}
//     {showComments && (
//       <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//         Comments
//       </th>
//     )}
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//       Status
//     </th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//       Details
//     </th>
//     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//       Documents
//     </th>
//   </tr>
// </thead>
// <tbody className="bg-white divide-y divide-gray-200">
//   {requests.map((request) => (
//     <tr key={request.requestId || request.refNo}>
//       <td className="px-6 py-4 whitespace-nowrap">
//         {request.requestId || request.refNo}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         {formatDate(request.createdDate || request.verificationDate)}
//       </td>
//       {!isPendingTab && (
//         <>
//           <td className="px-6 py-4 whitespace-nowrap">
//             {extractName(request, 'sender')}
//           </td>
//           <td className="px-6 py-4 whitespace-nowrap">
//             {extractName(request, 'receiver')}
//           </td>
//         </>
//       )}
//       {showComments && (
//         <td className="px-6 py-4">
//           <div className="text-sm text-gray-900 max-w-xs truncate">
//             {request.comments || "No comments"}
//           </div>
//         </td>
//       )}
//       {/* Rest of the row remains the same... */}
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <span
//                   className={`px-2 py-1 text-xs rounded-full ${
//                     request.status === "VERIFIED" ||
//                     request.verificationStatus === "VERIFIED"
//                       ? "bg-green-100 text-green-800"
//                       : request.status === "REJECTED" ||
//                         request.verificationStatus === "REJECTED"
//                       ? "bg-red-100 text-red-800"
//                       : "bg-yellow-100 text-yellow-800"
//                   }`}
//                 >
//                   {request.status || request.verificationStatus || "PENDING"}
//                 </span>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <button
//                   onClick={() => handleViewDetails(request)}
//                   className="text-blue-600 hover:text-blue-900 font-medium"
//                 >
//                   View Details
//                 </button>
//               </td>
//               <td className="px-6 py-4 whitespace-nowrap">
//                 <div className="flex space-x-2">
//                   {/* Only show Summary PDF for verified/rejected requests */}
//                   {!isPendingTab && (
//                     <button
//                       onClick={() => generateSummaryPDF(request)}
//                       className="text-indigo-600 hover:text-indigo-900 text-sm"
//                       disabled={actionLoading}
//                     >
//                       Summary PDF
//                     </button>
//                   )}
//                   {/* Only show Checklist PDF for pending requests */}
//                   {isPendingTab && (
//                     <button
//                       onClick={() => generateVerificationChecklistPDF(request)}
//                       className="text-green-600 hover:text-green-900 text-sm"
//                       disabled={actionLoading}
//                     >
//                       Checklist PDF
//                     </button>
//                   )}
//                 </div>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
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
//           onClick={fetchAllRequests}
//           className="ml-4 bg-blue-500 text-white px-4 py-2 rounded"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto p-4">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold">Gate Pass Verification</h1>
//         <div className="text-right">
//           <p className="font-medium">
//             {user?.fullName || user?.serviceNumber} (Duty Officer)
//           </p>
//         </div>
//       </div>

//       <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
//         <TabList>
//           <Tab>Pending ({pendingRequests.length})</Tab>
//           <Tab>
//             Verified (
//             {
//               processedRequests.filter(
//                 (r) =>
//                   r.verificationStatus === "VERIFIED" || r.status === "VERIFIED"
//               ).length
//             }
//             )
//           </Tab>
//           <Tab>
//             Rejected (
//             {
//               processedRequests.filter(
//                 (r) =>
//                   r.verificationStatus === "REJECTED" || r.status === "REJECTED"
//               ).length
//             }
//             )
//           </Tab>
//         </TabList>

        
// <TabPanel>
//   {pendingRequests.length === 0 ? (
//     <div className="text-center text-gray-500 p-8">
//       No pending requests
//     </div>
//   ) : (
//     renderRequestTable(pendingRequests, false, true) // isPendingTab = true
//   )}
// </TabPanel>

// <TabPanel>
//   {processedRequests.filter(
//     (r) =>
//       r.verificationStatus === "VERIFIED" || r.status === "VERIFIED"
//   ).length === 0 ? (
//     <div className="text-center text-gray-500 p-8">
//       No verified requests
//     </div>
//   ) : (
//     renderRequestTable(
//       processedRequests.filter(
//         (r) =>
//           r.verificationStatus === "VERIFIED" || r.status === "VERIFIED"
//       ),
//       true, // Show comments
//       false // Not pending tab
//     )
//   )}
// </TabPanel>

// <TabPanel>
//   {processedRequests.filter(
//     (r) =>
//       r.verificationStatus === "REJECTED" || r.status === "REJECTED"
//   ).length === 0 ? (
//     <div className="text-center text-gray-500 p-8">
//       No rejected requests
//     </div>
//   ) : (
//     renderRequestTable(
//       processedRequests.filter(
//         (r) =>
//           r.verificationStatus === "REJECTED" || r.status === "REJECTED"
//       ),
//       true, // Show comments
//       false // Not pending tab
//     )
//   )}
// </TabPanel>
//       </Tabs>

//       {/* Request Details Modal */}
//       {selectedRequest && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
//             <div className="p-6">
//               <div className="flex justify-between items-start">
//                 <h2 className="text-xl font-bold mb-4">
//                   Request Details:{" "}
//                   {selectedRequest.refNo || selectedRequest.requestId}
//                 </h2>
//                 <button
//                   onClick={() => setSelectedRequest(null)}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <svg
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               </div>

//               {actionMessage.text && (
//                 <div
//                   className={`mb-4 p-3 rounded ${
//                     actionMessage.isError
//                       ? "bg-red-100 text-red-700"
//                       : "bg-green-100 text-green-700"
//                   }`}
//                 >
//                   {actionMessage.text}
//                 </div>
//               )}

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <div>
//                   <h3 className="font-semibold text-lg mb-2">
//                     Basic Information
//                   </h3>
//                   <div className="space-y-2">
//                     <p>
//                       <span className="font-medium">Status:</span>
//                       <span
//                         className={`ml-2 px-2 py-1 text-xs rounded-full ${
//                           selectedRequest.status === "VERIFIED" ||
//                           selectedRequest.verificationStatus === "VERIFIED"
//                             ? "bg-green-100 text-green-800"
//                             : selectedRequest.status === "REJECTED" ||
//                               selectedRequest.verificationStatus === "REJECTED"
//                             ? "bg-red-100 text-red-800"
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}
//                       >
//                         {selectedRequest.status ||
//                           selectedRequest.verificationStatus ||
//                           "PENDING"}
//                       </span>
//                     </p>
//                     <p>
//                       <span className="font-medium">Created:</span>{" "}
//                       {formatDate(selectedRequest.createdDate)}
//                     </p>
//                     <p>
//                       <span className="font-medium">Sender:</span>{" "}
//                       {selectedRequest.senderName ||
//                         (selectedRequest.sender &&
//                           selectedRequest.sender.name) ||
//                         selectedRequest.senderServiceNumber ||
//                         "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Receiver:</span>{" "}
//                       {selectedRequest.receiverName ||
//                         (selectedRequest.receiver &&
//                           selectedRequest.receiver.name) ||
//                         selectedRequest.receiverServiceNumber ||
//                         "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">Out Location:</span>{" "}
//                       {selectedRequest.outLocation || "N/A"}
//                     </p>
//                     <p>
//                       <span className="font-medium">In Location:</span>{" "}
//                       {selectedRequest.inLocation || "N/A"}
//                     </p>
//                   </div>
//                 </div>

                



// {/* Verification Details (only show for verified or rejected requests) */}
// {/* Verification Details (show only in verified/rejected tabs) */}
// {(selectedRequest.verificationStatus === "VERIFIED" || 
//   selectedRequest.verificationStatus === "REJECTED") && (
//   <div>
//     <h3 className="font-semibold text-lg mb-2">
//       Verification Details
//     </h3>
//     <div className="space-y-2">
//       <p>
//         <span className="font-medium">Verified By:</span>{" "}
//         {selectedRequest.verificationBy || selectedRequest.verification?.verifiedBy || "N/A"}
//       </p>
//       <p>
//         <span className="font-medium">Verification Date:</span>{" "}
//         {formatDate(selectedRequest.verificationDate || selectedRequest.verification?.verificationDate)}
//       </p>
//       <p>
//         <span className="font-medium">Comments:</span>{" "}
//         {selectedRequest.comments || selectedRequest.verification?.comments || "No comments"}
//       </p>
//     </div>
//   </div>
// )}
//               </div>

//               <div className="mb-6">
//                 <h3 className="font-semibold text-lg mb-2">Items</h3>
//                 {selectedRequest.items && selectedRequest.items.length > 0 ? (
//                   <div className="space-y-4">
//                     {selectedRequest.items.map((item, index) => (
//                       <div key={index} className="border rounded-lg p-4">
//                         <div className="flex justify-between">
//                           <div>
//                             <p className="font-medium">
//                               {index + 1}. {item.itemName}
//                             </p>
//                             <p>Quantity: {item.quantity}</p>
//                             <p>Category: {item.categoryName}</p>
//                             {item.serialNumber && (
//                               <p>Serial Number: {item.serialNumber}</p>
//                             )}
//                             <p>Returnable: {item.returnable ? "Yes" : "No"}</p>
//                             {item.returnable && (
//                               <p>Due Date: {formatDate(item.dueDate)}</p>
//                             )}
//                           </div>
//                           {item.imageUrls && item.imageUrls.length > 0 && (
//                             <div className="flex flex-wrap gap-2">
//                               {item.imageUrls.map((image, imgIndex) => (
//                                 <img
//                                   key={imgIndex}
//                                   src={`http://localhost:9077/api/gatepass/items/images/${image}`}
//                                   alt={`Item ${index + 1}`}
//                                   className="h-20 w-20 object-cover border rounded"
//                                   onError={(e) => {
//                                     e.target.src =
//                                       "https://via.placeholder.com/100?text=Image+Not+Found";
//                                   }}
//                                 />
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p>No items in this request</p>
//                 )}

//                 {/* In the details modal, add this section after the Basic Information */}
// {(selectedRequest.verificationDetails && 
//   (tabIndex === 1 || tabIndex === 2)) && (
//   <div className="mt-6">
//     <h3 className="font-semibold text-lg mb-2">Verification History</h3>
    
//     {/* Executive Officer Approval */}
//     <div className="mb-4 p-4 bg-gray-50 rounded-lg">
//       <h4 className="font-medium text-md mb-1">Executive Officer Approval</h4>
//       <div className="grid grid-cols-2 gap-2">
//         <p>
//           <span className="font-medium">Officer:</span>{" "}
//           {selectedRequest.verificationDetails.executiveOfficer?.name || "N/A"}
//         </p>
//         <p>
//           <span className="font-medium">Status:</span>{" "}
//           {selectedRequest.verificationDetails.executiveStatus || "N/A"}
//         </p>
//         <p>
//           <span className="font-medium">Date:</span>{" "}
//           {formatDate(selectedRequest.verificationDetails.executiveDate)}
//         </p>
//         <p>
//           <span className="font-medium">Comments:</span>{" "}
//           {selectedRequest.verificationDetails.executiveComments || "No comments"}
//         </p>
//       </div>
//     </div>

//     {/* Duty Officer Verification */}
//     {selectedRequest.verificationDetails.dutyOfficer && (
//       <div className="p-4 bg-gray-50 rounded-lg">
//         <h4 className="font-medium text-md mb-1">Duty Officer Verification</h4>
//         <div className="grid grid-cols-2 gap-2">
//           <p>
//             <span className="font-medium">Officer:</span>{" "}
//             {selectedRequest.verificationDetails.dutyOfficer.name || "N/A"}
//           </p>
//           <p>
//             <span className="font-medium">Status:</span>{" "}
//             {selectedRequest.verificationDetails.dutyStatus || "N/A"}
//           </p>
//           <p>
//             <span className="font-medium">Date:</span>{" "}
//             {formatDate(selectedRequest.verificationDetails.dutyDate)}
//           </p>
//           <p>
//             <span className="font-medium">Comments:</span>{" "}
//             {selectedRequest.verificationDetails.dutyComments || "No comments"}
//           </p>
//         </div>
//       </div>
//     )}
//   </div>
// )}
//               </div>



            

// {/* Verification Form (only show for pending requests and when in the pending tab) */}
// {(!selectedRequest.verificationStatus ||
//   selectedRequest.verificationStatus === "PENDING") && 
//   tabIndex === 0 && (
//   <div className="mt-6 border-t pt-4">
//     <h3 className="font-semibold text-lg mb-3">
//       Verification Action
//     </h3>
//     <div className="space-y-4">
//       <div>
//         <label
//           htmlFor="comment"
//           className="block text-sm font-medium text-gray-700 mb-1"
//         >
//           Comments (required)
//         </label>
//         <textarea
//           id="comment"
//           rows={3}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
//           placeholder="Enter your verification comments..."
//           value={comment}
//           onChange={(e) => setComment(e.target.value)}
//         />
//       </div>
//       <div className="flex space-x-4">
//         <button
//           onClick={() => handleVerifyReject("VERIFIED")}
//           disabled={actionLoading || !comment.trim()}
//           className={`px-4 py-2 rounded-md text-white ${
//             actionLoading || !comment.trim()
//               ? "bg-green-300"
//               : "bg-green-600 hover:bg-green-700"
//           } flex items-center`}
//         >
//           {actionLoading ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Processing...
//             </>
//           ) : (
//             "Approve Request"
//           )}
//         </button>
//         <button
//           onClick={() => handleVerifyReject("REJECTED")}
//           disabled={actionLoading || !comment.trim()}
//           className={`px-4 py-2 rounded-md text-white ${
//             actionLoading || !comment.trim()
//               ? "bg-red-300"
//               : "bg-red-600 hover:bg-red-700"
//           } flex items-center`}
//         >
//           {actionLoading ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                 ></path>
//               </svg>
//               Processing...
//             </>
//           ) : (
//             "Reject Request"
//           )}
//         </button>
//         <button
//           onClick={() => setSelectedRequest(null)}
//           className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//         >
//           Cancel
//         </button>
//       </div>
//     </div>
//   </div>
// )}

// {/* For already processed requests or non-pending tab, show close button */}
// {(selectedRequest.verificationStatus === "VERIFIED" ||
//   selectedRequest.verificationStatus === "REJECTED" ||
//   tabIndex !== 0) && (
//   <div className="mt-6 flex justify-end">
//     <button
//       onClick={() => setSelectedRequest(null)}
//       className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//     >
//       Close
//     </button>
//   </div>
// )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
// export default DutyOfficerVerificationPage;




"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import { Tab, Tabs, TabList, TabPanel } from "react-tabs"
import "react-tabs/style/react-tabs.css"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"

const DutyOfficerVerificationPage = () => {
  const { user } = useAuth()
  const [pendingRequests, setPendingRequests] = useState([])
  const [processedRequests, setProcessedRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [comment, setComment] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState({
    text: "",
    isError: false,
  })
  const [tabIndex, setTabIndex] = useState(0)

  useEffect(() => {
    if (user && user.serviceNumber) {
      fetchAllRequests()
    }
  }, [user])

  const fetchAllRequests = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch pending requests for verification
      const pendingResponse = await axios.get("http://localhost:9077/api/verifications/pending")
      setPendingRequests(pendingResponse.data)

      // Fetch processed verifications by duty officer
      const processedResponse = await axios.get(
        `http://localhost:9077/api/verifications/duty-officer/${user.serviceNumber}`,
      )

      // Enhance processed requests with full details
      const enhancedProcessedRequests = await Promise.all(
        processedResponse.data.map(async (verification) => {
          try {
            // Fetch the complete request details to get sender/receiver info
            const requestId = verification.requestId
            const detailResponse = await axios.get(`http://localhost:9077/api/gatepass/request/${requestId}`)

            // Merge the verification data with the complete request data
            return {
              ...verification,
              ...detailResponse.data,
              // Keep original verification data
              comments: verification.comments,
              verificationStatus: verification.verificationStatus,
              verificationDate: verification.verificationDate,
            }
          } catch (err) {
            console.error(`Error fetching details for request ${verification.requestId}:`, err)
            return verification // Return original if fetch fails
          }
        }),
      )

      setProcessedRequests(enhancedProcessedRequests)
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
      setActionMessage({ text: "", isError: false })

      const requestId = request.refNo || request.requestId
      console.log("Fetching details for request ID:", requestId)

      // Always fetch the basic request details
      const response = await axios.get(`http://localhost:9077/api/gatepass/request/${requestId}`)

      // Make sure we have sender and receiver information
      const requestData = {
        ...response.data,
        // Preserve any existing comments
        comments: request.comments || response.data.comments,
        // Ensure sender and receiver info is available
        senderName: response.data.sender?.name || response.data.senderName || response.data.senderServiceNumber,
        receiverName: response.data.receiver?.name || response.data.receiverName || response.data.receiverServiceNumber,
      }

      // For pending tab, we don't need verification history
      if (tabIndex === 0) {
        setSelectedRequest(requestData)
        setComment("")
        return
      }

      // For verified/rejected tabs, fetch verification details
      try {
        const verificationResponse = await axios.get(`http://localhost:9077/api/verifications/request/${requestId}`)

        // Also fetch executive approval details
        const executiveResponse = await axios
          .get(`http://localhost:9077/api/approvals/request/${requestId}`)
          .catch((err) => {
            console.warn("Executive approval details not found:", err)
            return { data: {} }
          })

        // Merge all data
        setSelectedRequest({
          ...requestData,
          verificationDetails: {
            ...verificationResponse.data,
            executiveOfficer: executiveResponse.data.executiveOfficer || verificationResponse.data.executiveOfficer,
            executiveStatus: executiveResponse.data.executiveStatus || verificationResponse.data.executiveStatus,
            executiveComments: executiveResponse.data.executiveComments || verificationResponse.data.executiveComments,
            executiveDate: executiveResponse.data.executiveDate || verificationResponse.data.executiveDate,
          },
        })
      } catch (verificationError) {
        console.error("Error fetching verification details:", verificationError)
        // If no verification data, just use the request data
        setSelectedRequest(requestData)
      }

      setComment("")
    } catch (err) {
      console.error("Error fetching request details:", err)
      setActionMessage({
        text: "Failed to load request details. Please try again.",
        isError: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyReject = async (status) => {
    if (!selectedRequest || !selectedRequest.refNo || !comment.trim()) {
      setActionMessage({
        text: "Please enter a comment before submitting",
        isError: true,
      })
      return
    }

    try {
      setActionLoading(true)
      setActionMessage({ text: "", isError: false })

      const verificationData = {
        requestId: selectedRequest.refNo,
        verifiedBy: user.serviceNumber,
        verificationStatus: status,
        comments: comment,
      }

      console.log("Submitting verification:", verificationData)
      const response = await axios.post("http://localhost:9077/api/verifications", verificationData)

      console.log("Verification response:", response.data)

      setActionMessage({
        text: `Request ${status === "VERIFIED" ? "verified" : "rejected"} successfully!`,
        isError: false,
      })

      // Refresh data and switch tab after short delay
      setTimeout(() => {
        setSelectedRequest(null)
        fetchAllRequests()
        // Switch to appropriate tab based on action - tab index 1 for VERIFIED, 2 for REJECTED
        setTabIndex(status === "VERIFIED" ? 1 : 2)
      }, 1500)
    } catch (err) {
      console.error("Error processing verification:", err)
      setActionMessage({
        text: err.response?.data || "Failed to process verification. Please try again.",
        isError: true,
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return isNaN(date.getTime()) ? "N/A" : date.toLocaleString()
    } catch (e) {
      return "N/A"
    }
  }

  const generateSummaryPDF = async (request) => {
    try {
      setActionLoading(true)

      // If the request details are incomplete, fetch complete details first
      if (!request.items || !request.verificationDetails) {
        try {
          const requestId = request.refNo || request.requestId

          // Fetch complete request details
          const requestResponse = await axios.get(`http://localhost:9077/api/gatepass/request/${requestId}`)

          // Try to fetch verification details
          try {
            const verificationResponse = await axios.get(`http://localhost:9077/api/verifications/request/${requestId}`)

            // Try to fetch executive approval details
            const executiveResponse = await axios
              .get(`http://localhost:9077/api/approvals/request/${requestId}`)
              .catch((err) => {
                console.warn("Executive approval details not found:", err)
                return { data: {} }
              })

            // Merge all data
            request = {
              ...request,
              ...requestResponse.data,
              verificationDetails: {
                ...verificationResponse.data,
                executiveOfficer: executiveResponse.data.executiveOfficer || verificationResponse.data.executiveOfficer,
                executiveStatus: executiveResponse.data.executiveStatus || verificationResponse.data.executiveStatus,
                executiveComments:
                  executiveResponse.data.executiveComments || verificationResponse.data.executiveComments,
                executiveDate: executiveResponse.data.executiveDate || verificationResponse.data.executiveDate,
              },
            }
          } catch (verificationError) {
            console.error("Error fetching verification details:", verificationError)
            request = { ...request, ...requestResponse.data }
          }
        } catch (fetchErr) {
          console.error("Error fetching complete request details:", fetchErr)
        }
      }

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create()
      const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
      const { width, height } = page.getSize()

      // Fonts
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Add title and header
      page.drawRectangle({
        x: 40,
        y: height - 100,
        width: width - 80,
        height: 60,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })

      page.drawText("SLT Gate Pass System", {
        x: 50,
        y: height - 60,
        size: 18,
        font: titleFont,
        color: rgb(0, 0, 0.5),
      })

      page.drawText(`Request Summary: ${request.refNo || request.requestId}`, {
        x: 50,
        y: height - 85,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      let yPosition = height - 130

      // Basic Information Section
      page.drawRectangle({
        x: 40,
        y: yPosition - 140,
        width: width - 80,
        height: 140,
        color: rgb(1, 1, 1, 0),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })

      page.drawText("Basic Information", {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0.7),
      })

      yPosition -= 30

      // Status
      page.drawText("Status:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      const status = request.status || request.verificationStatus || "PENDING"
      page.drawText(status, {
        x: 180,
        y: yPosition,
        size: 12,
        font: regularFont,
      })

      yPosition -= 20

      // Created Date
      page.drawText("Created:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      page.drawText(formatDate(request.createdDate), {
        x: 180,
        y: yPosition,
        size: 12,
        font: regularFont,
      })

      yPosition -= 20

      // Sender
      page.drawText("Sender:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      page.drawText(request.sender?.name || request.senderName || request.senderServiceNumber || "N/A", {
        x: 180,
        y: yPosition,
        size: 12,
        font: regularFont,
      })

      yPosition -= 20

      // Receiver
      page.drawText("Receiver:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      page.drawText(request.receiver?.name || request.receiverName || request.receiverServiceNumber || "N/A", {
        x: 180,
        y: yPosition,
        size: 12,
        font: regularFont,
      })

      yPosition -= 20

      // Out Location
      page.drawText("Out Location:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      page.drawText(request.outLocation || "N/A", {
        x: 180,
        y: yPosition,
        size: 12,
        font: regularFont,
      })

      yPosition -= 20

      // In Location
      page.drawText("In Location:", {
        x: 60,
        y: yPosition,
        size: 12,
        font: boldFont,
      })

      page.drawText(request.inLocation || "N/A", {
        x: 180,
        y: yPosition,
        size: 12,
        font: regularFont,
      })

      yPosition -= 50

      // Items Section
      page.drawText("Items", {
        x: 50,
        y: yPosition,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0.7),
      })

      yPosition -= 25

      if (request.items && request.items.length > 0) {
        // Draw items table header
        page.drawRectangle({
          x: 40,
          y: yPosition - 5,
          width: width - 80,
          height: 25,
          color: rgb(0.9, 0.9, 0.9),
          borderColor: rgb(0.8, 0.8, 0.8),
          borderWidth: 1,
        })

        page.drawText("No.", {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
        })

        page.drawText("Item Name", {
          x: 90,
          y: yPosition,
          size: 12,
          font: boldFont,
        })

        page.drawText("Category", {
          x: 220,
          y: yPosition,
          size: 12,
          font: boldFont,
        })

        page.drawText("Quantity", {
          x: 320,
          y: yPosition,
          size: 12,
          font: boldFont,
        })

        page.drawText("Serial No.", {
          x: 390,
          y: yPosition,
          size: 12,
          font: boldFont,
        })

        page.drawText("Returnable", {
          x: 480,
          y: yPosition,
          size: 12,
          font: boldFont,
        })

        yPosition -= 25

        for (let i = 0; i < request.items.length; i++) {
          const item = request.items[i]

          // Check if we need a new page
          if (yPosition < 100) {
            // Add a new page
            const page = pdfDoc.addPage([595.28, 841.89])
            yPosition = height - 50

            // Add continuation header
            page.drawText("Items (continued)", {
              x: 50,
              y: yPosition,
              size: 14,
              font: boldFont,
              color: rgb(0, 0, 0.7),
            })

            yPosition -= 25

            // Draw items table header again
            page.drawRectangle({
              x: 40,
              y: yPosition - 5,
              width: width - 80,
              height: 25,
              color: rgb(0.9, 0.9, 0.9),
              borderColor: rgb(0.8, 0.8, 0.8),
              borderWidth: 1,
            })

            page.drawText("No.", {
              x: 50,
              y: yPosition,
              size: 12,
              font: boldFont,
            })

            page.drawText("Item Name", {
              x: 90,
              y: yPosition,
              size: 12,
              font: boldFont,
            })

            page.drawText("Category", {
              x: 220,
              y: yPosition,
              size: 12,
              font: boldFont,
            })

            page.drawText("Quantity", {
              x: 320,
              y: yPosition,
              size: 12,
              font: boldFont,
            })

            page.drawText("Serial No.", {
              x: 390,
              y: yPosition,
              size: 12,
              font: boldFont,
            })

            page.drawText("Returnable", {
              x: 480,
              y: yPosition,
              size: 12,
              font: boldFont,
            })

            yPosition -= 25
          }

          // Draw item row
          page.drawRectangle({
            x: 40,
            y: yPosition - 5,
            width: width - 80,
            height: 25,
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 1,
          })

          page.drawText(`${i + 1}`, {
            x: 50,
            y: yPosition,
            size: 11,
            font: regularFont,
          })

          page.drawText(item.itemName || "N/A", {
            x: 90,
            y: yPosition,
            size: 11,
            font: regularFont,
            maxWidth: 120,
          })

          page.drawText(item.categoryName || "N/A", {
            x: 220,
            y: yPosition,
            size: 11,
            font: regularFont,
            maxWidth: 90,
          })

          page.drawText(`${item.quantity || 0}`, {
            x: 320,
            y: yPosition,
            size: 11,
            font: regularFont,
          })

          page.drawText(item.serialNumber || "N/A", {
            x: 390,
            y: yPosition,
            size: 11,
            font: regularFont,
            maxWidth: 80,
          })

          page.drawText(item.returnable ? "Yes" : "No", {
            x: 480,
            y: yPosition,
            size: 11,
            font: regularFont,
          })

          yPosition -= 25
        }
      } else {
        page.drawText("No items in this request", {
          x: 70,
          y: yPosition,
          size: 12,
          font: regularFont,
        })

        yPosition -= 20
      }

      yPosition -= 30

      // Verification History Section (if available)
      const verificationDetails = request.verificationDetails
      if (verificationDetails) {
        // Check if we need a new page
        if (yPosition < 200) {
          // Add a new page
          page = pdfDoc.addPage([595.28, 841.89])
          yPosition = height - 50
        }

        page.drawText("Verification History", {
          x: 50,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: rgb(0, 0, 0.7),
        })

        yPosition -= 25

        // Executive Officer Approval
        if (verificationDetails.executiveOfficer || verificationDetails.executiveStatus) {
          page.drawRectangle({
            x: 40,
            y: yPosition - 100,
            width: width - 80,
            height: 100,
            color: rgb(0.97, 0.97, 1),
            borderColor: rgb(0.8, 0.8, 0.9),
            borderWidth: 1,
          })

          page.drawText("Executive Officer Approval", {
            x: 50,
            y: yPosition - 20,
            size: 12,
            font: boldFont,
          })

          page.drawText("Officer:", {
            x: 70,
            y: yPosition - 40,
            size: 12,
            font: boldFont,
          })

          page.drawText(verificationDetails.executiveOfficer?.name || "N/A", {
            x: 170,
            y: yPosition - 40,
            size: 12,
            font: regularFont,
          })

          page.drawText("Status:", {
            x: 70,
            y: yPosition - 60,
            size: 12,
            font: boldFont,
          })

          page.drawText(verificationDetails.executiveStatus || "N/A", {
            x: 170,
            y: yPosition - 60,
            size: 12,
            font: regularFont,
          })

          page.drawText("Date:", {
            x: 70,
            y: yPosition - 80,
            size: 12,
            font: boldFont,
          })

          page.drawText(formatDate(verificationDetails.executiveDate), {
            x: 170,
            y: yPosition - 80,
            size: 12,
            font: regularFont,
          })

          yPosition -= 120
        }

        // Duty Officer Verification
        if (verificationDetails.dutyOfficer || verificationDetails.dutyStatus) {
          // Check if we need a new page
          if (yPosition < 120) {
            // Add a new page
            page = pdfDoc.addPage([595.28, 841.89])
            yPosition = height - 50
          }

          page.drawRectangle({
            x: 40,
            y: yPosition - 100,
            width: width - 80,
            height: 100,
            color: rgb(0.97, 0.97, 1),
            borderColor: rgb(0.8, 0.8, 0.9),
            borderWidth: 1,
          })

          page.drawText("Duty Officer Verification", {
            x: 50,
            y: yPosition - 20,
            size: 12,
            font: boldFont,
          })

          page.drawText("Officer:", {
            x: 70,
            y: yPosition - 40,
            size: 12,
            font: boldFont,
          })

          page.drawText(verificationDetails.dutyOfficer?.name || "N/A", {
            x: 170,
            y: yPosition - 40,
            size: 12,
            font: regularFont,
          })

          page.drawText("Status:", {
            x: 70,
            y: yPosition - 60,
            size: 12,
            font: boldFont,
          })

          page.drawText(verificationDetails.dutyStatus || "N/A", {
            x: 170,
            y: yPosition - 60,
            size: 12,
            font: regularFont,
          })

          page.drawText("Date:", {
            x: 70,
            y: yPosition - 80,
            size: 12,
            font: boldFont,
          })

          page.drawText(formatDate(verificationDetails.dutyDate), {
            x: 170,
            y: yPosition - 80,
            size: 12,
            font: regularFont,
          })

          yPosition -= 120
        }
      }

      // Footer
      page.drawText("Generated by SLT Gate Pass System", {
        x: width / 2 - 100,
        y: 30,
        size: 10,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      })

      page.drawText(new Date().toLocaleString(), {
        x: width / 2 - 60,
        y: 15,
        size: 10,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      })

      // Save and download the PDF
      const pdfBytes = await pdfDoc.save()

      // Create a download link
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `gate-pass-summary-${request.refNo || request.requestId}.pdf`
      link.click()

      // Clean up
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error generating PDF:", err)
      setActionMessage({
        text: "Failed to generate PDF. Please try again.",
        isError: true,
      })
    } finally {
      setActionLoading(false)
    }
  }

  const generateVerificationChecklistPDF = async (request) => {
    try {
      setActionLoading(true)

      // Fetch complete details if items are missing
      if (!request.items || request.items.length === 0) {
        try {
          const requestId = request.refNo || request.requestId
          const response = await axios.get(`http://localhost:9077/api/gatepass/request/${requestId}`)
          request = { ...request, ...response.data }
        } catch (fetchErr) {
          console.error("Error fetching complete request details:", fetchErr)
        }
      }

      // Create PDF document
      const pdfDoc = await PDFDocument.create()
      let page = pdfDoc.addPage([595.28, 841.89]) // A4 size
      const { width, height } = page.getSize()
      const margin = 40
      const tableWidth = width - 2 * margin

      // Fonts
      const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

      // Header
      page.drawRectangle({
        x: margin - 5,
        y: height - 100,
        width: tableWidth + 10,
        height: 60,
        color: rgb(0.95, 0.95, 0.95),
        borderColor: rgb(0.8, 0.8, 0.8),
        borderWidth: 1,
      })

      page.drawText("SLT Gate Pass System", {
        x: margin,
        y: height - 50,
        size: 16,
        font: titleFont,
        color: rgb(0, 0, 0.5),
      })

      page.drawText("Gate Pass Verification Checklist", {
        x: margin,
        y: height - 75,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      // Document border
      page.drawRectangle({
        x: margin - 5,
        y: 30,
        width: tableWidth + 10,
        height: height - 140,
        borderWidth: 1,
        borderColor: rgb(0.2, 0.2, 0.2),
      })

      // Request Details
      let yPosition = height - 120

      page.drawRectangle({
        x: margin,
        y: yPosition - 80,
        width: tableWidth,
        height: 80,
        color: rgb(0.98, 0.98, 1),
        borderColor: rgb(0.8, 0.8, 0.9),
        borderWidth: 1,
      })

      const details = [
        `Request ID: ${request.refNo || request.requestId}`,
        `Date: ${formatDate(request.createdDate)}`,
        `Sender: ${request.sender?.name || request.senderName || request.senderServiceNumber || "N/A"}`,
        `Receiver: ${request.receiver?.name || request.receiverName || request.receiverServiceNumber || "N/A"}`,
      ]

      details.forEach((text, index) => {
        page.drawText(text, {
          x: margin + 10,
          y: yPosition - 20 - index * 15,
          size: 11,
          font: regularFont,
          color: rgb(0, 0, 0),
        })
      })

      yPosition -= 100

      // Table Header
      const tableTop = yPosition
      const columnWidths = {
        number: 40,
        name: 140,
        details: 180,
        image: 100,
        verified: 60,
      }

      const headers = [
        { text: "No.", x: margin, width: columnWidths.number },
        { text: "Item Name", x: margin + columnWidths.number, width: columnWidths.name },
        { text: "Details", x: margin + columnWidths.number + columnWidths.name, width: columnWidths.details },
        {
          text: "Image",
          x: margin + columnWidths.number + columnWidths.name + columnWidths.details,
          width: columnWidths.image,
        },
        {
          text: "Verified",
          x: margin + columnWidths.number + columnWidths.name + columnWidths.details + columnWidths.image,
          width: columnWidths.verified,
        },
      ]

      // Draw header background
      page.drawRectangle({
        x: margin,
        y: tableTop - 25,
        width: tableWidth,
        height: 25,
        color: rgb(0.9, 0.9, 0.9),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      })

      // Draw header texts and borders
      headers.forEach((header) => {
        page.drawText(header.text, {
          x: header.x + 5,
          y: tableTop - 15,
          size: 11,
          font: boldFont,
          color: rgb(0, 0, 0),
        })

        page.drawRectangle({
          x: header.x,
          y: tableTop - 25,
          width: header.width,
          height: 25,
          borderWidth: 1,
          borderColor: rgb(0.7, 0.7, 0.7),
        })
      })

      yPosition -= 40

      // Items Table
      if (request.items && request.items.length > 0) {
        for (let index = 0; index < request.items.length; index++) {
          const item = request.items[index]
          const imageCount = item.imageUrls ? item.imageUrls.length : 0
          const imgHeight = 60 // Height of each image
          const imgSpacing = 5 // Spacing between images
          const baseItemHeight = 80 // Base height for item without images
          const imagesTotalHeight = imageCount > 0 ? imageCount * (imgHeight + imgSpacing) - imgSpacing : 0
          const itemHeight = Math.max(baseItemHeight, imagesTotalHeight + 20) // Ensure enough height for images or base content

          // Check if new page is needed
          if (yPosition - itemHeight < 100) {
            page = pdfDoc.addPage([595.28, 841.89])
            yPosition = height - 40

            // Redraw headers on new page
            page.drawText("Gate Pass Verification Checklist (continued)", {
              x: margin,
              y: height - 40,
              size: 18,
              font: titleFont,
              color: rgb(0, 0, 0),
            })

            page.drawRectangle({
              x: margin - 5,
              y: 30,
              width: tableWidth + 10,
              height: height - 60,
              borderWidth: 1,
              borderColor: rgb(0.2, 0.2, 0.2),
            })

            yPosition -= 40

            page.drawRectangle({
              x: margin,
              y: yPosition - 25,
              width: tableWidth,
              height: 25,
              color: rgb(0.9, 0.9, 0.9),
              borderColor: rgb(0.7, 0.7, 0.7),
              borderWidth: 1,
            })

            headers.forEach((header) => {
              page.drawText(header.text, {
                x: header.x + 5,
                y: yPosition - 15,
                size: 11,
                font: boldFont,
                color: rgb(0, 0, 0),
              })

              page.drawRectangle({
                x: header.x,
                y: yPosition - 25,
                width: header.width,
                height: 25,
                borderWidth: 1,
                borderColor: rgb(0.7, 0.7, 0.7),
              })
            })

            yPosition -= 40
          }

          // Draw row border
          page.drawRectangle({
            x: margin,
            y: yPosition - itemHeight,
            width: tableWidth,
            height: itemHeight,
            borderWidth: 1,
            borderColor: rgb(0.7, 0.7, 0.7),
          })

          // Item Number
          page.drawText(`${index + 1}`, {
            x: margin + 15,
            y: yPosition - 25,
            size: 11,
            font: regularFont,
            color: rgb(0, 0, 0),
          })

          // Item Name
          page.drawText(item.itemName || "N/A", {
            x: margin + columnWidths.number + 5,
            y: yPosition - 25,
            size: 11,
            font: regularFont,
            color: rgb(0, 0, 0),
            maxWidth: columnWidths.name - 10,
            lineHeight: 14,
          })

          // Item Details
          const detailsText = [
            `Qty: ${item.quantity}`,
            `Cat: ${item.categoryName || "N/A"}`,
            item.serialNumber ? `SN: ${item.serialNumber}` : "",
            `${item.returnable ? "Returnable" : "Non-returnable"}`,
          ]
            .filter(Boolean)
            .join("\n")

          page.drawText(detailsText, {
            x: margin + columnWidths.number + columnWidths.name + 5,
            y: yPosition - 25,
            size: 10,
            font: regularFont,
            color: rgb(0, 0, 0),
            lineHeight: 14,
          })

          // Image Column
          if (item.imageUrls && item.imageUrls.length > 0) {
            let imgYPosition = yPosition - imgHeight - 10

            for (let imgIndex = 0; imgIndex < Math.min(item.imageUrls.length, 3); imgIndex++) {
              try {
                const imageUrl = `http://localhost:9077/api/gatepass/items/images/${item.imageUrls[imgIndex]}`
                const imageResponse = await fetch(imageUrl)

                if (imageResponse.ok) {
                  const imageArrayBuffer = await imageResponse.arrayBuffer()
                  let pdfImage

                  if (imageUrl.toLowerCase().endsWith(".jpg") || imageUrl.toLowerCase().endsWith(".jpeg")) {
                    pdfImage = await pdfDoc.embedJpg(imageArrayBuffer)
                  } else if (imageUrl.toLowerCase().endsWith(".png")) {
                    pdfImage = await pdfDoc.embedPng(imageArrayBuffer)
                  } else {
                    try {
                      pdfImage = await pdfDoc.embedPng(imageArrayBuffer)
                    } catch {
                      pdfImage = await pdfDoc.embedJpg(imageArrayBuffer)
                    }
                  }

                  const imgWidth = 60
                  page.drawImage(pdfImage, {
                    x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 20,
                    y: imgYPosition,
                    width: imgWidth,
                    height: imgHeight,
                  })
                } else {
                  // Draw placeholder for failed image
                  page.drawRectangle({
                    x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 20,
                    y: imgYPosition,
                    width: 60,
                    height: imgHeight,
                    borderWidth: 1,
                    borderColor: rgb(0.8, 0.8, 0.8),
                  })

                  page.drawText("No Image", {
                    x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 30,
                    y: imgYPosition + imgHeight / 2,
                    size: 10,
                    font: regularFont,
                    color: rgb(0.5, 0.5, 0.5),
                  })
                }
              } catch (imgError) {
                console.error("Error embedding image:", imgError)

                // Draw placeholder for error
                page.drawRectangle({
                  x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 20,
                  y: imgYPosition,
                  width: 60,
                  height: imgHeight,
                  borderWidth: 1,
                  borderColor: rgb(0.8, 0.8, 0.8),
                })

                page.drawText("No Image", {
                  x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 30,
                  y: imgYPosition + imgHeight / 2,
                  size: 10,
                  font: regularFont,
                  color: rgb(0.5, 0.5, 0.5),
                })
              }

              imgYPosition -= imgHeight + imgSpacing // Move down for the next image
            }

            if (item.imageUrls.length > 3) {
              page.drawText(`+${item.imageUrls.length - 3} more`, {
                x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 25,
                y: imgYPosition + imgHeight + 5,
                size: 8,
                font: regularFont,
                color: rgb(0.5, 0.5, 0.5),
              })
            }
          } else {
            page.drawText("No Image", {
              x: margin + columnWidths.number + columnWidths.name + columnWidths.details + 30,
              y: yPosition - 45,
              size: 10,
              font: regularFont,
              color: rgb(0.5, 0.5, 0.5),
            })
          }

          // Verified Checkbox
          page.drawRectangle({
            x: margin + columnWidths.number + columnWidths.name + columnWidths.details + columnWidths.image + 20,
            y: yPosition - 30,
            width: 15,
            height: 15,
            borderWidth: 1,
            borderColor: rgb(0, 0, 0),
          })

          yPosition -= itemHeight + 10
        }
      } else {
        page.drawText("No items in this request", {
          x: margin + 5,
          y: yPosition - 20,
          size: 11,
          font: regularFont,
          color: rgb(0.5, 0.5, 0.5),
        })

        yPosition -= 40
      }

      // Signature Section
      yPosition = Math.min(yPosition - 20, 150)

      page.drawRectangle({
        x: margin,
        y: yPosition - 80,
        width: tableWidth,
        height: 80,
        color: rgb(0.98, 0.98, 1),
        borderColor: rgb(0.7, 0.7, 0.7),
        borderWidth: 1,
      })

      page.drawText("Duty Officer Signature:", {
        x: margin + 10,
        y: yPosition - 30,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawLine({
        start: { x: margin + 150, y: yPosition - 30 },
        end: { x: margin + 350, y: yPosition - 30 },
        thickness: 1,
        color: rgb(0, 0, 0),
      })

      page.drawText("Date:", {
        x: margin + 370,
        y: yPosition - 30,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawLine({
        start: { x: margin + 410, y: yPosition - 30 },
        end: { x: margin + 500, y: yPosition - 30 },
        thickness: 1,
        color: rgb(0, 0, 0),
      })

      page.drawText("Comments:", {
        x: margin + 10,
        y: yPosition - 60,
        size: 12,
        font: boldFont,
        color: rgb(0, 0, 0),
      })

      page.drawLine({
        start: { x: margin + 80, y: yPosition - 60 },
        end: { x: margin + 500, y: yPosition - 60 },
        thickness: 1,
        color: rgb(0, 0, 0),
      })

      // Footer
      page.drawText("Generated by SLT Gate Pass System", {
        x: width / 2 - 100,
        y: 30,
        size: 10,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      })

      page.drawText(new Date().toLocaleString(), {
        x: width / 2 - 60,
        y: 15,
        size: 10,
        font: regularFont,
        color: rgb(0.5, 0.5, 0.5),
      })

      // Save and download
      const pdfBytes = await pdfDoc.save()
      const blob = new Blob([pdfBytes], { type: "application/pdf" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `verification-checklist-${request.refNo || request.requestId}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Error generating verification checklist PDF:", err)
      setActionMessage({
        text: "Failed to generate verification checklist. Please try again.",
        isError: true,
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Helper function to extract name consistently
  const extractName = (request, type) => {
    if (type === "sender") {
      return request.sender?.name || request.senderName || request.senderServiceNumber || "N/A"
    } else {
      return request.receiver?.name || request.receiverName || request.receiverServiceNumber || "N/A"
    }
  }

  // Main renderRequestTable function
  const renderRequestTable = (requests, showComments = false, isPendingTab = false) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Request ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {showComments ? "Verification Date" : "Created Date"}
            </th>
            {!isPendingTab && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receiver
                </th>
              </>
            )}
            {showComments && (
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comments
              </th>
            )}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documents
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.requestId || request.refNo}>
              <td className="px-6 py-4 whitespace-nowrap">{request.requestId || request.refNo}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {formatDate(request.createdDate || request.verificationDate)}
              </td>
              {!isPendingTab && (
                <>
                  <td className="px-6 py-4 whitespace-nowrap">{extractName(request, "sender")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{extractName(request, "receiver")}</td>
                </>
              )}
              {showComments && (
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">{request.comments || "No comments"}</div>
                </td>
              )}
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    request.status === "VERIFIED" || request.verificationStatus === "VERIFIED"
                      ? "bg-green-100 text-green-800"
                      : request.status === "REJECTED" || request.verificationStatus === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {request.status || request.verificationStatus || "PENDING"}
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
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex space-x-2">
                  {/* Only show Summary PDF for verified/rejected requests */}
                  {!isPendingTab && (
                    <button
                      onClick={() => generateSummaryPDF(request)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm"
                      disabled={actionLoading}
                    >
                      Summary PDF
                    </button>
                  )}
                  {/* Only show Checklist PDF for pending requests */}
                  {isPendingTab && (
                    <button
                      onClick={() => generateVerificationChecklistPDF(request)}
                      className="text-green-600 hover:text-green-900 text-sm"
                      disabled={actionLoading}
                    >
                      Checklist PDF
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

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
        <button onClick={fetchAllRequests} className="ml-4 bg-blue-500 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gate Pass Verification</h1>
        <div className="text-right">
          <p className="font-medium">{user?.fullName || user?.serviceNumber} (Duty Officer)</p>
        </div>
      </div>

      <Tabs selectedIndex={tabIndex} onSelect={(index) => setTabIndex(index)}>
        <TabList>
          <Tab>Pending ({pendingRequests.length})</Tab>
          <Tab>
            Verified (
            {processedRequests.filter((r) => r.verificationStatus === "VERIFIED" || r.status === "VERIFIED").length})
          </Tab>
          <Tab>
            Rejected (
            {processedRequests.filter((r) => r.verificationStatus === "REJECTED" || r.status === "REJECTED").length})
          </Tab>
        </TabList>

        <TabPanel>
          {pendingRequests.length === 0 ? (
            <div className="text-center text-gray-500 p-8">No pending requests</div>
          ) : (
            renderRequestTable(pendingRequests, false, true) // isPendingTab = true
          )}
        </TabPanel>

        <TabPanel>
          {processedRequests.filter((r) => r.verificationStatus === "VERIFIED" || r.status === "VERIFIED").length ===
          0 ? (
            <div className="text-center text-gray-500 p-8">No verified requests</div>
          ) : (
            renderRequestTable(
              processedRequests.filter((r) => r.verificationStatus === "VERIFIED" || r.status === "VERIFIED"),
              true, // Show comments
              false, // Not pending tab
            )
          )}
        </TabPanel>

        <TabPanel>
          {processedRequests.filter((r) => r.verificationStatus === "REJECTED" || r.status === "REJECTED").length ===
          0 ? (
            <div className="text-center text-gray-500 p-8">No rejected requests</div>
          ) : (
            renderRequestTable(
              processedRequests.filter((r) => r.verificationStatus === "REJECTED" || r.status === "REJECTED"),
              true, // Show comments
              false, // Not pending tab
            )
          )}
        </TabPanel>
      </Tabs>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-bold mb-4">
                  Request Details: {selectedRequest.refNo || selectedRequest.requestId}
                </h2>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {actionMessage.text && (
                <div
                  className={`mb-4 p-3 rounded ${
                    actionMessage.isError ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {actionMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Basic Information</h3>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Status:</span>
                      <span
                        className={`ml-2 px-2 py-1 text-xs rounded-full ${
                          selectedRequest.status === "VERIFIED" || selectedRequest.verificationStatus === "VERIFIED"
                            ? "bg-green-100 text-green-800"
                            : selectedRequest.status === "REJECTED" || selectedRequest.verificationStatus === "REJECTED"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedRequest.status || selectedRequest.verificationStatus || "PENDING"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Created:</span> {formatDate(selectedRequest.createdDate)}
                    </p>
                    <p>
                      <span className="font-medium">Sender:</span>{" "}
                      {selectedRequest.senderName ||
                        (selectedRequest.sender && selectedRequest.sender.name) ||
                        selectedRequest.senderServiceNumber ||
                        "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Receiver:</span>{" "}
                      {selectedRequest.receiverName ||
                        (selectedRequest.receiver && selectedRequest.receiver.name) ||
                        selectedRequest.receiverServiceNumber ||
                        "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Out Location:</span> {selectedRequest.outLocation || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">In Location:</span> {selectedRequest.inLocation || "N/A"}
                    </p>
                  </div>
                </div>

                {/* Verification Details (show only in verified/rejected tabs) */}
                {(selectedRequest.verificationStatus === "VERIFIED" ||
                  selectedRequest.verificationStatus === "REJECTED") && (
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Verification Details</h3>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Verified By:</span>{" "}
                        {selectedRequest.verificationBy || selectedRequest.verification?.verifiedBy || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Verification Date:</span>{" "}
                        {formatDate(selectedRequest.verificationDate || selectedRequest.verification?.verificationDate)}
                      </p>
                      <p>
                        <span className="font-medium">Comments:</span>{" "}
                        {selectedRequest.comments || selectedRequest.verification?.comments || "No comments"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Items</h3>
                {selectedRequest.items && selectedRequest.items.length > 0 ? (
                  <div className="space-y-4">
                    {selectedRequest.items.map((item, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">
                              {index + 1}. {item.itemName}
                            </p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Category: {item.categoryName}</p>
                            {item.serialNumber && <p>Serial Number: {item.serialNumber}</p>}
                            <p>Returnable: {item.returnable ? "Yes" : "No"}</p>
                            {item.returnable && <p>Due Date: {formatDate(item.dueDate)}</p>}
                          </div>
                          {item.imageUrls && item.imageUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {item.imageUrls.map((image, imgIndex) => (
                                <img
                                  key={imgIndex}
                                  src={`http://localhost:9077/api/gatepass/items/images/${image}`}
                                  alt={`Item ${index + 1}`}
                                  className="h-20 w-20 object-cover border rounded"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/100?text=Image+Not+Found"
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No items in this request</p>
                )}

                {/* In the details modal, add this section after the Basic Information */}
                {selectedRequest.verificationDetails && (tabIndex === 1 || tabIndex === 2) && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-lg mb-2">Verification History</h3>
                    {/* Executive Officer Approval */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-md mb-1">Executive Officer Approval</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          <span className="font-medium">Officer:</span>{" "}
                          {selectedRequest.verificationDetails.executiveOfficer?.name || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Status:</span>{" "}
                          {selectedRequest.verificationDetails.executiveStatus || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Date:</span>{" "}
                          {formatDate(selectedRequest.verificationDetails.executiveDate)}
                        </p>
                        <p>
                          <span className="font-medium">Comments:</span>{" "}
                          {selectedRequest.verificationDetails.executiveComments || "No comments"}
                        </p>
                      </div>
                    </div>

                    {/* Duty Officer Verification */}
                    {selectedRequest.verificationDetails.dutyOfficer && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-md mb-1">Duty Officer Verification</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <p>
                            <span className="font-medium">Officer:</span>{" "}
                            {selectedRequest.verificationDetails.dutyOfficer.name || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Status:</span>{" "}
                            {selectedRequest.verificationDetails.dutyStatus || "N/A"}
                          </p>
                          <p>
                            <span className="font-medium">Date:</span>{" "}
                            {formatDate(selectedRequest.verificationDetails.dutyDate)}
                          </p>
                          <p>
                            <span className="font-medium">Comments:</span>{" "}
                            {selectedRequest.verificationDetails.dutyComments || "No comments"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Verification Form (only show for pending requests and when in the pending tab) */}
              {(!selectedRequest.verificationStatus || selectedRequest.verificationStatus === "PENDING") &&
                tabIndex === 0 && (
                  <div className="mt-6 border-t pt-4">
                    <h3 className="font-semibold text-lg mb-3">Verification Action</h3>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                          Comments (required)
                        </label>
                        <textarea
                          id="comment"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Enter your verification comments..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => handleVerifyReject("VERIFIED")}
                          disabled={actionLoading || !comment.trim()}
                          className={`px-4 py-2 rounded-md text-white ${
                            actionLoading || !comment.trim() ? "bg-green-300" : "bg-green-600 hover:bg-green-700"
                          } flex items-center`}
                        >
                          {actionLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            "Approve Request"
                          )}
                        </button>
                        <button
                          onClick={() => handleVerifyReject("REJECTED")}
                          disabled={actionLoading || !comment.trim()}
                          className={`px-4 py-2 rounded-md text-white ${
                            actionLoading || !comment.trim() ? "bg-red-300" : "bg-red-600 hover:bg-red-700"
                          } flex items-center`}
                        >
                          {actionLoading ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            "Reject Request"
                          )}
                        </button>
                        <button
                          onClick={() => setSelectedRequest(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* For already processed requests or non-pending tab, show close button */}
              {(selectedRequest.verificationStatus === "VERIFIED" ||
                selectedRequest.verificationStatus === "REJECTED" ||
                tabIndex !== 0) && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DutyOfficerVerificationPage
