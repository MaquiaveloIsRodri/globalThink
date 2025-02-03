import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/user.dto';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpStatus,
  NotFoundException,
  ValidationPipe,
} from '@nestjs/common';

// User Service Mock
const mockUsersService = {
  create: jest.fn((dto: CreateUserDto) => Promise.resolve({ id: '1', ...dto })),
  findAll: jest.fn(
    (): Promise<{ id: string; name: string; email: string }[]> =>
      Promise.resolve([
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
        { id: '2', name: 'Ana López', email: 'ana@example.com' },
      ]),
  ),
  findOne: jest.fn(
    (
      id: string,
    ): Promise<{
      id: string;
      name: string;
      email: string;
      age: number;
      profile: { code: string; profileName: string };
    }> =>
      Promise.resolve({
        id,
        name: 'Juan Pérez',
        email: 'rodri22@example.com',
        age: 25,
        profile: { code: 'P-002', profileName: 'basic' },
      }),
  ),
  update: jest.fn<
    Promise<Partial<CreateUserDto> & { id: string }>,
    [string, Partial<CreateUserDto>]
  >((id: string, dto: Partial<CreateUserDto>) =>
    Promise.resolve({ id, ...dto }),
  ),

  remove: jest.fn().mockResolvedValue({
    statusCode: HttpStatus.OK,
    message: 'User deleted successfully',
  }),
};

const mockAuthGuard = {
  canActivate: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const validUserDto: CreateUserDto = {
      name: 'Juan Pérez',
      email: 'rodri22@example.com',
      age: 25,
      profile: { code: 'P-002', profileName: 'basic' },
    };

    it('✔️ should create a user and return status 201', async () => {
      mockUsersService.create.mockResolvedValue({ id: '1', ...validUserDto });

      const result = await controller.create(validUserDto);

      expect(result).toEqual({
        statusCode: 201,
        message: 'User created successfully',
        data: { id: '1', ...validUserDto },
      });

      expect(mockUsersService.create).toHaveBeenCalledWith(validUserDto);
    });

    it('❌ should throw a ConflictException if email is already in use', async () => {
      mockUsersService.create.mockImplementation(() => {
        throw new ConflictException('Email already in use');
      });

      await expect(controller.create(validUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('⚠️ should throw an error if validation fails (missing email)', async () => {
      const invalidUserDto: Partial<CreateUserDto> = {
        ...validUserDto,
        email: '',
      };

      await expect(
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }).transform(invalidUserDto, {
          type: 'body',
          metatype: CreateUserDto,
        }),
      ).rejects.toThrow();
    });

    it('🔒 should not allow unauthorized access', async () => {
      mockAuthGuard.canActivate.mockReturnValueOnce(false);

      await expect(controller.create(validUserDto)).rejects.toThrow();
    });
  });

  describe('find all user and find for dinamic query', () => {
    it('✔️ should return a list of users', async () => {
      const usersMock = [
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
        { id: '2', name: 'Ana López', email: 'ana@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(usersMock);

      const result = await controller.findDynamicUsers('Juan');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: usersMock,
      });
      expect(mockUsersService.findAll).toHaveBeenCalledWith('Juan');
    });

    it('🔎 should return only users matching the search query', async () => {
      const usersMock = [
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(usersMock);

      const result = await controller.findDynamicUsers('Juan');

      expect(result).toEqual({
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: usersMock,
      });
      expect(mockUsersService.findAll).toHaveBeenCalledWith('Juan');
    });

    it('⚠️ should return all users when no search parameter is provided', async () => {
      const usersMock = [
        { id: '1', name: 'Juan Pérez', email: 'juan@example.com' },
        { id: '2', name: 'Ana López', email: 'ana@example.com' },
      ];
      mockUsersService.findAll.mockResolvedValue(usersMock);

      const result = await controller.findDynamicUsers();

      expect(result).toEqual({
        statusCode: 200,
        message: 'Users retrieved successfully',
        data: usersMock,
      });
      expect(mockUsersService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('❌ should return an error if database query fails', async () => {
      mockUsersService.findAll.mockImplementation(() => {
        throw new Error('Database query error');
      });

      await expect(controller.findDynamicUsers('Juan')).rejects.toThrow(
        'Database query error',
      );
    });
  });

  describe('findOne', () => {
    it('✔️ should return a user by ID', async () => {
      const userMock = {
        id: '1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        age: 25,
        profile: { code: 'P-002', profileName: 'basic' },
      };
      mockUsersService.findOne.mockResolvedValue(userMock);

      const result = await controller.findOne('1');

      expect(result).toEqual({
        statusCode: 200,
        message: 'User retrieved successfully',
        data: userMock,
      });
      expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
    });

    it('❌ should return a 400 error for invalid ID format', async () => {
      mockUsersService.findOne.mockImplementation(() => {
        throw new BadRequestException('Invalid ID format: 999');
      });

      await expect(controller.findOne('999')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('🚫 should return a 404 error if user is not found', async () => {
      mockUsersService.findOne.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.findOne('999')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('❌ should return an error if database query fails', async () => {
      mockUsersService.findOne.mockImplementation(() => {
        throw new Error('Database query error');
      });

      await expect(controller.findOne('1')).rejects.toThrow(
        'Database query error',
      );
    });
  });

  describe('update', () => {
    const validUserDto: Partial<CreateUserDto> = {
      name: 'Updated Name',
      email: 'updated@example.com',
      age: 30,
      profile: { code: 'P-002', profileName: 'basic' },
    };

    it('✔️ should update a user successfully', async () => {
      const updatedUser: Partial<CreateUserDto> & { id: string } = {
        id: '1',
        ...validUserDto,
      };
      mockUsersService.update.mockResolvedValue(
        updatedUser as Partial<CreateUserDto> & { id: string },
      );

      const result = await controller.update('1', validUserDto);

      expect(result).toEqual({
        statusCode: 200,
        message: 'User updated successfully',
        data: updatedUser,
      });
      expect(mockUsersService.update).toHaveBeenCalledWith('1', validUserDto);
    });

    it('❌ should return a 400 error for invalid ID format', async () => {
      mockUsersService.update.mockImplementation(() => {
        throw new BadRequestException('Invalid ID format: 999');
      });

      await expect(controller.update('999', validUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('🚫 should return a 404 error if user is not found', async () => {
      mockUsersService.update.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.update('999', validUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('🔒 should return a 403 error if access is denied', async () => {
      mockUsersService.update.mockImplementation(() => {
        throw new ForbiddenException('Access Denied');
      });

      await expect(controller.update('2', validUserDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('⚠️ should return a 409 error if email is already in use', async () => {
      mockUsersService.update.mockImplementation(() => {
        throw new ConflictException('Email already in use');
      });

      await expect(controller.update('1', validUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('❌ should return an error if database query fails', async () => {
      mockUsersService.update.mockImplementation(() => {
        throw new Error('Database query error');
      });

      await expect(controller.update('1', validUserDto)).rejects.toThrow(
        'Database query error',
      );
    });
  });

  describe('remove', () => {
    it('✔️ should delete a user successfully', async () => {
      const result = await controller.remove('1');

      expect(result).toEqual({
        statusCode: 200,
        message: 'User deleted successfully',
      });
      expect(mockUsersService.remove).toHaveBeenCalledWith('1');
    });

    it('🚫 should return a 404 error if user is not found', async () => {
      mockUsersService.remove.mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.remove('999')).rejects.toThrow(NotFoundException);
    });

    it('🔒 should return a 403 error if access is denied', async () => {
      mockUsersService.remove.mockImplementation(() => {
        throw new ForbiddenException('Access Denied');
      });

      await expect(controller.remove('2')).rejects.toThrow(ForbiddenException);
    });

    it('⚠️ should return a 409 error if there is a conflict in queries', async () => {
      mockUsersService.remove.mockImplementation(() => {
        throw new ConflictException('Conflict - errors in queries');
      });

      await expect(controller.remove('1')).rejects.toThrow(ConflictException);
    });

    it('❌ should return an error if database query fails', async () => {
      mockUsersService.remove.mockImplementation(() => {
        throw new Error('Database query error');
      });

      await expect(controller.remove('1')).rejects.toThrow(
        'Database query error',
      );
    });
  });
});
