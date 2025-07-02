// 簡易的なオンラインランキングシステム
// 実際の本番環境では、適切なバックエンドサービスを使用してください

export interface RankingEntry {
  name: string;
  score: number;
  distance: number;
  date: string;
  timestamp: number;
}

export class OnlineRanking {
  private static STORAGE_KEY = 'subaruGameGlobalRanking';
  
  // ローカルストレージを使った簡易的な共有ランキング
  // 実際にはFirebaseやサーバーAPIを使用すべきです
  static async submitScore(entry: Omit<RankingEntry, 'timestamp'>): Promise<void> {
    const rankings = this.getRankings();
    
    rankings.push({
      ...entry,
      timestamp: Date.now()
    });
    
    // スコアでソートして上位50件のみ保持
    rankings.sort((a, b) => b.score - a.score);
    rankings.splice(50);
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rankings));
    
    // 他のプレイヤーのスコアもシミュレート（デモ用）
    this.addDemoScores();
  }
  
  static getRankings(): RankingEntry[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : this.getInitialRankings();
  }
  
  static getTopRankings(limit: number = 10): RankingEntry[] {
    return this.getRankings().slice(0, limit);
  }
  
  static getUserRank(score: number): number {
    const rankings = this.getRankings();
    return rankings.findIndex(entry => entry.score <= score) + 1 || rankings.length + 1;
  }
  
  // デモ用の初期ランキングデータ
  private static getInitialRankings(): RankingEntry[] {
    return [
      { name: 'しゅばしゅば', score: 50000, distance: 2000, date: '2025/7/2', timestamp: Date.now() - 86400000 },
      { name: 'スバ友1号', score: 45000, distance: 1800, date: '2025/7/2', timestamp: Date.now() - 86400000 },
      { name: 'OMAE', score: 42000, distance: 1700, date: '2025/7/2', timestamp: Date.now() - 86400000 },
      { name: 'ダックマスター', score: 38000, distance: 1600, date: '2025/7/1', timestamp: Date.now() - 172800000 },
      { name: 'スバルちゃん大好き', score: 35000, distance: 1500, date: '2025/7/1', timestamp: Date.now() - 172800000 },
      { name: 'しゅば部員', score: 32000, distance: 1400, date: '2025/7/1', timestamp: Date.now() - 172800000 },
      { name: 'プレあです！', score: 30000, distance: 1300, date: '2025/6/30', timestamp: Date.now() - 259200000 },
      { name: 'スバラー', score: 28000, distance: 1200, date: '2025/6/30', timestamp: Date.now() - 259200000 },
      { name: 'アヒル警察', score: 25000, distance: 1100, date: '2025/6/30', timestamp: Date.now() - 259200000 },
      { name: '初心者スバ友', score: 20000, distance: 1000, date: '2025/6/29', timestamp: Date.now() - 345600000 }
    ];
  }
  
  // デモ用：他のプレイヤーのスコアをシミュレート
  private static addDemoScores(): void {
    const demoNames = [
      'スバ友', 'しゅば民', 'ダック隊', 'OMAEEEE', 'スバルーム',
      'アヒル団', 'プレア民', 'しゅばう', 'スバルきち', 'ホロ鳥'
    ];
    
    // 10%の確率で新しいスコアを追加
    if (Math.random() < 0.1) {
      const rankings = this.getRankings();
      const randomName = demoNames[Math.floor(Math.random() * demoNames.length)] + Math.floor(Math.random() * 1000);
      const randomScore = Math.floor(Math.random() * 40000) + 10000;
      const randomDistance = Math.floor(randomScore / 25);
      
      rankings.push({
        name: randomName,
        score: randomScore,
        distance: randomDistance,
        date: new Date().toLocaleDateString('ja-JP'),
        timestamp: Date.now()
      });
      
      rankings.sort((a, b) => b.score - a.score);
      rankings.splice(50);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rankings));
    }
  }
}