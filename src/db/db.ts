export const status = [
  { name: "PENDING", id: 1, colorMap: "text-black bg-white hover:bg-yellow-600",            colorStatus: "bg-yellow-500 text-black hover:bg-yellow-600" },
  { name: "BUILT", id: 2, colorMap: "bg-green-300 text-black hover:bg-green-600",           colorStatus: "bg-green-500 text-black hover:bg-green-600" },
  { name: "INSPECTION", id: 2.1, colorMap: "bg-purple-500 text-black hover:bg-purple-600",   colorStatus: "bg-purple-600 text-black hover:bg-purple-600" },
  { name: "APPROVED", id: 3, colorMap: "bg-green-400 text-black hover:bg-green-600",        colorStatus: "bg-green-600 text-black hover:bg-green-600" },
  { name: "OE COST", id: 4, colorMap: "bg-blue-400 text-black hover:bg-blue-500",           colorStatus: "bg-blue-600 text-white hover:bg-blue-400" },
  { name: "NO REPLY", id: 5, colorMap: "bg-yellow-600 text-black hover:bg-yellow-600",      colorStatus: "bg-yellow-500 text-black hover:bg-yellow-600" },
  { name: "NOT IN OMEGA", id: 6, colorMap: "bg-red-300 text-black hover:bg-red-800",        colorStatus: "bg-red-600 text-black hover:bg-red-800" },
  { name: "NOT IN SLACK", id: 7, colorMap: "bg-red-300 text-black hover:bg-red-800",        colorStatus: "bg-red-600 text-black hover:bg-red-800" },
  { name: "OEM JOB", id: 8, colorMap: "bg-blue-400 text-black hover:bg-blue-500",           colorStatus: "bg-blue-500 text-black hover:bg-blue-500" },
  { name: "OE JOB", id: 9, colorMap: "bg-blue-300 text-black",                              colorStatus: "bg-blue-400 text-black hover:bg-blue-500" },
  { name: "WAITING EMAIL", id: 10, colorMap: "bg-blue-300 text-black hover:bg-red-800",     colorStatus: "bg-blue-600 text-black hover:bg-red-800" },
  { name: "REQUESTED", id: 11, colorMap: "bg-yellow-600 text-black hover:bg-yellow-800",    colorStatus: "bg-yellow-600 text-black hover:bg-yellow-800" },
  { name: "OCEAN H./EQ", id: 12, colorMap: "bg-blue-500 text-black hover:bg-yellow-600",    colorStatus: "bg-blue-600 text-black hover:bg-yellow-600" },
  { name: "KICK BACK", id: 13, colorMap: "bg-red-500 text-black hover:bg-gray-500",         colorStatus: "bg-red-600 text-black hover:bg-gray-800" },
  { name: "VOID", id: 15, colorMap: "bg-red-500 text-black hover:bg-gray-500",              colorStatus: "bg-red-700 text-black hover:bg-black" },
  { name: "DENIED", id: 16, colorMap: "bg-purple-500 text-black hover:bg-purple-600",       colorStatus: "bg-purple-600 text-black hover:bg-purple-600" },
  { name: "DUPLICATED", id: 17, colorMap: "bg-blue-500 text-black ",                        colorStatus: "bg-blue-600 text-black hover:bg-yellow-800" },
  { name: "DELETED", id: 18, colorMap: "bg-red-600 text-black hover:bg-red-800",            colorStatus: "bg-red-700 text-black" },
  { name: "NOT REFERRAL", id: 19, colorMap: "bg-orange-300 text-black",                     colorStatus: "bg-orange-400 text-black" },
  { name: "3 DAYS OUT", id: 20, colorMap: "bg-orange-300 text-black",                       colorStatus: "bg-orange-400 text-black" },
  { name: "QUEUE", id: 21, colorMap: "bg-orange-300 text-black",                       colorStatus: "bg-orange-400 text-black" }
];




export const markets = [
  { name: "AHAG_Sarasota", id: 1 },
  { name: "AHAG_Orlando", id: 2 },
  { name: "AHAG_Tampa", id: 3 },
  { name: "AHAG_Ft_Myers", id: 4 },
  { name: "AHAG_Jacksonville", id: 5 },
  { name: "AHAG_Ocala", id: 6 },
  { name: "AHAG_Columbia", id: 7 },
  { name: "AHAG_Tallahassee", id: 8 },
  { name: "AHAG_Miami", id: 9 },
  { name: "IAG_Sarasota", id: 10 },
  { name: "SIG_Sarasota", id: 11 },
  { name: "IAG_Orlando", id: 12 },
  { name: "IAG_Tampa", id: 13 },
  { name: "IAG_Ft_Myers", id: 14 },
  { name: "IAG_Jacksonville", id: 15 },
  { name: "IAG_Ocala", id: 16 },
  { name: "IAG_Columbia", id: 17 },
  { name: "IAG_Tallahassee", id: 18 },
  { name: "IAG_Miami", id: 19 },
  { name: "SIG_Orlando", id: 20 },
  { name: "SIG_Tampa", id: 21 },
  { name: "SIG_Ft_Myers", id: 22 },
  { name: "SIG_Jacksonville", id: 23 },
  { name: "SIG_Ocala", id: 24 },
  { name: "SIG_Columbia", id: 25 },
  { name: "SIG_Tallahassee", id: 26 },
  { name: "SIG_Miami", id: 27 }
];

export const territoryMap = {
    AHAG_Sarasota: "SOUTH",
    AHAG_Orlando: "NORTH",
    AHAG_Tampa: "SOUTH",
    AHAG_Ft_Myers: "SOUTH",
    AHAG_Jacksonville: "NORTH",
    AHAG_Ocala: "NORTH",
    AHAG_Columbia: "NORTH",
    AHAG_Tallahassee: "NORTH",
    AHAG_Miami: "SOUTH",
    IAG_Sarasota: "SOUTH",
    SIG_Sarasota: "SOUTH",
    IAG_Orlando: "NORTH",
    IAG_Tampa: "SOUTH",
    IAG_Ft_Myers: "SOUTH",
    IAG_Jacksonville: "NORTH",
    IAG_Ocala: "NORTH",
    IAG_Columbia: "NORTH",
    IAG_Tallahassee: "NORTH",
    IAG_Miami: "SOUTH",
    SIG_Orlando: "NORTH",
    SIG_Tampa: "SOUTH",
    SIG_Ft_Myers: "SOUTH",
    SIG_Jacksonville: "NORTH",
    SIG_Ocala: "NORTH",
    SIG_Columbia: "NORTH",
    SIG_Tallahassee: "NORTH",
    SIG_Miami: "SOUTH",
  };

  export const marketCities = [
  { name: "Sarasota", id: 1 },
  { name: "Orlando", id: 2 },
  { name: "Tampa", id: 3 },
  { name: "Ft_Myers", id: 4 },
  { name: "Jacksonville", id: 5 },
  { name: "Ocala", id: 6 },
  { name: "Columbia", id: 7 },
  { name: "Tallahassee", id: 8 },
  { name: "Miami", id: 9 },
];

// Colores para cada segmento del gráfico de pastel
  export const COLORS = {
    'PENDING': '#eab308',        // Amarillo
    'KICK BACK': 'red',      // Rojo fuerte
    'BUILT': '#22c55e',          // Verde
    'APPROVED': '#22c55e',       // Verde
    'OE COST': '#60a5fa',        // Azul claro (Tailwind blue-400)
    'OEM JOB': '#60a5fa',        // Azul claro
    'OCEAN H./EQ': '#2563eb',    // Azul intenso (Tailwind blue-600)
    'REQUESTED': '#FFA500',      // Naranja
    'NO REPLY': '#eab308',       // Amarillo (mismo que 'PENDING')
    'NOT IN GB': '#f87171',      // Rojo claro (Tailwind red-400)
    'NOT IN SLACK': '#fca5a5',   // Rojo más claro (Tailwind red-300)
    'WAITING EMAIL': '#93c5fd',  // Azul claro (Tailwind blue-300)
    'DELETED': 'black',        // Rojo fuerte (Tailwind red-600)
    'DUPLICATED': '#1e40af',     // Azul oscuro (Tailwind blue-800)
    'INSPECTION': '#7e22ce',     // Púrpura oscuro (Tailwind purple-700)
    'VOID': '#000000',           // Negro
    'DENIED': '#9333ea',
    'BUILT, NOT GB': '#22c55e',
    'WAITING_ASSIGNMENT': '#eab308',        // Púrpura medio (Tailwind purple-500)
  };