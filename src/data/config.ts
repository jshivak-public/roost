export const campuses = [{ id: 'uiuc', name: 'University of Illinois Urbana-Champaign', short: 'UIUC', domain: 'illinois.edu' }]
export const semesters = [
  { id: 'summer', label: 'Summer 2027', start: '2027-05-15', end: '2027-08-15' },
  { id: 'fall', label: 'Fall 2027', start: '2027-08-20', end: '2027-12-20' },
  { id: 'spring', label: 'Spring 2028', start: '2028-01-10', end: '2028-05-15' },
]
export const questions = [
  { key: 'sleep', label: 'Your sleep schedule', icon: '☾', options: ['Early bird', 'Flexible', 'Night owl'] },
  { key: 'clean', label: 'How tidy is your space?', icon: '✧', options: ['Relaxed', 'Moderately tidy', 'Very tidy'] },
  { key: 'guests', label: 'Friends coming over?', icon: '♡', options: ['Rarely', 'Occasionally', 'Frequently'] },
  { key: 'social', label: 'Your ideal home energy', icon: '⌂', options: ['Quiet', 'Balanced', 'Social'] },
  { key: 'smoking', label: 'Smoking preferences', icon: '◌', options: ['Comfortable with smoking', 'Prefer smoke-free'] },
  { key: 'pets', label: 'And furry roommates?', icon: '♧', options: ['Comfortable with pets', 'Prefer no pets', 'Allergies'] },
] as const
