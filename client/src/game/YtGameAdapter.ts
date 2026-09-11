// YtGameAdapter.ts — Safe integration boundary for the YouTube Playables SDK.
// All calls are no-ops or localStorage-backed outside the Playables environment,
// so the game remains fully playable during local development and preview.

import { readLocal, writeLocal } from "./StorageAdapter";

const LOCAL_SAVE_KEY = "colorSwitchRush_playablesSave";

type Cleanup = () => void;

export interface PlayablesSaveData {
  version: 1;
  highScore: number;
  dailyBest: number;
  dailyDate: string;
}

let saveQueue = Promise.resolve();

function hasSdk(): boolean {
  return typeof ytgame !== "undefined";
}

export const YtGameAdapter = {
  isInPlayables(): boolean {
    return hasSdk() && Boolean(ytgame.IN_PLAYABLES_ENV);
  },

  notifyFirstFrameReady(): void {
    if (!hasSdk()) return;
    try {
      ytgame.game.firstFrameReady();
    } catch (error) {
      console.warn("YouTube Playables firstFrameReady failed", error);
      YtGameAdapter.logWarning();
    }
  },

  notifyGameReady(): void {
    if (!hasSdk()) return;
    try {
      ytgame.game.gameReady();
    } catch (error) {
      console.warn("YouTube Playables gameReady failed", error);
      YtGameAdapter.logWarning();
    }
  },

  async loadSaveData(): Promise<string | null> {
    if (YtGameAdapter.isInPlayables()) {
      try {
        return await ytgame.game.loadData();
      } catch (error) {
        console.warn("YouTube Playables save data could not be loaded", error);
        YtGameAdapter.logWarning();
      }
    }

    return readLocal(LOCAL_SAVE_KEY);
  },

  mergeSaveData(partial: Partial<PlayablesSaveData>): Promise<void> {
    const operation = saveQueue.then(async () => {
      const raw = await YtGameAdapter.loadSaveData();
      let current: Partial<PlayablesSaveData> = {};

      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<PlayablesSaveData>;
          if (parsed && typeof parsed === "object") current = parsed;
        } catch (error) {
          console.warn("YouTube Playables save data was not valid JSON", error);
          YtGameAdapter.logWarning();
        }
      }

      const merged: PlayablesSaveData = {
        version: 1,
        highScore: Number.isFinite(current.highScore) ? Math.max(0, Math.floor(current.highScore as number)) : 0,
        dailyBest: Number.isFinite(current.dailyBest) ? Math.max(0, Math.floor(current.dailyBest as number)) : 0,
        dailyDate: typeof current.dailyDate === "string" ? current.dailyDate : "",
        ...partial,
      };

      await YtGameAdapter.saveSaveData(JSON.stringify(merged));
    });

    saveQueue = operation.catch(() => undefined);
    return operation;
  },

  async saveSaveData(data: string): Promise<void> {
    if (YtGameAdapter.isInPlayables()) {
      try {
        await ytgame.game.saveData(data);
        return;
      } catch (error) {
        console.warn("YouTube Playables save data could not be saved", error);
        YtGameAdapter.logWarning();
      }
    }

    writeLocal(LOCAL_SAVE_KEY, data);
  },

  async getLanguage(): Promise<string | null> {
    if (!YtGameAdapter.isInPlayables()) return null;
    try {
      return await ytgame.system.getLanguage();
    } catch (error) {
      console.warn("YouTube Playables language could not be read", error);
      YtGameAdapter.logWarning();
      return null;
    }
  },

  async openYTContent(id: string, contentType: ytgame.engagement.ContentType = ytgame.engagement.ContentType.VIDEO): Promise<void> {
    if (!YtGameAdapter.isInPlayables()) return;
    try {
      await ytgame.engagement.openYTContent({ id, contentType });
    } catch (error) {
      console.warn("YouTube Playables content could not be opened", error);
      YtGameAdapter.logWarning();
    }
  },

  isAudioEnabled(): boolean {
    if (!hasSdk()) return true;
    try {
      return ytgame.system.isAudioEnabled();
    } catch (error) {
      console.warn("YouTube Playables audio state could not be read", error);
      return true;
    }
  },

  onAudioEnabledChange(callback: (isAudioEnabled: boolean) => void): Cleanup {
    if (!hasSdk()) return () => undefined;
    try {
      return ytgame.system.onAudioEnabledChange(callback);
    } catch (error) {
      console.warn("YouTube Playables audio listener could not be registered", error);
      return () => undefined;
    }
  },

  onPause(callback: () => void): Cleanup {
    if (!hasSdk()) return () => undefined;
    try {
      return ytgame.system.onPause(callback);
    } catch (error) {
      console.warn("YouTube Playables pause listener could not be registered", error);
      return () => undefined;
    }
  },

  onResume(callback: () => void): Cleanup {
    if (!hasSdk()) return () => undefined;
    try {
      return ytgame.system.onResume(callback);
    } catch (error) {
      console.warn("YouTube Playables resume listener could not be registered", error);
      return () => undefined;
    }
  },

  async sendScore(value: number): Promise<void> {
    if (!YtGameAdapter.isInPlayables()) return;
    try {
      await ytgame.engagement.sendScore({ value: Math.max(0, Math.floor(value)) });
    } catch (error) {
      console.warn("YouTube Playables score could not be sent", error);
      YtGameAdapter.logWarning();
    }
  },

  logError(): void {
    if (!hasSdk()) return;
    try {
      ytgame.health.logError();
    } catch (error) {
      console.warn("YouTube Playables error logging failed", error);
    }
  },

  logWarning(): void {
    if (!hasSdk()) return;
    try {
      ytgame.health.logWarning();
    } catch (error) {
      console.warn("YouTube Playables warning logging failed", error);
    }
  },
};
