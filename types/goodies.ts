export interface GoodiesResult {
    count: number
    next: string|null;
    previous: string|null;
    results: Goodie[]
  }
  
  export interface Goodie {
    id: number
    name: string
    description: string
    points_cost: number
    quantity_available: number
    image_url: string
  }
  
  export interface TransactionResult {
    count: number
    next: any
    previous: any
    results: Transaction[]
  }
  
  export interface Transaction {
    id: number
    points: number
    event: string
    timestamp: string
    user: number
  }
  
  export interface RedemptionResult {
    count: number
    next: any
    previous: any
    results: RedemptionRequest[]
  }
  
  export interface RedemptionRequest {
    id: number
    requested_at: string
    is_approved: boolean
    collected:boolean
    approved_at: any
    user: number
    goodie: number
  }