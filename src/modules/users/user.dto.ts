import { UserEntity } from './user.entity.js';

export interface UserResponseDto {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const toUserResponseDto = (entity: UserEntity): UserResponseDto => ({
  id: entity.id,
  email: entity.email,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});

export const toUserResponseDtoList = (
  entities: UserEntity[]
): UserResponseDto[] => entities.map(toUserResponseDto);
