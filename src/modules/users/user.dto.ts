import { UserEntity } from './user.entity.js';

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export const toUserResponseDto = (entity: UserEntity): UserResponseDto => ({
  id: entity.id,
  name: entity.name,
  email: entity.email,
  createdAt: entity.createdAt.toISOString(),
});

export const toUserResponseDtoList = (
  entities: UserEntity[]
): UserResponseDto[] => entities.map(toUserResponseDto);
