import React from 'react'
import { UserCheck, Search, RotateCcw } from 'lucide-react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

 
// ✅ Definimos valores por defecto en las props para evitar undefined
export default function AdminFilters({
  setCases,
  fetchData,
  setSelectedDate,
  selectedDate,
  setCsrFilter,
  csrFilter,
  setStatusFilter,
  statusFilter,
  SetMarketFilter,
  marketFilter,
  setInstallDateFilter,
  installDateFilter,
  setJobFilter,
  jobFilter,
  setCaseFilter,
  caseFilter,
  startDate,
  endDate,
  setDateRange,
  status,         // 👈 valor por defecto []
  markets ,        // 👈 valor por defecto []
  filteredUsers  // 👈 valor por defecto []
})


{
  return (
    <>
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center">
          <UserCheck className="mr-2" /> Active Cases
        </h2>

        <div className="flex items-center space-x-2">
          <DatePicker
            selectsRange
            startDate={startDate}
            endDate={endDate}
            placeholderText="Select a date range"
            onChange={(update) => setDateRange(update)}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded"
            isClearable
          />

          <div className="relative w-64">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Search className="w-4 h-4 text-gray-900" />
            </span>
            <input
              type="text"
              value={caseFilter}
              onChange={(e) => setCaseFilter(e.target.value)}
              placeholder="Search cases..."
              className="pl-10 pr-4 py-2 border rounded w-full"
            />
          </div>

          {/* Botón reset */}
          <button
            onClick={() => {
              setCaseFilter("")
              setStatusFilter("")
              setSelectedDate(null)
              setCsrFilter("")
              SetMarketFilter("")
              setInstallDateFilter(null)
            }}
            className="text-blue-500 hover:text-red-600 transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-4">
        {/* Date */}
        <div className="mb-6 w-1/2">
          <label className="block text-sm font-bold mb-2">Select Date</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Install Date */}
        <div className="mb-6 w-1/2">
          <label className="block text-sm font-bold mb-2">Install Date</label>
          <DatePicker
            selected={installDateFilter}
            onChange={(date) => setInstallDateFilter(date)}
            dateFormat="yyyy-MM-dd"
            className="w-full p-2 border rounded"
            isClearable
          />
        </div>

        {/* JOB */}
        <div className="mb-6 w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            JOB Type
          </label>
          <select
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Status</option>
            <option value="OE">OE</option>
            <option value="OEM">OEM</option>
          </select>
        </div>

        {/* CSR */}
        <div className="mb-6 w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            CSR Filter
          </label>
          <select
            value={csrFilter}
            onChange={(e) => setCsrFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select CSR</option>
            {filteredUsers.length > 0 &&
              filteredUsers
                .slice()
                .sort((a, b) => {
                  const numA = parseInt(a.username.replace(/\D/g, ""), 10)
                  const numB = parseInt(b.username.replace(/\D/g, ""), 10)
                  return numA - numB
                })
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
          </select>
        </div>

        {/* Status */}
        <div className="mb-6 w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Status</option>
            {status.map((item) => (
              <option key={item.id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Market */}
        <div className="mb-6 w-1/2">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Market
          </label>
          <select
            value={marketFilter}
            onChange={(e) => SetMarketFilter(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Market</option>
            {markets.map((market) => (
              <option key={market.id} value={market.name}>
                {market.name.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  )
}

