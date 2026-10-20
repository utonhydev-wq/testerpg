import React from 'react';
import {
  Shield,
  Heart,
  Zap,
  Swords,
  Box,
  MapPin,
  Dices,
  Plus,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Download,
  CheckCircle,
  Apple,
  Droplets,
  Moon,
  Clock,
  User
} from 'lucide-react';
import { Character, Campaign, UserProfile, RPGClass } from '../../types';

interface PlayerDashboardViewProps {
  characters: Character[];
  activeCharacter?: Character;
  activeCampaign: Campaign;
  currentUser: UserProfile;
  classes: RPGClass[];
  onSelectCharacter: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onOpenDiceRoller: () => void;
  onOpenInstallModal: () => void;
  onCreateNewCharacter: () => void;
}

export const PlayerDashboardView: React.FC<PlayerDashboardViewProps> = ({
  characters,
  activeCharacter,
  activeCampaign,
  currentUser,
  classes,
  onSelectCharacter,
  onNavigateTab,
  onOpenDiceRoller,
  onOpenInstallModal,
  onCreateNewCharacter
}) => {
  const userCharacters = characters.filter((c) =>
    currentUser.role === 'admin' || currentUser.role === 'master' ? true : c.userId === currentUser.uid
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Welcome Banner & Campaign Status */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Campanha Ativa: {activeCampaign.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
              Olá, {currentUser.displayName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Painel central do jogador. Acompanhe a condição física e energética da sua ficha, execute rolagens rápidas e acesse o mapa e o combate da sessão.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenDiceRoller}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Dices className="w-4 h-4 text-cyan-400" />
              <span>Bandeja de Dados</span>
            </button>

            <button
              onClick={onOpenInstallModal}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Instalar App</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Character Overview (Left) + Quick Actions & Switcher (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Character Primary Card (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Personagem em Ação
            </h2>
            <button
              onClick={() => onNavigateTab('fichas')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 min-h-[44px] py-1 px-2"
            >
              Ver Ficha Completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeCharacter ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              
              {/* Character Identity */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-400/30 flex items-center justify-center text-white font-extrabold text-base shadow-md shrink-0">
                    {activeCharacter.name ? activeCharacter.name.charAt(0).toUpperCase() : '?'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 leading-snug">
                      {activeCharacter.name || 'Personagem Sem Nome'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="capitalize text-slate-300 font-medium">
                        {activeCharacter.archetype.replace('_', ' ')}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {activeCharacter.titles.length > 0 ? activeCharacter.titles.join(', ') : 'Sem títulos registrados'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acquired classes badges */}
                <div className="flex flex-wrap gap-1 justify-end">
                  {activeCharacter.acquiredClasses.length > 0 ? (
                    activeCharacter.acquiredClasses.map((ac) => {
                      const cl = classes.find((c) => c.id === ac.classId);
                      return (
                        <span
                          key={ac.classId}
                          style={{ borderColor: cl?.color || '#38bdf8', color: cl?.color || '#38bdf8' }}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-950 border"
                        >
                          {cl?.name} Nv. {ac.level}
                        </span>
                      );
                    })
                  ) : (
                    <span className="text-[11px] text-slate-500 italic px-2 py-1 bg-slate-950 rounded-lg border border-slate-800">
                      Nenhuma classe adquirida
                    </span>
                  )}
                </div>
              </div>

              {/* Health & Energy Status Meters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Health Bar */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                      Vida (HP)
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-100 tabular-nums">
                      {activeCharacter.hp.current} / {activeCharacter.hp.max}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (activeCharacter.hp.current / activeCharacter.hp.max) * 100)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono">
                    Perda &gt;8 dano gera penalidade · &lt;6 HP ativa passiva
                  </div>
                </div>

                {/* Energy Bar with Tripartite Components */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-cyan-500/20 text-cyan-400" />
                      Energia (Estamina & Mana)
                    </span>
                    <span className="font-mono text-sm font-bold text-slate-100 tabular-nums">
                      {activeCharacter.energia.current} / {activeCharacter.energia.max}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (activeCharacter.energia.current / activeCharacter.energia.max) * 100)}%` }}
                    />
                  </div>

                  {/* Tripartite status: Fome, Sede, Sono */}
                  <div className="mt-2 pt-2 border-t border-slate-900 grid grid-cols-3 gap-1 text-[10px] font-mono text-center">
                    <span className="text-amber-400">Fome {activeCharacter.energia.fome}</span>
                    <span className="text-blue-400">Sede {activeCharacter.energia.sede}</span>
                    <span className="text-purple-400">Sono {activeCharacter.energia.sono}</span>
                  </div>
                </div>
              </div>

              {/* Attributes Mini-Pills */}
              <div>
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Atributos-Base &amp; Marcos &#123;0/600&#125;
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { label: 'Inteligência', val: activeCharacter.attributes.inteligencia.value, prog: activeCharacter.attributes.inteligencia.progression, color: 'text-blue-400' },
                    { label: 'Força', val: activeCharacter.attributes.forca.value, prog: activeCharacter.attributes.forca.progression, color: 'text-rose-400' },
                    { label: 'Vontade', val: activeCharacter.attributes.vontade.value, prog: activeCharacter.attributes.vontade.progression, color: 'text-amber-400' },
                    { label: 'Agilidade', val: activeCharacter.attributes.agilidade.value, prog: activeCharacter.attributes.agilidade.progression, color: 'text-emerald-400' }
                  ].map((attr) => (
                    <div
                      key={attr.label}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-center"
                    >
                      <div className="text-[11px] text-slate-400 truncate">{attr.label}</div>
                      <div className={`text-xl font-bold font-mono ${attr.color} tabular-nums mt-0.5`}>
                        {attr.val}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{attr.prog}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Conditions Notification (if any) */}
              {activeCharacter.conditions.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/50 text-xs space-y-1.5">
                  <div className="font-semibold text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Condições Ativas em Combate ({activeCharacter.conditions.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCharacter.conditions.map((cond) => (
                      <span
                        key={cond.id}
                        className="px-2.5 py-1 rounded-md bg-rose-900/40 text-rose-200 border border-rose-800 text-[11px]"
                      >
                        {cond.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => onNavigateTab('fichas')}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Editar Ficha</span>
                </button>
                <button
                  onClick={() => onNavigateTab('inventario')}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                  <span>Inventário</span>
                </button>
                <button
                  onClick={() => onNavigateTab('combate')}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                  <span>Combate</span>
                </button>
                <button
                  onClick={() => onNavigateTab('mapa')}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mapa Tático</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <User className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="font-bold text-base text-slate-200">Você ainda não possui personagens nesta campanha</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Crie um personagem novo completamente zerado escolhendo um dos 3 modelos oficiais (Humano, Humano Superior ou Transcendente).
              </p>
              <button
                onClick={onCreateNewCharacter}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Criar Primeiro Personagem
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Character List & Quick Actions (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Character Switcher Panel */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">Meus Personagens ({userCharacters.length})</h3>
              </div>
              <button
                onClick={onCreateNewCharacter}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Novo
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {userCharacters.map((char) => {
                const isSelected = char.id === activeCharacter?.id;
                return (
                  <button
                    key={char.id}
                    onClick={() => onSelectCharacter(char.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between min-h-[48px] ${
                      isSelected
                        ? 'bg-cyan-950/50 border-cyan-500/80 text-cyan-200 shadow-xs ring-1 ring-cyan-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-100 flex items-center gap-1.5">
                        {char.name || 'Sem Nome'}
                        {isSelected && <span className="text-[10px] text-cyan-400 font-mono">✓ Ativo</span>}
                      </div>
                      <div className="text-[10px] text-slate-500 capitalize">
                        {char.archetype.replace('_', ' ')} · {char.hp.current}/{char.hp.max} HP
                      </div>
                    </div>

                    <div className="font-mono text-xs text-right text-slate-400">
                      <div>{char.hp.current} HP</div>
                      <div className="text-[10px] text-cyan-500">{char.energia.current} ENG</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            <button
              onClick={() => onNavigateTab('grimorio')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group min-h-[80px]"
            >
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                <BookOpen className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Grimório
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Habilidades autorais, recompensas e contadores de uso.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('inatas')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group min-h-[80px]"
            >
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Capacidades Inatas
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Feitos de classe, caminhos por nível e fórmulas de custo.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('classes')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group min-h-[80px]"
            >
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs mb-1">
                <Swords className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Relações & Classes
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Diagrama das 5 energias com corações e atributos avançados.
              </p>
            </button>

            <button
              onClick={() => onNavigateTab('catalogo')}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-left transition-all group min-h-[80px]"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Catálogo Sistêmico
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">
                Consulta aos 36 elementos primordiais e centro sistêmico.
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
