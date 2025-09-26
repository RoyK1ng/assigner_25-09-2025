import React from 'react'

import { Search, LogOut } from 'lucide-react'
import { findCase } from '../../hooks/oeDashboardFunctions';

export default function AdminHeader({title, color, setColor, finder, setFinder, filteredUsers, setErrorMessage, handleLogout, currentUser, currentUserName, llaveManageUser, SetLlaveManageUser, errorMessage}) {
  return (
    <>
        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 mb-10 px-4 py-3 rounded relative mt-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{errorMessage}</span>
          </div>
        )}

        <div className={`w-full bg-white rounded-lg shadow-md p-4 mb-4 `}>
          <div className={`flex justify-between items-center `}>

            <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out">
              <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
                {/* Ícono de usuario */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9.002 9.002 0 0112 15c2.003 0 3.847.659 5.242 1.766M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>{title === "Availability" && <div className="text-xs text-gray-500">{llaveManageUser ? 'Hide Users' : 'Manage Users'}</div>}

                <div className="text-base font-bold text-gray-800">Welcome, {currentUser ? currentUserName : "guest"}</div>
              </div>
              <div>

                <select name="color" id="color" className={`${color} rounded appearance-none px-3 py-1/3`}
                  value={color}
                  onChange={(e) => { setColor(e.target.value) }}
                >
                  <option className='bg-gray-100 hover:bg-gray-100 rounded ' value="bg-gray-100"></option>
                  <option className='bg-blue-100 hover:bg-blue-100 rounded ' value="bg-blue-100"></option>
                  <option className='bg-purple-300 hover:bg-purple-100 rounded ' value="bg-purple-100"></option>
                  <option className='bg-red-100 hover:bg-red-100 rounded ' value="bg-red-100"></option>
                  <option className='bg-orange-300 hover:bg-red-100 rounded ' value="bg-orange-100"></option>
                </select>
              </div>
            </div>





            <form onSubmit={(e) => findCase(e, finder, setFinder, filteredUsers, setErrorMessage)} className="flex items-center ml-4">
              <div className="relative">
                <input
                  type="text"
                  value={finder}
                  onChange={(e) => setFinder(e.target.value)}
                  placeholder="Search case"
                  className="w-full p-2 border rounded"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-0 top-0 mt-2 mr-2"
                >
                  <Search className="text-gray-500" />
                </button>
              </div>
            </form>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
    </>
  )
}
