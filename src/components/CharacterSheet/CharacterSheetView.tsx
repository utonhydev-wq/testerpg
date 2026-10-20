import React, { useState } from 'react';
import {
  Heart,
  Zap,
  Activity,
  Shield,
  Award,
  Sparkles,
  BedDouble,
  Apple,
  Droplets,
  Moon,
  Plus,
  Trash2,
  AlertTriangle,
  FileText,
  Save,
  CheckCircle,
  Sword,
  Swords,
  BookOpen,
  Box,
  Compass,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Character, RPGClass, Ability, InnateCapability, UserProfile, ArchetypeModel } from '../../types';
import { INITIAL_ARCHETYPES } from '../../data/initialData';

interface CharacterSheetViewProps {
  characters: Character[];
  activeCharacterId: string;
  onSelectCharacter: (id: string) => void;
  onSaveCharacter: (char: Character) => void;
  onDeleteCharacter: (id: string) => void;
  classes: RPGClass[];
  abilities: Ability[];
  innates: InnateCapability[];
  currentUser: UserProfile;
  campaignId: string;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  characters,
  activeCharacterId,
  onSelectCharacter,
  onSaveCharacter,
  onDeleteCharacter,
  classes,
  abilities,
  innates,
  currentUser,
  campaignId
}) => {
  const activeChar = characters.find((c) => c.id === activeCharacterId) || characters[0];

  const [activeSection, setActiveSection] = useState<
    'status' | 'identidade' | 'classes' | 'habilidades' | 'inatas' | 'condicoes' | 'historico'
  >('status');

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedArchetype, setSelectedArchetype] = useState<'humano' | 'humano_superior' | 'transcendente'>('humano');
  const [newCharName, setNewCharName] = useState('');

  // Save feedback state
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Damage / Heal input
  const [hpChangeAmount, setHpChangeAmount] = useState<number | ''>('');
  const [energyChangeAmount, setEnergyChangeAmount] = useState<number | ''>('');

  // Modals
  const [showRestModal, setShowRestModal] = useState(false);
  const [showConsumeModal, setShowConsumeModal] = useState(false);
  const [showAddAbilityModal, setShowAddAbilityModal] = useState(false);
  const [showAddInnateModal, setShowAddInnateModal] = useState(false);
  const [newConditionText, setNewConditionText] = useState('');
  const [newTitleText, setNewTitleText] = useState('');

  const canEdit =
    currentUser.role === 'admin' ||
    currentUser.role === 'master' ||
    (activeChar && activeChar.userId === currentUser.uid);

  const triggerSave = (updated: Character) => {
    setSaveStatus('saving');
    onSaveCharacter(updated);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 200);
  };

  // Health modifications
  const handleApplyDamage = () => {
    if (!activeChar || typeof hpChangeAmount !== 'number' || hpChangeAmount <= 0) return;
    const oldHp = activeChar.hp.current;
    const newHp = Math.max(0, oldHp - hpChangeAmount);
    const updatedConditions = [...activeChar.conditions];

    // Rule: Taking > 8 damage in one hit triggers negative condition
    if (hpChangeAmount > 8) {
      updatedConditions.push({
        id: 'cond_' + Date.now(),
        name: `Ferimento Severo (${hpChangeAmount} dano sofrido)`,
        type: 'negative',
        description: 'Recebeu mais de 8 pontos de dano em um único golpe. Gera efeito negativo a ser administrado pelo mestre.'
      });
    }

    // Rule: HP < 6 triggers passive negative condition
    if (newHp < 6 && !updatedConditions.some((c) => c.name.includes('Esgotamento Crítico'))) {
      updatedConditions.push({
        id: 'cond_crit_' + Date.now(),
        name: 'Esgotamento Crítico (Vida < 6)',
        type: 'negative',
        description: 'Vida abaixo de 6 garante um efeito negativo passivo.',
        isPassive: true
      });
    }

    const updated: Character = {
      ...activeChar,
      hp: { ...activeChar.hp, current: newHp },
      conditions: updatedConditions,
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Dano Sofrido',
          details: `Perdeu ${hpChangeAmount} de vida. HP: ${oldHp} -> ${newHp}. ${hpChangeAmount > 8 ? '(Condição Negativa >8 Dano Adicionada)' : ''}`
        },
        ...activeChar.actionLog
      ]
    };

    triggerSave(updated);
    setHpChangeAmount('');
  };

  const handleApplyHeal = () => {
    if (!activeChar || typeof hpChangeAmount !== 'number' || hpChangeAmount <= 0) return;
    const oldHp = activeChar.hp.current;
    const newHp = Math.min(activeChar.hp.max, oldHp + hpChangeAmount);

    const updatedConditions =
      newHp >= 6
        ? activeChar.conditions.filter((c) => !c.name.includes('Esgotamento Crítico'))
        : activeChar.conditions;

    const updated: Character = {
      ...activeChar,
      hp: { ...activeChar.hp, current: newHp },
      conditions: updatedConditions,
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Cura Recebida',
          details: `Recuperou ${hpChangeAmount} de vida. HP: ${oldHp} -> ${newHp}`
        },
        ...activeChar.actionLog
      ]
    };

    triggerSave(updated);
    setHpChangeAmount('');
  };

  const handleApplyEnergyChange = (delta: number) => {
    if (!activeChar) return;
    const newEnergy = Math.max(0, Math.min(activeChar.energia.max, activeChar.energia.current + delta));
    const updated: Character = {
      ...activeChar,
      energia: { ...activeChar.energia, current: newEnergy }
    };
    triggerSave(updated);
  };

  // Rest recovery calculation:
  // Duration: maxHp / 6 turns
  // Recovery: (Int + Von + Agi + For) / 6
  const calcRestRecovery = () => {
    if (!activeChar) return { turns: 0, heal: 0 };
    const turns = Math.ceil(activeChar.hp.max / 6);
    const sumAttrs =
      activeChar.attributes.inteligencia.value +
      activeChar.attributes.vontade.value +
      activeChar.attributes.agilidade.value +
      activeChar.attributes.forca.value;
    const heal = Math.floor(sumAttrs / 6);
    return { turns, heal };
  };

  const handleExecuteRest = () => {
    const { turns, heal } = calcRestRecovery();
    if (!activeChar) return;

    const newHp = Math.min(activeChar.hp.max, activeChar.hp.current + heal);
    const updated: Character = {
      ...activeChar,
      hp: { ...activeChar.hp, current: newHp },
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Descanso Realizado',
          details: `Descansou por ${turns} turnos. Recuperou ${heal} de vida. HP: ${activeChar.hp.current} -> ${newHp}`
        },
        ...activeChar.actionLog
      ]
    };
    triggerSave(updated);
    setShowRestModal(false);
  };

  // Plant/Animal consumption formula: Vida Total / (Vida / 3)
  const calcConsumeRecovery = () => {
    if (!activeChar) return 0;
    const cur = Math.max(1, activeChar.hp.current / 3);
    return Math.round(activeChar.hp.max / cur);
  };

  const handleExecuteConsume = () => {
    const heal = calcConsumeRecovery();
    if (!activeChar) return;
    const newHp = Math.min(activeChar.hp.max, activeChar.hp.current + heal);
    const updated: Character = {
      ...activeChar,
      hp: { ...activeChar.hp, current: newHp },
      actionLog: [
        {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('pt-BR'),
          action: 'Consumo Realizado',
          details: `Consumiu elemento biológico. Fórmula original: Vida Total / (Vida / 3) = +${heal} HP.`
        },
        ...activeChar.actionLog
      ]
    };
    triggerSave(updated);
    setShowConsumeModal(false);
  };

  // Requirement 2: PERSONAGENS NOVOS COMPLETAMENTE ZERADOS
  // Ao criar um personagem novo, deixar campos vazios ou sem seleção:
  // nome, imagem, aparência "", biografia "", classe adquirida [], habilidades [], inatas [], itens [], equipamentos [], títulos [], condições [], feitos [], histórico [].
  // Preserva os atributos-base originais de cada modelo.
  const handleCreateNewCharacterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const template = INITIAL_ARCHETYPES[selectedArchetype];
    const newChar: Character = {
      id: 'char_' + Date.now(),
      campaignId,
      userId: currentUser.uid,
      name: newCharName.trim(), // Starts with user-provided name or empty if none
      archetype: selectedArchetype,
      appearance: '', // COMPLETELY EMPTY
      backstory: '',  // COMPLETELY EMPTY
      titles: [],     // COMPLETELY EMPTY (NO DEFAULT TITLES)
      avatarUrl: undefined,

      // Base HP & Energy preserved exactly as defined in the master system
      hp: {
        current: template.hp.current,
        max: template.hp.max
      },
      energia: {
        current: template.energia.current,
        max: template.energia.max,
        fome: template.energia.fome,
        sede: template.energia.sede,
        sono: template.energia.sono
      },

      // Base attributes preserved with {0/600} requirement indicator
      attributes: {
        inteligencia: { value: template.attributes.inteligencia.value, progression: '{0/600}' },
        forca: { value: template.attributes.forca.value, progression: '{0/600}' },
        vontade: { value: template.attributes.vontade.value, progression: '{0/600}' },
        agilidade: { value: template.attributes.agilidade.value, progression: '{0/600}' }
      },

      // COMPLETELY ZEROED: No classes, no abilities, no innates, no items, no conditions, no logs
      acquiredClasses: [],
      abilities: [],
      innateCapabilities: [],
      items: [],
      dimensionalInventory: {
        isOpen: false,
        orientation: 'horizontal',
        slottedEnergy: undefined,
        lastUsedTurn: 0,
        isLockedDueToForce: false
      },
      conditions: [],
      progressionPendingNotes: template.progressionPendingNotes,
      actionLog: [], // ZEROED: No initial log

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSaveCharacter(newChar);
    onSelectCharacter(newChar.id);
    setIsCreatingNew(false);
    setNewCharName('');
  };

  const handleAddCondition = () => {
    if (!newConditionText.trim() || !activeChar) return;
    const cond = {
      id: 'cond_' + Date.now(),
      name: newConditionText.trim(),
      type: 'negative' as const,
      description: 'Condição registrada manualmente.'
    };
    triggerSave({
      ...activeChar,
      conditions: [...activeChar.conditions, cond]
    });
    setNewConditionText('');
  };

  const handleRemoveCondition = (condId: string) => {
    if (!activeChar) return;
    triggerSave({
      ...activeChar,
      conditions: activeChar.conditions.filter((c) => c.id !== condId)
    });
  };

  const handleAddTitle = () => {
    if (!newTitleText.trim() || !activeChar) return;
    triggerSave({
      ...activeChar,
      titles: [...activeChar.titles, newTitleText.trim()]
    });
    setNewTitleText('');
  };

  const handleRemoveTitle = (idx: number) => {
    if (!activeChar) return;
    triggerSave({
      ...activeChar,
      titles: activeChar.titles.filter((_, i) => i !== idx)
    });
  };

  const handleAcquireClass = (classId: string) => {
    if (!activeChar) return;
    const exists = activeChar.acquiredClasses.find((c) => c.classId === classId);
    let updatedClasses = [...activeChar.acquiredClasses];
    const targetClass = classes.find((c) => c.id === classId);

    if (exists) {
      if (exists.level < 3) {
        updatedClasses = updatedClasses.map((c) =>
          c.classId === classId
            ? {
                ...c,
                level: c.level + 1,
                ruleChangesUnlocked: [
                  ...c.ruleChangesUnlocked,
                  c.level === 1 ? targetClass?.level2RuleChange || '' : targetClass?.level3RuleChange || ''
                ].filter(Boolean)
              }
            : c
        );
      }
    } else {
      updatedClasses.push({
        classId,
        level: 1,
        ruleChangesUnlocked: targetClass?.level1RuleChange ? [targetClass.level1RuleChange] : [],
        advancedAttributesUnlocked: {
          defensive: true,
          offensive: true
        }
      });
    }

    triggerSave({ ...activeChar, acquiredClasses: updatedClasses });
  };

  const handleToggleAbilityLink = (abilityId: string) => {
    if (!activeChar) return;
    const has = activeChar.abilities.includes(abilityId);
    const updated = has
      ? activeChar.abilities.filter((id) => id !== abilityId)
      : [...activeChar.abilities, abilityId];
    triggerSave({ ...activeChar, abilities: updated });
  };

  const handleToggleInnateLink = (innateId: string) => {
    if (!activeChar) return;
    const has = activeChar.innateCapabilities.includes(innateId);
    const updated = has
      ? activeChar.innateCapabilities.filter((id) => id !== innateId)
      : [...activeChar.innateCapabilities, innateId];
    triggerSave({ ...activeChar, innateCapabilities: updated });
  };

  if (!activeChar && !isCreatingNew) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-slate-100">Nenhum Personagem Selecionado</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          Crie uma nova ficha zerada para começar sua jornada com as regras oficiais do RPG System.
        </p>
        <button
          onClick={() => setIsCreatingNew(true)}
          className="mt-4 min-h-[44px] px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Criar Personagem Zerado
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      
      {/* Top Strip: Character Switcher & New Character Action */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          {characters.map((char) => {
            const isSelected = char.id === activeChar?.id;
            return (
              <button
                key={char.id}
                onClick={() => onSelectCharacter(char.id)}
                className={`min-h-[44px] flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 shadow-xs'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <span>{char.name || 'Sem Nome'}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {char.hp.current}/{char.hp.max} HP
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="text-[11px] text-cyan-400 font-mono animate-pulse">Salvando...</span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Salvo
            </span>
          )}

          <button
            onClick={() => setIsCreatingNew(true)}
            className="min-h-[44px] px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Nova Ficha Zerada
          </button>
        </div>
      </div>

      {activeChar && (
        <div className="space-y-6">
          
          {/* Quick Header Card */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 border border-cyan-400/30 flex items-center justify-center text-white font-extrabold text-lg shadow-md shrink-0">
                {activeChar.name ? activeChar.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100 leading-snug">
                  {activeChar.name || 'Personagem Sem Nome'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="capitalize font-semibold text-slate-300">
                    {activeChar.archetype.replace('_', ' ')}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeChar.titles.length > 0 ? activeChar.titles.join(', ') : 'Sem títulos registrados'}</span>
                </div>
              </div>
            </div>

            {/* HP and Energy Quick Overview */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Vida: </span>
                <strong className="text-rose-400 text-sm">{activeChar.hp.current}/{activeChar.hp.max}</strong>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <span className="text-slate-400">Energia: </span>
                <strong className="text-cyan-400 text-sm">{activeChar.energia.current}/{activeChar.energia.max}</strong>
              </div>
            </div>
          </div>

          {/* Section Navigation Tabs (Organized in Clean Hierarchical Tabs) */}
          <div className="flex items-center gap-1.5 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto text-xs">
            {[
              { id: 'status', label: 'Vida, Energia & Atributos', icon: Heart },
              { id: 'identidade', label: 'Identidade & Biografia', icon: User },
              { id: 'classes', label: 'Classes & Desbloqueios', icon: Swords },
              { id: 'habilidades', label: 'Habilidades (Grimório)', icon: BookOpen },
              { id: 'inatas', label: 'Capacidades Inatas', icon: Zap },
              { id: 'condicoes', label: 'Condições Ativas', icon: AlertTriangle },
              { id: 'historico', label: 'Histórico & Feitos', icon: Clock }
            ].map((sec) => {
              const Icon = sec.icon;
              const isSelected = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`min-h-[44px] flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-slate-800 text-cyan-300 shadow-xs border border-slate-700'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{sec.label}</span>
                </button>
              );
            })}
          </div>

          {/* SECTION 1: Vida, Energia & Atributos */}
          {activeSection === 'status' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: HP & Energy Controls (5 Cols) */}
              <div className="lg:col-span-5 space-y-5">
                
                {/* HP Block */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-rose-500/20 text-rose-400" />
                      Vida Atual
                    </span>
                    <span className="font-mono text-base font-extrabold text-slate-100 tabular-nums">
                      {activeChar.hp.current} / {activeChar.hp.max}
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-rose-600 to-rose-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (activeChar.hp.current / activeChar.hp.max) * 100)}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1">
                    <span>Dano &gt;8: Penalidade</span>
                    <span>&lt;6 HP: Passiva adversa</span>
                  </div>

                  {/* HP Controls */}
                  {canEdit && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={hpChangeAmount}
                          onChange={(e) => setHpChangeAmount(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                          placeholder="Valor"
                          className="w-24 min-h-[44px] px-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono text-center text-sm focus:outline-hidden focus:border-cyan-500"
                        />
                        <button
                          onClick={handleApplyDamage}
                          className="min-h-[44px] flex-1 px-3 bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800 text-rose-300 text-xs font-bold rounded-xl transition-colors"
                        >
                          Tomar Dano
                        </button>
                        <button
                          onClick={handleApplyHeal}
                          className="min-h-[44px] flex-1 px-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-xs font-bold rounded-xl transition-colors"
                        >
                          Curar
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setShowRestModal(true)}
                          className="min-h-[44px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <BedDouble className="w-4 h-4 text-purple-400" />
                          <span>Descanso</span>
                        </button>
                        <button
                          onClick={() => setShowConsumeModal(true)}
                          className="min-h-[44px] py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Apple className="w-4 h-4 text-amber-400" />
                          <span>Consumo</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Energy Block with Tripartite Components */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 fill-cyan-500/20 text-cyan-400" />
                      Energia Total
                    </span>
                    <span className="font-mono text-base font-extrabold text-slate-100 tabular-nums">
                      {activeChar.energia.current} / {activeChar.energia.max}
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (activeChar.energia.current / activeChar.energia.max) * 100)}%` }}
                    />
                  </div>

                  {/* Tripartite Sub-components: Fome, Sede, Sono */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-amber-400 font-semibold block flex items-center justify-center gap-1 mb-0.5">
                        <Apple className="w-3 h-3" /> Fome
                      </span>
                      <span className="font-mono font-bold text-slate-200">{activeChar.energia.fome}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-blue-400 font-semibold block flex items-center justify-center gap-1 mb-0.5">
                        <Droplets className="w-3 h-3" /> Sede
                      </span>
                      <span className="font-mono font-bold text-slate-200">{activeChar.energia.sede}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] text-purple-400 font-semibold block flex items-center justify-center gap-1 mb-0.5">
                        <Moon className="w-3 h-3" /> Sono
                      </span>
                      <span className="font-mono font-bold text-slate-200">{activeChar.energia.sono}</span>
                    </div>
                  </div>

                  {canEdit && (
                    <div className="flex gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleApplyEnergyChange(-5)}
                        className="min-h-[44px] flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                      >
                        -5 ENG
                      </button>
                      <button
                        onClick={() => handleApplyEnergyChange(-1)}
                        className="min-h-[44px] flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                      >
                        -1 ENG
                      </button>
                      <button
                        onClick={() => handleApplyEnergyChange(+5)}
                        className="min-h-[44px] flex-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300"
                      >
                        +5 ENG
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: 4 Base Attributes & Progression (7 Cols) */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Atributos Básicos do Sistema</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Os indicadores &#123;0/600&#125; representam requisitos de progressão preservados sem conversão automática.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { key: 'inteligencia', label: 'Inteligência', icon: Sparkles, color: 'text-blue-400', desc: 'Base de Feiticeiro & Espírito' },
                      { key: 'forca', label: 'Força', icon: Sword, color: 'text-rose-400', desc: 'Base de Guerreiro & Entidade' },
                      { key: 'vontade', label: 'Vontade', icon: Shield, color: 'text-amber-400', desc: 'Base de Marcial & Feiticeiro' },
                      { key: 'agilidade', label: 'Agilidade', icon: Activity, color: 'text-emerald-400', desc: 'Base de Guerreiro & Marcial' }
                    ].map((attr) => {
                      const attrData = (activeChar.attributes as any)[attr.key];
                      const Icon = attr.icon;
                      return (
                        <div
                          key={attr.key}
                          className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className={`w-4 h-4 ${attr.color}`} />
                              <span className="font-bold text-sm text-slate-200">{attr.label}</span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-100 font-mono tabular-nums">
                              {attrData.value}
                            </div>
                          </div>

                          <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-900">
                            <span className="text-[11px] text-slate-500">{attr.desc}</span>
                            <span className="font-mono text-cyan-400 font-semibold text-[11px] px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                              {attrData.progression}
                            </span>
                          </div>

                          {canEdit && (
                            <div className="mt-3 flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  const updated = {
                                    ...activeChar,
                                    attributes: {
                                      ...activeChar.attributes,
                                      [attr.key]: { ...attrData, value: Math.max(1, attrData.value - 1) }
                                    }
                                  };
                                  triggerSave(updated);
                                }}
                                className="min-w-[36px] min-h-[36px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-center font-mono text-xs"
                              >
                                -
                              </button>
                              <button
                                onClick={() => {
                                  const updated = {
                                    ...activeChar,
                                    attributes: {
                                      ...activeChar.attributes,
                                      [attr.key]: { ...attrData, value: attrData.value + 1 }
                                    }
                                  };
                                  triggerSave(updated);
                                }}
                                className="min-w-[36px] min-h-[36px] rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center justify-center font-mono text-xs"
                              >
                                +
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rest & Progression Notes */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                    <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <BedDouble className="w-4 h-4 text-purple-400" />
                      Fórmula de Descanso do Manual:
                    </div>
                    <div className="font-mono text-slate-300">
                      Duração: Vida máxima / 6 turnos ({calcRestRecovery().turns} turnos)
                    </div>
                    <div className="font-mono text-slate-300">
                      Recuperação: (Int + Von + Agi + For) / 6 = {calcRestRecovery().heal} HP recuperados
                    </div>
                    {activeChar.progressionPendingNotes && (
                      <div className="text-amber-400/90 font-mono text-[11px] pt-1 border-t border-slate-900">
                        {activeChar.progressionPendingNotes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Identidade & Biografia */}
          {activeSection === 'identidade' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">Identificação, Aparência &amp; Biografia</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Campos descritivos do personagem para imersão e narrativa de mesa.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Personagem</label>
                  <input
                    type="text"
                    disabled={!canEdit}
                    value={activeChar.name}
                    onChange={(e) => triggerSave({ ...activeChar, name: e.target.value })}
                    placeholder="Nome do personagem..."
                    className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo de Ficha</label>
                  <div className="min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono flex items-center">
                    {activeChar.archetype.toUpperCase().replace('_', ' ')}
                  </div>
                </div>
              </div>

              {/* Titles Manager */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Títulos &amp; Honrarias</label>
                <div className="flex flex-wrap gap-2">
                  {activeChar.titles.length === 0 ? (
                    <span className="text-xs text-slate-500 italic">Nenhum título adquirido ainda.</span>
                  ) : (
                    activeChar.titles.map((title, i) => (
                      <span
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-cyan-300 flex items-center gap-1.5"
                      >
                        {title}
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveTitle(i)}
                            className="text-slate-500 hover:text-rose-400 ml-1"
                          >
                            ×
                          </button>
                        )}
                      </span>
                    ))
                  )}
                </div>

                {canEdit && (
                  <div className="flex gap-2 max-w-md pt-1">
                    <input
                      type="text"
                      value={newTitleText}
                      onChange={(e) => setNewTitleText(e.target.value)}
                      placeholder="Adicionar título conquistado..."
                      className="flex-1 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                    />
                    <button
                      onClick={handleAddTitle}
                      className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                    >
                      Adicionar
                    </button>
                  </div>
                )}
              </div>

              {/* Appearance */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Aparência Física &amp; Vestimentas</label>
                <textarea
                  rows={3}
                  disabled={!canEdit}
                  value={activeChar.appearance}
                  onChange={(e) => triggerSave({ ...activeChar, appearance: e.target.value })}
                  placeholder="Traços físicos, altura, cabelos, roupas, acessórios, marcas de combate..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Backstory */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">História de Origem &amp; Feitos</label>
                <textarea
                  rows={4}
                  disabled={!canEdit}
                  value={activeChar.backstory}
                  onChange={(e) => triggerSave({ ...activeChar, backstory: e.target.value })}
                  placeholder="Origem, laços, conexões com as energias ou acontecimentos prévios..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-hidden focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* SECTION 3: Classes & Desbloqueios */}
          {activeSection === 'classes' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-100">Classes do Sistema (5 Classes)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Classes não são obrigatórias na criação e são conquistadas por feitos e uso de energias.
                </p>
              </div>

              <div className="space-y-4">
                {classes.map((cls) => {
                  const acquired = activeChar.acquiredClasses.find((ac) => ac.classId === cls.id);
                  return (
                    <div
                      key={cls.id}
                      className={`p-4 rounded-xl border transition-all ${
                        acquired
                          ? 'bg-slate-950 border-slate-700 shadow-md'
                          : 'bg-slate-950/40 border-slate-800/80 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: cls.color }}
                          />
                          <div>
                            <span className="font-bold text-sm text-slate-100">{cls.name}</span>
                            <span className="text-xs text-slate-400 ml-2">
                              Energia: <strong className="text-slate-200">{cls.energy}</strong> · Afinidade: {cls.affinity}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {acquired ? (
                            <span
                              style={{ borderColor: cls.color, color: cls.color }}
                              className="px-2.5 py-1 rounded-full text-xs font-bold border"
                            >
                              Adquirida (Nível {acquired.level})
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Sem vínculo de classe</span>
                          )}

                          {canEdit && (
                            <button
                              onClick={() => handleAcquireClass(cls.id)}
                              className="min-h-[40px] px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors"
                            >
                              {acquired ? `Evoluir p/ Nv. ${Math.min(3, acquired.level + 1)}` : 'Adquirir Classe'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Details of class */}
                      <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 font-medium">Mudanças de Regra:</span>
                          <div className="text-slate-200 mt-0.5">Nv. 1: {cls.level1RuleChange}</div>
                          <div className="text-slate-400 mt-0.5">Nv. 2: {cls.level2RuleChange}</div>
                        </div>
                        <div>
                          <span className="text-slate-400 font-medium">Atributos Avançados:</span>
                          <div className="text-emerald-400 mt-0.5">🛡️ Defensivo: {cls.advancedAttributes.defensive}</div>
                          <div className="text-rose-400 mt-0.5">⚔️ Ofensivo: {cls.advancedAttributes.offensive}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: Habilidades do Grimório */}
          {activeSection === 'habilidades' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Habilidades Vinculadas ao Personagem</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Habilidades do Grimório dominadas por este aventureiro.
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowAddAbilityModal(true)}
                    className="min-h-[40px] px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Vincular Habilidade
                  </button>
                )}
              </div>

              {activeChar.abilities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Nenhuma habilidade adquirida ainda. Personagens novos começam zerados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeChar.abilities.map((abId) => {
                    const ab = abilities.find((a) => a.id === abId);
                    if (!ab) return null;
                    return (
                      <div
                        key={ab.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-200">{ab.name}</span>
                            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                              Nv. {ab.currentLevel} · {ab.energyCost} Energia ({ab.energyType})
                            </div>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleToggleAbilityLink(ab.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Desvincular habilidade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{ab.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 5: Capacidades Inatas */}
          {activeSection === 'inatas' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Capacidades Inatas Registradas</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Feitos de controle avançado da energia da classe adquiridos por este personagem.
                  </p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => setShowAddInnateModal(true)}
                    className="min-h-[40px] px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Vincular Inata
                  </button>
                )}
              </div>

              {activeChar.innateCapabilities.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Nenhuma capacidade inata registrada ainda. Personagens novos começam zerados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {activeChar.innateCapabilities.map((innId) => {
                    const inn = innates.find((i) => i.id === innId);
                    if (!inn) return null;
                    return (
                      <div
                        key={inn.id}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-200">{inn.name}</span>
                            <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                              {inn.className} · Caminho {inn.path} · Nv. {inn.level}
                            </div>
                          </div>
                          {canEdit && (
                            <button
                              onClick={() => handleToggleInnateLink(inn.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="Desvincular capacidade"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{inn.specialEffect}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SECTION 6: Condições Ativas */}
          {activeSection === 'condicoes' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100">Condições &amp; Efeitos Ativos</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Penalidades por dano severo (&gt;8 em 1 hit), esgotamento (&lt;6 HP) ou efeitos adversos de combate.
                  </p>
                </div>
              </div>

              {activeChar.conditions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Nenhuma condição ativa. O personagem está em perfeito estado físico e mental.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeChar.conditions.map((cond) => (
                    <div
                      key={cond.id}
                      className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-rose-400 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" /> {cond.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{cond.description}</div>
                      </div>
                      {canEdit && (
                        <button
                          onClick={() => handleRemoveCondition(cond.id)}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-500 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {canEdit && (
                <div className="flex gap-2 max-w-md pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    value={newConditionText}
                    onChange={(e) => setNewConditionText(e.target.value)}
                    placeholder="Nova condição (ex: Paralisia, Queimadura)..."
                    className="flex-1 min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                  />
                  <button
                    onClick={handleAddCondition}
                    className="min-h-[44px] px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* SECTION 7: Histórico de Ações */}
          {activeSection === 'historico' && (
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h3 className="text-base font-bold text-slate-100">Registro de Ações &amp; Feitos</h3>
                <span className="text-xs text-slate-500 font-mono">{activeChar.actionLog.length} eventos</span>
              </div>

              {activeChar.actionLog.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
                  Nenhuma ação registrada ainda nesta ficha.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {activeChar.actionLog.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-cyan-400">{log.action}</div>
                        <div className="text-slate-300 mt-0.5">{log.details}</div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Create New Zerado Character */}
      {isCreatingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Criar Nova Ficha de Personagem (Completamente Zerada)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Conforme as regras do sistema, o personagem começará <strong>sem habilidades, itens, classes, títulos ou condições pré-incluídos</strong>, preservando rigorosamente os valores-base originais do modelo escolhido.
            </p>

            <form onSubmit={handleCreateNewCharacterSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome do Personagem</label>
                <input
                  type="text"
                  required
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="Nome do personagem..."
                  className="w-full min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Modelo Base Original</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'humano', title: 'Humano', hp: '30/30 (+0/6 fase)', stats: 'Int 12, For 6, Von 6, Agi 6 {0/600}' },
                    { id: 'humano_superior', title: 'Humano Superior', hp: '90/90', stats: 'Int 36, For 18, Von 18, Agi 18 {0/600}' },
                    { id: 'transcendente', title: 'Transcendente', hp: '180/180', stats: 'Int 72, For 36, Von 36, Agi 36 {0/600}' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedArchetype(m.id as any)}
                      className={`min-h-[80px] p-3 rounded-xl border text-left transition-all ${
                        selectedArchetype === m.id
                          ? 'bg-cyan-950/70 border-cyan-500 text-cyan-200 ring-1 ring-cyan-500/30'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs">{m.title}</div>
                      <div className="text-[11px] font-mono text-cyan-400 mt-1">{m.hp}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{m.stats}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-bold text-slate-300 block">Confirmação de Ficha Zerada:</span>
                <div>• Habilidades: 0 (Nenhuma pré-vinculada)</div>
                <div>• Capacidades Inatas: 0 (Nenhuma pré-vinculada)</div>
                <div>• Inventário: 0 itens (Vazio)</div>
                <div>• Classes: Nenhuma (Aquisição opcional durante a campanha)</div>
                <div>• Histórico: Vazio</div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Criar Ficha Zerada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Ability to Character */}
      {showAddAbilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold">Vincular Habilidade do Grimório</h3>
            <p className="text-xs text-slate-400">
              Selecione uma habilidade já cadastrada no Grimório para vincular a este personagem:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {abilities.map((ab) => {
                const isLinked = activeChar.abilities.includes(ab.id);
                return (
                  <button
                    key={ab.id}
                    onClick={() => handleToggleAbilityLink(ab.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition-all min-h-[48px] ${
                      isLinked
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-200">{ab.name}</span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {ab.energyType} · {ab.energyCost} ENG · Nv. {ab.currentLevel}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono">
                      {isLinked ? '✓ Vinculada' : '+ Vincular'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddAbilityModal(false)}
                className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Innate Capability to Character */}
      {showAddInnateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="text-base font-bold">Vincular Capacidade Inata</h3>
            <p className="text-xs text-slate-400">
              Selecione uma capacidade inata de classe para vincular à ficha:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {innates.map((inn) => {
                const isLinked = activeChar.innateCapabilities.includes(inn.id);
                return (
                  <button
                    key={inn.id}
                    onClick={() => handleToggleInnateLink(inn.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition-all min-h-[48px] ${
                      isLinked
                        ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-slate-200">{inn.name}</span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {inn.className} · Caminho {inn.path}
                      </div>
                    </div>
                    <span className="text-xs font-bold font-mono">
                      {isLinked ? '✓ Vinculada' : '+ Vincular'}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAddInnateModal(false)}
                className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Rest Recovery */}
      {showRestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-purple-400" /> Descanso Conforme Manual
            </h3>
            <p className="text-xs text-slate-400">
              O manual especifica duração de <strong className="text-slate-200">Vida máxima / 6</strong> turnos e recuperação de <strong className="text-slate-200">(Inteligência + Vontade + Agilidade + Força) / 6</strong>.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div>Duração do Descanso: <span className="text-cyan-400">{calcRestRecovery().turns} turnos</span></div>
              <div>Recuperação Calculada: <span className="text-emerald-400">+{calcRestRecovery().heal} HP</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRestModal(false)}
                className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteRest}
                className="min-h-[44px] px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl"
              >
                Confirmar Descanso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: Consume Bio Recovery */}
      {showConsumeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-slate-100 shadow-2xl space-y-4">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Apple className="w-5 h-5 text-amber-400" /> Consumo de Planta / Animal
            </h3>
            <p className="text-xs text-slate-400">
              Fórmula original registrada: <strong className="text-slate-200 font-mono">Vida Total / (Vida / 3)</strong>.
            </p>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
              <div>Vida Atual: {activeChar?.hp.current} / {activeChar?.hp.max}</div>
              <div>Cura Projetada: <span className="text-emerald-400">+{calcConsumeRecovery()} HP</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowConsumeModal(false)}
                className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancelar
              </button>
              <button
                onClick={handleExecuteConsume}
                className="min-h-[44px] px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl"
              >
                Consumir e Recuperar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
