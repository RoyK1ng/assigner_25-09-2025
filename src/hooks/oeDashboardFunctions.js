import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

export const fetchAllCases = async (userType, setCasesQueue) => {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*')
      .eq('status', "PENDING")
      .eq('case_type', userType);

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

export const handleUserTypeChange = async (newType, currentUserName, setUserType) => {
    

    const { error } = await supabase
      .from('users')
      .update({ user_type: newType })
      .eq('username', currentUserName);

    if (error) {
      console.error('Error updating user type:', error.message);
    } else {
      setUserType(newType);
      window.location.reload();
    }
  };

  export const handleLocationChange = async (newLocation, currentUserName, setUserLocation) => {
    

    const { error } = await supabase
      .from('users')
      .update({ location: newLocation })
      .eq('username', currentUserName);

    if (error) {
      console.error('Error updating user type:', error.message);
    } else {
      setUserLocation(newLocation);
      window.location.reload();
    }
  };


  //fetch cases with filters

export const fetchCases = async (
  selectedDate,
  csrFilter,
  statusFilter,
  marketFilter,
  setCases,
  caseFilter,
  userType,
  setCasesinQueue,
  installDateFilter,
  setInstallDateFilter,
  startDate,
  endDate,
  jobFilter
) => {
  try {
    // 🔹 Traemos 5000 filas usando rangos de 1000 en 1000
    let allCases = [];
    const limit = 1000; // máximo por request
    const total = 2000; // filas totales que quieres traer
    const pages = Math.ceil(total / limit);

    for (let i = 0; i < pages; i++) {
      const { data, error } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })
        .range(i * limit, (i + 1) * limit - 1);

      if (error) throw error;
      allCases = allCases.concat(data || []);
    }

    if (allCases.length === 0) return;

    setCasesinQueue(allCases);

    // 🔹 Aplicamos los filtros en frontend
    let filtered = allCases;

    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      filtered = filtered.filter((case_) => {
        if (!case_.created_at) return false;
        const caseDate = new Date(case_.created_at);
        return caseDate >= start && caseDate <= end;
      });
    } else if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      filtered = filtered.filter((case_) => {
        const caseDate = new Date(case_.created_at);
        return caseDate >= new Date(formattedDate) && caseDate <= new Date(`${formattedDate}T23:59:59.999Z`);
      });
    }

    if (installDateFilter) {
      const formattedDate = installDateFilter.toISOString().split('T')[0];
      filtered = filtered.filter((case_) => {
        const caseDate = new Date(case_.install_date);
        return caseDate >= new Date(formattedDate) && caseDate <= new Date(`${formattedDate}T23:59:59.999Z`);
      });
    }

    if (csrFilter) {
      filtered = filtered.filter((case_) => case_.assigned_to === csrFilter);
    }

    if (caseFilter) {
      const search = caseFilter.trim().toLowerCase();
      filtered = filtered.filter((case_) =>
        case_.title?.toLowerCase().includes(search) ||
        case_.work_order?.toLowerCase().includes(search) ||
        case_.recal?.toLowerCase().includes(search)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((case_) => case_.status === statusFilter);
    }

    if (marketFilter) {
      filtered = filtered.filter((case_) => case_.market === marketFilter);
    }
    if (jobFilter) {
      filtered = filtered.filter((case_) => case_.case_type === jobFilter);
    }

    setCases(filtered);
  } catch (err) {
    console.error("Error fetching cases:", err);
  }
};


  //End fetch cases with filters


//fetch cases queue

export const fetchCasesQueue = async ( setCases, userType) => {
  let query = supabase
    .from('cases')
    .select('*')
    .eq('case_type', userType)
    .order('created_at', { ascending: false });

  const { data } = await query;
  if (data) setCases(data);
};

export const fetchUsers = async (setUsers, userType) => {
  try {
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .eq('is_admin', false)


      
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    //const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    //const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    const { data: dailyCasesData } = await supabase
        .from('cases')
        .select('*')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .not('status', 'eq', 'KICK BACK')
        .not('status', 'eq', 'VOID')
        .not('status', 'eq', 'DUPLICATED')
        .not('status', 'eq', 'DELETED')
        .not('status', 'eq', 'DENIED')
        .not('status', 'eq', 'NOT IN SLACK')
        .not('status', 'eq', 'NOT IN GB')
        .not('status', 'eq', 'NO REPLY')
        .not('status', 'eq', 'INSPECTION')
        .not('status', 'eq', 'OEM JOB')
        .not('status', 'eq', 'NOT REFERRAL')
        .not('status', 'eq', '3 DAYS OUT')
        
{/*
    const { data: monthlyCasesData } = await supabase
      .from('cases')
      .select('*')
      .gte('created_at', firstDayOfMonth.toISOString())
      .lt('created_at', firstDayNextMonth.toISOString())
      .not('status', 'in', '("KICK BACK", "VOID", "DUPLICATED", "DELETED", "PENDING", "DENIED", "NOT IN SLACK", "NOT IN GB", "NO REPLY")')
      .eq('case_type', userType);   */}

    if (usersData && dailyCasesData ) {
      const dailyCaseCounts = {};
      //const monthlyCaseCounts = {};

      usersData.forEach(user => {
        dailyCaseCounts[user.id] = 0;
        //monthlyCaseCounts[user.id] = 0;
      });

      dailyCasesData.forEach(case_ => {
        
          const increment = case_.recal && case_.recal.trim() !== '' ? 2 : 1;
          dailyCaseCounts[case_.assigned_to] += increment;
        
      });
{/* 
      monthlyCasesData.forEach(case_ => {
        
          const increment = case_.recal && case_.recal.trim() !== '' ? 2 : 1;
          monthlyCaseCounts[case_.assigned_to] += increment;

          ...user,
        casesPerDay: {
          [today.toLocaleDateString()]: dailyCaseCounts[user.id]
        },
        casesPerMonth: {
          [today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })]: monthlyCaseCounts[user.id]
        }
        
      }); */}

      const usersWithCounts = usersData.map(user => ({
        ...user,
        casesPerDay: {
          [today.toLocaleDateString()]: dailyCaseCounts[user.id]
        }
      }));

      setUsers(usersWithCounts);
       
    }
  } catch (error) {
    console.error('Error fetching users and cases:', error);
  }
};

export const assignCase = async (e, title, location, market, caseInfo, workOrder, selectedUser, setTitle, setSelectedUser, users, fetchData, setErrorMessage, currentUser, userType, installDate, setInstallDate, setSearch, toast) => {
  e.preventDefault();

  const { data: { user } } = await supabase.auth.getUser();
  const assignedBy = user.user_metadata.username; 
  
  
  let assignedUser = selectedUser;
  setErrorMessage('');

  if (!assignedUser) {
    //const freeUsers = users
      //.filter(u => u.status === 'FREE' && u.availability === 'ON_SITE' && u.user_type === userType);
    const freeUsers = users
      .filter(u => u.status === 'FREE' && u.availability === 'ON_SITE' && u.user_type === userType);


    if (freeUsers.length === 0) {
          const { error: caseError } = await supabase
          .from('cases')
          .insert([
            {
              title: title.trim(),
              market: location,
              install_date: installDate ? installDate.toISOString().split("T")[0] : null,
              case_info: caseInfo || null,
              work_order: workOrder || null,
              assigned_to: null, // No hay usuario asignado
              scheduled_by: currentUser.email.split("@")[0],
              status: 'WAITING_ASSIGNMENT',
              case_type: userType
            }
          ]);

        if (!caseError) {
                  await supabase
                    .from('users')
                    .update({
                      status: 'BUSY',
                      last_busy_time: new Date().toISOString(),
                    })
                    .eq('id', assignedUser);

                  const today = new Date().toLocaleDateString();
                  const { data: userData } = await supabase
                    .from('users')
                    .select('casesperday')
                    .eq('id', assignedUser)
                    .single();

                  if (userData) {
                    const updatedCasesPerDay = { ...userData.casesperday };
                    updatedCasesPerDay[today] = (updatedCasesPerDay[today] || 0) + 1;

                    await supabase
                      .from('users')
                      .update({ casesperday: updatedCasesPerDay })
                      .eq('id', assignedUser);
                  }

                  setTitle('');
                  setSelectedUser('');
                  setInstallDate(null);
                  setSearch('');
                  toast('Case assigned successfully', {
                    type: 'success'
                  })
                  await fetchData();
                }
            return;
    }

    const today = new Date().toLocaleDateString();

    freeUsers.sort((a, b) => {
      const casesTodayA = a.casesPerDay?.[today] || 0;
      const casesTodayB = b.casesPerDay?.[today] || 0;
      return casesTodayA - casesTodayB;
    });

    assignedUser = freeUsers[0].id;
  }

  const input = title.trim();
  const reversed = input.split(" ").reverse().join(" ");
  const orFilter = `title.ilike.%${input}%,title.ilike.%${reversed}%`;
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const oneMonthAgoISO = oneMonthAgo.toISOString();

  const { data: cases } = await supabase
    .from('cases')
    .select('id, assigned_to, title, status, note, created_at')
    .or(orFilter)
    .gte('created_at', oneMonthAgoISO) // Solo casos dentro del último mes
    .order('created_at', { ascending: false });

  const existingCase = cases?.[0];

  if (existingCase) {
    const previousUser = users.find(u => u.id === existingCase.assigned_to)?.username;
    const confirmReassign = window.confirm(`The case "${title}" has already been assigned to ${previousUser} with status ${existingCase.status} Nota: ${existingCase.note || "N/A"}, created at: ${new Date(existingCase.created_at).toLocaleString()}. Do you want to reassign it?`);
    if (!confirmReassign) return;
  }

  const { error: caseError } = await supabase
    .from('cases')
    .insert([
      {
        title: title.trim(),
        market: location,
        case_info: caseInfo || null,
        work_order: workOrder || null,
        install_date: installDate ? installDate.toISOString().split("T")[0] : null,
        assigned_to: assignedUser,
        scheduled_by: currentUser.email.split("@")[0],
        status: 'PENDING',
        case_type: userType
      }
    ]);

  if (!caseError) {
    await supabase
      .from('users')
      .update({
        status: 'BUSY',
        last_busy_time: new Date().toISOString(),
      })
      .eq('id', assignedUser);

    const today = new Date().toLocaleDateString();
    const { data: userData } = await supabase
      .from('users')
      .select('casesperday')
      .eq('id', assignedUser)
      .single();

    if (userData) {
      const updatedCasesPerDay = { ...userData.casesperday };
      updatedCasesPerDay[today] = (updatedCasesPerDay[today] || 0) + 1;

      await supabase
        .from('users')
        .update({ casesperday: updatedCasesPerDay })
        .eq('id', assignedUser);
    }

    setTitle('');
    setSelectedUser('');
    setInstallDate(null);
    setSearch('');
    toast('Case assigned successfully', {
                    type: 'success'
    })
    await fetchData();


  }

};

export const deleteCase = async (id, fetchData) => {
  const { data: caseToDelete } = await supabase
    .from('cases')
    .select('assigned_to')
    .eq('id', id)
    .single();

  const { error } = await supabase
    .from('cases')
    .delete()
    .eq('id', id);

  if (!error && caseToDelete) {
    const { data: userCases } = await supabase
      .from('cases')
      .select('id')
      .eq('assigned_to', caseToDelete.assigned_to)
      .neq('status', 'COMPLETED');

   
    await fetchData();
  }
};

export const removedCase = async (id, fetchData, status) => {
  // 1. Obtener el técnico asignado (si existe)
  const { data: caseToDelete } = await supabase
    .from('cases')
    .select('assigned_to')
    .eq('id', id)
    .single();

  // 2. En lugar de eliminar, actualiza el status a 'DELETED'
  const { error } = await supabase
    .from('cases')
    .update({ status: status })  // o 'VOID' si prefieres
    .eq('id', id);

  // 3. Si todo va bien, actualizar la UI
  if (!error && caseToDelete) {
    const { data: userCases } = await supabase
      .from('cases')
      .select('id')
      .eq('assigned_to', caseToDelete.assigned_to)
      .neq('status', 'COMPLETED');

    await fetchData();
  }
};

export const toggleUserStatus = async (userId, currentStatus, setError, fetchUsers) => {
  const newStatus = currentStatus === 'FREE' ? 'BUSY' : 'FREE';
  const now = new Date().toISOString();

  try {
    const updateData = {
      status: newStatus,
      last_free_time: newStatus === 'FREE' ? now : null,
      last_busy_time: newStatus === 'BUSY' ? now : null,
      availability:"ON_SITE"
    };

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await fetchUsers();
  } catch (err) {
    console.error('Error updating user status:', err);
    setError('Error updating user status');
  }
};

export function timeSince(dateString) {
  const now = new Date();
  const updatedAt = new Date(dateString);
  const seconds = Math.floor((now - updatedAt) / 1000);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  
  
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${seconds}s`;
}

export const toggleAvailability = async (userId, currentAvailability, fetchUsers) => {
  const newAvailability = currentAvailability === 'OFF' ? 'ON_SITE' : 'OFF';
  await supabase
    .from('users')
    .update({ availability: newAvailability })
    .eq('id', userId);

  await fetchUsers();
};

export const setAllUsersFree = async (fetchUsers) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'FREE',
        last_free_time: new Date().toISOString(),
      })
      .eq('availability', 'ON_SITE')
      .neq('status', 'FREE');

    if (error) {
      console.error('Error al actualizar usuarios:', error.message);
    } else {
      console.log('Usuarios ON_SITE ahora están en FREE');
      await fetchUsers();
    }
  } catch (err) {
    console.error('Error en setOnSiteUsersFree:', err);
  }
};

export const setAllUsersBusy = async (fetchUsers) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'BUSY',
        last_busy_time: new Date().toISOString(), // Registrar el tiempo actual
      })
      .eq('availability', 'ON_SITE')
      .neq('status', 'BUSY');

    if (error) {
      console.error('Error al actualizar usuarios:', error.message);
    } else {
      console.log('Usuarios ON_SITE ahora están en BUSY');
      await fetchUsers();
    }
  } catch (err) {
    console.error('Error en setOnSiteUsersBusy:', err);
  }
};

export const handleUpdateCase = async (caseId, editWorkOrder, editCaseInfo, editRecal, setEditingCaseId, setEditWorkOrder, setEditCaseInfo, setEditRecal, fetchData) => {
  const { error } = await supabase
    .from('cases')
    .update({
      work_order: editWorkOrder,
      case_info: editCaseInfo,
      recal: editRecal
    })
    .eq('id', caseId);

  if (!error) {
    setEditingCaseId(null);
    setEditWorkOrder('');
    setEditCaseInfo('');
    setEditRecal('');
    await fetchData();
  } else {
    console.error('Error al actualizar el caso:', error.message);
  }
};

export const handleInputChange = async (caseId, field, value, cases, setCases) => {
  const updatedCases = cases.map(case_ => {
    if (case_.id === caseId) {
      return { ...case_, [field]: value };
    }
    return case_;
  });

  setCases(updatedCases);

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

export const handleInstallDateChange = async (date, caseId, setInstallDates) => {
  if (!date) {
    console.error("No date provided");
    return;
  }

  // Asegúrate de que la fecha esté en el formato correcto
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

export const updateCaseStatus = async (caseId, newStatus, setError, fetchData) => {
  try {
    const { error: caseError } = await supabase
      .from('cases')
      .update({
        status: newStatus,
        completed_at: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
      })
      .eq('id', caseId);

    if (caseError) {
      setError(caseError.message);
    } else {
      await fetchData();
    }
  } catch (err) {
    console.error('Error updating case status:', err);
    setError('Error updating case status');
  }
};

export const findCase = async (e, finder, setFinder, users, setErrorMessage) => {
  e.preventDefault();

  const input = finder.replace(/\s+/g, ' ').trim();
  const reversedInput = input.split(" ").reverse().join(" ");

  // Calcular la fecha hace un mes
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Convertir a formato ISO (compatible con Supabase)
  const oneMonthAgoISO = oneMonthAgo.toISOString();

  const { data: cases, error } = await supabase
    .from('cases')
    .select('id, assigned_to, title, status, note, created_at')
    .or(`title.ilike.${input},title.ilike.${reversedInput}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al buscar el caso:", error.message);
    alert("Error buscando el caso.");
    return;
  }

  const existingCase = cases?.[0];

  if (existingCase) {
    const previousUser = users.find(u => u.id === existingCase.assigned_to)?.username;
    
    window.confirm(
      `The case "${existingCase.title}" has already been assigned to ${previousUser || "On queue..."} with status ${existingCase.status}.
       Nota: ${existingCase.note || "N/A"}, created at: ${new Date(existingCase.created_at).toLocaleString()} `
    );
  } else {
    window.confirm(`The case "${finder}" has not been assigned`);
  }

  setFinder('');
};

