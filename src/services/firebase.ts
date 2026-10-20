import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import {
  UserProfile,
  Character,
  Campaign,
  SystemRule,
  Ability,
  InnateCapability,
  RPGClass,
  ClassRelation,
  SystemElement,
  CombatEncounter,
  CampaignMap
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_CLASS_RELATIONS,
  INITIAL_SYSTEM_ELEMENTS,
  INITIAL_SYSTEM_RULES,
  INITIAL_REFERENCE_ABILITY,
  INITIAL_INNATE_CAPABILITIES,
  INITIAL_CAMPAIGN,
  INITIAL_CHARACTERS
} from '../data/initialData';

// Firebase Client Configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    firestore = getFirestore(app);
    storage = getStorage(app);
  } catch (err) {
    console.warn('Erro ao inicializar Firebase. Alternando para adaptador local persistente.', err);
  }
}

export { auth, firestore, storage };

// Local Fallback Storage & Sync System
const STORAGE_PREFIX = 'rpg_system_';
const channel = typeof window !== 'undefined' ? new BroadcastChannel('rpg_system_sync') : null;

// Initial local state setup
function getInitialStore<T>(key: string, defaultData: T): T {
  if (typeof window === 'undefined') return defaultData;
  const item = localStorage.getItem(STORAGE_PREFIX + key);
  if (!item) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    return JSON.parse(item);
  } catch {
    return defaultData;
  }
}

function saveStore<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  if (channel) {
    channel.postMessage({ type: 'STORE_UPDATED', key, data });
  }
}

// Memory stores initialized
let localUsers: UserProfile[] = getInitialStore<UserProfile[]>('users', [
  {
    uid: 'user_master_1',
    email: 'mestre@rpgsystem.com',
    displayName: 'Mestre da Campanha',
    role: 'master',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user_player_1',
    email: 'jogador1@rpgsystem.com',
    displayName: 'Arthur (Jogador)',
    role: 'player',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'user_admin_1',
    email: 'admin@rpgsystem.com',
    displayName: 'Administrador Geral',
    role: 'admin',
    createdAt: new Date().toISOString()
  }
]);

let localActiveUser: UserProfile = getInitialStore<UserProfile>('active_user', localUsers[0]);
let localCampaigns: Campaign[] = getInitialStore<Campaign[]>('campaigns', [INITIAL_CAMPAIGN]);
let localCharacters: Character[] = getInitialStore<Character[]>('characters', INITIAL_CHARACTERS);
let localAbilities: Ability[] = getInitialStore<Ability[]>('abilities', [INITIAL_REFERENCE_ABILITY]);
let localInnates: InnateCapability[] = getInitialStore<InnateCapability[]>('innates', INITIAL_INNATE_CAPABILITIES);
let localSystemRules: SystemRule[] = getInitialStore<SystemRule[]>('system_rules', INITIAL_SYSTEM_RULES);
let localElements: SystemElement[] = getInitialStore<SystemElement[]>('elements', INITIAL_SYSTEM_ELEMENTS);
let localClasses: RPGClass[] = getInitialStore<RPGClass[]>('classes', INITIAL_CLASSES);
let localRelations: ClassRelation[] = getInitialStore<ClassRelation[]>('relations', INITIAL_CLASS_RELATIONS);
let localEncounters: CombatEncounter[] = getInitialStore<CombatEncounter[]>('encounters', [
  {
    id: 'enc_1',
    campaignId: INITIAL_CAMPAIGN.id,
    name: 'Confronto na Clareira dos Brotos',
    status: 'active',
    round: 1,
    activeTurnIndex: 0,
    terrain: 'Clareira de Mana Denso (Vegetal)',
    terrainEffect: 'Brotação de plantas acelerada. Custo de habilidades de Mana reduzido em 1 no centro.',
    participants: [
      {
        id: 'part_arthur',
        characterId: 'char_arthur',
        name: 'Arthur Pendelton',
        isPlayer: true,
        initiative: 18,
        currentHp: 30,
        maxHp: 30,
        currentEnergy: 30,
        maxEnergy: 30,
        actions: {
          corporal: { max: 1, used: 0 },
          mental: { max: 1, used: 0 },
          classe: { max: 1, used: 0 },
          reacao: { max: 1, used: 0, prepared: false }
        },
        conditions: []
      },
      {
        id: 'part_valeria',
        characterId: 'char_valeria',
        name: 'Valéria Krauss',
        isPlayer: true,
        initiative: 15,
        currentHp: 90,
        maxHp: 90,
        currentEnergy: 90,
        maxEnergy: 90,
        actions: {
          corporal: { max: 1, used: 0 },
          mental: { max: 1, used: 0 },
          classe: { max: 1, used: 0 },
          reacao: { max: 1, used: 0, prepared: false }
        },
        conditions: []
      },
      {
        id: 'part_lobo_mana',
        characterId: 'mob_lobo_1',
        name: 'Lobo de Mana Corrompido',
        isPlayer: false,
        initiative: 12,
        currentHp: 24,
        maxHp: 24,
        currentEnergy: 15,
        maxEnergy: 15,
        actions: {
          corporal: { max: 1, used: 0 },
          mental: { max: 1, used: 0 },
          classe: { max: 1, used: 0 },
          reacao: { max: 1, used: 0, prepared: false }
        },
        conditions: []
      }
    ],
    logs: [
      {
        id: 'l_1',
        timestamp: new Date().toISOString(),
        round: 1,
        participantName: 'Mestre',
        actionCategory: 'classe',
        description: 'Combate iniciado na Clareira dos Brotos. Ordem de iniciativa definida.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]);

let localMaps: CampaignMap[] = getInitialStore<CampaignMap[]>('maps', [
  {
    id: 'map_dungeon_1',
    campaignId: INITIAL_CAMPAIGN.id,
    name: 'Clareira Arcana & Ruínas Antigas',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    isGridEnabled: true,
    gridSize: 50,
    movementMode: 'grid',
    tokens: [
      {
        id: 'tok_arthur',
        mapId: 'map_dungeon_1',
        campaignId: INITIAL_CAMPAIGN.id,
        characterId: 'char_arthur',
        name: 'Arthur (Feiticeiro)',
        x: 25,
        y: 40,
        size: 1,
        color: '#3B82F6',
        isVisibleToPlayers: true,
        controlledByUserId: 'user_player_1',
        hpPercent: 100,
        type: 'character'
      },
      {
        id: 'tok_valeria',
        mapId: 'map_dungeon_1',
        campaignId: INITIAL_CAMPAIGN.id,
        characterId: 'char_valeria',
        name: 'Valéria (Guerreira)',
        x: 35,
        y: 45,
        size: 1,
        color: '#EF4444',
        isVisibleToPlayers: true,
        controlledByUserId: 'user_player_2',
        hpPercent: 100,
        type: 'character'
      },
      {
        id: 'tok_lobo',
        mapId: 'map_dungeon_1',
        campaignId: INITIAL_CAMPAIGN.id,
        name: 'Lobo de Mana',
        x: 60,
        y: 35,
        size: 1,
        color: '#A855F7',
        isVisibleToPlayers: true,
        hpPercent: 100,
        type: 'monster'
      },
      {
        id: 'tok_bau',
        mapId: 'map_dungeon_1',
        campaignId: INITIAL_CAMPAIGN.id,
        name: 'Baú Rúnico Trancado',
        x: 75,
        y: 20,
        size: 1,
        color: '#EAB308',
        isVisibleToPlayers: true,
        type: 'object'
      }
    ]
  }
]);

// Listeners registry for simulated real-time subscriptions
type Listener = (data: any) => void;
const subscribers = new Map<string, Set<Listener>>();

function notifySubscribers(collectionName: string, data: any) {
  const set = subscribers.get(collectionName);
  if (set) {
    set.forEach((cb) => cb(data));
  }
}

if (channel) {
  channel.onmessage = (event) => {
    if (event.data?.type === 'STORE_UPDATED') {
      const key = event.data.key;
      const data = event.data.data;
      if (key === 'characters') localCharacters = data;
      else if (key === 'campaigns') localCampaigns = data;
      else if (key === 'abilities') localAbilities = data;
      else if (key === 'innates') localInnates = data;
      else if (key === 'system_rules') localSystemRules = data;
      else if (key === 'encounters') localEncounters = data;
      else if (key === 'maps') localMaps = data;
      else if (key === 'elements') localElements = data;
      else if (key === 'classes') localClasses = data;
      else if (key === 'relations') localRelations = data;
      notifySubscribers(key, data);
    }
  };
}

// High-level Database Adapter (Firebase or Persistent Local Adapter)
export const dbService = {
  // Authentication & Current User
  getCurrentUser(): UserProfile {
    return localActiveUser;
  },

  getAllUsers(): UserProfile[] {
    return localUsers;
  },

  switchUser(userId: string): UserProfile {
    const user = localUsers.find((u) => u.uid === userId);
    if (user) {
      localActiveUser = user;
      saveStore('active_user', user);
      notifySubscribers('auth_user', user);
      return user;
    }
    return localActiveUser;
  },

  createUser(displayName: string, email: string, role: 'admin' | 'master' | 'player'): UserProfile {
    const newUser: UserProfile = {
      uid: 'user_' + Date.now(),
      email,
      displayName,
      role,
      createdAt: new Date().toISOString()
    };
    localUsers = [...localUsers, newUser];
    saveStore('users', localUsers);
    return this.switchUser(newUser.uid);
  },

  // Campaigns
  getCampaigns(): Campaign[] {
    return localCampaigns;
  },

  saveCampaign(campaign: Campaign): Campaign {
    const idx = localCampaigns.findIndex((c) => c.id === campaign.id);
    if (idx >= 0) {
      localCampaigns[idx] = { ...campaign, updatedAt: new Date().toISOString() };
    } else {
      localCampaigns = [...localCampaigns, campaign];
    }
    saveStore('campaigns', localCampaigns);
    notifySubscribers('campaigns', localCampaigns);
    return campaign;
  },

  // Characters
  getCharacters(campaignId?: string): Character[] {
    if (campaignId) {
      return localCharacters.filter((c) => c.campaignId === campaignId);
    }
    return localCharacters;
  },

  getCharacterById(id: string): Character | undefined {
    return localCharacters.find((c) => c.id === id);
  },

  saveCharacter(char: Character): Character {
    const updated = { ...char, updatedAt: new Date().toISOString() };
    const idx = localCharacters.findIndex((c) => c.id === char.id);
    if (idx >= 0) {
      localCharacters[idx] = updated;
    } else {
      localCharacters = [...localCharacters, updated];
    }
    saveStore('characters', localCharacters);
    notifySubscribers('characters', localCharacters);
    return updated;
  },

  deleteCharacter(id: string): void {
    localCharacters = localCharacters.filter((c) => c.id !== id);
    saveStore('characters', localCharacters);
    notifySubscribers('characters', localCharacters);
  },

  // Abilities (Grimório)
  getAbilities(): Ability[] {
    return localAbilities;
  },

  saveAbility(ability: Ability): Ability {
    const idx = localAbilities.findIndex((a) => a.id === ability.id);
    if (idx >= 0) {
      localAbilities[idx] = ability;
    } else {
      localAbilities = [...localAbilities, ability];
    }
    saveStore('abilities', localAbilities);
    notifySubscribers('abilities', localAbilities);
    return ability;
  },

  recordAbilityUsage(
    abilityId: string,
    characterId: string,
    characterName: string,
    cost: number,
    result: string,
    isHiddenEffect: boolean = false,
    hiddenMultiplier: number = 2
  ): { updatedAbility: Ability; didLevelUp: boolean } {
    const ability = localAbilities.find((a) => a.id === abilityId);
    if (!ability) throw new Error('Habilidade não encontrada');

    const increment = isHiddenEffect ? hiddenMultiplier : 1;
    let newUses = ability.usesCount + increment;
    let currentLevel = ability.currentLevel;
    let didLevelUp = false;

    // Progression rule:
    // L1 -> L2: 6
    // L2 -> L3: 12
    // L3 -> L4: 18
    // L4 -> L5: 36
    // L5 -> L6: 72
    const requirementsByLevel: Record<number, number> = {
      1: 6,
      2: 12,
      3: 18,
      4: 36,
      5: 72
    };

    const targetRequirement = requirementsByLevel[currentLevel] || 999;
    if (newUses >= targetRequirement && currentLevel < ability.maxLevel) {
      currentLevel += 1;
      newUses = newUses - targetRequirement;
      didLevelUp = true;
    }

    const updatedAbility: Ability = {
      ...ability,
      currentLevel,
      usesCount: newUses,
      usesToNextLevel: requirementsByLevel[currentLevel] || 0,
      history: [
        {
          date: new Date().toISOString(),
          characterId,
          characterName,
          level: currentLevel,
          cost,
          result: `${result} ${isHiddenEffect ? `(Efeito oculto x${hiddenMultiplier})` : ''}`
        },
        ...ability.history
      ]
    };

    this.saveAbility(updatedAbility);
    return { updatedAbility, didLevelUp };
  },

  // Innate Capabilities
  getInnates(): InnateCapability[] {
    return localInnates;
  },

  saveInnate(innate: InnateCapability): InnateCapability {
    const idx = localInnates.findIndex((i) => i.id === innate.id);
    if (idx >= 0) {
      localInnates[idx] = innate;
    } else {
      localInnates = [...localInnates, innate];
    }
    saveStore('innates', localInnates);
    notifySubscribers('innates', localInnates);
    return innate;
  },

  // System Rules (Pending Rules & Formulas)
  getSystemRules(): SystemRule[] {
    return localSystemRules;
  },

  saveSystemRule(rule: SystemRule): SystemRule {
    const idx = localSystemRules.findIndex((r) => r.id === rule.id);
    const updated = { ...rule, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      localSystemRules[idx] = updated;
    } else {
      localSystemRules = [...localSystemRules, updated];
    }
    saveStore('system_rules', localSystemRules);
    notifySubscribers('system_rules', localSystemRules);
    return updated;
  },

  // System Elements
  getSystemElements(): SystemElement[] {
    return localElements;
  },

  saveSystemElement(elem: SystemElement): SystemElement {
    const idx = localElements.findIndex((e) => e.id === elem.id);
    if (idx >= 0) {
      localElements[idx] = elem;
    } else {
      localElements = [...localElements, elem];
    }
    saveStore('elements', localElements);
    notifySubscribers('elements', localElements);
    return elem;
  },

  // Classes & Relations
  getClasses(): RPGClass[] {
    return localClasses;
  },

  saveClass(rpgClass: RPGClass): RPGClass {
    const idx = localClasses.findIndex((c) => c.id === rpgClass.id);
    if (idx >= 0) {
      localClasses[idx] = rpgClass;
    } else {
      localClasses = [...localClasses, rpgClass];
    }
    saveStore('classes', localClasses);
    notifySubscribers('classes', localClasses);
    return rpgClass;
  },

  getClassRelations(): ClassRelation[] {
    return localRelations;
  },

  saveClassRelation(relation: ClassRelation): ClassRelation {
    const idx = localRelations.findIndex((r) => r.id === relation.id);
    if (idx >= 0) {
      localRelations[idx] = relation;
    } else {
      localRelations = [...localRelations, relation];
    }
    saveStore('relations', localRelations);
    notifySubscribers('relations', localRelations);
    return relation;
  },

  // Combat Encounters
  getCombatEncounters(campaignId?: string): CombatEncounter[] {
    if (campaignId) {
      return localEncounters.filter((e) => e.campaignId === campaignId);
    }
    return localEncounters;
  },

  saveCombatEncounter(encounter: CombatEncounter): CombatEncounter {
    const idx = localEncounters.findIndex((e) => e.id === encounter.id);
    const updated = { ...encounter, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      localEncounters[idx] = updated;
    } else {
      localEncounters = [...localEncounters, updated];
    }
    saveStore('encounters', localEncounters);
    notifySubscribers('encounters', localEncounters);
    return updated;
  },

  // Maps & Tokens
  getMaps(campaignId?: string): CampaignMap[] {
    if (campaignId) {
      return localMaps.filter((m) => m.campaignId === campaignId);
    }
    return localMaps;
  },

  saveMap(map: CampaignMap): CampaignMap {
    const idx = localMaps.findIndex((m) => m.id === map.id);
    if (idx >= 0) {
      localMaps[idx] = map;
    } else {
      localMaps = [...localMaps, map];
    }
    saveStore('maps', localMaps);
    notifySubscribers('maps', localMaps);
    return map;
  },

  // Real-time Subscription Hook
  subscribe<T>(collectionKey: string, callback: (data: T) => void): () => void {
    if (!subscribers.has(collectionKey)) {
      subscribers.set(collectionKey, new Set());
    }
    subscribers.get(collectionKey)!.add(callback);

    // Initial push
    let initialData: any = null;
    if (collectionKey === 'characters') initialData = localCharacters;
    else if (collectionKey === 'campaigns') initialData = localCampaigns;
    else if (collectionKey === 'abilities') initialData = localAbilities;
    else if (collectionKey === 'innates') initialData = localInnates;
    else if (collectionKey === 'system_rules') initialData = localSystemRules;
    else if (collectionKey === 'encounters') initialData = localEncounters;
    else if (collectionKey === 'maps') initialData = localMaps;
    else if (collectionKey === 'elements') initialData = localElements;
    else if (collectionKey === 'classes') initialData = localClasses;
    else if (collectionKey === 'relations') initialData = localRelations;
    else if (collectionKey === 'auth_user') initialData = localActiveUser;

    if (initialData !== null) {
      callback(initialData as T);
    }

    return () => {
      subscribers.get(collectionKey)?.delete(callback);
    };
  },

  // Export full DB backup (JSON) for migration or Vercel production seeding
  exportDatabase(): string {
    return JSON.stringify(
      {
        users: localUsers,
        campaigns: localCampaigns,
        characters: localCharacters,
        abilities: localAbilities,
        innates: localInnates,
        system_rules: localSystemRules,
        elements: localElements,
        classes: localClasses,
        relations: localRelations,
        encounters: localEncounters,
        maps: localMaps,
        exportedAt: new Date().toISOString()
      },
      null,
      2
    );
  },

  // Reset to initial pristine rules
  resetToDefault(): void {
    localStorage.clear();
    localCampaigns = [INITIAL_CAMPAIGN];
    localCharacters = INITIAL_CHARACTERS;
    localAbilities = [INITIAL_REFERENCE_ABILITY];
    localInnates = INITIAL_INNATE_CAPABILITIES;
    localSystemRules = INITIAL_SYSTEM_RULES;
    localElements = INITIAL_SYSTEM_ELEMENTS;
    localClasses = INITIAL_CLASSES;
    localRelations = INITIAL_CLASS_RELATIONS;
    notifySubscribers('characters', localCharacters);
    notifySubscribers('campaigns', localCampaigns);
    notifySubscribers('system_rules', localSystemRules);
  }
};
