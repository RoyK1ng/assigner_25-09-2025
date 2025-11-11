import React, { useState } from 'react';
import { Clock, CheckCircle } from 'lucide-react';

interface Case {
  id: string;
  title: string;
  market: string;
  install_date: string;
  work_order: string;
  case_type: 'OE' | 'OEM';
  created_at: string;
  case_tags?: Array<{
    tags: {
      id: string;
      name: string;
      color: string;
    }
  }>;
}

interface UserQueueProps {
  myQueue: Case[];
  updateCaseStatus: (caseId: string, status: string) => void;
  handleInputChange: (caseId: string, field: string, value: string) => void;
  handleJobTypeChange: (newType: 'OE' | 'OEM', caseId: string) => void;
  timeSince: (dateString: string) => string;
}

export default function UserQueue({
  myQueue,
  updateCaseStatus,
  handleInputChange,
  handleJobTypeChange,
  timeSince
}: UserQueueProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'OE' | 'OEM'>('ALL');

  const filteredQueue = myQueue.filter((c) => 
    filterType === 'ALL' ? true : c.case_type === filterType
  );

  return (
    <div className="w-full max-w-[350px] h-[750px] backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl shadow-lg p-4 text-white">

      {/* Encabezado del panel */}
      <div className="bg-white shadow rounded-xl px-3 py-2 flex items-center justify-between mb-5">
        {/* Info de Queue */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 text-blue-600 p-1 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs text-gray-500">My Queue</div>
            <div className="text-base font-bold text-gray-800">
              {filteredQueue.length}
            </div>
          </div>
        </div>

        {/* Selector de filtro */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as 'ALL' | 'OE' | 'OEM')}
          className={`text-xs font-semibold rounded-md px-2 py-1 border focus:outline-none focus:ring-1 transition
            ${
              filterType === 'OEM'
                ? 'bg-blue-100 text-blue-800 border-blue-400 focus:ring-blue-400'
                : filterType === 'OE'
                ? 'bg-green-100 text-green-800 border-green-400 focus:ring-green-400'
                : 'bg-purple-100 text-purple-800 border-purple-400 focus:ring-purple-400'
            }`}
        >
          <option value="ALL">All</option>
          <option value="OEM">OEM</option>
          <option value="OE">OE</option>
        </select>
      </div>

      {/* Lista de casos en queue */}
      {filteredQueue.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[500px] text-gray-400">
          <CheckCircle size={48} className="mb-3 opacity-50" />
          <p className="text-sm font-medium">Your queue is empty!</p>
          <p className="text-xs mt-1">Great job! 🎉</p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[620px] space-y-3 pr-1 scrollbar-thin scrollbar-thumb-blue-400/60 scrollbar-track-transparent">
          {filteredQueue.map((case_) => {
            const installDate = new Date(case_.install_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const diffDays = Math.ceil((installDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const currentDay = today.getDay();
            const installDay = installDate.getDay();

            const isTomorrow = diffDays === 1;
            let isTwoDaysAhead = diffDays === 2;

            // Lógica especial para fin de semana
            if (currentDay === 6 && installDay === 2) {
              isTwoDaysAhead = true;
            }

            const borderColor = isTwoDaysAhead
              ? 'border-red-500'
              : isTomorrow
              ? 'border-orange-400'
              : 'border-blue-400';

            const bgColor = isTwoDaysAhead
              ? 'bg-red-100/10'
              : isTomorrow
              ? 'bg-orange-100/10'
              : 'bg-blue-100/10';

            return (
              <div
                key={case_.id}
                className={`relative p-3 rounded-xl border-l-4 shadow-md transition-all hover:shadow-lg ${borderColor} ${bgColor}`}
                style={{ minHeight: 120 }}
              >
                {/* Etiqueta de urgencia */}
                {(isTwoDaysAhead || isTomorrow) && (
                  <span className={`absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded ${
                    isTwoDaysAhead 
                      ? 'bg-red-500 text-white' 
                      : 'bg-orange-500 text-white'
                  }`}>
                    {isTwoDaysAhead ? '2 DAYS OUT' : 'TOMORROW'}
                  </span>
                )}

                {/* Tipo de caso */}
                <button
                  onClick={() => handleJobTypeChange(
                    case_.case_type === 'OE' ? 'OEM' : 'OE', 
                    case_.id
                  )}
                  className={`absolute top-8 right-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    case_.case_type === "OEM"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {case_.case_type}
                </button>

                {/* Información del caso */}
                <p className="font-semibold text-sm text-black truncate pr-16">
                  {case_.title}
                </p>
                <p className="text-xs text-black/70 mt-1">{case_.market}</p>
                <p className="text-xs text-black/60">
                  Install: {case_.install_date || 'Not set'}
                </p>

             

                

                {/* Tags si existen */}
                {case_.case_tags && case_.case_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {case_.case_tags.map((caseTag) => (
                      <span
                        key={caseTag.tags.id}
                        className="px-1.5 py-0.5 text-[9px] rounded-md text-white font-semibold"
                        style={{ backgroundColor: caseTag.tags.color }}
                      >
                        {caseTag.tags.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Tiempo desde creación */}
                <div className="absolute bottom-2 right-2 text-[10px] text-black/60 flex items-center">
                  <Clock size={10} className="mr-1" />
                  {timeSince(case_.created_at)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}