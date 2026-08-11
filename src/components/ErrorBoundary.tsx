import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * 최상위 에러 바운더리.
 *
 * config 계약이 어긋나거나 렌더 중 예외가 나면 흰 화면 대신 이 화면이 뜬다.
 * 여행 중에 앱이 죽으면 사용자는 원인을 알 방법이 없으므로,
 * 최소한 "무엇이 잘못됐고 어떻게 복구하는지"는 보여줘야 한다.
 */
class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
    } catch {
      /* private browsing */
    }
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
        <div className="w-full max-w-sm space-y-5 text-center">
          <p className="text-4xl" aria-hidden="true">
            🧭
          </p>
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">화면을 불러오지 못했어요</h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              일시적인 문제일 수 있어요. 새로고침해 보시고, 계속 같은 화면이면 저장된 데이터를
              초기화해 주세요.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={this.handleReload}
              className="min-h-[48px] w-full rounded-2xl bg-primary px-4 font-bold text-primary-foreground active:scale-95"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={this.handleReset}
              className="min-h-[48px] w-full rounded-2xl border border-border bg-card px-4 font-bold text-muted-foreground active:scale-95"
            >
              저장된 데이터 초기화 후 새로고침
            </button>
          </div>

          <details className="text-left">
            <summary className="cursor-pointer text-xs text-muted-foreground/70">
              오류 정보
            </summary>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-muted p-3 text-[10px] leading-relaxed text-muted-foreground">
              {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
