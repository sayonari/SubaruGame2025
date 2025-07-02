import Phaser from 'phaser';
import { GameStats } from '../utils/GameStats';
import { CHARACTERS } from '../utils/Characters';
import { SoundManager } from '../utils/SoundManager';

export class GachaScene extends Phaser.Scene {
  private soundManager: SoundManager;
  private isRolling: boolean = false;

  constructor() {
    super({ key: 'GachaScene' });
    this.soundManager = new SoundManager();
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // 背景
    this.createBackground();
    
    // タイトル
    this.add.text(width / 2, 60, '✨ キャラクターガチャ ✨', {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // 現在のコイン表示
    const stats = GameStats.getStats();
    const coinText = this.add.text(width / 2, 120, `所持コイン: ${stats.coins}`, {
      fontSize: '24px',
      color: '#FFD700'
    }).setOrigin(0.5);
    
    // ガチャボタン（100コイン）
    const gachaButton = this.add.text(width / 2, height / 2, '🎰 ガチャを回す (100コイン)', {
      fontSize: '32px',
      color: '#FFFFFF',
      backgroundColor: stats.coins >= 100 ? '#FF6B35' : '#999999',
      padding: { left: 30, right: 30, top: 15, bottom: 15 }
    }).setOrigin(0.5);
    
    if (stats.coins >= 100) {
      gachaButton.setInteractive({ useHandCursor: true });
      
      gachaButton.on('pointerover', () => {
        gachaButton.setScale(1.1);
      });
      
      gachaButton.on('pointerout', () => {
        gachaButton.setScale(1);
      });
      
      gachaButton.on('pointerdown', () => {
        if (!this.isRolling && GameStats.spendCoins(100)) {
          this.rollGacha();
          coinText.setText(`所持コイン: ${GameStats.getStats().coins}`);
        }
      });
    }
    
    // 戻るボタン
    const backButton = this.add.text(width / 2, height - 100, '戻る', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { left: 30, right: 30, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
    
    // 所持キャラクター表示
    this.displayOwnedCharacters();
  }
  
  createBackground() {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // グラデーション背景
    const color1 = 0x4B0082; // インディゴ
    const color2 = 0x9400D3; // バイオレット
    
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = Math.floor(((color1 >> 16) & 0xFF) * (1 - ratio) + ((color2 >> 16) & 0xFF) * ratio);
      const g = Math.floor(((color1 >> 8) & 0xFF) * (1 - ratio) + ((color2 >> 8) & 0xFF) * ratio);
      const b = Math.floor((color1 & 0xFF) * (1 - ratio) + (color2 & 0xFF) * ratio);
      const color = (r << 16) | (g << 8) | b;
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i, width, 1);
    }
    
    // キラキラエフェクト
    for (let i = 0; i < 20; i++) {
      const star = this.add.text(
        Math.random() * width,
        Math.random() * height,
        '⭐',
        { fontSize: '16px' }
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
  
  rollGacha() {
    this.isRolling = true;
    const { width, height } = this.cameras.main;
    
    // ガチャ演出
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);
    
    // 回転するカード
    const card = this.add.rectangle(width / 2, height / 2, 200, 300, 0xFFFFFF);
    const cardText = this.add.text(width / 2, height / 2, '?', {
      fontSize: '120px',
      color: '#000000'
    }).setOrigin(0.5);
    
    // 回転アニメーション
    this.tweens.add({
      targets: [card, cardText],
      scaleX: 0,
      duration: 500,
      yoyo: true,
      onYoyo: () => {
        // レアリティに基づいてキャラクターを選択
        const result = this.selectCharacter();
        cardText.setText('');
        const rarityColor = this.getRarityColor(result.rarity);
        card.setFillStyle(rarityColor);
        
        // キャラクター表示
        const charSprite = this.add.image(width / 2, height / 2 - 50, 'subaru');
        charSprite.setScale(1.5);
        
        const nameText = this.add.text(width / 2, height / 2 + 50, result.name, {
          fontSize: '24px',
          color: '#FFFFFF',
          fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const rarityText = this.add.text(width / 2, height / 2 + 80, this.getRarityText(result.rarity), {
          fontSize: '20px',
          color: this.getRarityColorString(result.rarity)
        }).setOrigin(0.5);
        
        // アンロック処理
        GameStats.unlockCharacter(result.id);
        
        // 効果音
        this.soundManager.playSound('item');
        
        // 3秒後に画面をクリア
        this.time.delayedCall(3000, () => {
          overlay.destroy();
          card.destroy();
          cardText.destroy();
          charSprite.destroy();
          nameText.destroy();
          rarityText.destroy();
          this.isRolling = false;
          this.displayOwnedCharacters();
        });
      }
    });
  }
  
  selectCharacter(): typeof CHARACTERS[0] {
    const random = Math.random();
    let rarity: 'common' | 'rare' | 'epic' | 'legendary';
    
    if (random < 0.6) {
      rarity = 'common';
    } else if (random < 0.85) {
      rarity = 'rare';
    } else if (random < 0.98) {
      rarity = 'epic';
    } else {
      rarity = 'legendary';
    }
    
    const availableChars = CHARACTERS.filter(char => 
      char.rarity === rarity && !char.unlockCondition
    );
    
    if (availableChars.length === 0) {
      return CHARACTERS[0]; // デフォルト
    }
    
    return availableChars[Math.floor(Math.random() * availableChars.length)];
  }
  
  getRarityColor(rarity: string): number {
    switch (rarity) {
      case 'common': return 0x808080;
      case 'rare': return 0x0080FF;
      case 'epic': return 0x9400D3;
      case 'legendary': return 0xFFD700;
      default: return 0xFFFFFF;
    }
  }
  
  getRarityColorString(rarity: string): string {
    switch (rarity) {
      case 'common': return '#808080';
      case 'rare': return '#0080FF';
      case 'epic': return '#9400D3';
      case 'legendary': return '#FFD700';
      default: return '#FFFFFF';
    }
  }
  
  getRarityText(rarity: string): string {
    switch (rarity) {
      case 'common': return 'コモン';
      case 'rare': return 'レア';
      case 'epic': return 'エピック';
      case 'legendary': return 'レジェンダリー';
      default: return '';
    }
  }
  
  displayOwnedCharacters() {
    const { width, height } = this.cameras.main;
    const stats = GameStats.getStats();
    
    // 既存の表示をクリア
    const existingContainer = this.children.getByName('characterContainer');
    if (existingContainer) {
      existingContainer.destroy();
    }
    
    const container = this.add.container(width / 2, height - 200);
    container.name = 'characterContainer';
    
    this.add.text(0, -30, '所持キャラクター', {
      fontSize: '20px',
      color: '#FFFFFF'
    }).setOrigin(0.5);
    
    stats.unlockedCharacters.forEach((charId, index) => {
      const char = CHARACTERS.find(c => c.id === charId);
      if (char) {
        const x = (index - stats.unlockedCharacters.length / 2) * 80;
        const charIcon = this.add.rectangle(x, 0, 60, 60, this.getRarityColor(char.rarity));
        const charText = this.add.text(x, 0, char.name.substring(0, 2), {
          fontSize: '16px',
          color: '#FFFFFF'
        }).setOrigin(0.5);
        
        container.add([charIcon, charText]);
      }
    });
  }
}