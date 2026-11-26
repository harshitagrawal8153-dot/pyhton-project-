/**
 * Seeded mock data for CampusRide.
 * All trips use upcoming weekend dates relative to today so the demo stays current.
 */

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getUpcomingFriday(baseDate = new Date()) {
  const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
  const day = d.getDay(); // 0=Sun ... 5=Fri, 6=Sat
  const daysUntilFriday = (5 - day + 7) % 7;
  d.setDate(d.getDate() + daysUntilFriday);
  return d;
}

function addDays(date, days) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + days);
  return d;
}

const upcomingFridayDate = getUpcomingFriday();
export const UPCOMING_DATES = {
  friday: toISODate(upcomingFridayDate),
  saturday: toISODate(addDays(upcomingFridayDate, 1)),
  sunday: toISODate(addDays(upcomingFridayDate, 2)),
};

/**
 * Time windows used in "Plan a Ride" and for matching approximate departure ranges.
 */
export const TIME_WINDOWS = [
  { id: 'early_morning', label: 'Early morning (5:00 AM – 8:00 AM)', shortLabel: '5:00 AM – 8:00 AM', startHour: 5, endHour: 8 },
  { id: 'morning', label: 'Morning (8:00 AM – 12:00 PM)', shortLabel: '8:00 AM – 12:00 PM', startHour: 8, endHour: 12 },
  { id: 'afternoon', label: 'Afternoon (12:00 PM – 4:00 PM)', shortLabel: '12:00 PM – 4:00 PM', startHour: 12, endHour: 16 },
  { id: 'evening', label: 'Evening (4:00 PM – 8:00 PM)', shortLabel: '4:00 PM – 8:00 PM', startHour: 16, endHour: 20 },
  { id: 'night', label: 'Night (8:00 PM – 11:30 PM)', shortLabel: '8:00 PM – 11:30 PM', startHour: 20, endHour: 23.5 },
];

export const TRAVEL_MODES = [
  'Cab / Sedan',
  'SUV / Innova',
  'Auto / Station Shuttle',
];

/**
 * Nearby area clusters so matching treats adjacent pickup zones and destination neighborhoods as compatible.
 */
export const AREA_CLUSTERS = {
  greater_noida: [
    'greater noida',
    'knowledge park',
    'kp',
    'pari chowk',
    'bennett',
    'sharda',
    'galgotias',
    'alpha',
    'beta',
    'noida extension',
    'noida ext',
  ],
  noida: [
    'noida',
    'sector 62',
    'sec 62',
    'botanical garden',
    'sector 18',
    'amity',
  ],
  delhi_hub: [
    'delhi',
    'new delhi',
    'igi',
    'igi airport',
    'delhi airport',
    'airport',
    't3',
    't2',
    't1',
    'ndls',
    'new delhi railway station',
    'anand vihar',
    'kashmere gate',
  ],
  ranchi: [
    'ranchi',
    'birsa munda',
    'hatia',
    'lalpur',
    'kanke',
    'doranda',
  ],
  lucknow: [
    'lucknow',
    'gomti nagar',
    'charbagh',
    'alambagh',
    'hazratganj',
    'amausi',
  ],
  jaipur: [
    'jaipur',
    'malviya nagar',
    'sindhi camp',
    'vaishali nagar',
    'mi road',
  ],
  chandigarh: [
    'chandigarh',
    'mohali',
    'panchkula',
    'sector 17',
    'isbt 43',
  ],
  dehradun: [
    'dehradun',
    'doon',
    'rajpur road',
    'isbt dehradun',
  ],
  varanasi: [
    'varanasi',
    'banaras',
    'kashi',
    'lanka',
    'cantt varanasi',
  ],
  patna: [
    'patna',
    'boring road',
    'kankarbagh',
    'patna junction',
  ],
};

/**
 * Adjacent origin clusters that still make sense for pickup corridor sharing.
 */
export const CORRIDOR_PAIRS = [
  ['greater_noida', 'noida'],
];

export const SUGGESTED_ORIGINS = [
  'Greater Noida',
  'Greater Noida (Knowledge Park III)',
  'Greater Noida (Pari Chowk)',
  'Noida Sec 62',
];

export const SUGGESTED_DESTINATIONS = [
  'Ranchi',
  'Lucknow',
  'Jaipur',
  'IGI Airport (T3), Delhi',
  'Chandigarh',
  'Dehradun',
  'Varanasi',
];

/**
 * Default current student profile (editable on Profile screen).
 */
export const INITIAL_CURRENT_USER = {
  id: 'stu_me',
  name: 'Ananya Verma',
  initials: 'AV',
  collegeEmail: 'ananya.verma@campus.edu.in',
  yearDept: '3rd Year · B.Tech CSE',
  homeCity: 'Ranchi',
  campusArea: 'Greater Noida',
  preferences: ['Quiet ride', '1 cabin bag', 'On-time departure'],
  communicationComfort: 'In-app chat first',
  isSelf: true,
};

export const DEMO_PLAN = {
  from: 'Greater Noida',
  to: 'Ranchi',
  date: UPCOMING_DATES.friday,
  timeWindowId: 'evening',
  mode: 'Cab / Sedan',
  groupSize: 4,
};

export const REPORT_REASONS = [
  'Misleading route or timing',
  'Uncomfortable or spam messages',
  'Duplicate or inactive trip',
  'Other safety concern',
];

export const FAQ_ITEMS = [
  {
    q: 'How does matching work?',
    a: 'CampusRide matches trips by destination (case-insensitive and treating nearby areas like Knowledge Park and Pari Chowk as compatible), travel date, approximate departure window, and open seats.',
  },
  {
    q: 'How is the fare split calculated?',
    a: 'The per-person estimate divides the estimated total fare by the number of confirmed group members only. If nobody has confirmed yet, it safely displays a dash instead of a number.',
  },
  {
    q: 'Is CampusRide safe to use?',
    a: 'CampusRide helps you discover peers and chat before travelling, but it does not book cabs or verify identity yet. Always meet at well-lit public campus gates, confirm members in chat, and share trip details with a friend.',
  },
  {
    q: 'Is it free for students?',
    a: 'Yes. CampusRide is a free student discovery tool with no booking fees, commissions, or payment processing.',
  },
  {
    q: 'Does CampusRide book a cab or verify IDs?',
    a: 'No. Fare figures are estimates only. Students coordinate and book their own transport directly; college email verification is shown as a preview for a future release.',
  },
];

/**
 * 10 seeded campus students.
 */
export const SEED_STUDENTS = {
  stu_1: {
    id: 'stu_1',
    name: 'Aarav Sharma',
    initials: 'AS',
    yearDept: '3rd Year · ECE',
    homeCity: 'Ranchi',
    campusArea: 'Knowledge Park III',
    preferences: ['Low-volume music', '1 medium suitcase', 'Front or middle seat'],
    communicationComfort: 'In-app chat first',
  },
  stu_2: {
    id: 'stu_2',
    name: 'Priya Nair',
    initials: 'PN',
    yearDept: '2nd Year · BBA',
    homeCity: 'Ranchi',
    campusArea: 'Pari Chowk',
    preferences: ['Quiet ride', 'Backpack + small trolley', 'Prefers well-lit pickup'],
    communicationComfort: 'Quick call before pickup',
  },
  stu_3: {
    id: 'stu_3',
    name: 'Rohan Mehta',
    initials: 'RM',
    yearDept: '4th Year · Mechanical',
    homeCity: 'Jamshedpur / Ranchi',
    campusArea: 'Alpha II, Greater Noida',
    preferences: ['Flexible on tea break', '1 duffel bag', 'Window seat'],
    communicationComfort: 'WhatsApp after group forms',
  },
  stu_4: {
    id: 'stu_4',
    name: 'Sneha Tiwari',
    initials: 'ST',
    yearDept: '3rd Year · Design',
    homeCity: 'Lucknow',
    campusArea: 'Knowledge Park II',
    preferences: ['Light conversation', '1 cabin bag', 'No smoking'],
    communicationComfort: 'In-app chat first',
  },
  stu_5: {
    id: 'stu_5',
    name: 'Kabir Malhotra',
    initials: 'KM',
    yearDept: '2nd Year · CSE',
    homeCity: 'Lucknow',
    campusArea: 'Greater Noida',
    preferences: ['Quiet ride', '1 backpack', 'Punctual departure'],
    communicationComfort: 'WhatsApp after group forms',
  },
  stu_6: {
    id: 'stu_6',
    name: 'Ishita Rathore',
    initials: 'IR',
    yearDept: '4th Year · Law',
    homeCity: 'Jaipur',
    campusArea: 'Knowledge Park III',
    preferences: ['Earphones on', '1 cabin trolley', 'Moderate AC'],
    communicationComfort: 'In-app chat first',
  },
  stu_7: {
    id: 'stu_7',
    name: 'Devansh Gupta',
    initials: 'DG',
    yearDept: '3rd Year · MBA',
    homeCity: 'Chandigarh',
    campusArea: 'Noida Sec 62',
    preferences: ['Quick coffee stop okay', '1 suitcase', 'Morning departure'],
    communicationComfort: 'Quick call before pickup',
  },
  stu_8: {
    id: 'stu_8',
    name: 'Meera Joshi',
    initials: 'MJ',
    yearDept: '2nd Year · Biotech',
    homeCity: 'Dehradun',
    campusArea: 'Pari Chowk',
    preferences: ['Quiet ride', '1 cabin bag', 'Window preferred'],
    communicationComfort: 'In-app chat first',
  },
  stu_9: {
    id: 'stu_9',
    name: 'Aditya Singh',
    initials: 'ASg',
    yearDept: '3rd Year · Civil',
    homeCity: 'Varanasi',
    campusArea: 'Greater Noida',
    preferences: ['Easygoing', '1 backpack', 'Split toll evenly'],
    communicationComfort: 'WhatsApp after group forms',
  },
  stu_10: {
    id: 'stu_10',
    name: 'Tanvi Kulkarni',
    initials: 'TK',
    yearDept: '4th Year · CSE',
    homeCity: 'Pune (via IGI T3)',
    campusArea: 'Knowledge Park III',
    preferences: ['Flight timing strict', '1 cabin bag', 'Direct expressway'],
    communicationComfort: 'Quick call before pickup',
  },
};

/**
 * 9 seeded student trips across weekend routes.
 */
export const SEED_TRIPS = [
  {
    id: 'trip_1',
    from: 'Greater Noida',
    to: 'Ranchi',
    date: UPCOMING_DATES.friday,
    startHour: 17.5,
    endHour: 19,
    timeDisplay: '5:30 PM – 7:00 PM',
    mode: 'Cab / Sedan',
    maxSeats: 4,
    members: ['stu_1', 'stu_2'],
    estimatedTotalFare: 4800,
    pickupNote: 'Pickup near Knowledge Park III main gate',
    messages: [
      {
        id: 'm_101',
        senderId: 'stu_1',
        text: 'Hey! Planning to leave around 6:00 PM after the last lab. Light luggage only.',
        timestamp: '2:15 PM',
      },
      {
        id: 'm_102',
        senderId: 'stu_2',
        text: 'Works well for me. Would prefer meeting at KP-III main gate before we start.',
        timestamp: '2:42 PM',
      },
    ],
  },
  {
    id: 'trip_2',
    from: 'Greater Noida (Pari Chowk)',
    to: 'Ranchi',
    date: UPCOMING_DATES.friday,
    startHour: 18,
    endHour: 20,
    timeDisplay: '6:00 PM – 8:00 PM',
    mode: 'SUV / Innova',
    maxSeats: 5,
    members: ['stu_3'],
    estimatedTotalFare: 5500,
    pickupNote: 'Pari Chowk metro pillar 4',
    messages: [
      {
        id: 'm_201',
        senderId: 'stu_3',
        text: 'Looking for 2–3 more people heading to Ranchi side on Friday evening.',
        timestamp: '1:10 PM',
      },
    ],
  },
  {
    id: 'trip_3',
    from: 'Greater Noida',
    to: 'Lucknow',
    date: UPCOMING_DATES.friday,
    startHour: 17,
    endHour: 19,
    timeDisplay: '5:00 PM – 7:00 PM',
    mode: 'Cab / Sedan',
    maxSeats: 4,
    members: ['stu_4', 'stu_5'],
    estimatedTotalFare: 3600,
    pickupNote: 'Knowledge Park II roundabout',
    messages: [
      {
        id: 'm_301',
        senderId: 'stu_4',
        text: 'Taking Yamuna Expressway then Agra-Lucknow Expressway. 2 seats open.',
        timestamp: '11:30 AM',
      },
      {
        id: 'm_302',
        senderId: 'stu_5',
        text: 'Confirmed from my end — I just have one backpack.',
        timestamp: '12:05 PM',
      },
    ],
  },
  {
    id: 'trip_4',
    from: 'Greater Noida',
    to: 'Lucknow (Gomti Nagar)',
    date: UPCOMING_DATES.saturday,
    startHour: 8,
    endHour: 10.5,
    timeDisplay: '8:00 AM – 10:30 AM',
    mode: 'Cab / Sedan',
    maxSeats: 3,
    members: ['stu_4'],
    estimatedTotalFare: 3450,
    pickupNote: 'KP-II hostel block',
    messages: [
      {
        id: 'm_401',
        senderId: 'stu_4',
        text: 'Backup Saturday morning slot if Friday evening fills up.',
        timestamp: 'Yesterday',
      },
    ],
  },
  {
    id: 'trip_5',
    from: 'Greater Noida',
    to: 'Jaipur',
    date: UPCOMING_DATES.friday,
    startHour: 16.5,
    endHour: 18.5,
    timeDisplay: '4:30 PM – 6:30 PM',
    mode: 'Cab / Sedan',
    maxSeats: 4,
    members: ['stu_6', 'stu_7'],
    estimatedTotalFare: 2800,
    pickupNote: 'Knowledge Park III gate 2',
    messages: [
      {
        id: 'm_501',
        senderId: 'stu_6',
        text: 'Heading towards Malviya Nagar / Vaishali side. Leaving right after 4:30 PM.',
        timestamp: '3:05 PM',
      },
    ],
  },
  {
    id: 'trip_6',
    from: 'Greater Noida',
    to: 'IGI Airport (T3), Delhi',
    date: UPCOMING_DATES.friday,
    startHour: 18,
    endHour: 19.5,
    timeDisplay: '6:00 PM – 7:30 PM',
    mode: 'Cab / Sedan',
    maxSeats: 3,
    members: ['stu_10', 'stu_1'],
    estimatedTotalFare: 1350,
    pickupNote: 'KP-III hostel circle',
    messages: [
      {
        id: 'm_601',
        senderId: 'stu_10',
        text: 'My flight boards at 9:45 PM so aiming to leave sharply by 6:15 PM.',
        timestamp: '10:20 AM',
      },
    ],
  },
  {
    id: 'trip_7',
    from: 'Noida Sec 62',
    to: 'Chandigarh',
    date: UPCOMING_DATES.saturday,
    startHour: 7,
    endHour: 9.5,
    timeDisplay: '7:00 AM – 9:30 AM',
    mode: 'SUV / Innova',
    maxSeats: 4,
    members: ['stu_7'],
    estimatedTotalFare: 3800,
    pickupNote: 'Sector 62 metro gate 1',
    messages: [
      {
        id: 'm_701',
        senderId: 'stu_7',
        text: 'Early Saturday departure to beat NH-44 traffic.',
        timestamp: 'Yesterday',
      },
    ],
  },
  {
    id: 'trip_8',
    from: 'Greater Noida',
    to: 'Dehradun',
    date: UPCOMING_DATES.saturday,
    startHour: 6.5,
    endHour: 8.5,
    timeDisplay: '6:30 AM – 8:30 AM',
    mode: 'Cab / Sedan',
    maxSeats: 4,
    members: ['stu_8', 'stu_2'],
    estimatedTotalFare: 3200,
    pickupNote: 'Pari Chowk service lane',
    messages: [
      {
        id: 'm_801',
        senderId: 'stu_8',
        text: 'Planning a calm morning ride up to Dehradun ISBT / Rajpur.',
        timestamp: '4:00 PM',
      },
    ],
  },
  {
    id: 'trip_9',
    from: 'Greater Noida',
    to: 'Varanasi',
    date: UPCOMING_DATES.sunday,
    startHour: 16,
    endHour: 18.5,
    timeDisplay: '4:00 PM – 6:30 PM',
    mode: 'Cab / Sedan',
    maxSeats: 4,
    members: ['stu_9'],
    estimatedTotalFare: 4200,
    pickupNote: 'Knowledge Park I bus stop',
    messages: [
      {
        id: 'm_901',
        senderId: 'stu_9',
        text: 'Open to 2 or 3 co-passengers heading towards Varanasi.',
        timestamp: 'Yesterday',
      },
    ],
  },
];
