import { prisma } from '../prisma/client';
import bcrypt     from 'bcrypt';

export class AuthService {
  static async validateUserCredentials(email: string, password: string) {
    // Look up the user by email (Change 'user' to your exact schema model name if different)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const error: any = new Error('Invalid email or password configuration.');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    // Compare raw password with the secure hashed password (verify your schema column name, e.g., password or passwordHash)
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      const error: any = new Error('Invalid email or password configuration.');
      error.status = 401;
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}