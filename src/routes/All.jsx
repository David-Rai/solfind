// import React, { useState, useEffect, useMemo } from 'react';
// import { useConnection, useWallet } from '@solana/wallet-adapter-react';
// import { AnchorProvider, BN, Program } from '@coral-xyz/anchor';
// import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { PROGRAM_ID, getProgram } from '../program'; // Assuming ../program.js exports PROGRAM_ID and getProgram (adjust path as needed)

// // ReportStatus enum mapping
// const ReportStatusMap = {
//   Open: 'Open',
//   Released: 'Released',
//   Canceled: 'Canceled',
// };

// const All = () => {
//   const { connection } = useConnection();
//   const wallet = useWallet();
//   const [reports, setReports] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const provider = useMemo(
//     () =>
//       wallet.publicKey && wallet.signTransaction
//         ? new AnchorProvider(connection, wallet, { commitment: 'confirmed' })
//         : null,
//     [connection, wallet]
//   );

//   const program = useMemo(() => (provider ? getProgram(provider) : null), [provider]);

//   // Fetch all reports
//   useEffect(() => {
//     const fetchReports = async () => {
//       if (!program) {
//         setLoading(false);
//         return;
//       }
//       setLoading(true);
//       try {
//         const accounts = await program.account.report.all();
//         const mappedReports = accounts.map((account) => {
//           const pubkey = account.publicKey;
//           const data = account.account;
//           return {
//             pubkey: pubkey.toBase58(),
//             reporter: data.reporterPubkey.toBase58(),
//             finder: data.finderPubkey ? data.finderPubkey.toBase58() : null,
//             rewardAmount: data.rewardAmount.toNumber() / LAMPORTS_PER_SOL,
//             reportId: data.reportId,
//             status: ReportStatusMap[data.status.__kind],
//           };
//         });
//         setReports(mappedReports);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchReports();
//   }, [program]);

//   if (loading) return <div className="text-center py-8">Loading reports...</div>;
//   if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>;

//   return (
//     <div className="container mx-auto p-6">
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-3xl font-bold">All Lost Item Reports</h1>
//         <WalletMultiButton />
//       </div>

//       {reports.length === 0 ? (
//         <p className="text-center text-gray-500">No reports found.</p>
//       ) : (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report ID</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward (SOL)</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Finder</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {reports.map((report) => (
//                 <tr key={report.pubkey} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{report.reportId}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.reporter.slice(0, 8)}...</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.rewardAmount.toFixed(6)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {report.finder ? `${report.finder.slice(0, 8)}...` : 'Not found'}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
//                       report.status === 'Open'
//                         ? 'bg-yellow-100 text-yellow-800'
//                         : report.status === 'Released'
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-gray-100 text-gray-800'
//                     }`}>
//                       {report.status}
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     {report.reporter === wallet.publicKey?.toString() && report.status === 'Open' ? (
//                       <div className="flex space-x-2">
//                         {/* Placeholder for Release and Cancel buttons - implement handlers as needed */}
//                         <button
//                           className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
//                           onClick={() => {/* Handle release */}}
//                         >
//                           Release
//                         </button>
//                         <button
//                           className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
//                           onClick={() => {/* Handle cancel */}}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     ) : (
//                       <span className="text-gray-400 text-xs">—</span>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
//     </div>
//   );
// };

// export default All;