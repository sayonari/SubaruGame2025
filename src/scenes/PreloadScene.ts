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
    
    // スバルちゃん（アヒル風）- 基本キャラクター
    this.createSubaruDuck(graphics);
    graphics.generateTexture('subaru', 100, 100);
    
    // しゅばダック - 完全にアヒルモード（より丸くて黄色い）
    graphics.clear();
    this.createShubaDuck(graphics);
    graphics.generateTexture('shuba_duck', 100, 100);
    
    // OMAE - スバルちゃんの相棒（茶色系）
    graphics.clear();
    this.createOmaeDuck(graphics);
    graphics.generateTexture('omae', 100, 100);
    
    // 水着スバル - 夏の特別衣装（水色系）
    graphics.clear();
    this.createSummerSubaru(graphics);
    graphics.generateTexture('summer_subaru', 100, 100);
    
    // アイドルスバル - キラキラ衣装（ピンク系）
    graphics.clear();
    this.createIdolSubaru(graphics);
    graphics.generateTexture('idol_subaru', 100, 100);
    
    // ゴールデンスバル - 伝説のスバル（金色）
    graphics.clear();
    this.createGoldenSubaru(graphics);
    graphics.generateTexture('golden_subaru', 100, 100);
    
    // シャドウスバル - 謎の黒いスバル
    graphics.clear();
    this.createShadowSubaru(graphics);
    graphics.generateTexture('shadow_subaru', 100, 100);
    
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
    
    // 爆弾（コインを減らす障害物）
    graphics.clear();
    graphics.fillStyle(0x2C2C2C, 1);
    graphics.fillCircle(20, 20, 15);
    graphics.fillStyle(0x1A1A1A, 1);
    graphics.fillCircle(20, 20, 12);
    
    // 導火線
    graphics.lineStyle(3, 0x8B4513, 1);
    graphics.beginPath();
    graphics.moveTo(20, 5);
    graphics.lineTo(25, 0);
    graphics.stroke();
    
    // 火花
    graphics.fillStyle(0xFF4500, 1);
    graphics.fillCircle(26, -2, 3);
    graphics.fillStyle(0xFFFF00, 1);
    graphics.fillCircle(26, -2, 2);
    
    graphics.generateTexture('bomb', 40, 40);
    
    // 地面用の透明なテクスチャ
    graphics.clear();
    graphics.fillStyle(0xFFFFFF, 0);
    graphics.fillRect(0, 0, 1, 1);
    graphics.generateTexture('ground', 1, 1);
    
    graphics.destroy();
  }

  createSubaruDuck(graphics: Phaser.GameObjects.Graphics) {
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
  }

  createShubaDuck(graphics: Phaser.GameObjects.Graphics) {
    // より丸い体（完全アヒルモード）
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(50, 50, 30);
    graphics.fillCircle(50, 35, 22);
    
    // 大きなくちばし
    graphics.fillStyle(0xFF6600, 1);
    graphics.fillTriangle(25, 35, 15, 40, 25, 45);
    
    // 丸い目
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(38, 30, 5);
    graphics.fillCircle(58, 30, 5);
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(40, 28, 3);
    graphics.fillCircle(60, 28, 3);
    
    // 羽（より大きく）
    graphics.fillStyle(0xFFA500, 1);
    graphics.fillEllipse(20, 50, 12, 18);
    graphics.fillEllipse(80, 50, 12, 18);
    
    // 足
    graphics.fillStyle(0xFF6600, 1);
    graphics.fillRect(38, 75, 8, 12);
    graphics.fillRect(54, 75, 8, 12);
  }

  createOmaeDuck(graphics: Phaser.GameObjects.Graphics) {
    // 茶色の体
    graphics.fillStyle(0x8B4513, 1);
    graphics.fillCircle(50, 55, 25);
    graphics.fillCircle(50, 35, 20);
    
    // くちばし
    graphics.fillStyle(0xD2691E, 1);
    graphics.fillTriangle(30, 35, 20, 40, 30, 45);
    
    // 目（少し眠そう）
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(40, 33, 3);
    graphics.fillCircle(55, 33, 3);
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(41, 31, 1.5);
    graphics.fillCircle(56, 31, 1.5);
    
    // 羽
    graphics.fillStyle(0x654321, 1);
    graphics.fillEllipse(25, 55, 10, 15);
    graphics.fillEllipse(75, 55, 10, 15);
    
    // 足
    graphics.fillStyle(0xD2691E, 1);
    graphics.fillRect(40, 75, 6, 10);
    graphics.fillRect(54, 75, 6, 10);
  }

  createSummerSubaru(graphics: Phaser.GameObjects.Graphics) {
    // 水色の体
    graphics.fillStyle(0x00CED1, 1);
    graphics.fillCircle(50, 55, 25);
    graphics.fillCircle(50, 35, 20);
    
    // くちばし
    graphics.fillStyle(0xFF69B4, 1);
    graphics.fillTriangle(30, 35, 20, 40, 30, 45);
    
    // サングラス風の目
    graphics.fillStyle(0x000080, 1);
    graphics.fillEllipse(40, 32, 6, 4);
    graphics.fillEllipse(55, 32, 6, 4);
    graphics.lineStyle(2, 0x000080, 1);
    graphics.lineBetween(46, 32, 49, 32);
    
    // 水玉模様
    graphics.fillStyle(0xFFFFFF, 0.5);
    graphics.fillCircle(45, 50, 3);
    graphics.fillCircle(55, 60, 3);
    graphics.fillCircle(60, 45, 3);
    
    // 羽
    graphics.fillStyle(0x1E90FF, 1);
    graphics.fillEllipse(25, 55, 10, 15);
    graphics.fillEllipse(75, 55, 10, 15);
    
    // 足
    graphics.fillStyle(0xFF69B4, 1);
    graphics.fillRect(40, 75, 6, 10);
    graphics.fillRect(54, 75, 6, 10);
  }

  createIdolSubaru(graphics: Phaser.GameObjects.Graphics) {
    // ピンクの体
    graphics.fillStyle(0xFFB6C1, 1);
    graphics.fillCircle(50, 55, 25);
    graphics.fillCircle(50, 35, 20);
    
    // くちばし
    graphics.fillStyle(0xFF1493, 1);
    graphics.fillTriangle(30, 35, 20, 40, 30, 45);
    
    // キラキラの目
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(40, 32, 4);
    graphics.fillCircle(55, 32, 4);
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(42, 30, 2);
    graphics.fillCircle(57, 30, 2);
    
    // ハート模様
    graphics.fillStyle(0xFF69B4, 0.8);
    graphics.fillCircle(35, 50, 3);
    graphics.fillCircle(40, 50, 3);
    graphics.fillTriangle(35, 52, 40, 52, 37.5, 56);
    
    // リボン（頭の上）
    graphics.fillStyle(0xFF1493, 1);
    graphics.fillTriangle(45, 15, 50, 20, 40, 20);
    graphics.fillTriangle(55, 15, 50, 20, 60, 20);
    graphics.fillRect(47, 18, 6, 4);
    
    // 羽
    graphics.fillStyle(0xFFDAB9, 1);
    graphics.fillEllipse(25, 55, 10, 15);
    graphics.fillEllipse(75, 55, 10, 15);
    
    // 足
    graphics.fillStyle(0xFF1493, 1);
    graphics.fillRect(40, 75, 6, 10);
    graphics.fillRect(54, 75, 6, 10);
  }

  createGoldenSubaru(graphics: Phaser.GameObjects.Graphics) {
    // 金色の体
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillCircle(50, 55, 25);
    graphics.fillCircle(50, 35, 20);
    
    // くちばし
    graphics.fillStyle(0xFFA500, 1);
    graphics.fillTriangle(30, 35, 20, 40, 30, 45);
    
    // 輝く目
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(40, 32, 4);
    graphics.fillCircle(55, 32, 4);
    graphics.fillStyle(0xFFFFFF, 1);
    graphics.fillCircle(42, 30, 3);
    graphics.fillCircle(57, 30, 3);
    
    // 王冠
    graphics.fillStyle(0xFFD700, 1);
    graphics.fillRect(40, 10, 20, 8);
    graphics.fillTriangle(40, 10, 43, 5, 46, 10);
    graphics.fillTriangle(47, 10, 50, 5, 53, 10);
    graphics.fillTriangle(54, 10, 57, 5, 60, 10);
    
    // 輝きエフェクト
    graphics.lineStyle(2, 0xFFFFFF, 0.5);
    graphics.strokeCircle(50, 45, 35);
    
    // 羽
    graphics.fillStyle(0xFFC700, 1);
    graphics.fillEllipse(25, 55, 10, 15);
    graphics.fillEllipse(75, 55, 10, 15);
    
    // 足
    graphics.fillStyle(0xFFA500, 1);
    graphics.fillRect(40, 75, 6, 10);
    graphics.fillRect(54, 75, 6, 10);
  }

  createShadowSubaru(graphics: Phaser.GameObjects.Graphics) {
    // 黒い体
    graphics.fillStyle(0x2C2C2C, 1);
    graphics.fillCircle(50, 55, 25);
    graphics.fillCircle(50, 35, 20);
    
    // 暗いくちばし
    graphics.fillStyle(0x4B0082, 1);
    graphics.fillTriangle(30, 35, 20, 40, 30, 45);
    
    // 赤く光る目
    graphics.fillStyle(0xFF0000, 1);
    graphics.fillCircle(40, 32, 4);
    graphics.fillCircle(55, 32, 4);
    graphics.fillStyle(0xFFFFFF, 0.8);
    graphics.fillCircle(42, 30, 1);
    graphics.fillCircle(57, 30, 1);
    
    // 紫のオーラ
    graphics.lineStyle(3, 0x9400D3, 0.5);
    graphics.strokeCircle(50, 45, 35);
    
    // 羽
    graphics.fillStyle(0x1C1C1C, 1);
    graphics.fillEllipse(25, 55, 10, 15);
    graphics.fillEllipse(75, 55, 10, 15);
    
    // 足
    graphics.fillStyle(0x4B0082, 1);
    graphics.fillRect(40, 75, 6, 10);
    graphics.fillRect(54, 75, 6, 10);
  }

  create() {
    this.scene.start('TitleScene');
  }
}