"use client";

import { useEffect } from "react";
import { isBurning } from "@/lib/rocket/flight";
import { useFlightStore } from "@/lib/rocket/store/flight-store";

interface Sounds {
  roar: HTMLAudioElement;
  crash: HTMLAudioElement;
}

let sounds: Sounds | null = null;

/** How long the roar takes to die away when the engines cut, ms. */
const FADE_MS = 1500;

const silence = (a: HTMLAudioElement) => {
  a.pause();
  a.currentTime = 0;
};

const play = (a: HTMLAudioElement) => {
  a.play().catch(() => {});
};

/**
 * Call synchronously inside the launch click / keypress. Browsers only allow
 * audio that was started by a gesture, and ignition happens ~2s later in the
 * animation loop, so we unlock both elements here with a muted play.
 */
export function primeLaunchAudio() {
  if (!sounds) return;
  for (const a of [sounds.roar, sounds.crash]) {
    a.muted = true;
    a.play()
      .then(() => silence(a))
      .catch(() => {})
      .finally(() => {
        a.muted = false;
      });
  }
}

/** Booster roar while the engines burn; crash sound when the rocket crashes. */
export function useLaunchAudio() {
  useEffect(() => {
    const roar = new Audio("/rocket-booster-roar.mp3");
    roar.loop = true;
    roar.preload = "auto";
    const crash = new Audio("/crash.mp3");
    crash.preload = "auto";
    sounds = { roar, crash };

    let lastRun = useFlightStore.getState().run;
    let lastPhase = useFlightStore.getState().state.phase;

    // Roar fade-out: ramp volume down, then stop. Cancelled if the engine relights.
    let fade = 0;
    let fading = false;
    const cancelFade = () => {
      cancelAnimationFrame(fade);
      fading = false;
      roar.volume = 1;
    };
    const fadeOut = () => {
      if (fading) return;
      fading = true;
      const from = roar.volume;
      const start = performance.now();
      const frame = (now: number) => {
        const k = Math.min(1, (now - start) / FADE_MS);
        roar.volume = from * (1 - k) ** 2;
        if (k < 1) {
          fade = requestAnimationFrame(frame);
        } else {
          fading = false;
          silence(roar);
          roar.volume = 1;
        }
      };
      fade = requestAnimationFrame(frame);
    };
    const stopRoar = (hard: boolean) => {
      if (roar.paused) return;
      if (hard) {
        cancelFade();
        silence(roar);
      } else fadeOut();
    };

    const unsubscribe = useFlightStore.subscribe(({ state, cfg, run }) => {
      if (run !== lastRun) {
        lastRun = run;
        cancelFade();
        silence(roar);
        silence(crash);
      }

      const crashed = state.phase === "crashed";
      const burning =
        (state.phase === "countdown" || state.phase === "flying") &&
        state.engineOn &&
        isBurning(cfg, state);
      if (burning) {
        if (fading) cancelFade();
        if (roar.paused) play(roar);
      } else stopRoar(crashed);

      if (crashed && lastPhase !== "crashed") {
        crash.currentTime = 0;
        play(crash);
      }
      lastPhase = state.phase;
    });

    return () => {
      unsubscribe();
      cancelFade();
      silence(roar);
      silence(crash);
      sounds = null;
    };
  }, []);
}
