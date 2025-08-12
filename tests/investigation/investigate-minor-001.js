/**
 * Test Investigation Script - MINOR-001 Analysis
 * Safe test with timeout to understand the test failure
 */

// Timeout wrapper to prevent infinite loops
const withTimeout = (promise, ms) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    )
  ]);
};

async function investigateTest() {
  console.log('🔍 INVESTIGATING MINOR-001: Test Status Check');
  
  try {
    // Import with timeout protection
    const importPromise = import('./dist/pilares/modulo-midi/mensageiro/index.js');
    const { Mensageiro } = await withTimeout(importPromise, 5000);
    
    console.log('✅ Import successful');
    
    // Create and initialize mensageiro
    const mensageiro = new Mensageiro();
    console.log('✅ Mensageiro created');
    
    // Initialize with timeout
    await withTimeout(mensageiro.initialize(), 5000);
    console.log('✅ Mensageiro initialized');
    
    // Test the exact scenario from the failing test
    console.log('🧪 Testing getSystemStatus()...');
    const status = mensageiro.getSystemStatus();
    
    console.log('📊 Status returned:', {
      initialized: status.initialized,
      connectedPort: status.connectedPort,
      connectedPortType: typeof status.connectedPort,
      connectedPortValue: status.connectedPort === null ? 'NULL' : `"${status.connectedPort}"`,
      availablePorts: status.availablePorts,
      hasPortManagerStatus: !!status.portManagerStatus,
      hasMidiInterfaceStatus: !!status.midiInterfaceStatus
    });
    
    // Test the exact expectation from the failing test
    console.log('🔬 Analyzing test expectation...');
    const expectedString = typeof status.connectedPort === 'string';
    console.log('Test expects connectedPort to be string:', expectedString);
    console.log('Test expectation result:', expectedString ? 'PASS' : 'FAIL');
    
    if (!expectedString) {
      console.log('❌ TEST FAILURE CAUSE: connectedPort is null, test expects string');
      console.log('💡 SOLUTION: Test should use expect.any(String) OR expect.anything()');
      console.log('💡 ALTERNATIVE: Test should accept null when no port is connected');
    }
    
    // Check if there are any available ports
    const ports = mensageiro.listPorts();
    console.log('🔌 Available ports:', ports.length);
    
    if (ports.length > 0) {
      console.log('🔌 First output port:', ports.find(p => p.type === 'output')?.name || 'none');
      
      // Try connecting to first available port
      const outputPort = ports.find(p => p.type === 'output');
      if (outputPort) {
        console.log('🔗 Testing connection to port...');
        const connected = await withTimeout(mensageiro.connectToPort(outputPort.name), 3000);
        console.log('Connection result:', connected);
        
        if (connected) {
          const newStatus = mensageiro.getSystemStatus();
          console.log('📊 Status after connection:', {
            connectedPort: newStatus.connectedPort,
            connectedPortType: typeof newStatus.connectedPort
          });
        }
      }
    }
    
    // Cleanup
    await withTimeout(mensageiro.cleanup(), 3000);
    console.log('✅ Cleanup completed');
    
  } catch (error) {
    if (error.message === 'TIMEOUT') {
      console.log('⏰ TIMEOUT reached - preventing infinite loop');
    } else {
      console.log('❌ Error during investigation:', error.message);
    }
  }
}

// Run investigation
investigateTest().then(() => {
  console.log('🏁 Investigation completed');
  process.exit(0);
}).catch(error => {
  console.log('💥 Investigation failed:', error.message);
  process.exit(1);
});
