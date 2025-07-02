import Phaser from 'phaser';
import { GameStats } from '../utils/GameStats';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TitleScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const stats = GameStats.getStats();

    // 可愛い背景
    this.createBackground();
    
    // プレイ回数による特別演出
    if (stats.totalPlays >= 10) {
      this.addSpecialEffects(stats.totalPlays);
    }
    
    // 日替わりボーナスチェック
    const dailyBonus = GameStats.checkDailyBonus();
    if (dailyBonus) {
      this.showDailyBonus(dailyBonus);
    }
    
    // タイトル
    const titleText = stats.totalPlays >= 50 ? 'スバルのしゅばしゅばマスター' : 'スバルのしゅばしゅば大冒険';
    const title = this.add.text(width / 2, height / 3, titleText, {
      fontSize: '40px',
      color: stats.totalPlays >= 20 ? '#FFD700' : '#FF6B9D',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 6
    }).setOrigin(0.5);
    
    // タイトルアニメーション
    this.tweens.add({
      targets: title,
      y: height / 3 - 10,
      duration: 2000,
      ease: 'Sine.inOut',
      yoyo: true,
      repeat: -1
    });

    this.add.text(width / 2, height / 2, '画面をタップ/クリックして進む！', {
      fontSize: '20px',
      color: '#FFFFFF',
      backgroundColor: '#FF69B4',
      padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5);

    // キャラクター選択ボタン
    const charSelectButton = this.add.text(width / 2, height * 0.6, '🎮 キャラクター選択', {
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: '#9400D3',
      padding: { left: 30, right: 30, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    charSelectButton.setInteractive({ useHandCursor: true });
    
    charSelectButton.on('pointerover', () => {
      charSelectButton.setScale(1.1);
    });
    
    charSelectButton.on('pointerout', () => {
      charSelectButton.setScale(1);
    });
    
    charSelectButton.on('pointerdown', () => {
      this.scene.start('CharacterSelectScene');
    });

    const startButton = this.add.text(width / 2, height * 0.75, '✨ クイックスタート ✨', {
      fontSize: '36px',
      color: '#FFFFFF',
      backgroundColor: '#FF6B35',
      padding: { left: 40, right: 40, top: 10, bottom: 10 }
    }).setOrigin(0.5);

    startButton.setInteractive({ useHandCursor: true });

    startButton.on('pointerover', () => {
      startButton.setScale(1.1);
      this.tweens.add({
        targets: startButton,
        angle: { from: -5, to: 5 },
        duration: 100,
        yoyo: true,
        repeat: 2
      });
    });

    startButton.on('pointerout', () => {
      startButton.setScale(1);
      startButton.setAngle(0);
    });

    startButton.on('pointerdown', () => {
      const playCount = GameStats.incrementPlayCount();
      const milestone = GameStats.checkMilestone(playCount);
      
      if (milestone) {
        this.showMilestoneMessage(milestone);
        this.time.delayedCall(2000, () => {
          this.scene.start('GameScene');
        });
      } else {
        this.scene.start('GameScene');
      }
    });

    // ガチャボタン
    const gachaButton = this.add.text(width - 100, 50, '🎰 ガチャ', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#9400D3',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    gachaButton.setInteractive({ useHandCursor: true });
    gachaButton.on('pointerover', () => gachaButton.setScale(1.1));
    gachaButton.on('pointerout', () => gachaButton.setScale(1));
    gachaButton.on('pointerdown', () => {
      this.scene.start('GachaScene');
    });
    
    // 統計情報表示
    this.add.text(100, 50, `コイン: ${stats.coins}`, {
      fontSize: '20px',
      color: '#FFD700'
    }).setOrigin(0.5);

    // 誕生日メッセージをより目立たせる
    const birthdayBg = this.add.rectangle(width / 2, height - 50, 450, 40, 0xFFFFFF, 0.8);
    birthdayBg.setStrokeStyle(2, 0xFF69B4);
    
    const birthdayText = this.add.text(width / 2, height - 50, '🎂 2025.7.2 大空スバル誕生日記念 🎂', {
      fontSize: '18px',
      color: '#FF1493',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    // 誕生日メッセージの点滅
    this.tweens.add({
      targets: [birthdayBg, birthdayText],
      alpha: { from: 0.8, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1
    });
  }

  createBackground() {
    const { width, height } = this.cameras.main;
    
    // グラデーション背景
    const graphics = this.add.graphics();
    const color1 = 0xFFE4E1; // ピンク
    const color2 = 0xADD8E6; // 水色
    
    // 背景の描画
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = Math.floor(((color1 >> 16) & 0xFF) * (1 - ratio) + ((color2 >> 16) & 0xFF) * ratio);
      const g = Math.floor(((color1 >> 8) & 0xFF) * (1 - ratio) + ((color2 >> 8) & 0xFF) * ratio);
      const b = Math.floor((color1 & 0xFF) * (1 - ratio) + (color2 & 0xFF) * ratio);
      const color = (r << 16) | (g << 8) | b;
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i, width, 1);
    }
    
    // 装飾の雲
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height * 0.5;
      this.createCloud(x, y);
    }
    
    // カラフルな風船を追加
    this.createBalloons();
    
    // キラキラ効果
    for (let i = 0; i < 10; i++) {
      const star = this.add.text(
        Math.random() * width,
        Math.random() * height,
        '✨',
        { fontSize: '24px' }
      );
      
      this.tweens.add({
        targets: star,
        alpha: { from: 0.3, to: 1 },
        duration: 1000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 1000
      });
    }
  }

  createCloud(x: number, y: number) {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(x, y, 30);
    graphics.fillCircle(x - 20, y + 5, 25);
    graphics.fillCircle(x + 20, y + 5, 25);
    graphics.fillCircle(x - 10, y - 10, 20);
    graphics.fillCircle(x + 10, y - 10, 20);
  }

  addSpecialEffects(playCount: number) {
    const { width, height } = this.cameras.main;
    
    if (playCount >= 10) {
      // 10回プレイで虹を追加
      const rainbow = this.add.graphics();
      const colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
      
      colors.forEach((color, i) => {
        rainbow.lineStyle(10, color, 0.5);
        rainbow.beginPath();
        rainbow.arc(width / 2, height, 200 + i * 10, Math.PI, 0, true);
        rainbow.strokePath();
      });
    }
    
    if (playCount >= 20) {
      // 20回プレイで動くスバルちゃんを追加
      const floatingSubaru = this.add.image(100, 100, 'subaru');
      floatingSubaru.setScale(0.5);
      
      this.tweens.add({
        targets: floatingSubaru,
        x: width - 100,
        y: 150,
        duration: 5000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
    
    if (playCount >= 50) {
      // 50回プレイで花火エフェクト
      this.time.addEvent({
        delay: 3000,
        callback: () => this.createFirework(),
        loop: true
      });
    }
  }

  createFirework() {
    const { width, height } = this.cameras.main;
    const x = Math.random() * width;
    const y = Math.random() * height * 0.5;
    
    const colors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    for (let i = 0; i < 12; i++) {
      const particle = this.add.circle(x, y, 4, color);
      const angle = (i / 12) * Math.PI * 2;
      
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 100,
        y: y + Math.sin(angle) * 100,
        alpha: 0,
        duration: 1000,
        onComplete: () => particle.destroy()
      });
    }
  }

  showMilestoneMessage(message: string) {
    const { width, height } = this.cameras.main;
    
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    const text = this.add.text(width / 2, height / 2, message, {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: text,
      scale: { from: 0, to: 1.2 },
      duration: 1000,
      ease: 'Back.out'
    });
  }
  
  showDailyBonus(bonus: { coins: number; streak: number }) {
    const { width, height } = this.cameras.main;
    
    const container = this.add.container(width / 2, height / 2);
    
    const bg = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.9);
    container.add(bg);
    
    const title = this.add.text(0, -100, '🎁 デイリーボーナス 🎁', {
      fontSize: '32px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    container.add(title);
    
    const coinsText = this.add.text(0, -30, `+${bonus.coins} コイン獲得！`, {
      fontSize: '28px',
      color: '#FFD700'
    }).setOrigin(0.5);
    container.add(coinsText);
    
    const streakText = this.add.text(0, 20, `ログイン ${bonus.streak} 日目！`, {
      fontSize: '24px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    container.add(streakText);
    
    if (bonus.streak >= 7) {
      const bonusText = this.add.text(0, 60, '7日連続ボーナス達成！', {
        fontSize: '20px',
        color: '#FF69B4'
      }).setOrigin(0.5);
      container.add(bonusText);
    }
    
    // アニメーション
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scale: 1,
      duration: 500,
      ease: 'Back.out'
    });
    
    // 3秒後に自動で閉じる
    this.time.delayedCall(3000, () => {
      this.tweens.add({
        targets: container,
        alpha: 0,
        duration: 500,
        onComplete: () => container.destroy()
      });
    });
  }

  createBalloons() {
    const { width, height } = this.cameras.main;
    const balloonColors = [
      0xFF6B6B, // 赤
      0x4ECDC4, // ターコイズ
      0x45B7D1, // 青
      0xF7DC6F, // 黄色
      0xBB8FCE, // 紫
      0xFF69B4, // ピンク
      0x52BE80, // 緑
      0xF39C12, // オレンジ
    ];

    // 初期配置の風船
    for (let i = 0; i < 15; i++) {
      this.createBalloon(
        Math.random() * width,
        height + Math.random() * 200,
        balloonColors[Math.floor(Math.random() * balloonColors.length)],
        3000 + Math.random() * 2000
      );
    }

    // 定期的に新しい風船を生成
    this.time.addEvent({
      delay: 800,
      callback: () => {
        this.createBalloon(
          Math.random() * width,
          height + 100,
          balloonColors[Math.floor(Math.random() * balloonColors.length)],
          4000 + Math.random() * 2000
        );
      },
      loop: true
    });
  }

  createBalloon(x: number, y: number, color: number, duration: number) {
    const graphics = this.add.graphics();
    
    // 風船の本体
    graphics.fillStyle(color, 0.9);
    graphics.fillEllipse(0, 0, 40, 50);
    
    // ハイライト
    graphics.fillStyle(0xFFFFFF, 0.4);
    graphics.fillEllipse(-10, -15, 15, 20);
    
    // 小さなハイライト
    graphics.fillStyle(0xFFFFFF, 0.6);
    graphics.fillCircle(-5, -20, 5);
    
    // 紐
    graphics.lineStyle(1.5, color * 0.8, 0.6);
    graphics.beginPath();
    graphics.moveTo(0, 25);
    graphics.lineTo(2, 35);
    graphics.lineTo(-2, 45);
    graphics.lineTo(0, 60);
    graphics.strokePath();
    
    // コンテナに入れる
    const balloon = this.add.container(x, y, [graphics]);
    
    // 揺れながら上昇するアニメーション
    this.tweens.add({
      targets: balloon,
      y: -100,
      x: x + Math.sin(Math.random() * Math.PI) * 50,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        balloon.destroy();
      }
    });
    
    // 左右に揺れる
    this.tweens.add({
      targets: balloon,
      x: x + 30,
      duration: 1000 + Math.random() * 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });
    
    // サイズの変化
    balloon.setScale(0.8 + Math.random() * 0.4);
  }
}