
import { Trash2, Clock } from 'lucide-react'    

export default function Queue( { casesinQueue, updateCaseStatus, setErrorMessage, fetchData, removedCase, timeSince }) {
  return (
    <>
      <div className="w-1/5 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-4 mr-2 text-white">

        <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center space-x-3 mb-5">
          <div className="bg-yellow-100 text-yellow-600 p-1 rounded-full">
            {/* Ícono de reloj */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">Queue</div>
            <div className="text-base font-bold text-gray-800">
              {casesinQueue.filter((c) => c.status === 'WAITING_ASSIGNMENT').length}
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[600px] space-y-3 pr-1 scrollbar-thin scrollbar-thumb-yellow-400/60 scrollbar-track-transparent">
          {casesinQueue

            .filter((c) => c.status === 'WAITING_ASSIGNMENT')
            .map((case_) => {
              const installDate = new Date(case_.install_date);
              const today = new Date();
              const diffDays = Math.ceil((installDate - today) / (1000 * 60 * 60 * 24));
              const currentDay = today.getDay();
              const installDay = installDate.getDay();

              let isTwoDaysAhead = diffDays === 2;
              if (currentDay === 6 && installDay === 2) {
                isTwoDaysAhead = true;
              }

              const color = isTwoDaysAhead ? "bg-red-500" : "bg-yellow-500/80"
              return (
                <div
                  key={case_.id}
                  className={`relative p-3 rounded-xl mt-2 border-l-4 shadow-md transition-all ${isTwoDaysAhead ? 'border-red-500 bg-red-100/10' : 'border-yellow-400 bg-yellow-100/10'
                    }`}
                  style={{ minHeight: 90 }}
                >

                  <span
                    className={`absolute top-6 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold ${case_.case_type === "OEM"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                      }`}
                  >
                    {case_.case_type}
                  </span>



                  <p className="font-medium text-sm text-black truncate">{case_.title}</p>

                  <p className="text-xs text-black/70">{case_.market}</p>
                  <p className="text-xs text-black/60">Install Date: {case_.install_date || "N/A"}</p>

                  <div className="flex justify-between items-center mt-2">
                    <select
                      value={case_.status}
                      onChange={(e) => updateCaseStatus(case_.id, e.target.value, setErrorMessage, fetchData)}
                      className={`text-xs ${color} font-medium text-black px-2 py-1 rounded-md hover:bg-purple-600 hover:text-white transition`}
                    >

                      {isTwoDaysAhead ? (
                        <option value="WAITING_ASSIGNMENT">Two days out...</option>

                      ) : (
                        <option value="WAITING_ASSIGNMENT">Waiting...</option>
                      )}
                    </select>



                    <button
                      onClick={() => removedCase(case_.id, fetchData, 'DELETED')}
                      className="bg-red-500/80 hover:bg-red-400 text-white p-1 rounded-full transition"
                    >
                      <Trash2 size={14} />
                    </button>


                  </div>



                  <div className="absolute top-1 right-2 text-[10px] text-black/60 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {timeSince(case_.created_at)}
                  </div>


                </div>
              );
            })}
        </div>

      </div>
    </>
  )
}
