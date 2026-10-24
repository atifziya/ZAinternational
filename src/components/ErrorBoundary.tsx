import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode }
interface State { failed: boolean }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State { return { failed: true }; }

  componentDidCatch(error: Error, details: ErrorInfo): void {
    console.error('Application error boundary:', error, details);
  }

  render(): ReactNode {
    if (this.state.failed) return <main className="error-screen"><p className="eyebrow">Something went wrong</p><h1>Please refresh the page</h1><p>We could not display this section safely. Your information has not been sent.</p><button className="button button-primary" onClick={() => window.location.reload()}>Refresh page</button></main>;
    return this.props.children;
  }
}
