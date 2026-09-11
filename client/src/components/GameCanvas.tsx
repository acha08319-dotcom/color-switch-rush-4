// GameCanvas.tsx — Babylon-in-React integration contract for the game-dev skill.
// React = picture frame, Babylon = canvas, godogen game code = the painting.
//
// Place at client/src/components/GameCanvas.tsx and render it as the ONLY content
// of the "/" route. The Babylon engine owns the full-screen <canvas>; all gameplay
// lives in framework-agnostic TS modules under client/src/game/ (ported from godogen).
//
// Critical safety rules (see references/manus-adaptations.md):
//  - Initialize the engine exactly once; guard against React StrictMode double-mount.
//  - Always engine.dispose() on unmount and remove every listener.
//  - Tie the render loop to the component lifecycle.
//  - Handle window resize.

import { useEffect, useRef } from "react";
import { Engine } from "@babylonjs/core/Engines/engine";
import { createGameScene, type GameHandle } from "@/game/scene";
import { YtGameAdapter } from "@/game/YtGameAdapter";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || startedRef.current) return;
    startedRef.current = true;

    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    // createGameScene wires up the whole game (GameWorld, Player, gates,
    // input, scoring). It returns a handle for cleanup.
    let handle: GameHandle | null = null;
    let disposed = false;
    let firstFrameReported = false;
    const bootShell = document.getElementById("yt-boot-shell");
    const removeBootShell = () => bootShell?.remove();
    const showBootError = () => {
      const status = bootShell?.querySelector(".yt-boot-status");
      if (status) status.textContent = "LOAD ERROR — RESTART";
      bootShell?.setAttribute("data-error", "true");
    };
    let removeAudioListener: () => void = () => {};
    let removePauseListener: () => void = () => {};
    let removeResumeListener: () => void = () => {};

    createGameScene(engine, canvas).then((h) => {
      if (disposed) {
        h.dispose();
        return;
      }

      handle = h;
      h.world.setAudioEnabled(YtGameAdapter.isAudioEnabled());
      removeAudioListener = YtGameAdapter.onAudioEnabledChange((enabled) => {
        h.world.setAudioEnabled(enabled);
      });
      removePauseListener = YtGameAdapter.onPause(() => h.world.pause());
      removeResumeListener = YtGameAdapter.onResume(() => h.world.resume());

      engine.runRenderLoop(() => {
        h.scene.render();
        if (!firstFrameReported) {
          firstFrameReported = true;
          removeBootShell();
          YtGameAdapter.notifyFirstFrameReady();
          YtGameAdapter.notifyGameReady();
        }
      });
    }).catch((error) => {
      console.error("Failed to initialize Color Switch Rush", error);
      showBootError();
      YtGameAdapter.logError();
    });

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => engine.resize());
    };
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(onResize) : null;
    resizeObserver?.observe(canvas);
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(resizeFrame);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      removeAudioListener();
      removePauseListener();
      removeResumeListener();
      engine.stopRenderLoop();
      handle?.dispose();
      engine.dispose();
      startedRef.current = false;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 h-full w-full outline-none"
      style={{ touchAction: "none" }}
    />
  );
}
