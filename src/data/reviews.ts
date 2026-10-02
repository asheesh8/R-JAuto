/**
 * Short excerpts from public reviews of R&J. Every `quote` must appear word for
 * word in the reviewer's text; `npm run check:quotes` verifies that against the
 * scrape in raw-assets/google/reviews.json (kept out of git). Excerpts stay
 * short on purpose: the full reviews live on Google, and the site links there.
 *
 * TODO(rj): John should be comfortable featuring reviewers by name.
 */
export type Review = {
  name: string;
  source: 'Google' | 'Facebook';
  stars?: number;
  localGuide?: boolean;
  quote: string;
};

export const reviews: Review[] = [
  { name: 'Marcus N', source: 'Google', stars: 5, localGuide: true, quote: 'Not trying to gouge anyone' },
  { name: 'samson staff', source: 'Google', stars: 5, quote: 'You can trust this guy with your life.' },
  { name: 'Jack O’Sullivan', source: 'Google', stars: 5, quote: 'He was able to get me in the same day I called' },
  { name: 'Kerr Tina', source: 'Google', stars: 5, localGuide: true, quote: 'Seriously one of the good guys!' },
  { name: 'Martin Beaudin', source: 'Google', stars: 5, quote: 'Reasonably priced, competent, and ethical.' },
  { name: 'Dane Gomez', source: 'Google', stars: 5, localGuide: true, quote: 'John did a great job getting to the bottom of what was wrong' },
  { name: 'Martin Robert', source: 'Google', stars: 5, quote: 'May even be able to help you on a weekend' },
  { name: 'Sophia Macartney', source: 'Google', stars: 5, quote: 'He stayed late to help us' },
  { name: 'Peter Mayotte', source: 'Google', stars: 4, quote: 'fast and efficient squeezing me in on a weekend' },
  { name: 'Sloan Goodall', source: 'Google', stars: 5, quote: 'Fair and fast' },
  { name: 'Beth', source: 'Google', stars: 5, quote: 'Appreciate the friendly service' },
  { name: 'Leo DiSanto', source: 'Facebook', quote: 'coming through in the clinch with a sans-appointment Saturday morning cooling system flush' },
];

/** The quote under the hero. */
export const featured = { name: 'samson staff', quote: 'John helped us when our tensor and belt blew out. Saved the day.' };

/**
 * The "rescue log": real situations from the reviews, retold as shop tickets.
 * `what` is our own summary of what the reviewer described; `quote` is theirs.
 */
export const tickets = [
  {
    no: '0417',
    when: 'Friday, 5:00 PM',
    title: 'Broke down at closing time',
    what: 'Towed in as the other shops shut. Looked at right away. It could not be saved, so the car stayed in the garage overnight and John made the calls to get them a cab to their inn.',
    stamp: 'No charge',
    by: 'Sophia Macartney',
    quote: 'He stayed late to help us',
  },
  {
    no: '0388',
    when: 'Saturday morning',
    title: 'Van overheated in a state forest',
    what: 'Limped in on a Saturday without an appointment. Cooling system flushed and back on the road.',
    stamp: 'No appointment',
    by: 'Leo DiSanto',
    quote: 'coming through in the clinch with a sans-appointment Saturday morning cooling system flush',
  },
  {
    no: '0402',
    when: 'Passing through',
    title: 'Tensioner and belt blew out',
    what: 'A traveler’s tensioner and belt let go near Barre. Quoted, fixed, gone.',
    stamp: 'Accurate quote',
    by: 'samson staff',
    quote: 'Accurate quotes.',
  },
  {
    no: '0351',
    when: 'Before a big trip',
    title: 'Second opinion',
    what: 'Other shops had given bad information. John found what was wrong, and what was not, and had it fixed before the trip.',
    stamp: 'Fair price',
    by: 'Dane Gomez',
    quote: 'John did a great job getting to the bottom of what was wrong',
  },
];
