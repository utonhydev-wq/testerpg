import React, { useState } from 'react';
import {
  Sliders,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  Edit2,
  Save,
  Download,
  RotateCcw,
  Cloud,
  FileCode,
  ShieldAlert,
  Server,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SystemRule, UserProfile, Campaign } from '../../types';
import { dbService } from '../../services/firebase';

interface MasterPanelProps {
  systemRules: SystemRule[];
  onSaveRule: (rule: SystemRule) => void;
  currentUser: UserProfile;
  campaign: Campaign;
  onResetDatabase: () => void;
}

export const MasterPanel: React.FC<MasterPanelProps> = ({
  systemRules,
  onSaveRule,
  currentUser,
  campaign,
  onResetDatabase
}) => {
  const [activeTab, setActiveTab] = useState<'regras' | 'vercel' | 'backup'>('regras');
  const [editingRule, setEditingRule] = useState<SystemRule | null>(null);

  // Form states for rule edit
  const [ruleFormula, setRuleFormula] = useState('');
  const [ruleStatus, setRuleStatus] = useState<'pendente' | 'validada' | 'desativada'>('pendente');
  const [ruleNote, setRuleNote] = useState('');

  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const handleStartEdit = (rule: SystemRule) => {
    setEditingRule(rule);
    setRuleFormula(rule.validatedFormula);
    setRuleStatus(rule.status);
    setRuleNote('');
  };

  const handleSaveRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule) return;

    const updated: SystemRule = {
      ...editingRule,
      validatedFormula: ruleFormula,
      status: ruleStatus,
      validatedBy: currentUser.displayName,
      updatedAt: new Date().toISOString(),
      versionHistory: [
        {
          date: new Date().toISOString(),
          editor: currentUser.displayName,
          previousFormula: editingRule.validatedFormula,
          note: ruleNote || `Alterou status para ${ruleStatus}`
        },
        ...editingRule.versionHistory
      ]
    };

    onSaveRule(updated);
    setEditingRule(null);
  };

  const handleExportDB = () => {
    const dataStr = dbService.exportDatabase();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rpg_system_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-400" /> Painel do Mestre — Regras do Sistema
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configuração de regras pendentes de interpretação, fórmulas autorais e guia de publicação na Vercel/Firebase.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs">
          {[
            { id: 'regras', label: '9 Regras do Sistema' },
            { id: 'vercel', label: 'Publicação na Vercel' },
            { id: 'backup', label: 'Backup & Banco' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-amber-300 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: System Rules (Regras do Sistema) */}
      {activeTab === 'regras' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-bold">Mecânica de Regras Pendentes:</strong> As regras autorais deste RPG foram preservadas sem presunção de fórmulas inventadas. O mestre pode analisar cada uma das 9 ambiguidades originais, ajustar a fórmula validada e definir seu estado (Pendente, Validada ou Desativada). Fórmulas pendentes não são executadas silenciosamente.
          </div>

          <div className="space-y-4">
            {systemRules.map((rule) => {
              const isPending = rule.status === 'pendente';
              const isValidated = rule.status === 'validada';

              return (
                <div
                  key={rule.id}
                  className={`p-5 rounded-xl border transition-all ${
                    isPending
                      ? 'bg-slate-900/90 border-amber-500/40 shadow-sm'
                      : isValidated
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{rule.name}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
                        {rule.originalDescription}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${
                          isPending
                            ? 'text-amber-400 bg-amber-950/80 border-amber-500/40'
                            : isValidated
                            ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/40'
                            : 'text-slate-400 bg-slate-900 border-slate-700'
                        }`}
                      >
                        {rule.status}
                      </span>

                      {isMaster && (
                        <button
                          onClick={() => handleStartEdit(rule)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Configurar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulas Display */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono">
                      <span className="text-[10px] text-slate-500 font-sans block mb-0.5">
                        Fórmula / Notação Original do Manual:
                      </span>
                      <span className="text-amber-300 font-bold">{rule.originalFormula}</span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono">
                      <span className="text-[10px] text-slate-500 font-sans block mb-0.5">
                        Fórmula Validada Pelo Mestre:
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {rule.validatedFormula || 'Aguardando validação do Mestre'}
                      </span>
                    </div>
                  </div>

                  {/* Audit / Version History */}
                  {rule.versionHistory.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>Última modificação por: <strong className="text-slate-400">{rule.validatedBy || 'Sistema'}</strong></span>
                      <span className="font-mono">{new Date(rule.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Vercel & Firebase Publication Guide */}
      {activeTab === 'vercel' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 text-xs text-slate-300 leading-relaxed">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Cloud className="w-5 h-5 text-cyan-400" /> Guia Completo de Publicação na Vercel e Firebase
            </h3>
            <p className="text-slate-400 mt-1">
              O projeto já inclui <code className="text-cyan-300 font-mono">firestore.rules</code>,{' '}
              <code className="text-cyan-300 font-mono">storage.rules</code>,{' '}
              <code className="text-cyan-300 font-mono">firestore.indexes.json</code> e suporte nativo a variáveis de ambiente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">1</span>
                Criar Projeto no Firebase Console
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-400">
                <li>Acesse o <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-cyan-400 underline">Firebase Console</a> e crie um novo projeto.</li>
                <li>Ative o <strong>Authentication</strong> (provedor Email/Senha e Anônimo se desejar).</li>
                <li>Ative o <strong>Cloud Firestore</strong> em modo de produção.</li>
                <li>Ative o <strong>Firebase Storage</strong> para upload de mapas e avatares.</li>
              </ol>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">2</span>
                Deploy de Regras de Segurança
              </div>
              <p className="text-slate-400">
                Execute no terminal com Firebase CLI ou cole o conteúdo de <code className="text-cyan-300 font-mono">firestore.rules</code> na aba de regras do Firestore:
              </p>
              <pre className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-cyan-300 border border-slate-800 overflow-x-auto">
                firebase deploy --only firestore:rules,storage
              </pre>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">3</span>
                Configurar Variáveis de Ambiente na Vercel
              </div>
              <p className="text-slate-400">
                Nas configurações do projeto na Vercel (<em>Settings &gt; Environment Variables</em>), adicione as credenciais obtidas no Firebase:
              </p>
              <ul className="list-disc list-inside space-y-0.5 font-mono text-slate-400 text-[11px]">
                <li>VITE_FIREBASE_API_KEY</li>
                <li>VITE_FIREBASE_AUTH_DOMAIN</li>
                <li>VITE_FIREBASE_PROJECT_ID</li>
                <li>VITE_FIREBASE_STORAGE_BUCKET</li>
                <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
                <li>VITE_FIREBASE_APP_ID</li>
              </ul>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="font-bold text-slate-100 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs">4</span>
                Build e Publicação
              </div>
              <p className="text-slate-400">
                A Vercel executará automaticamente <code className="text-cyan-300 font-mono">npm run build</code> que compila o bundle React + Vite para a pasta <code className="text-cyan-300 font-mono">dist/</code> com suporte a SPA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Backup & Database Management */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Download className="w-5 h-5 text-cyan-400" /> Exportação de Backup e Restauração
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Exporte todos os personagens, fichas, histórico de combate e regras configuradas em JSON para migração instantânea.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportDB}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> Baixar Backup Completo (.json)
            </button>

            {isMaster && (
              <button
                onClick={() => {
                  if (confirm('Tem certeza de que deseja restaurar as regras e fichas padrão originais do manual? Todas as fichas criadas serão reiniciadas.')) {
                    onResetDatabase();
                  }
                }}
                className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" /> Restaurar Banco Original do Manual
              </button>
            )}
          </div>
        </div>
      )}

      {/* Rule Edit Modal */}
      {editingRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-amber-400" /> Validar Regra: {editingRule.name}
            </h3>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
              <div className="text-slate-400">Notação / Expressão Original:</div>
              <div className="font-mono text-amber-300 font-bold">{editingRule.originalFormula}</div>
            </div>

            <form onSubmit={handleSaveRuleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Fórmula / Cálculo Validado pelo Mestre:
                </label>
                <input
                  type="text"
                  required
                  value={ruleFormula}
                  onChange={(e) => setRuleFormula(e.target.value)}
                  placeholder="Ex: Math.floor(forca / agilidade) + (nivel * 3)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 font-mono focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Estado da Regra:</label>
                <select
                  value={ruleStatus}
                  onChange={(e) => setRuleStatus(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                >
                  <option value="pendente">Pendente de Confirmação</option>
                  <option value="validada">Validada Oficialmente pelo Mestre</option>
                  <option value="desativada">Desativada na Campanha</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nota de Auditoria (Opcional):</label>
                <input
                  type="text"
                  value={ruleNote}
                  onChange={(e) => setRuleNote(e.target.value)}
                  placeholder="Ex: Definido que a divisão usa Math.floor..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRule(null)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg"
                >
                  Salvar Validação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
