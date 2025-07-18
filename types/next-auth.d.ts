import { Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    params: object;
    access?: string;
    error?: "RefreshAccessTokenError"
    user: {
      pk?: number;
      username?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      profile?: {
        pronoun: string | null,
        first_name: string,
        last_name: string,
        settings: Record<any, any>,
        country_code: string,
        phone: string,
        college: string,
        course: string,
        graduation_year: number,
        company: string,
        role: string,
        event_role:string
        tsize: string,
        profile_lock: boolean,
        is_checked_in:boolean,
        early_bird_redeemed:boolean,
        student: boolean,
        bio: string,
        points: number,
        unique_code:number,
        socials: {
          twitter?: string;
          github?: string;
          linkedin?: string;
        }
      };
    };
  }

  interface User {
    access: string;
    refresh: string;
    user: {
      pk: number;
      username: string;
      email: string;
      first_name: string;
      last_name: string;
      profile: {
        active_role: string;
        event_role:string;
        points:number;
        early_bird_redeemed:boolean;
        active_organization: {
          id: number;
          name: string;
          plan: string;
        };

      };
    },
  }
 interface Profile {
    pronoun: string
    first_name: string
    last_name: string
    settings: Settings
    country_code: string
    unique_code: string
    is_checked_in: boolean
    phone: string
    college: string
    course: string
    graduation_year: number
    company: string
    role: string
    socials: Socials
    tsize: string
    student: boolean
    event_role: string
    attempts: number
    no_show: number
    points: number
    early_bird_redeemed: boolean
    goodie_tier: string
  }
  
  export interface Settings {
    foo: string
  }
  
  export interface Socials {
    github: string
    twitter: string
    website: string
    linkedin: string
    instagram: string
  }
  
}



declare module "next-auth/jwt" {
  interface JWT {
    access?: string;
    refresh?: string;
    expires_at: number;
    error?: "RefreshAccessTokenError"
    token: object;
    user: object;
  }
}

