-- ========================================
-- Migration: 001_initial_setup
-- Description: Initial database setup for TalentScout AI
-- Date: 2026-02-01
-- ========================================

-- This migration sets up the complete database schema
-- Run this script in your Supabase SQL Editor

\i '../schema-enhanced.sql'

-- Verify installation
SELECT 'Migration 001_initial_setup completed successfully' AS status;
