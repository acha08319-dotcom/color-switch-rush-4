// YouTube Playables SDK global type declarations.
// The runtime is provided by https://www.youtube.com/game_api/v1 in Playables.

declare namespace ytgame {
  const IN_PLAYABLES_ENV: boolean;
  const SDK_VERSION: string;

  namespace game {
    function firstFrameReady(): void;
    function gameReady(): void;
    function loadData(): Promise<string>;
    function saveData(data: string): Promise<void>;
  }

  namespace system {
    function getLanguage(): Promise<string>;
    function isAudioEnabled(): boolean;
    function onAudioEnabledChange(
      callback: (isAudioEnabled: boolean) => void,
    ): () => void;
    function onPause(callback: () => void): () => void;
    function onResume(callback: () => void): () => void;
  }

  namespace engagement {
    enum ContentType {
      PLAYABLE = "PLAYABLE",
      VIDEO = "VIDEO",
    }

    interface Content {
      id: string;
      contentType?: ContentType;
    }

    interface Score {
      value: number;
    }

    function openYTContent(content: Content): Promise<void>;
    function sendScore(score: Score): Promise<void>;
  }

  namespace health {
    function logError(): void;
    function logWarning(): void;
  }

  enum SdkErrorType {
    API_UNAVAILABLE = "API_UNAVAILABLE",
    INVALID_PARAMS = "INVALID_PARAMS",
    SIZE_LIMIT_EXCEEDED = "SIZE_LIMIT_EXCEEDED",
    UNKNOWN = "UNKNOWN",
  }

  class SdkError extends Error {
    errorType: SdkErrorType;
  }
}

declare const ytgame: typeof ytgame;

