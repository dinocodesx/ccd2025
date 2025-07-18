export interface LeaderboardData{
    count: number
    next: string
    previous: string
    results: LeaderboardResult[]
  }
  
  export interface LeaderboardResult {
    first_name: string
    last_name: string
    points: number
  }
  