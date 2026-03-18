import { Request, Response, NextFunction } from "express";
import Boom from "@hapi/boom";
import { AuthUser } from "@supabase/supabase-js";

import { supabase } from "../config/supabase";
import { UserRole } from "../features/auth/auth.types";

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const getUserFromRequest = (req: AuthenticatedRequest): AuthUser => {
  if (req.user) {
    return req.user;
  }

  throw Boom.unauthorized("User not authenticated");
};

export const authMiddleware =
  (roles: UserRole[] = []) =>
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw Boom.unauthorized("Authorization header is missing");
      }

      const [scheme, token] = req.headers.authorization.split(" ");

      if (scheme !== "Bearer") {
        throw Boom.unauthorized("Authorization scheme must be Bearer");
      }

      if (!token) {
        throw Boom.unauthorized("Token is missing");
      }

      const userResponse = await supabase.auth.getUser(token);

      if (userResponse.error) {
        throw Boom.unauthorized(userResponse.error.message);
      }

      const user = userResponse.data.user;

      if (!user) {
        throw Boom.unauthorized("User not found");
      }

      const userRole = user.user_metadata?.role as UserRole | undefined;

      if (roles.length > 0 && (!userRole || !roles.includes(userRole))) {
        throw Boom.forbidden(
          "You do not have permission to access this resource",
        );
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
