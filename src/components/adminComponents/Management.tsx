import React from 'react'  
 import { Users, UserCheck, UserX, CalendarDays, BarChart } from "lucide-react";
import { useUserContext } from '../context/userContext';

export const Management = ({
  cases,
  clase,
  filter,
  title,
  color_1,
  color_2,
  users,
  setAllUsersFree,
  setAllUsersBusy,
  handleUserTypeChange,
  userType,
  currentUserName,
  setUserType,
  llaveManageUser,
  SetLlaveManageUser,
  toggleUserStatus,
  fetchUsers,
  setErrorMessage,
  toggleAvailability,
  userLocation,
  setUserLocation,
  handleLocationChange,
  location
 }) => {

    
  return (
    <>  
      <div className={`rounded-lg shadow-md p-3 mb-4 ${title === "Availability" ? "bg-gray-100":"bg-white"}`}>
                      <div className="flex justify-between items-center gap-4 mb-5 ">
                        <div
                          onClick={() => SetLlaveManageUser(!llaveManageUser)}
                          className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
                        >
                          <div className="bg-purple-100 text-purple-600 p-1 rounded-full">
                            {/* Ícono de usuario */}
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.002 9.002 0 0112 15c2.003 0 3.847.659 5.242 1.766M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>{title === "Availability" && <div className="text-xs text-gray-500">{llaveManageUser ? 'Hide Users' : 'Manage Users'}</div> }
                            
                            <div className="text-base font-bold text-gray-800">{title}</div>
                          </div>
                        </div>

      {/* 
                        <button
                        onClick={() => handleUserTypeChange(userType === 'OE' ? 'OEM' : 'OE', currentUserName, setUserType)}
                        className={`px-4 py-2 text-xs font-semibold rounded text-white ${userType === 'OE' ? 'bg-purple-500' : 'bg-green-500'}`}
                      >
                        {userType}
                    </button>*/}

                    <button
                        onClick={() => handleLocationChange(userLocation === 'SOUTH' ? 'NORTH' : 'SOUTH', currentUserName, setUserLocation)}
                        className={`px-4 py-2 text-xs font-semibold rounded text-white ${userLocation === 'SOUTH' ? 'bg-purple-500' : 'bg-green-500'}`}
                      >
                        {userLocation}
                    </button>
                    
      
                        {/* <div className="flex gap-4">
                          <button
                            className="bg-green-200 hover:bg-gray-300 text-green-500 hover:text-green-600 text-lg font-semibold flex items-center px-4 py-2 rounded-md shadow-sm cursor-pointer transition duration-150 ease-in-out"
                            onClick={setAllUsersFree}
                          >
                            SET ALL FREE 1
                          </button>
                          <button
                            className="bg-red-200 hover:bg-gray-300 text-red-500 hover:text-red-700 text-lg font-semibold flex items-center px-4 py-2 rounded-md shadow-sm cursor-pointer transition duration-150 ease-in-out"
                            onClick={setAllUsersBusy}
                          >
                            SET ALL BUSY 
                          </button>
                        </div>*/}
      
                      </div>
                      <div className= {clase}>
                        {llaveManageUser &&
                          users  
                            .slice()
                            .filter(user => user.availability !== filter)
                            .filter(user => filter !== " " ? user.location === location : user) // Filtrar por ubicación si se proporciona un filtro
                            .sort((a, b) => {
                              const numA = parseInt(a.username.replace(/\D/g, ""), 10);
                              const numB = parseInt(b.username.replace(/\D/g, ""), 10);
                              return numA - numB;
                            })
                            .map((user) => {
                              //const today = new Date().toLocaleDateString();
                              const casesBuilt = (user.casesPerDay && user.casesPerDay.built) || 0;
                              const casesPending = (user.casesPerDay && user.casesPerDay.pending) || 0;
                              
                              const text = "text-black"
                              function colorbg() {
                                let color = " "
                                if (user.status === "FREE" && user.availability != "OFF") {
                                  color = color_1
                                } else if (user.status === "BUSY" && user.availability != "OFF") {
                                  color = color_2
                                } else if (user.availability === "OFF") {
                                  color = "bg-gray-300"
                                }
                                return color
                              }
                              const textColor = user.status === "FREE" ? "text-green-700" : "text-red-700";
                              return (
                                <div key={user.id} className={`p-3 relative rounded-lg shadow ${colorbg()}`}>
                                  
                                  <div className="flex justify-between items-start mb-1">
                                      <div>
                                        <h3 className={`text-[11.5px] uppercase font-bold ${textColor}`}>{user.username}</h3>
                                        {title !== "Availability" && (<>
                                        <div className={`flex items-center text-xs font-bold text-green-700 bg-blue-100 py-0.5 px-1 rounded mb-1`}>
                                          
                                          Built: <span className="font-bold ml-1 text-black">{casesBuilt || 0}</span>
                                        </div>

                                        <div className={`flex items-center text-xs font-bold text-gray-800 bg-yellow-200/70  py-0.5 px-1 rounded mb-1`}>
                                          
                                          Pending: <span className="font-bold ml-1 text-black">{casesPending ||0}</span>
                                        </div>

                                        
                                        </>)}
                                        <div className={`flex top-2 right-2 absolute items-center text-xs text-gray-600 ${colorbg()} py-0.5 rounded-full mb-1`}>
                                          <CalendarDays className="w-4 h-4" />
                                           <span className="font-bold ml-1">{user.casesinmonth ||0}</span>
                                        </div>
                                        
                                      </div>
      
                                      {/*(user.last_free_time || user.last_busy_time) && (
                                        <span className="text-[10px] text-gray-600 border border-gray-200 rounded px-2 py-0.5 shadow">
                                          {user.status === "FREE" ? `${timeSince(user.last_free_time)}` : `${timeSince(user.last_busy_time)}`}
                                        </span>
                                      )*/}
      
                                      {/*(user.status === "FREE") && (
                                        <span className="text-[10px] text-gray-600 border bg-green-100 border-green-200 rounded px-2 py-0.5 shadow">
                                          {user.status === "FREE" && `${timeSince(user.last_free_time)}` }
                                        </span>
                                      )*/}
                                      
      
      
                                    </div>
      
                                  <div className="flex flex-col md:flex-row gap-1">
                                    <button
                                      onClick={() => toggleUserStatus(user.id, user.status, setErrorMessage, fetchUsers)}
                                      className={`px-2 py-1 text-xs rounded-[7px] text-white ${
                                        user.status === "FREE" ? "bg-green-500" : "bg-red-500"
                                      }`}
                                    >
                                      {user.status === "FREE" ? "FREE" : "BUSY"}
                                    </button>
                                    <button
                                      onClick={() => toggleAvailability(user.id, user.availability, fetchUsers)}
                                      //disabled={true}
                                      className={`px-2 w-[60px] py-1 text-xs rounded-[7px] text-white ${
                                        user.availability === "OFF" ? "bg-black" : "bg-blue-400"
                                      }`}
                                      disabled = {currentUserName !== "oeadminprueba"}
                                    >
                                      {user.availability === "OFF" ? "OFF" : "ON_SITE"}
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                      </div>
                    </div>
    </>
  )
}

export default Management
