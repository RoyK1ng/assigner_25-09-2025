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

export const fetchTags = async (setTags) => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*');
    if (error) throw error;
    setTags(data || []);
  } catch (err) {
    console.error("Error fetching tags:", err);
  }
};

export const fetchCaseTags = async (setCaseTags) => {
  try {
    const pageSize = 1000; // máximo por request
    const total = 5000; // número total de tags que queremos traer
    const pages = Math.ceil(total / pageSize);
    let allData = [];

    for (let i = 0; i < pages; i++) {
      const { data, error } = await supabase
        .from('case_tags')
        .select('*, tags(*)')
        .range(i * pageSize, (i + 1) * pageSize - 1);

      if (error) {
        console.error("Error al obtener tags del caso:", error);
        setCaseTags({});
        return;
      }

      if (data.length === 0) break; // no hay más datos
      allData = [...allData, ...data];
    }

    // Agrupar tags por case_id
    const groupedTags = allData.reduce((acc, caseTag) => {
      const { case_id, tags } = caseTag;
      if (!acc[case_id]) {
        acc[case_id] = [];
      }
      acc[case_id].push(tags);
      return acc;
    }, {});

    setCaseTags(groupedTags);

  } catch (err) {
    console.error("Error inesperado al obtener tags:", err);
    setCaseTags({});
  }
};



export const addTagToCase = async (caseId, tagId, fetchCaseTags, setCaseTags) => {
  try {
    const { error } = await supabase
      .from('case_tags')
      .insert([{ case_id: caseId, tag_id: tagId }]);
    if (error) throw error;
    // Refrescar los tags del caso
    await fetchCaseTags(setCaseTags);
  } catch (err) {
    console.error("Error adding tag to case:", err);
  }
};

export const removeTagFromCase = async (caseId, tagId, fetchCaseTags, setCaseTags) => {
  try {
    const { error } = await supabase
      .from('case_tags')
      .delete()
      .eq('case_id', caseId)
      .eq('tag_id', tagId);
    if (error) throw error;
    // Refrescar los tags del caso
    await fetchCaseTags(setCaseTags);
  } catch (err) {
    console.error("Error removing tag from case:", err);
  }
};

export const createTag = async (name, color, setTags) => {
  try {
    // Verificar si el tag ya existe
    const { data: existingTags, error: checkError } = await supabase
      .from('tags')
      .select('*')
      .eq('name', name);
    if (checkError) throw checkError;
    if (existingTags.length > 0) {
      alert("El tag ya existe.");
      return;
    }
    // Insertar el nuevo tag
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name, color }])
      .select();
    if (error) throw error;
    if (data) setTags(prev => [...prev, data[0]]);
  } catch (err) {
    console.error("Error creating tag:", err);
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

  export const handleLocationChangeCases = async (newLocation, currentCaseId) => {
    

    const { error } = await supabase
      .from('cases')
      .update({ location: newLocation })
      .eq('id', currentCaseId);

    if (error) {
      console.error('Error updating user type:', error.message);
    } else {
      setUserLocation(newLocation);
      window.location.reload();
    }
  };


  export const handleJobTypeChange = async (newType, currentJobId) => {
    

    const { error } = await supabase
      .from('cases')
      .update({ case_type: newType })
      .eq('id', currentJobId);

    if (error) {
      console.error('Error updating user type:', error.message);
    } else {
      
    }
  };

  export const handleInspectionChange = async (caseId, currentValue, fetchData) => {
  try {
    const { error } = await supabase
      .from("cases")
      .update({ inspection: !currentValue }) // toggle
      .eq("id", caseId);

    if (error) {
      console.error("Error updating inspection:", error.message);
    } else {
      fetchData(); // refresca lista
    }
  } catch (err) {
    console.error("Unhandled error in handleInspectionChange:", err);
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
  jobFilter, tagFilter, filterEmptyWorkOrder
) => {
  try {
    // 🔹 Traemos 5000 filas usando rangos de 1000 en 1000
    let allCases = [];
    const limit = 1000; // máximo por request
    const total = 4000; // filas totales que quieres traer
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
      const normalizedFilter = marketFilter.toLowerCase();
      filtered = filtered.filter((case_) => 
        case_.market?.toLowerCase().includes(normalizedFilter)
      );
    }
    
    if (jobFilter) {
      console.log('Filtering job', jobFilter);

      filtered = filtered.filter((case_) => case_.case_type === jobFilter);
    }

    if (tagFilter) {
  // Obtener los casos que tienen el tag seleccionado
  const { data: caseTags, error: caseTagsError } = await supabase
    .from('case_tags')
    .select('case_id')
    .eq('tag_id', tagFilter);

  if (caseTagsError) {
    console.error("Error fetching case tags:", caseTagsError);
  } else {
    const caseIdsWithTag = caseTags.map(ct => ct.case_id);
    filtered = filtered.filter((case_) => caseIdsWithTag.includes(case_.id));
  }
}
console.log('Filtering cases with empty work order', filterEmptyWorkOrder);
if (filterEmptyWorkOrder) {
  filtered = filtered.filter(
    (case_) => !case_.work_order || case_.work_order.trim() === ''
  );
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
      .eq('user_active', true);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Casos construidos/aprobados/oe cost
    const { data: dailyBuiltCases } = await supabase
      .from('cases')
      .select('*')
      .gte('completed_at', today.toISOString())
      .lt('completed_at', tomorrow.toISOString())
      .in('status', ['BUILT', 'APPROVED', 'OE COST']);

    // Casos pendientes
    const { data: dailyPendingCases } = await supabase
      .from('cases')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .eq('status', 'PENDING');

    //casos en queue
    const { data: dailyQueueCases } = await supabase
      .from('cases')
      .select('*')
      .gte('created_at', today.toISOString())
      .lt('created_at', tomorrow.toISOString())
      .eq('status', 'QUEUE');

    if (usersData) {
      const builtCounts = {};
      const pendingCounts = {};
      const queueCases = {};

      usersData.forEach(user => {
        builtCounts[user.id] = 0;
        pendingCounts[user.id] = 0;
        queueCases[user.id] = 0;
      });

      // Contar BUILT/APPROVED/OE COST
      dailyBuiltCases?.forEach(case_ => {
        const increment = case_.recal && case_.recal.trim() !== '' ? 2 : 1;
        if (case_.assigned_to) {
          builtCounts[case_.assigned_to] += increment;
        }
      });

      // Contar PENDING
      dailyPendingCases?.forEach(case_ => {
        const increment = case_.recal && case_.recal.trim() !== '' ? 1 : 1;
        if (case_.assigned_to) {
          pendingCounts[case_.assigned_to] += increment;
        }
      });

      dailyQueueCases?.forEach(case_ => {
        
        if (case_.assigned_to) {
          queueCases[case_.assigned_to] += 1;
        }
      });



      // Agregar ambos conteos al usuario
      const usersWithCounts = usersData.map(user => ({
        ...user,
        casesPerDay: {
          built: builtCounts[user.id],
          pending: pendingCounts[user.id],
          queue: queueCases[user.id]
        }
      }));

      setUsers(usersWithCounts);
    }
  } catch (error) {
    console.error('Error fetching users and cases:', error);
  }
};


export const assignCase = async (e, title, location, market, caseInfo, workOrder, selectedUser, setTitle, setSelectedUser, users, fetchData, setErrorMessage, currentUser, userType, installDate, setInstallDate, setSearch, toast, jobtype, userLocation) => {
  e.preventDefault();

  const { data: { user } } = await supabase.auth.getUser();
  const assignedBy = user.user_metadata.username; 
  
  
  let assignedUser = selectedUser;
  setErrorMessage('');

  if (!assignedUser) {
    //const freeUsers = users
      //.filter(u => u.status === 'FREE' && u.availability === 'ON_SITE' && u.user_type === userType);
    const freeUsers = users
      .filter(u => u.status === 'FREE' && u.availability === 'ON_SITE' && u.location === userLocation && u.user_type === jobtype);


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
              case_type: jobtype,
              location: userLocation
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
        status: 'QUEUE',
        case_type: jobtype,
        location: userLocation
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
        completed_at: newStatus === 'BUILT' || newStatus === 'APPROVED' || newStatus === 'OE COST' ? new Date().toISOString() : null,
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

