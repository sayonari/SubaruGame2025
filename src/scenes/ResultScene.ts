import Phaser from 'phaser';
import { OnlineRanking } from '../utils/OnlineRanking';

export class ResultScene extends Phaser.Scene {
  private score: number = 0;
  private distance: number = 0;
  private taps: number = 0;
  private playerName: string = '';
  private nameInputElement?: HTMLInputElement;
  private registerButton?: HTMLButtonElement;
  private isComposing: boolean = false;
  private hasRegistered: boolean = false;

  constructor() {
    super({ key: 'ResultScene' });
  }

  init(data: { score: number; distance: number; taps: number }) {
    this.score = data.score || 0;
    this.distance = data.distance || 0;
    this.taps = data.taps || 0;
    this.hasRegistered = false;
  }

  create() {
    const { width } = this.cameras.main;

    // 可愛い背景
    this.createBackground();

    // 結果表示
    const resultTitle = this.add.text(width / 2, 60, '✨ RESULT ✨', {
      fontSize: '48px',
      color: '#FF69B4',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 6
    }).setOrigin(0.5);

    // 結果タイトルのアニメーション
    this.tweens.add({
      targets: resultTitle,
      scale: { from: 0.8, to: 1 },
      duration: 500,
      ease: 'Back.out'
    });

    this.add.text(width / 2, 140, `SCORE: ${this.score}`, {
      fontSize: '36px',
      color: '#FF6B35',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, 190, `距離: ${this.distance}m`, {
      fontSize: '24px',
      color: '#666666'
    }).setOrigin(0.5);

    this.add.text(width / 2, 220, `タップ数: ${this.taps}回 (${(this.taps / 30).toFixed(1)}回/秒)`, {
      fontSize: '24px',
      color: '#666666'
    }).setOrigin(0.5);

    // 名前入力フィールド
    this.createNameInput();

    // ボタン
    const retryButton = this.add.text(width / 2 - 100, 320, '🔄 RETRY', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#4CAF50',
      padding: { left: 30, right: 30, top: 10, bottom: 10 }
    }).setOrigin(0.5);

    const titleButton = this.add.text(width / 2 + 100, 320, '🏠 TITLE', {
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#2196F3',
      padding: { left: 30, right: 30, top: 10, bottom: 10 }
    }).setOrigin(0.5);

    retryButton.setInteractive({ useHandCursor: true });
    titleButton.setInteractive({ useHandCursor: true });

    retryButton.on('pointerover', () => retryButton.setScale(1.1));
    retryButton.on('pointerout', () => retryButton.setScale(1));
    retryButton.on('pointerdown', () => {
      this.removeNameInput();
      this.scene.start('GameScene');
    });

    titleButton.on('pointerover', () => titleButton.setScale(1.1));
    titleButton.on('pointerout', () => titleButton.setScale(1));
    titleButton.on('pointerdown', () => {
      this.removeNameInput();
      this.scene.start('TitleScene');
    });

    this.displayRanking();
    
    // オンラインランキングも表示
    this.displayOnlineRanking();
  }

  saveHighScore() {
    const highScores = this.getHighScores();
    highScores.push({
      name: this.playerName || '名無しのスバル',
      score: this.score,
      distance: this.distance,
      date: new Date().toLocaleDateString('ja-JP')
    });
    
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(10); // 10位まで保存
    
    localStorage.setItem('subaruGameHighScores', JSON.stringify(highScores));
  }

  getHighScores(): Array<{ name: string; score: number; distance: number; date: string }> {
    const stored = localStorage.getItem('subaruGameHighScores');
    return stored ? JSON.parse(stored) : [];
  }

  displayRanking() {
    const { width } = this.cameras.main;
    const highScores = this.getHighScores();
    
    this.add.text(width / 2, 380, '🏆 HIGH SCORES 🏆', {
      fontSize: '24px',
      color: '#FF69B4',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const rankingContainer = this.add.container(width / 2, 420);
    
    highScores.slice(0, 5).forEach((score, index) => {
      const isCurrentScore = score.score === this.score && !this.playerName;
      const color = isCurrentScore ? '#FF6B35' : '#666666';
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      
      const rankText = this.add.text(
        -200,
        index * 30,
        `${medal} ${score.name}`,
        {
          fontSize: '18px',
          color: color,
          fontStyle: isCurrentScore ? 'bold' : 'normal'
        }
      );
      
      const scoreText = this.add.text(
        200,
        index * 30,
        `${score.score}点`,
        {
          fontSize: '18px',
          color: color,
          fontStyle: isCurrentScore ? 'bold' : 'normal'
        }
      ).setOrigin(1, 0);
      
      rankingContainer.add([rankText, scoreText]);
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // グラデーション背景
    const graphics = this.add.graphics();
    const color1 = 0xFFE4E1; // ピンク
    const color2 = 0xFFF8DC; // クリーム色
    
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = Math.floor(((color1 >> 16) & 0xFF) * (1 - ratio) + ((color2 >> 16) & 0xFF) * ratio);
      const g = Math.floor(((color1 >> 8) & 0xFF) * (1 - ratio) + ((color2 >> 8) & 0xFF) * ratio);
      const b = Math.floor((color1 & 0xFF) * (1 - ratio) + (color2 & 0xFF) * ratio);
      const color = (r << 16) | (g << 8) | b;
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i, width, 1);
    }
    
    // 紙吹雪エフェクト
    for (let i = 0; i < 20; i++) {
      const confetti = this.add.text(
        Math.random() * width,
        -20,
        ['🎊', '🎉', '✨', '🌟'][Math.floor(Math.random() * 4)],
        { fontSize: '20px' }
      );
      
      this.tweens.add({
        targets: confetti,
        y: height + 20,
        x: confetti.x + (Math.random() - 0.5) * 100,
        angle: Math.random() * 360,
        duration: 3000 + Math.random() * 2000,
        repeat: -1,
        delay: Math.random() * 3000
      });
    }
  }

  createNameInput() {
    const { width } = this.cameras.main;
    
    this.add.text(width / 2, 260, '名前を入力してランキングに登録！', {
      fontSize: '18px',
      color: '#FF69B4'
    }).setOrigin(0.5);
    
    // HTML入力フィールドを作成
    this.nameInputElement = document.createElement('input');
    this.nameInputElement.type = 'text';
    this.nameInputElement.placeholder = 'あなたの名前';
    this.nameInputElement.maxLength = 10;
    this.nameInputElement.style.position = 'absolute';
    this.nameInputElement.style.left = `${width / 2 - 100}px`;
    this.nameInputElement.style.top = '280px';
    this.nameInputElement.style.width = '200px';
    this.nameInputElement.style.height = '30px';
    this.nameInputElement.style.fontSize = '18px';
    this.nameInputElement.style.textAlign = 'center';
    this.nameInputElement.style.border = '2px solid #FF69B4';
    this.nameInputElement.style.borderRadius = '5px';
    this.nameInputElement.style.outline = 'none';
    
    // 登録ボタンを作成
    this.registerButton = document.createElement('button');
    this.registerButton.textContent = '名前登録';
    this.registerButton.style.position = 'absolute';
    this.registerButton.style.left = `${width / 2 + 120}px`;
    this.registerButton.style.top = '280px';
    this.registerButton.style.width = '80px';
    this.registerButton.style.height = '30px';
    this.registerButton.style.fontSize = '16px';
    this.registerButton.style.backgroundColor = '#FF69B4';
    this.registerButton.style.color = '#FFFFFF';
    this.registerButton.style.border = 'none';
    this.registerButton.style.borderRadius = '5px';
    this.registerButton.style.cursor = 'pointer';
    this.registerButton.style.fontWeight = 'bold';
    
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.appendChild(this.nameInputElement);
      gameContainer.appendChild(this.registerButton);
      
      // 日本語入力開始
      this.nameInputElement.addEventListener('compositionstart', () => {
        this.isComposing = true;
      });
      
      // 日本語入力終了
      this.nameInputElement.addEventListener('compositionend', () => {
        this.isComposing = false;
      });
      
      // 登録ボタンクリック
      this.registerButton.addEventListener('click', () => {
        this.registerName();
      });
      
      // Enterキーでも登録
      this.nameInputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !this.isComposing) {
          this.registerName();
        }
      });
    }
  }

  registerName() {
    if (this.hasRegistered || !this.nameInputElement) return;
    
    this.playerName = this.nameInputElement.value.trim();
    
    if (this.playerName) {
      this.hasRegistered = true;
      
      // 登録完了の表示
      if (this.registerButton) {
        this.registerButton.textContent = '登録済み';
        this.registerButton.disabled = true;
        this.registerButton.style.backgroundColor = '#999999';
        this.registerButton.style.cursor = 'default';
      }
      
      if (this.nameInputElement) {
        this.nameInputElement.disabled = true;
        this.nameInputElement.style.backgroundColor = '#f0f0f0';
      }
      
      // ランキングに保存
      this.saveHighScore();
      this.displayRanking();
      
      // オンラインランキングにも送信
      OnlineRanking.submitScore({
        name: this.playerName,
        score: this.score,
        distance: this.distance,
        date: new Date().toLocaleDateString('ja-JP')
      });
      this.displayOnlineRanking();
      
      // 登録完了メッセージ
      this.showRegistrationComplete();
    }
  }
  
  showRegistrationComplete() {
    const { width, height } = this.cameras.main;
    
    const message = this.add.text(width / 2, height / 2 - 100, '✅ 登録完了！', {
      fontSize: '24px',
      color: '#00FF00',
      backgroundColor: '#000000AA',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: message,
      y: height / 2 - 150,
      alpha: 0,
      duration: 2000,
      onComplete: () => message.destroy()
    });
  }

  removeNameInput() {
    if (this.nameInputElement && this.nameInputElement.parentNode) {
      this.nameInputElement.parentNode.removeChild(this.nameInputElement);
      this.nameInputElement = undefined;
    }
    if (this.registerButton && this.registerButton.parentNode) {
      this.registerButton.parentNode.removeChild(this.registerButton);
      this.registerButton = undefined;
    }
  }

  displayOnlineRanking() {
    const { width } = this.cameras.main;
    
    // 既存のオンラインランキング表示を削除
    const existingContainer = this.children.getByName('onlineRankingContainer');
    if (existingContainer) {
      existingContainer.destroy();
    }
    
    // オンラインランキングのタイトル
    const onlineTitle = this.add.text(width - 200, 120, '🌐 オンラインランキング', {
      fontSize: '20px',
      color: '#FF69B4',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    const onlineContainer = this.add.container(width - 200, 160);
    onlineContainer.name = 'onlineRankingContainer';
    onlineContainer.add(onlineTitle);
    
    // トップ10を取得
    const topRankings = OnlineRanking.getTopRankings(10);
    const userRank = OnlineRanking.getUserRank(this.score);
    
    topRankings.forEach((entry, index) => {
      const isCurrentUser = entry.score === this.score && entry.name === this.playerName;
      const color = isCurrentUser ? '#FF6B35' : '#666666';
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      
      const text = this.add.text(
        0,
        index * 25,
        `${medal} ${entry.name.substring(0, 8)}... ${entry.score}`,
        {
          fontSize: '14px',
          color: color,
          fontStyle: isCurrentUser ? 'bold' : 'normal'
        }
      ).setOrigin(0.5);
      
      onlineContainer.add(text);
    });
    
    // ユーザーの順位を表示
    if (userRank > 10) {
      const userRankText = this.add.text(
        0,
        260,
        `あなたの順位: ${userRank}位`,
        {
          fontSize: '16px',
          color: '#FF6B35',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      
      onlineContainer.add(userRankText);
    }
  }
}