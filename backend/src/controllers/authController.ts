import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models';
import type { AuthResponse } from '../types';

const generateToken = (userId: string): string => {
  const secret = process.env['JWT_SECRET'] || 'fallback-secret';
  const expiresIn = process.env['JWT_EXPIRES_IN'] || '7d';
  
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: expiresIn as string } as any
  );
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = await UserModel.create({
      email,
      password: hashedPassword,
      name
    });

    // Generate token
    const token = generateToken(user.id);

    const response: AuthResponse = {
      user: {
        _id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      token
    };

    res.status(201).json({
      success: true,
      data: response,
      message: 'User registered successfully'
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Account is deactivated'
      });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    const response: AuthResponse = {
      user: {
        _id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString()
      },
      token
    };

    res.status(200).json({
      success: true,
      data: response,
      message: 'Login successful'
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile retrieved successfully'
    });
  } catch (error: any) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, avatar } = req.body;
    const userId = (req as any).user._id;

    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Update fields
    const updateData: any = {};
    if (name) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;

    const updatedUser = await UserModel.update(userId, updateData);

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar,
        isActive: updatedUser.isActive,
        createdAt: updatedUser.createdAt.toISOString(),
        updatedAt: updatedUser.updatedAt.toISOString()
      },
      message: 'Profile updated successfully'
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    
    if (error.code === 'P2002') {
      res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 