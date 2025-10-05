import type { LandingTemplateProps } from './types'

export const sampleLandingData: LandingTemplateProps = {
  bannerUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop',
  title: 'Summer Music Festival 2025',
  subtitle: 'Experience the Ultimate Music Journey',
  description:
    'Join us for three unforgettable days of music, art, and community. Featuring world-class performers and immersive experiences.',

  authorName: 'FestAvenue Events',
  authorAvatar: 'https://ui-avatars.com/api/?name=FestAvenue+Events&size=200&background=9333ea&color=fff',
  eventDate: 'June 15-17, 2025',
  eventLocation: 'Central Park, New York',

  content:
    'Discover an extraordinary celebration of music and culture at our premier summer festival. From sunrise yoga sessions to late-night DJ sets, experience a diverse lineup of artists and activities that will ignite your passion for music and connection. Our carefully curated festival brings together the best in electronic, indie, and world music, creating an atmosphere of pure joy and artistic expression.',

  images: [
    {
      id: '1',
      url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=600&fit=crop',
      caption: 'Main Stage Performance',
      likes: 1234,
      reactions: [
        { type: 'love', count: 456 },
        { type: 'like', count: 342 },
        { type: 'wow', count: 234 },
        { type: 'haha', count: 123 },
        { type: 'sad', count: 45 },
        { type: 'angry', count: 34 }
      ],
      comments: [
        {
          id: 'c1',
          userId: 'u1',
          userName: 'John Doe',
          userAvatar: 'https://ui-avatars.com/api/?name=John+Doe&background=random',
          content: 'This looks absolutely amazing! Can\'t wait to be there! 🎉',
          createdAt: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          id: 'c2',
          userId: 'u2',
          userName: 'Sarah Smith',
          content: 'The energy was incredible! Best festival ever!',
          createdAt: new Date(Date.now() - 1000 * 60 * 60)
        }
      ]
    },
    {
      id: '2',
      url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
      caption: 'Sunset Sessions',
      likes: 856,
      reactions: [
        { type: 'love', count: 523 },
        { type: 'like', count: 203 },
        { type: 'wow', count: 130 }
      ],
      comments: [
        {
          id: 'c3',
          userId: 'u3',
          userName: 'Mike Johnson',
          userAvatar: 'https://ui-avatars.com/api/?name=Mike+Johnson&background=random',
          content: 'That sunset was breathtaking! 🌅',
          createdAt: new Date(Date.now() - 1000 * 60 * 45)
        }
      ]
    },
    {
      id: '3',
      url: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop',
      caption: 'Festival Vibes',
      likes: 2341,
      reactions: [
        { type: 'love', count: 1234 },
        { type: 'like', count: 678 },
        { type: 'haha', count: 289 },
        { type: 'wow', count: 140 }
      ],
      comments: []
    },
    {
      id: '4',
      url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
      caption: 'Electronic Stage',
      likes: 1567,
      reactions: [
        { type: 'like', count: 789 },
        { type: 'love', count: 456 },
        { type: 'wow', count: 322 }
      ],
      comments: []
    },
    {
      id: '5',
      url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
      caption: 'Crowd Energy',
      likes: 3421,
      reactions: [
        { type: 'love', count: 2103 },
        { type: 'like', count: 890 },
        { type: 'wow', count: 328 },
        { type: 'haha', count: 100 }
      ],
      comments: []
    },
    {
      id: '6',
      url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=600&fit=crop',
      caption: 'Night Lights',
      likes: 987,
      reactions: [
        { type: 'wow', count: 567 },
        { type: 'love', count: 320 },
        { type: 'like', count: 100 }
      ],
      comments: []
    }
  ],

  relatedEvents: [
    {
      id: 'r1',
      title: 'Winter Electronic Festival',
      image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop',
      date: 'December 20-22, 2025',
      location: 'Miami Beach, FL',
      url: '#'
    },
    {
      id: 'r2',
      title: 'Spring Jazz Weekend',
      image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?w=400&h=300&fit=crop',
      date: 'March 10-12, 2025',
      location: 'New Orleans, LA',
      url: '#'
    },
    {
      id: 'r3',
      title: 'Fall Rock Concert',
      image: 'https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&h=300&fit=crop',
      date: 'September 15-17, 2025',
      location: 'Austin, TX',
      url: '#'
    }
  ],

  socialLinks: [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'twitter', url: 'https://twitter.com' },
    { platform: 'youtube', url: 'https://youtube.com' }
  ],

  onLike: (imageId: string) => console.log('Liked image:', imageId),
  onReaction: (imageId: string, reactionType) => console.log('Reaction on image:', imageId, reactionType),
  onComment: (imageId: string, comment: string) => console.log('Comment on image:', imageId, comment),
  onShare: () => console.log('Share clicked'),
  onRegister: () => console.log('Register clicked')
}
