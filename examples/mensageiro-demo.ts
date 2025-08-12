/**
 * Mensageiro MIDI Demo Script
 * Demonstrates the core MIDI functionality of Pilar 3
 * 
 * Run with: npx tsx examples/mensageiro-demo.ts
 */

import { Mensageiro } from '../src/pilares/mensageiro/index.js';

async function demonstrateMensageiro() {
  console.log('🎹 Mensageiro MIDI Demo Starting...\n');
  
  // Create and initialize Mensageiro
  const mensageiro = new Mensageiro();
  
  try {
    // Initialize the MIDI system
    console.log('1. Initializing MIDI system...');
    await mensageiro.initialize();
    console.log('✅ MIDI system initialized\n');
    
    // List available ports
    console.log('2. Available MIDI ports:');
    const ports = mensageiro.listPorts();
    
    if (ports.length === 0) {
      console.log('   ❌ No MIDI ports found');
      console.log('   💡 Tip: Install a software synthesizer or connect MIDI hardware\n');
    } else {
      ports.forEach((port, index) => {
        const status = port.connected ? '[CONNECTED]' : '';
        console.log(`   ${index + 1}. ${port.name} (${port.type}) ${status}`);
      });
      console.log();
    }
    
    // Find and connect to an output port
    const outputPorts = ports.filter(p => p.type === 'output');
    if (outputPorts.length > 0) {
      const targetPort = outputPorts[0]!;
      
      console.log(`3. Connecting to: ${targetPort.name}`);
      const connected = await mensageiro.connectToPort(targetPort.name);
      
      if (connected) {
        console.log('✅ Successfully connected\n');
        
        // Demonstrate MIDI functionality
        console.log('4. Testing MIDI functionality...');
        
        // Play a simple C major scale
        const scale = [60, 62, 64, 65, 67, 69, 71, 72]; // C4 to C5
        console.log('   🎵 Playing C major scale...');
        
        for (const note of scale) {
          // Send note on
          mensageiro.sendNoteOn(note, 0.8, 1);
          
          // Wait 200ms
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Send note off
          mensageiro.sendNoteOff(note, 1);
          
          // Brief pause between notes
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log('   ✅ Scale completed\n');
        
        // Demonstrate control changes
        console.log('   🎛️  Testing Control Changes...');
        mensageiro.sendCC(7, 100, 1);   // Volume to 100
        mensageiro.sendCC(10, 64, 1);   // Pan to center
        mensageiro.sendCC(91, 40, 1);   // Reverb to 40
        console.log('   ✅ Control changes sent\n');
        
        // Demonstrate program change
        console.log('   🎺 Testing Program Change...');
        mensageiro.sendProgramChange(40, 1); // Change to Violin (GM)
        console.log('   ✅ Program change sent\n');
        
        // Play a chord to test the new program
        console.log('   🎼 Playing C major chord...');
        const chord = [60, 64, 67, 72]; // C-E-G-C
        
        // Play chord
        chord.forEach(note => mensageiro.sendNoteOn(note, 0.7, 1));
        await new Promise(resolve => setTimeout(resolve, 1000));
        chord.forEach(note => mensageiro.sendNoteOff(note, 1));
        
        console.log('   ✅ Chord completed\n');
        
        // System status
        console.log('5. System Status:');
        const status = mensageiro.getSystemStatus();
        console.log(`   Connected Port: ${status.connectedPort}`);
        console.log(`   Available Ports: ${status.availablePorts}`);
        console.log(`   Messages Sent: ${status.midiInterfaceStatus.messagesSent}`);
        console.log(`   Errors: ${status.midiInterfaceStatus.errorsCount}\n`);
        
      } else {
        console.log('❌ Failed to connect to port\n');
      }
    } else {
      console.log('3. ⏭️  No output ports available - skipping MIDI tests\n');
    }
    
    console.log('🎹 Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Cleanup
    console.log('\n6. Cleaning up...');
    await mensageiro.cleanup();
    console.log('✅ Cleanup complete');
  }
}

// Additional demonstration functions
async function demonstrateAdvancedFeatures() {
  console.log('\n🔬 Advanced Features Demo...\n');
  
  const mensageiro = new Mensageiro();
  await mensageiro.initialize();
  
  const ports = mensageiro.listPorts();
  const outputPort = ports.find(p => p.type === 'output');
  
  if (outputPort) {
    await mensageiro.connectToPort(outputPort.name);
    
    // Demonstrate All Notes Off
    console.log('Testing All Notes Off...');
    // First, send some sustained notes
    [60, 64, 67].forEach(note => mensageiro.sendNoteOn(note, 0.5, 1));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Then stop them all at once
    mensageiro.sendAllNotesOff(1);
    console.log('✅ All Notes Off sent\n');
    
    // Demonstrate Panic function
    console.log('Testing Panic (Emergency Stop)...');
    // Send notes on multiple channels
    for (let ch = 1; ch <= 4; ch++) {
      mensageiro.sendNoteOn(60 + ch, 0.6, ch);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Emergency stop everything
    mensageiro.sendPanic();
    console.log('✅ Panic executed - all MIDI activity stopped\n');
    
    await mensageiro.cleanup();
  }
}

// Run the demonstrations
if (import.meta.url === new URL(process.argv[1]!, 'file://').href) {
  demonstrateMensageiro()
    .then(() => demonstrateAdvancedFeatures())
    .catch(error => {
      console.error('Demo error:', error);
      process.exit(1);
    });
}