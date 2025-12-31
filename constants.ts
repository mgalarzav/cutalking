import { Scenario, UserSettings, UserStats } from './types';
import { ChefHat, GraduationCap, ShoppingCart, Plane, Briefcase, Ambulance, Coffee, Stethoscope, BedDouble, MapPin, Laptop, Users } from 'lucide-react';

export const DEFAULT_SETTINGS: UserSettings = {
  name: 'Guest',
  level: 'B1',
  avatar: 'max',
  feedbackLanguage: 'EN',
  teacherName: 'Teacher Alex',
  darkMode: false,
};

export const INITIAL_STATS: UserStats = {
  xp: 1250,
  streak: 5,
  dialoguesCompleted: 12,
  level: 4,
  stars: 0,
};

export const SCENARIOS: Scenario[] = [
  {
    id: 'restaurant',
    title: 'At the Restaurant',
    description: 'Order food and handle special requests with a waiter.',
    icon: 'Coffee',
    color: 'bg-orange-500',
    difficulty: 'A1',
    role: 'a friendly waiter at a cafe called "Sunny Side"',
    objective: 'Order a meal and a drink, and ask for the bill.'
  },
  {
    id: 'interview',
    title: 'Job Interview',
    description: 'Answer common questions for a software developer role.',
    icon: 'Briefcase',
    color: 'bg-blue-600',
    difficulty: 'B2',
    role: 'a strict but fair hiring manager named Mr. Smith',
    objective: 'Introduce yourself and answer 3 questions about your strengths.'
  },
  {
    id: 'supermarket',
    title: 'Supermarket',
    description: 'Ask for specific items and pay at the counter.',
    icon: 'ShoppingCart',
    color: 'bg-green-500',
    difficulty: 'A2',
    role: 'a helpful shop assistant',
    objective: 'Find 3 ingredients for a cake and ask about payment methods.'
  },
  {
    id: 'airport',
    title: 'Airport Check-in',
    description: 'Check in your bags and ask about your gate.',
    icon: 'Plane',
    color: 'bg-indigo-500',
    difficulty: 'B1',
    role: 'an airline check-in agent',
    objective: 'Check in one bag and ask for a window seat.'
  },
  {
    id: 'emergency',
    title: 'Emergency',
    description: 'Report a lost item or a medical issue.',
    icon: 'Ambulance',
    color: 'bg-red-500',
    difficulty: 'B1',
    role: 'a 911 dispatcher or police officer',
    objective: 'Explain that you lost your wallet and describe it.'
  },
  {
    id: 'doctor',
    title: 'Doctor\'s Appointment',
    description: 'Describe symptoms and ask for medical advice.',
    icon: 'Stethoscope',
    color: 'bg-teal-500',
    difficulty: 'B1',
    role: 'a caring general practitioner',
    objective: 'Explain you have a headache and fever, and ask for a prescription.'
  },
  {
    id: 'hotel',
    title: 'Hotel Check-in',
    description: 'Check into a hotel and ask about amenities.',
    icon: 'BedDouble',
    color: 'bg-purple-500',
    difficulty: 'A2',
    role: 'a welcoming hotel receptionist',
    objective: 'Check in under your name and ask for the breakfast times.'
  },
  {
    id: 'directions',
    title: 'Asking for Directions',
    description: 'Find your way to a tourist attraction.',
    icon: 'MapPin',
    color: 'bg-pink-500',
    difficulty: 'A1',
    role: 'a friendly local stranger',
    objective: 'Ask how to get to the nearest subway station.'
  },
  {
    id: 'tech_support',
    title: 'Tech Support',
    description: 'Troubleshoot a problem with your laptop.',
    icon: 'Laptop',
    color: 'bg-gray-600',
    difficulty: 'B2',
    role: 'a patient technical support agent',
    objective: 'Explain that your internet is slow and follow troubleshooting steps.'
  },
  {
    id: 'social',
    title: 'Meeting a Neighbor',
    description: 'Introduce yourself to someone living next door.',
    icon: 'Users',
    color: 'bg-yellow-500',
    difficulty: 'A2',
    role: 'a chatty neighbor named Sarah',
    objective: 'Introduce yourself and ask about the garbage collection schedule.'
  }
];

export const VOICE_CONFIGS = {
  max: {
    live: 'Fenrir', // Deep, masculine (Valid Gemini Voice)
    tts: 'Fenrir'
  },
  linda: {
    live: 'Aoede', // Higher, feminine (Valid Gemini Voice)
    tts: 'Aoede'
  }
};