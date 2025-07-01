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
        student: boolean,
        bio: string,
        points: number,
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
        active_organization: {
          id: number;
          name: string;
          plan: string;
        };

      };
    },
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

