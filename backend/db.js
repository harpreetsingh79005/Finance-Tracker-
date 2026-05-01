import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ override: true });

// Create a connection pool to the database
console.log('DB_PASSWORD is:', process.env.DB_PASSWORD);
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'finance_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z'
});

// Function to initialize the database and tables
export async function initializeDatabase() {
  try {
    // Connect without database first to ensure it exists
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'finance_tracker'}`);
    await connection.end();

    console.log('Database checked/created successfully.');

    // Create Tables
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createTransactionsTable = `
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        date DATETIME NOT NULL,
        source VARCHAR(255),
        description VARCHAR(255),
        category VARCHAR(100),
        walletId VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createAssetsTable = `
      CREATE TABLE IF NOT EXISTS assets (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        type ENUM('bank', 'cash', 'coins', 'investment') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    await pool.query(createUsersTable);
    await pool.query(createTransactionsTable);
    await pool.query(createAssetsTable);

    console.log('Tables initialized successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
