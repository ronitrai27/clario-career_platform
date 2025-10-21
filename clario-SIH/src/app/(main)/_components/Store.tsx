// {/* ALL mentors */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5  gap-x-6 gap-y-14 px-2 max-w-[1260px] mx-auto">
//           {mentorData.map((mentor) => {
//             const bgColor = getRandomBgColor(mentor.id);
//             const borderColor = getRandomBorderColor(mentor.id);
//             return (
//               <div
//                 key={mentor.id}
//                 className={`border-l-4 ${borderColor} rounded-md shadow-sm bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden h-[240px]`}
//               >
//                 <div className="flex h-full">
//                   {/* Left Section */}
//                   <div
//                     className={`w-[65%] ${bgColor} flex flex-col justify-between p-3`}
//                   >
//                     <div className="space-y-2">
//                       <p className="text-lg font-semibold font-inter text-center tracking-tight capitalize">
//                         {mentor?.current_position || "Position unavailable"}
//                       </p>
//                       <p className="text-base font-inter text-center mb-3 line-clamp-2">
//                         {mentor?.bio || "No bio available"}
//                       </p>
//                       <h2 className="text-sm font-raleway text-center">
//                         Expertise:{" "}
//                         {mentor?.expertise?.join(", ") || "No expertise added"}
//                       </h2>
//                     </div>

//                     <div className="fmt-4 w-full">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="w-full cursor-pointer"
//                         onClick={() =>
//                           router.push(`/home/mentor-connect/${mentor.id}`)
//                         }
//                       >
//                         Connect <LuScreenShare className="ml-2" />
//                       </Button>
//                     </div>
//                   </div>
//                   <Separator orientation="vertical" className="bg-gray-300" />

//                   {/* Right Section */}
//                   <div className="flex flex-col items-center justify-center w-[35%] px-2 py-4 text-center space-y-2 ">
//                     <span
//                       className={`inline-block -mt-4 mb-6 px-2 py-1 text-xs text-black font-inter rounded-full font-medium ${
//                         mentor?.availability
//                           ? "bg-green-200 text-green-800"
//                           : "bg-red-200 text-red-800"
//                       }`}
//                     >
//                       {mentor?.availability ? "Available" : "Available"}
//                     </span>
//                     <div className="relative mb-4">
//                       <Image
//                         src={mentor?.avatar || "/user.png"}
//                         alt={mentor?.full_name || "User"}
//                         width={75}
//                         height={75}
//                         className="rounded-full border border-gray-200"
//                       />
//                       <p className=" absolute -bottom-2 right-1 bg-white border-2 border-yellow-500 rounded-full px-2 flex items-center text-sm">
//                         <Star
//                           className="inline mr-1 fill-yellow-500 text-yellow-400"
//                           size={15}
//                         />{" "}
//                         {mentor?.rating}
//                       </p>
//                     </div>

//                     <h2 className="text-lg font-semibold text-gray-900 capitalize">
//                       {mentor?.full_name}
//                     </h2>
//                     <Link
//                       target="_blank"
//                       href={
//                         mentor?.linkedin ||
//                         "https://www.linkedin.com/in/ronit-rai-aa53a1300/"
//                       }
//                       className="text-base text-blue-600 hover:underline truncate max-w-[100px]"
//                     >
//                       <div className="flex items-center gap-2">
//                         <p className=" font-inter tracking-tight">linkedin</p>
//                         <Image
//                           src="/linkedin.png"
//                           alt="linkedin"
//                           width={20}
//                           height={20}
//                         />
//                       </div>
//                     </Link>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>