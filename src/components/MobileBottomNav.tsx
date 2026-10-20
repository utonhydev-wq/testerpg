import React, { useState } from 'react';
import {
  Home,
  Shield,
  Swords,
  Box,
  MapPin,
  Menu,
  X,
  BookOpen,
  Zap,
  GitFork,
  Library,
  Sliders,
  Dices,
  Download,
  Users
} from 'lucide-react';
import { UserProfile } from '../types';

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenDiceRoller: () => void;
  onOpenInstallModal: () => void;
  currentUser: UserProfile;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenDiceRoller,
  onOpenInstallModal,
  currentUser
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const primaryMobileTabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'fichas', label: 'Ficha', icon: Shield },
    { id: 'combate', label: 'Combate', icon: Swords },
    { id: 'inventario', label: 'Inventário', icon: Box },
    { id: 'mapa', label: 'Mapa', icon: MapPin }
  ];

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Bottom Sheet for 'Mais Opções' */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex flex-col justify-end lg:hidden animate-in fade-in duration-150"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="w-full bg-slate-900 border-t border-slate-800 rounded-t-3xl p-5 space-y-4 max-h-[80vh] overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="font-bold text-sm text-slate-100">Mais Opções do Sistema</div>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => handleSelectTab('grimorio')}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200 hover:border-slate-700 min-h-[48px]"
              >
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-semibold">Grimório</span>
              </button>

              <button
                onClick={() => handleSelectTab('inatas')}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200 hover:border-slate-700 min-h-[48px]"
              >
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-semibold">Inatas</span>
              </button>

              <button
                onClick={() => handleSelectTab('classes')}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200 hover:border-slate-700 min-h-[48px]"
              >
                <GitFork className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">Relações</span>
              </button>

              <button
                onClick={() => handleSelectTab('catalogo')}
                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200 hover:border-slate-700 min-h-[48px]"
              >
                <Library className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">Catálogo</span>
              </button>

              {isMaster && (
                <button
                  onClick={() => handleSelectTab('regras')}
                  className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-center gap-2.5 text-left text-amber-300 hover:border-amber-500 min-h-[48px] col-span-2"
                >
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-semibold">Painel do Mestre &amp; Regras</span>
                </button>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
              <button
                onClick={() => {
                  onOpenDiceRoller();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2"
              >
                <Dices className="w-4 h-4 text-cyan-400" />
                <span>Bandeja de Dados</span>
              </button>

              <button
                onClick={() => {
                  onOpenInstallModal();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Instalar Aplicativo (PWA)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Sticky Mobile Bottom Bar */}
      <nav
        aria-label="Navegação Principal Mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-lg lg:hidden px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {primaryMobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-cyan-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400 scale-110' : 'text-slate-400'} transition-transform`} />
                <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className="flex flex-col items-center justify-center min-h-[48px] min-w-[56px] px-2 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
            aria-label="Mais opções"
          >
            <Menu className="w-5 h-5 text-slate-400" />
            <span className="text-[10px] tracking-tight mt-0.5">Mais</span>
          </button>
        </div>
      </nav>
    </>
  );
};
