/**
 * Route matching, time-window compatibility, scoring, and fare-split helpers.
 */

import { AREA_CLUSTERS, CORRIDOR_PAIRS, TIME_WINDOWS } from '../data/mockData.js';

export function normalizePlace(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves a free-text place to a known cluster key if one matches.
 */
export function resolveAreaCluster(placeText) {
  const norm = normalizePlace(placeText);
  if (!norm) return null;

  for (const [cluster, aliases] of Object.entries(AREA_CLUSTERS)) {
    for (const alias of aliases) {
      if (norm === alias || norm.includes(alias) || alias.includes(norm)) {
        return cluster;
      }
    }
  }
  return null;
}

function areCorridorNeighbors(clusterA, clusterB) {
  if (!clusterA || !clusterB) return false;
  return CORRIDOR_PAIRS.some(
    ([a, b]) => (a === clusterA && b === clusterB) || (a === clusterB && b === clusterA)
  );
}

/**
 * Computes route similarity (0..45) between user search and a trip.
 * Returns 0 if the destination is incompatible.
 */
export function computeRouteScore(queryFrom, queryTo, tripFrom, tripTo) {
  const normQTo = normalizePlace(queryTo);
  const normTTo = normalizePlace(tripTo);
  const normQFrom = normalizePlace(queryFrom);
  const normTFrom = normalizePlace(tripFrom);

  if (!normQTo || !normTTo || !normQFrom || !normTFrom) return 0;

  const qToCluster = resolveAreaCluster(normQTo);
  const tToCluster = resolveAreaCluster(normTTo);

  // Destination check: case-insensitive exact/substring OR shared nearby-area cluster
  let destScore = 0;
  if (normQTo === normTTo) {
    destScore = 30;
  } else if (qToCluster && tToCluster && qToCluster === tToCluster) {
    destScore = 27;
  } else if (normTTo.includes(normQTo) || normQTo.includes(normTTo)) {
    destScore = 26;
  } else {
    return 0; // Incompatible destination
  }

  // Origin check: same area/campus cluster scores highest; adjacent corridor scores slightly less
  const qFromCluster = resolveAreaCluster(normQFrom);
  const tFromCluster = resolveAreaCluster(normTFrom);

  let originScore = 0;
  if (normQFrom === normTFrom) {
    originScore = 15;
  } else if (qFromCluster && tFromCluster && qFromCluster === tFromCluster) {
    originScore = 14;
  } else if (normTFrom.includes(normQFrom) || normQFrom.includes(normTFrom)) {
    originScore = 13;
  } else if (areCorridorNeighbors(qFromCluster, tFromCluster)) {
    originScore = 9;
  } else {
    originScore = 4; // Different pickup area, same destination
  }

  return destScore + originScore; // Max 45
}

/**
 * Computes date compatibility: 0 diff = exact, 1 day diff = flexible nearby day, >1 = incompatible.
 */
export function getDateDayDifference(dateA, dateB) {
  if (!dateA || !dateB) return Infinity;
  const a = new Date(`${dateA}T00:00:00`);
  const b = new Date(`${dateB}T00:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return Infinity;
  return Math.round(Math.abs(a - b) / (1000 * 60 * 60 * 24));
}

/**
 * Computes time-window similarity (0..35). Returns 0 if incompatible.
 */
export function computeTimeScore(queryDate, queryWindowId, trip) {
  const dayDiff = getDateDayDifference(queryDate, trip.date);
  if (dayDiff > 1) return { score: 0, dayLabel: '' };

  const win = TIME_WINDOWS.find((w) => w.id === queryWindowId);
  if (!win) return { score: 0, dayLabel: '' };

  // Overlap between [win.startHour, win.endHour] and [trip.startHour, trip.endHour]
  const overlapStart = Math.max(win.startHour, trip.startHour);
  const overlapEnd = Math.min(win.endHour, trip.endHour);
  const overlapHours = Math.max(0, overlapEnd - overlapStart);

  const winMid = (win.startHour + win.endHour) / 2;
  const tripMid = (trip.startHour + trip.endHour) / 2;
  const midDiff = Math.abs(winMid - tripMid);

  // Compute gap between intervals when there is no overlap
  const gapHours = overlapHours > 0 ? 0 : Math.max(win.startHour - trip.endHour, trip.startHour - win.endHour);

  if (gapHours > 3.5) {
    return { score: 0, dayLabel: '' };
  }

  let timePoints = 0;
  if (overlapHours > 0) {
    timePoints = Math.round(28 + Math.max(0, 7 - midDiff * 2));
  } else {
    timePoints = Math.round(Math.max(12, 24 - gapHours * 4));
  }

  if (dayDiff === 1) {
    // Nearby date penalty so exact date trips always rank above ±1 day trips
    timePoints = Math.max(10, timePoints - 14);
  }

  return {
    score: Math.min(35, timePoints),
    dayLabel: dayDiff === 0 ? 'Same day' : 'Adjacent day (±1d)',
  };
}

/**
 * Computes seat availability score (0..20).
 */
export function computeSeatScore(trip, preferredGroupSize, currentUserId) {
  const isMember = trip.members.includes(currentUserId);
  const seatsLeft = Math.max(0, trip.maxSeats - trip.members.length);

  if (seatsLeft === 0 && !isMember) return 0;

  let score = seatsLeft >= 2 ? 15 : 11;
  if (trip.maxSeats === Number(preferredGroupSize)) {
    score += 5;
  } else if (Math.abs(trip.maxSeats - Number(preferredGroupSize)) === 1) {
    score += 3;
  }
  return Math.min(20, score);
}

/**
 * Safe fare split helper. Returns null when 0 confirmed members so UI never shows NaN/Infinity.
 */
export function calculateFareSplit(estimatedTotalFare, confirmedCount) {
  if (!Number.isFinite(estimatedTotalFare) || estimatedTotalFare <= 0) return null;
  if (!Number.isFinite(confirmedCount) || confirmedCount <= 0) return null;
  return Math.round(estimatedTotalFare / confirmedCount);
}

/**
 * Formats INR currency cleanly with tabular-friendly grouping.
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || !Number.isFinite(amount)) return '—';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

/**
 * Formats ISO YYYY-MM-DD date into a readable label like "Fri, 27 Nov".
 */
export function formatDateLabel(isoDate) {
  if (!isoDate) return '';
  const d = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Ranks all compatible trips for a user's ride plan.
 */
export function findMatchingTrips(trips, plan, currentUserId) {
  if (!plan || !plan.from || !plan.to || !plan.date) return [];

  const results = [];

  for (const trip of trips) {
    const routeScore = computeRouteScore(plan.from, plan.to, trip.from, trip.to);
    if (routeScore === 0) continue;

    const { score: timeScore, dayLabel } = computeTimeScore(plan.date, plan.timeWindowId, trip);
    if (timeScore === 0) continue;

    const seatScore = computeSeatScore(trip, plan.groupSize, currentUserId);
    if (seatScore === 0) continue;

    // Subtle preference boost for matching travel mode (up to +4 capped at 99)
    const modeBonus = trip.mode === plan.mode ? 3 : 0;
    const rawScore = Math.min(99, routeScore + timeScore + seatScore + modeBonus);

    const seatsLeft = Math.max(0, trip.maxSeats - trip.members.length);
    const isJoined = trip.members.includes(currentUserId);
    // Projected per-person estimate if user joins (or current split if already joined)
    const projectedCount = isJoined ? trip.members.length : trip.members.length + 1;
    const estimatedPerPerson = calculateFareSplit(trip.estimatedTotalFare, projectedCount);

    results.push({
      trip,
      matchScore: rawScore,
      dayLabel,
      seatsLeft,
      isJoined,
      estimatedPerPerson,
    });
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results;
}

/**
 * Generates a realistic fare estimate for newly created user groups when no preset exists.
 */
export function estimateRouteTotalFare(from, to, mode) {
  const destCluster = resolveAreaCluster(to);
  const baseByDest = {
    delhi_hub: 1350,
    jaipur: 2800,
    dehradun: 3200,
    lucknow: 3600,
    chandigarh: 3800,
    varanasi: 4200,
    ranchi: 4800,
    patna: 4600,
  };
  let base = baseByDest[destCluster] || 2400;
  if (mode === 'SUV / Innova') base = Math.round(base * 1.15);
  if (mode === 'Auto / Station Shuttle') base = Math.min(base, 900);
  return base;
}

export function validateRidePlan(plan) {
  const errors = {};
  const from = (plan.from || '').trim();
  const to = (plan.to || '').trim();

  if (!from) {
    errors.from = 'Please enter your campus or pickup area.';
  }
  if (!to) {
    errors.to = 'Please enter where you are heading.';
  }
  if (from && to && normalizePlace(from) === normalizePlace(to)) {
    errors.to = 'Pickup and destination look the same — enter a different destination.';
  }

  if (!plan.date) {
    errors.date = 'Choose a travel date.';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(`${plan.date}T00:00:00`);
    if (Number.isNaN(chosen.getTime())) {
      errors.date = 'Please pick a valid date.';
    } else if (chosen < today) {
      errors.date = 'That date has already passed. Pick today or an upcoming date.';
    }
  }

  if (!plan.timeWindowId) {
    errors.timeWindowId = 'Pick an approximate time window.';
  }

  const size = Number(plan.groupSize);
  if (!Number.isInteger(size) || size < 2 || size > 6) {
    errors.groupSize = 'Group size should be between 2 and 6 students.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
