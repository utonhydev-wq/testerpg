import React, { useState } from 'react';
import {
  Library,
  Sparkles,
  Search,
  Filter,
  Plus,
  Edit2,
  CheckCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { SystemElement, UserProfile } from '../../types';

interface SystemCatalogViewProps {
  elements: SystemElement[];
  onSaveElement: (elem: SystemElement) => void;
  currentUser: UserProfile;
}

export const SystemCatalogView: React.FC<SystemCatalogViewProps> = ({
  elements,
  onSaveElement,
  currentUser
}) => {
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingElem, setEditingElem] = useState<SystemElement | null>(null);

  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const categories = [
    { id: 'all', label: 'Todos os 36 Elementos', color: '#94A3B8' },
    { id: 'Sistêmica', label: 'Centro: Sistêmica', color: '#06B6D4' },
    { id: 'Neutra', label: 'Neutra', color: '#94A3B8' },
    { id: 'Mana', label: 'Mana', color: '#3B82F6' },
    { id: 'Física', label: 'Física', color: '#EF4444' },
    { id: 'Aura', label: 'Aura', color: '#F97316' },
    { id: 'Prana', label: 'Prana', color: '#EAB308' }
  ];

  const filtered = elements.filter((el) => {
    if (selectedCat !== 'all' && el.category !== selectedCat) return false;
    if (searchQuery.trim() && !el.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingElem) return;
    onSaveElement(editingElem);
    setEditingElem(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Library className="w-5 h-5 text-cyan-400" /> Catálogo Sistêmico de Elementos
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Os 36 elementos primordiais divididos no Centro Sistêmico e nas 5 Energias do mundo.
          </p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar elemento..."
              className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto text-xs">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCat(c.id)}
            style={selectedCat === c.id ? { borderColor: c.color, color: c.color } : {}}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap border ${
              selectedCat === c.id
                ? 'bg-slate-950 shadow-xs'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Elements Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((elem) => (
          <div
            key={elem.id}
            className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between shadow-md group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {elem.name}
                </span>
                <span
                  style={{ color: elem.color, borderColor: elem.color + '40', backgroundColor: elem.color + '15' }}
                  className="px-2 py-0.5 rounded text-[10px] font-bold border shrink-0"
                >
                  {elem.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {elem.description}
              </p>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="truncate">{elem.sourceTextRef}</span>
              {isMaster && (
                <button
                  onClick={() => setEditingElem(elem)}
                  className="p-1 hover:text-cyan-400 transition-colors"
                  title="Editar elemento"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Element Modal (Master Only) */}
      {editingElem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold">Editar Elemento Sistêmico</h3>

            <form onSubmit={handleSaveSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome</label>
                <input
                  type="text"
                  required
                  value={editingElem.name}
                  onChange={(e) => setEditingElem({ ...editingElem, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={editingElem.description}
                  onChange={(e) => setEditingElem({ ...editingElem, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Referência do Texto Original</label>
                <input
                  type="text"
                  value={editingElem.sourceTextRef}
                  onChange={(e) => setEditingElem({ ...editingElem, sourceTextRef: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingElem(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
