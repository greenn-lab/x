import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthGuard } from '@app/auth/guards/auth.guard';
import { MemberGuard } from '@app/auth/guards/member.guard';
import { Member } from '@app/member/entities/member.entity';
import { MemberRepository } from '@app/member/repositories/member.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([Member]),
    JwtModule.register({ signOptions: { expiresIn: '1h' } }),
  ],
  providers: [AuthGuard, MemberGuard, MemberRepository],
  exports: [AuthGuard, MemberGuard, MemberRepository, JwtModule],
})
export class AuthModule {}
