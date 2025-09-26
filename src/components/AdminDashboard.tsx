import React, { useState, useEffect, useContext, useRef } from 'react';
import { FaChevronDown } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, goToPrevious } from 'recharts';
import { supabase } from '../lib/supabase';
import { Case, User } from '../types';
import { Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"
import { Management } from './adminComponents/Management';
import { useUserContext } from '../context/userContext';
import { status, markets, COLORS } from '../db/db';
import {
  fetchCases,
  fetchUsers,
  assignCase,
  deleteCase,
  removedCase,
  toggleUserStatus,
  toggleAvailability,
  setAllUsersFree,
  setAllUsersBusy,
  handleUpdateCase,
  handleInputChange,
  handleInstallDateChange,
  updateCaseStatus,
  findCase,
  handleUserTypeChange,
  timeSince,
  handleLocationChange,
  handleJobTypeChange
} from '../hooks/oeDashboardFunctions';
import Queue from './adminComponents/Queue';
import AdminCases from './adminComponents/AdminCases';
import AdminFilters from './adminComponents/AdminFilters';
import AdminHeader from './adminComponents/AdminHeader';



export function AdminDashboard() {

  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen(!isOpen);
  //const [cases, setCases] = useState<Case[]>([]);
  //const [users, setUsers] = useState<User[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const { users, setUsers } = useUserContext();
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState('');
  const [casesinQueue, setCasesinQueue] = useState<Case[]>([]);
  //const [caseInputFilter, setCaseInputFilter] = useState('');
  const [installDate, setInstallDate] = useState<Date | null>(null);
  const [finder, setFinder] = useState('');
  const [caseInfo, setCaseInfo] = useState('');
  const [workOrder, setWorkOrder] = useState('');
  const [location, setLocation] = useState('');
  const [market, setMarket] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const navigate = useNavigate();
  const [llaveManageUser, SetLlaveManageUser] = useState(true);
  const [llaveManageUserList, SetLlaveManageUserList] = useState(true);
  const today = new Date();
  const initialDate = today;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [installDateFilter, setInstallDateFilter] = useState<Date | null>(null);
  const [csrFilter, setCsrFilter] = useState('');
  const [caseFilter, setCaseFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [marketFilter, SetMarketFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [installDates, setInstallDates] = useState({});
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [lastEditNote, setLastEditNote] = useState<string | null>(null);
  const [caseNameEdit, setCaseNameEdit] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [llave, setLLave] = useState<boolean | null>(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userType, setUserType] = useState(null);
  const [currentUserName, setCurrentUserName] = useState('');
  const [color, setColor] = useState('bg-gray-100');
  const [search, setSearch] = useState("");
  const [jobCreatedAt, setJobCreatedAt] = useState('');
  //const filteredUsers = users.filter(user => user.user_type === userType);
  const filteredUsers = users;
  const searchText = search.trim().toLowerCase();
  const [showOptions, setShowOptions] = useState(false);
  const containerRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [jobtype, setJobType] = useState(''); 




  const CustomLegend = ({ payload }) => {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', fontSize: '10px' }}>
        {payload.map((entry, index) => (
          <div key={`legend-item-${index}`} style={{ display: 'flex', alignItems: 'center', marginRight: '16px', marginBottom: '8px' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: entry.color, marginRight: '4px' }}></div>
            <span>{entry.value}: {entry.payload.cases}</span>
          </div>
        ))}
      </div>
    );
  };

  

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  useEffect(() => {
    const subscription = supabase
      .channel('users-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: 'status=eq.FREE'
        },
        async (payload) => {
          console.log('usuario', payload);


          await fetch('https://eetpfcujredaijuqizrs.supabase.co/functions/v1/assign-waiting-cases', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHBmY3VqcmVkYWlqdXFpenJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQyNDU5OCwiZXhwIjoyMDUzMDAwNTk4fQ.mrP9SmQ1u9oQx-hODYegZaGzX4hAEx8rw4KAEjGQl_Y`,
              'Content-Type': 'application/json',
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVldHBmY3VqcmVkYWlqdXFpenJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzQyNDU5OCwiZXhwIjoyMDUzMDAwNTk4fQ.mrP9SmQ1u9oQx-hODYegZaGzX4hAEx8rw4KAEjGQl_Y'
            }
          });
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, []);


  {/*Tiempo de las graficas*/ }
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % 2);
    }, 20000); // Cambia cada 20 segundos

    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + 2) % 2);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % 2);
  };

  const handleOpenNoteModal = (caseId: number, note: string, llave: boolean, lastEditNote: string | null, caseName: string | null, created_at) => {
    console.log('Created At:', created_at); // Añade esta línea
    setSelectedNote(note);
    setJobCreatedAt("" + created_at);
    setCaseNameEdit(caseName);
    setSelectedCaseId(caseId);
    setLLave(true);
    const [datePart, user] = lastEditNote.split(" — "); // Separa la fecha y el usuario

    const date = new Date(datePart);
    const formattedDate = date.toLocaleString("en-US", {
      timeZone: "America/Bogota", // Ajusta a EDT
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    setLastEditNote(formattedDate + " — " + user); // Formatea la fecha y agrega el usuario
  };

  {/*All csr and top 3 graphic*/ }
  const prepareChartData = (filteredUsers) => {
    const today = new Date();
    const currentMonth = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Datos para todos los CSR
    const allCsrData = filteredUsers.map(user => {

      const casesThisMonth = user.casesinmonth;

      return {
        name: user.username,
        cases: casesThisMonth,
      };
    });

    // Datos para el top 3 CSR
    const top3CsrData = filteredUsers
      .map(user => {
        const casesThisMonth = user.casesinmonth;

        return {
          name: user.username,
          cases: casesThisMonth,
        };
      })
      .sort((a, b) => b.cases - a.cases) // Ordenar de mayor a menor
      .slice(0, 3); // Tomar solo los primeros 3

    return { allCsrData, top3CsrData };
  };

  const { allCsrData, top3CsrData } = prepareChartData(filteredUsers);

  {/*Status graphic*/ }
  const prepareStatusChartData = (cases) => {
    const statusCounts = {};

    cases.forEach(case_ => {
      const status = case_.status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.keys(statusCounts).map(status => ({
      name: status,
      cases: statusCounts[status],
    }));
  };

  const statusChartData = prepareStatusChartData(cases);

  {/*Status graphic END*/ }

  {/*Obtener user_type y nombnre de el usuario que esta logeado*/ }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      setCurrentUser(user);
      setCurrentUserName(user?.email.split("@")[0]);
      if (authError || !user) {

        navigate('/login');
        return;
      }

      // 2. Buscar el user_type en la tabla 'users'  
      const { data, error: userError } = await supabase
        .from('users')
        .select('location, user_type')
        .eq('username', user.email.split("@")[0]) // asegúrate de que 'uuid' es el campo que conecta con auth
        .single(); // porque solo debe haber un resultado

      if (userError) {
        console.error('Error al obtener el user_type:', userError);
      } else {
        setUserType(data.user_type);
        setUserLocation(data.location);
        console.log('user_location:', data.location);
      }
    };

    fetchCurrentUser();
  }, []);

  {/*FIN*/ }

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const fetchData = async () => {
    await Promise.all([fetchCases(selectedDate, csrFilter, statusFilter, marketFilter, setCases, caseFilter, userType, setCasesinQueue, installDateFilter, setInstallDateFilter, startDate, endDate, jobFilter), fetchUsers(setUsers, userType)]);
  };

  usePolling(fetchData, 2000);

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
    navigate('/login');

  };


  const filteredMarkets = markets.filter((market) =>
    market.name.toLowerCase().includes(searchText)
  );

  return (

    <div className={`min-h-screen ${color} p-8 flex `}>
      <ToastContainer />
      {/* User Section */}
      <div className="w-1/5 ">
        <Management
          cases={cases}
          clase={"grid grid-cols-1 gap-4"}
          filter={" "}
          title={"Availability"}
          color_1={"bg-blue-100"}
          color_2={"bg-blue-100"}
          users={filteredUsers}
          setAllUsersFree={setAllUsersFree}
          setAllUsersBusy={setAllUsersBusy}
          handleUserTypeChange={handleUserTypeChange}
          userType={userType}
          currentUserName={currentUserName}
          setUserType={setUserType}
          llaveManageUser={llaveManageUserList}
          SetLlaveManageUser={SetLlaveManageUserList}
          toggleUserStatus={(userId, currentStatus) => toggleUserStatus(userId, currentStatus, setErrorMessage, () => fetchUsers(setUsers, userType))}
          fetchUsers={() => fetchUsers(setUsers, userType)}
          setErrorMessage={setErrorMessage}
          toggleAvailability={(userId, currentAvailability) => toggleAvailability(userId, currentAvailability, () => fetchUsers(setUsers, userType))}
          userLocation={userLocation}
          setUserLocation={setUserLocation}
          handleLocationChange={handleLocationChange}
        />
      </div>

      {/* Main Content */}
      <div className={`w-3/4 ml-10 mr-7 ${color}`}>

      <AdminHeader
              title={title}
              color={color}
              setColor={setColor}
              finder={finder}
              setFinder={setFinder}
              filteredUsers={filteredUsers}
              setErrorMessage={setErrorMessage}
              handleLogout={handleLogout}
              currentUser={currentUser}
              currentUserName={currentUserName}
              llaveManageUser={llaveManageUser}
              SetLlaveManageUser={SetLlaveManageUser}
              errorMessage={errorMessage}     
      />
        

        {/* Assigner section */}
        <div className="max-w-8xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <Briefcase className="mr-2" /> {userType} Dashboard
              </h2>
              <img
                src="https://s3-media0.fl.yelpcdn.com/bphoto/hjP-WvOROtjHRLDv6kralQ/l.jpg"
                alt="Logo"
                className="h-12 w-auto ml-50"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <form onSubmit={(e) => assignCase(e, title, location, market, caseInfo, workOrder, selectedUser, setTitle, setSelectedUser, filteredUsers, fetchData, setErrorMessage, currentUser, userType, installDate, setInstallDate, setSearch, toast, jobtype)} className="space-y-4 rounded-lg shadow-md p-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Location
                  </label>
                  <div className="w-full relative" ref={containerRef}>
                    <div
                      className="flex items-center border rounded p-2 cursor-pointer"
                      onClick={() => setShowOptions((prev) => !prev)}
                    >
                      <input
                        type="text"
                        placeholder="Buscar ubicación..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setShowOptions(true);
                        }}
                        className="flex-grow outline-none"
                      />
                      <FaChevronDown className="ml-2 text-gray-500" />
                    </div>

                    {showOptions && (
                      <div className="absolute z-10 w-full bg-white border mt-1 rounded shadow max-h-48 overflow-y-auto">
                        {filteredMarkets.length > 0 ? (
                          filteredMarkets.map((market) => (
                            <div
                              key={market.id}
                              onClick={() => {
                                setLocation(market.name);
                                setSearch(market.name);
                                setShowOptions(false);
                              }}
                              className={`p-2 cursor-pointer hover:bg-gray-100 ${location === market.name ? "bg-gray-200 font-bold" : ""
                                }`}
                            >
                              {market.name.replace(/_/g, " ")}
                            </div>
                          ))
                        ) : (
                          <div className="p-2 text-gray-400">No se encontraron resultados</div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className='flex justify-between mt-4'>
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                    Install date
                  </label>
                  <DatePicker
                    selected={installDate}
                    onChange={(date) => setInstallDate(date)}
                    dateFormat="yyyy-MM-dd"
                    className="w-25 p-2 border rounded"
                    placeholderText="Select date"
                    required={jobtype === 'OE'}
                  />
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Job Type
                    </label>
                    <select className='border rounded p-2' 
                      name=""
                      id=""
                      onChange={(e) => setJobType(e.target.value)}
                      required
                    >
                      <option value="">Select Job Type</option>
                      <option value="OE">OE</option>
                      <option value="OEM">OEM</option>
                    </select>
                  </div>

                  </div>

                  
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Assign To (Optional)
                  </label>
                  <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Auto Glass Assign</option>
                    {filteredUsers
                      .filter(user => user.availability === 'ON_SITE')
                      .slice()
                      .sort((a, b) => {
                        const numA = parseInt(a.username.replace(/\D/g, ""), 10);
                        const numB = parseInt(b.username.replace(/\D/g, ""), 10);
                        return numA - numB;
                      })
                      .map(user => (
                        <option key={user.id} value={user.id}>
                          {user.username} (Free)
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                  Assign Case
                </button>
              </form>
              <div className="relative">
                <div className="carousel">
                  {currentIndex === 0 && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-lg font-bold mb-4">Cases by CSR (Monthly)</h3>
                      <div className="mr-5"> {/* mr-5 es equivalente a margin-right: 1.25rem; en Tailwind */}
                        <ResponsiveContainer width="100%" height={350}>
                          <BarChart data={allCsrData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="cases" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {currentIndex === 1 && (
                    <div className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-lg font-bold mb-4">Cases by Status</h3>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart width={600} height={400}>
                          <Pie
                            data={statusChartData}
                            dataKey="cases"
                            nameKey="name"
                            cx="50%"
                            cy="47%"
                            outerRadius={95}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884D8'} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend content={<CustomLegend />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                <button
                  onClick={goToPrevious}
                  className="absolute ml-3 left-0 top-1/2 transform -translate-y-1/2 text-black p-2 rounded-full "
                >
                  &lt;
                </button>
                <button
                  onClick={goToNext}
                  className="absolute mr-3 right-0 top-1/2 transform -translate-y-1/2 text-black p-1 rounded-full "
                >
                  &gt;
                </button>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <h3 className="text-lg font-bold mb-4">Top 3 CSR by Cases</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={top3CsrData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cases" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          </div>

          {/* User Management Section */}
          <Management
            cases={cases}
            clase={"grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 "}
            filter={"OFF"}
            title={"Manage Users"}
            color_1={"bg-green-100"}
            color_2={"bg-red-100"}
            users={filteredUsers}
            setAllUsersFree={setAllUsersFree}
            setAllUsersBusy={setAllUsersBusy}
            handleUserTypeChange={handleUserTypeChange}
            userType={userType}
            currentUserName={currentUserName}
            setUserType={setUserType}
            llaveManageUser={llaveManageUser}
            SetLlaveManageUser={SetLlaveManageUser}
            toggleUserStatus={(userId, currentStatus) => toggleUserStatus(userId, currentStatus, setErrorMessage, () => fetchUsers(setUsers, userType))}
            fetchUsers={() => fetchUsers(setUsers, userType)}
            setErrorMessage={setErrorMessage}
            toggleAvailability={(userId, currentAvailability) => toggleAvailability(userId, currentAvailability, () => fetchUsers(setUsers, userType))}
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            handleLocationChange={handleLocationChange}
            />

          {/* Cases Section */}
          <div className="bg-white rounded-lg shadow-md p-6">

            <AdminFilters
              cases={cases}
              setCases={setCases}
              fetchData={fetchData}
              setSelectedDate={setSelectedDate}
              selectedDate={selectedDate}
              setCsrFilter={setCsrFilter}
              csrFilter={csrFilter}
              setStatusFilter={setStatusFilter}
              statusFilter={statusFilter}
              setMarketFilter={SetMarketFilter}
              marketFilter={marketFilter}
              setInstallDateFilter={setInstallDateFilter}
              installDateFilter={installDateFilter}
              setJobFilter={setJobFilter}
              jobFilter={jobFilter}
              setCaseFilter={setCaseFilter}
              caseFilter={caseFilter}
              startDate={startDate}
              endDate={endDate}
              setDateRange={setDateRange}
              status={status}
              markets={markets}
              filteredUsers={filteredUsers}
            />

            {/* Cases Table */}
           <AdminCases
              cases={cases}
              handleInputChange={handleInputChange}
              handleOpenNoteModal={handleOpenNoteModal}
              setCases={setCases}
              fetchData={fetchData}
              filteredUsers={filteredUsers}
              setErrorMessage={setErrorMessage}
              currentUserName={currentUserName}
              userType={userType}
              toast={toast}
              status={status}
              setSelectedCaseId={setSelectedCaseId}
              removedCase={removedCase}
              statusFilter={statusFilter}
              users={users}
              llave={llave}
              handleInstallDateChange={handleInstallDateChange}
              setInstallDates={setInstallDates}
              updateCaseStatus={updateCaseStatus}
              handleJobTypeChange={handleJobTypeChange}
            />

            

            {/* Modal para mostrar la nota */}
            {llave && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h3 className="text-lg font-bold mb-4">Edit Note - {caseNameEdit} - {jobCreatedAt.toLocaleString()}</h3>
                  <textarea
                    value={selectedNote ?? ""}
                    onChange={(e) => setSelectedNote(e.target.value)}
                    className="w-full text-xs p-2 border rounded mb-4"
                    placeholder="Write a note here..."
                    rows={4}
                  />
                  <div className="flex justify-end space-x-2 items-center">
                    {saveMessage && <span className="text-green-600 font-semibold">{saveMessage}</span>}
                    {lastEditNote && <span className="text-gray-500 text-xs">{lastEditNote}</span>}
                    <button
                      onClick={async () => {

                        const { error } = await supabase
                          .from('cases')
                          .update({ note: selectedNote, lasteditnote: "" + new Date().toISOString() + " — " + currentUserName })
                          .eq('id', selectedCaseId);
                        if (!error) {
                          setTimeout(() => setLLave(false), 2000);
                          setSaveMessage("Saving...");
                          setTimeout(() => setSaveMessage(null), 2000);
                          const updatedCases = cases.map((case_) =>
                            case_.id === selectedCaseId ? { ...case_, note: selectedNote } : case_
                          );
                          setCases(updatedCases);
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setLLave(false);
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

      <Queue
        casesinQueue={casesinQueue}
        updateCaseStatus={updateCaseStatus}
        setErrorMessage={setErrorMessage}
        fetchData={fetchData}
        removedCase={removedCase}
        timeSince={timeSince}  
      />

    </div>
  );
}
