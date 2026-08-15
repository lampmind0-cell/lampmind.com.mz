// Reproduz os pedaços de áudio que vão chegando do Gemini, em fila, sem cortes.
// Também sabe "interromper" (esvaziar a fila) quando a pessoa começa a falar por cima.
class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.fila = [];
    this.offset = 0;
    this.port.onmessage = (e) => {
      if (e.data === 'interrupt') {
        this.fila = [];
        this.offset = 0;
      } else {
        this.fila.push(e.data); // Float32Array
      }
    };
  }

  process(inputs, outputs) {
    const saida = outputs[0][0];
    let i = 0;
    while (i < saida.length) {
      if (this.fila.length === 0) {
        saida[i++] = 0; // silêncio enquanto não há mais áudio para tocar
        continue;
      }
      const atual = this.fila[0];
      saida[i++] = atual[this.offset++];
      if (this.offset >= atual.length) {
        this.fila.shift();
        this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('pcm-processor', PCMProcessor);
