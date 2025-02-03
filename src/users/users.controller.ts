import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';
import { AuthGuard } from '../guard/auth/auth.guard';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiHeader,
  ApiBody,
} from '@nestjs/swagger';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @desc Create a new user
   * @route POST /users/addUser
   * @access Private (requires authentication)
   * @returns 201 Created - Returns the created user
   * @returns 403 Forbidden - If you don't add the role field
   * @returns 409 Conflict - Returns the same when any validation fails
   */
  @UseGuards(AuthGuard)
  @Post('/addUser')
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )
  @HttpCode(201)
  @ApiOperation({ summary: 'Create User' })
  @ApiHeader({
    name: 'x-user-role',
    description: 'User role (must be admin)',
    required: false,
  })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 403, description: 'Access Denied' })
  @ApiResponse({ status: 409, description: 'Conflic - error in validation' })
  async create(@Body() userData: CreateUserDto) {
    const newUser = await this.usersService.create(userData);
    return {
      statusCode: 201,
      message: 'User created successfully',
      data: newUser,
    };
  }

  /**
   * @desc Get all users (with optional search filter)
   * @route GET /users/findAllUsers
   * @access Public
   * @returns 200 OK - Returns an array of users
   */
  @Get('/findAllUsers')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get find dinamic users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @ApiResponse({ status: 409, description: 'Conflict - Database query error' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Optional search parameter',
  })
  async findDynamicUsers(@Query('search') search?: string) {
    const users = await this.usersService.findAll(search);
    return {
      statusCode: 200,
      message: 'Users retrieved successfully',
      data: users,
    };
  }

  /**
   * @desc Get a user by ID
   * @route GET /users/findUserById/:id
   * @access Public
   * @returns 200 OK - Returns the user data
   */
  @Get('/findUserById/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get User by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Database query error',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Error retrieving user',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - User with ID not found',
  })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: 200,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  /**
   * @desc Update a user by ID
   * @route PUT /users/:id
   * @access Private (requires authentication)
   * @returns 200 OK - Returns the updated user
   */
  @UseGuards(AuthGuard)
  @Put('/updateUser/:id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update User by ID' })
  @ApiHeader({
    name: 'x-user-role',
    description: 'User role (must be admin)',
    required: false,
  })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Error retrieving user',
  })
  @ApiBody({
    description: 'User data to update',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 409, description: 'Conflic - error in validation' })
  @ApiResponse({ status: 403, description: 'Forbidden - Access Denied' })
  async update(
    @Param('id') id: string,
    @Body() userData: Partial<CreateUserDto>,
  ) {
    const updatedUser = await this.usersService.update(id, userData);
    return {
      statusCode: 200,
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  /**
   * @desc Delete a user by ID
   * @route DELETE /users/deleteUser/:id
   * @access Private (requires authentication)
   * @returns 200 OK - Returns success message
   */
  @UseGuards(AuthGuard)
  @Delete('/deleteUser/:id')
  @HttpCode(200)
  @ApiHeader({
    name: 'x-user-role',
    description: 'User role (must be admin)',
    required: false,
  })
  @ApiOperation({ summary: 'Delete User by ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 403, description: 'Access Denied' })
  @ApiResponse({ status: 409, description: 'Conflict - errors in queries' })
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      statusCode: 200,
      message: 'User deleted successfully',
    };
  }
}
