import React, { useState } from 'react';
import { Medicine } from '../types';
import { Layers, Thermometer, Box, AlertCircle, Info, ChevronRight, CornerDownRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ShelvesGridProps {
  medicines: Medicine[];
  onSelectMedicine: (med: Medicine) => void;
}

interface ZoneInfo {
  code: string;
  name: string;
  color: string;
  description: string;
  shelvesCount: number;
}

const ZONES: ZoneInfo[] = [
  { code: 'A', name: 'Zone A: Pain & Fever', color: 'bg-rose-550 border-rose-600', description: 'Analgesics, NSAIDs, Anti-inflammatories', shelvesCount: 4 },
  { code: 'B', name: 'Zone B: Infections', color: 'bg-violet-500 border-violet-600', description: 'Antibiotics, Antivirals, Antifungals', shelvesCount: 4 },
  { code: 'C', name: 'Zone C: Respiratory', color: 'bg-teal-500 border-teal-600', description: 'Cough syrups, Antihistamines, Inhalers', shelvesCount: 4 },
  { code: 'D', name: 'Zone D: Gastrointestinal', color: 'bg-amber-500 border-amber-600', description: 'Antacids, Antidiarrheals, PPIs', shelvesCount: 4 },
  { code: 'E', name: 'Zone E: Chronic care', color: 'bg-indigo-500 border-indigo-600', description: 'Atorvastatin, Blood Pressure, Antidiabetic', shelvesCount: 4 },
  { code: 'F', name: 'Zone F: Topical/Skin', color: 'bg-pink-500 border-pink-600', description: 'Steroid creams, antiseptic gels, patches', shelvesCount: 4 },
  { code: 'S', name: 'Zone S: OTC Specials', color: 'bg-emerald-500 border-emerald-600', description: 'Multivitamins, Minerals, OTC supplements', shelvesCount: 4 },
  { code: 'R', name: 'Zone R: Cold Chain', color: 'bg-blue-500 border-blue-600', description: 'Insulins, Vaccines (Temp 2-8°C)', shelvesCount: 2 },
];

export default function ShelvesGrid({ medicines, onSelectMedicine }: ShelvesGridProps) {
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>('A');

  const selectedZone = ZONES.find(z => z.code === selectedZoneCode) || ZONES[0];

  // Group medicines by shelf in the selected zone
  const getMedicinesInShelf = (zoneCode: string, shelfNum: number) => {
    const shelfKey = `${zoneCode}-${shelfNum}`;
    return medicines.filter(med => med.shelfNo === shelfKey);
  };

  // Helper to check medicine health
  const getMedStatus = (med: Medicine) => {
    const expiry = new Date(med.expiryDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiry < today) return 'expired';
    if (expiry <= thirtyDaysFromNow) return 'expiring_soon';
    if (med.quantity === 0) return 'critical_low';
    if (med.quantity <= med.minStock) return 'low_stock';
    return 'ok';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-500 border-red-650 text-white';
      case 'expiring_soon':
        return 'bg-amber-400 border-amber-500 text-slate-800';
      case 'critical_low':
        return 'bg-red-600 border-red-700 text-white animate-pulse';
      case 'low_stock':
        return 'bg-blue-400 border-blue-500 text-white';
      default:
        return 'bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100';
    }
  };

  // Counting total medicines per zone
  const getZoneStats = (zoneCode: string) => {
    const meds = medicines.filter(m => m.shelfNo.startsWith(`${zoneCode}-`));
    const totalQty = meds.reduce((acc, m) => acc + m.quantity, 0);
    
    // Check if anything has alerts in this zone
    let hasAlert = false;
    let hasCritical = false;

    meds.forEach(med => {
      const status = getMedStatus(med);
      if (status === 'expired' || status === 'critical_low') {
        hasCritical = true;
      } else if (status === 'expiring_soon' || status === 'low_stock') {
        hasAlert = true;
      }
    });

    return {
      count: meds.length,
      qty: totalQty,
      hasAlert,
      hasCritical
    };
  };

  return (
    <div id="shelves-grid-container" className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-teal-600 animate-bounce" />
            Pharmacy Shelf Visualizer
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time physical stock assignment map. Select a cabinet zone block to inspect shelves.
          </p>
        </div>
      </div>

      {/* Main Grid: Left cabinet directory, Right physical shelves stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Cabinet Directory */}
        <div className="lg:col-span-4 flex flex-col gap-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">
            Store Cabinet Zones
          </p>
          <div className="flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 scrollbar-none">
            {ZONES.map((zone) => {
              const stats = getZoneStats(zone.code);
              const isSelected = zone.code === selectedZoneCode;

              return (
                <button
                  id={`btn-select-zone-${zone.code}`}
                  key={zone.code}
                  onClick={() => setSelectedZoneCode(zone.code)}
                  className={`w-full text-left p-3 rounded-lg border transition-all duration-200 shrink-0 select-none flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-teal-600 border-teal-700 text-white shadow-md shadow-teal-600/10'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 text-slate-700'
                  }`}
                  style={{ minWidth: '180px' }}
                >
                  <div className="space-y-0.5 pointer-events-none">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-white' : 'bg-teal-600'}`} />
                      <span className="font-bold text-sm tracking-tight">{zone.name}</span>
                    </div>
                    <p className={`text-[11px] truncate max-w-[200px] ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                      {zone.description}
                    </p>
                  </div>

                  {/* Badges/Alerts */}
                  <div className="flex items-center gap-1.5 pointer-events-none">
                    {stats.hasCritical && (
                      <span className="h-2 w-2 rounded-full bg-red-500 ring-2 ring-red-100 flex shadow-sm animate-pulse" />
                    )}
                    {stats.hasAlert && !stats.hasCritical && (
                      <span className="h-2 w-2 rounded-full bg-amber-400 ring-2 ring-amber-100 flex shadow-sm" />
                    )}
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      isSelected ? 'bg-teal-750 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {stats.count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Shelves Stack (Visual Representation) */}
        <div className="lg:col-span-8 bg-slate-50 border border-slate-200/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            {/* Shelf Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 mb-6">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedZone.name}</h3>
                <p className="text-xs text-slate-500 font-medium">{selectedZone.description}</p>
              </div>

              {/* Special Cold temperature tag for biological Zone R */}
              {selectedZone.code === 'R' && (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-[11px] font-bold">
                  <Thermometer className="h-3.5 w-3.5 animate-pulse text-blue-600" />
                  Cold Range: 2°C - 8°C Mandatory
                </div>
              )}
            </div>

            {/* Render Shelves Stacking from top (max index) to bottom (1) */}
            <div className="flex flex-col gap-6 select-none">
              {Array.from({ length: selectedZone.shelvesCount }, (_, i) => {
                const shelfNum = selectedZone.shelvesCount - i; // Stack shelves correctly
                const shelfMeds = getMedicinesInShelf(selectedZone.code, shelfNum);

                return (
                  <div
                    key={`shelf-${shelfNum}`}
                    className="relative bg-white border border-slate-200 rounded-lg p-4 pt-6 shadow-xs flex flex-col justify-end"
                  >
                    {/* Shelf Label Tag */}
                    <span className="absolute -top-3.5 left-3 px-2 py-0.5 bg-slate-700 text-white rounded text-[10px] font-mono font-bold tracking-wider z-10">
                      SHELF {selectedZone.code}-{shelfNum}
                    </span>

                    {/* Shelf Medication items listed as boxes side-by-side */}
                    <div className="flex flex-wrap gap-2.5 min-h-[55px] items-center">
                      {shelfMeds.length === 0 ? (
                        <div className="text-[11px] text-slate-450 italic w-full text-center py-2">
                          [ Empty Shelf - Available for Stocking ]
                        </div>
                      ) : (
                        shelfMeds.map((med) => {
                          const status = getMedStatus(med);
                          const statusClass = getStatusColor(status);

                          return (
                            <motion.button
                              id={`shelf-item-${med.id}`}
                              key={med.id}
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => onSelectMedicine(med)}
                              className={`p-2.5 rounded-lg border font-sans font-medium text-left transition text-xs shrink-0 flex flex-col gap-1 shadow-2xs ${statusClass}`}
                              style={{ width: '135px' }}
                            >
                              <div className="flex justify-between items-start gap-1 w-full">
                                <span className="font-extrabold truncate w-[85px]" title={med.name}>
                                  {med.name}
                                </span>
                                {status !== 'ok' && (
                                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                )}
                              </div>
                              <div className="flex items-center justify-between w-full text-[10px] opacity-90 font-medium">
                                <span className="font-mono bg-black/5 px-1 rounded">
                                  Qty: {med.quantity}
                                </span>
                                <span className="truncate max-w-[50px] italic">
                                  {med.unit}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })
                      )}
                    </div>

                    {/* The Wood/Metal physical ledge support render */}
                    <div className="h-2 w-full bg-slate-350 rounded-b-sm border-t border-slate-400 mt-2 pointer-events-none shadow-xs" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Guide Legend */}
          <div className="mt-8 border-t border-slate-200 pt-4 flex flex-wrap gap-x-4 gap-y-2 items-center text-[10px] text-slate-500">
            <span className="font-bold flex items-center gap-1"><Info className="h-3.5 w-3.5" /> Physical Legend:</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-red-500" /> Expired</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-400" /> Expiring Soon</span>
            <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-400" /> Low Stock</span>
            <span className="flex items-center gap-1.5"><span className="h-3.5 w-3.5 rounded bg-teal-50 border border-teal-200" /> Loaded & Perfect</span>
          </div>
        </div>
      </div>
    </div>
  );
}
