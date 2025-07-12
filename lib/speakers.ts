interface Speaker {
  id: string;
  fullName: string;
  tagLine: string;
  bio: string;
  profilePicture: string;
  links?: { title: string; url: string; linkType: string }[];
}

let speakersCache: Speaker[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

export async function getSpeakers(): Promise<Speaker[]> {
  const now = Date.now();
  
  // Return cached data if it's still valid
  if (speakersCache && (now - lastFetchTime) < CACHE_DURATION) {
    return speakersCache;
  }

  try {
    const res = await fetch(
      "/api/speakers",
      {
        next: { revalidate: 21600 }, // 6 hours in seconds
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`Failed to fetch speakers: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    const speakers = data.map((s: any) => ({
      id: s.id,
      fullName: s.fullName,
      tagLine: s.tagLine,
      bio: s.bio,
      profilePicture: s.profilePicture,
      links: s.links,
      questionAnswers: s.questionAnswers, // <-- add this line
    }));

    // Update cache
    speakersCache = speakers;
    lastFetchTime = now;
    
    return speakers;
  } catch (error) {
    console.error("Error fetching speakers:", error);
    // Return cached data if available, otherwise empty array
    return speakersCache || [];
  }
}

export function getSpeakerById(speakers: Speaker[], speakerId: string): Speaker | undefined {
  return speakers.find(speaker => speaker.id === speakerId);
} 