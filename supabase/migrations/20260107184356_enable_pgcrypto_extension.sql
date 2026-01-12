/*
  # Enable pgcrypto Extension

  1. Extension
    - Enables the pgcrypto extension which provides cryptographic functions
    - Required for password hashing using crypt() function in admin authentication

  2. Purpose
    - Fixes admin login issue where crypt() function was not found
    - Allows secure password hashing and verification for admin users
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;
