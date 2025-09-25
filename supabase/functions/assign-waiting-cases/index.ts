// supabase/functions/assign-waiting-cases/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (_req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const headers = {
    "apikey": supabaseKey,
    "Authorization": `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };

  // 1. Traer casos en estado WAITING_ASSIGNMENT
  const casesRes = await fetch(`${supabaseUrl}/rest/v1/cases?status=eq.WAITING_ASSIGNMENT&select=*`, { headers });
  const cases = await casesRes.json();

  if (!Array.isArray(cases) || cases.length === 0) {
    return new Response("No waiting cases", { status: 200 });
  }

  // 2. Traer usuarios OE disponibles y ordenarlos por last_free_at ASC
  const usersRes = await fetch(
    `${supabaseUrl}/rest/v1/users?user_type=eq.OE&availability=eq.ON_SITE&status=eq.FREE&order=last_free_at.asc&select=id,last_free_at`,
    { headers }
  );
  const users = await usersRes.json();

  if (!Array.isArray(users) || users.length === 0) {
    return new Response("No available users", { status: 200 });
  }

  const updates = [];

  for (const caseItem of cases) {
    if (users.length === 0) break;

    const assignedUser = users.shift(); // El primero de la lista
    const patchCase = fetch(`${supabaseUrl}/rest/v1/cases?id=eq.${caseItem.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        assigned_to: assignedUser.id,
        status: "PENDING",
      }),
    });

    const patchUser = fetch(`${supabaseUrl}/rest/v1/users?id=eq.${assignedUser.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        status: "BUSY",
      }),
    });

    updates.push(patchCase, patchUser);
  }

  await Promise.all(updates);

  return new Response("Cases assigned", { status: 200 });
});
