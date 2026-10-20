import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { PlayerDashboardView } from './components/PlayerDashboard/PlayerDashboardView';
import { CharacterSheetView } from './components/CharacterSheet/CharacterSheetView';
import { GrimoireView } from './components/Grimoire/GrimoireView';
import { InnateCapabilitiesView } from './components/InnateCapabilities/InnateCapabilitiesView';
import { CombatManagerView } from './components/CombatManager/CombatManagerView';
import { DimensionalInventoryView } from './components/DimensionalInventory/DimensionalInventoryView';
import { TacticalMapView } from './components/TacticalMap/TacticalMapView';
import { ClassRelationsView } from './components/ClassRelationsDiagram/ClassRelationsView';
import { SystemCatalogView } from './components/SystemCatalog/SystemCatalogView';
import { MasterPanel } from './components/MasterPanel/MasterPanel';
import { DiceRoller } from './components/DiceRoller';
import { PWAInstallModal } from './components/PWAInstallModal';
import { MobileBottomNav } from './components/MobileBottomNav';

import {
  Character,
  Campaign,
  Ability,
  InnateCapability,
  RPGClass,
  ClassRelation,
  SystemElement,
  SystemRule,
  CombatEncounter,
  CampaignMap,
  UserProfile
} from './types';
import { dbService, isFirebaseConfigured } from './services/firebase';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [currentUser, setCurrentUser] = useState<UserProfile>(dbService.getCurrentUser());
  const [allUsers, setAllUsers] = useState<UserProfile[]>(dbService.getAllUsers());

  // Campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>(dbService.getCampaigns());
  const [activeCampaignId, setActiveCampaignId] = useState<string>(
    campaigns[0]?.id || 'campanha_cronicas_etereas'
  );

  // Entities
  const [characters, setCharacters] = useState<Character[]>(dbService.getCharacters());
  const [activeCharacterId, setActiveCharacterId] = useState<string>(
    characters[0]?.id || 'char_arthur'
  );

  const [abilities, setAbilities] = useState<Ability[]>(dbService.getAbilities());
  const [innates, setInnates] = useState<InnateCapability[]>(dbService.getInnates());
  const [systemRules, setSystemRules] = useState<SystemRule[]>(dbService.getSystemRules());
  const [elements, setElements] = useState<SystemElement[]>(dbService.getSystemElements());
  const [classes, setClasses] = useState<RPGClass[]>(dbService.getClasses());
  const [relations, setRelations] = useState<ClassRelation[]>(dbService.getClassRelations());
  const [encounters, setEncounters] = useState<CombatEncounter[]>(dbService.getCombatEncounters());
  const [maps, setMaps] = useState<CampaignMap[]>(dbService.getMaps());

  // Modals
  const [isDiceRollerOpen, setIsDiceRollerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isNewCampaignModalOpen, setIsNewCampaignModalOpen] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignDesc, setNewCampaignDesc] = useState('');

  // Active character & campaign
  const activeChar = characters.find((c) => c.id === activeCharacterId) || characters[0];
  const activeCampaign = campaigns.find((c) => c.id === activeCampaignId) || campaigns[0];

  // Subscribe to real-time changes
  useEffect(() => {
    const unsubChar = dbService.subscribe<Character[]>('characters', (data) => setCharacters(data));
    const unsubCamp = dbService.subscribe<Campaign[]>('campaigns', (data) => setCampaigns(data));
    const unsubAbil = dbService.subscribe<Ability[]>('abilities', (data) => setAbilities(data));
    const unsubInn = dbService.subscribe<InnateCapability[]>('innates', (data) => setInnates(data));
    const unsubRules = dbService.subscribe<SystemRule[]>('system_rules', (data) => setSystemRules(data));
    const unsubElem = dbService.subscribe<SystemElement[]>('elements', (data) => setElements(data));
    const unsubEnc = dbService.subscribe<CombatEncounter[]>('encounters', (data) => setEncounters(data));
    const unsubMaps = dbService.subscribe<CampaignMap[]>('maps', (data) => setMaps(data));
    const unsubUser = dbService.subscribe<UserProfile>('auth_user', (data) => setCurrentUser(data));

    return () => {
      unsubChar();
      unsubCamp();
      unsubAbil();
      unsubInn();
      unsubRules();
      unsubElem();
      unsubEnc();
      unsubMaps();
      unsubUser();
    };
  }, []);

  const handleSwitchUser = (userId: string) => {
    const switched = dbService.switchUser(userId);
    setCurrentUser(switched);
  };

  const handleCreateCampaignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;

    const newCamp: Campaign = {
      id: 'camp_' + Date.now(),
      name: newCampaignName.trim(),
      description: newCampaignDesc.trim() || 'Nova campanha de RPG System.',
      masterId: currentUser.uid,
      masterName: currentUser.displayName,
      inviteCode: 'RS-' + Math.floor(1000 + Math.random() * 9000),
      isPublic: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    dbService.saveCampaign(newCamp);
    setActiveCampaignId(newCamp.id);
    setIsNewCampaignModalOpen(false);
    setNewCampaignName('');
    setNewCampaignDesc('');
  };

  const handleBroadcastCombatLog = (text: string) => {
    const curEncounter = encounters.find((e) => e.campaignId === activeCampaignId) || encounters[0];
    if (curEncounter) {
      const updated: CombatEncounter = {
        ...curEncounter,
        logs: [
          {
            id: 'log_' + Date.now(),
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            round: curEncounter.round,
            participantName: activeChar?.name || currentUser.displayName,
            actionCategory: 'classe',
            description: text
          },
          ...curEncounter.logs
        ]
      };
      dbService.saveCombatEncounter(updated);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        campaigns={campaigns}
        activeCampaignId={activeCampaignId}
        onSelectCampaign={setActiveCampaignId}
        onCreateCampaign={() => setIsNewCampaignModalOpen(true)}
        onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isCloudConnected={isFirebaseConfigured}
      />

      {/* Main Content Viewport with mobile bottom navigation offset */}
      <main className="flex-1 pb-24 lg:pb-12">
        {activeTab === 'inicio' && (
          <PlayerDashboardView
            characters={characters}
            activeCharacter={activeChar}
            activeCampaign={activeCampaign}
            currentUser={currentUser}
            classes={classes}
            onSelectCharacter={setActiveCharacterId}
            onNavigateTab={setActiveTab}
            onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
            onOpenInstallModal={() => setIsInstallModalOpen(true)}
            onCreateNewCharacter={() => setActiveTab('fichas')}
          />
        )}

        {activeTab === 'fichas' && (
          <CharacterSheetView
            characters={characters}
            activeCharacterId={activeCharacterId}
            onSelectCharacter={setActiveCharacterId}
            onSaveCharacter={(char) => dbService.saveCharacter(char)}
            onDeleteCharacter={(id) => dbService.deleteCharacter(id)}
            classes={classes}
            abilities={abilities}
            innates={innates}
            currentUser={currentUser}
            campaignId={activeCampaignId}
          />
        )}

        {activeTab === 'grimorio' && (
          <GrimoireView
            abilities={abilities}
            onSaveAbility={(ab) => dbService.saveAbility(ab)}
            activeCharacter={activeChar}
            onRecordUsage={(id, cId, cName, cost, res, isHidden, mult) =>
              dbService.recordAbilityUsage(id, cId, cName, cost, res, isHidden, mult)
            }
          />
        )}

        {activeTab === 'inatas' && (
          <InnateCapabilitiesView
            innates={innates}
            onSaveInnate={(inn) => dbService.saveInnate(inn)}
            activeCharacter={activeChar}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'combate' && (
          <CombatManagerView
            encounters={encounters}
            activeEncounterId={encounters[0]?.id || ''}
            onSaveEncounter={(enc) => dbService.saveCombatEncounter(enc)}
            currentUser={currentUser}
            abilities={abilities}
            innates={innates}
            onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
          />
        )}

        {activeTab === 'inventario' && (
          <DimensionalInventoryView
            activeCharacter={activeChar}
            onSaveCharacter={(char) => dbService.saveCharacter(char)}
            onBroadcastLog={handleBroadcastCombatLog}
          />
        )}

        {activeTab === 'mapa' && (
          <TacticalMapView
            maps={maps}
            activeMapId={maps[0]?.id || ''}
            onSelectMap={() => {}}
            onSaveMap={(m) => dbService.saveMap(m)}
            currentUser={currentUser}
            characters={characters}
            campaignId={activeCampaignId}
          />
        )}

        {activeTab === 'classes' && (
          <ClassRelationsView
            classes={classes}
            relations={relations}
            onSaveRelation={(rel) => dbService.saveClassRelation(rel)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'catalogo' && (
          <SystemCatalogView
            elements={elements}
            onSaveElement={(elem) => dbService.saveSystemElement(elem)}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'regras' && (
          <MasterPanel
            systemRules={systemRules}
            onSaveRule={(rule) => dbService.saveSystemRule(rule)}
            currentUser={currentUser}
            campaign={activeCampaign}
            onResetDatabase={() => dbService.resetToDefault()}
          />
        )}
      </main>

      {/* Mobile Bottom Thumb Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenDiceRoller={() => setIsDiceRollerOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        currentUser={currentUser}
      />

      {/* Quick Dice Roller Modal */}
      <DiceRoller
        isOpen={isDiceRollerOpen}
        onClose={() => setIsDiceRollerOpen(false)}
        onBroadcastResult={handleBroadcastCombatLog}
      />

      {/* PWA Install Guide Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />

      {/* New Campaign Modal */}
      {isNewCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold">Criar Nova Campanha</h3>

            <form onSubmit={handleCreateCampaignSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="Ex: A Grande Fronteira de Mana..."
                  className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={3}
                  value={newCampaignDesc}
                  onChange={(e) => setNewCampaignDesc(e.target.value)}
                  placeholder="Cenário, objetivos e regras da mesa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCampaignModalOpen(false)}
                  className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl"
                >
                  Criar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
