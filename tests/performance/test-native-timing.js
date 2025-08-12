// Quick test of native timing engine
import { Maestro } from './dist/pilares/maestro/index.js';

async function testNativeTiming() {
  const maestro = new Maestro();
  
  console.log('🚀 Testing Native Maestro Timing Engine...');
  
  try {
    // Initialize
    await maestro.initialize();
    console.log('✅ Maestro initialized successfully');
    
    // Test timing precision
    const startTime = performance.now();
    maestro.play();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const endTime = performance.now();
    const elapsed = endTime - startTime;
    
    maestro.stop();
    console.log(`⏱️ Timing test: ${elapsed.toFixed(2)}ms for 1000ms playback`);
    
    // Get performance metrics
    const metrics = maestro.getPerformanceMetrics();
    console.log('📊 Performance Metrics:', {
      nativeLatency: metrics.nativeLatency,
      timingEngine: metrics.timingEngine
    });
    
    // Test status
    const status = maestro.getSystemStatus();
    console.log('📋 System Status:', {
      initialized: status.initialized,
      timingEngine: status.nativeTiming.timingEngine,
      precision: status.nativeTiming.transportPrecision
    });
    
    await maestro.cleanup();
    console.log('✅ Native timing test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testNativeTiming().catch(console.error);