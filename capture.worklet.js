// Processa o áudio do microfone em tempo real (fora da thread principal) e
// envia cada bloco de amostras para o código da página, que depois manda ao Gemini.
class AudioCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      // input[0] é um Float32Array com as amostras deste bloco (mono)
      this.port.postMessage({ type: 'audio', data: input[0] });
    }
    return true; // mantém o processador vivo
  }
}
registerProcessor('audio-capture-processor', AudioCaptureProcessor);
