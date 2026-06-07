import React, { useState } from 'react';
import { AIRecommendation, Medicine } from '../types';
import { Sparkles, Loader2, Plus, CornerDownRight, Check, AlertCircle, RefreshCw, ClipboardList, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface AIOnboardingProps {
  onAddMedicine: (medicine: Omit<Medicine, 'id'>) => void;
}

export default function AIOnboarding({ onAddMedicine }: AIOnboardingProps) {
  const [query, setQuery] = useState('');
  const [rawText, setRawText] = useState('');
  const [inputMode, setInputMode] = useState<'single' | 'invoice'>('single');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form states for final review
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState('');
  const [shelfNo, setShelfNo] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [minStock, setMinStock] = useState(20);
  const [unit, setUnit] = useState('Tablets');
  const [price, setPrice] = useState(12.50);
  const [expiryDate, setExpiryDate] = useState('');
  const [storageTemp, setStorageTemp] = useState('Room Temp');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [onboardedSuccess, setOnboardedSuccess] = useState(false);

  // Quick preset queries for user demonstration
  const PRESETS = [
    { name: "Humalog Eli Lilly", type: "single" },
    { name: "Amoximac 500 cap", type: "single" },
    { name: "Prilosec 20mg tab", type: "single" },
    { name: "SHIPMENT RECV: 100 boxes Paracetamol 500mg, batch #PAR99, trade price $2.50, room temp, expires 12-2028", type: "invoice" }
  ];

  const handleAISuggestCombined = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRecommendation(null);
    setOnboardedSuccess(false);

    try {
      const response = await fetch('/api/gemini/suggest-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: inputMode === 'single' ? query : undefined,
          rawText: inputMode === 'invoice' ? rawText : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve AI catalog details. Please check the backend connection.');
      }

      const data: AIRecommendation = await response.json();
      setRecommendation(data);

      // Prepopulate edit form
      setName(data.name || '');
      setGenericName(data.genericName || '');
      setCategory(data.category || 'Vitamins & Supplements');
      setShelfNo(data.suggestedShelf || 'S-1');
      setUnit(data.unit || 'Tablets');
      setPrice(data.price || 10.00);
      setMinStock(data.suggestedMinStock || 15);
      setStorageTemp(data.storageTemp || 'Room Temp');
      setNotes(data.notes || '');
      
      // Auto-set modern defaults for exp and batch
      const yearFromNow = new Date();
      yearFromNow.setFullYear(yearFromNow.getFullYear() + 2);
      setExpiryDate(yearFromNow.toISOString().split('T')[0]);
      setBatchNumber('B' + Math.floor(Math.random() * 900000 + 100000));
      setQuantity(100);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected onboarding service error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardStock = () => {
    if (!name.trim() || !shelfNo.trim() || !expiryDate || !batchNumber.trim()) {
      setError('Please double check Name, Shelf Code, Batch Number and Expiry Date. They are mandatory.');
      return;
    }

    // Verify shelf format [Zone]-[Number]
    const regex = /^[A-S,R]-[1-4]$/;
    if (!regex.test(shelfNo)) {
      setError('Shelf format must be a single Capital letter zone tag (A, B, C, D, E, F, S, R) and index (1-4). Example: A-1, B-3, R-2.');
      return;
    }

    onAddMedicine({
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
    });

    setOnboardedSuccess(true);
    setRecommendation(null);
    setQuery('');
    setRawText('');
    setTimeout(() => setOnboardedSuccess(false), 4000);
  };

  return (
    <div id="ai-onboarding-container" className="bg-white rounded-xl shadow-xs border border-slate-100 p-6">
      
      {/* Container Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1 px-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-tight">AI Agent</div>
        <h2 className="text-xl font-bold font-sans text-slate-800 flex items-center gap-1.5">
          <Sparkles className="h-5 w-5 text-indigo-600 my-auto" />
          Smart Onboarding Assistant
        </h2>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Onboard new medical chemical stock instantly. Type a brand or paste shipment logs, and Gemini will deduce active agents, classification, and appropriate safe shelf zone coordinates automatically.
      </p>

      {/* Inputs selectors */}
      <div className="flex border-b border-slate-100 mb-5 text-xs font-semibold">
        <button
          id="btn-mode-single"
          onClick={() => { setInputMode('single'); setError(null); }}
          className={`pb-2.5 px-4 -mb-px border-b-2 transition ${
            inputMode === 'single'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Quick Name Search
        </button>
        <button
          id="btn-mode-invoice"
          onClick={() => { setInputMode('invoice'); setError(null); }}
          className={`pb-2.5 px-4 -mb-px border-b-2 transition flex items-center gap-1 ${
            inputMode === 'invoice'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" /> Bulk Shipment Text/Invoice
        </button>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleAISuggestCombined} className="space-y-4">
        {inputMode === 'single' ? (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Commercial Brand / Drug Compound Name</label>
            <div className="flex gap-2">
              <input
                id="input-ai-query-single"
                type="text"
                className="flex-1 rounded-lg border border-slate-200 p-2.5 text-sm outline-hidden focus:border-indigo-600 bg-slate-50/50"
                placeholder="e.g. Paracetamol, Insulin Humalog, Zentac susp..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                id="btn-submit-ai-lookup"
                type="submit"
                disabled={loading || !query.trim()}
                className="px-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-semibold text-sm rounded-lg transition flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Analyze
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Paste Incoming Shipment Logs or Purchase Receipts</label>
              <textarea
                id="input-ai-query-invoice"
                rows={4}
                className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:border-indigo-600 outline-hidden bg-slate-50/50 font-mono text-xs"
                placeholder="Paste packing list or receipt detail. For example:
Rcvd: Metformin 1000mg tabs x50, batch GLY8819, expiry 03/2028, purchased for $8.50 per unit..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>
            <button
              id="btn-submit-ai-invoice"
              type="submit"
              disabled={loading || !rawText.trim()}
              className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white font-semibold text-sm rounded-lg transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Deduce & Map Shipment Details
            </button>
          </div>
        )}
      </form>

      {/* Demo Preset Buttons */}
      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
        <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide mr-1 flex items-center gap-0.5">Presets:</span>
        {PRESETS.map((preset, idx) => (
          <button
            id={`preset-btn-${idx}`}
            key={idx}
            type="button"
            onClick={() => {
              setInputMode(preset.type as 'single' | 'invoice');
              if (preset.type === 'single') {
                setQuery(preset.name);
              } else {
                setRawText(preset.name);
              }
            }}
            className="px-2 py-1 bg-slate-100 hover:bg-indigo-50/80 text-slate-650 hover:text-indigo-700 rounded text-[10px] font-medium transition flex items-center gap-0.5 border border-slate-200/40"
          >
            {preset.name.length > 28 ? preset.name.substring(0, 28) + "..." : preset.name}
          </button>
        ))}
      </div>

      {/* Notification Toast */}
      {onboardedSuccess && (
        <div className="mt-4 p-3 bg-semibold bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2 border border-emerald-100 shadow-sm animate-fade-in animate-duration-300">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          Stock Successfully Allocated & Stacked on Visual Shelf Coordinates!
        </div>
      )}

      {/* Error Displays */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-lg text-xs font-semibold flex items-start gap-2 border border-red-100">
          <AlertCircle className="h-4 w-4 text-red-650 shrink-0 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* Review & Onboard form - triggered when Gemini recommends item */}
      {recommendation && (
        <div className="mt-6 border border-indigo-100 bg-indigo-50/20 rounded-xl p-5 space-y-4 animate-fade-in animate-duration-300">
          
          {/* AI Banner */}
          <div className="flex items-start gap-3 bg-indigo-50/80 p-3.5 rounded-lg border border-indigo-100">
            <Sparkles className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900 leading-normal">
              <strong className="font-sans font-extrabold text-indigo-950">Gemini Recommendations:</strong>
              <p className="mt-1 text-[11px] font-sans font-medium text-slate-650">
                {recommendation.explanation}
              </p>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Confirm Catalog Entry Coordinates
          </p>

          {/* Form grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Commercial Name</label>
              <input
                id="form-review-name"
                type="text"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800 font-semibold"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Generic Name / APIs</label>
              <input
                id="form-review-generic"
                type="text"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Category Classification</label>
              <select
                id="form-review-category"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
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
              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                Target Shelf Number <span className="text-red-500">*</span>
              </label>
              <input
                id="form-review-shelf"
                type="text"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800 font-mono font-bold"
                value={shelfNo}
                onChange={(e) => setShelfNo(e.target.value)}
                placeholder="e.g. A-1, B-3, R-1"
              />
              <span className="text-[9px] text-slate-400 mt-0.5 block">Format: Letter (A-S, R) + number (1-4).</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Oncoming Stock Qty</label>
              <input
                id="form-review-qty"
                type="number"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value, 10) : 0)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Minimum Alert Qty</label>
              <input
                id="form-review-min"
                type="number"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value ? parseInt(e.target.value, 10) : 0)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Unit Type</label>
              <select
                id="form-review-unit"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="Tablets">Tablets</option>
                <option value="Capsules">Capsules</option>
                <option value="Liquid (ml)">Liquid (ml)</option>
                <option value="Cream (g)">Cream (g)</option>
                <option value="Injection">Injection</option>
                <option value="Inhaler">Inhaler</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Price per Unit (USD)</label>
              <input
                id="form-review-price"
                type="number"
                step="0.01"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Batch Number</label>
              <input
                id="form-review-batch"
                type="text"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800 font-mono"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Expiry Date</label>
              <input
                id="form-review-expiry"
                type="date"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800 font-mono"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Storage Temperature</label>
              <input
                id="form-review-temp"
                type="text"
                className="w-full rounded border border-slate-200 p-2 bg-slate-100 text-xs outline-hidden text-slate-600 cursor-not-allowed"
                value={storageTemp}
                disabled
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Interaction Tips / Storage Notes</label>
              <input
                id="form-review-notes"
                type="text"
                className="w-full rounded border border-slate-200 p-2 bg-white text-xs outline-hidden text-slate-800"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional dosage remarks"
              />
            </div>

          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              id="form-review-cancel"
              type="button"
              onClick={() => setRecommendation(null)}
              className="px-4 py-2 hover:bg-slate-100 text-slate-600 font-semibold text-xs rounded transition"
            >
              Discard Recommendations
            </button>
            <button
              id="form-review-submit"
              type="button"
              onClick={handleOnboardStock}
              className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-all shadow-md shadow-indigo-650/10 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Approve & Cabinet Stocking
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
