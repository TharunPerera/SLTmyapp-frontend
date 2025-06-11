// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { useAuth } from '../context/AuthContext'; // Import your auth context
// // Add this import at the top of your file
// import backgroundImage from '../assets/bgimage.jpg'; // Adjust the path

// const GatePassForm = () => {
//   // Constants for validation
//   const { user } = useAuth(); // Get current user from auth context
//   const MAX_IMAGES_PER_ITEM = 3;
//   const MAX_FILE_SIZE_MB = 5;
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
//   const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

//   // State for form fields
//   const [formData, setFormData] = useState({
//     senderServiceNumber: user?.serviceNumber || "",
//     receiverServiceNumber: "",
//     executiveOfficer: "",
//     outLocation: "",
//     inLocation: "",
//     items: [
//       {
//         categoryId: "",
//         itemName: "",
//         serialNumber: "",
//         description: "",
//         quantity: 2,
//         returnable: false,
//         dueDate: "04/01/2025",
//         images: [],
//         imagePreviews: [],
//       },
//     ],
//   });

//   // State for dropdowns
//   const [executiveOfficers, setExecutiveOfficers] = useState([]);
//   const [itemCategories, setItemCategories] = useState([]);

//   // State for response message
//   const [responseMessage, setResponseMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);

//   // Animation variants
//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1,
//         when: "beforeChildren",
//       },
//     },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         type: "spring",
//         stiffness: 100,
//       },
//     },
//   };

//   // Check authentication and fetch data on component mount
//   useEffect(() => {
//     if (!user) {
//       // Redirect to login if not authenticated
//       window.location.href = '/login';
//       return;
//     }

//     // If user is employee, set their service number as sender
//     if (user.role === 'EMPLOYEE') {
//       setFormData(prev => ({
//         ...prev,
//         senderServiceNumber: user.serviceNumber
//       }));
//     }

//     fetchExecutiveOfficers();
//     fetchItemCategories();
//   }, [user]);

//     // Make the sender field read-only if user is employee
//     const isSenderFieldReadOnly = user?.role === 'EMPLOYEE';

//   const fetchExecutiveOfficers = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:9099/api/users/executive"
//       );
//       const officers = response.data.map((officer) => ({
//         name: `${officer.fullName} (${officer.serviceNumber})`,
//         value: officer.serviceNumber,
//       }));
//       setExecutiveOfficers(officers);
//     } catch (error) {
//       console.error("Error fetching executive officers:", error);
//       setResponseMessage("Failed to load executive officers");
//       setIsError(true);
//     }
//   };

//   const fetchItemCategories = async () => {
//     try {
//       const response = await axios.get(
//         "http://localhost:9099/api/item-categories/all"
//       );
//       const formattedCategories = response.data.map((category) => ({
//         id: category.id || category.categoryId,
//         name: category.name || category.categoryName,
//       }));
//       setItemCategories(formattedCategories);
//     } catch (error) {
//       console.error("Error fetching item categories:", error);
//       setResponseMessage("Failed to load item categories");
//       setIsError(true);
//     }
//   };

//   // Handle form field changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });
//   };

//   // Handle item field changes
//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...formData.items];
//     updatedItems[index][field] = value;
//     setFormData({
//       ...formData,
//       items: updatedItems,
//     });
//   };

//   // Handle image upload - updated for multiple files
//   const handleImageUpload = (itemIndex, e) => {
//     const files = Array.from(e.target.files);
//     const validFiles = [];
//     const invalidFiles = [];

//     // Validate each file
//     files.forEach((file) => {
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         invalidFiles.push(`${file.name} (exceeds ${MAX_FILE_SIZE_MB}MB limit)`);
//       } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         invalidFiles.push(`${file.name} (invalid file type)`);
//       } else {
//         validFiles.push(file);
//       }
//     });

//     // Show error message for invalid files
//     if (invalidFiles.length > 0) {
//       setResponseMessage(`Invalid files: ${invalidFiles.join(", ")}`);
//       setIsError(true);
//     }

//     // Only proceed with valid files
//     if (validFiles.length > 0) {
//       const updatedItems = [...formData.items];
//       const currentItem = updatedItems[itemIndex];

//       // Calculate remaining slots for new images
//       const remainingSlots = MAX_IMAGES_PER_ITEM - currentItem.images.length;
//       const filesToAdd = validFiles.slice(0, remainingSlots);

//       // Create previews for new files
//       const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

//       updatedItems[itemIndex] = {
//         ...currentItem,
//         images: [...currentItem.images, ...filesToAdd],
//         imagePreviews: [...currentItem.imagePreviews, ...newPreviews],
//       };

//       setFormData({
//         ...formData,
//         items: updatedItems,
//       });

//       if (validFiles.length > remainingSlots) {
//         setResponseMessage(
//           `Only ${remainingSlots} images added (max ${MAX_IMAGES_PER_ITEM} per item)`
//         );
//         setIsError(true);
//       }
//     }
//   };

//   // Remove an image from an item
//   const removeImage = (itemIndex, imageIndex) => {
//     const updatedItems = [...formData.items];
//     const currentItem = updatedItems[itemIndex];

//     // Revoke the object URL to prevent memory leaks
//     URL.revokeObjectURL(currentItem.imagePreviews[imageIndex]);

//     // Remove the image and preview
//     currentItem.images.splice(imageIndex, 1);
//     currentItem.imagePreviews.splice(imageIndex, 1);

//     setFormData({
//       ...formData,
//       items: updatedItems,
//     });
//   };

//   // Add new item
//   const addItem = () => {
//     setFormData({
//       ...formData,
//       items: [
//         ...formData.items,
//         {
//           categoryId: "",
//           itemName: "",
//           serialNumber: "",
//           description: "",
//           quantity: 1,
//           returnable: false,
//           dueDate: "",
//           images: [],
//           imagePreviews: [],
//         },
//       ],
//     });
//   };

//   // Remove item
//   const removeItem = (index) => {
//     const updatedItems = [...formData.items];

//     // Clean up object URLs for the item being removed
//     updatedItems[index].imagePreviews.forEach((preview) => {
//       URL.revokeObjectURL(preview);
//     });

//     updatedItems.splice(index, 1);
//     setFormData({
//       ...formData,
//       items: updatedItems,
//     });
//   };

//   // Submit form
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setResponseMessage("");
//     setIsError(false);

//     // Create FormData for multipart upload
//     const formDataToSend = new FormData();

//     // Prepare request data without files
//     const requestData = {
//       ...formData,
//       items: formData.items.map((item) => ({
//         ...item,
//         images: undefined, // Remove from JSON data
//         imagePreviews: undefined,
//       })),
//       executiveOfficerServiceNumber: formData.executiveOfficer,
//     };

//     // Add request data as JSON
//     formDataToSend.append(
//       "request",
//       new Blob([JSON.stringify(requestData)], {
//         type: "application/json",
//       })
//     );

//     // Add all image files
//     formData.items.forEach((item, itemIndex) => {
//       item.images.forEach((file, fileIndex) => {
//         formDataToSend.append(
//           "itemImages",
//           file,
//           `item_${itemIndex}_image_${fileIndex}`
//         );
//       });
//     });

//     try {
//       const response = await axios.post(
//         "http://localhost:9099/api/gatepass/create",
//         formDataToSend,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       setResponseMessage("Gate pass created successfully!");
//       setIsError(false);

//       // Reset form
//       setFormData({
//         senderServiceNumber: "",
//         receiverServiceNumber: "",
//         executiveOfficer: "",
//         outLocation: "",
//         inLocation: "",
//         items: [
//           {
//             categoryId: "",
//             itemName: "",
//             serialNumber: "",
//             description: "",
//             quantity: 1,
//             returnable: false,
//             dueDate: "",
//             images: [],
//             imagePreviews: [],
//           },
//         ],
//       });
//     } catch (error) {
//       setIsError(true);
//       setResponseMessage(
//         error.response?.data?.message ||
//           error.response?.data ||
//           "An error occurred during submission"
//       );
//       console.error(
//         "Error submitting form:",
//         error.response?.data || error.message
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//   className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
//   style={{
//     backgroundImage: `url(${backgroundImage})`,
//     backgroundSize: "cover",
//     backgroundPosition: "center",
//     backgroundRepeat: "no-repeat"
//   }}
// >
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="max-w-4xl mx-auto"
//       >
//         <div className="text-center mb-8">
//           <motion.h1
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.2 }}
//             className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
//           >
//             Create Gate Pass Request
//           </motion.h1>
//           <motion.p
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//             className="mt-3 text-xl text-gray-600"
//           >
//             Fill out the form below to request a gate pass
//           </motion.p>
//         </div>

//         {responseMessage && (
//           <motion.div
//             initial={{ opacity: 0, y: -10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className={`mb-6 p-4 rounded-lg shadow-sm ${
//               isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
//             }`}
//           >
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 {isError ? (
//                   <svg
//                     className="h-5 w-5 text-red-400"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 ) : (
//                   <svg
//                     className="h-5 w-5 text-green-400"
//                     fill="currentColor"
//                     viewBox="0 0 20 20"
//                   >
//                     <path
//                       fillRule="evenodd"
//                       d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                       clipRule="evenodd"
//                     />
//                   </svg>
//                 )}
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm font-medium">{responseMessage}</p>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <motion.form
//           onSubmit={handleSubmit}
//           initial="hidden"
//           animate="visible"
//           variants={containerVariants}
//           className="bg-white shadow-xl rounded-lg p-6 sm:p-8"
//         >
//           <div className="space-y-6">
//             <motion.div
//               variants={itemVariants}
//               className="grid grid-cols-1 md:grid-cols-2 gap-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Sender Service Number
//                 </label>
//                 <input
//         type="text"
//         name="senderServiceNumber"
//         value={formData.senderServiceNumber}
//         onChange={handleInputChange}
//         className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//         required
//         readOnly={isSenderFieldReadOnly}
//         style={isSenderFieldReadOnly ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
//       />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Receiver Service Number
//                 </label>
//                 <input
//                   type="text"
//                   name="receiverServiceNumber"
//                   value={formData.receiverServiceNumber}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                 />
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Executive Officer
//               </label>
//               <select
//                 name="executiveOfficer"
//                 value={formData.executiveOfficer}
//                 onChange={handleInputChange}
//                 className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                 required
//               >
//                 <option value="">Select Executive Officer</option>
//                 {executiveOfficers.map((officer, index) => (
//                   <option key={index} value={officer.value}>
//                     {officer.name}
//                   </option>
//                 ))}
//               </select>
//             </motion.div>

//             <motion.div
//               variants={itemVariants}
//               className="grid grid-cols-1 md:grid-cols-2 gap-6"
//             >
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Out Location
//                 </label>
//                 <input
//                   type="text"
//                   name="outLocation"
//                   value={formData.outLocation}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   In Location
//                 </label>
//                 <input
//                   type="text"
//                   name="inLocation"
//                   value={formData.inLocation}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                 />
//               </div>
//             </motion.div>

//             <motion.div
//               variants={itemVariants}
//               className="border-t border-gray-200 pt-6"
//             >
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-medium text-gray-900">Items</h2>
//                 <motion.button
//                   type="button"
//                   onClick={addItem}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   <svg
//                     className="-ml-0.5 mr-2 h-4 w-4"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M12 6v6m0 0v6m0-6h6m-6 0H6"
//                     />
//                   </svg>
//                   Add Item
//                 </motion.button>
//               </div>

//               <div className="space-y-4">
//                 {formData.items.map((item, index) => (
//                   <motion.div
//                     key={index}
//                     variants={itemVariants}
//                     className="border rounded-lg p-4 bg-gray-50 shadow-sm"
//                   >
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="font-medium text-gray-900">
//                         Item #{index + 1}
//                       </h3>
//                       {formData.items.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeItem(index)}
//                           className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
//                         >
//                           Remove Item
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Category
//                         </label>
//                         <select
//                           value={item.categoryId}
//                           onChange={(e) =>
//                             handleItemChange(
//                               index,
//                               "categoryId",
//                               e.target.value
//                             )
//                           }
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         >
//                           <option value="">Select Category</option>
//                           {itemCategories.map((category) => (
//                             <option key={category.id} value={category.id}>
//                               {category.name}
//                             </option>
//                           ))}
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Item Name
//                         </label>
//                         <input
//                           type="text"
//                           value={item.itemName}
//                           onChange={(e) =>
//                             handleItemChange(index, "itemName", e.target.value)
//                           }
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Serial Number
//                         </label>
//                         <input
//                           type="text"
//                           value={item.serialNumber}
//                           onChange={(e) =>
//                             handleItemChange(
//                               index,
//                               "serialNumber",
//                               e.target.value
//                             )
//                           }
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Quantity
//                         </label>
//                         <input
//                           type="number"
//                           min="1"
//                           value={item.quantity}
//                           onChange={(e) =>
//                             handleItemChange(
//                               index,
//                               "quantity",
//                               parseInt(e.target.value)
//                             )
//                           }
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Description
//                         </label>
//                         <textarea
//                           value={item.description}
//                           onChange={(e) =>
//                             handleItemChange(
//                               index,
//                               "description",
//                               e.target.value
//                             )
//                           }
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           rows="2"
//                         />
//                       </div>
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           id={`returnable-${index}`}
//                           checked={item.returnable}
//                           onChange={(e) =>
//                             handleItemChange(
//                               index,
//                               "returnable",
//                               e.target.checked
//                             )
//                           }
//                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                         <label
//                           htmlFor={`returnable-${index}`}
//                           className="ml-2 block text-sm text-gray-700"
//                         >
//                           Returnable
//                         </label>
//                       </div>
//                       {item.returnable && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Due Date
//                           </label>
//                           <input
//                             type="date"
//                             value={item.dueDate}
//                             onChange={(e) =>
//                               handleItemChange(index, "dueDate", e.target.value)
//                             }
//                             className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                             required
//                           />
//                         </div>
//                       )}
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Item Images (Max {MAX_IMAGES_PER_ITEM})
//                         </label>
//                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                           <div className="space-y-1 text-center">
//                             <svg
//                               className="mx-auto h-12 w-12 text-gray-400"
//                               stroke="currentColor"
//                               fill="none"
//                               viewBox="0 0 48 48"
//                               aria-hidden="true"
//                             >
//                               <path
//                                 d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                                 strokeWidth="2"
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                               />
//                             </svg>
//                             <div className="flex text-sm text-gray-600">
//                               <label
//                                 htmlFor={`file-upload-${index}`}
//                                 className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
//                                   item.images.length >= MAX_IMAGES_PER_ITEM
//                                     ? "opacity-50 cursor-not-allowed"
//                                     : ""
//                                 }`}
//                               >
//                                 <span>Upload files</span>
//                                 <input
//                                   id={`file-upload-${index}`}
//                                   name={`file-upload-${index}`}
//                                   type="file"
//                                   accept="image/*"
//                                   multiple
//                                   onChange={(e) => handleImageUpload(index, e)}
//                                   className="sr-only"
//                                   disabled={
//                                     item.images.length >= MAX_IMAGES_PER_ITEM
//                                   }
//                                 />
//                               </label>
//                               <p className="pl-1">or drag and drop</p>
//                             </div>
//                             <p className="text-xs text-gray-500">
//                               PNG, JPG, GIF up to {MAX_FILE_SIZE_MB}MB
//                             </p>
//                           </div>
//                         </div>
//                         {item.imagePreviews.length > 0 && (
//                           <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
//                             {item.imagePreviews.map((preview, imgIndex) => (
//                               <div key={imgIndex} className="relative group">
//                                 <img
//                                   src={preview}
//                                   alt={`Preview ${imgIndex}`}
//                                   className="h-24 w-full object-cover rounded-md border border-gray-200"
//                                 />
//                                 <button
//                                   type="button"
//                                   onClick={() => removeImage(index, imgIndex)}
//                                   className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//                                 >
//                                   ×
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div
//               variants={itemVariants}
//               className="flex justify-center pt-4"
//             >
//               <motion.button
//                 type="submit"
//                 disabled={isLoading}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className={`w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
//                   isLoading ? "opacity-70 cursor-not-allowed" : ""
//                 }`}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <svg
//                       className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                       xmlns="http://www.w3.org/2000/svg"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                     >
//                       <circle
//                         className="opacity-25"
//                         cx="12"
//                         cy="12"
//                         r="10"
//                         stroke="currentColor"
//                         strokeWidth="4"
//                       ></circle>
//                       <path
//                         className="opacity-75"
//                         fill="currentColor"
//                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                       ></path>
//                     </svg>
//                     Processing...
//                   </div>
//                 ) : (
//                   "Create Gate Pass"
//                 )}
//               </motion.button>
//             </motion.div>
//           </div>
//         </motion.form>
//       </motion.div>
//     </div>
//   );
// };

// export default GatePassForm;
////33333333333

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { useAuth } from '../context/AuthContext';
// import backgroundImage from '../assets/bgimage.jpg';

// const GatePassForm = () => {
//   const { user } = useAuth();
//   const MAX_IMAGES_PER_ITEM = 3;
//   const MAX_FILE_SIZE_MB = 5;
//   const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
//   const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

//   const [formData, setFormData] = useState({
//     senderServiceNumber: user?.serviceNumber || "",
//     receiverServiceNumber: "",
//     executiveOfficerServiceNumber: "",
//     outLocation: "",
//     inLocation: "",
//     transportMode: "BY_HAND",
//     isSlt: true,
//     serviceNumber: "",
//     transporterName: "",
//     phoneNumber: "",
//     nic: "",
//     email: "",
//     vehicleNumber: "",
//     vehicleModel: "",
//     items: [{
//       categoryId: "",
//       itemName: "",
//       serialNumber: "",
//       description: "",
//       quantity: 1,
//       returnable: false,
//       dueDate: "",
//       images: [],
//       imagePreviews: [],
//     }],
//   });

//   const [executiveOfficers, setExecutiveOfficers] = useState([]);
//   const [itemCategories, setItemCategories] = useState([]);
//   const [responseMessage, setResponseMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);

//   const containerVariants = {
//     hidden: { opacity: 0 },
//     visible: { opacity: 1, transition: { staggerChildren: 0.1, when: "beforeChildren" } },
//   };

//   const itemVariants = {
//     hidden: { y: 20, opacity: 0 },
//     visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
//   };

//   useEffect(() => {
//     if (!user) {
//       window.location.href = '/login';
//       return;
//     }

//     if (user.role === 'EMPLOYEE') {
//       setFormData(prev => ({ ...prev, senderServiceNumber: user.serviceNumber }));
//     }

//     fetchExecutiveOfficers();
//     fetchItemCategories();
//   }, [user]);

//   const isSenderFieldReadOnly = user?.role === 'EMPLOYEE';

//   const getAuthHeaders = () => {
//     const token = localStorage.getItem('token');
//     return token ? { Authorization: `Bearer ${token}` } : {};
//   };

//   const fetchExecutiveOfficers = async () => {
//     try {
//       const response = await axios.get("http://localhost:9077/api/users/executives", {
//         headers: getAuthHeaders(),
//       });
//       setExecutiveOfficers(response.data.map(officer => ({
//         name: `${officer.fullName} (${officer.serviceNumber})`,
//         value: officer.serviceNumber,
//       })));
//     } catch (error) {
//       console.error("Error fetching executive officers:", error);
//       setResponseMessage("Failed to load executive officers");
//       setIsError(true);
//     }
//   };

//   const fetchItemCategories = async () => {
//     try {
//       const response = await axios.get("http://localhost:9077/api/item-categories/all", {
//         headers: getAuthHeaders(),
//       });
//       setItemCategories(response.data.map(category => ({
//         id: category.categoryId,
//         name: category.categoryName,
//       })));
//     } catch (error) {
//       console.error("Error fetching item categories:", error);
//       setResponseMessage("Failed to load item categories");
//       setIsError(true);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleTransportModeChange = (e) => {
//     const mode = e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       transportMode: mode,
//       isSlt: mode === "BY_HAND" ? prev.isSlt : null,
//       serviceNumber: mode === "BY_HAND" ? prev.serviceNumber : "",
//       transporterName: mode === "BY_HAND" ? prev.transporterName : "",
//       phoneNumber: mode === "BY_HAND" ? prev.phoneNumber : "",
//       nic: mode === "BY_HAND" ? prev.nic : "",
//       email: mode === "BY_HAND" ? prev.email : "",
//       vehicleNumber: mode === "BY_VEHICLE" ? prev.vehicleNumber : "",
//       vehicleModel: mode === "BY_VEHICLE" ? prev.vehicleModel : "",
//     }));
//   };

//   const handleSltChange = (e) => {
//     const isSlt = e.target.value === "true";
//     setFormData(prev => ({
//       ...prev,
//       isSlt,
//       serviceNumber: isSlt ? prev.serviceNumber : "",
//       transporterName: !isSlt ? prev.transporterName : "",
//       phoneNumber: !isSlt ? prev.phoneNumber : "",
//       nic: !isSlt ? prev.nic : "",
//       email: !isSlt ? prev.email : "",
//     }));
//   };

//   const handleItemChange = (index, field, value) => {
//     const updatedItems = [...formData.items];
//     updatedItems[index][field] = value;
//     setFormData({ ...formData, items: updatedItems });
//   };

//   const handleImageUpload = (itemIndex, e) => {
//     const files = Array.from(e.target.files);
//     const validFiles = [];
//     const invalidFiles = [];

//     files.forEach(file => {
//       if (file.size > MAX_FILE_SIZE_BYTES) {
//         invalidFiles.push(`${file.name} (exceeds ${MAX_FILE_SIZE_MB}MB limit)`);
//       } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
//         invalidFiles.push(`${file.name} (invalid file type)`);
//       } else {
//         validFiles.push(file);
//       }
//     });

//     if (invalidFiles.length > 0) {
//       setResponseMessage(`Invalid files: ${invalidFiles.join(", ")}`);
//       setIsError(true);
//     }

//     if (validFiles.length > 0) {
//       const updatedItems = [...formData.items];
//       const currentItem = updatedItems[itemIndex];
//       const remainingSlots = MAX_IMAGES_PER_ITEM - currentItem.images.length;
//       const filesToAdd = validFiles.slice(0, remainingSlots);
//       const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));

//       updatedItems[itemIndex] = {
//         ...currentItem,
//         images: [...currentItem.images, ...filesToAdd],
//         imagePreviews: [...currentItem.imagePreviews, ...newPreviews],
//       };

//       setFormData({ ...formData, items: updatedItems });

//       if (validFiles.length > remainingSlots) {
//         setResponseMessage(`Only ${remainingSlots} images added (max ${MAX_IMAGES_PER_ITEM} per item)`);
//         setIsError(true);
//       }
//     }
//   };

//   const removeImage = (itemIndex, imageIndex) => {
//     const updatedItems = [...formData.items];
//     const currentItem = updatedItems[itemIndex];
//     URL.revokeObjectURL(currentItem.imagePreviews[imageIndex]);
//     currentItem.images.splice(imageIndex, 1);
//     currentItem.imagePreviews.splice(imageIndex, 1);
//     setFormData({ ...formData, items: updatedItems });
//   };

//   const addItem = () => {
//     setFormData({
//       ...formData,
//       items: [...formData.items, {
//         categoryId: "",
//         itemName: "",
//         serialNumber: "",
//         description: "",
//         quantity: 1,
//         returnable: false,
//         dueDate: "",
//         images: [],
//         imagePreviews: [],
//       }],
//     });
//   };

//   const removeItem = (index) => {
//     const updatedItems = [...formData.items];
//     updatedItems[index].imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
//     updatedItems.splice(index, 1);
//     setFormData({ ...formData, items: updatedItems });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setResponseMessage("");
//     setIsError(false);

//     const formDataToSend = new FormData();
//     const requestData = {
//       ...formData,
//       items: formData.items.map(item => ({
//         ...item,
//         images: undefined,
//         imagePreviews: undefined,
//       })),
//     };

//     formDataToSend.append("request", new Blob([JSON.stringify(requestData)], { type: "application/json" }));

//     formData.items.forEach((item, itemIndex) => {
//       item.images.forEach((file, fileIndex) => {
//         formDataToSend.append("itemImages", file, `item_${itemIndex}_image_${fileIndex}`);
//       });
//     });

//     try {
//       const response = await axios.post("http://localhost:9077/api/gatepass/create", formDataToSend, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           ...getAuthHeaders(),
//         },
//       });

//       setResponseMessage(response.data);
//       setIsError(false);

//       setFormData({
//         senderServiceNumber: user?.role === 'EMPLOYEE' ? user.serviceNumber : "",
//         receiverServiceNumber: "",
//         executiveOfficerServiceNumber: "",
//         outLocation: "",
//         inLocation: "",
//         transportMode: "BY_HAND",
//         isSlt: true,
//         serviceNumber: "",
//         transporterName: "",
//         phoneNumber: "",
//         nic: "",
//         email: "",
//         vehicleNumber: "",
//         vehicleModel: "",
//         items: [{
//           categoryId: "",
//           itemName: "",
//           serialNumber: "",
//           description: "",
//           quantity: 1,
//           returnable: false,
//           dueDate: "",
//           images: [],
//           imagePreviews: [],
//         }],
//       });
//     } catch (error) {
//       setIsError(true);
//       setResponseMessage(error.response?.data || "An error occurred during submission");
//       console.error("Error submitting form:", error.response?.data || error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8" style={{
//       backgroundImage: `url(${backgroundImage})`,
//       backgroundSize: "cover",
//       backgroundPosition: "center",
//       backgroundRepeat: "no-repeat"
//     }}>
//       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto">
//         <div className="text-center mb-8">
//           <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
//             Create Gate Pass Request
//           </motion.h1>
//           <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-3 text-xl text-gray-600">
//             Fill out the form below to request a gate pass
//           </motion.p>
//         </div>

//         {responseMessage && (
//           <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-lg shadow-sm ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
//             <div className="flex items-center">
//               <div className="flex-shrink-0">
//                 {isError ? (
//                   <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                   </svg>
//                 ) : (
//                   <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
//                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
//                   </svg>
//                 )}
//               </div>
//               <div className="ml-3">
//                 <p className="text-sm font-medium">{responseMessage}</p>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         <motion.form onSubmit={handleSubmit} initial="hidden" animate="visible" variants={containerVariants} className="bg-white shadow-xl rounded-lg p-6 sm:p-8">
//           <div className="space-y-6">
//             <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Sender Service Number</label>
//                 <input
//                   type="text"
//                   name="senderServiceNumber"
//                   value={formData.senderServiceNumber}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                   readOnly={isSenderFieldReadOnly}
//                   style={isSenderFieldReadOnly ? { backgroundColor: '#f3f4f6', cursor: 'not-allowed' } : {}}
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Service Number</label>
//                 <input
//                   type="text"
//                   name="receiverServiceNumber"
//                   value={formData.receiverServiceNumber}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                 />
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants}>
//               <label className="block text-sm font-medium text-gray-700 mb-1">Executive Officer</label>
//               <select
//                 name="executiveOfficerServiceNumber"
//                 value={formData.executiveOfficerServiceNumber}
//                 onChange={handleInputChange}
//                 className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                 required
//               >
//                 <option value="">Select Executive Officer</option>
//                 {executiveOfficers.map((officer, index) => (
//                   <option key={index} value={officer.value}>{officer.name}</option>
//                 ))}
//               </select>
//             </motion.div>

//             <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">Out Location</label>
//                 <input
//                   type="text"
//                   name="outLocation"
//                   value={formData.outLocation}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">In Location</label>
//                 <input
//                   type="text"
//                   name="inLocation"
//                   value={formData.inLocation}
//                   onChange={handleInputChange}
//                   className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                   required
//                 />
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants} className="border-t border-gray-200 pt-6">
//               <h2 className="text-lg font-medium text-gray-900 mb-4">Transportation Details</h2>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Transport Mode</label>
//                   <select
//                     name="transportMode"
//                     value={formData.transportMode}
//                     onChange={handleTransportModeChange}
//                     className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                     required
//                   >
//                     <option value="BY_HAND">By Hand</option>
//                     <option value="BY_VEHICLE">By Vehicle</option>
//                   </select>
//                 </div>

//                 {formData.transportMode === "BY_HAND" && (
//                   <>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">SLT/Non-SLT</label>
//                       <select
//                         name="isSlt"
//                         value={formData.isSlt}
//                         onChange={handleSltChange}
//                         className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                         required
//                       >
//                         <option value={true}>SLT</option>
//                         <option value={false}>Non-SLT</option>
//                       </select>
//                     </div>

//                     {formData.isSlt ? (
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">SLT Transporter Service Number</label>
//                         <input
//                           type="text"
//                           name="serviceNumber"
//                           value={formData.serviceNumber}
//                           onChange={handleInputChange}
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                     ) : (
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Transporter Name</label>
//                           <input
//                             type="text"
//                             name="transporterName"
//                             value={formData.transporterName}
//                             onChange={handleInputChange}
//                             className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
//                           <input
//                             type="text"
//                             name="phoneNumber"
//                             value={formData.phoneNumber}
//                             onChange={handleInputChange}
//                             className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">NIC</label>
//                           <input
//                             type="text"
//                             name="nic"
//                             value={formData.nic}
//                             onChange={handleInputChange}
//                             className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                           <input
//                             type="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                             required
//                           />
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {formData.transportMode === "BY_VEHICLE" && (
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Number</label>
//                       <input
//                         type="text"
//                         name="vehicleNumber"
//                         value={formData.vehicleNumber}
//                         onChange={handleInputChange}
//                         className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                         required
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Model</label>
//                       <input
//                         type="text"
//                         name="vehicleModel"
//                         value={formData.vehicleModel}
//                         onChange={handleInputChange}
//                         className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                         required
//                       />
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants} className="border-t border-gray-200 pt-6">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-lg font-medium text-gray-900">Items</h2>
//                 <motion.button
//                   type="button"
//                   onClick={addItem}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                 >
//                   <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                   </svg>
//                   Add Item
//                 </motion.button>
//               </div>

//               <div className="space-y-4">
//                 {formData.items.map((item, index) => (
//                   <motion.div key={index} variants={itemVariants} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="font-medium text-gray-900">Item #{index + 1}</h3>
//                       {formData.items.length > 1 && (
//                         <button
//                           type="button"
//                           onClick={() => removeItem(index)}
//                           className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
//                         >
//                           Remove Item
//                         </button>
//                       )}
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
//                         <select
//                           value={item.categoryId}
//                           onChange={(e) => handleItemChange(index, "categoryId", e.target.value)}
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         >
//                           <option value="">Select Category</option>
//                           {itemCategories.map(category => (
//                             <option key={category.id} value={category.id}>{category.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
//                         <input
//                           type="text"
//                           value={item.itemName}
//                           onChange={(e) => handleItemChange(index, "itemName", e.target.value)}
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
//                         <input
//                           type="text"
//                           value={item.serialNumber}
//                           onChange={(e) => handleItemChange(index, "serialNumber", e.target.value)}
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
//                         <input
//                           type="number"
//                           min="1"
//                           value={item.quantity}
//                           onChange={(e) => handleItemChange(index, "quantity", parseInt(e.target.value))}
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           required
//                         />
//                       </div>
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                         <textarea
//                           value={item.description}
//                           onChange={(e) => handleItemChange(index, "description", e.target.value)}
//                           className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                           rows="2"
//                         />
//                       </div>
//                       <div className="flex items-center">
//                         <input
//                           type="checkbox"
//                           id={`returnable-${index}`}
//                           checked={item.returnable}
//                           onChange={(e) => handleItemChange(index, "returnable", e.target.checked)}
//                           className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                         />
//                         <label htmlFor={`returnable-${index}`} className="ml-2 block text-sm text-gray-700">
//                           Returnable
//                         </label>
//                       </div>
//                       {item.returnable && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
//                           <input
//                             type="date"
//                             value={item.dueDate}
//                             onChange={(e) => handleItemChange(index, "dueDate", e.target.value)}
//                             className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
//                             required
//                           />
//                         </div>
//                       )}
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Item Images (Max {MAX_IMAGES_PER_ITEM})</label>
//                         <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                           <div className="space-y-1 text-center">
//                             <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
//                               <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//                             </svg>
//                             <div className="flex text-sm text-gray-600">
//                               <label
//                                 htmlFor={`file-upload-${index}`}
//                                 className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${item.images.length >= MAX_IMAGES_PER_ITEM ? "opacity-50 cursor-not-allowed" : ""}`}
//                               >
//                                 <span>Upload files</span>
//                                 <input
//                                   id={`file-upload-${index}`}
//                                   name={`file-upload-${index}`}
//                                   type="file"
//                                   accept="image/*"
//                                   multiple
//                                   onChange={(e) => handleImageUpload(index, e)}
//                                   className="sr-only"
//                                   disabled={item.images.length >= MAX_IMAGES_PER_ITEM}
//                                 />
//                               </label>
//                               <p className="pl-1">or drag and drop</p>
//                             </div>
//                             <p className="text-xs text-gray-500">PNG, JPG, GIF up to {MAX_FILE_SIZE_MB}MB</p>
//                           </div>
//                         </div>
//                         {item.imagePreviews.length > 0 && (
//                           <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
//                             {item.imagePreviews.map((preview, imgIndex) => (
//                               <div key={imgIndex} className="relative group">
//                                 <img src={preview} alt={`Preview ${imgIndex}`} className="h-24 w-full object-cover rounded-md border border-gray-200" />
//                                 <button
//                                   type="button"
//                                   onClick={() => removeImage(index, imgIndex)}
//                                   className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//                                 >
//                                   ×
//                                 </button>
//                               </div>
//                             ))}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>
//             </motion.div>

//             <motion.div variants={itemVariants} className="flex justify-center pt-4">
//               <motion.button
//                 type="submit"
//                 disabled={isLoading}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className={`w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
//               >
//                 {isLoading ? (
//                   <div className="flex items-center justify-center">
//                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                     </svg>
//                     Processing...
//                   </div>
//                 ) : (
//                   "Create Gate Pass"
//                 )}
//               </motion.button>
//             </motion.div>
//           </div>
//         </motion.form>
//       </motion.div>
//     </div>
//   );
// };

// export default GatePassForm;

"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import backgroundImage from "../assets/bgimage.jpg";

const GatePassForm = () => {
  const { user } = useAuth();
  const MAX_IMAGES_PER_ITEM = 3;
  const MAX_FILE_SIZE_MB = 5;
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
  const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif"];

  const [formData, setFormData] = useState({
    senderServiceNumber: user?.serviceNumber || "",
    receiverServiceNumber: "",
    executiveOfficerServiceNumber: "",
    outLocationId: "",
    inLocationId: "",
    transportMode: "BY_HAND",
    isSlt: true,
    serviceNumber: "",
    transporterName: "",
    phoneNumber: "",
    nic: "",
    email: "",
    vehicleNumber: "",
    vehicleModel: "",
    items: [
      {
        categoryId: "",
        itemName: "",
        serialNumber: "",
        description: "",
        quantity: 1,
        returnable: false,
        dueDate: "",
        images: [],
        imagePreviews: [],
      },
    ],
  });

  const [executiveOfficers, setExecutiveOfficers] = useState([]);
  const [itemCategories, setItemCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [responseMessage, setResponseMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  useEffect(() => {
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (user.role === "EMPLOYEE") {
      setFormData((prev) => ({
        ...prev,
        senderServiceNumber: user.serviceNumber,
      }));
    }
    fetchExecutiveOfficers();
    fetchItemCategories();
    fetchLocations();
  }, [user]);

  const isSenderFieldReadOnly = user?.role === "EMPLOYEE";

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchExecutiveOfficers = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9077/api/users/executives",
        {
          headers: getAuthHeaders(),
        }
      );
      setExecutiveOfficers(
        response.data.map((officer) => ({
          name: `${officer.fullName} (${officer.serviceNumber})`,
          value: officer.serviceNumber,
        }))
      );
    } catch (error) {
      console.error("Error fetching executive officers:", error);
      setResponseMessage("Failed to load executive officers");
      setIsError(true);
    }
  };

  const fetchItemCategories = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9077/api/item-categories/all",
        {
          headers: getAuthHeaders(),
        }
      );
      setItemCategories(
        response.data.map((category) => ({
          id: category.categoryId,
          name: category.categoryName,
        }))
      );
    } catch (error) {
      console.error("Error fetching item categories:", error);
      setResponseMessage("Failed to load item categories");
      setIsError(true);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9077/api/locations/all",
        {
          headers: getAuthHeaders(),
        }
      );
      setLocations(
        response.data.map((location) => ({
          id: location.locationId,
          name: location.locationName,
        }))
      );
    } catch (error) {
      console.error("Error fetching locations:", error);
      setResponseMessage("Failed to load locations");
      setIsError(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTransportModeChange = (e) => {
    const mode = e.target.value;
    setFormData((prev) => ({
      ...prev,
      transportMode: mode,
      isSlt: mode === "BY_HAND" ? prev.isSlt : null,
      serviceNumber: mode === "BY_HAND" ? prev.serviceNumber : "",
      transporterName: mode === "BY_HAND" ? prev.transporterName : "",
      phoneNumber: mode === "BY_HAND" ? prev.phoneNumber : "",
      nic: mode === "BY_HAND" ? prev.nic : "",
      email: mode === "BY_HAND" ? prev.email : "",
      vehicleNumber: mode === "BY_VEHICLE" ? prev.vehicleNumber : "",
      vehicleModel: mode === "BY_VEHICLE" ? prev.vehicleModel : "",
    }));
  };

  const handleSltChange = (e) => {
    const isSlt = e.target.value === "true";
    setFormData((prev) => ({
      ...prev,
      isSlt,
      serviceNumber: isSlt ? prev.serviceNumber : "",
      transporterName: !isSlt ? prev.transporterName : "",
      phoneNumber: !isSlt ? prev.phoneNumber : "",
      nic: !isSlt ? prev.nic : "",
      email: !isSlt ? prev.email : "",
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData({ ...formData, items: updatedItems });
  };

  const handleImageUpload = (itemIndex, e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        invalidFiles.push(`${file.name} (exceeds ${MAX_FILE_SIZE_MB}MB limit)`);
      } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        invalidFiles.push(`${file.name} (invalid file type)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setResponseMessage(`Invalid files: ${invalidFiles.join(", ")}`);
      setIsError(true);
    }

    if (validFiles.length > 0) {
      const updatedItems = [...formData.items];
      const currentItem = updatedItems[itemIndex];
      const remainingSlots = MAX_IMAGES_PER_ITEM - currentItem.images.length;
      const filesToAdd = validFiles.slice(0, remainingSlots);
      const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

      updatedItems[itemIndex] = {
        ...currentItem,
        images: [...currentItem.images, ...filesToAdd],
        imagePreviews: [...currentItem.imagePreviews, ...newPreviews],
      };

      setFormData({ ...formData, items: updatedItems });

      if (validFiles.length > remainingSlots) {
        setResponseMessage(
          `Only ${remainingSlots} images added (max ${MAX_IMAGES_PER_ITEM} per item)`
        );
        setIsError(true);
      }
    }
  };

  const removeImage = (itemIndex, imageIndex) => {
    const updatedItems = [...formData.items];
    const currentItem = updatedItems[itemIndex];
    URL.revokeObjectURL(currentItem.imagePreviews[imageIndex]);
    currentItem.images.splice(imageIndex, 1);
    currentItem.imagePreviews.splice(imageIndex, 1);
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          categoryId: "",
          itemName: "",
          serialNumber: "",
          description: "",
          quantity: 1,
          returnable: false,
          dueDate: "",
          images: [],
          imagePreviews: [],
        },
      ],
    });
  };

  const removeItem = (index) => {
    const updatedItems = [...formData.items];
    updatedItems[index].imagePreviews.forEach((preview) =>
      URL.revokeObjectURL(preview)
    );
    updatedItems.splice(index, 1);
    setFormData({ ...formData, items: updatedItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResponseMessage("");
    setIsError(false);

    // Validate required fields
    if (!formData.outLocationId || !formData.inLocationId) {
      setIsError(true);
      setResponseMessage("Please select both out and in locations");
      setIsLoading(false);
      return;
    }

    const formDataToSend = new FormData();

    // Prepare request data with proper field names matching backend DTO
    const requestData = {
      senderServiceNumber: formData.senderServiceNumber,
      receiverServiceNumber: formData.receiverServiceNumber,
      executiveOfficerServiceNumber: formData.executiveOfficerServiceNumber,
      outLocationId: Number.parseInt(formData.outLocationId),
      inLocationId: Number.parseInt(formData.inLocationId),
      transportMode: formData.transportMode,
      isSlt: formData.isSlt,
      serviceNumber: formData.serviceNumber,
      transporterName: formData.transporterName,
      phoneNumber: formData.phoneNumber,
      nic: formData.nic,
      email: formData.email,
      vehicleNumber: formData.vehicleNumber,
      vehicleModel: formData.vehicleModel,
      items: formData.items.map((item) => ({
        categoryId: Number.parseInt(item.categoryId),
        itemName: item.itemName,
        serialNumber: item.serialNumber,
        description: item.description,
        quantity: Number.parseInt(item.quantity),
        returnable: item.returnable,
        dueDate: item.dueDate || null,
      })),
    };

    formDataToSend.append(
      "request",
      new Blob([JSON.stringify(requestData)], {
        type: "application/json",
      })
    );

    // Add images
    formData.items.forEach((item, itemIndex) => {
      item.images.forEach((file, fileIndex) => {
        formDataToSend.append(
          "itemImages",
          file,
          `item_${itemIndex}_image_${fileIndex}`
        );
      });
    });

    try {
      const response = await axios.post(
        "http://localhost:9077/api/gatepass/create",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...getAuthHeaders(),
          },
        }
      );

      setResponseMessage(response.data);
      setIsError(false);

      // Reset form
      setFormData({
        senderServiceNumber:
          user?.role === "EMPLOYEE" ? user.serviceNumber : "",
        receiverServiceNumber: "",
        executiveOfficerServiceNumber: "",
        outLocationId: "",
        inLocationId: "",
        transportMode: "BY_HAND",
        isSlt: true,
        serviceNumber: "",
        transporterName: "",
        phoneNumber: "",
        nic: "",
        email: "",
        vehicleNumber: "",
        vehicleModel: "",
        items: [
          {
            categoryId: "",
            itemName: "",
            serialNumber: "",
            description: "",
            quantity: 1,
            returnable: false,
            dueDate: "",
            images: [],
            imagePreviews: [],
          },
        ],
      });
    } catch (error) {
      setIsError(true);
      setResponseMessage(
        error.response?.data || "An error occurred during submission"
      );
      console.error(
        "Error submitting form:",
        error.response?.data || error.message
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
          >
            Create Gate Pass Request
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-xl text-gray-600"
          >
            Fill out the form below to request a gate pass
          </motion.p>
        </div>

        {responseMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg shadow-sm ${
              isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {isError ? (
                  <svg
                    className="h-5 w-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5 text-green-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{responseMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="bg-white shadow-xl rounded-lg p-6 sm:p-8"
        >
          <div className="space-y-6">
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Service Number
                </label>
                <input
                  type="text"
                  name="senderServiceNumber"
                  value={formData.senderServiceNumber}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                  readOnly={isSenderFieldReadOnly}
                  style={
                    isSenderFieldReadOnly
                      ? { backgroundColor: "#f3f4f6", cursor: "not-allowed" }
                      : {}
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Service Number
                </label>
                <input
                  type="text"
                  name="receiverServiceNumber"
                  value={formData.receiverServiceNumber}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Executive Officer
              </label>
              <select
                name="executiveOfficerServiceNumber"
                value={formData.executiveOfficerServiceNumber}
                onChange={handleInputChange}
                className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                required
              >
                <option value="">Select Executive Officer</option>
                {executiveOfficers.map((officer, index) => (
                  <option key={index} value={officer.value}>
                    {officer.name}
                  </option>
                ))}
              </select>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Out Location
                </label>
                <select
                  name="outLocationId"
                  value={formData.outLocationId}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                >
                  <option value="">Select Out Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  In Location
                </label>
                <select
                  name="inLocationId"
                  value={formData.inLocationId}
                  onChange={handleInputChange}
                  className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  required
                >
                  <option value="">Select In Location</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="border-t border-gray-200 pt-6"
            >
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Transportation Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transport Mode
                  </label>
                  <select
                    name="transportMode"
                    value={formData.transportMode}
                    onChange={handleTransportModeChange}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    required
                  >
                    <option value="BY_HAND">By Hand</option>
                    <option value="BY_VEHICLE">By Vehicle</option>
                  </select>
                </div>

                {formData.transportMode === "BY_HAND" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SLT/Non-SLT
                      </label>
                      <select
                        name="isSlt"
                        value={formData.isSlt}
                        onChange={handleSltChange}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        required
                      >
                        <option value={true}>SLT</option>
                        <option value={false}>Non-SLT</option>
                      </select>
                    </div>
                    {formData.isSlt ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          SLT Transporter Service Number
                        </label>
                        <input
                          type="text"
                          name="serviceNumber"
                          value={formData.serviceNumber}
                          onChange={handleInputChange}
                          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                          required
                        />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Transporter Name
                          </label>
                          <input
                            type="text"
                            name="transporterName"
                            value={formData.transporterName}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="text"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            NIC
                          </label>
                          <input
                            type="text"
                            name="nic"
                            value={formData.nic}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {formData.transportMode === "BY_VEHICLE" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Number
                      </label>
                      <input
                        type="text"
                        name="vehicleNumber"
                        value={formData.vehicleNumber}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Model
                      </label>
                      <input
                        type="text"
                        name="vehicleModel"
                        value={formData.vehicleModel}
                        onChange={handleInputChange}
                        className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="border-t border-gray-200 pt-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">Items</h2>
                <motion.button
                  type="button"
                  onClick={addItem}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-0.5 mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add Item
                </motion.button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="border rounded-lg p-4 bg-gray-50 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-900">
                        Item #{index + 1}
                      </h3>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                        >
                          Remove Item
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={item.categoryId}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "categoryId",
                              e.target.value
                            )
                          }
                          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                          required
                        >
                          <option value="">Select Category</option>
                          {itemCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Name
                        </label>
                        <input
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            handleItemChange(index, "itemName", e.target.value)
                          }
                          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Serial Number
                        </label>
                        <input
                          type="text"
                          value={item.serialNumber}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "serialNumber",
                              e.target.value
                            )
                          }
                          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              Number.parseInt(e.target.value)
                            )
                          }
                          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                          required
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                          rows="2"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`returnable-${index}`}
                          checked={item.returnable}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "returnable",
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`returnable-${index}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Returnable
                        </label>
                      </div>
                      {item.returnable && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Due Date
                          </label>
                          <input
                            type="date"
                            value={item.dueDate}
                            onChange={(e) =>
                              handleItemChange(index, "dueDate", e.target.value)
                            }
                            className="block w-full px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                            required
                          />
                        </div>
                      )}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Images (Max {MAX_IMAGES_PER_ITEM})
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            <svg
                              className="mx-auto h-12 w-12 text-gray-400"
                              stroke="currentColor"
                              fill="none"
                              viewBox="0 0 48 48"
                              aria-hidden="true"
                            >
                              <path
                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor={`file-upload-${index}`}
                                className={`relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 ${
                                  item.images.length >= MAX_IMAGES_PER_ITEM
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                }`}
                              >
                                <span>Upload files</span>
                                <input
                                  id={`file-upload-${index}`}
                                  name={`file-upload-${index}`}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handleImageUpload(index, e)}
                                  className="sr-only"
                                  disabled={
                                    item.images.length >= MAX_IMAGES_PER_ITEM
                                  }
                                />
                              </label>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF up to {MAX_FILE_SIZE_MB}MB
                            </p>
                          </div>
                        </div>
                        {item.imagePreviews.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {item.imagePreviews.map((preview, imgIndex) => (
                              <div key={imgIndex} className="relative group">
                                <img
                                  src={preview || "/placeholder.svg"}
                                  alt={`Preview ${imgIndex}`}
                                  className="h-24 w-full object-cover rounded-md border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index, imgIndex)}
                                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="flex justify-center pt-4"
            >
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  </div>
                ) : (
                  "Create Gate Pass"
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default GatePassForm;
