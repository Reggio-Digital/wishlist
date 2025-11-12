// Root-level not-found page
export default function RootNotFound() {
  return (
    <html lang="en">
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          padding: '1rem'
        }}>
          <div style={{
            maxWidth: '28rem',
            width: '100%',
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '3.75rem', fontWeight: 'bold', color: '#1f2937' }}>404</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginTop: '1rem' }}>
              Page Not Found
            </h1>
            <p style={{ color: '#4b5563', marginTop: '1rem' }}>
              The page you are looking for doesn't exist.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-block',
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
