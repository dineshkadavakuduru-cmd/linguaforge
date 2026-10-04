"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class ExerciseCardErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) { console.error("Exercise card failed", error, info); }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="mx-auto w-full max-w-3xl rounded-xl border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />
          <div>
            <h2 className="font-medium">This exercise could not be displayed.</h2>
            <p className="mt-2 text-sm leading-6 text-rose-200/80">Your progress is safe. Reload the exercise to continue.</p>
            <button type="button" onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-rose-300/20 px-3 text-xs font-medium text-rose-100 hover:bg-rose-300/10">
              <RotateCcw className="h-3.5 w-3.5" /> Reload exercise
            </button>
          </div>
        </div>
      </div>
    );
  }
}
