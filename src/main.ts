import Phaser from 'phaser';
import { PreloadScene } from './scenes/PreloadScene';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';
import { GachaScene } from './scenes/GachaScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scene: [PreloadScene, TitleScene, GameScene, ResultScene, GachaScene, CharacterSelectScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
    min: {
      width: 320,
      height: 240
    },
    max: {
      width: 1600,
      height: 1200
    }
  },
  input: {
    activePointers: 3
  },
  dom: {
    createContainer: true
  }
};

new Phaser.Game(config);