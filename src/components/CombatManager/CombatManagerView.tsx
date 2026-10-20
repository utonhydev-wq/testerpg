import React, { useState } from 'react';
import {
  Swords,
  Shield,
  Zap,
  Activity,
  Brain,
  ChevronRight,
  Flame,
  AlertTriangle,
  Play,
  CheckCircle,
  RotateCcw,
  Plus,
  Users,
  Compass,
  Sparkles,
  Dices
} from 'lucide-react';
import { CombatEncounter, CombatParticipant, ActionCategory, UserProfile, Ability, InnateCapability } from '../../types';
import { INITIAL_SPECIAL_SYNERGIES } from '../../data/initialData';

interface CombatManagerViewProps {
  encounters: CombatEncounter[];
  activeEncounterId: string;
  onSaveEncounter: (encounter: CombatEncounter) => void;
  currentUser: UserProfile;
  abilities: Ability[];
  innates: InnateCapability[];
  onOpenDiceRoller: () => void;
}

export const CombatManagerView: React.FC<CombatManagerViewProps> = ({
  encounters,
  activeEncounterId,
  onSaveEncounter,
  currentUser,
  abilities,
  innates,
  onOpenDiceRoller
}) => {
  const encounter = encounters.find((e) => e.id === activeEncounterId) || encounters[0];
  const [selectedActionCat, setSelectedActionCat] = useState<ActionCategory>('corporal');
  const [actionDesc, setActionDesc] = useState('');
  const [synergyNotice, setSynergyNotice] = useState<string | null>(null);

  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  if (!encounter) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-base font-semibold text-slate-200">Nenhum Encontro de Combate Ativo</h3>
        <p className="text-xs text-slate-400 mt-1">O Mestre pode iniciar um encontro a qualquer momento.</p>
      </div>
    );
  }

  const activeParticipant = encounter.participants[encounter.activeTurnIndex] || encounter.participants[0];

  // Turn management
  const handleNextTurn = () => {
    let nextIndex = encounter.activeTurnIndex + 1;
    let nextRound = encounter.round;

    if (nextIndex >= encounter.participants.length) {
      nextIndex = 0;
      nextRound += 1;
    }

    // Reset turn actions for the participant coming up
    const updatedParticipants = encounter.participants.map((p, idx) => {
      if (idx === nextIndex) {
        return {
          ...p,
          actions: {
            corporal: { ...p.actions.corporal, used: 0 },
            mental: { ...p.actions.mental, used: 0 },
            classe: { ...p.actions.classe, used: 0 },
            reacao: { ...p.actions.reacao, used: 0 }
          }
        };
      }
      return p;
    });

    const nextCombatant = updatedParticipants[nextIndex];

    const updated: CombatEncounter = {
      ...encounter,
      round: nextRound,
      activeTurnIndex: nextIndex,
      participants: updatedParticipants,
      logs: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          round: nextRound,
          participantName: nextCombatant.name,
          actionCategory: 'classe',
          description: `Início do Turno #${nextRound} para ${nextCombatant.name}. Ações renovadas.`
        },
        ...encounter.logs
      ]
    };

    onSaveEncounter(updated);
  };

  // Consume action in category
  const handleConsumeAction = (category: ActionCategory, note: string) => {
    if (!activeParticipant) return;

    const currentUsed = activeParticipant.actions[category].used;
    const maxVal = activeParticipant.actions[category].max;

    if (currentUsed >= maxVal) {
      alert(`Todas as ações da categoria ${category} já foram consumidas neste turno.`);
      return;
    }

    const updatedParticipants = encounter.participants.map((p) => {
      if (p.id === activeParticipant.id) {
        return {
          ...p,
          actions: {
            ...p.actions,
            [category]: {
              ...p.actions[category],
              used: currentUsed + 1
            }
          }
        };
      }
      return p;
    });

    const updated: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      logs: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          round: encounter.round,
          participantName: activeParticipant.name,
          actionCategory: category,
          description: note || `Executou ação ${category}. (${currentUsed + 1}/${maxVal})`
        },
        ...encounter.logs
      ]
    };

    onSaveEncounter(updated);
    setActionDesc('');
  };

  // Register Reaction
  const handleRegisterReaction = (participantId: string, description: string) => {
    const participant = encounter.participants.find((p) => p.id === participantId);
    if (!participant) return;

    const updatedParticipants = encounter.participants.map((p) => {
      if (p.id === participantId) {
        return {
          ...p,
          actions: {
            ...p.actions,
            reacao: {
              ...p.actions.reacao,
              used: p.actions.reacao.used + 1
            }
          }
        };
      }
      return p;
    });

    const updated: CombatEncounter = {
      ...encounter,
      participants: updatedParticipants,
      logs: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          round: encounter.round,
          participantName: participant.name,
          actionCategory: 'reacao',
          description: `[REAÇÃO]: ${description || 'Registrou reação contra ação inimiga.'}`
        },
        ...encounter.logs
      ]
    };

    onSaveEncounter(updated);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Combat HUD */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold text-slate-100">{encounter.name}</h2>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Rodada <strong className="text-slate-200 font-mono">#{encounter.round}</strong> · Terreno:{' '}
            <strong className="text-cyan-400">{encounter.terrain}</strong>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenDiceRoller}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800"
          >
            <Dices className="w-3.5 h-3.5" /> Rolar Dados
          </button>

          {isMaster && (
            <button
              onClick={handleNextTurn}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-950 transition-all"
            >
              <span>Avançar Turno</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Terrain & Fator Externo Notice */}
      {encounter.terrainEffect && (
        <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-cyan-200">
              <strong>Fator Externo (Terreno):</strong> {encounter.terrainEffect}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono shrink-0">Recursos de Combate</span>
        </div>
      )}

      {/* Main Encounter Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Initiative Track (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-slate-400 px-1 flex items-center justify-between">
            <span>Ordem de Iniciativa</span>
            <span className="text-[10px] text-slate-500">Turno Ativo Destacado</span>
          </div>

          <div className="space-y-2">
            {encounter.participants.map((part, idx) => {
              const isActive = idx === encounter.activeTurnIndex;
              return (
                <div
                  key={part.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-900 border-rose-500/80 shadow-md ring-1 ring-rose-500/30'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
                        <span className="font-bold text-sm text-slate-100">{part.name}</span>
                        {!part.isPlayer && (
                          <span className="text-[9px] px-1 rounded bg-purple-950 text-purple-300 font-mono">
                            NPC/Mob
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-1">
                        Iniciativa: <strong>{part.initiative}</strong>
                      </div>
                    </div>

                    <div className="text-right text-xs font-mono">
                      <div className="text-rose-400 font-semibold">{part.currentHp}/{part.maxHp} HP</div>
                      <div className="text-cyan-400 text-[11px]">{part.currentEnergy}/{part.maxEnergy} Energia</div>
                    </div>
                  </div>

                  {/* Actions status overview */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-4 gap-1 text-[10px] text-center font-mono">
                    <div className={`p-1 rounded ${part.actions.corporal.used >= part.actions.corporal.max ? 'text-slate-600 bg-slate-900/50' : 'text-emerald-400 bg-emerald-950/40'}`}>
                      Corp: {part.actions.corporal.used}/{part.actions.corporal.max}
                    </div>
                    <div className={`p-1 rounded ${part.actions.mental.used >= part.actions.mental.max ? 'text-slate-600 bg-slate-900/50' : 'text-blue-400 bg-blue-950/40'}`}>
                      Ment: {part.actions.mental.used}/{part.actions.mental.max}
                    </div>
                    <div className={`p-1 rounded ${part.actions.classe.used >= part.actions.classe.max ? 'text-slate-600 bg-slate-900/50' : 'text-amber-400 bg-amber-950/40'}`}>
                      Clas: {part.actions.classe.used}/{part.actions.classe.max}
                    </div>
                    <div className={`p-1 rounded ${part.actions.reacao.used >= part.actions.reacao.max ? 'text-slate-600 bg-slate-900/50' : 'text-purple-400 bg-purple-950/40'}`}>
                      Reac: {part.actions.reacao.used}/{part.actions.reacao.max}
                    </div>
                  </div>

                  {/* Trigger reaction if not active */}
                  {!isActive && (
                    <button
                      onClick={() => handleRegisterReaction(part.id, 'Reação defensiva ou contra-ataque imediato')}
                      className="mt-2.5 w-full py-1 text-[11px] font-semibold text-purple-300 hover:text-purple-200 bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800/60 rounded-md transition-colors"
                    >
                      Registrar Reação
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Combatant Turn Actions Panel (8 Cols) */}
        {activeParticipant && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              
              {/* Active Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                    Turno em Andamento
                  </span>
                  <h3 className="text-2xl font-bold text-slate-100">{activeParticipant.name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-right">
                    <span className="text-slate-400">Vida: </span>
                    <strong className="text-rose-400">{activeParticipant.currentHp}/{activeParticipant.maxHp}</strong>
                    <span className="text-slate-400 ml-2">Energia: </span>
                    <strong className="text-cyan-400">{activeParticipant.currentEnergy}/{activeParticipant.maxEnergy}</strong>
                  </div>
                </div>
              </div>

              {/* Categorized Actions Tracker: Corporal, Mental, Classe, Reação */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 mb-2">
                  Categorias de Ações do Turno (Conforme o Manual Oficial)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  
                  {/* Ação Corporal */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-emerald-400 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" /> Ação Corporal
                      </span>
                      <span className="font-mono text-slate-100">
                        {activeParticipant.actions.corporal.used}/{activeParticipant.actions.corporal.max}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Golpes físicos, esquivas, saltos e deslocamento.</p>
                    <button
                      onClick={() => handleConsumeAction('corporal', 'Desferiu movimento ou ataque corporal')}
                      disabled={activeParticipant.actions.corporal.used >= activeParticipant.actions.corporal.max}
                      className="mt-3 w-full py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium"
                    >
                      Consumir
                    </button>
                  </div>

                  {/* Ação Mental */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-blue-400 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5" /> Ação Mental
                      </span>
                      <span className="font-mono text-slate-100">
                        {activeParticipant.actions.mental.used}/{activeParticipant.actions.mental.max}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Cálculo tático, percepção, feitiços e foco.</p>
                    <button
                      onClick={() => handleConsumeAction('mental', 'Executou cálculo ou ação mental')}
                      disabled={activeParticipant.actions.mental.used >= activeParticipant.actions.mental.max}
                      className="mt-3 w-full py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium"
                    >
                      Consumir
                    </button>
                  </div>

                  {/* Ação de Classe */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-amber-400 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Ação de Classe
                      </span>
                      <span className="font-mono text-slate-100">
                        {activeParticipant.actions.classe.used}/{activeParticipant.actions.classe.max}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Técnicas, feitiços, regras e capacidades inatas.</p>
                    <button
                      onClick={() => handleConsumeAction('classe', 'Desferiu capacidade de classe')}
                      disabled={activeParticipant.actions.classe.used >= activeParticipant.actions.classe.max}
                      className="mt-3 w-full py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium"
                    >
                      Consumir
                    </button>
                  </div>

                  {/* Reação */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center justify-between text-purple-400 font-semibold mb-1">
                      <span className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> Reação
                      </span>
                      <span className="font-mono text-slate-100">
                        {activeParticipant.actions.reacao.used}/{activeParticipant.actions.reacao.max}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">Preparar contra-ação no turno de aliados/inimigos.</p>
                    <button
                      onClick={() => handleConsumeAction('reacao', 'Preparou reação com recursos do turno')}
                      disabled={activeParticipant.actions.reacao.used >= activeParticipant.actions.reacao.max}
                      className="mt-3 w-full py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium"
                    >
                      Preparar
                    </button>
                  </div>
                </div>
              </div>

              {/* Special Synergies in Combat */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-cyan-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-cyan-400" /> Sinergia em Combate (Bônus Preservados com Notação Original)
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">3 Fatores Básicos</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-slate-900 border border-blue-900/60 text-blue-300">
                    Feiticeiro: <strong>2d6°</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-orange-900/60 text-orange-300">
                    Marcial: <strong>1d6° + 6*</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-red-900/60 text-red-300">
                    Guerreiro: <strong>12*</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-yellow-900/60 text-yellow-300">
                    Espírito: <strong>2d6° ou 12*</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-900 border border-slate-700 text-slate-300">
                    Entidade: <strong>18*</strong>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1">
                  *Os símbolos ° e * são mantidos intocados até que o mestre confirme a operação definitiva.
                </div>
              </div>

              {/* Custom Action Log Form */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Registrar Descrição da Ação
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedActionCat}
                    onChange={(e) => setSelectedActionCat(e.target.value as ActionCategory)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 capitalize"
                  >
                    <option value="corporal">Corporal</option>
                    <option value="mental">Mental</option>
                    <option value="classe">Classe</option>
                    <option value="reacao">Reação</option>
                  </select>
                  <input
                    type="text"
                    value={actionDesc}
                    onChange={(e) => setActionDesc(e.target.value)}
                    placeholder="Ex: Saltou atrás da coluna e disparou flecha de mana..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                  <button
                    onClick={() => handleConsumeAction(selectedActionCat, actionDesc)}
                    className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-lg shrink-0"
                  >
                    Registrar
                  </button>
                </div>
              </div>

              {/* Combat Event Logs */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Registro de Acontecimentos do Encontro ({encounter.logs.length})
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {encounter.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-start justify-between gap-3 font-mono"
                    >
                      <div>
                        <span className="text-rose-400 font-bold">R#{log.round}</span>
                        <span className="text-slate-300 font-semibold ml-2">{log.participantName}:</span>
                        <span className="text-slate-400 ml-1.5">{log.description}</span>
                      </div>
                      <span className="text-[10px] text-slate-600 shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
