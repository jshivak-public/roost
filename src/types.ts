export type Lifestyle = { sleep?: number; clean?: number; guests?: number; social?: number; smoking?: number; pets?: number }
export type Profile = { id: string; name: string; email: string; bio: string; preferences: string; lifestyle: Lifestyle; dealbreakers: string[]; verified: boolean }
export type Listing = { id: string; ownerId: string; owner: string; campus: string; title: string; area: string; description: string; price: number; deposit: number; utilities: boolean; start: string; end: string; flexible: boolean; distance: number; beds: number; baths: number; roommates: number; type: string; furnished: boolean; pets: boolean; amenities: string[]; rules: string; photos: string[]; lifestyle: Lifestyle; approval: string; status: 'active' | 'paused' | 'draft'; demo: boolean }
export type Filters = { maxPrice: number; semester: string; start: string; end: string; distance: number; type: string; roommates: number; furnished: '' | 'furnished' | 'unfurnished'; utilities: boolean; pets: boolean; compatibility: number }
export type Message = { id: string; body: string; mine: boolean; time: string }
export type Conversation = { id: string; listingId: string; name: string; messages: Message[] }
export type Store = { profile: Profile; loggedIn: boolean; listings: Listing[]; saved: string[]; swipes: { id: string; action: 'like' | 'pass'; savedBefore?: boolean }[]; conversations: Conversation[]; reports: { listingId: string; reason: string; time: string }[] }


