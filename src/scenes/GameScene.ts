import Phaser from 'phaser';
import { SoundManager } from '../utils/SoundManager';
import { GameStats } from '../utils/GameStats';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  
  private score: number = 0;
  private distance: number = 0;
  private combo: number = 1;
  private tapCount: number = 0;
  private gameTime: number = 30;
  private isGameOver: boolean = false;
  
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  
  private lastObstacleX: number = 800;
  private playerSpeed: number = 0;
  private maxSpeed: number = 400;
  private soundManager: SoundManager;
  private hasSpawnedGoldenItem: boolean = false;
  private coins: number = 0;
  private coinsText!: Phaser.GameObjects.Text;
  
  constructor() {
    super({ key: 'GameScene' });
    this.soundManager = new SoundManager();
  }

  create() {
    this.setupWorld();
    this.setupPlayer();
    this.setupUI();
    this.setupInput();
    this.startGame();
  }

  setupWorld() {
    this.add.rectangle(400, 300, 800, 600, 0x87CEEB);
    
    this.ground = this.physics.add.staticGroup();
    const platform = this.ground.create(400, 580, 'ground');
    platform.setDisplaySize(800, 40);
    platform.refreshBody();
    this.add.rectangle(400, 580, 800, 40, 0x8FBC8F);
    
    this.obstacles = this.physics.add.group();
    this.items = this.physics.add.group();
  }

  setupPlayer() {
    this.player = this.physics.add.sprite(100, 500, 'subaru');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.2);
    this.player.setScale(0.8);
    
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, this.obstacles, () => {
      this.hitObstacle();
    });
    this.physics.add.overlap(this.player, this.items, (_player, item) => {
      this.collectItem(item as Phaser.Physics.Arcade.Sprite);
    });
  }

  setupUI() {
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#000'
    });
    
    this.comboText = this.add.text(16, 50, 'Combo: x1', {
      fontSize: '20px',
      color: '#000'
    });
    
    this.distanceText = this.add.text(16, 80, 'Distance: 0m', {
      fontSize: '20px',
      color: '#000'
    });
    
    this.timerText = this.add.text(784, 16, 'Time: 30', {
      fontSize: '24px',
      color: '#000'
    }).setOrigin(1, 0);
    
    // 操作説明
    this.add.text(400, 16, '左タップ:ジャンプ / 右タップ:加速', {
      fontSize: '16px',
      color: '#666'
    }).setOrigin(0.5, 0);
    
    // コイン表示
    this.coinsText = this.add.text(16, 110, 'コイン: 0', {
      fontSize: '20px',
      color: '#FFD700'
    });
  }

  setupInput() {
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!this.isGameOver) {
        // 画面の左半分をタップしたらジャンプ、右半分をタップしたら加速
        if (pointer.x < this.cameras.main.width / 2) {
          this.jumpPlayer();
        } else {
          this.tapPlayer();
        }
      }
    });
    
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isGameOver) {
        this.jumpPlayer();
      }
    });
    
    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (!this.isGameOver) {
        this.tapPlayer();
      }
    });
  }

  startGame() {
    // BGMを開始
    this.soundManager.playBGM();
    
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.gameTime--;
        this.timerText.setText(`Time: ${this.gameTime}`);
        
        if (this.gameTime <= 0) {
          this.endGame();
        }
      },
      loop: true
    });
    
    this.time.addEvent({
      delay: 2000,
      callback: () => this.spawnObstacle(),
      loop: true
    });
    
    this.time.addEvent({
      delay: 3000,
      callback: () => this.spawnItem(),
      loop: true
    });
  }

  tapPlayer() {
    this.tapCount++;
    this.playerSpeed = Math.min(this.maxSpeed, this.playerSpeed + 50);
    
    // タップ音を再生
    this.soundManager.playSound('tap');
    
    // タップエフェクト
    this.player.setScale(0.9);
    this.time.delayedCall(100, () => {
      this.player.setScale(0.8);
    });
  }
  
  jumpPlayer() {
    if (this.player.body?.touching.down) {
      this.player.setVelocityY(-400);
      // ジャンプ音を再生
      this.soundManager.playSound('jump');
    }
  }

  spawnObstacle() {
    if (this.isGameOver) return;
    
    const obstacle = this.obstacles.create(
      this.lastObstacleX + Phaser.Math.Between(200, 400),
      540,
      'obstacle'
    );
    obstacle.setVelocityX(-200);
    this.lastObstacleX = obstacle.x;
  }

  spawnItem() {
    if (this.isGameOver) return;
    
    const item = this.items.create(
      Phaser.Math.Between(600, 800),
      Phaser.Math.Between(400, 500),
      'star'
    );
    item.setVelocityX(-200);
    item.setScale(0.8);
  }

  collectItem(item: Phaser.Physics.Arcade.Sprite) {
    const isSpecial = item.getData('isSpecial');
    item.destroy();
    
    if (isSpecial) {
      // 特別なアイテムの効果
      this.coins += 500;
      this.coinsText.setText(`コイン: ${this.coins}`);
      this.updateScore(5000);
      this.showAchievement('+500コイン！');
      
      // 特別な音を再生
      this.soundManager.playSound('item');
      this.soundManager.playSound('item'); // 2回再生でより豪華に
    } else {
      // 通常のアイテム
      this.combo = Math.min(this.combo + 0.5, 5);
      this.updateScore(100);
      this.comboText.setText(`Combo: x${this.combo.toFixed(1)}`);
      this.coins += 10;
      this.coinsText.setText(`コイン: ${this.coins}`);
      
      // アイテム取得音を再生
      this.soundManager.playSound('item');
    }
  }

  hitObstacle() {
    this.combo = 1;
    this.playerSpeed = Math.max(0, this.playerSpeed - 150);
    this.comboText.setText(`Combo: x${this.combo}`);
    
    this.cameras.main.shake(200, 0.01);
    
    // ヒット音を再生
    this.soundManager.playSound('hit');
    
    // プレイヤーを少し後ろに戻す
    this.player.x -= 50;
    if (this.player.x < 50) {
      this.player.x = 50;
    }
  }

  updateScore(points: number) {
    this.score += Math.floor(points * this.combo);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  update() {
    if (this.isGameOver) return;
    
    // プレイヤーの速度を減衰
    this.playerSpeed = Math.max(0, this.playerSpeed - 3);
    
    // プレイヤーを右に移動
    this.player.x += this.playerSpeed * 0.016; // 60FPSを想定
    
    // 走っている時は少し傾ける
    if (this.playerSpeed > 100) {
      this.player.angle = 5;
    } else {
      this.player.angle = 0;
    }
    
    // スコアと距離の更新
    if (this.playerSpeed > 0) {
      this.distance += this.playerSpeed * 0.01;
      this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`);
      this.updateScore(1);
      
      // 走っている時は上下に揺れる
      this.player.y = 500 + Math.sin(this.time.now * 0.01) * 3;
      
      // 5000m超えたら特別なアイテムを出現
      if (this.distance >= 5000 && !this.hasSpawnedGoldenItem) {
        this.spawnSpecialItem();
        this.hasSpawnedGoldenItem = true;
        
        // ゴールデンスバルをアンロック
        GameStats.unlockCharacter('golden_subaru');
        this.showAchievement('ゴールデンスバルをアンロック！');
      }
    }
    
    // 障害物の削除
    this.obstacles.children.entries.forEach(obstacle => {
      if (obstacle.body && obstacle.body.position.x < -100) {
        obstacle.destroy();
      }
    });
    
    // アイテムの削除
    this.items.children.entries.forEach(item => {
      if (item.body && item.body.position.x < -100) {
        item.destroy();
      }
    });
    
    // プレイヤーが画面右端に達したら左端に戻す
    if (this.player.x > 750) {
      this.player.x = 50;
      this.distance += 100;
    }
  }

  endGame() {
    this.isGameOver = true;
    this.player.setVelocity(0, 0);
    
    // BGMを停止してゲームオーバー音を再生
    this.soundManager.stopBGM();
    this.soundManager.playGameOver();
    
    // 統計を更新
    GameStats.updateDistance(Math.floor(this.distance));
    GameStats.addCoins(this.coins);
    
    // 少し待ってからリザルト画面へ
    this.time.delayedCall(1000, () => {
      this.scene.start('ResultScene', {
        score: this.score,
        distance: Math.floor(this.distance),
        taps: this.tapCount,
        coins: this.coins
      });
    });
  }

  spawnSpecialItem() {
    const specialItem = this.items.create(
      800,
      400,
      'star'
    );
    specialItem.setVelocityX(-200);
    specialItem.setScale(1.5);
    specialItem.setTint(0xFFD700);
    specialItem.setData('isSpecial', true);
    
    // キラキラエフェクト
    this.tweens.add({
      targets: specialItem,
      angle: 360,
      duration: 1000,
      repeat: -1
    });
  }

  showAchievement(message: string) {
    const achievement = this.add.text(400, 200, message, {
      fontSize: '32px',
      color: '#FFD700',
      backgroundColor: '#000000AA',
      padding: { left: 20, right: 20, top: 10, bottom: 10 }
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: achievement,
      y: 150,
      alpha: 0,
      duration: 3000,
      onComplete: () => achievement.destroy()
    });
  }
}