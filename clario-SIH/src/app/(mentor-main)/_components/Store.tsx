// //  <div className="space-y-4">
//             {pendingSessions.map((session) => (
//               <div className=" border border-gray-200 rounded">
//                 <p>{session.userName}</p>
//                 <p className="font-medium text-gray-900">
//                   {session.session_type}
//                 </p>
//                 <p className="text-sm text-gray-500">
//                   Requested on {session.scheduled_at ? new Date(session.scheduled_at).toLocaleString() : 'Not scheduled'}
//                 </p>
//                 {session.notes && (
//                   <p className="text-gray-700 mt-1">Note: {session.notes}</p>
//                 )}
//               </div>
//             ))}
//           </div>