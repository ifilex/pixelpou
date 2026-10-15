import React, { useEffect } from 'react';
import { InGameNotification, RoomType } from '../types';
import { soundFx } from '../audio/retroAudio';
import { X, ArrowRight } from 'lucide-react';

interface NotificationBannerProps {
  notification: InGameNotification | null;
  onDismiss: () => void;
  onAction: (targetRoom?: RoomType) => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  notification,
  onDismiss,
  onAction,
}) => {
  useEffect(() => {
    if (notification) {
      soundFx.playNotification();
    }
  }, [notification]);

  if (!notification) return null;

  return (
    <div
      id="in-game-interactive-notification"
      className="w-full shrink-0 px-2 pt-1 animate-in slide-in-from-top-2 duration-200 z-20"
    >
      <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 px-2.5 py-1.5 rounded-xl border border-amber-600 shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg shrink-0 p-0.5 bg-white/40 rounded-lg">
            {notification.icon}
          </span>
          <div className="min-w-0">
            <h4 className="text-[11px] font-black leading-tight truncate">
              {notification.title}
            </h4>
            <p className="text-[10px] font-bold text-slate-900 leading-snug line-clamp-1">
              {notification.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {notification.actionLabel && (
            <button
              onClick={() => onAction(notification.actionRoom)}
              className="px-2 py-0.5 bg-slate-950 hover:bg-slate-900 text-amber-300 text-[10px] font-black rounded-lg border border-slate-800 shadow transition active:scale-95 flex items-center gap-1"
            >
              <span>{notification.actionLabel}</span>
              <ArrowRight className="w-2.5 h-2.5" />
            </button>
          )}
          <button
            onClick={onDismiss}
            className="p-1 rounded text-slate-900 hover:bg-black/10 transition"
          >
            <X className="w-3 h-3 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
};
