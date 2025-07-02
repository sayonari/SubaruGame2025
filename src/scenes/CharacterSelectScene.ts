import Phaser from 'phaser';
import { GameStats } from '../utils/GameStats';
import { CHARACTERS } from '../utils/Characters';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedCharacter: string = 'subaru';
  private characterSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    const stats = GameStats.getStats();
    this.selectedCharacter = stats.currentCharacter;
    
    // 背景
    this.createBackground();
    
    // タイトル
    this.add.text(width / 2, 50, '✨ キャラクター選択 ✨', {
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold',
      stroke: '#FFFFFF',
      strokeThickness: 4
    }).setOrigin(0.5);
    
    // キャラクター表示
    this.displayCharacters();
    
    // 戻るボタン
    const backButton = this.add.text(100, height - 50, '← 戻る', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#4CAF50',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    backButton.setInteractive({ useHandCursor: true });
    backButton.on('pointerdown', () => {
      this.scene.start('TitleScene');
    });
    
    // プレイボタン
    const playButton = this.add.text(width - 100, height - 50, 'プレイ →', {
      fontSize: '24px',
      color: '#FFFFFF',
      backgroundColor: '#FF6B35',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    playButton.setInteractive({ useHandCursor: true });
    playButton.on('pointerdown', () => {
      GameStats.setCurrentCharacter(this.selectedCharacter);
      this.scene.start('GameScene');
    });
  }
  
  createBackground() {
    const { width, height } = this.cameras.main;
    const graphics = this.add.graphics();
    
    // グラデーション背景
    const color1 = 0x1E3A8A; // 濃い青
    const color2 = 0x60A5FA; // 明るい青
    
    for (let i = 0; i < height; i++) {
      const ratio = i / height;
      const r = Math.floor(((color1 >> 16) & 0xFF) * (1 - ratio) + ((color2 >> 16) & 0xFF) * ratio);
      const g = Math.floor(((color1 >> 8) & 0xFF) * (1 - ratio) + ((color2 >> 8) & 0xFF) * ratio);
      const b = Math.floor((color1 & 0xFF) * (1 - ratio) + (color2 & 0xFF) * ratio);
      const color = (r << 16) | (g << 8) | b;
      
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, i, width, 1);
    }
  }
  
  displayCharacters() {
    const { width } = this.cameras.main;
    const stats = GameStats.getStats();
    
    let row = 0;
    let col = 0;
    const maxCols = 3;
    const cardWidth = 200;
    const cardHeight = 250;
    const spacing = 20;
    
    CHARACTERS.forEach((character, index) => {
      const isUnlocked = stats.unlockedCharacters.includes(character.id);
      const isSelected = character.id === this.selectedCharacter;
      
      // カードの位置計算
      col = index % maxCols;
      row = Math.floor(index / maxCols);
      const x = width / 2 + (col - 1) * (cardWidth + spacing);
      const y = 200 + row * (cardHeight + spacing);
      
      // カードコンテナ
      const cardContainer = this.add.container(x, y);
      this.characterSprites.set(character.id, cardContainer);
      
      // カード背景
      const cardBg = this.add.rectangle(0, 0, cardWidth, cardHeight, 
        isUnlocked ? this.getRarityColor(character.rarity) : 0x333333,
        isUnlocked ? 0.9 : 0.5
      );
      
      if (isSelected) {
        cardBg.setStrokeStyle(4, 0xFFD700);
      } else {
        cardBg.setStrokeStyle(2, 0x666666);
      }
      
      cardContainer.add(cardBg);
      
      // キャラクター画像（または？マーク）
      if (isUnlocked) {
        const charSprite = this.add.image(0, -50, 'subaru');
        charSprite.setScale(1.2);
        cardContainer.add(charSprite);
      } else {
        const lockText = this.add.text(0, -50, '🔒', {
          fontSize: '60px'
        }).setOrigin(0.5);
        cardContainer.add(lockText);
      }
      
      // キャラクター名
      const nameText = this.add.text(0, 20, character.name, {
        fontSize: '18px',
        color: isUnlocked ? '#FFFFFF' : '#666666',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      cardContainer.add(nameText);
      
      // 説明
      const descText = this.add.text(0, 45, character.description, {
        fontSize: '14px',
        color: isUnlocked ? '#CCCCCC' : '#444444',
        align: 'center',
        wordWrap: { width: 180 }
      }).setOrigin(0.5);
      cardContainer.add(descText);
      
      // 能力値
      if (isUnlocked) {
        const statsText = this.add.text(0, 85, 
          `速度: ${this.getStars(character.speed)}\nジャンプ: ${this.getStars(character.jump)}`,
          {
            fontSize: '14px',
            color: '#FFD700',
            align: 'center'
          }
        ).setOrigin(0.5);
        cardContainer.add(statsText);
        
        if (character.special) {
          const specialText = this.add.text(0, 115, character.special, {
            fontSize: '12px',
            color: '#00FF00',
            align: 'center',
            wordWrap: { width: 180 }
          }).setOrigin(0.5);
          cardContainer.add(specialText);
        }
      } else if (character.unlockCondition) {
        const unlockText = this.add.text(0, 85, `解放条件:\n${character.unlockCondition}`, {
          fontSize: '12px',
          color: '#FF6666',
          align: 'center',
          wordWrap: { width: 180 }
        }).setOrigin(0.5);
        cardContainer.add(unlockText);
      }
      
      // クリック可能にする
      if (isUnlocked) {
        cardBg.setInteractive({ useHandCursor: true });
        
        cardBg.on('pointerover', () => {
          if (!isSelected) {
            cardContainer.setScale(1.05);
          }
        });
        
        cardBg.on('pointerout', () => {
          cardContainer.setScale(1);
        });
        
        cardBg.on('pointerdown', () => {
          this.selectCharacter(character.id);
        });
      }
      
      // 選択中の場合はアニメーション
      if (isSelected) {
        this.tweens.add({
          targets: cardContainer,
          y: y - 5,
          duration: 1000,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.inOut'
        });
      }
    });
  }
  
  selectCharacter(characterId: string) {
    // 前の選択を解除
    const prevCard = this.characterSprites.get(this.selectedCharacter);
    if (prevCard) {
      const prevBg = prevCard.list[0] as Phaser.GameObjects.Rectangle;
      prevBg.setStrokeStyle(2, 0x666666);
      this.tweens.killTweensOf(prevCard);
      prevCard.y = prevCard.getData('originalY') || prevCard.y;
    }
    
    // 新しい選択
    this.selectedCharacter = characterId;
    const newCard = this.characterSprites.get(characterId);
    if (newCard) {
      const newBg = newCard.list[0] as Phaser.GameObjects.Rectangle;
      newBg.setStrokeStyle(4, 0xFFD700);
      
      // 元の位置を保存
      if (!newCard.getData('originalY')) {
        newCard.setData('originalY', newCard.y);
      }
      
      // アニメーション
      this.tweens.add({
        targets: newCard,
        y: newCard.y - 5,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
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
  
  getStars(value: number): string {
    const stars = Math.round(value * 5);
    return '⭐'.repeat(stars);
  }
}