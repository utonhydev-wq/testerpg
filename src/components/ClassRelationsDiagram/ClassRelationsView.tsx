import React, { useState } from 'react';
import {
  GitFork,
  Heart,
  ArrowRight,
  Shield,
  Zap,
  Sword,
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle,
  Settings
} from 'lucide-react';
import { RPGClass, ClassRelation, UserProfile } from '../../types';

interface ClassRelationsViewProps {
  classes: RPGClass[];
  relations: ClassRelation[];
  onSaveRelation: (rel: ClassRelation) => void;
  currentUser: UserProfile;
}

export const ClassRelationsView: React.FC<ClassRelationsViewProps> = ({
  classes,
  relations,
  onSaveRelation,
  currentUser
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('guerreiro');
  const [editingMechanicsRelId, setEditingMechanicsRelId] = useState<string | null>(null);
  const [customMechanicsText, setCustomMechanicsText] = useState('');

  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';
  const selectedClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Map of relations: each node pointing to 2 targets
  // Circular layout coordinates for a pentagon
  const nodePositions: Record<string, { x: number; y: number }> = {
    entidade: { x: 50, y: 15 },
    feiticeiro: { x: 80, y: 40 },
    marcial: { x: 70, y: 80 },
    guerreiro: { x: 30, y: 80 },
    espirito: { x: 20, y: 40 }
  };

  const handleSaveMechanics = (relId: string) => {
    const rel = relations.find((r) => r.id === relId);
    if (!rel) return;
    const updated: ClassRelation = {
      ...rel,
      configuredMechanics: customMechanicsText.trim() || 'Sem efeito mecânico definido'
    };
    onSaveRelation(updated);
    setEditingMechanicsRelId(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-cyan-400" /> Diagrama de Relações entre Classes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Relações direcionais oficiais com nós, corações coloridos e desbloqueios de atributos avançados.
          </p>
        </div>

        {/* Warning / Anti-Hypothesis Notice */}
        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 max-w-md">
          <div className="font-semibold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" /> Regra do Manual
          </div>
          <p className="text-[11px] text-amber-200/80 mt-0.5">
            As setas <strong>não</strong> representam fraqueza ou vantagem automática. Efeitos só são válidos se explicitamente confirmados pelo mestre.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive Visual Graph (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl flex flex-col justify-between min-h-[500px]">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">Pentagrama Direcional de Energias</span>
            <span>Clique num nó para inspecionar</span>
          </div>

          {/* SVG Diagram Canvas */}
          <div className="relative w-full h-[380px] my-4 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="rgba(148, 163, 184, 0.6)" />
                </marker>
              </defs>

              {/* Draw Directed Relation Arrows */}
              {relations.map((rel) => {
                const sourcePos = nodePositions[rel.sourceClassId];
                if (!sourcePos) return null;

                return rel.targetClassIds.map((targetId) => {
                  const targetPos = nodePositions[targetId];
                  if (!targetPos) return null;

                  const isHighlighted = selectedClassId === rel.sourceClassId;

                  return (
                    <line
                      key={`${rel.sourceClassId}->${targetId}`}
                      x1={sourcePos.x}
                      y1={sourcePos.y}
                      x2={targetPos.x}
                      y2={targetPos.y}
                      stroke={isHighlighted ? rel.heartColor : 'rgba(148, 163, 184, 0.25)'}
                      strokeWidth={isHighlighted ? '0.9' : '0.4'}
                      strokeDasharray={isHighlighted ? 'none' : '1, 1'}
                      markerEnd="url(#arrow)"
                    />
                  );
                });
              })}
            </svg>

            {/* Interactive HTML Node Buttons */}
            {classes.map((cls) => {
              const pos = nodePositions[cls.id];
              const isSelected = cls.id === selectedClassId;
              if (!pos) return null;

              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  className={`absolute p-3 rounded-2xl border transition-all flex flex-col items-center justify-center shadow-lg group ${
                    isSelected
                      ? 'bg-slate-950 scale-110 z-20 shadow-cyan-950 ring-2'
                      : 'bg-slate-950/80 hover:scale-105 z-10'
                  }`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: 'translate(-50%, -50%)',
                    borderColor: cls.color
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <Heart
                      className="w-4 h-4 fill-current transition-transform group-hover:scale-110"
                      style={{ color: cls.color }}
                    />
                    <span className="font-bold text-xs text-slate-100">{cls.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {cls.energy}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Relations Summary Table */}
          <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Conexões Registradas no Banco:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              {relations.map((rel) => {
                const src = classes.find((c) => c.id === rel.sourceClassId);
                const targets = rel.targetClassIds
                  .map((tid) => classes.find((c) => c.id === tid)?.name)
                  .join(' e ');

                return (
                  <div
                    key={rel.id}
                    onClick={() => setSelectedClassId(rel.sourceClassId)}
                    className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-slate-700 cursor-pointer flex items-center justify-between text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 fill-current" style={{ color: rel.heartColor }} />
                      <span className="font-semibold text-slate-200">{src?.name}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-slate-400">{targets}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Class Deep Inspector (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
          {selectedClass && (
            <>
              <div className="flex items-start justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: selectedClass.color }}
                    />
                    <h3 className="text-xl font-bold text-slate-100">{selectedClass.name}</h3>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Energia: <strong className="text-slate-200">{selectedClass.energy}</strong> · Afinidade: {selectedClass.affinity}
                  </div>
                </div>

                <span
                  style={{ borderColor: selectedClass.color, color: selectedClass.color }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold border bg-slate-950"
                >
                  {selectedClass.classCapability}
                </span>
              </div>

              {/* Basic Attributes */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-400 font-semibold">Atributos Básicos:</span>
                <div className="font-bold text-slate-200 mt-1 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    {selectedClass.basicAttributes[0]}
                  </span>
                  <span>e</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                    {selectedClass.basicAttributes[1]}
                  </span>
                </div>
              </div>

              {/* Rule Changes */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                <span className="text-slate-400 font-semibold">Mudanças de Regra:</span>
                <div className="text-slate-200">
                  Nível 1: <strong className="text-cyan-300">{selectedClass.level1RuleChange}</strong>
                </div>
                <div className="text-slate-200">
                  Nível 2: <strong className="text-cyan-300">{selectedClass.level2RuleChange}</strong>
                </div>
                <div className="text-slate-400">
                  Nível 3: {selectedClass.level3RuleChange || 'Pendente de validação pelo mestre'}
                </div>
              </div>

              {/* Advanced Attributes (Defensivo & Ofensivo) */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-400" /> Atributos Avançados (Nível 1)
                </span>
                <p className="text-[11px] text-slate-400">
                  Não são atributos básicos comuns. Concedem capacidades especiais mas não se aplicam a testes gerais onde proibido.
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                  <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/60 text-emerald-300">
                    <span className="text-[10px] text-emerald-400 block font-normal">🛡️ Defensivo:</span>
                    {selectedClass.advancedAttributes.defensive}
                  </div>
                  <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/60 text-rose-300">
                    <span className="text-[10px] text-rose-400 block font-normal">⚔️ Ofensivo:</span>
                    {selectedClass.advancedAttributes.offensive}
                  </div>
                </div>
              </div>

              {/* Configured Mechanics for Relations */}
              {isMaster && (
                <div className="pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Efeito Mecânico desta Relação:</span>
                    <button
                      onClick={() => {
                        const rel = relations.find((r) => r.sourceClassId === selectedClass.id);
                        if (rel) {
                          setEditingMechanicsRelId(rel.id);
                          setCustomMechanicsText(rel.configuredMechanics || '');
                        }
                      }}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Settings className="w-3 h-3" /> Configurar Efeito
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    {relations.find((r) => r.sourceClassId === selectedClass.id)?.configuredMechanics ||
                      'Pendente de definição pelo Mestre.'}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Mechanics Modal */}
      {editingMechanicsRelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold">Configurar Efeito Mecânico da Relação</h3>
            <p className="text-xs text-slate-400">
              Defina se esta relação concede bônus, ressonância, penalidade ou condição especial na campanha.
            </p>

            <textarea
              rows={3}
              value={customMechanicsText}
              onChange={(e) => setCustomMechanicsText(e.target.value)}
              placeholder="Ex: Permite transferir 2 pontos de energia para o aliado alvo por turno..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingMechanicsRelId(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleSaveMechanics(editingMechanicsRelId)}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg"
              >
                Salvar Efeito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
