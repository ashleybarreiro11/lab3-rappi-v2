import { AuthenticateUserDTO, CreateUserDTO, UserRole } from "./auth.types";
import Boom from "@hapi/boom";
import { supabase } from "../../config/supabase";
import { AuthResponse, AuthTokenResponsePassword } from "@supabase/supabase-js";

export const authenticateUserService = async (
  credentials: AuthenticateUserDTO,
): Promise<AuthTokenResponsePassword["data"]> => {
  const signInResponse = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (signInResponse.error) {
    throw Boom.unauthorized(signInResponse.error.message);
  }

  return signInResponse.data;
};

export const refreshSessionService = async (refreshToken: string) => {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    throw Boom.unauthorized(error.message);
  }

  return data;
};

export const createUserService = async (
  user: CreateUserDTO,
): Promise<AuthResponse["data"]> => {
  if (!user.email || !user.password || !user.role) {
    throw Boom.badRequest("email, password and role are required");
  }

  if (user.role === UserRole.STORE && !user.storeName) {
    throw Boom.badRequest("storeName is required for store users");
  }

  const signUpResponse = await supabase.auth.signUp({
    email: user.email,
    password: user.password,
    options: {
      data: {
        name: user.name,
        address: user.address,
        role: user.role,
        storeName: user.storeName,
      },
    },
  });

  if (signUpResponse.error) {
    throw Boom.badRequest(signUpResponse.error.message);
  }

  const createdUser = signUpResponse.data.user;

  if (!createdUser) {
    throw Boom.badRequest("User could not be created");
  }

  if (user.role === UserRole.STORE) {
    const { error: storeError } = await supabase
      .from("stores")
      .insert({ user_id: createdUser.id, name: user.storeName });

    if (storeError) {
      throw Boom.badRequest(storeError.message);
    }
  }

  return signUpResponse.data;
};
