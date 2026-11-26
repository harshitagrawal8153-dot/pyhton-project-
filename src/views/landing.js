/**
 * Screen 1: Landing Page
 */
import { cities } from '../data/cities.js';
import { escapeHtml } from '../utils/dom.js';

export function renderLanding(container, { navigate }) {
  container.innerHTML = `
    <div class="container">
      <section class="hero">
        <div class="hero-grid">
          <div class="hero-copy">
            <span class="eyebrow">Shared weekend &amp; holiday travel for students</span>
            <h1 class="hero-title">Find your route. Find your people. Share the journey.</h1>
            <p class="lead">
              Going home on the weekend or heading to the station? See who from your campus is travelling in the same direction around the same time.
            </p>
            <p class="hero-question">
              “Who from my campus is going in the same direction around the same time?”
            </p>
            <div class="hero-cta">
              <button type="button" class="btn btn-primary" id="landing-plan-btn">Plan a ride</button>
              <button type="button" class="btn btn-ghost" id="safety-modal-btn" style="margin-left:8px;">Travel safely</button>
            </div>
            <!-- Safety Modal -->
            <div id="safety-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 hidden">
              <div class="bg-white rounded-lg p-6 max-w-md w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg font-semibold">Travel safely</h3>
                  <button type="button" id="safety-modal-close" aria-label="Close">&times;</button>
                </div>
                <ul class="list-disc pl-5 space-y-2">
                  <li>Meet at public pickup points.</li>
                  <li>Share trip details with a friend.</li>
                  <li>Confirm members before leaving.</li>
                </ul>
              </div>
            </div>
          </div>
          <div class="hero-media">
            <img
              src="./assets/images/hero-campus.svg"
              alt="Minimalist illustration of campus students sharing a weekend ride"
            />
          </div>
        </div>
      </section>

      <section class="landing-section" aria-labelledby="how-it-works-heading">
        <div class="section-header">
          <h2 id="how-it-works-heading" class="section-title">How it works</h2>
        </div>
        <div class="steps-grid">
          <article class="card step-card">
            <img class="step-thumb" src="./assets/images/step-route.svg" alt="Route and departure time window illustration" />
            <span class="step-number">1</span>
            <h3>Enter your route &amp; window</h3>
            <p>Share where you’re leaving from, your destination city, date, and approximate departure window.</p>
          </article>
          <article class="card step-card">
            <img class="step-thumb" src="./assets/images/step-connect.svg" alt="Compatible campus peer cards illustration" />
            <span class="step-number">2</span>
            <h3>Discover compatible peers</h3>
            <p>See students heading to the same destination or nearby area within a compatible time window.</p>
          </article>
          <article class="card step-card">
            <img class="step-thumb" src="./assets/images/step-journey.svg" alt="Equal fare split and group coordination illustration" />
            <span class="step-number">3</span>
            <h3>Coordinate &amp; split estimates</h3>
            <p>Check profiles, chat before leaving, form a small group, and view the live per-person fare estimate.</p>
          </article>
        </div>
      </section>

      <section class="landing-section" aria-labelledby="why-campusride-heading">
        <div class="section-header">
          <h2 id="why-campusride-heading" class="section-title">Why students use CampusRide</h2>
        </div>
        <div class="comparison-grid">
          <article class="card comparison-card">
            <h3>Without shared discovery</h3>
            <ul class="comparison-list">
              <li>Paying the full solo cab fare to the station, airport, or home city</li>
              <li>Travelling alone on late evening or early morning highway stretches</li>
              <li>Scrolling scattered group chats at the last minute with no clear timing</li>
            </ul>
          </article>
          <article class="card comparison-card is-benefit">
            <h3>With CampusRide</h3>
            <ul class="comparison-list">
              <li>Predictable estimated cost split across confirmed co-passengers</li>
              <li>Calm pre-journey introductions with student preferences upfront</li>
              <li>Quiet, structured coordination by route, date, and time window</li>
            </ul>
          </article>
        </div>
      </section>
    </div>
  `;

  container.querySelector('#landing-plan-btn')?.addEventListener('click', () => {
    navigate('plan');
  });
  // Safety modal toggle
  const safetyBtn = container.querySelector('#safety-modal-btn');
  const safetyModal = container.querySelector('#safety-modal');
  const safetyClose = container.querySelector('#safety-modal-close');
  safetyBtn?.addEventListener('click', () => {
    safetyModal?.classList.remove('hidden');
  });
  safetyClose?.addEventListener('click', () => {
    safetyModal?.classList.add('hidden');
  });

  // City search functionality
  const cityInput = container.querySelector('#city-search-input');
  const cityBtn = container.querySelector('#city-search-btn');
  const resultsEl = container.querySelector('#city-search-results');
  cityBtn?.addEventListener('click', () => {
    const query = cityInput?.value.trim().toLowerCase();
    if (!query) {
      resultsEl.innerHTML = `<p class="muted">Enter a city name to see its highlights.</p>`;
      return;
    }
    const city = cities.find((c) => c.name.toLowerCase() === query);
    if (!city) {
      resultsEl.innerHTML = `<p class="muted">No data found for “${escapeHtml(query)}”.</p>`;
      return;
    }
    const placesHtml = city.places.map(p => `<li>${escapeHtml(p)}</li>`).join('');
    resultsEl.innerHTML = `
      <div class="card">
        <h3 class="page-title">${escapeHtml(city.name)}</h3>
        <p class="muted">${escapeHtml(city.description)}</p>
        <h4 class="section-title mt-2">Famous places</h4>
        <ul class="list-disc pl-5 space-y-1">${placesHtml}</ul>
      </div>`;
  });
}
