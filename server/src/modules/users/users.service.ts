import bcrypt from "bcryptjs";

import { createUserSchema } from "./users.schema.js";
import * as usersRepository from "./users.repository.js";
import { AppError } from "../../utils/app-error.js";


export const createUser = async (
  input: unknown,
) => {
  const data = createUserSchema.parse(input);

   //  doing the hashing
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
      // 1. The service calls the repo and waits here...
  const user = await usersRepository.createUser(
    data.name,
    data.email,
    passwordHash,
  );

    // 2. The repository returns the data RIGHT HERE, unboxing it into
    //  the 'user' variable!

// 3. Now the service can use 'user.id', 'user.name', etc.
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.created_at,
  };
   } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError(
        "A user with this email already exists",
        409,
        "EMAIL_ALREADY_EXISTS",
      );
    }

    throw error;
  }
};