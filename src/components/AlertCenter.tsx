import React, { useState } from 'react';
import { Medicine, MedicineAlert } from '../types';
import { AlertTriangle, Trash2, Tag, RefreshCw, Barcode, Calendar, Thermometer, Boxes, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AlertCenterProps {
  medicines: Medicine[];
  onRemoveMedicine: (id: string) => void;
  onUpdateQuantity: (id: string, newQty: number) => void;
  onApplyDiscount: (id: string, discountPercent: number) => void;
}

export default function AlertCenter({
  medicines,
  onRemoveMedicine,
  onUpdateQuantity,
  onApplyDiscount,
}: AlertCenterProps) {
  const [filterType, setFilterType] = useState<'all' | 'expired' | 'expiring_soon' | 'low_stock'>('all');
  const [reorderAmount, setReorderAmount] = useState<string>('50');

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Derive alerts
  const alerts: MedicineAlert[] = [];

  medicines.forEach((med) => {
    const expiry = new Date(med.expiryDate);
    
    if (expiry < today) {
      alerts.push({
        id: `alert-exp-${med.id}`,
        medicine: med,
        type: 'expired',
        message: `EXPIRED on ${med.expiryDate} (Batch: ${med.batchNumber})`
      });
    } else if (expiry <= thirtyDaysFromNow) {
      const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `alert-exp-soon-${med.id}`,
        medicine: med,
        type: 'expiring_soon',
        message: `Expiring soon: Only ${daysLeft} days remaining (${med.expiryDate})`
      });
    }

    if (med.quantity === 0) {
      alerts.push({
        id: `alert-out-${med.id}`,
        medicine: med,
        type: 'critical_low',
        message: `OUT of stock in shelf ${med.shelfNo}`
      });
    } else if (med.quantity <= med.minStock) {
      alerts.push({
        id: `alert-low-${med.id}`,
        medicine: med,
        type: 'low_stock',
        message: `Low stock warning: ${med.quantity} ${med.unit} remaining (Min threshold: ${med.minStock})`
      });
    }
  });

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'all') return true;
    if (filterType === 'expired') return alert.type === 'expired';
    if (filterType === 'expiring_soon') return alert.type === 'expiring_soon';
    if (filterType === 'low_stock') return alert.type === 'low_stock' || alert.type === 'critical_low';
    return true;
  });

  const expiredCount = alerts.filter(a => a.type === 'expired').length;
  const expiringSoonCount = alerts.filter(a => a.type === 'expiring_soon').length;
  const lowStockCount = alerts.filter(a => a.type === 'low_stock' || a.type === 'critical_low').length;

  return (
    <div id="alert-center-container" className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
      {/* Alert Header Grid */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-2">
            <span className="p-1 px-2.5 rounded-lg bg-teal-50 text-teal-600 text-sm">Alerts</span>
            Active Pharmacy Alerts
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Automated monitoring of batch expirations and safety shelf thresholds
          </p>
        </div>

        {/* Quick Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-50 rounded-lg border border-slate-100 self-start md:self-center">
          <button
            id="tab-all-alerts"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            id="tab-expired"
            onClick={() => setFilterType('expired')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
              filterType === 'expired'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-red-500 hover:bg-red-50'
            }`}
          >
            Expired
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterType === 'expired' ? 'bg-white text-red-500' : 'bg-red-105 text-red-600'}`}>
              {expiredCount}
            </span>
          </button>
          <button
            id="tab-expiring-soon"
            onClick={() => setFilterType('expiring_soon')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
              filterType === 'expiring_soon'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-500 hover:bg-amber-50'
            }`}
          >
            Expiring Soon
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterType === 'expiring_soon' ? 'bg-white text-amber-500' : 'bg-amber-100 text-amber-600'}`}>
              {expiringSoonCount}
            </span>
          </button>
          <button
            id="tab-low-stock"
            onClick={() => setFilterType('low_stock')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
              filterType === 'low_stock'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            Low Qty
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filterType === 'low_stock' ? 'bg-white text-blue-600' : 'bg-blue-100 text-blue-600'}`}>
              {lowStockCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Alert Feed */}
      <div className="max-h-[380px] overflow-y-auto pr-1 divide-y divide-slate-100 border rounded-lg border-slate-100 bg-slate-50/20">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg">
            <div className="p-3 bg-emerald-50 rounded-full text-emerald-500 mb-2">
              <Boxes className="h-6 w-6 animate-pulse" />
            </div>
            <p className="text-slate-800 font-medium font-sans">No Critical Shelf Alerts</p>
            <p className="text-slate-400 text-xs mt-1">All medicine items are securely within expiration and stock bounds.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((alert) => {
              const med = alert.medicine;
              
              const isExpired = alert.type === 'expired';
              const isExpSoon = alert.type === 'expiring_soon';
              const isLowStock = alert.type === 'low_stock' || alert.type === 'critical_low';

              let cardBg = "bg-white";
              let sideColor = "border-l-4 border-l-emerald-400";
              let alertBadgeColor = "bg-emerald-50 text-emerald-600";

              if (isExpired) {
                cardBg = "bg-red-50/10 hover:bg-red-50/25";
                sideColor = "border-l-4 border-l-red-500";
                alertBadgeColor = "bg-red-100 text-red-600";
              } else if (isExpSoon) {
                cardBg = "bg-amber-50/10 hover:bg-amber-50/20";
                sideColor = "border-l-4 border-l-amber-500";
                alertBadgeColor = "bg-amber-100 text-amber-600";
              } else if (isLowStock) {
                cardBg = "bg-blue-50/10 hover:bg-blue-50/20";
                sideColor = "border-l-4 border-l-blue-500";
                alertBadgeColor = "bg-blue-100 text-blue-600";
              }

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 ${cardBg} ${sideColor} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-800 font-sans text-sm">{med.name}</span>
                      <span className="text-slate-400 text-[11px] font-mono select-all font-medium bg-slate-100 px-1 py-0.5 rounded flex items-center gap-0.5">
                        <Barcode className="h-3 w-3" /> {med.id.replace('med-', 'M-')}
                      </span>
                      <span className="text-xs text-slate-500 font-sans italic">({med.genericName})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-semibold text-slate-700 bg-slate-100/80 px-1.5 py-0.5 rounded">
                        Shelf: {med.shelfNo}
                      </span>
                      <span className="flex items-center gap-1">
                        <Boxes className="h-3.5 w-3.5 text-slate-400" /> Stock: {med.quantity} {med.unit}
                      </span>
                      {isExpired || isExpSoon ? (
                        <span className="flex items-center gap-1 text-red-500">
                          <Calendar className="h-3.5 w-3.5" /> Exp: {med.expiryDate}
                        </span>
                      ) : null}
                    </div>

                    <div className="text-xs text-slate-600 font-sans font-medium flex items-center gap-1.5 mt-1.5 bg-white/50 backdrop-blur-xs p-1 rounded">
                      <AlertTriangle className={`h-4 w-4 ${isExpired ? 'text-red-500' : isExpSoon ? 'text-amber-500' : 'text-blue-500'}`} />
                      <span>{alert.message}</span>
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {isExpired && (
                      <button
                        id={`btn-discard-${med.id}`}
                        onClick={() => onRemoveMedicine(med.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs transition"
                        title="Purge completely from shelves as chemical waste."
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Discard
                      </button>
                    )}

                    {isExpSoon && (
                      <button
                        id={`btn-discount-${med.id}`}
                        onClick={() => onApplyDiscount(med.id, 50)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-xs font-semibold shadow-xs transition"
                        title="Apply 50% clearance discount to clear stock rapidly."
                      >
                        <Tag className="h-3.5 w-3.5" /> Discount 50%
                      </button>
                    )}

                    {isLowStock && (
                      <div className="flex items-center gap-1">
                        <input
                          id={`input-reorder-amt-${med.id}`}
                          type="number"
                          className="w-12 text-center text-xs p-1 h-7 border rounded bg-white font-mono text-slate-700"
                          value={reorderAmount}
                          onChange={(e) => setReorderAmount(e.target.value)}
                          placeholder="Qty"
                        />
                        <button
                          id={`btn-restock-${med.id}`}
                          onClick={() => {
                            const val = parseInt(reorderAmount, 10);
                            if (!isNaN(val) && val > 0) {
                              onUpdateQuantity(med.id, med.quantity + val);
                            }
                          }}
                          className="px-2.5 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold transition flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" /> Refill
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Warning Tip */}
      <div className="mt-4 p-3.5 bg-amber-50/50 rounded-lg border border-amber-100 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-normal">
          <strong>Pharmacist Advisory:</strong> Expired chemical agents pose a biohazard. Ensure they are routed to safe containment or returned to authorized vendors. Soon-to-expire goods (within 30 days) should be labelled with warning tags and offered at discount counters.
        </p>
      </div>
    </div>
  );
}
