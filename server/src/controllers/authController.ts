import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepo } from '../services/dataService.js';
import { generateAnonymousUsername } from '../utils/usernameGenerator.js';
import { generateToken } from '../utils/token.js';
import { AuthRequest } from '../types/index.js';

export async function generateUsernameHandler(_req: Request, res: Response): Promise<void> {
  let attempts = 0;
  let username = '';
  while (attempts < 10) {
    username = generateAnonymousUsername();
    const existing = await UserRepo.findByUsername(username);
    if (!existing) break;
    attempts++;
  }
  res.json({ success: true, username });
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    let { anonymousUsername, nickname, email, password } = req.body;

    if (!password || password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
      return;
    }

    if (!anonymousUsername || anonymousUsername.trim() === '') {
      anonymousUsername = generateAnonymousUsername();
    } else {
      anonymousUsername = anonymousUsername.trim();
    }

    const existingUsername = await UserRepo.findByUsername(anonymousUsername);
    if (existingUsername) {
      res.status(400).json({
        success: false,
        message: 'This anonymous username is already taken. Please pick another or generate one.',
      });
      return;
    }

    if (email && email.trim() !== '') {
      const existingEmail = await UserRepo.findByEmail(email.trim());
      if (existingEmail) {
        res.status(400).json({
          success: false,
          message: 'An account with this recovery email already exists.',
        });
        return;
      }
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const defaultAvatars = ['avatar-1', 'avatar-2', 'avatar-3', 'avatar-4', 'avatar-5', 'avatar-6'];
    const randomAvatar = defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const newUser = await UserRepo.create({
      anonymousUsername,
      nickname: nickname ? nickname.trim() : '',
      email: email ? email.trim() : undefined,
      passwordHash,
      avatar: randomAvatar,
      bio: 'Here to listen and share in a safe space.',
      role: 'user',
      status: 'active',
    });

    const token = generateToken({
      userId: newUser._id,
      role: newUser.role,
    });

    res.status(201).json({
      success: true,
      message: 'Anonymous account successfully created.',
      token,
      user: newUser,
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Please provide your anonymous username or email and password.',
      });
      return;
    }

    // Try finding by username or email
    let user = await UserRepo.findByUsername(identifier.trim(), true);
    if (!user && identifier.includes('@')) {
      user = await UserRepo.findByEmail(identifier.trim(), true);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify and try again.',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify and try again.',
      });
      return;
    }

    if (user.status === 'banned') {
      res.status(403).json({
        success: false,
        message: 'This account has been permanently suspended for violating community guidelines.',
      });
      return;
    }

    if (user.status === 'suspended') {
      if (user.suspensionUntil && new Date(user.suspensionUntil) > new Date()) {
        res.status(403).json({
          success: false,
          message: `This account is temporarily suspended until ${new Date(user.suspensionUntil).toLocaleDateString()}.`,
        });
        return;
      } else {
        await UserRepo.update(user._id, { status: 'active', suspensionUntil: undefined });
        user.status = 'active';
      }
    }

    const token = generateToken({
      userId: user._id,
      role: user.role,
    });

    // Remove secrets before responding
    const safeUser = await UserRepo.findById(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    const freshUser = await UserRepo.findById(req.user._id);
    res.json({
      success: true,
      user: freshUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res.json({ success: true, message: 'Logged out successfully.' });
}
