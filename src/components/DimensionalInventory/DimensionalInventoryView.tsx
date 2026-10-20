import React, { useState } from 'react';
import {
  Box,
  Shield,
  Layers,
  Sparkles,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  Move,
  CornerUpRight,
  Maximize2,
  Check
} from 'lucide-react';
import { Character, InventoryItem, EnergyType } from '../../types';

interface DimensionalInventoryViewProps {
  activeCharacter?: Character;
  onSaveCharacter: (char: Character) => void;
  onBroadcastLog?: (text: string) => void;
}

export const DimensionalInventoryView: React.FC<DimensionalInventoryViewProps> = ({
  activeCharacter,
  onSaveCharacter,
  onBroadcastLog
}) => {
  const [filterCat, setFilterCat] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);

  // New item form
  const [newItem, setNewItem] = useState<{
    name: string;
    description: string;
    category: 'arma' | 'armadura' | 'consumivel' | 'artefato' | 'material';
    quantity: number;
    energyAffinity: EnergyType;
  }>({
    name: '',
    description: '',
    category: 'arma',
    quantity: 1,
    energyAffinity: 'Mana'
  });

  if (!activeCharacter) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-base font-semibold text-slate-200">Nenhum Personagem Selecionado</h3>
        <p className="text-xs text-slate-400 mt-1">Selecione uma ficha para acessar o inventário dimensional.</p>
      </div>
    );
  }

  const invState = activeCharacter.dimensionalInventory;
  const items = activeCharacter.items || [];
  const equippedItems = items.filter((i) => i.isEquipped);
  const storedItems = items.filter((i) => !i.isEquipped);

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Hologram toggle: Opening costs 1 systemic energy per action while open
  const handleToggleInventory = () => {
    const nextOpen = !invState.isOpen;
    if (nextOpen && activeCharacter.energia.current <= 0) {
      alert('Energia insuficiente para materializar a tela dimensional (Custa 1 de Energia Sistêmica).');
      return;
    }

    const nextEnergy = nextOpen ? Math.max(0, activeCharacter.energia.current - 1) : activeCharacter.energia.current;

    const updated: Character = {
      ...activeCharacter,
      energia: { ...activeCharacter.energia, current: nextEnergy },
      dimensionalInventory: {
        ...invState,
        isOpen: nextOpen
      },
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: nextOpen ? 'Inventário Aberto' : 'Inventário Fechado',
          details: nextOpen
            ? 'Tela holográfica dimensional materializada. Consumiu 1 de Energia Sistêmica.'
            : 'Tela dimensional recolhida.'
        },
        ...activeCharacter.actionLog
      ]
    };

    onSaveCharacter(updated);
    if (onBroadcastLog) {
      onBroadcastLog(
        `${activeCharacter.name} ${nextOpen ? 'materializou' : 'recolheu'} o Inventário Dimensional holográfico.`
      );
    }
  };

  const handleOrientationToggle = () => {
    const nextOrientation = invState.orientation === 'horizontal' ? 'vertical' : 'horizontal';
    const updated: Character = {
      ...activeCharacter,
      dimensionalInventory: { ...invState, orientation: nextOrientation }
    };
    onSaveCharacter(updated);
  };

  const handleEnergySlotChange = (energy: EnergyType) => {
    const updated: Character = {
      ...activeCharacter,
      dimensionalInventory: { ...invState, slottedEnergy: energy }
    };
    onSaveCharacter(updated);
  };

  // Combat Hologram Use: Plataforma
  // Distance: 1 meter per 24 Intelligence
  const calcPlatformDistance = () => {
    const int = activeCharacter.attributes.inteligencia.value;
    return Math.floor(int / 24);
  };

  const handleUsePlataforma = () => {
    const dist = calcPlatformDistance();
    if (dist < 1) {
      alert(`Inteligência insuficiente (${activeCharacter.attributes.inteligencia.value}/24). Requer pelo menos 24 de Inteligência para projetar 1 metro.`);
      return;
    }
    const logText = `${activeCharacter.name} projetou a tela holográfica como Plataforma deitada a ${dist}m de altura para escalar/evitar ataques.`;
    const updated: Character = {
      ...activeCharacter,
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Holograma: Plataforma',
          details: logText
        },
        ...activeCharacter.actionLog
      ]
    };
    onSaveCharacter(updated);
    if (onBroadcastLog) onBroadcastLog(logText);
  };

  // Combat Hologram Use: Escudo
  // Area: 1.5m x 1m. Completely blocks energy combos inside area. 1x per turn limit.
  const handleUseEscudo = () => {
    const logText = `${activeCharacter.name} posicionou a tela como Escudo Dimensional (1,5m x 1,0m), bloqueando combo de energias! (1x/turno)`;
    const updated: Character = {
      ...activeCharacter,
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Holograma: Escudo',
          details: logText
        },
        ...activeCharacter.actionLog
      ]
    };
    onSaveCharacter(updated);
    if (onBroadcastLog) onBroadcastLog(logText);
  };

  // Combat Hologram Use: Teleporte
  // Touch with Force >= 18 allows free close and reopen; +1 repetition per 12 Vontade.
  const calcTeleportReps = () => {
    const f = activeCharacter.attributes.forca.value;
    const v = activeCharacter.attributes.vontade.value;
    if (f < 18) return 0;
    return 1 + Math.floor(v / 12);
  };

  const handleUseTeleporte = () => {
    const reps = calcTeleportReps();
    if (reps === 0) {
      alert(`Força insuficiente (${activeCharacter.attributes.forca.value}/18). Requer pelo menos 18 de Força para toque de teleporte dimensional.`);
      return;
    }
    const logText = `${activeCharacter.name} desferiu toque de força (${activeCharacter.attributes.forca.value}) no inventário, fechando e reabrindo sem custo! Repetições disponíveis: ${reps}.`;
    const updated: Character = {
      ...activeCharacter,
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Holograma: Teleporte',
          details: logText
        },
        ...activeCharacter.actionLog
      ]
    };
    onSaveCharacter(updated);
    if (onBroadcastLog) onBroadcastLog(logText);
  };

  const handleToggleEquip = (itemId: string) => {
    const updatedItems = items.map((i) => (i.id === itemId ? { ...i, isEquipped: !i.isEquipped } : i));
    const updated: Character = { ...activeCharacter, items: updatedItems };
    onSaveCharacter(updated);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter((i) => i.id !== itemId);
    const updated: Character = { ...activeCharacter, items: updatedItems };
    onSaveCharacter(updated);
    if (selectedItemId === itemId) setSelectedItemId(null);
  };

  const handleAddItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    const created: InventoryItem = {
      id: 'item_' + Date.now(),
      name: newItem.name.trim(),
      description: newItem.description.trim(),
      category: newItem.category,
      quantity: Math.max(1, newItem.quantity),
      energyAffinity: newItem.energyAffinity,
      isEquipped: false
    };

    const updated: Character = {
      ...activeCharacter,
      items: [...items, created]
    };
    onSaveCharacter(updated);
    setIsAddItemOpen(false);
    setNewItem({
      name: '',
      description: '',
      category: 'arma',
      quantity: 1,
      energyAffinity: 'Mana'
    });
  };

  const filteredItems = items.filter((i) => {
    if (filterCat !== 'all' && i.category !== filterCat) return false;
    if (searchQuery.trim() && !i.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header & Activation Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" /> Inventário Dimensional Holográfico
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Interface azul semitransparente com capacidade infinita e aplicações de combate (Plataforma, Escudo, Teleporte).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Energy Slot Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400">Energia Inserida:</span>
            <select
              value={invState.slottedEnergy || 'Mana'}
              onChange={(e) => handleEnergySlotChange(e.target.value as EnergyType)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-cyan-300 font-semibold text-xs"
            >
              <option value="Física">Física</option>
              <option value="Mana">Mana</option>
              <option value="Aura">Aura</option>
              <option value="Neutra">Neutra</option>
              <option value="Prana">Prana</option>
            </select>
          </div>

          {/* Toggle Screen Orientation */}
          <button
            onClick={handleOrientationToggle}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="capitalize">{invState.orientation}</span>
          </button>

          {/* Open/Close Hologram */}
          <button
            onClick={handleToggleInventory}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md ${
              invState.isOpen
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/30'
                : 'bg-slate-900 border border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/40'
            }`}
          >
            {invState.isOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{invState.isOpen ? 'Recolher Tela' : 'Materializar Tela (1 Energia)'}</span>
          </button>
        </div>
      </div>

      {/* Combat Hologram Uses Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Plataforma */}
        <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Plataforma Holográfica
            </span>
            <span className="text-[11px] font-mono text-cyan-400 font-semibold">
              {calcPlatformDistance()}m de altura
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Posiciona a tela deitada acima do usuário (1m a cada 24 Int). Permite escalar ou evitar investidas terrestres.
          </p>
          <button
            onClick={handleUsePlataforma}
            className="mt-3 w-full py-1.5 rounded-lg bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-600 text-cyan-200 text-xs font-semibold transition-colors"
          >
            Projetar Plataforma
          </button>
        </div>

        {/* Escudo */}
        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-400" /> Escudo Dimensional
            </span>
            <span className="text-[11px] font-mono text-blue-400 font-semibold">1,5m x 1,0m</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Protege completamente contra combos de energias dentro da área da tela. Limite: uma vez por turno.
          </p>
          <button
            onClick={handleUseEscudo}
            className="mt-3 w-full py-1.5 rounded-lg bg-blue-900/60 hover:bg-blue-800 border border-blue-600 text-blue-200 text-xs font-semibold transition-colors"
          >
            Erguer Escudo
          </button>
        </div>

        {/* Teleporte */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 shadow-md">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Toque de Teleporte
            </span>
            <span className="text-[11px] font-mono text-indigo-400 font-semibold">
              {calcTeleportReps()} Repetições
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Toque com Força &ge; 18 fecha e reabre sem custo de energia (+1 repetição a cada 12 Vontade).
          </p>
          <button
            onClick={handleUseTeleporte}
            className="mt-3 w-full py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-600 text-indigo-200 text-xs font-semibold transition-colors"
          >
            Executar Toque
          </button>
        </div>
      </div>

      {/* Hologram Screen UI (Semi-transparent Blue Grid Container) */}
      <div className={`rounded-2xl border transition-all duration-300 p-6 ${
        invState.isOpen
          ? 'bg-slate-950/80 border-cyan-500/50 shadow-2xl shadow-cyan-950/60 ring-1 ring-cyan-500/30'
          : 'bg-slate-950/40 border-slate-800 opacity-60'
      }`}>
        
        {/* Hologram Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${invState.isOpen ? 'bg-cyan-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-xs font-bold tracking-wider text-cyan-300 uppercase font-mono">
              Tela Dimensional {invState.orientation} · Capacidade Infinita
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar item..."
              className="bg-slate-900/90 border border-cyan-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-cyan-400"
            />
            <button
              onClick={() => setIsAddItemOpen(true)}
              className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Item
            </button>
          </div>
        </div>

        {/* Square Grid Inventory Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Item Grid (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-900/60 border border-cyan-900/40 rounded-lg text-xs overflow-x-auto">
              {['all', 'arma', 'armadura', 'consumivel', 'artefato', 'material'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className={`px-3 py-1 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                    filterCat === cat
                      ? 'bg-cyan-950 text-cyan-300 font-semibold border border-cyan-700/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Todos os Itens' : cat}
                </button>
              ))}
            </div>

            {/* Squares Grid: Authentic 5x4 or 6x4 slots */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 min-h-[300px] p-3 rounded-xl bg-slate-950/90 border border-cyan-500/20">
              {filteredItems.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`relative aspect-square rounded-xl border flex flex-col items-center justify-between p-2.5 transition-all text-center ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-lg shadow-cyan-950 ring-2 ring-cyan-400/40'
                        : item.isEquipped
                        ? 'bg-slate-900/90 border-emerald-500/60 hover:border-emerald-400'
                        : 'bg-slate-900/60 border-cyan-900/40 hover:border-cyan-500/60 hover:bg-slate-900'
                    }`}
                  >
                    {item.isEquipped && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                    )}

                    <div className="w-full flex justify-end">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold">x{item.quantity}</span>
                    </div>

                    <div className="font-semibold text-xs text-slate-100 line-clamp-2 leading-tight">
                      {item.name}
                    </div>

                    <div className="w-full text-[9px] text-slate-400 truncate capitalize">
                      {item.category}
                    </div>
                  </button>
                );
              })}

              {/* Empty placeholder squares showing infinite grid */}
              {Array.from({ length: Math.max(0, 18 - filteredItems.length) }).map((_, i) => (
                <div
                  key={'empty_' + i}
                  className="aspect-square rounded-xl border border-cyan-500/10 bg-slate-900/20 flex items-center justify-center text-slate-700 text-xs font-mono"
                >
                  +
                </div>
              ))}
            </div>
          </div>

          {/* Item Inspector Panel (4 Cols) */}
          <div className="lg:col-span-4">
            {selectedItem ? (
              <div className="p-5 rounded-xl bg-slate-900/90 border border-cyan-500/30 shadow-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-slate-100">{selectedItem.name}</h4>
                    <span className="text-xs text-cyan-400 font-medium capitalize">
                      {selectedItem.category} {selectedItem.energyAffinity ? `· Afinidade ${selectedItem.energyAffinity}` : ''}
                    </span>
                  </div>
                  {selectedItem.isEquipped && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800">
                      Equipado
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  {selectedItem.description || 'Nenhuma descrição informada.'}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Quantidade:</span>
                    <div className="text-slate-100 font-bold">{selectedItem.quantity}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500">Estado:</span>
                    <div className="text-slate-100 font-bold">{selectedItem.isEquipped ? 'Em uso' : 'Armazenado'}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => handleToggleEquip(selectedItem.id)}
                    className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                      selectedItem.isEquipped
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedItem.isEquipped ? 'Desequipar Item' : 'Equipar no Personagem'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteItem(selectedItem.id)}
                    className="w-full py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Descartar do Inventário
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl bg-slate-900/40 border border-cyan-500/10 text-xs text-slate-500">
                Selecione um espaço no inventário dimensional para inspecionar, equipar ou manusear.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold">Adicionar Item ao Inventário Dimensional</h3>

            <form onSubmit={handleAddItemSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Item</label>
                <input
                  type="text"
                  required
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Ex: Espada de Liga Estelar, Poção de Mana..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="arma">Arma</option>
                    <option value="armadura">Armadura</option>
                    <option value="consumivel">Consumível</option>
                    <option value="artefato">Artefato</option>
                    <option value="material">Material</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Afinidade de Energia</label>
                  <select
                    value={newItem.energyAffinity}
                    onChange={(e) => setNewItem({ ...newItem, energyAffinity: e.target.value as EnergyType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Física">Física</option>
                    <option value="Mana">Mana</option>
                    <option value="Aura">Aura</option>
                    <option value="Neutra">Neutra</option>
                    <option value="Prana">Prana</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Quantidade</label>
                <input
                  type="number"
                  min={1}
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição & Propriedades</label>
                <textarea
                  rows={2}
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Efeitos, bônus e histórico do item..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
                >
                  Armazenar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
