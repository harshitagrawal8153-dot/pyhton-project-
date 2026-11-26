/**
 * Screen 4: Group Page
 * Shows confirmed members, seats left, live per-person fare split, join/leave, and chat panel.
 */
import {
  addChatMessage,
  getStudentById,
  getTripById,
  joinTripGroup,
  leaveTripGroup,
  store,
} from '../state/store.js';
import { escapeHtml } from '../utils/dom.js';
import {
  calculateFareSplit,
  formatCurrency,
  formatDateLabel,
} from '../utils/matching.js';
import { animateCurrencyValue } from '../utils/motion.js';

export function renderGroup(container, { navigate }) {
  const trip = getTripById(store.selectedTripId) || store.trips[0];
  if (!trip) {
    navigate('matches');
    return;
  }

  const userId = store.currentUser.id;
  const isJoined = trip.members.includes(userId);
  const confirmedCount = trip.members.length;
  const seatsLeft = Math.max(0, trip.maxSeats - confirmedCount);
  const isFull = seatsLeft === 0 && !isJoined;
  const perPersonSplit = calculateFareSplit(trip.estimatedTotalFare, confirmedCount);

  let actionButtonHtml = '';
  if (isJoined) {
    actionButtonHtml = `<button type="button" class="btn btn-secondary btn-full" id="group-toggle-membership">Leave group</button>`;
  } else if (isFull) {
    actionButtonHtml = `<button type="button" class="btn btn-secondary btn-full" disabled>Group is full</button>`;
  } else {
    actionButtonHtml = `<button type="button" class="btn btn-primary btn-full" id="group-toggle-membership">Join group</button>`;
  }

  const membersHtml =
    confirmedCount === 0
      ? `<p class="muted" style="margin: 16px 0 0;">No confirmed members yet. Join this group to lock the first seat.</p>`
      : `<div class="member-list">
          ${trip.members
            .map((memberId) => {
              const student = getStudentById(memberId);
              if (!student) return '';
              const selfTag = student.id === userId ? ' (You)' : '';
              return `
                <button type="button" class="member-row" data-student-id="${escapeHtml(student.id)}">
                  <span class="member-left">
                    <span class="avatar" aria-hidden="true">${escapeHtml(student.initials)}</span>
                    <span>
                      <span class="member-name">${escapeHtml(student.name)}${selfTag}</span><br />
                      <span class="member-sub">${escapeHtml(student.homeCity)} · ${escapeHtml(student.communicationComfort)}</span>
                    </span>
                  </span>
                  <span class="member-action-hint">Profile</span>
                </button>
              `;
            })
            .join('')}
        </div>`;

  const messagesHtml =
    trip.messages.length === 0
      ? `<p class="muted" style="margin: auto; text-align: center;">No messages yet. Say hello to coordinate pickup.</p>`
      : trip.messages
          .map((msg) => {
            const sender = getStudentById(msg.senderId);
            const senderName = sender ? sender.name : 'Student';
            const isSelf = msg.senderId === userId;
            return `
              <div class="chat-bubble ${isSelf ? 'is-self' : ''}">
                <div class="chat-meta">
                  <span class="chat-sender">${escapeHtml(isSelf ? 'You' : senderName)}</span>
                  <span class="chat-time">${escapeHtml(msg.timestamp)}</span>
                </div>
                <p class="chat-text">${escapeHtml(msg.text)}</p>
              </div>
            `;
          })
          .join('');

  const backTarget = store.hasSearched ? 'matches' : 'plan';
  const backLabel = store.hasSearched ? '← Back to matches' : '← Plan a ride';

  container.innerHTML = `
    <div class="container">
      <div class="back-row">
        <button type="button" class="btn btn-ghost" id="group-back-btn">${backLabel}</button>
      </div>

      <div class="group-grid">
        <div class="group-stack">
          <section class="card" aria-labelledby="group-route-title">
            <div class="match-top">
              <span class="badge badge-neutral">${escapeHtml(trip.mode)}</span>
              <span class="badge ${seatsLeft > 0 ? 'badge-score' : 'badge-neutral'} tabular">
                ${seatsLeft === 1 ? '1 seat left' : `${seatsLeft} seats left`}
              </span>
            </div>

            <h1 id="group-route-title" class="page-title" style="font-size: 1.625rem; margin-top: 8px;">
              ${escapeHtml(trip.from)} → ${escapeHtml(trip.to)}
            </h1>
            <p class="muted" style="margin: 6px 0 0;">
              ${escapeHtml(formatDateLabel(trip.date))} · ${escapeHtml(trip.timeDisplay)}
            </p>
            <p class="muted" style="margin: 4px 0 0;">
              ${escapeHtml(trip.pickupNote || '')}
            </p>

            <div class="fare-grid">
              <div>
                <div class="fare-stat-label">Est. total fare</div>
                <div class="fare-stat-value tabular">${escapeHtml(formatCurrency(trip.estimatedTotalFare))}</div>
              </div>
              <div>
                <div class="fare-stat-label">Confirmed</div>
                <div class="fare-stat-value tabular">${confirmedCount} / ${trip.maxSeats}</div>
              </div>
              <div>
                <div class="fare-stat-label">Per-person split</div>
                <div class="fare-stat-value is-highlight tabular" id="live-fare-split">
                  ${escapeHtml(formatCurrency(perPersonSplit))}
                </div>
              </div>
            </div>

            ${actionButtonHtml}

            <p class="fare-note">
              ${
                confirmedCount === 0
                  ? 'Per-person split updates once at least 1 member confirms. '
                  : ''
              }Estimates only. CampusRide does not book cabs or verify identity.
            </p>
          </section>

          <section class="card" aria-labelledby="confirmed-members-heading">
            <h2 id="confirmed-members-heading" class="section-title">Confirmed members</h2>
            <p class="muted" style="margin: 4px 0 0;">Select any member to view their preferences and communication comfort.</p>
            ${membersHtml}
          </section>
        </div>

        <section class="card chat-card" aria-labelledby="group-chat-heading">
          <div class="chat-header">
            <h2 id="group-chat-heading">Group chat</h2>
            <p class="muted" style="margin: 4px 0 0;">Coordinate pickup timing and luggage before you travel.</p>
          </div>

          <div class="chat-messages" id="chat-messages">
            ${messagesHtml}
          </div>

          <form class="chat-form" id="chat-form">
            <label for="chat-input" class="sr-only">Message the group</label>
            <input
              id="chat-input"
              type="text"
              class="input"
              placeholder="Write a message (e.g., meeting at main gate at 5:45 PM)..."
              autocomplete="off"
              maxlength="240"
            />
            <button type="submit" class="btn btn-primary">Send</button>
          </form>
        </section>
      </div>
    </div>
  `;

  // Animate per-person split when it changes
  const splitEl = container.querySelector('#live-fare-split');
  if (splitEl) {
    animateCurrencyValue(splitEl, store.lastFareSplitValue, perPersonSplit, 280);
    store.lastFareSplitValue = perPersonSplit;
  }

  // Keep chat scrolled to latest message
  const chatScroll = container.querySelector('#chat-messages');
  if (chatScroll) {
    chatScroll.scrollTop = chatScroll.scrollHeight;
  }

  container.querySelector('#group-back-btn')?.addEventListener('click', () => {
    navigate(backTarget);
  });

  container.querySelector('#group-toggle-membership')?.addEventListener('click', () => {
    if (isJoined) {
      leaveTripGroup(trip.id);
    } else {
      joinTripGroup(trip.id);
    }
    renderGroup(container, { navigate });
  });

  container.querySelectorAll('[data-student-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      store.viewingStudentId = btn.getAttribute('data-student-id');
      store.previousScreen = 'group';
      navigate('profile');
    });
  });

  const chatForm = container.querySelector('#chat-form');
  const chatInput = container.querySelector('#chat-input');
  chatForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const text = chatInput?.value || '';
    if (!text.trim()) return;
    addChatMessage(trip.id, text);
    renderGroup(container, { navigate });
    // Restore focus to input cleanly
    container.querySelector('#chat-input')?.focus();
  });
}
