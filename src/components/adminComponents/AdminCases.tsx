
import { Trash2 } from 'lucide-react'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { parseISO } from 'date-fns'
import { removeTagFromCase, createTag, addTagToCase, fetchCaseTags   } from '../../hooks/oeDashboardFunctions';
import { useEffect, useState } from 'react'

import { usePolling } from '../../hooks/usePolling'


export default function AdminCases({ cases,handleInputChange,handleOpenNoteModal,setCases,fetchData,filteredUsers,setErrorMessage,currentUserName,userType,toast,status,setSelectedCaseId,removedCase, statusFilter, users, llave, handleInstallDateChange, setInstallDates, updateCaseStatus, handleJobTypeChange, handleInspectionChange, handleLocationChangeCases, tags, setTags }) {

  //const [tags, setTags] = useState([]);
const [caseTags, setCaseTags] = useState({});
const [newTagName, setNewTagName] = useState("");
const [newTagColor, setNewTagColor] = useState("#007bff");
const [showAddTagModal, setShowAddTagModal] = useState(false);
const [selectedCaseForTag, setSelectedCaseForTag] = useState(null);




usePolling(() => fetchCaseTags(setCaseTags), 30000);

useEffect(() => {
  //fetchTags(setTags);
  fetchCaseTags(setCaseTags);
}, []);

  return (
    <>

    <div className="overflow-x-auto">
              <table className="min-w-full border ">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Title</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500  tracking-wider">Market</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Assigner</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">#WO</th>
                    <th className="px-1 py-1 text-left text-xs font-bold text-gray-500  tracking-wider">CSR</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Assigned At</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Install date</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500  tracking-wider">Note</th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Delete</th>
                    <th className="px-1 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Campaign</th>
                    <th className="px-20 py-2 text-left text-xs font-bold text-gray-500  tracking-wider">Tags</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400/50">
                  {cases

                    .filter((case_) => statusFilter === 'DELETED' ? case_.status === 'DELETED' : case_.status !== 'WAITING_ASSIGNMENT' && case_.status !== 'DELETED')
                    .slice(0, 70)
                    .map((case_) => {

                      // Implementar colores de fila según el estado
                      const rowClassMap = status.find((item) => item.name === case_.status)?.colorMap || "bg-gray-100";
                      const rowClassStatus = status.find((item) => item.name === case_.status)?.colorStatus || "bg-gray-100";
                      return (
                        <tr key={case_.id} className={`${rowClassMap}`}>
                          <td
                            className="px-2 py-4 max-w-[160px] text-xs truncate whitespace-nowrap"
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

                          <td className="px-1 py-2 text-xs whitespace-nowrap text-sm">
                            {case_.market || 'N/A'}
                          </td>

                          <td className="px-1 py-2 text-xs items-center gap-2">
                            {case_.scheduled_by || 'N/A'} {/* Mostrar el nombre de usuario que asignó el caso */}
                              <br />
                            <button
                                  onClick={() => handleJobTypeChange(case_.case_type === 'OE' ? 'OEM' : 'OE', case_.id)}
                                  className={`px-2 py-0.3 rounded-md text-[10px] font-bold ${case_.case_type === "OEM"
                                    ? "bg-blue-600 text-white"
                                    : "bg-green-600 text-white"
                                    }`}
                                >
                                  {case_.case_type}
                                </button>
                          </td>

                          <td className="px-3 py-2 text-black  whitespace-nowrap text-sm flex items-center gap-2">
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


                          {/* Asignado a */}  
                          <td className="px-1 py-1 text-sm items-center text-xs gap-2">
                            <a className="w-5">{users.find((u) => u.id === case_.assigned_to)?.username || 'ASSIGNED'}</a>
                          </td>

                          {/* Estado */}
                          <td className="px-1 py-2 whitespace-nowrap">
                            
                                <select
                                  value={case_.status}
                                  onChange={(e) => updateCaseStatus(case_.id, e.target.value, setErrorMessage, fetchData)}
                                  className={`px-1 py-2 w-[90px] rounded text-xs ${rowClassStatus}`}
                                >
                                  {status
                                    .filter(item => ["BUILT", "PENDING", "VOID"].includes(item.name))
                                    .map((item) => (
                                      <option key={item.id} value={item.name}>
                                        {item.name}
                                      </option>
                                    ))
                                  }
                                </select>
                                
                          </td>
                          <td className="px-4 py-2 text-gray-800 text-xs">
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

                          <td className="px-3 py-2 whitespace-nowrap text-xs">
                            <DatePicker
                              selected={case_.install_date ? parseISO(case_.install_date) : null}
                              onChange={(date) => handleInstallDateChange(date, case_.id, setInstallDates)}
                              dateFormat="yyyy-MM-dd"
                              className="w-[85px] p-2 border rounded"
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

                          {statusFilter !== 'DELETED' ? <td className="px-6 py-2 whitespace-nowrap text-sm">
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

                          <td className=''>
                                

                                {case_.inspection ? (
  // ✅ Cuando es inspection
                                  <button
                                    onClick={() => handleInspectionChange(case_.id, case_.inspection, fetchData)}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white"
                                  >
                                    Inspection
                                  </button>
                                ) : (
                                  // ⬜ Cuando NO es inspection → espacio vacío pero clickeable
                                  <div
                                    onClick={() => handleInspectionChange(case_.id, case_.inspection, fetchData)}
                                    className="w-[80px] h-[20px] flex items-center justify-center cursor-pointer hover:bg-gray-100/10 rounded-md transition"
                                    title="Agregar inspection"
                                  >
                                    {/* intencionalmente vacío, solo fondo al hover */}
                                  </div>
                                )} 
                                <br />
                                <button
                onClick={() => handleLocationChangeCases(case_?.location === 'SOUTH' ? 'NORTH' : 'SOUTH', case_.id)}
                className={`px-2 py-0.5 text-xs font-semibold rounded text-white ${case_?.location === 'SOUTH' ? 'bg-purple-500' : 'bg-green-500'}`}
              >
            {case_?.location === 'SOUTH' ? 'SOUTH' : 'NORTH'}
        </button>



                          </td>

                          {/* Tags */}
                          <td className='px-[70px] py-1'>
                                  <div className="flex flex-wrap gap-1">
                                    {caseTags[case_.id]?.map(tag => (
                                      <button
                                        key={tag.id}
                                        className="px-2 py-0.5 text-xs rounded-[5px] text-black lowercase"
                                        style={{ backgroundColor: tag.color }}
                                        onClick={() => removeTagFromCase(case_.id, tag.id, fetchCaseTags, setCaseTags)}
                                      >
                                        {tag.name}
                                      </button>
                                    ))}
                                    <button
                                      onClick={() => {
                                        setSelectedCaseForTag(case_.id);
                                        setShowAddTagModal(true);
                                      }}
                                      className="bg-blue-100/50 hover:bg-gray-300 text-gray-800 text-xs px-2 py-0.5 rounded-[5px]"
                                    >
                                      + Tag
                                    </button>
                                  </div>
                                </td>
                                  
                        </tr>
                      );
                    })}
                </tbody>
              </table>

                      {showAddTagModal && (
                              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                                  <h3 className="text-lg font-bold mb-4">Add Tag</h3>
                                  <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Select Tag</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        onChange={(e) => addTagToCase(selectedCaseForTag, e.target.value, fetchCaseTags, setCaseTags)}
                                      >
                                        <option value="">Select a tag</option>
                                        {tags.map(tag => (
                                          <option key={tag.id} value={tag.id}>
                                            {tag.name}
                                          </option>
                                        ))}
                                      </select>
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Or Create New Tag</label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="Tag name"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                        className="w-full p-2 border rounded"
                                      />
                                      <input
                                        type="color"
                                        value={newTagColor}
                                        onChange={(e) => setNewTagColor(e.target.value)}
                                        className="w-10 h-10"
                                      />
                                      <button
                                        onClick={async () => {
                                          await createTag(newTagName, newTagColor, setTags);
                                          setNewTagName("");
                                          setNewTagColor("#007bff");
                                        }}
                                        className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
                                      >
                                        Create
                                      </button>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setShowAddTagModal(false)}
                                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            )}

                                        </div>
      
    </>
  )
}
