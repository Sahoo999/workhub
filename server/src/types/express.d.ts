declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        };
        
         workspace?: {
        id: string;
        role: string;
      };

      project?: {
  id: string;
  workspaceId: string;
  role: string;
};
    }
  }
}

export {};