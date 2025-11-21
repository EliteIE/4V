import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { ClipboardCheck, DollarSign, AlertTriangle } from 'lucide-react';

const CashCloseView: React.FC = () => {
  const { getDailyCashTotal, closeCash, cashCloses, currentUser } = useStore();
  const [reported, setReported] = useState('');
  const [notes, setNotes] = useState('');
  
  const systemTotal = getDailyCashTotal();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const existingClose = cashCloses.find(c => c.date === todayStr);
  
  const handleClose = (e: React.FormEvent) => {
    e.preventDefault();
    if (reported === '') return;
    closeCash(parseFloat(reported), notes);
  };

  if (existingClose) {
    const diff = existingClose.difference;
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-green-600 p-6 text-white text-center">
            <ClipboardCheck size={48} className="mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl font-bold">Caja Cerrada</h2>
            <p className="opacity-90">El cierre de hoy ya fue realizado</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Sistema calculó</span>
              <span className="font-bold text-slate-800">${existingClose.systemAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Reportado físico</span>
              <span className="font-bold text-slate-800">${existingClose.reportedAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">Diferencia</span>
              <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                diff === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {diff === 0 ? 'Exacto' : `$${diff.toLocaleString()}`}
              </span>
            </div>
            {existingClose.notes && (
              <div className="bg-slate-50 p-4 rounded-lg mt-4">
                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Observaciones</p>
                <p className="text-slate-700 text-sm">{existingClose.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const diffPreview = reported ? parseFloat(reported) - systemTotal : 0;

  return (
    <div className="max-w-lg mx-auto space-y-6">
       <div className="flex items-center space-x-4">
        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
          <DollarSign size={32} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cierre de Caja Diario</h2>
          <p className="text-slate-500">Verificación de efectivo al final del día</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="mb-8 text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-slate-500 mb-2 text-sm uppercase tracking-wide font-semibold">Total Esperado (Sistema)</p>
          <p className="text-4xl font-bold text-slate-800">${systemTotal.toLocaleString()}</p>
        </div>

        <form onSubmit={handleClose} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Efectivo Físico (Contado)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
              <input
                type="number"
                required
                className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-lg font-semibold"
                placeholder="0.00"
                value={reported}
                onChange={(e) => setReported(e.target.value)}
              />
            </div>
          </div>

          {reported && (
            <div className={`p-4 rounded-lg flex items-start gap-3 ${
              diffPreview === 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-800'
            }`}>
              {diffPreview !== 0 && <AlertTriangle size={20} className="mt-0.5 flex-shrink-0" />}
              <div className="text-sm">
                <span className="font-bold block mb-1">
                  {diffPreview === 0 ? 'Cuadra perfectamente' : 'Diferencia detectada'}
                </span>
                {diffPreview !== 0 && (
                  <span>
                    Hay una diferencia de <strong>${diffPreview.toLocaleString()}</strong>. 
                    Por favor justifique en observaciones.
                  </span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones</label>
            <textarea
              className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none h-24"
              placeholder="Justificación de diferencias o comentarios del día..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg"
          >
            Confirmar Cierre del Día
          </button>
        </form>
      </div>
    </div>
  );
};

export default CashCloseView;