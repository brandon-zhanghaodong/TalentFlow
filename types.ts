
export enum PerformanceLevel {
  Low = 0,
  Medium = 1,
  High = 2
}

export enum PotentialLevel {
  Low = 0,
  Medium = 1,
  High = 2
}

export type SuccessionStatus = 'Ready-Now' | 'Ready-Future' | 'None';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  performance: PerformanceLevel;
  potential: PotentialLevel;
  tenure: number; // in years
  flightRisk: 'Low' | 'Medium' | 'High';
  lastReviewDate: string;
  keyStrengths: string[];
  developmentNeeds: string[];
  // New fields for Succession Planning
  successionStatus: SuccessionStatus;
  targetRole: string; // The role they are being groomed for
  careerAspiration: string; // Free text description
}

export interface GridCellDef {
  id: string;
  title: string;
  description: string;
  color: string;
  bg: string;
  performance: PerformanceLevel;
  potential: PotentialLevel;
}

export interface DashboardStats {
  totalEmployees: number;
  highPotentials: number;
  flightRisks: number;
  avgTenure: number;
}

export type View = 'grid' | 'list' | 'analytics' | 'settings' | 'succession';
