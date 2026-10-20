import {
  RPGClass,
  ClassRelation,
  SystemElement,
  SystemRule,
  Ability,
  InnateCapability,
  SpecialSynergy,
  Campaign,
  Character
} from '../types';

export const INITIAL_CLASSES: RPGClass[] = [
  {
    id: 'guerreiro',
    name: 'Guerreiro',
    energy: 'Física',
    basicAttributes: ['Força', 'Agilidade'],
    classCapability: 'Movimentos',
    affinity: 'Material',
    color: '#EF4444',
    level1RuleChange: 'Reforço muscular',
    level2RuleChange: 'Mutação corporal',
    level3RuleChange: 'Pendente de validação pelo mestre',
    advancedAttributes: {
      defensive: 'Defesa corporal',
      offensive: 'Materializar componente'
    }
  },
  {
    id: 'feiticeiro',
    name: 'Feiticeiro',
    energy: 'Mana',
    basicAttributes: ['Inteligência', 'Vontade'],
    classCapability: 'Feitiços',
    affinity: 'Elemento',
    color: '#3B82F6',
    level1RuleChange: 'Noção mágica',
    level2RuleChange: 'Aprimoramento neural',
    level3RuleChange: 'Pendente de validação pelo mestre',
    advancedAttributes: {
      defensive: 'Resistência mental',
      offensive: 'Circuito de mana'
    }
  },
  {
    id: 'marcial',
    name: 'Marcial',
    energy: 'Aura',
    basicAttributes: ['Agilidade', 'Vontade'],
    classCapability: 'Técnicas',
    affinity: 'Estado',
    color: '#F97316',
    level1RuleChange: 'Mente estável',
    level2RuleChange: 'Despertar sensorial',
    level3RuleChange: 'Pendente de validação pelo mestre',
    advancedAttributes: {
      defensive: 'Absorção de impacto',
      offensive: 'Adaptação circunstancial'
    }
  },
  {
    id: 'entidade',
    name: 'Entidade',
    energy: 'Neutra',
    basicAttributes: ['Força', 'Vontade'],
    classCapability: 'Regras',
    affinity: 'Conceito',
    color: '#94A3B8',
    level1RuleChange: 'Natureza anômala',
    level2RuleChange: 'Estado vibratório',
    level3RuleChange: 'Pendente de validação pelo mestre',
    advancedAttributes: {
      defensive: 'Distorção de fluxo',
      offensive: 'Interferência de ambiente'
    }
  },
  {
    id: 'espirito',
    name: 'Espírito',
    energy: 'Prana',
    basicAttributes: ['Força', 'Inteligência'],
    classCapability: 'Manifestações',
    affinity: 'Plano',
    color: '#EAB308',
    level1RuleChange: 'Ciclo astral',
    level2RuleChange: 'Incorporação etérea',
    level3RuleChange: 'Pendente de validação pelo mestre',
    advancedAttributes: {
      defensive: 'Regeneração',
      offensive: 'Intangibilidade material'
    }
  }
];

export const INITIAL_CLASS_RELATIONS: ClassRelation[] = [
  {
    id: 'rel_entidade',
    sourceClassId: 'entidade',
    targetClassIds: ['espirito', 'guerreiro'],
    heartColor: '#94A3B8', // cinza
    label: 'Coração Cinza',
    configuredMechanics: 'Pendente de configuração pelo mestre (não interpreta vantagem/fraqueza automaticamente)'
  },
  {
    id: 'rel_feiticeiro',
    sourceClassId: 'feiticeiro',
    targetClassIds: ['entidade', 'marcial'],
    heartColor: '#3B82F6', // azul
    label: 'Coração Azul',
    configuredMechanics: 'Pendente de configuração pelo mestre (não interpreta vantagem/fraqueza automaticamente)'
  },
  {
    id: 'rel_guerreiro',
    sourceClassId: 'guerreiro',
    targetClassIds: ['feiticeiro', 'espirito'],
    heartColor: '#EF4444', // vermelho
    label: 'Coração Vermelho',
    configuredMechanics: 'Pendente de configuração pelo mestre (não interpreta vantagem/fraqueza automaticamente)'
  },
  {
    id: 'rel_marcial',
    sourceClassId: 'marcial',
    targetClassIds: ['guerreiro', 'entidade'],
    heartColor: '#F97316', // laranja
    label: 'Coração Laranja',
    configuredMechanics: 'Pendente de configuração pelo mestre (não interpreta vantagem/fraqueza automaticamente)'
  },
  {
    id: 'rel_espirito',
    sourceClassId: 'espirito',
    targetClassIds: ['marcial', 'feiticeiro'],
    heartColor: '#EAB308', // amarelo
    label: 'Coração Amarelo',
    configuredMechanics: 'Pendente de configuração pelo mestre (não interpreta vantagem/fraqueza automaticamente)'
  }
];

export const INITIAL_SYSTEM_ELEMENTS: SystemElement[] = [
  // Centro: Sistêmica — ciano
  { id: 'el_aflicao', name: 'Aflição', category: 'Sistêmica', color: '#06B6D4', description: 'Manifestação sistêmica de aflição e estados adversos.', isPublished: true, sourceTextRef: 'Manual - Centro Sistêmica' },
  { id: 'el_acao', name: 'Ação', category: 'Sistêmica', color: '#06B6D4', description: 'Catalisador de ações e movimentos do sistema.', isPublished: true, sourceTextRef: 'Manual - Centro Sistêmica' },
  { id: 'el_interacao', name: 'Interação', category: 'Sistêmica', color: '#06B6D4', description: 'Fator de permuta e contato entre elementos.', isPublished: true, sourceTextRef: 'Manual - Centro Sistêmica' },
  { id: 'el_conversao', name: 'Conversão', category: 'Sistêmica', color: '#06B6D4', description: 'Transmutação de um estado ou energia em outro.', isPublished: true, sourceTextRef: 'Manual - Centro Sistêmica' },
  { id: 'el_combinacao', name: 'Combinação', category: 'Sistêmica', color: '#06B6D4', description: 'Junção de múltiplos fatores ou frequências.', isPublished: true, sourceTextRef: 'Manual - Centro Sistêmica' },
  { id: 'el_ativacao', name: 'Ativação', category: 'Sistêmica', color: '#06B6D4', description: 'Ignição e liberação de potencial latente.', isPublished: true, sourceTextRef: 'Manual - Centro Sistêmica' },

  // Neutra — cinza
  { id: 'el_propagacao', name: 'Propagação', category: 'Neutra', color: '#94A3B8', description: 'Dispersão de influência neutra pelo meio.', isPublished: true, sourceTextRef: 'Manual - Neutra' },
  { id: 'el_reverberacao', name: 'Reverberação', category: 'Neutra', color: '#94A3B8', description: 'Eco ressonante de ondas e regras conceituais.', isPublished: true, sourceTextRef: 'Manual - Neutra' },
  { id: 'el_perpetuacao', name: 'Perpetuação', category: 'Neutra', color: '#94A3B8', description: 'Manutenção e extensão temporal de estados.', isPublished: true, sourceTextRef: 'Manual - Neutra' },
  { id: 'el_transmissao', name: 'Transmissão', category: 'Neutra', color: '#94A3B8', description: 'Passagem direta de sinais ou forças.', isPublished: true, sourceTextRef: 'Manual - Neutra' },
  { id: 'el_intervencao', name: 'Intervenção', category: 'Neutra', color: '#94A3B8', description: 'Ruptura pontual da ordem do ambiente.', isPublished: true, sourceTextRef: 'Manual - Neutra' },
  { id: 'el_assimilacao', name: 'Assimilação', category: 'Neutra', color: '#94A3B8', description: 'Incorporação de conceitos externos à entidade.', isPublished: true, sourceTextRef: 'Manual - Neutra' },

  // Mana — azul
  { id: 'el_radiacao', name: 'Radiação', category: 'Mana', color: '#3B82F6', description: 'Emissão contínua de ondas arcanas.', isPublished: true, sourceTextRef: 'Manual - Mana' },
  { id: 'el_aceleracao', name: 'Aceleracão', category: 'Mana', color: '#3B82F6', description: 'Incremento na velocidade de fluxo de feitiços.', isPublished: true, sourceTextRef: 'Manual - Mana' },
  { id: 'el_sintetizacao', name: 'Sintetização', category: 'Mana', color: '#3B82F6', description: 'Fusão de componentes mágicos puros.', isPublished: true, sourceTextRef: 'Manual - Mana' },
  { id: 'el_adsorcao', name: 'Adsorção', category: 'Mana', color: '#3B82F6', description: 'Aderência superficial de partículas de mana.', isPublished: true, sourceTextRef: 'Manual - Mana' },
  { id: 'el_conservacao', name: 'Conservação', category: 'Mana', color: '#3B82F6', description: 'Preservação de densidade de circuitos arcanos.', isPublished: true, sourceTextRef: 'Manual - Mana' },
  { id: 'el_sintonizacao', name: 'Sintonização', category: 'Mana', color: '#3B82F6', description: 'Alinhamento fino com elementos naturais.', isPublished: true, sourceTextRef: 'Manual - Mana' },

  // Física — vermelho
  { id: 'el_deterioracao', name: 'Deterioração', category: 'Física', color: '#EF4444', description: 'Desgaste e destruição estrutural física.', isPublished: true, sourceTextRef: 'Manual - Física' },
  { id: 'el_concentracao', name: 'Concentração', category: 'Física', color: '#EF4444', description: 'Adensamento de massa muscular ou matéria.', isPublished: true, sourceTextRef: 'Manual - Física' },
  { id: 'el_pressurizacao', name: 'Pressurização', category: 'Física', color: '#EF4444', description: 'Acúmulo de tensão cinética.', isPublished: true, sourceTextRef: 'Manual - Física' },
  { id: 'el_sustentacao', name: 'Sustentação', category: 'Física', color: '#EF4444', description: 'Resistência estática e apoio estrutural.', isPublished: true, sourceTextRef: 'Manual - Física' },
  { id: 'el_transicao', name: 'Transição', category: 'Física', color: '#EF4444', description: 'Transferência de impacto ou vetor mecânico.', isPublished: true, sourceTextRef: 'Manual - Física' },
  { id: 'el_recomposicao', name: 'Recomposição', category: 'Física', color: '#EF4444', description: 'Recuperação e realinhamento de tecidos.', isPublished: true, sourceTextRef: 'Manual - Física' },

  // Aura — laranja
  { id: 'el_aquisicao', name: 'Aquisição', category: 'Aura', color: '#F97316', description: 'Atração e acúmulo de aura circundante.', isPublished: true, sourceTextRef: 'Manual - Aura' },
  { id: 'el_circulacao', name: 'Circulação', category: 'Aura', color: '#F97316', description: 'Fluxo contínuo pelos nós marciais do corpo.', isPublished: true, sourceTextRef: 'Manual - Aura' },
  { id: 'el_impulsao', name: 'Impulsão', category: 'Aura', color: '#F97316', description: 'Explosão de impulso para técnicas de combate.', isPublished: true, sourceTextRef: 'Manual - Aura' },
  { id: 'el_agregacao', name: 'Agregação', category: 'Aura', color: '#F97316', description: 'Solidificação temporária da aura defensiva.', isPublished: true, sourceTextRef: 'Manual - Aura' },
  { id: 'el_deplecao', name: 'Depleção', category: 'Aura', color: '#F97316', description: 'Gasto voluntário rápido de reservas.', isPublished: true, sourceTextRef: 'Manual - Aura' },
  { id: 'el_emissao', name: 'Emissão', category: 'Aura', color: '#F97316', description: 'Projeção externa de ondas marciais.', isPublished: true, sourceTextRef: 'Manual - Aura' },

  // Prana — amarelo (Preservando a grafia original "Condesação")
  { id: 'el_supressao', name: 'Supressão', category: 'Prana', color: '#EAB308', description: 'Inibição de manifestações espirituais rivais.', isPublished: true, sourceTextRef: 'Manual - Prana' },
  { id: 'el_condesacao', name: 'Condesação', category: 'Prana', color: '#EAB308', description: 'Grafia original do manual para condensação de prana.', isPublished: true, sourceTextRef: 'Manual - Prana' },
  { id: 'el_conexao', name: 'Conexão', category: 'Prana', color: '#EAB308', description: 'Vínculo planar entre almas e entidades.', isPublished: true, sourceTextRef: 'Manual - Prana' },
  { id: 'el_potencializacao', name: 'Potencialização', category: 'Prana', color: '#EAB308', description: 'Exaltação da força espiritual pura.', isPublished: true, sourceTextRef: 'Manual - Prana' },
  { id: 'el_canalizacao', name: 'Canalização', category: 'Prana', color: '#EAB308', description: 'Direcionamento focal de prana etéreo.', isPublished: true, sourceTextRef: 'Manual - Prana' },
  { id: 'el_irradiacao', name: 'Irradiação', category: 'Prana', color: '#EAB308', description: 'Brilho planar e purificação de ambiente.', isPublished: true, sourceTextRef: 'Manual - Prana' }
];

export const INITIAL_SYSTEM_RULES: SystemRule[] = [
  {
    id: 'rule_1_custo_inatas',
    name: '1. Interpretação das fórmulas de custo das capacidades inatas',
    originalDescription: 'As fórmulas de custo apresentam uma barra entre dois atributos (ex: {for/agi + (nível)d6}). A interpretação da operação (divisão, menor valor, média, ou soma ponderada) não foi confirmada.',
    originalFormula: '{for/agi + (nível)d6}',
    validatedFormula: 'Math.floor(forca / Math.max(1, agilidade)) + (nivel * 3)',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: [
      {
        date: new Date().toISOString(),
        editor: 'Sistema (Inicial)',
        previousFormula: '{for/agi + (nível)d6}',
        note: 'Cadastrada como pendente de definição pelo mestre.'
      }
    ]
  },
  {
    id: 'rule_2_poder_final_lvl10',
    name: '2. Relação definitiva entre o Poder Final do nível 6 e aplicação no nível 10',
    originalDescription: 'No nível 6 a habilidade alcança o Poder Final. Há também menção a uma aplicação mais forte no nível 10, mas a hierarquia e continuidade não foram estabelecidas.',
    originalFormula: 'Nível 6 = Poder Final; Nível 10 = Aplicação Suprema (Relação pendente)',
    validatedFormula: 'maxLevel = 6; allowLevel10SpecialUnlock = false;',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_3_recuperacao_consumo',
    name: '3. Fórmula exata para recuperação de energia por consumo',
    originalDescription: 'Consumir parte de planta ou animal usa a fórmula original registrada: Vida Total / (Vida / 3). A expressão possui ambiguidade matemática se Vida for baixa.',
    originalFormula: 'Vida Total / (Vida / 3)',
    validatedFormula: 'Math.round(maxHp / Math.max(1, currentHp / 3))',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_4_acoes_turno',
    name: '4. Cálculo exato da quantidade de ações por turno',
    originalDescription: 'O combate distingue ações corporais, ações mentais e ações de classe. A quantidade padrão para cada categoria aguarda confirmação.',
    originalFormula: 'Corporais: [Pendente], Mentais: [Pendente], Classe: [Pendente]',
    validatedFormula: 'corporal: 1, mental: 1, classe: 1, reacao: 1',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_5_simbolos_sinergia',
    name: '5. Significado dos símbolos ° e * nos bônus de sinergia',
    originalDescription: 'Bônus de sinergia utilizam símbolos originais como 2d6°, 1d6° + 6*, 12*, 18*. A operação matemática (crítico, dano puro, acúmulo) não foi informada.',
    originalFormula: 'Feiticeiro: 2d6° | Marcial: 1d6° + 6* | Guerreiro: 12* | Espírito: 2d6° ou 12* | Entidade: 18*',
    validatedFormula: 'Exibir notação original preservada; rolagem padrão quando solicitada pelo mestre.',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_6_inventario_dimensional',
    name: '6. Interpretação matemática da distância e repetições do inventário',
    originalDescription: 'Plataforma: 1 metro a cada 24 Int. Teleporte: Força >= 18 permite fechar/reabrir sem custo, +1 repetição a cada 12 Vontade. Arredondamentos aguardam definição.',
    originalFormula: 'Plataforma: Inteligência / 24 m | Teleporte: 1 + floor(Vontade / 12)',
    validatedFormula: 'distancia = Math.floor(inteligencia / 24); teleportes = 1 + Math.floor(vontade / 12);',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_7_consumo_energia_tripartida',
    name: '7. Regras completas de consumo e recuperação de energia (Fome, Sede, Sono)',
    originalDescription: 'A energia é dividida em três partes (Fome, Sede, Sono), cada uma valendo 1/3. Falta de suprimento dobra consumo de energia. O cálculo gradual é pendente.',
    originalFormula: 'Energia = (Fome + Sede + Sono). Consumo dobro sob privação.',
    validatedFormula: 'consumo = baseConsumo * (privacao ? 2 : 1)',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_8_sinergia_participantes',
    name: '8. Cálculo dos bônus básicos de sinergia conforme quantidade de participantes',
    originalDescription: 'Quantidade de participantes e 3 fatores compartilhados (armas com mesmo efeito, caminhos iguais, habilidades com mesma energia/categoria) aguardam fórmula numérica.',
    originalFormula: 'Fatores: (Armas) + (Caminhos) + (Habilidades) * N participantes',
    validatedFormula: 'fatorContagem = participantes.length >= 2 ? participantes.length : 0',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  },
  {
    id: 'rule_9_progressao_atributos_fase',
    name: '9. Regras de progressão dos atributos {0/600} e indicação +0/6 por fase',
    originalDescription: 'O marcador {0/600} e o modelo Humano com "+0/6 por fase" em Vida e Energia são mantidos como regras configuráveis sem dedução automática de XP universal.',
    originalFormula: 'Atributos: {atual/600} | Vida/Energia: +0/6 por fase',
    validatedFormula: 'Exibição como requisito de marcos sem conversão forçada.',
    status: 'pendente',
    validatedBy: 'Mestre da Campanha',
    updatedAt: new Date().toISOString(),
    versionHistory: []
  }
];

export const INITIAL_REFERENCE_ABILITY: Ability = {
  id: 'grama_azul_prateada',
  name: 'Grama Azul Prateada',
  description: 'Produz brotos de grama azul prateada dentro de um raio de 5 metros. Pode manipular o crescimento das vinhas e formar estruturas. Possui aplicações específicas nos níveis 2 e 5. A descrição original menciona absorção de energia e dano no nível máximo.',
  energyType: 'Mana',
  category: 'Recompensa',
  activationType: 'Ativação simples',
  currentLevel: 1,
  maxLevel: 6,
  energyCost: 12,
  requirements: 'Afinidade com Mana ou Elemento Vegetal',
  applications: 'Nível 1: Brotos básicos e amarras leves. Nível 2: Estruturas defensivas de vinhas densas. Nível 5: Vinhas de alta elasticidade e condução de energia.',
  effects: 'Quantidade inicial de brotos gerados: resultado de d10 + 10 conforme o texto original. Manipulação e confinamento.',
  duration: '3 turnos ou até destruição das vinhas',
  range: '5 metros de raio',
  areaOfEffect: 'Esfera com centro no conjurador',
  limitations: 'Vulnerável ao fogo físico intenso e cortes contínuos',
  hiddenEffects: 'No nível máximo: Dreno gradual de energia de alvos presos e conversão em dano persistente.',
  usesCount: 0,
  usesToNextLevel: 6,
  history: []
};

export const INITIAL_INNATE_CAPABILITIES: InnateCapability[] = [
  {
    id: 'inata_guerreiro_1',
    name: 'Impulso Muscular Esmagador',
    classId: 'guerreiro',
    className: 'Guerreiro',
    energy: 'Física',
    path: 1,
    level: 1,
    costOriginalFormula: '{for/agi + (nível)d6}',
    costValidatedFormula: 'forca / agilidade + 1d6',
    isFormulaValidated: false,
    minimumAttributes: { forca: 8, agilidade: 6 },
    specialEffect: 'Concentre a tensão muscular num único vetor linear, projetando o corpo e impactando com pressão maciça.',
    negativeCondition: 'Exaustão nas articulações se falhar o teste de sustentação.',
    stepByStepDescription: '1. Acumule energia física nas pernas. 2. Dispare em linha reta de até 6 metros. 3. Desfira o golpe na área de impacto.',
    parameters: {
      pressao: 'Alta',
      velocidade: 'Explosiva',
      dano: 'Base corporal + bônus de impacto',
      precisao: 'Normal',
      defesa: 'Nula durante o salto'
    },
    requirements: 'Acesso à classe Guerreiro Nível 1',
    executionHistory: []
  },
  {
    id: 'inata_feiticeiro_1',
    name: 'Lampejo de Circuito Astral',
    classId: 'feiticeiro',
    className: 'Feiticeiro',
    energy: 'Mana',
    path: 1,
    level: 1,
    costOriginalFormula: '{int/von + (nível)d6}',
    costValidatedFormula: 'inteligencia / vontade + 1d6',
    isFormulaValidated: false,
    minimumAttributes: { inteligencia: 14, vontade: 8 },
    specialEffect: 'Condução imediata de partículas arcanas através das sinapses neurais para sobrecarregar a barreira do alvo.',
    negativeCondition: 'Sobrecarga mental passageira se a mana for interrompida.',
    stepByStepDescription: '1. Visualize o circuito mana interno. 2. Libere um raio condensado pelos dedos.',
    parameters: {
      pressao: 'Média',
      velocidade: 'Instantânea',
      dano: 'Dano de mana puro',
      precisao: 'Alta',
      alcance: '15 metros'
    },
    requirements: 'Acesso à classe Feiticeiro Nível 1',
    executionHistory: []
  },
  {
    id: 'inata_marcial_1',
    name: 'Pulso de Vácuo Aurático',
    classId: 'marcial',
    className: 'Marcial',
    energy: 'Aura',
    path: 1,
    level: 1,
    costOriginalFormula: '{von/agi + (nível)d6}',
    costValidatedFormula: 'vontade / agilidade + 1d6',
    isFormulaValidated: false,
    minimumAttributes: { agilidade: 10, vontade: 10 },
    specialEffect: 'Condensa a aura na palma da mão e descarrega um sopro cinético de choque.',
    negativeCondition: 'Instabilidade na respiração por 1 turno se bloqueado por barreira física.',
    stepByStepDescription: '1. Respire fundo retendo a aura. 2. Expulse o ar com golpe de palma aberta.',
    parameters: {
      pressao: 'Muito Alta',
      velocidade: 'Sônica',
      dano: 'Impacto contundente de onda de choque',
      precisao: 'Extrema'
    },
    requirements: 'Acesso à classe Marcial Nível 1',
    executionHistory: []
  },
  {
    id: 'inata_entidade_1',
    name: 'Distorção de Fronteira Espacial',
    classId: 'entidade',
    className: 'Entidade',
    energy: 'Neutra',
    path: 1,
    level: 1,
    costOriginalFormula: '{for/von + (nível)d6}',
    costValidatedFormula: 'forca / vontade + 1d6',
    isFormulaValidated: false,
    minimumAttributes: { forca: 8, vontade: 12 },
    specialEffect: 'Impõe uma regra transitória que dobra a distância percebida pelo agressor.',
    negativeCondition: 'Deslocamento dimensional involuntário de 1 metro.',
    stepByStepDescription: '1. Fixe o olhar no vetor de aproximação. 2. Proclame a regra de afastamento.',
    parameters: {
      pressao: 'Gravitacional',
      defesa: 'Desvio absoluto de projéteis lineares',
      duracao: '1 turno'
    },
    requirements: 'Acesso à classe Entidade Nível 1',
    executionHistory: []
  },
  {
    id: 'inata_espirito_1',
    name: 'Lampejo Prânico Restaurador',
    classId: 'espirito',
    className: 'Espírito',
    energy: 'Prana',
    path: 1,
    level: 1,
    costOriginalFormula: '{int/for + (nível)d6}',
    costValidatedFormula: 'inteligencia / forca + 1d6',
    isFormulaValidated: false,
    minimumAttributes: { inteligencia: 12, forca: 8 },
    specialEffect: 'Conecta o plano etéreo ao plano corporal para remendar tecidos dilacerados.',
    negativeCondition: 'Desgaste da densidade da alma se executado com energia abaixo de 6.',
    stepByStepDescription: '1. Entoe a frequência do plano espiritual. 2. Toque o ponto vital ferido.',
    parameters: {
      intensidade: 'Purificadora',
      dano: 'Cura equivalente ao resultado de Prana',
      duracao: 'Instantânea'
    },
    requirements: 'Acesso à classe Espírito Nível 1',
    executionHistory: []
  }
];

export const INITIAL_SPECIAL_SYNERGIES: SpecialSynergy[] = [
  {
    id: 'synergy_3_espias_demais',
    name: '3 Espias Demais',
    requiredParticipants: 3,
    description: 'Requer três seres em sinergia. Permite uma vez a sinergia por um turno após utilizar uma inata de mesma tendência (ex: todas ofensivas ou todas defensivas). Habilidades com mesma energia e inatas de mesma tendência.',
    requirements: [
      'Exatamente 3 participantes aliados em combate',
      'Uso prévio de Inata com mesma tendência (Ataque ou Defesa)',
      'Habilidades ativas alinhadas com a mesma frequência de energia'
    ],
    recordedBonus: '1 ativação coordenada de sinergia durante 1 turno',
    configuredDuration: '1 turno',
    isActive: false
  },
  {
    id: 'synergy_my_besto_friendo',
    name: 'My Besto Friendo',
    requiredParticipants: 2,
    description: 'Requer dois seres em sinergia. Envolve caminhos opostos nas respectivas classes. Requer condição negativa igual adquirida no mesmo turno. Exige afinidades anti-horária e horária à classe, uma para cada participante. Duração: duas vezes a duração normal enquanto a condição negativa permanecer ativa.',
    requirements: [
      'Exatamente 2 participantes aliados em combate',
      'Caminhos opostos nas respectivas classes',
      'Mesma condição negativa recebida no mesmo turno',
      'Afinidades complementares (uma no sentido anti-horário e outra horária ao diagrama)'
    ],
    recordedBonus: 'Duração duplicada (2x) enquanto a condição negativa perdurar',
    configuredDuration: '2x duração da condição negativa compartilhada',
    isActive: false
  },
  {
    id: 'synergy_sung_jin_woo',
    name: 'Sung Jin-Woo',
    requiredParticipants: 1,
    description: 'Requer um ser em sinergia individual extrema. A duração indicada é quatro vezes (4x) a duração normal. Condições originais: uso de energia da classe no terreno correspondente, condições recebidas, abate de monstro, item equipado aprimorado pela afinidade, utilização de habilidades e ativação de características de outras energias.',
    requirements: [
      '1 participante solitário em ressonância com o terreno',
      'Combate contra monstros em terreno com energia correspondente',
      'Pelo menos 1 monstro abatido no encontro',
      'Item equipado aprimorado com afinidade de classe',
      'Ativação combinada de característica de energia secundária'
    ],
    recordedBonus: 'Duração quadruplicada (4x) e ativação de soberania no terreno',
    configuredDuration: '4x duração normal',
    isActive: false
  }
];

export const INITIAL_ARCHETYPES = {
  humano: {
    name: 'Humano',
    hp: { current: 30, max: 30 },
    energia: { current: 30, max: 30, fome: 10, sede: 10, sono: 10 },
    attributes: {
      inteligencia: { value: 12, progression: '{0/600}' },
      forca: { value: 6, progression: '{0/600}' },
      vontade: { value: 6, progression: '{0/600}' },
      agilidade: { value: 6, progression: '{0/600}' }
    },
    progressionPendingNotes: '+0/6 por fase (regra pendente de confirmação)'
  },
  humano_superior: {
    name: 'Humano Superior — ARENA',
    hp: { current: 90, max: 90 },
    energia: { current: 90, max: 90, fome: 30, sede: 30, sono: 30 },
    attributes: {
      inteligencia: { value: 36, progression: '{0/600}' },
      forca: { value: 18, progression: '{0/600}' },
      vontade: { value: 18, progression: '{0/600}' },
      agilidade: { value: 18, progression: '{0/600}' }
    },
    progressionPendingNotes: 'Modelo de Combate ARENA'
  },
  transcendente: {
    name: 'Transcendente — 1x1',
    hp: { current: 180, max: 180 },
    energia: { current: 180, max: 180, fome: 60, sede: 60, sono: 60 },
    attributes: {
      inteligencia: { value: 72, progression: '{0/600}' },
      forca: { value: 36, progression: '{0/600}' },
      vontade: { value: 36, progression: '{0/600}' },
      agilidade: { value: 36, progression: '{0/600}' }
    },
    progressionPendingNotes: 'Modelo de Duelo 1x1'
  }
};

export const INITIAL_CAMPAIGN: Campaign = {
  id: 'campanha_cronicas_etereas',
  name: 'Crônicas do Despertar Eéreo',
  description: 'Mundo onde as cinco energias (Física, Mana, Aura, Neutra e Prana) regem as regras da realidade. Exploração da Dungeon Central e arenas de combate.',
  masterId: 'user_master_1',
  masterName: 'Mestre Arcano',
  inviteCode: 'ETHEREA-77',
  isPublic: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char_arthur',
    campaignId: 'campanha_cronicas_etereas',
    userId: 'user_player_1',
    name: 'Arthur Pendelton',
    archetype: 'humano',
    appearance: 'Cabelos castanhos, manto azul escuro de aprendiz com runas de mana bordadas em prata nas mangas.',
    backstory: 'Sobrevivente de uma incursão acidental na fenda de mana. Desenvolveu afinidade precoce com o controle de vinhas azuis.',
    titles: ['Iniciado do Grimório', 'Desbravador do Jardim Astral'],
    hp: { current: 30, max: 30 },
    energia: { current: 30, max: 30, fome: 10, sede: 10, sono: 10 },
    attributes: {
      inteligencia: { value: 12, progression: '{140/600}' },
      forca: { value: 6, progression: '{20/600}' },
      vontade: { value: 6, progression: '{65/600}' },
      agilidade: { value: 6, progression: '{40/600}' }
    },
    acquiredClasses: [
      {
        classId: 'feiticeiro',
        level: 1,
        ruleChangesUnlocked: ['Noção mágica'],
        advancedAttributesUnlocked: {
          defensive: true,
          offensive: true
        }
      }
    ],
    abilities: ['grama_azul_prateada'],
    innateCapabilities: ['inata_feiticeiro_1'],
    items: [
      {
        id: 'item_1',
        name: 'Cajado de Madeira Fluvial',
        description: 'Madeira flexível colhida nas margens do Lago Prismático. Conduz fluxo de mana.',
        category: 'arma',
        quantity: 1,
        isEquipped: true,
        energyAffinity: 'Mana'
      },
      {
        id: 'item_2',
        name: 'Erva de Condesação Seca',
        description: 'Ramo seco que auxilia na recuperação de prana.',
        category: 'consumivel',
        quantity: 3,
        isEquipped: false,
        energyAffinity: 'Prana'
      },
      {
        id: 'item_3',
        name: 'Placa Protetora de Couro Reforçado',
        description: 'Armadura leve que não obstrui o inventário dimensional.',
        category: 'armadura',
        quantity: 1,
        isEquipped: true,
        energyAffinity: 'Física'
      }
    ],
    dimensionalInventory: {
      isOpen: false,
      orientation: 'horizontal',
      slottedEnergy: 'Mana',
      lastUsedTurn: 0,
      isLockedDueToForce: false
    },
    conditions: [],
    progressionPendingNotes: '+0/6 por fase (regra pendente de confirmação)',
    actionLog: [
      {
        id: 'log_1',
        timestamp: new Date().toISOString(),
        action: 'Criação da Ficha',
        details: 'Ficha inicial Humano gerada com 30 HP e 30 Energia.'
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'char_valeria',
    campaignId: 'campanha_cronicas_etereas',
    userId: 'user_player_2',
    name: 'Valéria Krauss',
    archetype: 'humano_superior',
    appearance: 'Guerreira de compleição atlética com armadura carmesim e cicatrizes de combate na arena.',
    backstory: 'Campeã da Arena dos Três Rios. Dominou a transição da musculatura física e absorção de choque.',
    titles: ['Gladiadora Rubra', 'Quebradora de Vontades'],
    hp: { current: 90, max: 90 },
    energia: { current: 90, max: 90, fome: 30, sede: 30, sono: 30 },
    attributes: {
      inteligencia: { value: 36, progression: '{310/600}' },
      forca: { value: 18, progression: '{520/600}' },
      vontade: { value: 18, progression: '{400/600}' },
      agilidade: { value: 18, progression: '{490/600}' }
    },
    acquiredClasses: [
      {
        classId: 'guerreiro',
        level: 2,
        ruleChangesUnlocked: ['Reforço muscular', 'Mutação corporal'],
        advancedAttributesUnlocked: {
          defensive: true,
          offensive: true
        }
      },
      {
        classId: 'marcial',
        level: 1,
        ruleChangesUnlocked: ['Mente estável'],
        advancedAttributesUnlocked: {
          defensive: true,
          offensive: false
        }
      }
    ],
    abilities: [],
    innateCapabilities: ['inata_guerreiro_1', 'inata_marcial_1'],
    items: [
      {
        id: 'item_val_1',
        name: 'Lança de Liga Sanguínea',
        description: 'Forjada com infusão contínua de energia física concentrada.',
        category: 'arma',
        quantity: 1,
        isEquipped: true,
        energyAffinity: 'Física'
      }
    ],
    dimensionalInventory: {
      isOpen: false,
      orientation: 'vertical',
      slottedEnergy: 'Física',
      lastUsedTurn: 0,
      isLockedDueToForce: false
    },
    conditions: [],
    progressionPendingNotes: 'Modelo de Combate ARENA',
    actionLog: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
