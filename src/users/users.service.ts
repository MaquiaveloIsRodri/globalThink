import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /**
   * Create user with duplicate validation.
   */
  async create(userData: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userModel
        .findOne({ email: userData.email })
        .lean()
        .exec();
      if (existingUser) {
        throw new ConflictException(
          `Email ${userData.email} is already in use`,
        );
      }

      const newUser = new this.userModel(userData);
      return await newUser.save();
    } catch (error: unknown) {
      this.handleDatabaseError(error, 'Error creating user');
    }
  }

  /**
   * Get all users with optional filter.
   */
  async findAll(search?: string): Promise<User[]> {
    try {
      const query = search
        ? {
            $or: [
              { name: new RegExp(search, 'i') },
              { email: new RegExp(search, 'i') },
              { 'profile.profileName': new RegExp(search, 'i') },
            ],
          }
        : {};

      return await this.userModel.find(query).lean().exec();
    } catch (error: unknown) {
      this.handleDatabaseError(error, 'Error retrieving users');
    }
  }

  /**
   * Get user by ID with error handling.
   */
  async findOne(id: string): Promise<User> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new BadRequestException(`Invalid ID format: ${id}`);
      }

      const user = await this.userModel.findById(id).lean().exec();
      if (!user) throw new NotFoundException(`User with ID ${id} not found`);
      return user;
    } catch (error: unknown) {
      this.handleDatabaseError(error, 'Error retrieving user');
    }
  }

  /**
   * Update user with prior validation.
   */
  async update(id: string, userData: Partial<CreateUserDto>): Promise<User> {
    try {
      // Check if the user exists with an existing role
      await this.findOne(id);

      // Check if the new email is already in use, if it exists and is not the same as the existing one
      if (userData.email) {
        const existingEmail = await this.userModel
          .findOne({ email: userData.email })
          .lean()
          .exec();
        if (existingEmail) {
          throw new ConflictException(
            `Email ${userData.email} is already in use`,
          );
        }
      }

      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, userData, { new: true })
        .lean()
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return updatedUser;
    } catch (error: unknown) {
      this.handleDatabaseError(error, 'Error updating user');
    }
  }

  /**
   * Delete pre-verified user.
   */
  async remove(id: string): Promise<void> {
    try {
      await this.findOne(id);
      await this.userModel.findByIdAndDelete(id).exec();
    } catch (error: unknown) {
      this.handleDatabaseError(error, 'Error deleting user');
    }
  }

  /**
   * Error handling
   */
  private handleDatabaseError(error: unknown, message: string): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }

    console.error(`Database error: ${message}`, error);
    throw new ServiceUnavailableException(
      'Database service unavailable, try again later',
    );
  }
}
