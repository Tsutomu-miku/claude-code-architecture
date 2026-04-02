export default function Footer() {
  return (
    <footer style={{
      background: '#f1f5f9',
      borderTop: '1px solid #e2e8f0',
      padding: '32px 24px',
      textAlign: 'center',
    }}>
      <p style={{
        fontSize: '0.88rem',
        color: '#475569',
        margin: '0 0 8px',
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1.6,
      }}>
        源码来自{' '}
        <a
          href="https://github.com/anthropics/claude-code"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontWeight: 500,
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#2563eb')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#3b82f6')}
        >
          github.com/anthropics/claude-code
        </a>
      </p>
      <p style={{
        fontSize: '0.82rem',
        color: '#94a3b8',
        margin: 0,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        本站仅用于技术学习和架构分析
      </p>
    </footer>
  )
}
