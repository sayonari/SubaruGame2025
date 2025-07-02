export class SoundManager {
  private audioContext: AudioContext;
  private gainNode: GainNode;
  private isPlaying: boolean = false;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.audioContext.createGain();
    this.gainNode.connect(this.audioContext.destination);
    this.gainNode.gain.value = 0.3;
  }

  // 効果音を再生
  playSound(type: 'jump' | 'item' | 'hit' | 'tap') {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.gainNode);
    
    const currentTime = this.audioContext.currentTime;
    
    switch (type) {
      case 'jump':
        // ジャンプ音（上昇音）
        oscillator.frequency.setValueAtTime(300, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.3, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.15);
        break;
        
      case 'item':
        // アイテム取得音（キラキラ音）
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1600, currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.3);
        
        // 2つ目の音
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(this.gainNode);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1200, currentTime + 0.05);
        osc2.frequency.exponentialRampToValueAtTime(2400, currentTime + 0.15);
        gain2.gain.setValueAtTime(0.15, currentTime + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.35);
        osc2.start(currentTime + 0.05);
        osc2.stop(currentTime + 0.35);
        break;
        
      case 'hit':
        // 障害物ヒット音（低い音）
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(100, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.2);
        break;
        
      case 'tap':
        // タップ音（ポップ音）
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.1, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.05);
        oscillator.start(currentTime);
        oscillator.stop(currentTime + 0.05);
        break;
    }
  }

  // BGMを再生（シンプルなメロディ）
  playBGM() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    
    // スバルさんっぽい明るいメロディ
    const melody = [
      { note: 523.25, duration: 0.25 }, // ド
      { note: 659.25, duration: 0.25 }, // ミ
      { note: 783.99, duration: 0.25 }, // ソ
      { note: 659.25, duration: 0.25 }, // ミ
      { note: 523.25, duration: 0.5 },  // ド
      { note: 0, duration: 0.25 },      // 休符
      { note: 587.33, duration: 0.25 }, // レ
      { note: 698.46, duration: 0.25 }, // ファ
      { note: 880.00, duration: 0.25 }, // ラ
      { note: 698.46, duration: 0.25 }, // ファ
      { note: 587.33, duration: 0.5 },  // レ
      { note: 0, duration: 0.25 },      // 休符
    ];
    
    let noteIndex = 0;
    let currentTime = this.audioContext.currentTime;
    
    const playNextNote = () => {
      if (!this.isPlaying) return;
      
      const { note, duration } = melody[noteIndex];
      
      if (note > 0) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.gainNode);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note, currentTime);
        gainNode.gain.setValueAtTime(0.1, currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + duration);
        
        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);
      }
      
      currentTime += duration;
      noteIndex = (noteIndex + 1) % melody.length;
      
      setTimeout(() => playNextNote(), duration * 1000);
    };
    
    playNextNote();
  }

  stopBGM() {
    this.isPlaying = false;
  }

  // ゲームオーバー音
  playGameOver() {
    const notes = [440, 330, 220, 165]; // ラ、ミ、ラ（低）、ミ（低）
    
    notes.forEach((freq, index) => {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.gainNode);
      
      const startTime = this.audioContext.currentTime + index * 0.2;
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.5);
    });
  }
}