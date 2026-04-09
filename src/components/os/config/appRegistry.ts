"use client";
import { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import {
  LucideIcon,
  FolderOpen,
  Settings,
  Mail,
  Calendar,
  Image,
  Music,
  Terminal,
  Globe,
  MessageSquare,
  FileText,
  Code,
  ShoppingBag,
  TrendingUp,
  BarChart2,
  DollarSign,
  ScanLine,
  Shield,
  Bot,
  Bell,
  Zap,
  Code2,
} from 'lucide-react';
import { AppMenuConfig, ContextMenuConfig } from '../types';

import {
  finderMenuConfig,
  finderContextMenuConfig,
  settingsMenuConfig,
  photosMenuConfig,
  musicMenuConfig,
  messagesMenuConfig,
  browserMenuConfig,
  terminalMenuConfig,
  terminalContextMenuConfig,
  devCenterMenuConfig,
  notepadMenuConfig,
  calendarMenuConfig,
  appStoreMenuConfig,
  mailMenuConfig,
} from './app-menus';

const FileManager = dynamic(() => import('@/components/os/components/FileManager').then((module) => module.FileManager), { ssr: false });
const SettingsApp = dynamic(() => import('@/components/os/components/Settings').then((module) => module.Settings), { ssr: false });
const Photos = dynamic(() => import('@/components/os/components/apps/Photos').then((module) => module.Photos), { ssr: false });
const MusicApp = dynamic(() => import('@/components/os/components/apps/Music').then((module) => module.Music), { ssr: false });
const Messages = dynamic(() => import('@/components/os/components/apps/Messages').then((module) => module.Messages), { ssr: false });
const Browser = dynamic(() => import('@/components/os/components/apps/Browser').then((module) => module.Browser), { ssr: false });
const TerminalApp = dynamic(() => import('@/components/os/components/apps/Terminal').then((module) => module.Terminal), { ssr: false });
const DevCenter = dynamic(() => import('@/components/os/components/apps/DevCenter').then((module) => module.DevCenter), { ssr: false });
const Notepad = dynamic(() => import('@/components/os/components/apps/Notepad').then((module) => module.Notepad), { ssr: false });
const CalendarApp = dynamic(() => import('@/components/os/components/apps/Calendar').then((module) => module.Calendar), { ssr: false });
const AppStoreComponent = dynamic(() => import('@/components/os/components/apps/AppStore').then((module) => module.AppStore), { ssr: false });
const MailApp = dynamic(() => import('@/components/os/components/apps/Mail').then((module) => module.Mail), { ssr: false });

// ── FINOVA Financial Apps ──
const TrackApp = dynamic(() => import('@/components/os/components/apps/TrackApp').then((m) => m.Track), { ssr: false });
const SaveApp = dynamic(() => import('@/components/os/components/apps/SaveApp').then((m) => m.Save), { ssr: false });
const VoraApp = dynamic(() => import('@/components/os/components/apps/VoraApp').then((m) => m.VoraApp), { ssr: false });
const ReceiptScannerApp = dynamic(() => import('@/components/os/components/apps/ReceiptScannerApp').then((m) => m.ReceiptScannerApp), { ssr: false });
const BudgetEnforcerApp = dynamic(() => import('@/components/os/components/apps/BudgetEnforcerApp').then((m) => m.BudgetEnforcerApp), { ssr: false });
const InvestApp = dynamic(() => import('@/components/os/components/apps/InvestApp').then((m) => m.InvestApp), { ssr: false });
const AlertsCenterApp = dynamic(() => import('@/components/os/components/apps/AlertsCenterApp').then((m) => m.AlertsCenterApp), { ssr: false });
const TransactionDecoderApp = dynamic(() => import('@/components/os/components/apps/TransactionDecoderApp').then((m) => m.TransactionDecoderApp), { ssr: false });
const AutomationBuilderApp = dynamic(() => import('@/components/os/components/apps/AutomationBuilderApp').then((m) => m.AutomationBuilderApp), { ssr: false });

export interface AppMetadata {
  id: string;
  name: string;
  nameKey?: string;
  description: string;
  descriptionKey?: string;
  icon: LucideIcon;
  iconImage?: string;
  iconColor: string;
  iconSolid: string;
  category: 'productivity' | 'media' | 'utilities' | 'development' | 'system' | 'admin' | 'academic' | 'management' | 'financial' | 'ai';
  isCore: boolean;
  component: ComponentType<any>;
  dockOrder?: number;
  menu?: AppMenuConfig;
  contextMenu?: ContextMenuConfig;
  size?: number;
  ramUsage?: number;
  allowedRoles?: string[];
  defaultSize?: { width: number; height: number };
}

export const APP_REGISTRY: Record<string, AppMetadata> = {
  finder: {
    id: 'finder',
    name: 'Finder',
    description: 'File Manager',
    descriptionKey: 'appDescriptions.finder',
    icon: FolderOpen,
    iconImage: '/os-assets/icons/finder.svg',
    iconColor: 'from-blue-500 to-blue-600',
    iconSolid: '#3b82f6',
    category: 'system',
    isCore: true,
    component: FileManager,
    dockOrder: 1,
    menu: finderMenuConfig,
    contextMenu: finderContextMenuConfig,
    size: 50,
    ramUsage: 300,
  },
  browser: {
    id: 'browser',
    name: 'Browser',
    description: 'Access the web',
    descriptionKey: 'appDescriptions.browser',
    icon: Globe,
    iconImage: '/os-assets/icons/browser.svg',
    iconColor: 'from-blue-400 to-indigo-500',
    iconSolid: '#6366f1',
    category: 'utilities',
    isCore: true,
    component: Browser,
    dockOrder: 2,
    menu: browserMenuConfig,
    size: 280,
    ramUsage: 450,
  },
  mail: {
    id: 'mail',
    name: 'Mail',
    description: 'Read and write emails',
    descriptionKey: 'appDescriptions.mail',
    icon: Mail,
    iconColor: 'from-blue-400 to-sky-400',
    iconSolid: '#38bdf8',
    category: 'productivity',
    isCore: true,
    component: MailApp,
    dockOrder: 3,
    menu: mailMenuConfig,
    size: 120,
    ramUsage: 250,
  },
  appstore: {
    id: 'appstore',
    name: 'App Store',
    description: 'Download and manage apps',
    descriptionKey: 'appDescriptions.appStore',
    icon: ShoppingBag,
    iconColor: 'from-sky-500 to-blue-500',
    iconSolid: '#0ea5e9',
    category: 'system',
    isCore: true,
    component: AppStoreComponent,
    dockOrder: 4,
    menu: appStoreMenuConfig,
    size: 90,
    ramUsage: 200,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Command line interface',
    descriptionKey: 'appDescriptions.terminal',
    icon: Terminal,
    iconColor: 'from-gray-700 to-gray-800',
    iconSolid: '#374151',
    category: 'development',
    isCore: true,
    component: TerminalApp,
    dockOrder: 9,
    menu: terminalMenuConfig,
    contextMenu: terminalContextMenuConfig,
    size: 15,
    ramUsage: 100,
  },
  settings: {
    id: 'settings',
    name: 'System Settings',
    description: 'Configure your system',
    descriptionKey: 'appDescriptions.systemSettings',
    icon: Settings,
    iconColor: 'from-slate-500 to-zinc-600',
    iconSolid: '#71717a',
    category: 'system',
    isCore: true,
    component: SettingsApp,
    dockOrder: 10,
    menu: settingsMenuConfig,
    size: 85,
    ramUsage: 150,
  },

  notepad: {
    id: 'notepad',
    name: 'Notepad',
    description: 'Edit text files',
    descriptionKey: 'appDescriptions.notepad',
    icon: FileText,
    iconColor: 'from-yellow-400 to-amber-500',
    iconSolid: '#f59e0b',
    category: 'productivity',
    isCore: false,
    component: Notepad,
    dockOrder: 5,
    menu: notepadMenuConfig,
    size: 35,
    ramUsage: 150,
  },
  messages: {
    id: 'messages',
    name: 'Messages',
    description: 'Chat with friends',
    descriptionKey: 'appDescriptions.messages',
    icon: MessageSquare,
    iconColor: 'from-green-500 to-emerald-600',
    iconSolid: '#10b981',
    category: 'productivity',
    isCore: false,
    component: Messages,
    dockOrder: 6,
    menu: messagesMenuConfig,
    size: 140,
    ramUsage: 250,
  },
  calendar: {
    id: 'calendar',
    name: 'Calendar',
    description: 'Manage your schedule',
    descriptionKey: 'appDescriptions.calendar',
    icon: Calendar,
    iconColor: 'from-red-500 to-red-600',
    iconSolid: '#ef4444',
    category: 'productivity',
    isCore: false,
    component: CalendarApp,
    dockOrder: 7,
    menu: calendarMenuConfig,
    size: 50,
    ramUsage: 250,
  },
  photos: {
    id: 'photos',
    name: 'Photos',
    description: 'View and manage photos',
    descriptionKey: 'appDescriptions.photos',
    icon: Image,
    iconColor: 'from-pink-500 to-rose-600',
    iconSolid: '#e11d48',
    category: 'media',
    isCore: false,
    component: Photos,
    dockOrder: 8,
    menu: photosMenuConfig,
    size: 180,
    ramUsage: 350,
  },
  music: {
    id: 'music',
    name: 'Music',
    description: 'Play your favorite music',
    descriptionKey: 'appDescriptions.music',
    icon: Music,
    iconColor: 'from-purple-500 to-purple-600',
    iconSolid: '#a855f7',
    category: 'media',
    isCore: false,
    component: MusicApp,
    dockOrder: 11,
    menu: musicMenuConfig,
    size: 210,
    ramUsage: 300,
  },
  'dev-center': {
    id: 'dev-center',
    name: 'DevCenter',
    description: 'Developer Tools',
    descriptionKey: 'appDescriptions.devCenter',
    icon: Code,
    iconColor: 'from-indigo-500 to-purple-600',
    iconSolid: '#6366f1',
    category: 'development',
    isCore: false,
    component: DevCenter,
    dockOrder: 12,
    menu: devCenterMenuConfig,
    size: 550,
    ramUsage: 1000,
  },

  // ══════════════════════════════════════════
  // 💸 FINOVA FINANCIAL OS APPS
  // ══════════════════════════════════════════
  'finova-track': {
    id: 'finova-track',
    name: 'TRACK',
    description: 'Log expenses with AI auto-categorization',
    icon: DollarSign,
    iconColor: 'from-emerald-500 to-green-600',
    iconSolid: '#10d98a',
    category: 'financial',
    isCore: true,
    component: TrackApp,
    dockOrder: 20,
    size: 180,
    ramUsage: 200,
    defaultSize: { width: 680, height: 600 },
  },
  'finova-save': {
    id: 'finova-save',
    name: 'SAVE',
    description: 'Analytics dashboard & financial health score',
    icon: BarChart2,
    iconColor: 'from-blue-500 to-indigo-600',
    iconSolid: '#3b82f6',
    category: 'financial',
    isCore: true,
    component: SaveApp,
    dockOrder: 21,
    size: 120,
    ramUsage: 250,
    defaultSize: { width: 900, height: 640 },
  },
  'finova-invest': {
    id: 'finova-invest',
    name: 'INVEST',
    description: 'Market terminal, SIP calculator & AI advisor',
    icon: TrendingUp,
    iconColor: 'from-purple-500 to-violet-600',
    iconSolid: '#8b5cf6',
    category: 'financial',
    isCore: true,
    component: InvestApp,
    dockOrder: 22,
    size: 200,
    ramUsage: 300,
    defaultSize: { width: 860, height: 580 },
  },
  'finova-vora': {
    id: 'finova-vora',
    name: 'VORA AI',
    description: 'AI financial advisor with real-time data',
    icon: Bot,
    iconColor: 'from-amber-500 to-yellow-500',
    iconSolid: '#f59e0b',
    category: 'ai',
    isCore: true,
    component: VoraApp,
    dockOrder: 23,
    size: 80,
    ramUsage: 400,
    defaultSize: { width: 600, height: 580 },
  },
  'finova-scanner': {
    id: 'finova-scanner',
    name: 'Receipt Scan',
    description: 'AI receipt OCR with auto-fill',
    icon: ScanLine,
    iconColor: 'from-pink-500 to-rose-600',
    iconSolid: '#ec4899',
    category: 'financial',
    isCore: true,
    component: ReceiptScannerApp,
    dockOrder: 24,
    size: 30,
    ramUsage: 150,
    defaultSize: { width: 580, height: 580 },
  },
  'finova-budget': {
    id: 'finova-budget',
    name: 'Budget Guard',
    description: 'Monthly budget limits & alert system',
    icon: Shield,
    iconColor: 'from-orange-500 to-red-500',
    iconSolid: '#f97316',
    category: 'financial',
    isCore: true,
    component: BudgetEnforcerApp,
    dockOrder: 25,
    size: 40,
    ramUsage: 100,
    defaultSize: { width: 600, height: 560 },
  },
  'finova-alerts': {
    id: 'finova-alerts',
    name: 'Alerts',
    description: 'Smart financial notifications & budget warnings',
    icon: Bell,
    iconColor: 'from-violet-500 to-purple-600',
    iconSolid: '#8b5cf6',
    category: 'financial',
    isCore: true,
    component: AlertsCenterApp,
    dockOrder: 26,
    size: 20,
    ramUsage: 80,
    defaultSize: { width: 520, height: 560 },
  },
  'finova-decoder': {
    id: 'finova-decoder',
    name: 'TX Decoder',
    description: 'AI-powered bank transaction decoder',
    icon: Code2,
    iconColor: 'from-amber-500 to-yellow-400',
    iconSolid: '#f59e0b',
    category: 'financial',
    isCore: true,
    component: TransactionDecoderApp,
    dockOrder: 27,
    size: 15,
    ramUsage: 120,
    defaultSize: { width: 560, height: 600 },
  },
  'finova-automation': {
    id: 'finova-automation',
    name: 'Automations',
    description: 'Build IF-THEN financial automation rules',
    icon: Zap,
    iconColor: 'from-amber-400 to-orange-500',
    iconSolid: '#f97316',
    category: 'financial',
    isCore: true,
    component: AutomationBuilderApp,
    dockOrder: 28,
    size: 18,
    ramUsage: 80,
    defaultSize: { width: 560, height: 580 },
  },
};

function filterByRole(apps: AppMetadata[], role?: string): AppMetadata[] {
  if (!role) return apps;
  return apps.filter((app) => {
    if (!app.allowedRoles) return true;
    return app.allowedRoles.includes(role);
  });
}

export function getApp(appId: string): AppMetadata | undefined {
  return APP_REGISTRY[appId];
}

export function getAllApps(role?: string): AppMetadata[] {
  return filterByRole(Object.values(APP_REGISTRY), role);
}

export function getCoreApps(role?: string): AppMetadata[] {
  return getAllApps(role).filter((app) => app.isCore);
}

export function getOptionalApps(role?: string): AppMetadata[] {
  return getAllApps(role).filter((app) => !app.isCore);
}

export function getDockApps(installedAppIds: Set<string>, role?: string): AppMetadata[] {
  return getAllApps(role)
    .filter((app) => app.isCore || installedAppIds.has(app.id))
    .filter((app) => app.dockOrder !== undefined)
    .sort((a, b) => (a.dockOrder || 999) - (b.dockOrder || 999));
}

export function getAppsByCategory(category: AppMetadata['category'], role?: string): AppMetadata[] {
  return getAllApps(role).filter((app) => app.category === category);
}
