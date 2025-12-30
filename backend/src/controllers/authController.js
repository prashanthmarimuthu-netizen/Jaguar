import User from '../models/User.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/jwtUtils.js';
import crypto from 'crypto';

class AuthController {
  // Signup
  static async signup(req, res) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingEmail = await User.findByEmail(email);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: 'Username already taken' });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const userId = await User.create({
        username,
        email,
        passwordHash,
        verificationToken
      });

      // Generate JWT token
      const token = generateToken(userId);

      // For now, just return success (in real app, send verification email)
      res.status(201).json({
        message: 'User created successfully. Please verify your email.',
        token,
        user: {
          id: userId,
          username,
          email
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Signin
  static async signin(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check if email is verified
      //if (!user.is_verified) {
       // return res.status(401).json({ 
          //error: 'Please verify your email first',
         // needsVerification: true
     //   });
     // }

      // Verify password
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate token
      const token = generateToken(user.id);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Verify email
  static async verifyEmail(req, res) {
    try {
      const { token } = req.body;

      const isVerified = await User.verifyEmail(token);
      if (!isVerified) {
        return res.status(400).json({ error: 'Invalid or expired token' });
      }

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default AuthController;