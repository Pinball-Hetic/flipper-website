"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function ScoreboardModal({ isOpen, onClose, checkpoint }) {
  if (!checkpoint) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[3000] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop avec flou progressif */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />

          {/* Modal Content - Glassmorphism Spatial 2026 */}
          <motion.div
            initial={{ y: "100%", scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: "100%", scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-full max-w-lg bg-white/45 backdrop-blur-3xl rounded-t-[3rem] sm:rounded-[3rem] border border-white/50 shadow-spatial overflow-hidden flex flex-col max-h-[90vh]"
            style={{ backgroundImage: 'var(--glass-reflection)' }}
          >
            {/* Header avec indicateur de grab spatial */}
            <div className="p-8 pb-4 relative">
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-slate-400/20 rounded-full" />
              
              {/* Floating Close Button - Modern Spatial UX */}
              <button 
                onClick={onClose}
                aria-label="Fermer"
                className="absolute top-6 right-6 z-10 size-11 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 flex items-center justify-center text-slate-500 hover:bg-white hover:text-slate-900 active:scale-90 transition-all shadow-spatial group"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <div className="mt-4 mb-6 pr-14">
                <span className="inline-block px-3 py-1 rounded-xl bg-white/50 border border-white/60 text-slate-700 text-[10px] font-black uppercase tracking-[0.15em] mb-2 shadow-sm">
                  {checkpoint.type}
                </span>
                <h2 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {checkpoint.name}
                </h2>
                <p className="text-slate-600 font-medium text-sm mt-1 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {checkpoint.address}
                </p>
              </div>
            </div>

            {/* Content / Scoreboards */}
            <div className="px-8 pb-10 overflow-y-auto custom-scrollbar">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                <div className="size-8 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="2.5">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-2.34M12 2v10.67M7 2h10l-1 12.67c-.05.65-.6 1.15-1.25 1.15H9.25c-.65 0-1.2-.5-1.25-1.15L7 2Z"/>
                  </svg>
                </div>
                Tableau des Scores
              </h3>

              {checkpoint.machines && checkpoint.machines.length > 0 ? (
                <div className="space-y-6">
                  {checkpoint.machines.map((machine) => (
                    <div key={machine.id} className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 border border-white/60 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                           <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                        </svg>
                      </div>
                      
                      <h4 className="font-black text-slate-900 mb-5 uppercase tracking-widest text-xs flex items-center justify-between">
                        {machine.name}
                        <span className="text-[9px] bg-slate-900/5 px-2.5 py-1 rounded-full text-slate-600 border border-slate-900/10">SYSTEM_FLIPPER</span>
                      </h4>
                      
                      <div className="space-y-2.5">
                        {machine.scores && machine.scores.length > 0 ? (
                          machine.scores.map((score, index) => (
                            <div key={score.id} className="flex items-center justify-between bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm hover:translate-x-1 transition-transform">
                              <div className="flex items-center gap-4">
                                <span className={`size-8 rounded-xl flex items-center justify-center font-black text-xs shadow-inner ${
                                  index === 0 ? 'bg-orange-500 text-white' : 
                                  index === 1 ? 'bg-slate-300 text-slate-800' : 
                                  index === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100/50 text-slate-500'
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="font-bold text-slate-800 tracking-tight">{score.user?.name || "Anonyme"}</span>
                              </div>
                              <span className="font-mono font-black text-orange-600 text-lg">
                                {score.value.toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6 bg-slate-900/5 rounded-2xl border border-dashed border-slate-900/10">
                            <p className="text-slate-500 text-xs font-bold italic uppercase tracking-wider">
                              No records found. Become a legend.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-white/20 rounded-[2.5rem] border border-dashed border-white/50">
                   <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Waiting for machine...</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
