import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { OauthAccount } from './entities/oauth-account.entity';
import { User } from './entities/user.entity';
import { OAuthProfileDto } from './dtos/oauth-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  async findOrCreateOAuthUser(dto: OAuthProfileDto): Promise<User> {
    return this.entityManager.transaction<User>(async (manager) => {
      const existingOAuth = await manager.findOne(OauthAccount, {
        where: {
          provider: dto.provider,
          providerId: dto.providerId,
        },
        relations: {
          user: true,
        },
      });
      if (existingOAuth) {
        return existingOAuth.user;
      }

      let user: User | null = null;
      if (dto.email) {
        user = await manager.findOne(User, {
          where: { email: dto.email },
        });
      }
      if (!user) {
        user = manager.create(User, {
          email: dto.email,
          name: dto.name,
          avatar: dto.avatar,
        });
        user = await manager.save(User, user);
      }

      const oauthAccount = manager.create(OauthAccount, {
        provider: dto.provider,
        providerId: dto.providerId,
        user,
      });
      await manager.save(OauthAccount, oauthAccount);
      return user;
    });
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.entityManager.findOne(User, {
      where: { id },
      relations: {
        oauthAccounts: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}
