import React, { useState } from 'react';
import { Dices, Sparkles, X, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiceRollerProps {
  isOpen: boolean;
  onClose: () => void;
  onBroadcastResult?: (rollText: string) => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({ isOpen, onClose, onBroadcastResult }) => {
  const [history, setHistory] = useState<{ id: string; formula: string; result: number; rolls: number[]; date: string }[]>([]);
  const [customFormula, setCustomFormula] = useState('');
  const [lastRoll, setLastRoll] = useState<{ formula: string; result: number; rolls: number[]; isCrit?: boolean } | null>(null);

  if (!isOpen) return null;

  const rollDie = (sides: number, count: number = 1, mod: number = 0, label?: string) => {
    const rolls: number[] = [];
    let sum = 0;
    for (let i = 0; i < count; i++) {
      const val = Math.floor(Math.random() * sides) + 1;
      rolls.push(val);
      sum += val;
    }
    const total = sum + mod;
    const formulaStr = label || `${count}d${sides}${mod > 0 ? `+${mod}` : mod < 0 ? mod : ''}`;
    const isCrit = sides === 20 && rolls.includes(20);

    if (isCrit) {
      try {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      } catch (_) {}
    }

    const rollItem = {
      id: 'r_' + Date.now(),
      formula: formulaStr,
      result: total,
      rolls,
      date: new Date().toLocaleTimeString('pt-BR')
    };

    setLastRoll({ formula: formulaStr, result: total, rolls, isCrit });
    setHistory((prev) => [rollItem, ...prev.slice(0, 9)]);

    if (onBroadcastResult) {
      onBroadcastResult(`Rolou ${formulaStr}: [${rolls.join(', ')}] = ${total}`);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormula.trim()) return;

    // parse NdS+M or NdS-M
    const match = customFormula.trim().toLowerCase().match(/^(\d*)d(\d+)([\+\-]\d+)?$/);
    if (match) {
      const count = match[1] ? parseInt(match[1], 10) : 1;
      const sides = parseInt(match[2], 10);
      const mod = match[3] ? parseInt(match[3], 10) : 0;
      rollDie(sides, Math.min(20, Math.max(1, count)), mod, customFormula.trim());
    } else {
      // Just flat d20 with custom note
      rollDie(20, 1, 0, `d20 (${customFormula.trim()})`);
    }
    setCustomFormula('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-base text-slate-100">Bandeja de Dados do Sistema</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Result Box */}
        <div className="mt-4 p-4 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col items-center justify-center min-h-[110px]">
          {lastRoll ? (
            <>
              <div className="text-xs text-slate-400 font-mono mb-1">{lastRoll.formula}</div>
              <div className={`text-4xl font-extrabold tracking-tight tabular-nums ${lastRoll.isCrit ? 'text-amber-400 animate-bounce' : 'text-cyan-400'}`}>
                {lastRoll.result}
              </div>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Individuais: [{lastRoll.rolls.join(', ')}]
                {lastRoll.isCrit && <span className="ml-2 text-amber-400 font-semibold">Crítico!</span>}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-500 text-center">
              Selecione um dado abaixo ou digite uma fórmula para rolar
            </div>
          )}
        </div>

        {/* Fast Dice Presets */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: 'd6', sides: 6, count: 1 },
            { label: '2d6', sides: 6, count: 2 },
            { label: 'd10', sides: 10, count: 1 },
            { label: 'd10+10', sides: 10, count: 1, mod: 10, note: 'Grama Azul' },
            { label: 'd20', sides: 20, count: 1 },
            { label: 'd100', sides: 100, count: 1 },
            { label: '2d6°', sides: 6, count: 2, note: 'Mana/Espírito' },
            { label: '1d6°+6*', sides: 6, count: 1, mod: 6, note: 'Marcial' }
          ].map((d, i) => (
            <button
              key={i}
              onClick={() => rollDie(d.sides, d.count, d.mod || 0, d.label)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700/60 active:scale-95 transition-all text-xs font-medium"
            >
              <span className="font-mono text-cyan-300 font-semibold">{d.label}</span>
              {d.note && <span className="text-[10px] text-slate-400 truncate w-full text-center">{d.note}</span>}
            </button>
          ))}
        </div>

        {/* Custom formula input */}
        <form onSubmit={handleCustomSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            placeholder="Ex: 3d6+4, 1d20+5 ou Teste de Força"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
          >
            Rolar
          </button>
        </form>

        {/* History list */}
        {history.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span>Últimas rolagens</span>
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Limpar
              </button>
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-950/50 font-mono"
                >
                  <span className="text-slate-300">{h.formula}</span>
                  <span className="text-cyan-400 font-semibold tabular-nums">{h.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
