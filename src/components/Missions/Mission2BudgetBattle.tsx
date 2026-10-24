import React, { useState } from 'react';
import { AppState, Team, Mission2Submission, MaterialCostItem } from '../../types';
import {
  Calculator,
  Plus,
  Trash2,
  Save,
  Send,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Layers,
  Users
} from 'lucide-react';

interface Mission2Props {
  state: AppState;
  activeTeam: Team;
  onBack: () => void;
  onSaveSubmission: (submission: any, isFinalSubmit: boolean) => void;
}

export const Mission2BudgetBattle: React.FC<Mission2Props> = ({
  state,
  activeTeam,
  onBack,
  onSaveSubmission,
}) => {
  const existingSub = state.submissions.find(
    s => s.teamId === activeTeam.id && s.missionNumber === 2
  );

  const initialPayload: Mission2Submission = (existingSub?.payload as Mission2Submission) || {
    plannedBatchUnits: activeTeam.targetBatchUnits || 30,
    materials: [
      {
        id: 'mat-1',
        name: 'Bahan Utama Aktif',
        specification: 'Grade Farmasi/Pangan bersertifikat',
        unit: 'ml/gram',
        qtyPerUnit: 50,
        unitPrice: 300,
        batchQty: 1500,
        totalCost: 450000,
      },
      {
        id: 'mat-2',
        name: 'Pelarut / Cairan Pembawa (Aquadest/Etanol)',
        specification: 'Lab grade steril',
        unit: 'ml',
        qtyPerUnit: 20,
        unitPrice: 50,
        batchQty: 600,
        totalCost: 30000,
      },
      {
        id: 'mat-3',
        name: 'Wadah Kemasan Primer & Tutup',
        specification: 'Botol/Pouch segel anti bocor',
        unit: 'Pcs',
        qtyPerUnit: 1,
        unitPrice: 2000,
        batchQty: 30,
        totalCost: 60000,
      },
    ],
    packagingCost: 15000,
    laborCost: 25000,
    overheadCost: 10000,
    totalProductionCost: 575000,
    hppPerUnit: 19166,
    targetSellingPrice: 25000,
    estimatedMarginPercent: 23.3,
    sopSteps: [
      {
        stepNumber: 1,
        title: 'Sterilisasi & Penyiapan Alat-Bahan',
        action: 'Bersihkan alat pencampur dan meja kerja dengan alkohol 70%, gunakan APD lengkap.',
        criticalControlPoint: 'Kondisi steril tanpa kontaminan mikroba.',
        picRole: 'PIC Bahan & Formulasi',
      },
      {
        stepNumber: 2,
        title: 'Penimbangan Presisi Bahan Baku',
        action: 'Timbang bahan menggunakan timbangan analitik digital yang telah dikalibrasi.',
        criticalControlPoint: 'Toleransi timbangan maksimal ±0.05 gram.',
        picRole: 'PIC Bahan',
      },
      {
        stepNumber: 3,
        title: 'Pencampuran & Homogenisasi Fase',
        action: 'Campurkan fase cair dan zat aktif perlahan dengan pengadukan konstan selama 5 menit.',
        criticalControlPoint: 'Cairan tercampur homogen sempurna tanpa endapan.',
        picRole: 'PIC Proses Produksi',
      },
      {
        stepNumber: 4,
        title: 'Filling ke Kemasan & Capping Rapat',
        action: 'Isi botol masing-masing tepat volume netto, pasang tutup spray dan kunci drat.',
        criticalControlPoint: 'Uji balik botol tidak ada tetesan rembes.',
        picRole: 'PIC Kemasan & Label',
      },
      {
        stepNumber: 5,
        title: 'Pelabelan & Pengujian Sampel Acak',
        action: 'Tempel stiker label lurus rapi, periksa kode batch dan tanggal kadaluarsa.',
        criticalControlPoint: 'Label terbaca tajam dan tidak menggelembung.',
        picRole: 'PIC Quality Control (QC)',
      },
    ],
    budgetStrategyNotes: 'Membeli kemasan secara paket lusinan dan memilih bahan baku lokal Jambi terpercaya untuk menekan biaya modal serta mempertahankan pagu anggaran di bawah Rp600.000.',
  };

  const [formData, setFormData] = useState<Mission2Submission>(initialPayload);
  const [activeTab, setActiveTab] = useState<'bom' | 'biaya' | 'sop' | 'strategi'>('bom');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Recalculate totals
  const recalculateBudget = (updatedMaterials: MaterialCostItem[], batchUnits: number, pkg: number, labor: number, overhead: number, sellPrice: number) => {
    const rawTotal = updatedMaterials.reduce((acc, item) => acc + (item.totalCost || 0), 0);
    const grandTotal = rawTotal + pkg + labor + overhead;
    const hpp = batchUnits > 0 ? Math.round(grandTotal / batchUnits) : 0;
    const margin = sellPrice > 0 ? Math.round(((sellPrice - hpp) / sellPrice) * 1000) / 10 : 0;

    setFormData(prev => ({
      ...prev,
      plannedBatchUnits: batchUnits,
      materials: updatedMaterials,
      packagingCost: pkg,
      laborCost: labor,
      overheadCost: overhead,
      totalProductionCost: grandTotal,
      hppPerUnit: hpp,
      targetSellingPrice: sellPrice,
      estimatedMarginPercent: margin,
    }));
  };

  const handleMaterialChange = (index: number, field: keyof MaterialCostItem, value: any) => {
    const updated = [...formData.materials];
    const item = { ...updated[index], [field]: value };

    // Auto calculate batchQty & totalCost if price or qty changes
    if (field === 'qtyPerUnit' || field === 'unitPrice') {
      const qUnit = field === 'qtyPerUnit' ? Number(value) : item.qtyPerUnit;
      const uPrice = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.batchQty = Math.round(qUnit * formData.plannedBatchUnits * 100) / 100;
      item.totalCost = Math.round(item.batchQty * uPrice);
    }
    updated[index] = item;
    recalculateBudget(updated, formData.plannedBatchUnits, formData.packagingCost, formData.laborCost, formData.overheadCost, formData.targetSellingPrice);
  };

  const handleAddMaterial = () => {
    const newItem: MaterialCostItem = {
      id: `mat-${Date.now()}`,
      name: 'Bahan Baru',
      specification: 'Spek teknis',
      unit: 'ml/gr',
      qtyPerUnit: 1,
      unitPrice: 1000,
      batchQty: formData.plannedBatchUnits,
      totalCost: formData.plannedBatchUnits * 1000,
    };
    const updated = [...formData.materials, newItem];
    recalculateBudget(updated, formData.plannedBatchUnits, formData.packagingCost, formData.laborCost, formData.overheadCost, formData.targetSellingPrice);
  };

  const handleRemoveMaterial = (index: number) => {
    const updated = formData.materials.filter((_, i) => i !== index);
    recalculateBudget(updated, formData.plannedBatchUnits, formData.packagingCost, formData.laborCost, formData.overheadCost, formData.targetSellingPrice);
  };

  const handleBatchUnitsChange = (units: number) => {
    const validUnits = Math.max(1, units);
    const updated = formData.materials.map(m => {
      const bQty = Math.round(m.qtyPerUnit * validUnits * 100) / 100;
      return {
        ...m,
        batchQty: bQty,
        totalCost: Math.round(bQty * m.unitPrice),
      };
    });
    recalculateBudget(updated, validUnits, formData.packagingCost, formData.laborCost, formData.overheadCost, formData.targetSellingPrice);
  };

  const handleSaveDraft = () => {
    onSaveSubmission(formData, false);
    setSaveNotice('Rencana anggaran dan SOP Misi 2 berhasil disimpan!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  const handleSubmitToTeacher = () => {
    if (formData.materials.length === 0) {
      alert('Tambahkan minimal 1 bahan pada tabel BOM!');
      return;
    }
    onSaveSubmission(formData, true);
    setSaveNotice('Misi 2 berhasil dikumpulkan ke Guru A. Rahman!');
    setTimeout(() => setSaveNotice(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Nav Back */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-teal-400" />
          <span>Kembali ke Peta Misi</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Tim:</span>
          <span className="text-xs font-bold text-teal-300 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded">
            {activeTeam.name}
          </span>
          <span className="text-xs font-mono px-2 py-0.5 rounded border text-teal-400 bg-teal-950/60 border-teal-500/40">
            {existingSub?.status === 'selesai_diverifikasi' ? 'Selesai Diverifikasi' : existingSub?.status === 'dikumpulkan' ? 'Terkumpul' : 'Draf Aktif'}
          </span>
        </div>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-teal-400 font-mono">
              <span>MISI 2 — MQ-02</span>
              <span>·</span>
              <span>ESTIMASI: 90 MENIT</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Budget Battle — Kalkulasi Biaya, HPP & SOP</h1>
            <p className="text-sm text-slate-300">
              Rancang kebutuhan bahan baku (Bill of Materials), kalkulasi HPP dan margin harga jual, susun diagram alir SOP 5 tahap, dan bagi peran kerja tim.
            </p>
          </div>

          <div className="bg-slate-950 border border-teal-500/30 rounded-xl p-4 text-right shrink-0">
            <span className="text-xs text-slate-400 block">Target HPP per Unit</span>
            <span className="text-2xl font-bold font-mono text-teal-400">
              Rp{formData.hppPerUnit.toLocaleString('id-ID')}
            </span>
            <span className="text-[11px] text-indigo-300 block">
              Margin: {formData.estimatedMarginPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('bom')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'bom'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          1. Tabel Bahan Baku (BOM)
        </button>
        <button
          onClick={() => setActiveTab('biaya')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'biaya'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          2. HPP & Simulator Harga Jual
        </button>
        <button
          onClick={() => setActiveTab('sop')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'sop'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          3. SOP 5 Tahap & Diagram Alir
        </button>
        <button
          onClick={() => setActiveTab('strategi')}
          className={`px-4 py-2 text-xs md:text-sm font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
            activeTab === 'strategi'
              ? 'text-teal-400 border-teal-400 bg-slate-900/60'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          4. Peran Tim & Strategi Anggaran
        </button>
      </div>

      {/* Tab 1: BOM (Bill of Materials) */}
      {activeTab === 'bom' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">Bill of Materials (BOM) — Kebutuhan Bahan Baku</h2>
              <p className="text-xs text-slate-400">
                Hitung takaran per unit dan kalkulasi otomatis kebutuhan 1 batch penuh.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Rencana Batch:</span>
                <input
                  type="number"
                  min={1}
                  value={formData.plannedBatchUnits}
                  onChange={(e) => handleBatchUnitsChange(Number(e.target.value))}
                  className="w-20 bg-slate-950 border border-slate-700 text-sm font-mono font-bold text-teal-400 rounded-lg px-2.5 py-1 text-center"
                />
                <span className="text-xs text-slate-400">Unit</span>
              </div>

              <button
                onClick={handleAddMaterial}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Bahan</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-semibold">
                  <th className="py-2.5 px-3">Nama Bahan & Spesifikasi</th>
                  <th className="py-2.5 px-3">Satuan</th>
                  <th className="py-2.5 px-3 text-right">Takaran/Unit</th>
                  <th className="py-2.5 px-3 text-right">Harga/Satuan (Rp)</th>
                  <th className="py-2.5 px-3 text-right">Total Batch</th>
                  <th className="py-2.5 px-3 text-right">Biaya Bahan (Rp)</th>
                  <th className="py-2.5 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {formData.materials.map((mat, idx) => (
                  <tr key={mat.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={mat.name}
                        onChange={(e) => handleMaterialChange(idx, 'name', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-medium mb-1"
                      />
                      <input
                        type="text"
                        value={mat.specification}
                        onChange={(e) => handleMaterialChange(idx, 'specification', e.target.value)}
                        placeholder="Spesifikasi bahan..."
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-400"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={mat.unit}
                        onChange={(e) => handleMaterialChange(idx, 'unit', e.target.value)}
                        className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-center"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        step="any"
                        value={mat.qtyPerUnit}
                        onChange={(e) => handleMaterialChange(idx, 'qtyPerUnit', Number(e.target.value))}
                        className="w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <input
                        type="number"
                        value={mat.unitPrice}
                        onChange={(e) => handleMaterialChange(idx, 'unitPrice', Number(e.target.value))}
                        className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                      {mat.batchQty} {mat.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-300">
                      Rp{mat.totalCost.toLocaleString('id-ID')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => handleRemoveMaterial(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: HPP & Simulator Harga Jual */}
      {activeTab === 'biaya' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Perhitungan HPP & Simulator Harga Jual</h2>
            <p className="text-xs text-slate-400">
              Lengkapi komponen biaya operasional lainnya (kemasan, upah, overhead) untuk mendapatkan HPP akurat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>Rincian Biaya Produksi Batch ({formData.plannedBatchUnits} Unit)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">1. Total Bahan Baku (BOM):</span>
                  <span className="font-mono font-bold text-white">
                    Rp{formData.materials.reduce((a, b) => a + b.totalCost, 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <label className="text-slate-400">2. Biaya Kemasan & Label Tambahan:</label>
                  <input
                    type="number"
                    value={formData.packagingCost}
                    onChange={(e) => recalculateBudget(formData.materials, formData.plannedBatchUnits, Number(e.target.value), formData.laborCost, formData.overheadCost, formData.targetSellingPrice)}
                    className="w-28 bg-slate-900 border border-slate-700 text-right px-2 py-1 text-white font-mono rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <label className="text-slate-400">3. Biaya Tenaga Kerja / Upah:</label>
                  <input
                    type="number"
                    value={formData.laborCost}
                    onChange={(e) => recalculateBudget(formData.materials, formData.plannedBatchUnits, formData.packagingCost, Number(e.target.value), formData.overheadCost, formData.targetSellingPrice)}
                    className="w-28 bg-slate-900 border border-slate-700 text-right px-2 py-1 text-white font-mono rounded"
                  />
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <label className="text-slate-400">4. Biaya Overhead (Listrik, Gas, Air):</label>
                  <input
                    type="number"
                    value={formData.overheadCost}
                    onChange={(e) => recalculateBudget(formData.materials, formData.plannedBatchUnits, formData.packagingCost, formData.laborCost, Number(e.target.value), formData.targetSellingPrice)}
                    className="w-28 bg-slate-900 border border-slate-700 text-right px-2 py-1 text-white font-mono rounded"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 text-sm">
                  <span className="font-bold text-slate-200">Total Biaya Produksi:</span>
                  <span className="font-mono font-bold text-teal-300">
                    Rp{formData.totalProductionCost.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing Simulator */}
            <div className="bg-slate-950 border border-indigo-950 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-indigo-400" />
                <span>Simulator Penetapan Harga Jual</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Harga Pokok Produksi (HPP) per Unit:</span>
                  <span className="text-xl font-mono font-bold text-teal-400">
                    Rp{formData.hppPerUnit.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    (Formula: Total Biaya Rp{formData.totalProductionCost.toLocaleString('id-ID')} ÷ {formData.plannedBatchUnits} Unit)
                  </span>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">
                    Target Harga Jual ke Konsumen (Rp):
                  </label>
                  <input
                    type="number"
                    value={formData.targetSellingPrice}
                    onChange={(e) => recalculateBudget(formData.materials, formData.plannedBatchUnits, formData.packagingCost, formData.laborCost, formData.overheadCost, Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 text-base font-mono font-bold text-white rounded-lg px-3 py-2 focus:border-teal-400 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-900 rounded-lg space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Laba Kotor per Unit:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      Rp{Math.max(0, formData.targetSellingPrice - formData.hppPerUnit).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Persentase Margin Keuntungan:</span>
                    <span className={`font-mono font-bold ${formData.estimatedMarginPercent >= 20 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {formData.estimatedMarginPercent}%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  *Tips Guru KIK: Usahakan margin kotor minimal 20%–35% untuk produk farmasi/kosmetik skala kecil guna menutupi risiko produk reject dan biaya pemasaran.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: SOP 5 Tahap & Diagram Alir */}
      {activeTab === 'sop' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Standar Operasional Prosedur (SOP) 5 Tahap</h2>
            <p className="text-xs text-slate-400">
              Rancang alur kerja baku dari persiapan hingga pengemasan lengkap dengan Titik Kendali Kritis (Critical Control Point / CCP).
            </p>
          </div>

          <div className="space-y-4">
            {formData.sopSteps.map((step, idx) => (
              <div key={step.stepNumber} className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-mono font-bold text-teal-400 bg-teal-950/60 border border-teal-500/40 px-2 py-0.5 rounded">
                    Tahap 0{step.stepNumber}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...formData.sopSteps];
                      updated[idx].title = e.target.value;
                      setFormData(prev => ({ ...prev, sopSteps: updated }));
                    }}
                    placeholder="Judul Tahap SOP"
                    className="flex-1 bg-slate-900 border border-slate-700 text-xs font-bold text-white rounded px-2.5 py-1"
                  />
                  <input
                    type="text"
                    value={step.picRole}
                    onChange={(e) => {
                      const updated = [...formData.sopSteps];
                      updated[idx].picRole = e.target.value;
                      setFormData(prev => ({ ...prev, sopSteps: updated }));
                    }}
                    placeholder="Penanggung Jawab (PIC)"
                    className="w-48 bg-slate-900 border border-slate-700 text-xs text-indigo-300 rounded px-2.5 py-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Instruksi Kerja Langkah:</label>
                    <textarea
                      rows={2}
                      value={step.action}
                      onChange={(e) => {
                        const updated = [...formData.sopSteps];
                        updated[idx].action = e.target.value;
                        setFormData(prev => ({ ...prev, sopSteps: updated }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Titik Kendali Kritis (Critical Control Point):</label>
                    <textarea
                      rows={2}
                      value={step.criticalControlPoint}
                      onChange={(e) => {
                        const updated = [...formData.sopSteps];
                        updated[idx].criticalControlPoint = e.target.value;
                        setFormData(prev => ({ ...prev, sopSteps: updated }));
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-teal-300"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Peran Tim & Strategi Anggaran */}
      {activeTab === 'strategi' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Strategi Pagu Anggaran & Pembagian Tugas Tim</h2>
            <p className="text-xs text-slate-400">
              Jelaskan bagaimana tim mengoptimalkan modal kerja, mencari harga bahan kompetitif, dan membagi beban kerja secara berkeadilan.
            </p>
          </div>

          <textarea
            rows={6}
            value={formData.budgetStrategyNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, budgetStrategyNotes: e.target.value }))}
            className="w-full bg-slate-950 border border-slate-700 text-xs md:text-sm rounded-lg p-3.5 text-white focus:border-teal-400 focus:outline-none leading-relaxed"
            placeholder="Tuliskan strategi anggaran kelompok, mitigasi pemborosan, dan pembagian tugas kerja..."
          />
        </div>
      )}

      {/* Save Notice */}
      {saveNotice && (
        <div className="p-3 bg-teal-950 border border-teal-500 rounded-lg text-teal-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          Kembali ke Peta
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveDraft}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-400" />
            <span>Simpan Draf</span>
          </button>

          <button
            onClick={handleSubmitToTeacher}
            className="flex items-center gap-1.5 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Kumpulkan Misi 2 ke Guru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
