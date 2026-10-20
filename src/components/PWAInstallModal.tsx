import React from 'react';
import { Download, Share2, PlusSquare, X, Smartphone, CheckCircle, Apple, Monitor } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0">
            <Download className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Instalar RPG System</h3>
            <p className="text-xs text-slate-400">Acesse direto da sua tela inicial como um aplicativo nativo</p>
          </div>
        </div>

        {/* Body content based on platform */}
        <div className="mt-4 space-y-4">
          
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <strong className="block font-semibold">Aplicativo já instalado!</strong>
                Você já está utilizando o RPG System no modo standalone tela cheia.
              </div>
            </div>
          ) : isInstallable ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Smartphone className="w-4 h-4" /> Vantagens da Instalação:
                </div>
                <ul className="space-y-1 text-slate-300 list-disc list-inside">
                  <li>Carregamento instantâneo sem barra de endereços do navegador.</li>
                  <li>Mais espaço visual útil para fichas, mapas e combates.</li>
                  <li>Suporte a uso contínuo e área segura nos celulares.</li>
                </ul>
              </div>

              <button
                onClick={handleNativeInstall}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-950 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Instalar Aplicativo Agora
              </button>
            </div>
          ) : isIOS ? (
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Apple className="w-4 h-4" /> Como Adicionar no iPhone & iPad (Safari):
              </div>

              <div className="space-y-2.5 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="text-slate-300">
                    Toque no botão <strong className="text-white">Compartilhar</strong> (ícone de quadrado com seta para cima <Share2 className="w-3.5 h-3.5 inline text-cyan-400" />) na barra inferior do Safari.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="text-slate-300">
                    Role a lista de opções para baixo e toque em <strong className="text-white">“Adicionar à Tela de Início”</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-cyan-400" />).
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-cyan-400 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="text-slate-300">
                    Toque em <strong className="text-white">“Adicionar”</strong> no canto superior direito para concluir.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                  <Monitor className="w-4 h-4" /> No Computador ou Navegador Móvel:
                </div>
                <p>
                  No Chrome, Edge ou navegador Android, clique no ícone de instalação (computador com seta para baixo) na barra de endereços do navegador, ou abra o menu de 3 pontinhos e selecione <strong className="text-slate-100">“Instalar aplicativo”</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
