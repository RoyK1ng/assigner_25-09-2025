import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { parseISO } from 'date-fns';
import { Case, User } from '../types';
import { Briefcase, UserCheck, LogOut, Search} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import DatePicker from 'react-datepicker'; // Importar el componente DatePicker
import "react-datepicker/dist/react-datepicker.css";
import { useIdleLogout } from '../hooks/useIdleLogout';
//import { useUserContext } from '../context/userContext';
import { status } from '../db/db';
import {ChatBubbleLeftIcon} from '@heroicons/react/24/outline';

import { handleJobTypeChange } from '../hooks/oeDashboardFunctions';
import UserQueue from './userComponents/UserQueue';



export function UserDashboard() {
  
  useIdleLogout(); 
  
  const [cases, setCases] = useState<Case[]>([]);
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [casesQueue, setCasesQueue] = useState<Case[]>([]);
  const [caseFilter, setCaseFilter] = useState('');
  //const { users, setUsers } = useUserContext();
  //const {cases, setCases} = useUserContext()
  const [user, setUser] = useState<User | null>(null);
  const [prevCaseCount, setPrevCaseCount] = useState(0);
  const [newCaseMessage, setNewCaseMessage] = useState<string | null>(null);
  const today = new Date();
  const initialDate = today; // date-fns maneja mejor la inicialización
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const notificationSound = new Audio('/sounds/eps_sound_x3.mp3');
  const [userType, setUserType] = useState('');
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [installDates, setInstallDates] = useState({});
  const [llave, setLLave] = useState<boolean | null>(false);
  const [lastEditNote, setLastEditNote] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState('');
  const [userTags, setUserTags] = useState<Record<string, any[]>>({});
const [allTags, setAllTags] = useState<any[]>([]);
const [showAddUserTagModal, setShowAddUserTagModal] = useState(false);
const [selectedUserTag, setSelectedUserTag] = useState<string | null>(null);
const [newUserTagName, setNewUserTagName] = useState("");
const [newUserTagColor, setNewUserTagColor] = useState("#007bff");
const [showAddCaseTagModal, setShowAddCaseTagModal] = useState(false);
const [selectedCaseForTag, setSelectedCaseForTag] = useState<string | null>(null);
const [tagFilter, setTagFilter] = useState('');
const [myQueue, setMyQueue] = useState<Case[]>([]);


// Cargar todos los tags disponibles
const fetchAllTags = async () => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*');
    if (error) throw error;
    setAllTags(data || []);
  } catch (err) {
    console.error("Error fetching tags:", err);
  }
};

// Cargar los tags asignados a un usuario
const fetchUserTags = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_tags')
      .select('*, tags(*)')
      .eq('user_id', userId);
    if (error) throw error;
    const userTagMap = { [userId]: data.map((item: any) => item.tags) };
    setUserTags(userTagMap);
  } catch (err) {
    console.error("Error fetching user tags:", err);
  }
};

// Asignar un tag a un usuario
const addTagToCase = async (caseId: string, tagId: string) => {
  try {
    const { error } = await supabase
      .from('case_tags')
      .insert([{ case_id: caseId, tag_id: tagId }]);
    if (error) throw error;
    await fetchAssignedCases(user?.id || ''); // Refrescar los casos asignados
  } catch (err) {
    console.error("Error adding tag to case:", err);
  }
};

// Eliminar un tag de un usuario
const removeTagFromCase = async (caseId: string, tagId: string) => {
  try {
    const { error } = await supabase
      .from('case_tags')
      .delete()
      .eq('case_id', caseId)
      .eq('tag_id', tagId);
    if (error) throw error;
    await fetchAssignedCases(user?.id || ''); // Refrescar los casos asignados
  } catch (err) {
    console.error("Error removing tag from case:", err);
  }
};



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
  
          
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assign-waiting-cases`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
            }
          });
        }
      )
      .subscribe()
  
    return () => {
      supabase.removeChannel(subscription)
    }
  }, []);

  // Actualizar casesinmonth cada vez que cambian los casos
  const updateCasesInMonth = async () => {
  try {
    // Obtener el usuario autenticado
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      console.error('No hay sesión activa');
      return;
    }

    const email = session.user.email;
    const username = email?.split('@')[0];

    // Obtener los datos del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError) {
      console.error('Error al obtener los datos del usuario:', userError.message);
      return;
    }

    if (userData) {
      // Actualizar la columna casesinmonth
      const { error: updateError } = await supabase
        .from('users')
        .update({ casesinmonth: casesInMonth, casestoday: todayCases.length + recalTodayCases.length })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Error al actualizar casesinmonth:', updateError.message);
      } else {
        console.log('casesinmonth actualizado correctamente');
      }
    }
  } catch (err) {
    console.error('Error inesperado:', err);
  }
};


// Si lo pones en UserDashboard.tsx, agrégalo antes del return:
const timeSince = (dateString: string): string => {
  const now = new Date();
  const updatedAt = new Date(dateString);
  const seconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (days > 0) return `${days}d ${hrs % 24}h`;
  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${seconds}s`;
};




  // Función para abrir el modal de notas
const handleOpenNoteModal = (caseId: number, note: string, llave: boolean, lastEditNote: string | null) => {
  setSelectedNote(note);
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

  
  const fetchData = async () => {
    
    await fetchUserData();
    await fetchAllCases();
    if (user?.id) {
      await fetchAssignedCases(user.id);
    }
  };

const fetchAllCases = async () => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', "WAITING_ASSIGNMENT")
      

    if (error) {
      console.error('Error fetching all cases:', error.message);
      return;
    }

    if (data) {
    // Añade este log para verificar los datos
    setCasesQueue(data);
}
  } catch (err) {
    console.error('Unexpected error fetching all cases:', err);
  }
};

const casesTwoDaysOut = casesQueue.filter(case_ => {
  const installDate = new Date(case_.install_date);
  const today = new Date();
  const twoDaysFromNow = new Date(today);
  twoDaysFromNow.setDate(today.getDate() + 2);
  return installDate >= today && installDate <= twoDaysFromNow;
});

useEffect(() => {
  const initializeData = async () => {
    await fetchUserData();
    await fetchAllCases();
    if (user?.id) {
      const { data } = await supabase
        .from('cases')
        .select('*')
        .eq('assigned_to', user.id);
      if (data) {
        setPrevCaseCount(data.length);
        setCases(data);
      }
    }
    // Cargar tags
    await fetchAllTags();
    if (user?.id) {
      await fetchUserTags(user.id);
    }
  };
  initializeData();
}, []);
    
    

  // Poll for updates every 1 seconds
  usePolling(fetchData, 2000);
  

  useEffect(() => {
    fetchData();
  }, []);

   
  

  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const triggerNotification = (message: string) => {
    if (Notification.permission === 'granted') {
      new Notification('Nuevo Caso Asignado', {
        body: message,
        icon: '/icons/notification-icon.png',
      });
    }
    notificationSound.play();
  };

  const fetchUserData = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/login');
      return;
    }

    const email = session.user.email;
    const username = email?.split('@')[0];

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (userError) {
      setError(userError.message);
      return;
    }

    if (userData) {
      setUser(userData);

      // 🚨 Aquí validamos la disponibilidad
      if (userData.availability === "OFF") {
        // Desloguear al usuario automáticamente
        await supabase.auth.signOut();
        setShowSessionExpiredModal(true); // Mostrar modal
        navigate('/login');
      }
    }
  } catch (err) {
    console.error('Error fetching user data:', err);
    setError('Error fetching user data');
  }
};


  const fetchAssignedCases = async (userId: string) => {
  try {
    const { data: casesData, error: casesError } = await supabase
      .from('cases')
      .select('*, case_tags(tags(*))')
      .eq('assigned_to', userId)
      .order('created_at', { ascending: false });

    if (casesError) {
      setError(casesError.message);
      return;
    }

    if (casesData) {
      let filteredCases = casesData;

      if (tagFilter) {
        filteredCases = filteredCases.filter((case_) =>
          case_.case_tags.some((caseTag) => caseTag.tags.id === tagFilter)
        );
      }

      // ✅ Separar casos PENDING (queue personal) de los demás
      const queueCases = filteredCases.filter(c => c.status === 'QUEUE');
      

      setMyQueue(queueCases);
      setCases(filteredCases);
      setPrevCaseCount(filteredCases.length);

      // Notificación solo si hay nuevos casos
      if (filteredCases.length > prevCaseCount && prevCaseCount > 0) {
        setNewCaseMessage('¡Tienes un nuevo caso en tu queue!');
        triggerNotification('¡Tienes un nuevo caso en tu queue!');
      } else {
        setNewCaseMessage(null);
      }
    }
  } catch (err) {
    console.error('Error fetching cases:', err);
    setError('Error fetching cases');
  }
};




 

  const toggleStatus = async () => {
    if (!user) return;

    const newStatus = user.status === 'FREE' ? 'BUSY' : 'FREE';
    const { error: updateError } = await supabase
      .from('users')
      .update({
        status: newStatus,
        last_free_time: newStatus === 'FREE' ? new Date().toISOString() : user.last_free_time,
        availability: "ON_SITE"
      })
      .eq('id', user.id);

    if (updateError) {
      setError(updateError.message);
    }
    await fetchData(); // Fetch fresh data after status change
  };

  const completeCase = async (caseId: string) => {
    const { error: caseError } = await supabase
      .from('cases')
      .update({
        status: 'COMPLETED',
        completed_at: new Date().toISOString()
      })
      .eq('id', caseId);

    if (caseError) {
      setError(caseError.message);
    }
    await fetchData(); // Fetch fresh data after completing case
  };


  const handleLogout = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setShowSessionExpiredModal(true);
      return;
    }

    if (user) {
      const { error: updateError } = await supabase
        .from('users')
        .update({ availability: 'OFF', status: "BUSY" })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user availability:', updateError.message);
        return;
      }
    }

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setShowSessionExpiredModal(true)
      
      return;
    }
    window.location.reload();
    navigate('/login');
    
  } catch (err) {
    // No mostrar el error en la consola si no hay sesión activa
    if (!err.message.includes("Auth session missing")) {
      console.error('Unexpected error during logout:', err);
    }
  }
};


  const todayCases = cases.filter(case_ => {
  const caseDate = new Date(case_.completed_at).toDateString();
  const today = new Date().toDateString();

  return caseDate === today && !["KICK BACK", "VOID", "DUPLICATED", "DELETED", "PENDING", "DENIED", "NOT IN SLACK", "NOT IN GB", "NO REPLY", "OEM JOB", "INSPECTION", "NOT REFERRAL", "3 DAYS OUT"].includes(case_.status);
});

const recalTodayCases = cases.filter(case_ => {
  const caseDate = new Date(case_.completed_at).toDateString();
  const today = new Date().toDateString();

  return caseDate === today && !["KICK BACK", "VOID", "DUPLICATED", "DELETED", "PENDING", "DENIED", "NOT IN SLACK", "NOT IN GB", "NO REPLY", "OEM JOB","INSPECTION", "NOT REFERRAL", "3 DAYS OUT"].includes(case_.status) && case_.recal !== null && case_.recal !== '';
});

// Calculate monthly cases
const monthlyCases = cases.filter(case_ => {
  const createdAt = new Date(case_.created_at);
  const now = new Date();
  return (
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth() &&
    !["KICK BACK", "VOID", "DUPLICATED", "DELETED", "PENDING", "DENIED", "NOT IN SLACK", "NOT IN GB", "NO REPLY", "OEM JOB", "INSPECTION", "NOT REFERRAL", "3 DAYS OUT"].includes(case_.status)
  );
});

const recalMonthlyCases = cases.filter(case_ => {
  const createdAt = new Date(case_.created_at);
  const now = new Date();
  return (
    createdAt.getFullYear() === now.getFullYear() &&
    createdAt.getMonth() === now.getMonth() &&
    !["KICK BACK", "VOID", "DUPLICATED", "DELETED", "PENDING", "DENIED", "NOT IN SLACK", "NOT IN GB", "NO REPLY", "OEM JOB", "INSPECTION", "NOT REFERRAL", "3 DAYS OUT"].includes(case_.status) && case_.recal !== null && case_.recal !== ''  
  );
});




const casesInMonth = monthlyCases.length + recalMonthlyCases.length;

useEffect(() => {
  if (casesInMonth !== null) {
    updateCasesInMonth();
  }
}, [casesInMonth]);



 {/* Updates */}

   const handleUserTypeChange = async (newType) => {
    if (!user) return;

    const { error } = await supabase
      .from('users')
      .update({ user_type: newType })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user type:', error.message);
    } else {
      setUserType(newType);
      window.location.reload(); // Recargar la página para aplicar el cambio
    }
  };


  const handleInspectionChange = async (caseId, currentValue) => {
  try {
    const { error } = await supabase
      .from("cases")
      .update({ inspection: !currentValue }) // toggle
      .eq("id", caseId);

    if (error) {
      console.error("Error updating inspection:", error.message);
    } else {
      await fetchData(); // refresca lista
    }
  } catch (err) {
    console.error("Unhandled error in handleInspectionChange:", err);
  }
};

  const handleLocationChange = async (newLocation) => {
    

    const { error } = await supabase
      .from('users')
      .update({ location: newLocation })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating user type:', error.message);
    } else {
      setUserLocation(newLocation);
      window.location.reload();
    }
  };
  

  
  const updateCaseStatus = async (caseId: string, newStatus: string) => {
  try {
    const { error: caseError } = await supabase
      .from('cases')
      .update({
        status: newStatus,
        completed_at: newStatus === 'BUILT' || newStatus === 'APPROVED' || newStatus === 'OE COST'  ? new Date().toISOString() : null,
      })
      .eq('id', caseId);

    if (caseError) {
      setError(caseError.message);
    } else {
      await fetchData(); // Refrescar los datos después de actualizar el estado
    }
  } catch (err) {
    console.error('Error updating case status:', err);
    setError('Error updating case status');
  }
};

  const kickbackCases = cases.filter(case_ =>
  case_.case_tags.some(caseTag => caseTag.tags.name === 'KICK BACK')
);

const sigCases = cases.filter(case_ =>
  case_.case_tags.some(caseTag => caseTag.tags.name === 'OCEAN H./EQ')
);

const requestedCases = cases.filter(case_ =>
  case_.case_tags.some(caseTag => caseTag.tags.name === 'REQUESTED')
);

const inspectionCases = cases.filter(
  case_ => case_.inspection === true
);
  const handleInputChange = async (caseId, field, value) => {
  const updatedCases = cases.map(case_ => {
    if (case_.id === caseId) {
      return { ...case_, [field]: value };
    }
    return case_;
  });

  setCases(updatedCases);

  // Ahora actualiza la base de datos con los nuevos valores
  const { error } = await supabase
    .from('cases')
    .update({
      [field]: value,
    })
    .eq('id', caseId);

  if (error) {
    console.error(`Error updating case ${field}:`, error.message);
  }
};

  let filteredCases = cases;


  if (statusFilter) {
    filteredCases = filteredCases.filter(case_ => statusFilter === case_.status);
  }

  if (selectedDate) {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    filteredCases = filteredCases.filter(case_ => {
      const caseDate = new Date(case_.created_at);
      return caseDate >= new Date(formattedDate) &&
             caseDate <= new Date(`${formattedDate}T23:59:59.999Z`);
    });
  }

  if (caseFilter) {
    const search = caseFilter.trim().toLowerCase();
    filteredCases = filteredCases.filter(case_ => case_.title?.toLowerCase().includes(search) || case_.work_order?.toLowerCase().includes(search) || case_.recal?.toLowerCase().includes(search));
  }

 


//SET INSTALL DATE
   const handleInstallDateChange = async (date, caseId, installDates) => {

          if (!date) {
            console.error("No date provided");
            return;
          }

          const formattedDate = date.toISOString().split("T")[0];
          console.log("Fecha formateada:", formattedDate);

          setInstallDates((prev) => ({ ...prev, [caseId]: date }));

          try {
            const { error } = await supabase
              .from("cases")
              .update({ install_date: formattedDate })
              .eq("id", caseId);

            if (error) {
              console.error("Error updating install date:", error.message);
            } else {
              console.log("Install date updated successfully");
            }
          } catch (err) {
            console.error("Unexpected error:", err);
          }
  };

// 1 hora en milisegundos




  
  
  //RENDER
  return (
    <div className="min-h-screen bg-gray-100 flex flex-row justify-between p-8">

      
  <div className="w-full max-w-[290px] mr-8">

    {/* INSPECTIONS Cases */}
    
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">

        <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 mb-5">
              <div className="bg-purple-100 text-yellow-600 p-1 rounded-full">
                {/* Ícono de reloj */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414M5.636 18.364l1.414-1.414M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500"> Inspection Cases:</div>
                <div className="text-base font-bold text-gray-800">
                  {inspectionCases.length}
                </div>
              </div>
        </div>
          {inspectionCases.length > 0 && (
        <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
          {inspectionCases.map(case_ => (
            <div key={case_.id} className="p-3 rounded-md bg-purple-300 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">{case_.title}</p>
              <p className="text-xs text-gray-700">
                Created: {new Date(case_.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
         )}
      </div>


    {/* KICK BACK Cases */}
    
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">

        <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 mb-5">
              <div className="bg-red-100 text-yellow-600 p-1 rounded-full">
                {/* Ícono de reloj */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414M5.636 18.364l1.414-1.414M6 6l12 12" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500"> Kick back:</div>
                <div className="text-base font-bold text-gray-800">
                  {kickbackCases.length}
                </div>
              </div>
        </div>
          {kickbackCases.length > 0 && (
        <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
          {kickbackCases.map(case_ => (
            <div key={case_.id} className="p-3 rounded-md bg-red-300 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">{case_.title}</p>
              <p className="text-xs text-gray-700">
                Created: {new Date(case_.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
         )}
      </div>
   

    {/* OCEAN HARBOR / EQUITY (Email) Cases */}
    
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">
        <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 mb-5">
              <div className="bg-blue-100 text-yellow-600 p-1 rounded-full">
                {/* Ícono de reloj */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18" />
          </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500"> Ocean Harbor / Equity:</div>
                <div className="text-base font-bold text-gray-800">
                  {sigCases.length}
                </div>
              </div>
        </div>
        {sigCases.length > 0 && (
        <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
          {sigCases.map(case_ => (
            <div key={case_.id} className="p-3 rounded-md bg-blue-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">{case_.title}</p>
              <p className="text-xs text-gray-700">
                Created: {new Date(case_.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
 )}
      </div>
   

    {/* REQUESTED Cases */}
    
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">
        <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 mb-5">
              <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full">
                {/* Ícono de reloj */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 20.5c4.694 0 8.5-3.806 8.5-8.5S16.694 3.5 12 3.5 3.5 7.306 3.5 12s3.806 8.5 8.5 8.5z" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-gray-500"> Requested:</div>
                <div className="text-base font-bold text-gray-800">
                  {requestedCases.length}
                </div>
              </div>
        </div>
        {requestedCases.length > 0 && (
        <div className="flex flex-col gap-3 max-h-[250px] overflow-y-auto pr-1">
          {requestedCases.map(case_ => (
            <div key={case_.id} className="p-3 rounded-md bg-yellow-100 shadow-sm">
              <p className="text-sm font-semibold text-gray-800">{case_.title}</p>
              <p className="text-xs text-gray-700">
                Created: {new Date(case_.created_at).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
         )}
      </div>
   

  </div>



      <div className="max-w-7xl mx-auto space-y-8">
        

        {newCaseMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {newCaseMessage}
          </div>
        )}

        {showSessionExpiredModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
      <p className="text-lg font-semibold mb-4">Your session has expired!</p>
      <button
        onClick={() => navigate('/login')}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
        Aceptar
      </button>
    </div>
  </div>
)}

        
        

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
  
  {/* Tarjeta 1: Welcome y Logo */}
  <div className="bg-white rounded-lg shadow-md p-4 h-24 flex justify-between items-center">
    
   
        <button
      onClick={() => handleUserTypeChange(user?.user_type === 'OE' ? 'OEM' : 'OE')}
      className={`px-4 py-2 text-xs font-semibold rounded text-white ${user?.user_type === 'OE' ? 'bg-blue-500' : 'bg-green-500'}`}
    >
      {user?.user_type}
    </button>

    <button
                onClick={() => handleLocationChange(user?.location === 'SOUTH' ? 'NORTH' : 'SOUTH')}
                className={`px-4 py-2 text-xs font-semibold rounded text-white ${user?.location === 'SOUTH' ? 'bg-purple-500' : 'bg-green-500'}`}
              >
            {user?.location === 'SOUTH' ? 'SOUTH' : 'NORTH'}
        </button>


            <span
          
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-md shadow-sm transition-all duration-200 
            ${user?.status === 'FREE' 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'}
          `}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-green-200"></span>
          {user?.status || 'FREE'}
        </span>
        

    <h2 className="text-lg font-bold flex items-center">
      <UserCheck className="mr-2" />
      Welcome, {user?.username || 'User'}
    </h2>

    
    
    <img 
      src="https://s3-media0.fl.yelpcdn.com/bphoto/hjP-WvOROtjHRLDv6kralQ/l.jpg" 
      alt="Logo" 
      className="h-10 w-auto"
    />
  </div>

  <div className={`rounded-lg shadow-md p-4 flex flex-col gap-6 ${user?.status === 'FREE' ? 'bg-green-100' : 'bg-red-100'}`}>
  {/* Encabezado */}
  <div className="flex justify-between items-center">

     {/* Cards */}
  <div className="grid grid-cols-3 gap-2">

    {/* Card 1 */}
    <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3">
      <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5l-4-4-4 4" />
        </svg>
      </div>
      <div>
        <div className="text-xs text-gray-500">Today's Cases</div>
        <div className="text-base font-bold text-gray-800">{todayCases.length + recalTodayCases.length}</div>
      </div>
    </div>

    {/* Card 2 */}
    <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3">
      <div className="bg-green-100 text-green-600 p-1 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6h4l-7 7-7-7h4z" />
        </svg>
      </div>
      <div>
        <div className="text-xs text-gray-500">Monthly Cases</div>
        <div className="text-base font-bold text-gray-800">{casesInMonth}</div>
      </div>
    </div>

    {/* Card 3 - Queue */}
<div className="relative bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3">
  
  {/* Bolita parpadeante */}
  {casesQueue.length > 0 ? (

      casesTwoDaysOut.length > 0 ? (
        <>
          {/* Sombra parpadeante */}
          <span className="absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75 animate-ping"></span>
          
          <span className="absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </>
      ) : (
        <>
          {/* Sombra parpadeante */}
          <span className="absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75 animate-ping"></span>
          
          <span className="absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
        </>
      )
    ) : (
      // Bolita verde estática
      <span className="absolute top-1 right-2 inline-flex h-2 w-2 rounded-full bg-yellow-500"></span>
    )}

  

  {/* Icono del reloj */}
  <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  </div>

  {/* Contenido */}
  <div>
    <div className="text-xs text-gray-500">Queue</div>
    <div className="text-base font-bold text-gray-800">
      {casesQueue.filter((c) => c.case_type == user?.user_type).length}
    </div>
  </div>

  
  
</div>
    
  </div>

   

    

    <button
  onClick={handleLogout}
  className="flex items-center ml-5 gap-2 px-3 py-2 text-xs font-semibold rounded-lg bg-white shadow hover:shadow-md border border-red-500 text-red-600 hover:bg-red-50 transition-all duration-200"
>
  <span className="bg-red-100 text-red-600 p-1 rounded-full">
    <LogOut className="w-4 h-4" />
  </span>
  Logout
</button>
  </div>

 
</div>


</div>



        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Briefcase className="mr-2" /> Your Cases
          </h2>

          
             <div className="flex items-end space-x-4">
  {/* Contenedor izquierdo con Search y Date */}
  <div className="flex space-x-4">
    {/* Search Case */}
    <div className="relative w-42">
      <label className="block text-sm font-bold mb-2">Search Case</label>
      <span className="absolute left-3 top-11 transform -translate-x-1/3">
        <Search className="w-4 h-4 text-gray-900" />
      </span>
      <input
        type="text"
        value={caseFilter}
        onChange={(e) => setCaseFilter(e.target.value)}
        placeholder="Search cases..."
        className="pl-10 pr-4 py-2 border rounded w-40"
      />
    </div>

    {/* Select Date */}
    <div className="mb-6">
      <label className="block text-sm font-bold mb-2">Select Date</label>
      <DatePicker
        selected={selectedDate}
        onChange={(date) => setSelectedDate(date)}
        dateFormat="yyyy-MM-dd"
        className="w-40 p-2 border rounded"
      />
    </div>
  </div>

  {/* Status Filter alineado a la derecha */}
  <div className="mb-6 ml-auto">
    <label className="block text-gray-700 text-sm font-bold mb-2">Status</label>
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="w-40 p-2 border rounded"
    >
      <option value="">Select Status</option>
      {status
      .filter(status => status.name !== "DELETED")
      .map((status) => (
        <option key={status.id} value={status.name}>
          {status.name}
        </option>
      ))}

    </select>
  </div>

    <div className="mb-6">
    <label className="block text-gray-700 text-sm font-bold mb-2">Tags</label>
    <select
      value={tagFilter}
      onChange={(e) => setTagFilter(e.target.value)}
      className="w-full p-2 border rounded"
    >
      <option value="">All Tags</option>
      {allTags.map(tag => (
        <option key={tag.id} value={tag.id}>
          {tag.name}
        </option>
      ))}
    </select>
  </div>

</div>



          <div className="overflow-x-auto">
  <table className="min-w-full">
    <thead>
      <tr className="bg-gray-50">
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Title
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Location
        </th>
        <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          #Work order / RECAL     
        </th>
        
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Assigned At
        </th>
        <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Note
        </th>
        <th className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Install Date
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Campaign
        </th>
         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Tags
        </th>
      </tr>
    </thead>

    <tbody className="bg-white divide-y divide-gray-200">
      {filteredCases
      .slice(0, 200)
      .filter((case_)=> case_.status !== 'DELETED') // Excluir casos duplicados
      .map((case_) => (
        <tr key={case_.id}>
          <td className="px-2 py-4 max-w-[170px] truncate whitespace-nowrap"
              title={case_.title}
           >
           {case_.title}
            </td>

          <td className="px-3 py-2 whitespace-nowrap text-sm">
            <a
              className="w-full p-1 text-xs "
            >
              {case_.market}
            </a>

            <br />                                          {/* === Tag de tipo de caso === */}
                            <button
                              onClick={() => handleJobTypeChange(case_.case_type === 'OE' ? 'OEM' : 'OE', case_.id)}
                              className={`px-2 py-0.2 rounded-md text-[10px] font-bold ${case_.case_type === "OEM"
                                ? "bg-blue-600 text-white"
                                : "bg-green-600 text-white"
                                }`}
                            >
                              {case_.case_type}
                            </button>
          </td>
          
          <td className="px-3 py-2 text-black whitespace-nowrap text-sm flex items-center gap-2">
                <input
                  type="text"
                  value={(case_.work_order || '').replace(/\s/g, '')}
                  onChange={(e) => handleInputChange(case_.id, 'work_order', e.target.value)}
                  className="w-3/4 p-1 text-xs border rounded"
                  placeholder="WO#"
                />
                {case_.work_order && (
                  <a
                    href={`https://ahag.omegaedi.com/app/#/invoices/${case_.work_order.trim()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ♎
                  </a>
                )}
              </td>


          <td className="px-3 py-2 text-black whitespace-nowrap text-sm flex items-center gap-2">
              <input
                type="text"
                value={(case_.recal || '').replace(/\s/g, '')}
                onChange={(e) => handleInputChange(case_.id, 'recal', e.target.value)}
                className="w-3/4 p-1 text-xs border rounded"
                placeholder="recal"
              />
              {case_.recal && (
                <a href={`https://ahag.omegaedi.com/app/#/invoices/${case_.recal.trim()}`} target="_blank" rel="noopener noreferrer">
                  ®️
                </a>
              )}
            </td>

          
          <td className="px-6 py-4 whitespace text-xs">
            {new Date(case_.created_at).toLocaleString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })}
          </td>



          {/* Botón para ver la nota en un modal */}
          <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleOpenNoteModal(case_.id, case_.note, llave, case_.lasteditnote)}
                  className="relative flex items-center justify-center"
                >
                  <ChatBubbleLeftIcon
                    className={`w-6 h-6 transition-transform duration-300 ${
                     case_.note && case_.note.trim() !== ""
                        ? "text-blue-900 scale-110"
                        : "text-blue-600 hover:text-green-600"
                        }`}
                        />
                        {case_.note && case_.note.trim() !== "" && (
                             <span className="absolute -top-1 -right-1 block h-3 w-3 rounded-full ring-2 ring-white bg-red-500 animate-pulse" />
                        )}
                </button>
              </td>

          {/* install date */}
          <td className="px-6 py-4 whitespace-nowrap">
                <DatePicker
                    selected={case_.install_date ? parseISO(case_.install_date) : null}
                    onChange={(date) => handleInstallDateChange(date, case_.id, setInstallDates)}
                    dateFormat="yyyy-MM-dd"
                    className="w-32 p-2 border rounded"
                    placeholderText="Select date"
                  />
              </td>

          {/* Selector de estado */}
          <td className="px-6 py-4 whitespace-nowrap">
            <select
              value={case_.status}
              onChange={(e) => updateCaseStatus(case_.id, e.target.value)}
              className={`w-[100px] py-2 rounded ${status.find((item) => item.name === case_.status)?.colorStatus || "bg-gray-100"}`}
            >
               <option value="">Select Status</option>
               {status
               .filter(status => status.name !== "DELETED" && ["BUILT", "PENDING", "VOID", "QUEUE"].includes(status.name))
               .map((status) => (
                 <option key={status.id} value={status.name}>
                   {status.name}
                 </option>
               ))}
            </select>
          </td>

          <td className=''>
                                

                                {case_.inspection ? (
  // ✅ Cuando es inspection
                                  <button
                                    onClick={() => handleInspectionChange(case_.id, case_.inspection)}
                                    className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-600 text-white"
                                  >
                                    Inspection
                                  </button>
                                ) : (
                                  // ⬜ Cuando NO es inspection → espacio vacío pero clickeable
                                  <div
                                    onClick={() => handleInspectionChange(case_.id, case_.inspection)}
                                    className="w-[80px] h-[20px] flex items-center justify-center cursor-pointer hover:bg-gray-100/10 rounded-md transition"
                                    title="Agregar inspection"
                                  >
                                    {/* intencionalmente vacío, solo fondo al hover */}
                                  </div>
                                )}



                          </td>

                          <td>
  <button
    onClick={() => {
      setSelectedCaseForTag(case_.id);
      setShowAddCaseTagModal(true);
    }}
    className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs px-2 py-0.5 rounded-full"
  >
    + Tag
  </button>
  <div className="flex flex-wrap gap-1 mt-2 lowercase">
    {case_.case_tags?.map((caseTag: any) => (
      <button
        key={caseTag.tags.id}
        className="px-2 py-0.5 text-xs rounded-[5px] text-black lowercase"
        style={{ backgroundColor: caseTag.tags.color }}
        onClick={() => removeTagFromCase(case_.id, caseTag.tags.id)}
      >
        {caseTag.tags.name} 
      </button>
    ))}
  </div>
</td>


        </tr>
      ))}
    </tbody>
  </table>
</div>

{showAddCaseTagModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">Add Tag to Case</h3>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">Select Tag</label>
        <select
          className="w-full p-2 border rounded"
          onChange={(e) => {
            const tagId = e.target.value;
            if (tagId && selectedCaseForTag) {
              addTagToCase(selectedCaseForTag, tagId);
              setShowAddCaseTagModal(false);
            }
          }}
        >
          <option value="">Select a tag</option>
          {allTags.map(tag => (
            <option key={tag.id} value={tag.id}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>
      
      <button
        onClick={() => setShowAddCaseTagModal(false)}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Close
      </button>
    </div>
  </div>
)}


 
{/* Modal para mostrar la nota */}
{llave && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <h3 className="text-lg font-bold mb-4">Edit Note</h3>

      {/* Campo de texto para editar la nota */}
      <textarea
        value={selectedNote}
       onChange={(e) => setSelectedNote(e.target.value)}
        className="w-full text-xs p-2 border rounded mb-4"
        placeholder="Write a note here..."
        rows={4}
      />

      {/* Botones para guardar o cancelar */}
      <div className="flex justify-end space-x-2 items-center">
        {/* Mensaje de guardado */}
        {saveMessage && <span className="text-green-600 font-semibold">{saveMessage}</span>}
        {lastEditNote && <span className="text-gray-500 text-xs">{lastEditNote}</span>}
        <button
          onClick={async () => {
            
            // Guardar la nota en la base de datos
            const { error } = await supabase
              .from('cases')
              .update({note: selectedNote, lasteditnote: ""+new Date().toISOString()+ " — " + user?.username})
              .eq('id', selectedCaseId);

            if (!error) {
              //triggerNotification(lastMessage);
              // cerrar modal despues de dos segundos
              setTimeout(() => setLLave(false), 2000);
               // Mostrar mensaje de guardado
              setSaveMessage("Saving...");
               // Ocultar después de 2 segundos
              setTimeout(() => setSaveMessage(null), 2000);

              // Actualizar el estado local
              const updatedCases = filteredCases.map((case_) =>
                case_.id === selectedCaseId ? { ...case_, note: selectedNote } : case_
              );
              setFilteredCases(updatedCases);   
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save
        </button>

        

        <button
          onClick={() => {
            setLLave(false); // Cerrar modal
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

          <div className="w-80 bg-white rounded-lg shadow-md p-3 ml-8 max-h-[900px]">
  {/* Encabezado */}
  <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 mb-5">
    <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full">
      {/* Ícono de reloj */}
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div>
      <div className="text-xs text-gray-500">Pending</div>
      <div className="text-base font-bold text-gray-800">
        {cases.filter((c) => c.status === 'PENDING').length}
      </div>
    </div>
  </div>

  {/* Lista de casos pendientes */}
  <div className="overflow-y-auto flex flex-col gap-3 pr-1 max-h-[750px]">
    {cases
      .filter((c) => c.status === 'PENDING')
      .map((case_) => {
        const installDate = new Date(case_.install_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalizamos la hora
        const diffDays = Math.ceil((installDate - today) / (1000 * 60 * 60 * 24));

        // 🎯 Condiciones
        const isTwoDaysAhead = diffDays === 2;
        const isTomorrow = diffDays === 1;

        // 🎨 Color de fondo según la cercanía
        let bgColor = "bg-yellow-100";
        if (isTwoDaysAhead) bgColor = "bg-red-100";
        else if (isTomorrow) bgColor = "bg-red-100";

        return (
          <div key={case_.id} className={`p-3 rounded-lg shadow-sm border ${bgColor} relative`}>
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-gray-800">{case_.title}</h3>
              <p className="text-xs text-black">Market: {case_.market}</p>
              <p className="text-xs text-black">Install Date: {case_.install_date}</p>
            </div>

            {/* Tipo de caso */}
            <span
              className={`absolute top-31 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                case_.case_type === "OEM" ? "bg-blue-600 text-white" : "bg-green-600 text-white"
              }`}
            >
              {case_.case_type}
            </span>

            {/* Etiquetas de alerta */}
            {isTwoDaysAhead && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                Two days out
              </span>
            )}
            {isTomorrow && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-sm">
                Tomorrow
              </span>
            )}

            {/* Select de estado */}
            <select
              value={case_.status}
              onChange={(e) => updateCaseStatus(case_.id, e.target.value)}
              className={`text-xs font-semibold px-3 py-1 rounded-md transition duration-150 ease-in-out shadow-sm ${
                status.find((item) => item.name === case_.status)?.colorStatus || "bg-gray-100"
              }`}
            >
              <option value="">Select Status</option>
              {status
                .filter((status) => status.name !== "DELETED")
                .map((status) => (
                  <option key={status.id} value={status.name}>
                    {status.name}
                  </option>
                ))}
            </select>
          </div>
        );
      })}
  </div>

      <UserQueue
      myQueue={myQueue}
      updateCaseStatus={updateCaseStatus}
      handleInputChange={handleInputChange}
      handleJobTypeChange={handleJobTypeChange}
      timeSince={timeSince}
    />
  
</div>




    </div>

    
  );
}


