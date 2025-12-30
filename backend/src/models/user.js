import pool from '../config/database.js';

class User {
  // Create new user
  static async create({ username, email, passwordHash, verificationToken = null }) {
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash, verification_token) VALUES (?, ?, ?, ?)',
      [username, email, passwordHash, verificationToken]
    );
    return result.insertId;
  }

  // Find user by email
  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  // Find user by username
  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, is_verified, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  // Update verification status
  static async verifyEmail(token) {
    const [result] = await pool.execute(
      'UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE verification_token = ?',
      [token]
    );
    return result.affectedRows > 0;
  }

  // Update password
  static async updatePassword(id, passwordHash) {
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );
  }

  // Set reset token
  static async setResetToken(email, token) {
    await pool.execute(
      'UPDATE users SET reset_token = ? WHERE email = ?',
      [token, email]
    );
  }

  // Reset password with token
  static async resetPassword(token, passwordHash) {
    const [result] = await pool.execute(
      'UPDATE users SET password_hash = ?, reset_token = NULL WHERE reset_token = ?',
      [passwordHash, token]
    );
    return result.affectedRows > 0;
  }
}

export default User;