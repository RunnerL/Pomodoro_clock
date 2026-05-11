import React, { Component, ReactNode } from 'react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: string }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: '' }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error.message + '\n' + error.stack }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('React Error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 20, color: '#fff', background: '#1a1a2e',
          width: '100vw', height: '100vh', overflow: 'auto',
          fontFamily: 'monospace', fontSize: 13,
        }}>
          <h2 style={{ color: '#e74c3c' }}>应用加载出错</h2>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {this.state.error}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}