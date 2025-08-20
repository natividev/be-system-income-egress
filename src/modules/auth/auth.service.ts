import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import * as bcrypt from 'bcryptjs';
import { IUser } from './interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async validateUser(usuario: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        usuario,
      },
    });

    const isValid = await bcrypt.compare(password, user.password);

    if (!user) {
      return null;
    }

    if (user && isValid) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: IUser) {
    const usuario = await this.getUserById(user.usuario);

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    const validateUser = await this.validateUser(user.usuario, user.password);

    if (!validateUser) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const payload = { sub: usuario.id, username: user.usuario };
    return {
      accessToken: this.jwtService.sign(payload),
      name: usuario?.nombre,
    };
  }

  private async getUserById(usuario: string) {
    return await this.prisma.user.findUnique({
      where: {
        usuario,
      },
    });
  }

  async register({ password, usuario, nombre }: CreateAuthDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        usuario,
      },
    });

    if (existingUser) {
      return {
        message: 'El usuario ya existe',
      };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await this.prisma.user.create({
      data: {
        usuario,
        password: hashedPassword,
        nombre,
      },
      select: {
        id: true,
      },
    });

    return {
      message: 'Registro exitoso de usuario',
    };
  }
}
