export interface PlayerStats {
  totalPlays: number;
  totalDistance: number;
  highestDistance: number;
  unlockedCharacters: string[];
  unlockedItems: string[];
  coins: number;
  currentCharacter: string;
  achievements: string[];
  lastLoginDate?: string;
  loginStreak: number;
}

export class GameStats {
  private static STORAGE_KEY = 'subaruGameStats';
  
  static getStats(): PlayerStats {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    
    return {
      totalPlays: 0,
      totalDistance: 0,
      highestDistance: 0,
      unlockedCharacters: ['subaru'],
      unlockedItems: [],
      coins: 0,
      currentCharacter: 'subaru',
      achievements: [],
      lastLoginDate: undefined,
      loginStreak: 0
    };
  }
  
  static saveStats(stats: PlayerStats) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stats));
  }
  
  static incrementPlayCount() {
    const stats = this.getStats();
    stats.totalPlays++;
    this.saveStats(stats);
    return stats.totalPlays;
  }
  
  static updateDistance(distance: number) {
    const stats = this.getStats();
    stats.totalDistance += distance;
    if (distance > stats.highestDistance) {
      stats.highestDistance = distance;
    }
    this.saveStats(stats);
  }
  
  static addCoins(amount: number) {
    const stats = this.getStats();
    stats.coins += amount;
    this.saveStats(stats);
    return stats.coins;
  }
  
  static spendCoins(amount: number): boolean {
    const stats = this.getStats();
    if (stats.coins >= amount) {
      stats.coins -= amount;
      this.saveStats(stats);
      return true;
    }
    return false;
  }
  
  static unlockCharacter(characterId: string) {
    const stats = this.getStats();
    if (!stats.unlockedCharacters.includes(characterId)) {
      stats.unlockedCharacters.push(characterId);
      this.saveStats(stats);
    }
  }
  
  static unlockItem(itemId: string) {
    const stats = this.getStats();
    if (!stats.unlockedItems.includes(itemId)) {
      stats.unlockedItems.push(itemId);
      this.saveStats(stats);
    }
  }
  
  static setCurrentCharacter(characterId: string) {
    const stats = this.getStats();
    if (stats.unlockedCharacters.includes(characterId)) {
      stats.currentCharacter = characterId;
      this.saveStats(stats);
    }
  }
  
  static addAchievement(achievementId: string) {
    const stats = this.getStats();
    if (!stats.achievements.includes(achievementId)) {
      stats.achievements.push(achievementId);
      this.saveStats(stats);
      return true;
    }
    return false;
  }
  
  static checkMilestone(playCount: number): string | null {
    const milestones = [
      { count: 10, message: '10回プレイ達成！新しいタイトル画面をアンロック！', id: 'play10' },
      { count: 20, message: '20回プレイ達成！特別なBGMをアンロック！', id: 'play20' },
      { count: 50, message: '50回プレイ達成！レアキャラクターをアンロック！', id: 'play50' },
      { count: 100, message: '100回プレイ達成！マスタープレイヤー認定！', id: 'play100' }
    ];
    
    for (const milestone of milestones) {
      if (playCount === milestone.count && this.addAchievement(milestone.id)) {
        return milestone.message;
      }
    }
    
    return null;
  }
  
  static checkDailyBonus(): { coins: number; streak: number } | null {
    const stats = this.getStats();
    const today = new Date().toDateString();
    
    if (stats.lastLoginDate === today) {
      return null; // 今日はすでにボーナスを受け取っている
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = stats.lastLoginDate === yesterday.toDateString();
    
    stats.loginStreak = isConsecutive ? stats.loginStreak + 1 : 1;
    stats.lastLoginDate = today;
    
    // ログインボーナス計算
    const baseBonus = 50;
    const streakBonus = Math.min(stats.loginStreak * 10, 100);
    const totalBonus = baseBonus + streakBonus;
    
    stats.coins += totalBonus;
    this.saveStats(stats);
    
    return { coins: totalBonus, streak: stats.loginStreak };
  }
}