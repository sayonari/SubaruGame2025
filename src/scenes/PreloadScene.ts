import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.make.text({
      x: width / 2,
      y: height / 2 - 50,
      text: 'Loading...',
      style: {
        font: '20px monospace',
        color: '#ffffff'
      }
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    this.createAssets();
  }

  createAssets() {
    const graphics = this.add.graphics();
    
    // スバルちゃん（アヒル風）
    // 体
    graphics.fillStyle(0xFFE87C, 1);
    graphics.fillCircle(50, 55, 25);
    graphics.fillCircle(50, 35, 20);
    
    // くちばし
    graphics.fillStyle(0xFF8C00, 1);
    graphics.fillTriangle(30, 35, 20, 40, 30, 45);
    
    // 目（キラキラ）
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(40, 32, 4);
    graphics.fillCircle(55, 32, 4);
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(42, 30, 2);
    graphics.fillCircle(57, 30, 2);
    
    // ほっぺ
    graphics.fillStyle(0xFFB6C1, 0.7);
    graphics.fillCircle(30, 40, 5);
    graphics.fillCircle(65, 40, 5);
    
    // 羽
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillEllipse(25, 55, 10, 15);
    graphics.fillEllipse(75, 55, 10, 15);
    
    // 足
    graphics.fillStyle(0xFF8C00, 1);
    graphics.fillRect(40, 75, 6, 10);
    graphics.fillRect(54, 75, 6, 10);
    
    graphics.generateTexture('subaru', 100, 100);
    
    // 障害物（丸太）
    graphics.clear();
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillRoundedRect(0, 0, 80, 25, 12);
    graphics.fillStyle(0x654321, 1);
    graphics.fillCircle(20, 12, 3);
    graphics.fillCircle(40, 12, 3);
    graphics.fillCircle(60, 12, 3);
    graphics.generateTexture('obstacle', 80, 25);
    
    // アイテム（キラキラ星）
    graphics.clear();
    graphics.fillStyle(0xFFD700, 1);
    graphics.beginPath();
    graphics.moveTo(20, 0);
    graphics.lineTo(26, 14);
    graphics.lineTo(40, 16);
    graphics.lineTo(28, 26);
    graphics.lineTo(32, 40);
    graphics.lineTo(20, 30);
    graphics.lineTo(8, 40);
    graphics.lineTo(12, 26);
    graphics.lineTo(0, 16);
    graphics.lineTo(14, 14);
    graphics.closePath();
    graphics.fillPath();
    
    // 星の中心に光を追加
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(20, 20, 5);
    
    graphics.generateTexture('star', 40, 40);
    
    // 地面用の透明なテクスチャ
    graphics.clear();
    graphics.fillStyle(0xFFFFFF, 0);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture('ground', 1, 1);
    
    graphics.destroy();
  }

  create() {
    this.scene.start('TitleScene');
  }
}