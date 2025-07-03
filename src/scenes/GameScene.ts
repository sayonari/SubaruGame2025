import Phaser from 'phaser';
import { SoundManager } from '../utils/SoundManager';
import { GameStats } from '../utils/GameStats';
import { CHARACTERS } from '../utils/Characters';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private items!: Phaser.Physics.Arcade.Group;
  private bombs!: Phaser.Physics.Arcade.Group;
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
  private maxSpeed: number = 400;
  private soundManager: SoundManager;
  private hasSpawnedGoldenItem: boolean = false;
  private coins: number = 0;
  private coinsText!: Phaser.GameObjects.Text;
  private characterData: any;
  private speedMultiplier: number = 1;
  private jumpMultiplier: number = 1;
  private hasDoubleJump: boolean = false;
  private doubleJumpUsed: boolean = false;
  
  // 慣性用の変数
  private velocityX: number = 0;
  private acceleration: number = 0;
  private deceleration: number = 0.95; // 減速率
  private isJumping: boolean = false;
  
  constructor() {
    super({ key: 'GameScene' });
    this.soundManager = new SoundManager();
  }

  create() {
    this.loadCharacterData();
    this.setupWorld();
    this.setupPlayer();
    this.setupUI();
    this.setupInput();
    this.startGame();
  }

  loadCharacterData() {
    const stats = GameStats.getStats();
    this.characterData = CHARACTERS.find(char => char.id === stats.currentCharacter) || CHARACTERS[0];
    
    this.speedMultiplier = this.characterData.speed;
    this.jumpMultiplier = this.characterData.jump;
    this.hasDoubleJump = this.characterData.special === 'ダブルジャンプ';
    
    // 最大速度をキャラクターに合わせて調整
    this.maxSpeed = 400 * this.speedMultiplier;
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
    this.bombs = this.physics.add.group();
  }

  setupPlayer() {
    // 選択されたキャラクターのスプライトを使用
    const characterSprite = this.characterData.id;
    this.player = this.physics.add.sprite(100, 500, characterSprite);
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
    this.physics.add.overlap(this.player, this.bombs, (_player, bomb) => {
      this.hitBomb(bomb as Phaser.Physics.Arcade.Sprite);
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
    
    // 操作説明（画面サイズに応じて調整）
    const instructionText = this.cameras.main.width < 600 ? 'タップで操作' : '左タップ:ジャンプ / 右タップ:加速';
    this.add.text(400, 16, instructionText, {
      fontSize: '16px',
      color: '#666'
    }).setOrigin(0.5, 0);
    
    // コイン表示
    this.coinsText = this.add.text(16, 110, 'コイン: 0', {
      fontSize: '20px',
      color: '#FFD700'
    });
    
    // 使用キャラクター表示
    this.add.text(16, 140, `キャラ: ${this.characterData.name}`, {
      fontSize: '18px',
      color: '#FF69B4'
    });
  }

  setupInput() {
    // タッチ領域を視覚的に表示（モバイル向け）
    if (this.sys.game.device.input.touch) {
      // 左側ジャンプエリア
      const leftArea = this.add.rectangle(this.cameras.main.width / 4, this.cameras.main.height - 100, 
        this.cameras.main.width / 2 - 20, 180, 0x0000FF, 0.1);
      leftArea.setInteractive();
      
      // 右側加速エリア  
      const rightArea = this.add.rectangle(this.cameras.main.width * 3 / 4, this.cameras.main.height - 100,
        this.cameras.main.width / 2 - 20, 180, 0xFF0000, 0.1);
      rightArea.setInteractive();
      
      // タッチエリアのラベル
      this.add.text(this.cameras.main.width / 4, this.cameras.main.height - 100, 'ジャンプ', {
        fontSize: '24px',
        color: '#FFFFFF',
        backgroundColor: '#0000FFAA',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5);
      
      this.add.text(this.cameras.main.width * 3 / 4, this.cameras.main.height - 100, '加速', {
        fontSize: '24px', 
        color: '#FFFFFF',
        backgroundColor: '#FF0000AA',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
      }).setOrigin(0.5);
    }
    
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
    
    // コイン（星）を複数の異なる間隔でスポーン
    this.time.addEvent({
      delay: 3000,
      callback: () => this.spawnItem(),
      loop: true
    });
    
    // 追加のコインスポーン（より頻繁に）
    this.time.addEvent({
      delay: 1500,
      callback: () => this.spawnItemFromTop(),
      loop: true
    });
    
    // さらに追加のコインスポーン（ランダムな位置から）
    this.time.addEvent({
      delay: 2500,
      callback: () => this.spawnItemFromRandom(),
      loop: true
    });
    
    // 爆弾をスポーン
    this.time.addEvent({
      delay: 4000,
      callback: () => this.spawnBomb(),
      loop: true
    });
  }

  tapPlayer() {
    this.tapCount++;
    
    // 加速度を追加（既存の速度に加算）
    const accelerationBase = 30;
    this.acceleration += accelerationBase * this.speedMultiplier;
    
    // タップ音を再生
    this.soundManager.playSound('tap');
    
    // タップエフェクト
    this.player.setScale(0.9);
    this.time.delayedCall(100, () => {
      this.player.setScale(0.8);
    });
    
    // 視覚的なブーストエフェクト
    const boostEffect = this.add.circle(this.player.x - 20, this.player.y, 10, 0xFFFF00, 0.8);
    this.tweens.add({
      targets: boostEffect,
      x: this.player.x - 60,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => boostEffect.destroy()
    });
  }
  
  jumpPlayer() {
    const baseJumpPower = -400;
    const jumpPower = baseJumpPower * this.jumpMultiplier;
    
    if (this.player.body?.touching.down) {
      this.player.setVelocityY(jumpPower);
      this.doubleJumpUsed = false;
      this.isJumping = true;
      // ジャンプ音を再生
      this.soundManager.playSound('jump');
      
      // ジャンプ時の横方向の勢いを保持
      if (this.velocityX > 50) {
        // 前方ジャンプの場合、少し上向きの力を追加
        this.player.setVelocityY(jumpPower * 0.9);
      }
    } else if (this.hasDoubleJump && !this.doubleJumpUsed && this.player.body?.velocity.y! > -200) {
      // ダブルジャンプ
      this.player.setVelocityY(jumpPower * 0.8);
      this.doubleJumpUsed = true;
      this.soundManager.playSound('jump');
      
      // ダブルジャンプエフェクト
      this.showEffect('ダブルジャンプ！');
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
  
  spawnItemFromTop() {
    if (this.isGameOver) return;
    
    // 上から落ちてくるコイン
    const item = this.items.create(
      Phaser.Math.Between(200, 700),
      -20,
      'star'
    );
    item.setVelocityX(Phaser.Math.Between(-100, -50));
    item.setVelocityY(Phaser.Math.Between(150, 250));
    item.setScale(0.7);
    item.setTint(0xFFFF00);
  }
  
  spawnItemFromRandom() {
    if (this.isGameOver) return;
    
    // ランダムな位置からのコイン
    const side = Phaser.Math.Between(0, 1);
    let x, y, vx, vy;
    
    if (side === 0) {
      // 右側から
      x = 820;
      y = Phaser.Math.Between(200, 400);
      vx = Phaser.Math.Between(-250, -150);
      vy = Phaser.Math.Between(-50, 50);
    } else {
      // 上から斜めに
      x = Phaser.Math.Between(400, 800);
      y = -20;
      vx = Phaser.Math.Between(-200, -100);
      vy = Phaser.Math.Between(100, 200);
    }
    
    const item = this.items.create(x, y, 'star');
    item.setVelocityX(vx);
    item.setVelocityY(vy);
    item.setScale(0.6);
    item.setTint(0x00FF00);
  }
  
  spawnBomb() {
    if (this.isGameOver) return;
    
    const bomb = this.bombs.create(
      Phaser.Math.Between(600, 800),
      Phaser.Math.Between(200, 400),
      'bomb'
    );
    bomb.setVelocityX(-250);
    bomb.setVelocityY(Phaser.Math.Between(-50, 50));
    bomb.setScale(1.2);
    
    // 爆弾を回転させる
    this.tweens.add({
      targets: bomb,
      angle: 360,
      duration: 1000,
      repeat: -1
    });
  }

  collectItem(item: Phaser.Physics.Arcade.Sprite) {
    const isSpecial = item.getData('isSpecial');
    item.destroy();
    
    if (isSpecial) {
      // 特別なアイテムの効果
      let coinBonus = 500;
      if (this.characterData.special === 'コイン2倍') {
        coinBonus *= 2;
      }
      this.coins += coinBonus;
      this.coinsText.setText(`コイン: ${this.coins}`);
      this.updateScore(5000);
      this.showAchievement(`+${coinBonus}コイン！`);
      
      // 特別な音を再生
      this.soundManager.playSound('item');
      this.soundManager.playSound('item'); // 2回再生でより豪華に
    } else {
      // 通常のアイテム
      let comboBonus = 0.5;
      if (this.characterData.special === 'コンボボーナス+20%') {
        comboBonus *= 1.2;
      }
      this.combo = Math.min(this.combo + comboBonus, 5);
      this.updateScore(100);
      this.comboText.setText(`Combo: x${this.combo.toFixed(1)}`);
      
      let coinAmount = 10;
      if (this.characterData.special === 'コイン2倍') {
        coinAmount *= 2;
      }
      this.coins += coinAmount;
      this.coinsText.setText(`コイン: ${this.coins}`);
      
      // アイテム取得音を再生
      this.soundManager.playSound('item');
    }
  }

  hitObstacle() {
    this.combo = 1;
    this.comboText.setText(`Combo: x${this.combo}`);
    
    // 慣性を考慮した速度減少
    this.velocityX *= 0.3; // 速度を70%減少
    this.acceleration = 0; // 加速をリセット
    
    this.cameras.main.shake(200, 0.01);
    
    // ヒット音を再生
    this.soundManager.playSound('hit');
    
    // 後方にノックバック（慣性を考慮）
    this.player.x -= 30;
    if (this.player.x < 50) {
      this.player.x = 50;
    }
    
    // 少し上に跳ね上がる
    if (this.player.body?.touching.down) {
      this.player.setVelocityY(-200);
    }
  }
  
  hitBomb(bomb: Phaser.Physics.Arcade.Sprite) {
    bomb.destroy();
    
    // コインを減らす
    const coinLoss = Math.min(this.coins, 50);
    this.coins = Math.max(0, this.coins - coinLoss);
    this.coinsText.setText(`コイン: ${this.coins}`);
    
    // コンボをリセット
    this.combo = 1;
    this.comboText.setText(`Combo: x${this.combo}`);
    
    // 慣性を大幅に減少
    this.velocityX *= 0.2; // 速度を80%減少
    this.acceleration = 0; // 加速をリセット
    
    // 爆発による後方ノックバック
    this.player.x -= 40;
    if (this.player.x < 50) {
      this.player.x = 50;
    }
    
    // 爆発で上に吹き飛ばす
    this.player.setVelocityY(-300);
    
    // 画面を大きく揺らす
    this.cameras.main.shake(500, 0.02);
    
    // 爆発音を再生
    this.soundManager.playSound('hit');
    this.soundManager.playSound('hit');
    
    // 爆発エフェクト
    const explosion = this.add.circle(bomb.x, bomb.y, 30, 0xFF4500, 0.8);
    this.tweens.add({
      targets: explosion,
      scale: 2,
      alpha: 0,
      duration: 300,
      onComplete: () => explosion.destroy()
    });
    
    // ダメージ表示
    this.showEffect(`-${coinLoss}コイン!`);
  }

  updateScore(points: number) {
    this.score += Math.floor(points * this.combo);
    this.scoreText.setText(`Score: ${this.score}`);
  }

  update() {
    if (this.isGameOver) return;
    
    // 加速度を速度に適用
    this.velocityX += this.acceleration;
    this.velocityX = Math.min(this.velocityX, this.maxSpeed);
    
    // 減速（慣性）
    if (this.acceleration <= 0) {
      this.velocityX *= this.deceleration;
    }
    
    // 加速度を徐々に減らす
    this.acceleration *= 0.9;
    if (this.acceleration < 0.1) this.acceleration = 0;
    
    // 最小速度の設定
    if (this.velocityX < 1) this.velocityX = 0;
    
    // プレイヤーを右に移動（慣性を考慮）
    this.player.x += this.velocityX * 0.016; // 60FPSを想定
    
    // 着地判定
    if (this.player.body?.touching.down && this.isJumping) {
      this.isJumping = false;
    }
    
    // 走っている時は少し傾ける（速度に応じて）
    if (this.velocityX > 100) {
      const targetAngle = Math.min(this.velocityX / 50, 10);
      this.player.angle = Phaser.Math.Linear(this.player.angle, targetAngle, 0.1);
    } else {
      this.player.angle = Phaser.Math.Linear(this.player.angle, 0, 0.1);
    }
    
    // ジャンプ中の傾き
    if (!this.player.body?.touching.down) {
      const yVel = this.player.body?.velocity.y || 0;
      if (yVel < -100) {
        this.player.angle = -5; // 上昇中
      } else if (yVel > 100) {
        this.player.angle = 15; // 下降中
      }
    }
    
    // スコアと距離の更新
    if (this.velocityX > 0) {
      this.distance += this.velocityX * 0.01;
      this.distanceText.setText(`Distance: ${Math.floor(this.distance)}m`);
      this.updateScore(1);
      
      // 走っている時は上下に揺れる（地上にいる時のみ）
      if (this.player.body?.touching.down) {
        const baseY = 500;
        const bounce = Math.sin(this.time.now * 0.01 * (this.velocityX / 100)) * 2;
        this.player.y = baseY + bounce;
      }
      
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
    
    // 爆弾の削除
    this.bombs.children.entries.forEach(bomb => {
      if (bomb.body && (bomb.body.position.x < -100 || bomb.body.position.y > 600)) {
        bomb.destroy();
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

  showEffect(message: string) {
    const effect = this.add.text(this.player.x, this.player.y - 50, message, {
      fontSize: '20px',
      color: '#00FF00',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.tweens.add({
      targets: effect,
      y: this.player.y - 100,
      alpha: 0,
      duration: 1000,
      onComplete: () => effect.destroy()
    });
  }
}