import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Share2, PlusSquare, CheckCircle2, X, Sparkles } from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstalled, isIOS, canPrompt, install } = usePWAInstall();
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md pointer-events-auto animate-fadeIn">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-950/60 text-slate-100 font-rajdhani">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon & Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-cyan-400/50 shadow-lg shadow-cyan-500/20 shrink-0">
            <img
              src="/pwa-192x192.png"
              alt="Last Horizon App Icon"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 to-transparent pointer-events-none" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                PWA / MOBILE APP
              </span>
              <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono-tech">
                <Sparkles className="w-3 h-3" /> FULLSCREEN
              </span>
            </div>
            <h3 className="text-xl font-bold font-orbitron text-white tracking-wide mt-1">
              LAST HORIZON
            </h3>
            <p className="text-xs text-slate-400 font-mono-tech">
              3D Space Exploration & Survival
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 mb-6 text-xs font-mono-tech bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Полноэкранный запуск без интерфейса браузера</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Автономный кэш 3D планет и быстрый отклик</span>
          </div>
          <div className="flex items-center gap-2.5 text-slate-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Удобное сенсорное управление и виртуальный джойстик</span>
          </div>
        </div>

        {/* Installation Actions */}
        {installSuccess ? (
          <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-4 text-center text-emerald-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-1 animate-bounce" />
            <div className="font-bold font-orbitron text-sm">ПРИЛОЖЕНИЕ УСТАНОВЛЕНО!</div>
            <div className="text-xs text-emerald-300/80 font-mono-tech mt-1">
              Иконка добавлена на рабочий стол смартфона
            </div>
          </div>
        ) : isInstalled ? (
          <div className="bg-slate-800/80 border border-cyan-500/30 rounded-xl p-4 text-center">
            <CheckCircle2 className="w-7 h-7 text-cyan-400 mx-auto mb-1" />
            <div className="font-bold text-white text-sm">Приложение уже установлено</div>
            <p className="text-xs text-slate-400 font-mono-tech mt-1">
              Вы уже играете в полноэкранном режиме PWA
            </p>
          </div>
        ) : canPrompt ? (
          <button
            onClick={handleInstallClick}
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold tracking-wider font-orbitron text-sm shadow-lg shadow-cyan-600/30 hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-95"
          >
            <Download className="w-5 h-5 animate-bounce" />
            <span>УСТАНОВИТЬ НА СМАРТФОН</span>
          </button>
        ) : isIOS ? (
          <div className="bg-slate-950/90 border border-amber-500/40 rounded-xl p-4 text-xs font-mono-tech text-slate-300 space-y-2">
            <div className="text-amber-300 font-bold font-orbitron text-[13px] flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-amber-400" />
              ИНСТРУКЦИЯ ДЛЯ IPHONE / IPAD:
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">1</span>
              <span>
                Нажмите значок <strong className="text-white">«Поделиться»</strong> <Share2 className="w-3.5 h-3.5 inline text-sky-400 mx-1" /> в нижней панели Safari.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">2</span>
              <span>
                Прокрутите вниз и нажмите <strong className="text-white">«На экран "Домой"»</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-1" />.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">3</span>
              <span>Нажмите кнопку <strong className="text-white">«Добавить»</strong> в правом верхнем углу.</span>
            </div>
          </div>
        ) : (
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 text-xs text-center font-mono-tech text-slate-300">
            <p>
              Чтобы установить, откройте меню браузера <strong className="text-cyan-300">⋮</strong> (в правом верхнем углу) и выберите <strong className="text-cyan-300">«Установить приложение»</strong> или <strong className="text-cyan-300">«Добавить на главный экран»</strong>.
            </p>
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors font-mono-tech"
          >
            Продолжить играть в браузере
          </button>
        </div>
      </div>
    </div>
  );
};
