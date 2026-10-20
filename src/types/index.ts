export type UserRole = 'admin' | 'master' | 'player';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export type EnergyType = 'Física' | 'Mana' | 'Aura' | 'Neutra' | 'Prana' | 'Sistêmica' | 'Espiritual';

export type ArchetypeModel = 'humano' | 'humano_superior' | 'transcendente' | 'custom';

export interface CharacterAttribute {
  value: number;
  progression: string; // e.g. "{0/600}"
}

export interface CharacterAttributes {
  inteligencia: CharacterAttribute;
  forca: CharacterAttribute;
  vontade: CharacterAttribute;
  agilidade: CharacterAttribute;
}

export interface AcquiredClass {
  classId: string;
  level: number; // 1, 2, 3
  ruleChangesUnlocked: string[];
  advancedAttributesUnlocked: {
    defensive: boolean;
    offensive: boolean;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: 'arma' | 'armadura' | 'consumivel' | 'artefato' | 'material';
  quantity: number;
  weight?: number;
  energyAffinity?: EnergyType;
  isEquipped: boolean;
  properties?: Record<string, any>;
  icon?: string;
}

export interface DimensionalInventoryState {
  isOpen: boolean;
  orientation: 'horizontal' | 'vertical';
  slottedEnergy?: EnergyType;
  lastUsedTurn?: number;
  isLockedDueToForce?: boolean;
}

export interface CharacterCondition {
  id: string;
  name: string;
  type: 'negative' | 'positive' | 'neutral';
  description: string;
  durationTurn?: number;
  appliedTurn?: number;
  isPassive?: boolean;
}

export interface Character {
  id: string;
  campaignId: string;
  userId: string;
  name: string;
  archetype: ArchetypeModel;
  appearance: string;
  backstory: string;
  titles: string[];
  avatarUrl?: string;

  // HP & Energy
  hp: {
    current: number;
    max: number;
  };
  energia: {
    current: number;
    max: number;
    fome: number; // 1/3 of max
    sede: number; // 1/3 of max
    sono: number; // 1/3 of max
  };

  attributes: CharacterAttributes;
  acquiredClasses: AcquiredClass[];
  abilities: string[]; // Ability IDs
  innateCapabilities: string[]; // Innate Capability IDs
  items: InventoryItem[];
  dimensionalInventory: DimensionalInventoryState;
  conditions: CharacterCondition[];

  // Pending progression markers
  progressionPendingNotes: string; // e.g. "+0/6 por fase"
  actionLog: {
    id: string;
    timestamp: string;
    action: string;
    details: string;
  }[];

  createdAt: string;
  updatedAt: string;
}

export interface RPGClass {
  id: string;
  name: string;
  energy: EnergyType;
  basicAttributes: ['Força' | 'Inteligência' | 'Vontade' | 'Agilidade', 'Força' | 'Inteligência' | 'Vontade' | 'Agilidade'];
  classCapability: string;
  affinity: string;
  color: string;
  level1RuleChange: string;
  level2RuleChange: string;
  level3RuleChange?: string;
  advancedAttributes: {
    defensive: string;
    offensive: string;
  };
}

export interface ClassRelation {
  id: string;
  sourceClassId: string;
  targetClassIds: string[];
  heartColor: string;
  label: string;
  configuredMechanics?: string; // DM configured mechanical effect
}

export type AbilityCategory = 'Autoral' | 'Recompensa' | 'Requisito' | 'Monstro' | 'Personalizada';
export type ActivationType = 
  | 'Ativação simples'
  | 'Passiva'
  | 'Passiva condicional'
  | 'Ativa personalizável'
  | 'Ativa fixa ou de contrato'
  | 'Custo nulo adicional';

export interface Ability {
  id: string;
  name: string;
  description: string;
  energyType: EnergyType;
  category: AbilityCategory;
  activationType: ActivationType;
  currentLevel: number; // 1 to 6 (or up to 10 if confirmed)
  maxLevel: number; // default 6
  energyCost: number;
  requirements: string;
  applications: string;
  effects: string;
  duration: string;
  range: string;
  areaOfEffect: string;
  limitations: string;
  hiddenEffects?: string;
  usesCount: number;
  usesToNextLevel: number;
  isUnlockedByPlayer?: boolean;
  history: {
    date: string;
    characterId: string;
    characterName: string;
    level: number;
    cost: number;
    result: string;
  }[];
}

export interface InnateCapability {
  id: string;
  name: string;
  classId: string;
  className: string;
  energy: EnergyType;
  path: number; // 1, 2 (level 1-2) or 1..5 (level 3)
  level: number; // 1, 2, 3
  costOriginalFormula: string; // e.g. "{for/agi + (nível)d6}"
  costValidatedFormula?: string;
  isFormulaValidated: boolean;
  minimumAttributes: {
    inteligencia?: number;
    forca?: number;
    vontade?: number;
    agilidade?: number;
  };
  specialEffect: string;
  negativeCondition?: string;
  stepByStepDescription: string;
  parameters: {
    pressao?: string;
    velocidade?: string;
    dano?: string;
    precisao?: string;
    defesa?: string;
    alcance?: string;
    duracao?: string;
    controle?: string;
    intensidade?: string;
    [key: string]: string | undefined;
  };
  requirements: string;
  executionHistory: {
    date: string;
    characterId: string;
    characterName: string;
    result: string;
  }[];
}

export interface SystemElement {
  id: string;
  name: string;
  category: 'Sistêmica' | 'Neutra' | 'Mana' | 'Física' | 'Aura' | 'Prana';
  color: string;
  description: string;
  isPublished: boolean;
  sourceTextRef: string;
}

export interface SystemRule {
  id: string;
  name: string;
  originalDescription: string;
  originalFormula: string;
  validatedFormula: string;
  status: 'pendente' | 'validada' | 'desativada';
  validatedBy?: string;
  updatedAt: string;
  versionHistory: {
    date: string;
    editor: string;
    previousFormula: string;
    note: string;
  }[];
}

export interface SpecialSynergy {
  id: string;
  name: string;
  requiredParticipants: number;
  description: string;
  requirements: string[];
  recordedBonus: string;
  configuredDuration?: string;
  isActive?: boolean;
}

export type ActionCategory = 'corporal' | 'mental' | 'classe' | 'reacao';

export interface CombatParticipant {
  id: string;
  characterId: string;
  name: string;
  isPlayer: boolean;
  initiative: number;
  currentHp: number;
  maxHp: number;
  currentEnergy: number;
  maxEnergy: number;
  actions: {
    corporal: { max: number; used: number };
    mental: { max: number; used: number };
    classe: { max: number; used: number };
    reacao: { max: number; used: number; prepared: boolean };
  };
  conditions: CharacterCondition[];
  avatarUrl?: string;
}

export interface CombatEncounter {
  id: string;
  campaignId: string;
  name: string;
  status: 'planning' | 'active' | 'ended';
  round: number;
  activeTurnIndex: number;
  participants: CombatParticipant[];
  terrain: string;
  terrainEffect?: string;
  logs: {
    id: string;
    timestamp: string;
    round: number;
    participantName: string;
    actionCategory: ActionCategory;
    description: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface MapToken {
  id: string;
  mapId: string;
  campaignId: string;
  characterId?: string;
  name: string;
  x: number; // percentage 0-100 or grid coordinate
  y: number;
  size: number; // 1 = 1x1 cell, 2 = 2x2, etc.
  color: string;
  imageUrl?: string;
  isVisibleToPlayers: boolean;
  controlledByUserId?: string; // if null, DM only
  hpPercent?: number;
  type: 'character' | 'npc' | 'monster' | 'object' | 'marker';
}

export interface CampaignMap {
  id: string;
  campaignId: string;
  name: string;
  imageUrl: string;
  isGridEnabled: boolean;
  gridSize: number; // pixels per cell or percentage
  movementMode: 'free' | 'grid';
  tokens: MapToken[];
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  masterId: string;
  masterName: string;
  inviteCode: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MonsterNPC {
  id: string;
  campaignId: string;
  name: string;
  type: 'monster' | 'npc';
  hp: number;
  maxHp: number;
  energia: number;
  maxEnergia: number;
  inteligencia: number;
  forca: number;
  vontade: number;
  agilidade: number;
  abilities: string[];
  innates: string[];
  conditions: string[];
  description: string;
  createdBy: string;
  createdAt: string;
}
