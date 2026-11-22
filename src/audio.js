export function createAudio(host = globalThis) {
  let context = null;
  const sounds = new Set();

  function cancelVoice() {
    try { host.speechSynthesis?.cancel?.(); } catch { /* Voice is optional. */ }
  }

  function release(sound) {
    if (!sounds.delete(sound)) return;
    sound.oscillator.disconnect();
    sound.gain.disconnect();
  }

  function closeEffects() {
    const previous = context;
    context = null;
    for (const sound of sounds) {
      try { sound.oscillator.stop(); } catch { /* It may have already ended. */ }
      release(sound);
    }
    try {
      if (previous && previous.state !== 'closed') {
        Promise.resolve(previous.close()).catch(() => {});
      }
    } catch { /* Audio is optional, including when closing. */ }
  }

  const audio = {
    voice: false,
    effects: false,
    toggleVoice() {
      audio.voice = !audio.voice;
      if (!audio.voice) cancelVoice();
      return audio.voice;
    },
    toggleEffects() {
      audio.effects = !audio.effects;
      if (!audio.effects) closeEffects();
      return audio.effects;
    },
    speak(text) {
      if (!audio.voice || !host.speechSynthesis?.speak || !host.SpeechSynthesisUtterance) return;
      try {
        cancelVoice();
        const utterance = new host.SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        host.speechSynthesis.speak(utterance);
      } catch { /* Missing or unavailable voices must not interrupt play. */ }
    },
    async effect(correct) {
      if (!audio.effects || !host.AudioContext) return;
      let current;
      try {
        if (!context || context.state === 'closed') context = new host.AudioContext();
        current = context;
        if (current.state === 'suspended') await current.resume();
        // Muting or stopping invalidates even a tone still waiting for resume.
        if (!audio.effects || current !== context || current.state === 'closed') return;
        const oscillator = current.createOscillator();
        const gain = current.createGain();
        const sound = { oscillator, gain };
        sounds.add(sound);
        oscillator.onended = () => release(sound);
        const now = current.currentTime;
        oscillator.frequency.setValueAtTime(correct ? 660 : 220, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
        oscillator.connect(gain);
        gain.connect(current.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.18);
      } catch {
        if (current === context) closeEffects();
      }
    },
    stop() {
      cancelVoice();
      closeEffects();
    },
  };
  return audio;
}
