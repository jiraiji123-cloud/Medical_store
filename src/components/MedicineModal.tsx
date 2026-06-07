import React, { useState, useEffect } from 'react';
import { Medicine } from '../types';
import { X, Save, Trash2, Tag, MinusCircle, PlusCircle, Thermometer, Calendar, Layers, Barcode, DollarSign, Info, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface MedicineModalProps {
  medicine: Medicine | null;
  onClose: () => void;
  onUpdateMedicine: (updated: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
}

export default function MedicineModal({
  medicine,
  onClose,
  onUpdateMedicine,
  onDeleteMedicine
}: MedicineModalProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  // Quantities dispensing state
  const [dispenseModelQty, setDispenseModelQty] = useState<string>('10');
  const [fillModelQty, setFillModelQty] = useState<string>('50');

  // Edit fields
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('');
  const [shelfNo, setShelfNo] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [unit, setUnit] = useState('');
  const [price, setPrice] = useState(0);
  const [expiryDate, setExpiryDate] = useState('');
  const [storageTemp, setStorageTemp] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (medicine) {
      setName(medicine.name);
      setGenericName(medicine.genericName);
      setCategory(medicine.category);
      setShelfNo(medicine.shelfNo);
      setQuantity(medicine.quantity);
      setMinStock(medicine.minStock);
      setUnit(medicine.unit);
      setPrice(medicine.price);
      setExpiryDate(medicine.expiryDate);
      setStorageTemp(medicine.storageTemp);
      setBatchNumber(medicine.batchNumber);
      setNotes(medicine.notes);
      setActiveTab('view');
      setFormError(null);
    }
  }, [medicine]);

  if (!medicine) return null;

  const handleDispense = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyToDispense = parseInt(dispenseModelQty, 10);
    if (isNaN(qtyToDispense) || qtyToDispense <= 0) {
      alert("Please specify a valid count to dispense.");
      return;
    }
    if (qtyToDispense > medicine.quantity) {
      alert(`Insufficient stock! Cannot dispense ${qtyToDispense} units. Only ${medicine.quantity} remaining in shelf ${medicine.shelfNo}.`);
      return;
    }

    const updated: Medicine = {
      ...medicine,
      quantity: medicine.quantity - qtyToDispense
    };
    onUpdateMedicine(updated);
    setQuantity(updated.quantity);
    setDispenseModelQty('10');
  };

  const handleFill = (e: React.FormEvent) => {
    e.preventDefault();
    const qtyToFill = parseInt(fillModelQty, 10);
    if (isNaN(qtyToFill) || qtyToFill <= 0) {
      alert("Please specify a valid refill quantity count.");
      return;
    }

    const updated: Medicine = {
      ...medicine,
      quantity: medicine.quantity + qtyToFill
    };
    onUpdateMedicine(updated);
    setQuantity(updated.quantity);
    setFillModelQty('50');
  };

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !shelfNo.trim() || !batchNumber.trim() || !expiryDate) {
      setFormError('Mandatory fields: Name, Shelf No, Batch Number, and Expiration Date are required.');
      return;
    }

    // Validate shelf No format e.g. A-1
    const regex = /^[A-S,R]-[1-4]$/;
    if (!regex.test(shelfNo)) {
      setFormError('Shelf number must map to standard zones (A, B, C, D, E, F, S, R) and indices (1-4). Examples: A-3, B-1, R-2.');
      return;
    }

    const updated: Medicine = {
      ...medicine,
      name,
      genericName,
      category,
      shelfNo,
      quantity: Number(quantity),
      minStock: Number(minStock),
      unit,
      price: Number(price),
      expiryDate,
      storageTemp,
      batchNumber,
      notes
    };

    onUpdateMedicine(updated);
    setActiveTab('view');
  };

  const isExpired = new Date(medicine.expiryDate) < new Date();
  const isExpiringSoon = !isExpired && (new Date(medicine.expiryDate) <= (() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  })());

  return (
    <div id="medicine-details-modal" className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-teal-950/40 backdrop-blur-xs select-none">
      
      {/* Container Card */}
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Banner header */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
              <Barcode className="h-3.5 w-3.5 text-slate-400" /> BATCH ID: {medicine.batchNumber}
            </span>
            <h3 className="text-lg font-bold font-sans text-slate-800 flex items-center gap-2">
              {medicine.name}
              {isExpired ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">Expired</span>
              ) : isExpiringSoon ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">Expiring Soon</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600">Safe Stock</span>
              )}
            </h3>
          </div>
          <button
            id="modal-close"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Selector Menu Tabs */}
        <div className="flex border-b border-slate-100 text-xs font-semibold px-5 pt-2 bg-slate-50/50">
          <button
            id="tab-modal-view"
            onClick={() => setActiveTab('view')}
            className={`pb-2.5 px-4 -mb-px border-b-2 transition ${
              activeTab === 'view'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Medicine Snapshot
          </button>
          <button
            id="tab-modal-edit"
            onClick={() => setActiveTab('edit')}
            className={`pb-2.5 px-4 -mb-px border-b-2 transition ${
              activeTab === 'edit'
                ? 'border-teal-600 text-teal-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Modify Specifications
          </button>
        </div>

        {/* Content body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'view' ? (
            <div className="space-y-6">
              
              {/* Snapshot statistics metadata GRID */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="p-3 bg-slate-100/50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded text-blue-500 shadow-2xs">
                    <Layers className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Shelf Placement</label>
                    <span className="font-mono text-xs font-bold text-slate-800">Zone {medicine.shelfNo}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded text-teal-600 shadow-2xs">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Current Stock</label>
                    <span className="text-xs font-extrabold text-slate-800">{medicine.quantity} {medicine.unit}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded text-amber-500 shadow-2xs">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Expires On</label>
                    <span className="font-mono text-xs font-bold text-slate-800">{medicine.expiryDate}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-100/50 rounded-lg border border-slate-100 flex items-center gap-3">
                  <div className="p-2 bg-white rounded text-indigo-500 shadow-2xs font-bold">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400">Unit Price</label>
                    <span className="text-xs font-extrabold text-slate-800">${medicine.price.toFixed(2)}</span>
                  </div>
                </div>

              </div>

              {/* Secondary Specs detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-650">
                <div className="space-y-1.5 p-4 bg-slate-50/40 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Compounded Active Ingredient</p>
                  <p className="text-slate-850 font-bold">{medicine.genericName}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">Class Code</p>
                  <p className="text-slate-800">{medicine.category}</p>
                </div>

                <div className="space-y-1.5 p-4 bg-slate-50/40 rounded-lg border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Thermometer className="h-4 w-4 text-blue-500" /> Storage Guideline
                  </p>
                  <p className="text-slate-800 font-semibold">{medicine.storageTemp}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider pt-2">Minimum Threshold Alert</p>
                  <p className="text-slate-800 font-mono">Warn if quantity drop below {medicine.minStock} {medicine.unit}</p>
                </div>
              </div>

              {/* Dosage instruction Advice Box */}
              {medicine.notes && (
                <div className="p-4 bg-teal-50/50 rounded-lg border border-teal-100/60 text-xs">
                  <span className="font-bold text-teal-800 flex items-center gap-1 mb-1">
                    <Info className="h-4 w-4 shrink-0 text-teal-650" /> Pharmacologist Dosage Instructions / Notes
                  </span>
                  <p className="text-slate-650 leading-relaxed font-sans">{medicine.notes}</p>
                </div>
              )}

              {/* Interactive Dispensing Simulator */}
              <div className="border-t border-slate-100 pt-5 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1">
                  Pharmacy Counter Actions (Simulated)
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dispense action */}
                  <form onSubmit={handleDispense} className="p-4 bg-rose-50/20 rounded-lg border border-rose-100/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-800 flex items-center gap-1"><MinusCircle className="h-4 w-4 text-rose-600" /> Dispense Stock (Sell)</span>
                      <span className="text-[10px] text-slate-400">Removes from shelf</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="dispense-input-number"
                        type="number"
                        className="flex-1 text-center bg-white border border-slate-200 rounded p-1.5 text-xs font-mono font-bold text-slate-700 outline-hidden"
                        value={dispenseModelQty}
                        onChange={(e) => setDispenseModelQty(e.target.value)}
                        placeholder="Qty"
                        max={medicine.quantity}
                      />
                      <button
                        id="dispense-btn-submit"
                        type="submit"
                        className="px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-xs transition"
                      >
                        Dispense
                      </button>
                    </div>
                  </form>

                  {/* Refill Action */}
                  <form onSubmit={handleFill} className="p-4 bg-emerald-50/10 rounded-lg border border-emerald-100/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 flex items-center gap-1"><PlusCircle className="h-4 w-4 text-emerald-600" /> Restock Refill</span>
                      <span className="text-[10px] text-slate-400">Supplements shelf</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        id="refill-input-number"
                        type="number"
                        className="flex-1 text-center bg-white border border-slate-200 rounded p-1.5 text-xs font-mono font-bold text-slate-700 outline-hidden"
                        value={fillModelQty}
                        onChange={(e) => setFillModelQty(e.target.value)}
                        placeholder="Qty"
                      />
                      <button
                        id="refill-btn-submit"
                        type="submit"
                        className="px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-xs transition"
                      >
                        Add Stock
                      </button>
                    </div>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            /* Edit Specifications Form */
            <form onSubmit={handleSaveChanges} className="space-y-4 text-xs font-medium">
              
              {formError && (
                <div className="p-3 bg-red-50 text-red-800 rounded font-bold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Commercial Name</label>
                  <input
                    id="edit-name"
                    type="text"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 outline-hidden focus:border-teal-600 bg-slate-50/30 font-semibold"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Generic / Active compound</label>
                  <input
                    id="edit-generic"
                    type="text"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 outline-hidden focus:border-teal-600 bg-slate-50/30"
                    value={genericName}
                    onChange={(e) => setGenericName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Classification Category</label>
                  <select
                    id="edit-category"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 outline-hidden focus:border-teal-600 bg-slate-50/30"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Pain Relief">Pain Relief</option>
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Gastrointestinal">Gastrointestinal</option>
                    <option value="Respiratory">Respiratory</option>
                    <option value="Cardiac & Diabetes">Cardiac & Diabetes</option>
                    <option value="Dermatological">Dermatological</option>
                    <option value="Vitamins & Supplements">Vitamins & Supplements</option>
                    <option value="Cold Chain / Biologicals">Cold Chain / Biologicals</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Shelf Number (Format Zone-Num)</label>
                  <input
                    id="edit-shelf"
                    type="text"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-white font-mono font-bold"
                    value={shelfNo}
                    onChange={(e) => setShelfNo(e.target.value)}
                    placeholder="e.g., A-1, B-4, R-1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Safety stock threshold alert</label>
                  <input
                    id="edit-minstock"
                    type="number"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-slate-50/30"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Unit Specification</label>
                  <input
                    id="edit-unit"
                    type="text"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-slate-50/30"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. Tablets, Capsules, Liquid (ml)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Purchase Base Price (USD)</label>
                  <input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-slate-50/30 font-mono"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Batch Manufacturing Id</label>
                  <input
                    id="edit-batch"
                    type="text"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-slate-50/30 font-mono"
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Chemical Expiry Date</label>
                  <input
                    id="edit-expiry"
                    type="date"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-slate-50/30 font-mono"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Storage Rules Category</label>
                  <select
                    id="edit-temp"
                    className="w-full rounded border border-slate-200 p-2 text-xs text-slate-850 outline-hidden focus:border-teal-600 bg-slate-50/30"
                    value={storageTemp}
                    onChange={(e) => setStorageTemp(e.target.value)}
                  >
                    <option value="Room Temp">Room Temp</option>
                    <option value="Refrigerated (2-8°C)">Refrigerated (2-8°C)</option>
                    <option value="Cool Place (<15°C)">Cool Place (&lt;15°C)</option>
                  </select>
                </div>

              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Usage Notes / Cautions / Dosage Details</label>
                <textarea
                  id="edit-notes"
                  rows={2}
                  className="w-full rounded border border-slate-200 p-2 text-xs text-slate-800 outline-hidden focus:border-teal-600 bg-slate-50/30"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contraindications, pediatric recommendations, etc."
                />
              </div>

              {/* Confirm submit buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  id="edit-cancel"
                  type="button"
                  onClick={() => setActiveTab('view')}
                  className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded transition"
                >
                  Cancel
                </button>
                <button
                  id="edit-submit"
                  type="submit"
                  className="px-5 h-9 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-teal-600/10 flex items-center gap-1"
                >
                  <Save className="h-4 w-4" /> Save Specifications
                </button>
              </div>

            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 px-5 flex items-center justify-between">
          <button
            id="btn-remove-medicine"
            onClick={() => {
              if (confirm(`Do you want to completely de-register and remove ${medicine.name} from the database?`)) {
                onDeleteMedicine(medicine.id);
              }
            }}
            className="flex items-center gap-1 py-1.5 px-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded text-xs font-semibold tracking-wide transition border border-transparent hover:border-red-100"
          >
            <Trash2 className="h-4 w-4" /> De-register Medicine
          </button>
          
          <button
            id="btn-close-bottom"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 font-bold text-white rounded text-xs tracking-wide transition shadow-xs"
          >
            Close Snapshot
          </button>
        </div>

      </div>
    </div>
  );
}
