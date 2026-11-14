"use client";

import { useActionState } from "react";
import { toonButton } from "@/components/common/toon-button";
import { completeOnboarding, type OnboardingState } from "./actions";

const field =
  "h-11 w-full rounded-[8px] border-[2.5px] border-pen bg-white px-3 font-sans text-base text-pen outline-none focus-visible:shadow-[3px_3px_0_var(--pen)]";

export function OnboardingForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    {},
  );
  const e = state.errors ?? {};

  return (
    <form action={action} className="flex w-full flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1">
        <span className="font-display text-lg font-semibold text-pen">
          Username
        </span>
        <input
          name="username"
          defaultValue={state.values?.username}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          maxLength={20}
          required
          aria-invalid={!!e.username}
          aria-describedby="username-hint"
          className={field}
        />
        <span
          id="username-hint"
          className={`text-sm ${e.username ? "font-semibold text-toon-red" : "text-pen/60"}`}
        >
          {e.username ?? "3–20 characters: letters, numbers or underscores."}
        </span>
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-display text-lg font-semibold text-pen">Age</span>
        <input
          name="age"
          type="number"
          inputMode="numeric"
          min={1}
          max={120}
          defaultValue={state.values?.age}
          required
          aria-invalid={!!e.age}
          className={field}
        />
        {e.age && (
          <span className="text-sm font-semibold text-toon-red">{e.age}</span>
        )}
      </label>

      {e.form && (
        <p role="alert" className="text-sm font-semibold text-toon-red">
          {e.form}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className={`${toonButton} mt-2 w-full bg-toon-yellow`}
      >
        {pending ? "Saving…" : "Start building"}
      </button>
    </form>
  );
}
