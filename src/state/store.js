/**
 * Persistent application store for CampusRide.
 * Saves user account, trips, groups, search plan, reports, and feedback in localStorage.
 */

import {
  DEMO_PLAN,
  INITIAL_CURRENT_USER,
  SEED_STUDENTS,
  SEED_TRIPS,
  TIME_WINDOWS,
  UPCOMING_DATES,
} from '../data/mockData.js';
import { estimateRouteTotalFare } from '../utils/matching.js';

const STATE_STORAGE_KEY = 'campusride-state-v1';

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function computeInitials(name) {
  const clean = String(name || '').trim();
  if (!clean) return 'ST';
  const words = clean.split(/\s+/).filter(Boolean);
  return words.length >= 2
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : clean.slice(0, 2).toUpperCase();
}

function defaultState() {
  return {
    screen: 'landing',
    previousScreen: 'landing',
    isSignedIn: false,
    currentUser: clone(INITIAL_CURRENT_USER),
    students: clone(SEED_STUDENTS),
    trips: clone(SEED_TRIPS),
    plan: {
      from: 'Greater Noida',
      to: '',
      date: UPCOMING_DATES.friday,
      timeWindowId: 'evening',
      mode: 'Cab / Sedan',
      groupSize: 4,
    },
    hasSearched: false,
    isLoadingMatches: false,
    selectedTripId: 'trip_1',
    viewingStudentId: 'stu_me',
    lastFareSplitValue: null,
    reports: [],
    feedbackList: [],
  };
}

function loadPersistedState() {
  const base = defaultState();
  try {
    const raw = window.localStorage?.getItem(STATE_STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw);
    if (saved.currentUser && typeof saved.currentUser.name === 'string') {
      base.currentUser = { ...base.currentUser, ...saved.currentUser };
    }
    base.isSignedIn = Boolean(saved.isSignedIn);
    if (Array.isArray(saved.trips) && saved.trips.length > 0) {
      base.trips = saved.trips;
    }
    if (saved.plan && typeof saved.plan === 'object') {
      base.plan = { ...base.plan, ...saved.plan };
    }
    base.hasSearched = Boolean(saved.hasSearched);
    if (saved.selectedTripId) {
      base.selectedTripId = saved.selectedTripId;
    }
    if (Array.isArray(saved.reports)) {
      base.reports = saved.reports;
    }
    if (Array.isArray(saved.feedbackList)) {
      base.feedbackList = saved.feedbackList;
    }
  } catch {
    // Fallback to clean defaults if storage is unavailable or corrupted
  }
  return base;
}

export const store = loadPersistedState();

export function persistState() {
  try {
    const snapshot = {
      isSignedIn: store.isSignedIn,
      currentUser: store.currentUser,
      trips: store.trips,
      plan: store.plan,
      hasSearched: store.hasSearched,
      selectedTripId: store.selectedTripId,
      reports: store.reports,
      feedbackList: store.feedbackList,
    };
    window.localStorage?.setItem(STATE_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore storage quota errors
  }
}

export function getStudentById(studentId) {
  if (studentId === store.currentUser.id) return store.currentUser;
  return store.students[studentId] || null;
}

export function getTripById(tripId) {
  return store.trips.find((t) => t.id === tripId) || null;
}

export function getUserTrips() {
  const userId = store.currentUser.id;
  return store.trips.filter(
    (t) => t.members.includes(userId) || t.createdBy === userId
  );
}

export function joinTripGroup(tripId) {
  const trip = getTripById(tripId);
  if (!trip) return { ok: false, reason: 'Trip not found.' };

  const userId = store.currentUser.id;
  if (trip.members.includes(userId)) return { ok: true };
  if (trip.members.length >= trip.maxSeats) {
    return { ok: false, reason: 'This group is already full.' };
  }

  trip.members.push(userId);
  persistState();
  return { ok: true };
}

export function leaveTripGroup(tripId) {
  const trip = getTripById(tripId);
  if (!trip) return { ok: false };

  const userId = store.currentUser.id;
  trip.members = trip.members.filter((id) => id !== userId);
  persistState();
  return { ok: true };
}

export function addChatMessage(tripId, text) {
  const trip = getTripById(tripId);
  const trimmed = (text || '').trim();
  if (!trip || !trimmed) return false;

  const now = new Date();
  const timestamp = now.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  });

  trip.messages.push({
    id: `m_${Date.now()}`,
    senderId: store.currentUser.id,
    text: trimmed,
    timestamp,
  });
  persistState();
  return true;
}

/**
 * Creates a brand-new group from the user's current Ride Plan and selects it.
 */
export function createGroupFromPlan(plan) {
  const win = TIME_WINDOWS.find((w) => w.id === plan.timeWindowId) || TIME_WINDOWS[3];
  const from = plan.from.trim();
  const to = plan.to.trim();
  const newTrip = {
    id: `trip_${Date.now()}`,
    createdBy: store.currentUser.id,
    from,
    to,
    date: plan.date,
    startHour: win.startHour,
    endHour: win.endHour,
    timeDisplay: win.shortLabel,
    mode: plan.mode,
    maxSeats: Number(plan.groupSize) || 4,
    members: [store.currentUser.id],
    estimatedTotalFare: estimateRouteTotalFare(from, to, plan.mode),
    pickupNote: `Pickup around ${from}`,
    messages: [
      {
        id: `m_${Date.now()}`,
        senderId: store.currentUser.id,
        text: `Started a group for ${from} → ${to} (${win.shortLabel}). Feel free to join and coordinate pickup.`,
        timestamp: 'Just now',
      },
    ],
  };

  store.trips.unshift(newTrip);
  store.selectedTripId = newTrip.id;
  persistState();
  return newTrip;
}

export function updateCurrentUserProfile({ name, homeCity, preferences, communicationComfort }) {
  const cleanName = (name || '').trim();
  if (!cleanName) return false;

  store.currentUser.name = cleanName;
  store.currentUser.initials = computeInitials(cleanName);
  store.currentUser.homeCity = (homeCity || '').trim() || store.currentUser.homeCity;
  store.currentUser.preferences = preferences;
  store.currentUser.communicationComfort = communicationComfort;
  persistState();
  return true;
}

export function signInUser({ name, collegeEmail, homeCity }) {
  const cleanName = (name || '').trim();
  const cleanEmail = (collegeEmail || '').trim().toLowerCase();
  const cleanCity = (homeCity || '').trim();
  if (!cleanName || !cleanEmail || !cleanCity) return false;

  store.currentUser.name = cleanName;
  store.currentUser.initials = computeInitials(cleanName);
  store.currentUser.collegeEmail = cleanEmail;
  store.currentUser.homeCity = cleanCity;
  store.isSignedIn = true;
  persistState();
  return true;
}

export function signOutUser() {
  store.isSignedIn = false;
  persistState();
}

export function submitReport({ targetType, targetId, reason }) {
  store.reports.push({
    id: `rep_${Date.now()}`,
    targetType,
    targetId,
    reason,
    createdAt: new Date().toISOString(),
  });
  persistState();
}

export function submitFeedback({ rating, message }) {
  store.feedbackList.push({
    id: `fb_${Date.now()}`,
    rating,
    message: (message || '').trim(),
    createdAt: new Date().toISOString(),
  });
  persistState();
}

export function applyDemoPlan() {
  store.plan = { ...DEMO_PLAN };
  store.hasSearched = true;
  persistState();
}
