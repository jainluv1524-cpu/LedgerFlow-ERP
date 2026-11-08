export type AuthUser = {
  id: string;
  email: string;
  name: string;
  status?: string;
  [key: string]: unknown;
};

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        sessionId: string;
        user: AuthUser;
      };
      tenant?: {
        companyId: string;
        financialYearId?: string;
        branchId?: string;
      };
    }
  }
}

export {};
