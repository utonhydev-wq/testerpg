import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Zap,
  Flame,
  Plus,
  Play,
  CheckCircle,
  Eye,
  Clock,
  Target,
  Shield,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Ability, Character, EnergyType, AbilityCategory, ActivationType } from '../../types';
import confetti from 'canvas-confetti';

interface GrimoireViewProps {
  abilities: Ability[];
  onSaveAbility: (ability: Ability) => void;
  activeCharacter?: Character;
  onRecordUsage: (
    abilityId: string,
    characterId: string,
    characterName: string,
    cost: number,
    result: string,
    isHiddenEffect: boolean,
    hiddenMultiplier: number
  ) => { updatedAbility: Ability; didLevelUp: boolean };
}

export const GrimoireView: React.FC<GrimoireViewProps> = ({
  abilities,
  onSaveAbility,
  activeCharacter,
  onRecordUsage
}) => {
  const [selectedAbilityId, setSelectedAbilityId] = useState<string>(
    abilities[0]?.id || 'grama_azul_prateada'
  );
  const [filterEnergy, setFilterEnergy] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState('');
  const [useHiddenEffect, setUseHiddenEffect] = useState(false);
  const [hiddenMultiplier, setHiddenMultiplier] = useState(2);
  const [isCreatingAbility, setIsCreatingAbility] = useState(false);

  // New ability form state
  const [newAbility, setNewAbility] = useState<Partial<Ability>>({
    name: '',
    description: '',
    energyType: 'Mana',
    category: 'Autoral',
    activationType: 'Ativação simples',
    currentLevel: 1,
    maxLevel: 6,
    energyCost: 10,
    requirements: '',
    applications: '',
    effects: '',
    duration: 'Instantânea',
    range: 'Toque',
    areaOfEffect: 'Único alvo',
    limitations: '',
    hiddenEffects: ''
  });

  const selectedAbility = abilities.find((a) => a.id === selectedAbilityId) || abilities[0];

  const getEnergyBadgeColor = (energy: EnergyType) => {
    switch (energy) {
      case 'Física':
        return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
      case 'Mana':
        return 'text-blue-400 border-blue-500/40 bg-blue-500/10';
      case 'Aura':
        return 'text-orange-400 border-orange-500/40 bg-orange-500/10';
      case 'Neutra':
        return 'text-slate-400 border-slate-500/40 bg-slate-500/10';
      case 'Prana':
      case 'Espiritual':
        return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10';
      default:
        return 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
    }
  };

  const handleExecuteAbility = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAbility || !activeCharacter) return;

    const res = onRecordUsage(
      selectedAbility.id,
      activeCharacter.id,
      activeCharacter.name,
      selectedAbility.energyCost,
      executionResult.trim() || 'Habilidade ativada com sucesso.',
      useHiddenEffect,
      hiddenMultiplier
    );

    if (res.didLevelUp) {
      try {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
      } catch (_) {}
    }

    setIsExecuting(false);
    setExecutionResult('');
  };

  const handleCreateAbilitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAbility.name?.trim()) return;

    const created: Ability = {
      id: 'ab_' + Date.now(),
      name: newAbility.name.trim(),
      description: newAbility.description?.trim() || '',
      energyType: newAbility.energyType || 'Mana',
      category: newAbility.category || 'Autoral',
      activationType: newAbility.activationType || 'Ativação simples',
      currentLevel: 1,
      maxLevel: 6,
      energyCost: Number(newAbility.energyCost) || 0,
      requirements: newAbility.requirements?.trim() || 'Nenhum',
      applications: newAbility.applications?.trim() || 'Nível 1 inicial',
      effects: newAbility.effects?.trim() || '',
      duration: newAbility.duration?.trim() || 'Instantânea',
      range: newAbility.range?.trim() || 'Curto',
      areaOfEffect: newAbility.areaOfEffect?.trim() || 'Individual',
      limitations: newAbility.limitations?.trim() || 'Nenhuma',
      hiddenEffects: newAbility.hiddenEffects?.trim() || '',
      usesCount: 0,
      usesToNextLevel: 6,
      history: []
    };

    onSaveAbility(created);
    setSelectedAbilityId(created.id);
    setIsCreatingAbility(false);
  };

  const filteredAbilities = abilities.filter((a) => {
    if (filterEnergy === 'all') return true;
    return a.energyType === filterEnergy;
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Grimório de Habilidades
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Módulo para registrar, executar e evoluir habilidades com contador de usos e poderes finais.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Energy Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
            {['all', 'Mana', 'Física', 'Aura', 'Neutra', 'Espiritual'].map((en) => (
              <button
                key={en}
                onClick={() => setFilterEnergy(en)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors whitespace-nowrap ${
                  filterEnergy === en
                    ? 'bg-slate-800 text-cyan-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {en === 'all' ? 'Todas' : en}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsCreatingAbility(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" /> Criar Habilidade
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Ability List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 mb-2 px-1">
            Habilidades Disponíveis ({filteredAbilities.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredAbilities.map((ab) => {
              const isSelected = ab.id === selectedAbility?.id;
              return (
                <button
                  key={ab.id}
                  onClick={() => setSelectedAbilityId(ab.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/80 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/20'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-100">{ab.name}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getEnergyBadgeColor(ab.energyType)}`}>
                      {ab.energyType}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Nível <strong className="text-slate-200">{ab.currentLevel}</strong>/{ab.maxLevel}</span>
                    <span className="font-mono text-cyan-400">{ab.energyCost} Energia</span>
                  </div>

                  <div className="mt-2.5">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1 font-mono">
                      <span>Progresso: {ab.usesCount}/{ab.usesToNextLevel || 0} usos</span>
                      <span>{ab.currentLevel >= 6 ? 'Poder Final' : 'Em Evolução'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-cyan-500 rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ((ab.usesCount || 0) / (ab.usesToNextLevel || 1)) * 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Ability Deep Details & Execution (8 Cols) */}
        {selectedAbility && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              
              {/* Header Info */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-bold text-slate-100">{selectedAbility.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getEnergyBadgeColor(selectedAbility.energyType)}`}>
                      {selectedAbility.energyType}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Categoria: <strong className="text-slate-300">{selectedAbility.category}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Ativação: <strong className="text-slate-300">{selectedAbility.activationType}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Custo: <strong className="text-cyan-400 font-mono">{selectedAbility.energyCost} Energia</strong></span>
                  </div>
                </div>

                {/* Level status pill & Execute CTA */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Nível Atual</div>
                    <div className="text-xl font-extrabold text-cyan-400 font-mono">
                      {selectedAbility.currentLevel} / {selectedAbility.maxLevel}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsExecuting(true)}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-md shadow-cyan-950 flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Executar Habilidade
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Descrição</h4>
                <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3.5 rounded-lg border border-slate-800/80">
                  {selectedAbility.description}
                </p>
              </div>

              {/* Grid of Applications, Range, Effects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                    <Target className="w-3.5 h-3.5 text-cyan-400" /> Aplicações & Efeitos
                  </span>
                  <div className="text-slate-200">{selectedAbility.effects}</div>
                  <div className="text-slate-400 mt-1">{selectedAbility.applications}</div>
                </div>

                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="font-semibold text-slate-400 flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Alcance & Duração
                  </span>
                  <div>Alcance: <strong className="text-slate-200">{selectedAbility.range}</strong></div>
                  <div>Área: <strong className="text-slate-200">{selectedAbility.areaOfEffect}</strong></div>
                  <div>Duração: <strong className="text-slate-200">{selectedAbility.duration}</strong></div>
                </div>
              </div>

              {/* Special rules banner: Level 3 passive/active conversion & Level 6 Final Power */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Regras Especiais do Sistema
                </div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>
                    A partir do <strong>Nível 3</strong>: Habilidades ativas podem ganhar uma versão passiva simplificada sem custo (e passivas ganham ativa com custo).
                  </li>
                  <li>
                    Contratos com custo &ge; 20 possuem exceção a essa regra.
                  </li>
                  <li>
                    No <strong>Nível 6</strong>: A habilidade alcança o <em>Poder Final</em>.
                  </li>
                </ul>
                {selectedAbility.hiddenEffects && (
                  <div className="mt-2 pt-2 border-t border-slate-800 text-rose-300">
                    <span className="font-semibold">Efeitos Ocultos Conhecidos:</span> {selectedAbility.hiddenEffects}
                  </div>
                )}
              </div>

              {/* Execution History */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Histórico de Utilização ({selectedAbility.history.length})
                </h4>
                {selectedAbility.history.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center bg-slate-950 rounded-lg border border-slate-800">
                    Nenhuma utilização registrada ainda nesta campanha.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {selectedAbility.history.map((h, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-semibold text-slate-200">{h.characterName}</span>
                          <span className="text-slate-400 ml-2">Nível {h.level}</span>
                          <span className="text-slate-500 ml-2 font-mono">{h.cost} Energia</span>
                          <div className="text-[11px] text-cyan-400 mt-0.5">{h.result}</div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(h.date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Execute Ability Modal */}
      {isExecuting && selectedAbility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-cyan-400 fill-current" /> Executar {selectedAbility.name}
            </h3>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div>Personagem: <strong className="text-slate-200">{activeCharacter?.name || 'Mestre/NPC'}</strong></div>
              <div>Custo de Energia: <strong className="text-cyan-400 font-mono">{selectedAbility.energyCost}</strong></div>
              <div>Progresso Atual: <strong className="text-slate-200 font-mono">{selectedAbility.usesCount}/{selectedAbility.usesToNextLevel} usos</strong></div>
            </div>

            {/* Hidden effect multiplier toggle */}
            <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useHiddenEffect}
                  onChange={(e) => setUseHiddenEffect(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                />
                <span>Utilizar Efeito Oculto (Vale mais usos na progressão)</span>
              </label>

              {useHiddenEffect && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pl-5">
                  <span>Multiplicador de Usos:</span>
                  <select
                    value={hiddenMultiplier}
                    onChange={(e) => setHiddenMultiplier(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                  >
                    <option value={2}>2x Usos (Padrão)</option>
                    <option value={3}>3x Usos</option>
                    <option value={4}>4x Usos</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resultado / Descrição da Ação
              </label>
              <textarea
                rows={2}
                value={executionResult}
                onChange={(e) => setExecutionResult(e.target.value)}
                placeholder="Ex: Brotos germinaram prendendo o adversário por 2 turnos."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsExecuting(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteAbility}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg shadow-sm"
              >
                Confirmar Execução
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Ability Modal */}
      {isCreatingAbility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold">Criar Nova Habilidade do Grimório</h3>

            <form onSubmit={handleCreateAbilitySubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Habilidade</label>
                <input
                  type="text"
                  required
                  value={newAbility.name}
                  onChange={(e) => setNewAbility({ ...newAbility, name: e.target.value })}
                  placeholder="Ex: Lança de Gelo Prismática, Prisão de Vinhas..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Energia</label>
                  <select
                    value={newAbility.energyType}
                    onChange={(e) => setNewAbility({ ...newAbility, energyType: e.target.value as EnergyType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Mana">Mana</option>
                    <option value="Física">Física</option>
                    <option value="Aura">Aura</option>
                    <option value="Neutra">Neutra</option>
                    <option value="Espiritual">Espiritual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Categoria</label>
                  <select
                    value={newAbility.category}
                    onChange={(e) => setNewAbility({ ...newAbility, category: e.target.value as AbilityCategory })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Autoral">Autoral (Criada pelo jogador)</option>
                    <option value="Recompensa">Recompensa (Drop de Dungeon)</option>
                    <option value="Requisito">Requisito (Condições secretas)</option>
                    <option value="Monstro">Monstro</option>
                    <option value="Personalizada">Personalizada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Modo de Ativação</label>
                  <select
                    value={newAbility.activationType}
                    onChange={(e) => setNewAbility({ ...newAbility, activationType: e.target.value as ActivationType })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="Ativação simples">Ativação simples</option>
                    <option value="Passiva">Passiva</option>
                    <option value="Passiva condicional">Passiva condicional</option>
                    <option value="Ativa personalizável">Ativa personalizável</option>
                    <option value="Ativa fixa ou de contrato">Ativa fixa ou de contrato</option>
                    <option value="Custo nulo adicional">Custo nulo adicional</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Custo de Energia</label>
                  <input
                    type="number"
                    min={0}
                    value={newAbility.energyCost}
                    onChange={(e) => setNewAbility({ ...newAbility, energyCost: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={newAbility.description}
                  onChange={(e) => setNewAbility({ ...newAbility, description: e.target.value })}
                  placeholder="Descrição sensorial, visual e mecânica da habilidade..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Efeitos Ocultos (Opcional)</label>
                <input
                  type="text"
                  value={newAbility.hiddenEffects}
                  onChange={(e) => setNewAbility({ ...newAbility, hiddenEffects: e.target.value })}
                  placeholder="Funções secretas para desvendar no nível 6..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingAbility(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
                >
                  Salvar no Grimório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
