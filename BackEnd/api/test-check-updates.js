// import handler from "./check-updates.js";

// // Mock request and response objects
// const mockRequest = {
//   headers: {
//     authorization: `Bearer ${process.env.CRON_SECRET}`,
//   },
// };

// const mockResponse = {
//   status: (code) => {
//     console.log(`Response Status: ${code}`);
//     return {
//       json: (data) => {
//         console.log("Response Data:", data);
//         return data;
//       },
//     };
//   },
// };

// // Run the handler
// console.log("Starting check-updates job...\n");
// handler(mockRequest, mockResponse)
//   .then(() => {
//     console.log("\n✅ Job completed");
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error("\n❌ Job failed:", error);
//     process.exit(1);
//   });

