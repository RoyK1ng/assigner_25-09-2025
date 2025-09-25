
import { Trash2 } from 'lucide-react'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { parseISO } from 'date-fns'


export default function AdminCases({ cases,handleInputChange,handleOpenNoteModal,setCases,fetchData,filteredUsers,setErrorMessage,currentUserName,userType,toast,status,setSelectedCaseId,removedCase, statusFilter, users, llave, handleInstallDateChange, setInstallDates, updateCaseStatus }) {
  return (
    <>

    <div className="overflow-x-auto">
              <table className="min-w-full border ">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned By</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">#WO / recal</th>
                    <th className="px-1 py-1 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CSR</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned At</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Install date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases

                    .filter((case_) => statusFilter === 'DELETED' ? case_.status === 'DELETED' : case_.status !== 'WAITING_ASSIGNMENT' && case_.status !== 'DELETED')
                    .slice(0, 400)
                    .map((case_) => {

                      // Implementar colores de fila según el estado
                      const rowClassMap = status.find((item) => item.name === case_.status)?.colorMap || "bg-gray-100";
                      const rowClassStatus = status.find((item) => item.name === case_.status)?.colorStatus || "bg-gray-100";
                      return (
                        <tr key={case_.id} className={`${rowClassMap}`}>
                          <td
                            className="px-2 py-4 max-w-[180px] truncate whitespace-nowrap"
                            title={case_.title}
                          >
                            {case_.title}
                          </td>
                          {/*
                            <td className="px-3 py-2 text-black whitespace-nowrap text-sm">
                              <input
                                type="text"
                                value={case_.description}
                                onChange={(e) => handleInputChange(case_.id, 'description', e.target.value, cases, setCases)}
                                className="w-full p-1 text-xs border rounded"
                              />
                            </td> */}

                          <td className="px-1 py-2  whitespace-nowrap text-sm">
                            {case_.market || 'N/A'}
                          </td>

                          <td className="px-1 py-2 text-sm items-center gap-2">
                            {case_.scheduled_by || 'N/A'} {/* Mostrar el nombre de usuario que asignó el caso */}

                            <br />                                          {/* === Tag de tipo de caso === */}
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${case_.case_type === "OEM"
                                ? "bg-blue-600 text-white"
                                : "bg-green-600 text-white"
                                }`}
                            >
                              {case_.case_type}
                            </span>
                          </td>

                          <td className="px-3 py-2 text-black whitespace-nowrap text-sm flex items-center gap-2">
                            <input
                              type="text"
                              value={case_.work_order || ''}
                              onChange={(e) => handleInputChange(case_.id, 'work_order', e.target.value, cases, setCases)}
                              className="w-14 p-1 text-xs border rounded"
                              placeholder="WO#"
                            />
                            {case_.work_order && (
                              <a
                                href={`https://ahag.omegaedi.com/app/#/invoices/${case_.work_order.trim()}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {/*<img
                                    src="/pics/glassbiller.png"
                                    alt="Info"
                                    className="w-4 h-4"
                                  />*/}
                                ♎
                              </a>
                            )}
                          </td>
                          <td className="px-3 py-2 text-black whitespace-nowrap text-sm flex items-center gap-2">
                            <input
                              type="text"
                              value={case_.recal || ''}
                              onChange={(e) => handleInputChange(case_.id, 'recal', e.target.value, cases, setCases)}
                              className="w-14 p-1 text-xs border rounded"
                              placeholder="recal"
                            />
                            {case_.recal && (
                              <a href={`https://PRO.glassbiller.com/jobs/${case_.recal.trim()}`} target="_blank" rel="noopener noreferrer">
                                ®️
                              </a>
                            )}
                          </td>
                          <td className="px-1 py-1 text-sm items-center gap-2">
                            <a className="w-5">{users.find((u) => u.id === case_.assigned_to)?.username || 'ASSIGNED'}</a>
                          </td>
                          <td className="px-1 py-2 whitespace-nowrap">
                            <select
                              value={case_.status}
                              onChange={(e) => updateCaseStatus(case_.id, e.target.value, setErrorMessage, fetchData)}
                              className={`px-1 py-2 rounded ${rowClassStatus}`}
                            >
                              {status.map((item) => (
                                <option key={item.id} value={item.name} >
                                  {item.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">
                            {new Date(case_.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: true,
                            })}
                          </td>

                          <td className="px-3 py-2 whitespace-nowrap">
                            <DatePicker
                              selected={case_.install_date ? parseISO(case_.install_date) : null}
                              onChange={(date) => handleInstallDateChange(date, case_.id, setInstallDates)}
                              dateFormat="yyyy-MM-dd"
                              className="w-32 p-2 border rounded"
                              placeholderText="Select date"
                            />
                          </td>

                          <td className="px-2 py-2 whitespace-nowrap">
                            <button
                              onClick={() => {
                                const created_at = new Date(case_.added_at).toLocaleString('en-US', {
                                  timeZone: "America/Bogota",
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  hour12: true,
                                });
                                handleOpenNoteModal(case_.id, case_.note, llave, case_.lasteditnote, case_.title, created_at);
                              }}
                              className="relative flex items-center justify-center"
                            >
                              <ChatBubbleLeftIcon
                                className={`w-6 h-6 transition-transform duration-300 ${case_.note && case_.note.trim() !== ""
                                  ? "text-blue-900 scale-110"
                                  : "text-blue-600 hover:text-green-600"
                                  }`}
                              />
                              {case_.note && case_.note.trim() !== "" && (
                                <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 animate-pulse" />
                              )}

                            </button>
                          </td>

                          {statusFilter !== 'DELETED' ? <td className="px-3 py-2 whitespace-nowrap text-sm">
                            <button
                              onClick={() => removedCase(case_.id, fetchData, 'DELETED')}
                              className="bg-red-600 hover:bg-red-400 text-white p-1 rounded-full transition"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td> :
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <button

                                onClick={() => removedCase(case_.id, fetchData, 'PENDING')}
                                className="text-white text-bold hover:text-black ml-4 text-xs font-bold bg-green-500 hover:bg-green-300 rounded-full px-2 py-1 border border-green hover:border-green-300"
                              >
                                Restore
                              </button>
                            </td>
                          }

                        </tr>
                      );
                    })}
                </tbody>
              </table>


            </div>
      
    </>
  )
}
