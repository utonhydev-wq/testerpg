import React, { useState } from 'react';
import {
  Home,
  Shield,
  BookOpen,
  Zap,
  Swords,
  Box,
  MapPin,
  GitFork,
  Library,
  Sliders,
  Dices,
  ChevronDown,
  Download,
  Plus,
  Users
} from 'lucide-react';
import { UserProfile, Campaign } from '../types';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onSwitchUser: (userId: string) => void;
  campaigns: Campaign[];
  activeCampaignId: string;
  onSelectCampaign: (id: string) => void;
  onCreateCampaign: () => void;
  onOpenDiceRoller: () => void;
  onOpenInstallModal: () => void;
  isCloudConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  allUsers,
  onSwitchUser,
  campaigns,
  activeCampaignId,
  onSelectCampaign,
  onCreateCampaign,
  onOpenDiceRoller,
  onOpenInstallModal,
  isCloudConnected
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];
  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  const desktopTabs = [
    { id: 'inicio', label: 'Início', icon: Home },
    { id: 'fichas', label: 'Fichas', icon: Shield },
    { id: 'combate', label: 'Combate', icon: Swords },
    { id: 'inventario', label: 'Inventário', icon: Box },
    { id: 'mapa', label: 'Mapa', icon: MapPin },
    { id: 'grimorio', label: 'Grimório', icon: BookOpen },
    { id: 'inatas', label: 'Inatas', icon: Zap },
    { id: 'classes', label: 'Relações', icon: GitFork },
    { id: 'catalogo', label: 'Catálogo', icon: Library }
  ];

  if (isMaster) {
    desktopTabs.push({ id: 'regras', label: 'Regras do Mestre', icon: Sliders });
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador Geral';
      case 'master':
        return 'Mestre da Campanha';
      default:
        return 'Jogador';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'master':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default:
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('inicio')}
            className="flex items-center gap-2 text-left group min-h-[44px]"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
              <span className="font-extrabold text-xs text-white font-mono">RS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-100 group-hover:text-cyan-400 transition-colors whitespace-nowrap">
                RPG System
              </span>
              <span className="text-[10px] text-slate-400 font-normal truncate max-w-[130px] sm:max-w-xs">
                {activeCampaign ? activeCampaign.name : 'Mesa Principal'}
              </span>
            </div>
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Navegação Superior" className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto py-1">
          {desktopTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap min-h-[40px] ${
                  isActive
                    ? 'bg-slate-800 text-cyan-300 shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Zone: Actions, Install App & User Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Quick Dice Roller */}
          <button
            onClick={onOpenDiceRoller}
            title="Abrir Bandeja de Dados"
            className="min-h-[44px] min-w-[44px] sm:min-w-0 px-2.5 sm:px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Dices className="w-4 h-4" />
            <span className="hidden sm:inline font-mono">Dados</span>
          </button>

          {/* In-App Install App Button */}
          <button
            onClick={onOpenInstallModal}
            title="Instalar Aplicativo (PWA)"
            className="hidden sm:flex min-h-[44px] px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 text-cyan-300 text-xs font-semibold items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">Instalar</span>
          </button>

          {/* User Profile / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="min-h-[44px] flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors"
              aria-label="Menu do usuário"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-200 font-bold text-xs border border-slate-700">
                {currentUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200 leading-tight">
                  {currentUser.displayName}
                </span>
                <span className="text-[10px] text-slate-400 leading-none mt-0.5">
                  {getRoleLabel(currentUser.role)}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100">
                
                {/* User info */}
                <div className="px-4 py-3 border-b border-slate-800">
                  <div className="font-bold text-sm text-slate-100">{currentUser.displayName}</div>
                  <div className="text-slate-400 text-xs truncate mt-0.5">{currentUser.email}</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
                      {getRoleLabel(currentUser.role)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isCloudConnected ? '• Firebase Conectado' : '• Persistência Local'}
                    </span>
                  </div>
                </div>

                {/* Mobile install shortcut inside menu */}
                <div className="p-2 border-b border-slate-800 sm:hidden">
                  <button
                    onClick={() => {
                      onOpenInstallModal();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Aplicativo (PWA)</span>
                  </button>
                </div>

                {/* Role Switcher */}
                <div className="px-4 py-2 text-[11px] font-semibold text-slate-400">
                  Alternar Perfil para Teste:
                </div>
                {allUsers.map((u) => (
                  <button
                    key={u.uid}
                    onClick={() => {
                      onSwitchUser(u.uid);
                      setIsUserMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-800 flex items-center justify-between min-h-[44px] ${
                      u.uid === currentUser.uid ? 'text-cyan-400 font-bold bg-slate-800/40' : 'text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs">{u.displayName}</div>
                      <div className="text-[10px] text-slate-500">{getRoleLabel(u.role)}</div>
                    </div>
                    {u.uid === currentUser.uid && <span className="text-cyan-400 font-bold">✓</span>}
                  </button>
                ))}

                {/* Campaign switcher */}
                <div className="border-t border-slate-800 my-1 pt-1">
                  <div className="px-4 py-2 text-[11px] font-semibold text-slate-400">
                    Campanha Ativa:
                  </div>
                  {campaigns.map((camp) => (
                    <button
                      key={camp.id}
                      onClick={() => {
                        onSelectCampaign(camp.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-slate-800 text-xs flex items-center justify-between min-h-[40px] ${
                        camp.id === activeCampaignId ? 'text-cyan-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span className="truncate">{camp.name}</span>
                      {camp.id === activeCampaignId && <span>✓</span>}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      onCreateCampaign();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-800 text-xs text-cyan-400 font-semibold flex items-center gap-1.5 min-h-[44px]"
                  >
                    <Plus className="w-3.5 h-3.5" /> Criar Nova Campanha
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
