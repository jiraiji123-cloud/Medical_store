import React, { useState, useEffect } from 'react';
import { Medicine } from './types';
import { INITIAL_MEDICINES } from './data/initialMedicines';
import ShelvesGrid from './components/ShelvesGrid';
import AlertCenter from './components/AlertCenter';
import AIOnboarding from './components/AIOnboarding';
import MedicineModal from './components/MedicineModal';
import { 
  Pill, 
  Search, 
  Filter, 
  Layers, 
  Boxes, 
  Calendar, 
  TrendingUp, 
  Plus, 
  ListFilter,
  Trash2,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Barcode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [activeTab, setActiveTab] = useState<'shelves' | 'catalog' | 'onboard'>('shelves');

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'expired' | 'soon' | 'low'>('all');

  // Load medicines from localStorage or seed fallback
  useEffect(() => {
    const saved = localStorage.getItem('n2s_medicines');
    if (saved) {
      try {
        setMedicines(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to restore medicine inventory, falling back to initial data: ", err);
        setMedicines(INITIAL_MEDICINES);
        localStorage.setItem('n2s_medicines', JSON.stringify(INITIAL_MEDICINES));
      }
    } else {
      setMedicines(INITIAL_MEDICINES);
      localStorage.setItem('n2s_medicines', JSON.stringify(INITIAL_MEDICINES));
    }
  }, []);

  // Save changes helper
  const saveInventory = (updatedList: Medicine[]) => {
    setMedicines(updatedList);
    localStorage.setItem('n2s_medicines', JSON.stringify(updatedList));
  };

  // Onboarding action
  const handleAddMedicine = (newMed: Omit<Medicine, 'id'>) => {
    const id = `med-${Date.now()}`;
    const completeItem: Medicine = {
      id,
      ...newMed
    };
    const updated = [completeItem, ...medicines];
    saveInventory(updated);
  };

  // Update specific medicine details (qty changes, price etc.)
  const handleUpdateMedicine = (updatedMed: Medicine) => {
    const updated = medicines.map((m) => (m.id === updatedMed.id ? updatedMed : m));
    saveInventory(updated);
    if (selectedMedicine && selectedMedicine.id === updatedMed.id) {
      setSelectedMedicine(updatedMed);
    }
  };

  // Apply clearance discount
  const handleApplyDiscount = (id: string, percent: number) => {
    const updated = medicines.map((med) => {
      if (med.id === id) {
        const factor = (100 - percent) / 100;
        return {
          ...med,
          price: Number((med.price * factor).toFixed(2)),
          notes: `${med.notes ? med.notes + ' | ' : ''}Applied ${percent}% Clearance Expiry Discount.`
        };
      }
      return med;
    });
    saveInventory(updated);
  };

  // De-register/delete from store
  const handleDeleteMedicine = (id: string) => {
    const updated = medicines.filter((m) => m.id !== id);
    saveInventory(updated);
    setSelectedMedicine(null);
  };

  // Reset inventory to seeds
  const handleResetInventory = () => {
    if (confirm("Are you sure you want to reset all medicine stocks, shelves placement, and alerts back to default settings? Your custom catalog adjustments will be overwritten.")) {
      saveInventory(INITIAL_MEDICINES);
    }
  };

  // Expiration calculations
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const getAlertStatusStr = (med: Medicine) => {
    const expiry = new Date(med.expiryDate);
    if (expiry < today) return 'expired';
    if (expiry <= thirtyDaysFromNow) return 'soon';
    if (med.quantity === 0) return 'low';
    if (med.quantity <= med.minStock) return 'low';
    return 'ok';
  };

  // Filter medicines list for display
  const filteredMedicines = medicines.filter((med) => {
    // 1. Search Query
    const matchSearch = 
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.shelfNo.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category
    const matchCategory = selectedCategory === 'all' || med.category === selectedCategory;

    // 3. Status filter
    const status = getAlertStatusStr(med);
    const matchStatus = 
      selectedStatusFilter === 'all' ||
      (selectedStatusFilter === 'expired' && status === 'expired') ||
      (selectedStatusFilter === 'soon' && status === 'soon') ||
      (selectedStatusFilter === 'low' && status === 'low');

    return matchSearch && matchCategory && matchStatus;
  });

  // Calculate high-fidelity dashboard metrics
  const totalFormulations = medicines.length;
  const expiredCount = medicines.filter(m => new Date(m.expiryDate) < today).length;
  const expiringSoonCount = medicines.filter(m => {
    const exp = new Date(m.expiryDate);
    return exp >= today && exp <= thirtyDaysFromNow;
  }).length;
  const lowQuantityCount = medicines.filter(m => m.quantity <= m.minStock).length;

  const totalUnits = medicines.reduce((sum, m) => sum + m.quantity, 0);
  const totalStockValuation = medicines.reduce((sum, m) => sum + (m.quantity * m.price), 0);

  // Extracted unique categories for filter
  const categoriesList = Array.from(new Set(medicines.map(m => m.category)));

  return (
    <div id="app-root-view" className="min-h-screen bg-[#F8FAFC] text-slate-800 antialiased font-sans">
      
      {/* Top Professional App Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-600 rounded-lg text-white shadow-md shadow-teal-600/20">
              <Pill className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold font-sans text-slate-900 tracking-tight flex items-center gap-1.5 leading-none">
                Medical Store Master <span className="text-[10px] font-bold bg-teal-50 text-teal-600 px-1.5 py-0.5 rounded uppercase">N2S Controller</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Integrative Smart Chemical & Shelf Allocation Ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-reset-db"
              onClick={handleResetInventory}
              title="Reset Database to original demo values"
              className="px-2.5 py-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Re-seed
            </button>
            <span className="hidden sm:inline-block h-3.5 w-[1px] bg-slate-200 mx-1" />
            <span className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-slate-100 text-slate-500 rounded p-1 px-2">
              UTC Ledger (2026-06-07)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        
        {/* Statistics Widgets Banner Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div id="stat-compounds" className="bg-white border border-slate-100 p-4 rounded-xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-lg shrink-0">
              <Pill className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Compounds</span>
              <span className="text-xl font-black text-slate-900 leading-none block mt-1">{totalFormulations}</span>
              <span className="text-[10px] text-slate-500 font-medium">{totalUnits.toLocaleString()} total units</span>
            </div>
          </div>

          <div id="stat-expired" className="bg-white border border-slate-100 p-4 rounded-xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Chemically Expired</span>
              <span className="text-xl font-black text-red-600 leading-none block mt-1">{expiredCount}</span>
              <span className="text-[10px] text-red-500 font-semibold">{expiringSoonCount} soon in 30 days</span>
            </div>
          </div>

          <div id="stat-low" className="bg-white border border-slate-100 p-4 rounded-xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-550 rounded-lg shrink-0">
              <Boxes className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Restock warnings</span>
              <span className="text-xl font-black text-amber-550 leading-none block mt-1">{lowQuantityCount}</span>
              <span className="text-[10px] text-slate-500 font-medium">Below safety thresholds</span>
            </div>
          </div>

          <div id="stat-valuation" className="bg-white border border-slate-100 p-4 rounded-xl shadow-2xs flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Inventory Valuation</span>
              <span className="text-xl font-black text-indigo-600 leading-none block mt-1">${totalStockValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="text-[10px] text-slate-500 font-medium">Estimated asset cost base</span>
            </div>
          </div>

        </div>

        {/* Dynamic Expiry Alerts and Restock Reminders */}
        <AlertCenter 
          medicines={medicines} 
          onRemoveMedicine={handleDeleteMedicine}
          onUpdateQuantity={(id, val) => {
            const item = medicines.find(m => m.id === id);
            if (item) handleUpdateMedicine({ ...item, quantity: val });
          }}
          onApplyDiscount={handleApplyDiscount}
        />

        {/* View Segment Tab controllers */}
        <div className="flex border-b border-slate-200">
          <button
            id="tab-view-shelves"
            onClick={() => setActiveTab('shelves')}
            className={`pb-3 px-6 -mb-px font-bold text-sm transition flex items-center gap-1.5 ${
              activeTab === 'shelves'
                ? 'border-teal-600 text-teal-600 border-b-2'
                : 'border-transparent text-slate-450 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4.5 w-4.5" /> Cabinet Shelf Layout
          </button>
          
          <button
            id="tab-view-catalog"
            onClick={() => setActiveTab('catalog')}
            className={`pb-3 px-6 -mb-px font-bold text-sm transition flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-teal-600 text-teal-600 border-b-2'
                : 'border-transparent text-slate-450 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-4.5 w-4.5" /> Master Stock Table
          </button>

          <button
            id="tab-view-onboard"
            onClick={() => setActiveTab('onboard')}
            className={`pb-3 px-6 -mb-px font-bold text-sm transition flex items-center gap-1.5 ${
              activeTab === 'onboard'
                ? 'border-teal-600 text-teal-600 border-b-2'
                : 'border-transparent text-slate-450 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4.5 w-4.5" /> Smart AI Stocking
          </button>
        </div>

        {/* Tab views content area */}
        <div>
          {activeTab === 'shelves' && (
            <div className="space-y-6">
              <ShelvesGrid 
                medicines={medicines}
                onSelectMedicine={(med) => setSelectedMedicine(med)}
              />
            </div>
          )}

          {activeTab === 'onboard' && (
            <AIOnboarding onAddMedicine={handleAddMedicine} />
          )}

          {activeTab === 'catalog' && (
            <div className="bg-white rounded-xl shadow-xs border border-slate-100 p-6 space-y-4">
              
              {/* Table search filters bar */}
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <input
                    id="table-search-input"
                    type="text"
                    placeholder="Search by medicine name, generic compounding agent, shelf zones..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:border-teal-600 outline-hidden text-slate-700"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2.5">
                  
                  {/* Category dropdown filter */}
                  <select
                    id="table-filter-category"
                    className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-650 outline-hidden focus:border-teal-600"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">All Classifications</option>
                    {categoriesList.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>

                  {/* Expiry / Qty specific filter */}
                  <select
                    id="table-filter-status"
                    className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-lg px-3 py-2 text-slate-650 outline-hidden focus:border-teal-600"
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
                  >
                    <option value="all">All Alerts</option>
                    <option value="expired">Expired Stock</option>
                    <option value="soon">Expiring in 30 days</option>
                    <option value="low">Low Qty / Exhausted</option>
                  </select>

                  <button
                    id="btn-clear-table-filters"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedStatusFilter('all');
                    }}
                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs font-bold transition"
                  >
                    Reset Filter
                  </button>

                </div>
              </div>

              {/* Medicines Records Sheet Table */}
              <div className="overflow-x-auto border rounded-xl border-slate-150">
                <table className="w-full text-left text-xs text-slate-600 select-none">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-150 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">Medication details</th>
                      <th className="p-4">Generic Compounding</th>
                      <th className="p-4">Shelf No</th>
                      <th className="p-4">Stock level</th>
                      <th className="p-4">Unit Price</th>
                      <th className="p-4">Exporter Expiry</th>
                      <th className="p-4">Storage temperature</th>
                      <th className="p-4 text-center">Focus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredMedicines.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-450 italic">
                          No matching medical stock files located. Modify search options or onboard new molecules.
                        </td>
                      </tr>
                    ) : (
                      filteredMedicines.map((med) => {
                        const status = getAlertStatusStr(med);
                        let statusBadge = null;

                        if (status === 'expired') {
                          statusBadge = <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">Expired</span>;
                        } else if (status === 'soon') {
                          statusBadge = <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[10px] font-bold">ExpSoon</span>;
                        } else if (med.quantity === 0) {
                          statusBadge = <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-extrabold">Stockout</span>;
                        } else if (med.quantity <= med.minStock) {
                          statusBadge = <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold">Low</span>;
                        }

                        return (
                          <tr 
                            key={med.id}
                            className={`hover:bg-slate-50/50 cursor-pointer transition ${status === 'expired' ? 'bg-red-50/10' : ''}`}
                            onClick={() => setSelectedMedicine(med)}
                          >
                            <td className="p-4">
                              <div className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
                                {med.name}
                                {statusBadge}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono tracking-tight block mt-0.5">
                                Batch: {med.batchNumber} | ID: {med.id.replace('med-', 'M-')}
                              </span>
                            </td>
                            <td className="p-4 italic text-slate-650 font-sans">{med.genericName}</td>
                            <td className="p-4">
                              <span className="font-bold font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {med.shelfNo}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="font-mono font-bold text-slate-800">
                                {med.quantity} / <span className="text-slate-400 text-[10px]">{med.minStock} min</span>
                              </div>
                              <span className="text-[10px] text-slate-500 italic block">{med.unit}</span>
                            </td>
                            <td className="p-4 font-mono font-bold text-slate-800">
                              ${med.price.toFixed(2)}
                            </td>
                            <td className="p-4 font-mono">
                              <span className={status === 'expired' ? 'text-red-650 font-bold' : status === 'soon' ? 'text-amber-650 font-bold' : 'text-slate-700'}>
                                {med.expiryDate}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-medium">
                              {med.storageTemp}
                            </td>
                            <td className="p-4 text-center">
                              <button
                                id={`btn-table-action-${med.id}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedMedicine(med);
                                }}
                                className="px-2.5 py-1.5 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded hover:text-teal-600 transition text-[11px] font-bold"
                              >
                                Snapshot
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Print advice */}
              <div className="flex items-center justify-between text-[11px] text-slate-450 pt-2 font-medium">
                <p>Showing {filteredMedicines.length} of {medicines.length} formulations registered in local pharmacy database.</p>
                <p>Ensure chemical dates are inspected frequently.</p>
              </div>

            </div>
          )}
        </div>

      </main>

      {/* Floating detail snapshot view modal selection */}
      <AnimatePresence>
        {selectedMedicine && (
          <MedicineModal
            medicine={selectedMedicine}
            onClose={() => setSelectedMedicine(null)}
            onUpdateMedicine={handleUpdateMedicine}
            onDeleteMedicine={handleDeleteMedicine}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
