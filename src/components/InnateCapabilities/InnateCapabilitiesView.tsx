import React, { useState } from 'react';
import {
  Zap,
  Compass,
  AlertTriangle,
  Play,
  Settings,
  CheckCircle,
  HelpCircle,
  Shield,
  Clock,
  Gauge,
  Plus
} from 'lucide-react';
import { InnateCapability, Character, UserProfile } from '../../types';

interface InnateCapabilitiesViewProps {
  innates: InnateCapability[];
  onSaveInnate: (innate: InnateCapability) => void;
  activeCharacter?: Character;
  currentUser: UserProfile;
}

export const InnateCapabilitiesView: React.FC<InnateCapabilitiesViewProps> = ({
  innates,
  onSaveInnate,
  activeCharacter,
  currentUser
}) => {
  const [selectedInnateId, setSelectedInnateId] = useState<string>(innates[0]?.id || '');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [isEditingFormula, setIsEditingFormula] = useState(false);
  const [executionResult, setExecutionResult] = useState('');

  // Formula validation editor
  const [selectedOp, setSelectedOp] = useState<'divisao' | 'media' | 'menor' | 'soma'>('divisao');
  const [roundingRule, setRoundingRule] = useState<'floor' | 'round' | 'ceil'>('floor');

  const selectedInnate = innates.find((i) => i.id === selectedInnateId) || innates[0];
  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const filteredInnates = innates.filter((i) => {
    if (filterClass === 'all') return true;
    return i.classId === filterClass;
  });

  const getPathOptionsForLevel = (level: number) => {
    if (level === 1 || level === 2) return [1, 2];
    return [1, 2, 3, 4, 5];
  };

  // Safe formula cost preview
  const calculateCostPreview = (innate: InnateCapability) => {
    if (!activeCharacter) return 'Indisponível sem personagem ativo';
    if (!innate.isFormulaValidated) {
      return `Original: ${innate.costOriginalFormula} (Requer validação do mestre)`;
    }

    const { forca, agilidade, inteligencia, vontade } = activeCharacter.attributes;
    const f = forca.value;
    const a = agilidade.value;
    const i = inteligencia.value;
    const v = vontade.value;

    let base = 0;
    if (innate.classId === 'guerreiro') {
      base = selectedOp === 'divisao' ? f / Math.max(1, a) : (f + a) / 2;
    } else if (innate.classId === 'marcial') {
      base = selectedOp === 'divisao' ? v / Math.max(1, a) : (v + a) / 2;
    } else if (innate.classId === 'feiticeiro') {
      base = selectedOp === 'divisao' ? i / Math.max(1, v) : (i + v) / 2;
    } else if (innate.classId === 'espirito') {
      base = selectedOp === 'divisao' ? i / Math.max(1, f) : (i + f) / 2;
    } else if (innate.classId === 'entidade') {
      base = selectedOp === 'divisao' ? f / Math.max(1, v) : (f + v) / 2;
    }

    const rounded = roundingRule === 'floor' ? Math.floor(base) : Math.round(base);
    return `${rounded} + ${innate.level}d6 Energia`;
  };

  const handleValidateFormula = () => {
    if (!selectedInnate) return;
    const updated: InnateCapability = {
      ...selectedInnate,
      isFormulaValidated: true,
      costValidatedFormula: `Operação: ${selectedOp}, Arredondamento: ${roundingRule} + (${selectedInnate.level}d6)`
    };
    onSaveInnate(updated);
    setIsEditingFormula(false);
  };

  const handleExecuteInnate = () => {
    if (!selectedInnate || !activeCharacter) return;
    if (!selectedInnate.isFormulaValidated) {
      alert('Esta fórmula de custo ainda está pendente de interpretação pelo Mestre da Campanha. Não é permitida a execução silenciosa de fórmulas ambíguas.');
      return;
    }

    const updated: InnateCapability = {
      ...selectedInnate,
      executionHistory: [
        {
          date: new Date().toISOString(),
          characterId: activeCharacter.id,
          characterName: activeCharacter.name,
          result: executionResult.trim() || 'Capacidade inata desferida com sucesso.'
        },
        ...selectedInnate.executionHistory
      ]
    };

    onSaveInnate(updated);
    setIsExecuting(false);
    setExecutionResult('');
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" /> Capacidades Inatas das Classes
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Feitos obtidos pelo controle avançado de energia da classe. Distintas das habilidades comuns do Grimório.
          </p>
        </div>

        {/* Filter by class */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs overflow-x-auto">
          {['all', 'guerreiro', 'feiticeiro', 'marcial', 'entidade', 'espirito'].map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-1 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                filterClass === cls
                  ? 'bg-slate-800 text-amber-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cls === 'all' ? 'Todas as Classes' : cls}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Innates List (4 Cols) */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-semibold text-slate-400 mb-2 px-1">
            Capacidades Registradas ({filteredInnates.length})
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredInnates.map((inn) => {
              const isSelected = inn.id === selectedInnate?.id;
              return (
                <button
                  key={inn.id}
                  onClick={() => setSelectedInnateId(inn.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-amber-500/80 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/20'
                      : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-100">{inn.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30 text-amber-300 bg-amber-500/10">
                      {inn.className}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Caminho {inn.path} · Nível {inn.level}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      inn.isFormulaValidated ? 'text-emerald-400 bg-emerald-950/60' : 'text-amber-400 bg-amber-950/60'
                    }`}>
                      {inn.isFormulaValidated ? 'Fórmula Validada' : 'Fórmula Pendente'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Innate Details & Formula Config (8 Cols) */}
        {selectedInnate && (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
              
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-2xl font-bold text-slate-100">{selectedInnate.name}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                    <span>Classe: <strong className="text-amber-400">{selectedInnate.className}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Energia: <strong className="text-slate-200">{selectedInnate.energy}</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Caminho {selectedInnate.path} (Nível {selectedInnate.level})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isMaster && (
                    <button
                      onClick={() => setIsEditingFormula(true)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" /> Configurar Fórmula
                    </button>
                  )}

                  <button
                    onClick={() => setIsExecuting(true)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold rounded-lg shadow-md shadow-amber-950 flex items-center gap-1.5 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Desferir Inata
                  </button>
                </div>
              </div>

              {/* Formula & Cost Block */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">Fórmula de Custo Original do Manual:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedInnate.isFormulaValidated ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800' : 'text-amber-400 bg-amber-950/80 border border-amber-800'
                  }`}>
                    {selectedInnate.isFormulaValidated ? 'Validada pelo Mestre' : 'Pendente de Interpretação'}
                  </span>
                </div>

                <div className="font-mono text-base font-bold text-amber-300">
                  {selectedInnate.costOriginalFormula}
                </div>

                <div className="text-xs text-slate-400 pt-1 border-t border-slate-900">
                  Custo Projetado: <strong className="text-slate-200">{calculateCostPreview(selectedInnate)}</strong>
                </div>
              </div>

              {/* Special Effect & Negative Condition */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Efeito Especial</h4>
                  <p className="text-sm text-slate-200">{selectedInnate.specialEffect}</p>
                </div>

                {selectedInnate.negativeCondition && (
                  <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/60 text-xs">
                    <span className="font-semibold text-rose-400 flex items-center gap-1.5 mb-0.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Condição Negativa
                    </span>
                    <p className="text-rose-200/90">{selectedInnate.negativeCondition}</p>
                  </div>
                )}
              </div>

              {/* Step-by-Step Description */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-1">Descrição Passo a Passo</h4>
                <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-line">
                  {selectedInnate.stepByStepDescription}
                </div>
              </div>

              {/* Fixed & Variable Parameters */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">Parâmetros de Desempenho</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.entries(selectedInnate.parameters).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-500 capitalize">{key}:</span>
                      <div className="font-semibold text-slate-200 mt-0.5">{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Execution History */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 mb-2">
                  Histórico de Execução ({selectedInnate.executionHistory.length})
                </h4>
                {selectedInnate.executionHistory.length === 0 ? (
                  <div className="text-xs text-slate-500 py-3 text-center bg-slate-950 rounded-lg border border-slate-800">
                    Nenhum feito executado ainda nesta campanha.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {selectedInnate.executionHistory.map((h, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs flex items-center justify-between"
                      >
                        <span className="text-slate-300 font-semibold">{h.characterName}: {h.result}</span>
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

      {/* Formula Config Modal (Master Only) */}
      {isEditingFormula && selectedInnate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" /> Validação da Fórmula de Custo
            </h3>
            <p className="text-xs text-slate-400">
              A fórmula original <strong className="text-amber-300 font-mono">{selectedInnate.costOriginalFormula}</strong> possui uma barra entre atributos. Como Mestre, defina a interpretação matemática definitiva:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Operação Matemática da Barra (/):</label>
                <select
                  value={selectedOp}
                  onChange={(e) => setSelectedOp(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="divisao">Divisão Pura (Atributo 1 / Atributo 2)</option>
                  <option value="media">Média dos Atributos (Atributo 1 + Atributo 2) / 2</option>
                  <option value="menor">Menor Valor entre os dois Atributos</option>
                  <option value="soma">Soma Ponderada</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Regra de Arredondamento:</label>
                <select
                  value={roundingRule}
                  onChange={(e) => setRoundingRule(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="floor">Arredondar para baixo (Floor)</option>
                  <option value="round">Arredondar para o mais próximo (Round)</option>
                  <option value="ceil">Arredondar para cima (Ceil)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsEditingFormula(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleValidateFormula}
                className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg"
              >
                Salvar Fórmula Validada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Execute Innate Modal */}
      {isExecuting && selectedInnate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Play className="w-4 h-4 text-amber-400 fill-current" /> Desferir {selectedInnate.name}
            </h3>

            {!selectedInnate.isFormulaValidated ? (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong>Fórmula não validada!</strong> O manual proíbe que fórmulas com interpretação pendente executem silenciosamente. Solicite ao Mestre que confirme a fórmula primeiro.
                </div>
              </div>
            ) : (
              <>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1">
                  <div>Personagem: <strong className="text-slate-200">{activeCharacter?.name}</strong></div>
                  <div>Custo: <strong className="text-amber-400 font-mono">{calculateCostPreview(selectedInnate)}</strong></div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Relato do Feito / Alvo
                  </label>
                  <textarea
                    rows={2}
                    value={executionResult}
                    onChange={(e) => setExecutionResult(e.target.value)}
                    placeholder="Descreva o impacto, pressão gerada ou resultado..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-hidden"
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setIsExecuting(false)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg"
              >
                Fechar
              </button>
              {selectedInnate.isFormulaValidated && (
                <button
                  onClick={handleExecuteInnate}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg"
                >
                  Confirmar Ação
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
