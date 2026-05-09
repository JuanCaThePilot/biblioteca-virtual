import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink text-white flex items-center justify-center p-4">
          <div className="glass rounded-[2rem] p-8 max-w-lg w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-black text-white mb-2">Algo salió mal</h1>
            <p className="text-slate-400 mb-6 text-sm">
              Ocurrió un error inesperado. Por favor, recarga la página.
            </p>
            <pre className="text-xs text-rose-300 bg-rose-500/10 p-4 rounded-2xl mb-6 overflow-auto max-h-32 border border-rose-300/20">
              {this.state.error?.message || 'Error desconocido'}
            </pre>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}