import React, { useState, useRef, useEffect } from 'react';
import {
  MapPin,
  Move,
  Grid,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Shield,
  Layers,
  Users,
  Compass,
  Crosshair
} from 'lucide-react';
import { CampaignMap, MapToken, UserProfile, Character } from '../../types';

interface TacticalMapViewProps {
  maps: CampaignMap[];
  activeMapId: string;
  onSelectMap: (mapId: string) => void;
  onSaveMap: (map: CampaignMap) => void;
  currentUser: UserProfile;
  characters: Character[];
  campaignId: string;
}

export const TacticalMapView: React.FC<TacticalMapViewProps> = ({
  maps,
  activeMapId,
  onSelectMap,
  onSaveMap,
  currentUser,
  characters,
  campaignId
}) => {
  const activeMap = maps.find((m) => m.id === activeMapId) || maps[0];

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isNewMapModalOpen, setIsNewMapModalOpen] = useState(false);

  // New token form state
  const [newToken, setNewToken] = useState<Partial<MapToken>>({
    name: '',
    size: 1,
    color: '#3B82F6',
    type: 'character',
    isVisibleToPlayers: true,
    controlledByUserId: currentUser.uid
  });

  // New map form
  const [newMapName, setNewMapName] = useState('');
  const [newMapUrl, setNewMapUrl] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const isMaster = currentUser.role === 'master' || currentUser.role === 'admin';

  if (!activeMap) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-slate-900 border border-slate-800 rounded-xl">
        <h3 className="text-base font-semibold text-slate-200">Nenhum Mapa Cadastrado</h3>
        <p className="text-xs text-slate-400 mt-1">O Mestre pode criar ou importar o primeiro mapa de batalha.</p>
        {isMaster && (
          <button
            onClick={() => setIsNewMapModalOpen(true)}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold"
          >
            Adicionar Mapa
          </button>
        )}
      </div>
    );
  }

  // Filter tokens visible to current user
  const visibleTokens = activeMap.tokens.filter((tok) => {
    if (isMaster) return true;
    return tok.isVisibleToPlayers;
  });

  const selectedToken = activeMap.tokens.find((t) => t.id === selectedTokenId);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.token-element')) return;
    setIsPanning(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Token Dragging onto Map
  const handleTokenDragStart = (tokenId: string, e: React.MouseEvent | React.TouchEvent) => {
    const token = activeMap.tokens.find((t) => t.id === tokenId);
    if (!token) return;

    // Check permissions
    const canMove = isMaster || token.controlledByUserId === currentUser.uid;
    if (!canMove) {
      alert('Você não tem permissão para mover este token.');
      return;
    }

    setDraggedTokenId(tokenId);
    setSelectedTokenId(tokenId);
  };

  const handleMapDropOrMove = (e: React.MouseEvent) => {
    if (!draggedTokenId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;

    // Calculate percentage coords inside map
    let rawX = ((clientX - rect.left - pan.x) / (rect.width * zoom)) * 100;
    let rawY = ((clientY - rect.top - pan.y) / (rect.height * zoom)) * 100;

    // Snap to grid if enabled
    if (activeMap.movementMode === 'grid') {
      const step = 5; // 5% snap
      rawX = Math.round(rawX / step) * step;
      rawY = Math.round(rawY / step) * step;
    }

    const clampedX = Math.max(2, Math.min(95, rawX));
    const clampedY = Math.max(2, Math.min(95, rawY));

    const updatedTokens = activeMap.tokens.map((t) =>
      t.id === draggedTokenId ? { ...t, x: clampedX, y: clampedY } : t
    );

    const updatedMap: CampaignMap = { ...activeMap, tokens: updatedTokens };
    onSaveMap(updatedMap);
    setDraggedTokenId(null);
  };

  const handleToggleTokenVisibility = (tokenId: string) => {
    if (!isMaster) return;
    const updatedTokens = activeMap.tokens.map((t) =>
      t.id === tokenId ? { ...t, isVisibleToPlayers: !t.isVisibleToPlayers } : t
    );
    onSaveMap({ ...activeMap, tokens: updatedTokens });
  };

  const handleDeleteToken = (tokenId: string) => {
    if (!isMaster) return;
    const updatedTokens = activeMap.tokens.filter((t) => t.id !== tokenId);
    onSaveMap({ ...activeMap, tokens: updatedTokens });
    if (selectedTokenId === tokenId) setSelectedTokenId(null);
  };

  const handleAddTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToken.name?.trim()) return;

    const tok: MapToken = {
      id: 'tok_' + Date.now(),
      mapId: activeMap.id,
      campaignId: activeMap.campaignId,
      name: newToken.name.trim(),
      x: 50,
      y: 50,
      size: Number(newToken.size) || 1,
      color: newToken.color || '#3B82F6',
      isVisibleToPlayers: newToken.isVisibleToPlayers ?? true,
      controlledByUserId: newToken.controlledByUserId || currentUser.uid,
      type: (newToken.type as any) || 'character',
      hpPercent: 100
    };

    onSaveMap({ ...activeMap, tokens: [...activeMap.tokens, tok] });
    setIsTokenModalOpen(false);
    setNewToken({
      name: '',
      size: 1,
      color: '#3B82F6',
      type: 'character',
      isVisibleToPlayers: true,
      controlledByUserId: currentUser.uid
    });
  };

  const handleToggleGridMode = () => {
    const nextMode = activeMap.movementMode === 'grid' ? 'free' : 'grid';
    onSaveMap({ ...activeMap, movementMode: nextMode });
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">
      
      {/* Top Map Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-lg font-bold text-slate-100">{activeMap.name}</h2>
            <span className="text-xs text-slate-400">
              Modo: <strong className="text-cyan-300 capitalize">{activeMap.movementMode}</strong> · {visibleTokens.length} Tokens em campo
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.2))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-1.5 text-slate-300">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="px-2 py-1 text-[10px] hover:bg-slate-800 rounded text-slate-400"
            >
              Reset
            </button>
          </div>

          {/* Toggle Grid */}
          <button
            onClick={handleToggleGridMode}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeMap.movementMode === 'grid'
                ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grade {activeMap.movementMode === 'grid' ? 'Ativa' : 'Livre'}</span>
          </button>

          {/* Add Token CTA */}
          <button
            onClick={() => setIsTokenModalOpen(true)}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Novo Token
          </button>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapDropOrMove}
        className="relative w-full h-[620px] rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden cursor-grab active:cursor-grabbing select-none"
      >
        {/* Transformable Canvas Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            transition: isPanning ? 'none' : 'transform 0.05s ease-out'
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Map Image Backdrop */}
          <img
            src={activeMap.imageUrl}
            alt={activeMap.name}
            className="w-full h-full object-cover pointer-events-none opacity-85"
          />

          {/* Grid Overlay */}
          {activeMap.movementMode === 'grid' && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
                `,
                backgroundSize: '5% 5%'
              }}
            />
          )}

          {/* Tokens Layer */}
          {visibleTokens.map((tok) => {
            const isSelected = tok.id === selectedTokenId;
            const canMove = isMaster || tok.controlledByUserId === currentUser.uid;

            return (
              <div
                key={tok.id}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleTokenDragStart(tok.id, e);
                }}
                style={{
                  left: `${tok.x}%`,
                  top: `${tok.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: `${tok.size * 42}px`,
                  height: `${tok.size * 42}px`
                }}
                className={`token-element absolute rounded-full flex flex-col items-center justify-center cursor-move transition-transform duration-75 shadow-lg group ${
                  isSelected
                    ? 'ring-4 ring-cyan-400 scale-110 z-30'
                    : 'hover:scale-105 z-20'
                } ${!tok.isVisibleToPlayers ? 'opacity-60 border-2 border-dashed border-amber-400' : ''}`}
              >
                {/* Token Body */}
                <div
                  style={{ backgroundColor: tok.color }}
                  className="w-full h-full rounded-full border-2 border-white/90 flex items-center justify-center shadow-md overflow-hidden text-white font-extrabold text-xs"
                >
                  {tok.imageUrl ? (
                    <img src={tok.imageUrl} alt={tok.name} className="w-full h-full object-cover" />
                  ) : (
                    tok.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Token Label & HP Pill */}
                <div className="absolute -bottom-6 px-1.5 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] text-slate-100 font-semibold whitespace-nowrap pointer-events-none flex items-center gap-1 shadow-md">
                  <span>{tok.name}</span>
                  {!tok.isVisibleToPlayers && <EyeOff className="w-2.5 h-2.5 text-amber-400" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Floating Mini Compass / Controls Overlay */}
        <div className="absolute bottom-4 left-4 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-400 backdrop-blur-xs flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-cyan-400" /> Arraste para mover o mapa
          </span>
          <span aria-hidden="true">·</span>
          <span>Clique e arraste tokens para reposicionar</span>
        </div>
      </div>

      {/* Selected Token Inspector */}
      {selectedToken && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: selectedToken.color }}
              className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm"
            >
              {selectedToken.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                {selectedToken.name}
                <span className="text-[10px] font-mono text-cyan-400 capitalize">
                  ({selectedToken.type})
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Posição: X {Math.round(selectedToken.x)}% · Y {Math.round(selectedToken.y)}% · Tamanho: {selectedToken.size}x{selectedToken.size}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isMaster && (
              <>
                <button
                  onClick={() => handleToggleTokenVisibility(selectedToken.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    selectedToken.isVisibleToPlayers
                      ? 'bg-slate-800 border-slate-700 text-slate-300'
                      : 'bg-amber-950/80 border-amber-600 text-amber-300'
                  }`}
                >
                  {selectedToken.isVisibleToPlayers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{selectedToken.isVisibleToPlayers ? 'Visível para Jogadores' : 'Oculto (Mestre)'}</span>
                </button>

                <button
                  onClick={() => handleDeleteToken(selectedToken.id)}
                  className="px-3 py-1.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Excluir
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Create Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-100 shadow-2xl">
            <h3 className="text-base font-bold">Adicionar Token ao Mapa Tático</h3>

            <form onSubmit={handleAddTokenSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Nome do Token</label>
                <input
                  type="text"
                  required
                  value={newToken.name}
                  onChange={(e) => setNewToken({ ...newToken, name: e.target.value })}
                  placeholder="Ex: Arthur, Lobo Corrompido, Baú, Armadilha..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Token</label>
                  <select
                    value={newToken.type}
                    onChange={(e) => setNewToken({ ...newToken, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200"
                  >
                    <option value="character">Personagem</option>
                    <option value="npc">NPC</option>
                    <option value="monster">Monstro</option>
                    <option value="object">Objeto</option>
                    <option value="marker">Marcador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tamanho (Células)</label>
                  <select
                    value={newToken.size}
                    onChange={(e) => setNewToken({ ...newToken, size: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-200 font-mono"
                  >
                    <option value={1}>1x1 (Médio/Pequeno)</option>
                    <option value={2}>2x2 (Grande)</option>
                    <option value={3}>3x3 (Enorme)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Cor do Token</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newToken.color}
                      onChange={(e) => setNewToken({ ...newToken, color: e.target.value })}
                      className="w-8 h-8 rounded bg-transparent border-0 cursor-pointer"
                    />
                    <span className="font-mono text-slate-300">{newToken.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Visibilidade</label>
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer mt-2">
                    <input
                      type="checkbox"
                      checked={newToken.isVisibleToPlayers}
                      onChange={(e) => setNewToken({ ...newToken, isVisibleToPlayers: e.target.checked })}
                      className="rounded border-slate-700 bg-slate-900 text-cyan-500"
                    />
                    <span>Visível aos jogadores</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-lg"
                >
                  Posicionar Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
