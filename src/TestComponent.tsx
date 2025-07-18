export function TestComponent() {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#4CAF50',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'Arial, sans-serif',
      color: 'white',
      fontSize: '24px'
    }}>
      <h1>✅ SIBAL TESTE FUNCIONANDO!</h1>
      <p>Aplicação carregada com sucesso</p>
      <div style={{ marginTop: '20px', fontSize: '16px' }}>
        Hora atual: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}