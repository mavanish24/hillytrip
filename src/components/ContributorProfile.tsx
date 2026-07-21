import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, MapPin, Award, Calendar, Heart, Shield, Eye, MessageCircle, 
  ArrowLeft, CheckCircle, CheckCircle2, Bookmark, AlertTriangle, Settings, 
  Share2, Star, ThumbsUp, Image, Info, Lock, ChevronRight, MessageSquare, 
  Plus, Edit2, Sparkles, Map, Bell, EyeOff, Globe, Mail, Phone, ExternalLink,
  Sliders, Compass, Send, Check, Camera, Flame, Crown, ShieldAlert, Home, Car
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FeaturedPhotoUploader } from './FeaturedPhotoUploader';
import { User, Hub, Destination, Attraction, Homestay } from '../types';
import { 
  getUserBadges, 
  getLevelInfo, 
  CONTRIBUTOR_LEVELS, 
  SPECIAL_BADGES, 
  BADGE_CATEGORIES, 
  calculateCategoryBadgeState,
  BadgeLevel,
  BadgeCategory,
  SpecialBadge
} from '../utils/badgeSystem';

interface ContributorProfileProps {
  user: User | null;
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  likes: any[];
  toggleLike: (id: string, type: 'destination' | 'attraction' | 'photo') => Promise<void>;
  navigate: (path: string) => void;
  setNotification: (notif: { type: 'success' | 'error'; message: string } | null) => void;
}

const getCategoryIcon = (iconName: string, className: string = "w-4 h-4") => {
  switch (iconName) {
    case 'Camera': return <Camera className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Compass': return <Compass className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'Home': return <Home className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Map': return <Map className={className} />;
    case 'Heart': return <Heart className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Flame': return <Flame className={className} />;
    case 'Crown': return <Crown className={className} />;
    default: return <Award className={className} />;
  }
};

export default function ContributorProfile({
  user,
  hubs,
  destinations,
  attractions,
  homestays,
  likes,
  toggleLike,
  navigate,
  setNotification
}: ContributorProfileProps) {
  // Parse username slug from location hash
  const getUsernameFromHash = () => {
    const hash = window.location.hash || '';
    const match = hash.match(/#\/contributor\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : '';
  };

  const [usernameSlug, setUsernameSlug] = useState(getUsernameFromHash());
  const [activeTab, setActiveTab] = useState<'photos' | 'reviews' | 'attractions' | 'roads' | 'homestays' | 'timeline' | 'achievements' | 'settings' | 'dashboard'>('photos');
  const [photoFilter, setPhotoFilter] = useState<'latest' | 'views' | 'likes'>('latest');
  
  // Interactive features states
  const [appreciationCount, setAppreciationCount] = useState(142);
  const [isAppreciating, setIsAppreciating] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<any | null>(null);

  // Profile Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Settings states for logged-in user editing their own profile
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [hideRegion, setHideRegion] = useState(false);
  const [hideEmail, setHideEmail] = useState(false);
  const [hideSocials, setHideSocials] = useState(false);
  const [enableEmailNotifs, setEnableEmailNotifs] = useState(true);
  const [enableContribNotifs, setEnableContribNotifs] = useState(true);
  const [profileAvatarUrl, setProfileAvatarUrl] = useState('');

  // Real Database Notifications Settings
  const [prefLikes, setPrefLikes] = useState(true);
  const [prefComments, setPrefComments] = useState(true);
  const [prefReplies, setPrefReplies] = useState(true);
  const [prefPhotoApproval, setPrefPhotoApproval] = useState(true);
  const [prefReviewReplies, setPrefReviewReplies] = useState(true);
  const [prefTravelAlerts, setPrefTravelAlerts] = useState(true);
  const [prefLanguage, setPrefLanguage] = useState('en');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [userStats, setUserStats] = useState({
    photos: 4,
    reviews: 3,
    attractions: 1,
    roads: 2,
    homestays: 1,
    taxis: 1,
    likes: 24,
    views: 850,
    comments: 6,
    total: 12
  });

  // Sync hash routing changes
  useEffect(() => {
    const handleHashChange = () => {
      const slug = getUsernameFromHash();
      setUsernameSlug(slug);
      
      // Parse tab from hash query parameters (e.g., #/contributor/me?tab=dashboard)
      const hash = window.location.hash || '';
      const queryPart = hash.includes('?') ? hash.split('?')[1] : '';
      const urlSearchParams = new URLSearchParams(queryPart);
      const tabParam = urlSearchParams.get('tab');
      if (tabParam && ['photos', 'reviews', 'attractions', 'roads', 'homestays', 'timeline', 'achievements', 'settings', 'dashboard'].includes(tabParam)) {
        setActiveTab(tabParam as any);
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Determine if viewing own profile
  const isOwnProfile = user && (usernameSlug === 'me' || usernameSlug === user.id || usernameSlug === user.email.split('@')[0]);

  // Load / Save States from local storage
  useEffect(() => {
    if (usernameSlug) {
      const savedCount = localStorage.getItem(`hilly_appreciations_${usernameSlug}`);
      if (savedCount) {
        setAppreciationCount(parseInt(savedCount));
      } else {
        // base counts
        setAppreciationCount(usernameSlug === 'anjali-bhutia' ? 342 : usernameSlug === 'amit-sharma' ? 248 : 86);
      }

      const savedState = localStorage.getItem(`hilly_saved_contributor_${usernameSlug}`);
      setIsSaved(savedState === 'true');
    }
  }, [usernameSlug]);

  // Initialize settings and load from Supabase if viewing own profile
  useEffect(() => {
    if (isOwnProfile && user) {
      // 1. Initial fallback states from local storage/auth metadata
      setEditName(localStorage.getItem('hilly_settings_name') || user.displayName || user.name || 'Traveler');
      setEditUsername(user.displayName || user.email?.split('@')[0] || '');
      setEditBio(localStorage.getItem('hilly_settings_bio') || 'Helping travelers discover the beautiful Himalayas through offbeat community guidance.');
      setEditRegion(localStorage.getItem('hilly_settings_region') || 'Darjeeling, WB');
      setHideRegion(localStorage.getItem('hilly_settings_hide_region') === 'true');
      setHideEmail(localStorage.getItem('hilly_settings_hide_email') === 'true');
      setHideSocials(localStorage.getItem('hilly_settings_hide_socials') === 'true');
      setProfileAvatarUrl(localStorage.getItem('hilly_settings_avatar') || user.photoURL || '');

      // 2. Fetch real production details from Supabase if active
      const loadProfileAndPrefs = async () => {
        try {
          const { getSupabase } = await import('../utils/supabaseClient');
          const supabase = await getSupabase();
          if (supabase) {
            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.uid || user.id)
              .maybeSingle();

            if (profile) {
              setEditName(profile.full_name || user.displayName || 'Traveler');
              setEditBio(profile.bio || '');
              setEditRegion(profile.country || '');
              setProfileAvatarUrl(profile.avatar_url || '');
              if (profile.username) {
                setEditUsername(profile.username);
              }
            }

            // Fetch notification preferences
            const { data: prefs } = await supabase
              .from('notification_preferences')
              .select('*')
              .eq('id', user.uid || user.id)
              .maybeSingle();

            if (prefs) {
              setPrefLikes(prefs.likes ?? true);
              setPrefComments(prefs.comments ?? true);
              setPrefReplies(prefs.replies ?? true);
              setPrefPhotoApproval(prefs.photo_approval ?? true);
              setPrefReviewReplies(prefs.review_replies ?? true);
              setPrefTravelAlerts(prefs.travel_alerts ?? true);
            }

            // Fetch user settings
            const { data: settings } = await supabase
              .from('user_settings')
              .select('*')
              .eq('id', user.uid || user.id)
              .maybeSingle();

            if (settings) {
              setPrefLanguage(settings.language || 'en');
            }

            // Fetch actual database stats (Photo Contributions & Interactions)
            const { count: photoCount } = await supabase
              .from('photo_contributions')
              .select('*', { count: 'exact', head: true })
              .eq('userId', user.uid || user.id);

            const { count: likeCount } = await supabase
              .from('interactions')
              .select('*', { count: 'exact', head: true })
              .eq('userId', user.uid || user.id)
              .eq('type', 'like');

            setUserStats(prev => {
              const photos = photoCount !== null ? photoCount : prev.photos;
              const likesVal = likeCount !== null ? likeCount : prev.likes;
              return {
                ...prev,
                photos,
                likes: likesVal,
                total: photos + prev.reviews + prev.attractions + prev.roads + prev.homestays
              };
            });
          }
        } catch (err) {
          console.error('[Supabase Load error]', err);
        }
      };

      loadProfileAndPrefs();
    }
  }, [isOwnProfile, user]);

  // Handle appreciation click
  const handleAppreciate = () => {
    setIsAppreciating(true);
    const newCount = appreciationCount + 1;
    setAppreciationCount(newCount);
    localStorage.setItem(`hilly_appreciations_${usernameSlug}`, newCount.toString());
    setNotification({ type: 'success', message: '💖 Contribution appreciated! Thank you for supporting community guides.' });
    setTimeout(() => setIsAppreciating(false), 800);
  };

  // Handle save contributor
  const handleToggleSave = () => {
    const newState = !isSaved;
    setIsSaved(newState);
    localStorage.setItem(`hilly_saved_contributor_${usernameSlug}`, newState.toString());
    setNotification({ 
      type: 'success', 
      message: newState ? '🔖 Contributor saved to your curated list.' : 'Removed contributor from saved list.' 
    });
  };

  // Handle report submission
  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) {
      setNotification({ type: 'error', message: 'Please select a reason for your report.' });
      return;
    }
    setIsSubmittingReport(true);
    setTimeout(() => {
      setIsSubmittingReport(false);
      setShowReportModal(false);
      setReportReason('');
      setReportText('');
      setNotification({ type: 'success', message: '🛡️ Report logged successfully. HillyTrip moderators will review this contributor within 24 hours.' });
    }, 1000);
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setNotification({ type: 'error', message: 'You must be logged in to save settings.' });
      return;
    }

    setIsSavingSettings(true);
    try {
      const { getSupabase } = await import('../utils/supabaseClient');
      const supabase = await getSupabase();
      if (!supabase) throw new Error('Supabase not initialized');

      // 1. If username was modified, check uniqueness
      if (editUsername && editUsername.trim().toLowerCase() !== (user.displayName || user.email?.split('@')[0] || '').toLowerCase()) {
        const cleanUsername = editUsername.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '');
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', cleanUsername)
          .neq('id', user.uid || user.id)
          .maybeSingle();

        if (existingUser) {
          setNotification({ type: 'error', message: '⚠️ Username is already taken by another adventurer!' });
          setIsSavingSettings(false);
          return;
        }
      }

      const cleanUsername = editUsername ? editUsername.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '') : (user.displayName || user.email?.split('@')[0]);

      // 2. Save profile details
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.uid || user.id,
          username: cleanUsername,
          full_name: editName,
          email: user.email,
          avatar_url: profileAvatarUrl || user.photoURL,
          bio: editBio,
          country: editRegion,
          updated_at: new Date().toISOString()
        });

      if (profileError) throw profileError;

      // 3. Save notification preferences
      const { error: prefsError } = await supabase
        .from('notification_preferences')
        .upsert({
          id: user.uid || user.id,
          likes: prefLikes,
          comments: prefComments,
          replies: prefReplies,
          photo_approval: prefPhotoApproval,
          review_replies: prefReviewReplies,
          travel_alerts: prefTravelAlerts,
          updated_at: new Date().toISOString()
        });

      if (prefsError) throw prefsError;

      // 4. Save user settings (language)
      const { error: settingsError } = await supabase
        .from('user_settings')
        .upsert({
          id: user.uid || user.id,
          language: prefLanguage,
          updated_at: new Date().toISOString()
        });

      if (settingsError) throw settingsError;

      // Also update local storage fallback for backwards compatibility
      localStorage.setItem('hilly_settings_name', editName);
      localStorage.setItem('hilly_settings_bio', editBio);
      localStorage.setItem('hilly_settings_region', editRegion);
      localStorage.setItem('hilly_settings_hide_region', hideRegion.toString());
      localStorage.setItem('hilly_settings_hide_email', hideEmail.toString());
      localStorage.setItem('hilly_settings_hide_socials', hideSocials.toString());
      if (profileAvatarUrl) {
        localStorage.setItem('hilly_settings_avatar', profileAvatarUrl);
      }

      setNotification({ type: 'success', message: '⚙️ Your profile and notification preferences have been saved securely to the database!' });
    } catch (err: any) {
      console.error('Error saving settings to Supabase:', err);
      setNotification({ type: 'error', message: err.message || 'Failed to save settings to the database.' });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Get dynamic details based on username slug
  const getContributorData = () => {
    const slug = usernameSlug.toLowerCase();
    
    if (slug === 'anjali-bhutia' || (slug === 'me' && user?.name?.toLowerCase().includes('anjali'))) {
      return {
        id: 'anjali-bhutia',
        name: 'Anjali Bhutia',
        verified: true,
        rank: 'High Altitude Sherpa Maverick',
        badge: 'HillyTrip Elite Photographer',
        points: 3120,
        monthlyPoints: 240,
        memberSince: 'January 2024',
        region: 'Kalimpong, West Bengal',
        bio: 'Adventure photographer, conservation docent & cultural archivist. Exploring hidden river valleys, remote homestays, and community trails across West Sikkim and Kalimpong hills.',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300',
        stats: {
          photos: 42,
          reviews: 18,
          attractions: 6,
          roads: 8,
          homestays: 4,
          taxis: 5,
          likes: 418,
          views: 18450,
          comments: 64,
          total: 83
        },
        badges: ['badge-wanderer', 'badge-transit', 'badge-highpass'],
        photos: [
          { id: 'anj-p1', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800', caption: 'Dramatic river banks along the pristine Teesta valley basin.', likes: 58, views: 2400, comments: 12, date: '2026-05-12' },
          { id: 'anj-p2', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', caption: 'Kanchenjunga peaks piercing through early morning mist clouds.', likes: 112, views: 5600, comments: 24, date: '2026-06-01' },
          { id: 'anj-p3', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800', caption: 'Quiet village pathway in Rishop bordered by ancient pine woods.', likes: 74, views: 3100, comments: 8, date: '2026-04-20' },
          { id: 'anj-p4', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800', caption: 'Mossy boulder cascades at the secret Changey waterfall point.', likes: 49, views: 1850, comments: 4, date: '2026-03-15' },
          { id: 'anj-p5', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800', caption: 'Layers of green organic tea hedges winding down the Kurseong slopes.', likes: 65, views: 2900, comments: 9, date: '2026-02-28' },
          { id: 'anj-p6', url: 'https://images.unsplash.com/photo-1472214222541-d510753a4907?q=80&w=800', caption: 'Himalayan sunset over a tiny wooden homestay chimney in Sittong.', likes: 60, views: 2600, comments: 7, date: '2026-05-25' }
        ],
        reviews: [
          { dest: 'Kalimpong', attr: 'Durpin Monastery', rating: 5, helpful: 14, date: '2026-05-10', text: 'Stunning architecture with a deep sense of peace. Try to visit around 2:00 PM to catch the young monks in session. The view of the Teesta river winding down from the ridge is unmatched!' },
          { dest: 'Rishop', attr: 'Tiffin Dara Viewpoint', rating: 5, helpful: 22, date: '2026-04-18', text: 'An intense 45-minute uphill trek from Rishop, but the 360-degree sunrise view of Kanchenjunga is absolutely worth it. Dress warmly as winds are freezing before sunrise.' },
          { dest: 'Sittong', attr: 'Orange Orchards', rating: 4, helpful: 9, date: '2026-03-05', text: 'Breathtaking during December/January when branches bend under orange weights. It is highly local and peaceful, far superior to commercial orchards.' }
        ],
        attractions: [
          { name: 'Pine Forest Reserve, Lava', category: 'Trek', status: 'Approved', date: '2026-04-12' },
          { name: 'Changey Cascades, Kolakham', category: 'Waterfall', status: 'Approved', date: '2026-03-22' },
          { name: 'Sherpa View Point, Rishop', category: 'Viewpoint', status: 'Approved', date: '2026-02-14' }
        ],
        roads: [
          { road: 'Lava to Rishop Ridge Segment', status: 'Caution', date: '2026-06-22', verified: true, notes: 'Fallen gravel after heavy showers. Best driven in high-clearance 4WD.' },
          { road: 'Teesta Bazar to Kalimpong Highway', status: 'Clear', date: '2026-06-18', verified: true, notes: 'Freshly tarred patch around the slide area. Smooth transit.' }
        ],
        homestays: [
          { name: 'Valley Nest Eco Homestay, Sittong', location: 'Sittong III', status: 'Approved', date: '2026-05-15' },
          { name: 'Pine Forest Retreat, Rishop', location: 'Rishop Ridge', status: 'Approved', date: '2026-04-05' }
        ],
        timeline: [
          { title: 'Approved Photo Contribution', subtitle: 'Changey waterfall cascade high resolution landscape', date: 'June 24, 2026', points: '+150' },
          { title: 'Verified Road Update Filed', subtitle: 'Lava to Rishop ridge segment advisory', date: 'June 22, 2026', points: '+100' },
          { title: 'Elite Badge Earned', subtitle: 'Caravan Pathfinder unlocked', date: 'June 18, 2026', points: '+500' },
          { title: 'Approved New Attraction Added', subtitle: 'Sherpa View Point in Rishop region', date: 'May 12, 2026', points: '+250' },
          { title: 'Helpful Community Review Logged', subtitle: 'Detailed review for Durpin Monastery', date: 'May 10, 2026', points: '+75' }
        ]
      };
    }

    if (slug === 'amit-sharma' || (slug === 'me' && user?.name?.toLowerCase().includes('amit'))) {
      return {
        id: 'amit-sharma',
        name: 'Amit Sharma',
        verified: true,
        rank: 'Himalayan Ridge Pathfinder',
        badge: 'Trusted Mountain Photographer',
        points: 2480,
        monthlyPoints: 180,
        memberSince: 'June 2024',
        region: 'Gangtok, Sikkim',
        bio: 'Helping travelers discover the sacred mountains, deep rivers, and high passes of Sikkim through authentic, slow-paced landscape photography and community guides.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=300',
        stats: {
          photos: 28,
          reviews: 12,
          attractions: 4,
          roads: 5,
          homestays: 2,
          taxis: 3,
          likes: 295,
          views: 11200,
          comments: 41,
          total: 54
        },
        badges: ['badge-wanderer', 'badge-pilgrim', 'badge-highpass'],
        photos: [
          { id: 'amt-p1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', caption: 'The absolute majesty of Mount Kanchenjunga bathed in golden sunrise.', likes: 88, views: 4200, comments: 14, date: '2026-05-28' },
          { id: 'amt-p2', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800', caption: 'Lush organic mist-bathed cardamom trails in North Sikkim.', likes: 52, views: 1900, comments: 6, date: '2026-06-10' },
          { id: 'amt-p3', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=800', caption: 'Pristine forest canopy overhead during the trek to Alpine Pass.', likes: 45, views: 1600, comments: 3, date: '2026-04-12' },
          { id: 'amt-p4', url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=800', caption: 'Breathtaking layered valleys under rolling cloud formations.', likes: 62, views: 2100, comments: 10, date: '2026-03-08' }
        ],
        reviews: [
          { dest: 'Darjeeling', attr: 'Ghoom Monastery', rating: 5, helpful: 18, date: '2026-05-20', text: 'One of the oldest monasteries in the region housing a massive 15-foot clay statue of Maitreya Buddha. Try to visit early morning to hear the prayer horns. Outstanding experience!' },
          { dest: 'Mirik', attr: 'Sumendu Lake', rating: 4, helpful: 11, date: '2026-04-02', text: 'Lovely boat rides and a beautiful arched footbridge. Walk along the lakeside forest trail for a quieter experience away from commercial stalls.' }
        ],
        attractions: [
          { name: 'Kanchenjunga Viewpoint, Gangtok', category: 'Viewpoint', status: 'Approved', date: '2026-04-20' },
          { name: 'Rumtek Dharma Center', category: 'Monastery', status: 'Approved', date: '2026-03-10' }
        ],
        roads: [
          { road: 'Siliguri to Sevoke Corridor', status: 'Clear', date: '2026-06-12', verified: true, notes: 'Smooth double lanes, wild elephants sign boards active.' },
          { road: 'Gangtok East Bypass Road', status: 'Blocked', date: '2026-06-25', verified: true, notes: 'Blocked due to scheduled highway expansion. Use North Highway detour.' }
        ],
        homestays: [
          { name: 'Himalayan Sherpa Lodge, Lachung', location: 'Lachung Ridge', status: 'Approved', date: '2026-05-02' }
        ],
        timeline: [
          { title: 'Approved Photo Contribution', subtitle: 'Cardamom trails valley fog landscape', date: 'June 10, 2026', points: '+150' },
          { title: 'Approved Review Logged', subtitle: 'Detailed historical guide for Ghoom Monastery', date: 'May 20, 2026', points: '+75' },
          { title: 'Attraction Submission Verified', subtitle: 'Rumtek Dharma Center registered', date: 'March 10, 2026', points: '+250' }
        ]
      };
    }

    // Default Fallback / Loaded Logged-In User Portfolio
    return {
      id: user?.id || 'guest_contributor',
      name: isOwnProfile ? (localStorage.getItem('hilly_settings_name') || user?.name || 'Local Traveler') : (usernameSlug.charAt(0).toUpperCase() + usernameSlug.slice(1).replace('-', ' ') || 'HillyTrip Contributor'),
      verified: isOwnProfile ? true : false,
      rank: isOwnProfile ? 'Active Valley Wanderer' : 'Base Camp Aspirant',
      badge: 'Community Contributor',
      points: isOwnProfile ? 980 : 450,
      monthlyPoints: isOwnProfile ? 150 : 30,
      memberSince: isOwnProfile ? 'March 2025' : 'April 2025',
      region: isOwnProfile ? (localStorage.getItem('hilly_settings_region') || 'Darjeeling, WB') : 'Himalayan Region',
      bio: isOwnProfile ? (localStorage.getItem('hilly_settings_bio') || 'Helping travelers explore offbeat mountain settlements and community trails with local knowledge.') : 'A dedicated mountain exploration enthusiast documenting natural beauty and local homestays.',
      avatar: profileAvatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300',
      stats: isOwnProfile ? userStats : {
        photos: 2,
        reviews: 1,
        attractions: 0,
        roads: 1,
        homestays: 0,
        taxis: 0,
        likes: 8,
        views: 150,
        comments: 1,
        total: 4
      },
      badges: ['badge-wanderer'],
      photos: [
        { id: 'fallback-p1', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800', caption: 'Quiet mountain road surrounded by thick green forest.', likes: 12, views: 450, comments: 2, date: '2026-05-15' },
        { id: 'fallback-p2', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800', caption: 'Stunning organic mountain slope in the late evening glow.', likes: 12, views: 400, comments: 4, date: '2026-05-02' }
      ],
      reviews: [
        { dest: 'Darjeeling', attr: 'Japanese Peace Pagoda', rating: 5, helpful: 4, date: '2026-05-01', text: 'Beautiful, serene environment perfect for quiet reflection and meditation. Exceptional panoramic views over Darjeeling town.' }
      ],
      attractions: [
        { name: 'Orange Valley Vista', category: 'Viewpoint', status: 'Approved', date: '2026-04-10' }
      ],
      roads: [
        { road: 'Siliguri to Kurseong Highway', status: 'Clear', date: '2026-06-20', verified: true, notes: 'Traffic flowing normally. Road widening work in progress in short segments.' }
      ],
      homestays: [],
      timeline: [
        { title: 'Approved Photo Contribution', subtitle: 'High resolution mountain forest landscape', date: 'May 15, 2026', points: '+150' },
        { title: 'Community Review Approved', subtitle: 'Japanese Peace Pagoda visitor guide', date: 'May 01, 2026', points: '+75' }
      ]
    };
  };

  const cData = getContributorData();
  const badgeState = getUserBadges(cData.stats, cData.points);
  const levelInfo = getLevelInfo(cData.points);

  // Filter Photos
  const getFilteredPhotos = () => {
    let list = [...cData.photos];
    if (photoFilter === 'views') {
      return list.sort((a, b) => b.views - a.views);
    }
    if (photoFilter === 'likes') {
      return list.sort((a, b) => b.likes - a.likes);
    }
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const filteredPhotos = getFilteredPhotos();

  return (
    <div id="contributor-portfolio-container" className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-slate-800 dark:text-slate-100 select-none">
      
      {/* Top Breadcrumb & Go Back trigger */}
      <div className="flex items-center justify-between mb-6 z-10 relative">
        <button
          onClick={() => navigate('#/')}
          className="flex items-center gap-1.5 text-xs font-black font-mono uppercase tracking-wider text-slate-500 hover:text-emerald-500 transition-colors cursor-pointer bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to HillyTrip
        </button>

        <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500">
          🏔️ HillyTrip Professional Contributor Network
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* ================= LEFT SIDEBAR COLUMN: HERO PROFILE DETAILS ================= */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Main Portfolio card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 text-center relative shadow-xl overflow-hidden">
            
            {/* Visual background gradient crown */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-emerald-600/30 to-teal-500/30 dark:from-emerald-950/40 dark:to-teal-950/40 pointer-events-none z-0" />

            <div className="relative z-10 pt-4 flex flex-col items-center">
              {/* Profile Photo frame */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 shadow-md mb-4 group select-none">
                {cData.avatar ? (
                  <img src={cData.avatar} alt={cData.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {cData.name.charAt(0).toUpperCase()}
                  </div>
                )}
                {cData.verified && (
                  <div className="absolute bottom-1 right-1 bg-blue-500 border border-white text-white rounded-full p-1 shadow-sm flex items-center justify-center w-5 h-5" title="Verified Professional Contributor">
                    <Check className="w-3 h-3 stroke-[3px]" />
                  </div>
                )}
              </div>

              {/* Title & Badge Credentials */}
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1">
                  {cData.name}
                </h2>
                
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1">
                  <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none">
                    ⭐ Level {levelInfo.current.level}: {levelInfo.current.name}
                  </span>
                  <span className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full select-none">
                    🏆 {cData.badge || 'Mountain Photographer'}
                  </span>
                </div>
              </div>

              {/* Member Since / Home Region */}
              <div className="mt-4 flex flex-col items-center gap-1 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                {(!hideRegion || isOwnProfile) && cData.region && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {cData.region}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Contributor since {cData.memberSince}
                </span>
              </div>

              {/* Short Bio */}
              <p className="mt-4 text-xs sm:text-sm text-slate-600 dark:text-slate-350 leading-relaxed font-sans font-medium px-2 italic text-center">
                "{cData.bio}"
              </p>

              {/* ================= CONTRIBUTION POINTS BLOCK ================= */}
              <div className="mt-6 w-full bg-slate-50 dark:bg-slate-905 border border-slate-100 dark:border-slate-805 rounded-2xl p-4 text-left space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-400 block font-mono">HillyTrip Contribution Score</span>
                    <span className="text-xl font-black font-mono text-emerald-500 dark:text-emerald-400">{cData.points.toLocaleString()} Points</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-400 block font-mono">Level {levelInfo.current.level}</span>
                    <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">{levelInfo.current.name}</span>
                  </div>
                </div>

                {/* Badge progression */}
                <div className="space-y-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500">
                    <span>Next Level: {levelInfo.next ? levelInfo.next.name : 'Max Level'}</span>
                    <span>{levelInfo.next ? `${cData.points} / ${levelInfo.next.minPoints} pts` : 'Max reached'}</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                      style={{ width: `${levelInfo.progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium font-sans">
                    {levelInfo.next 
                      ? `Accumulate ${(levelInfo.next.minPoints - cData.points).toLocaleString()} more points to reach Level ${levelInfo.next.level}.` 
                      : '🏆 You have achieved the peak of HillyTrip Contributors!'}
                  </p>
                </div>
              </div>

              {/* Appreciate, Save, Report actions (NON-SOCIAL CREDIBILITY BUILDERS) */}
              <div className="mt-5 grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={handleAppreciate}
                  disabled={isAppreciating}
                  className={`py-2.5 px-3 rounded-xl font-extrabold text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 select-none relative active:scale-95 ${
                    isAppreciating 
                      ? 'bg-rose-500 text-white shadow-rose-500/10'
                      : 'bg-rose-500/10 hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 transition-transform ${isAppreciating ? 'scale-125 fill-white' : ''}`} />
                  <span>{isAppreciating ? 'APPRECIATED!' : `APPRECIATE (${appreciationCount})`}</span>
                </button>

                <button
                  onClick={handleToggleSave}
                  className={`py-2.5 px-3 rounded-xl font-extrabold text-xs font-mono tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 border select-none active:scale-95 ${
                    isSaved
                      ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
                  <span>{isSaved ? 'SAVED' : 'SAVE GUIDE'}</span>
                </button>
              </div>

              {/* Report button */}
              <button
                onClick={() => setShowReportModal(true)}
                className="mt-4 text-[10px] font-black font-mono uppercase tracking-wider text-slate-400 hover:text-red-500 hover:underline transition flex items-center gap-1 bg-transparent border-0 cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3 shrink-0" /> Report Portfolio discrepancy
              </button>

            </div>
          </div>

          {/* ================= CURRENT EARNED BADGES CORNER ================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-5 text-left shadow-lg space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-1.5 select-none">
              <Award className="w-4 h-4 text-amber-500 shrink-0" /> Earned Accreditations
            </h4>

            {/* Grid of unlocked core and special badges */}
            <div className="flex flex-wrap gap-2">
              {badgeState.coreBadges.filter(cb => cb.hasAnyBadge).map(cb => {
                const currentTier = cb.currentLevel!;
                return (
                  <button
                    key={`sidebar-core-${cb.category.id}`}
                    onClick={() => setSelectedBadge({
                      emoji: currentTier.emoji,
                      title: currentTier.label,
                      description: cb.category.description,
                      req: `${cb.category.metricLabel} reached ${currentTier.threshold}`,
                      unlocked: true,
                      levelName: currentTier.levelName,
                      metricLabel: cb.category.metricLabel,
                      currentValue: cb.progress.current,
                      targetValue: currentTier.threshold,
                      category: cb.category
                    })}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all border shrink-0 relative bg-gradient-to-tr ${currentTier.bgClass} ${currentTier.borderClass} text-slate-900 dark:text-white shadow-xs hover:scale-105 cursor-pointer`}
                    title={`${cb.category.name}: ${currentTier.levelName} level`}
                  >
                    <span>{currentTier.emoji}</span>
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center text-[7px] font-black">
                      ✓
                    </span>
                  </button>
                );
              })}

              {badgeState.specialBadges.filter(sb => sb.unlocked).map(sb => (
                <button
                  key={`sidebar-special-${sb.id}`}
                  onClick={() => setSelectedBadge({
                    emoji: sb.emoji,
                    title: sb.name,
                    description: sb.description,
                    req: sb.requirement,
                    unlocked: true,
                    isSpecial: true
                  })}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all border shrink-0 relative ${sb.bgClass} ${sb.borderClass} text-slate-900 dark:text-white shadow-xs hover:scale-105 cursor-pointer`}
                  title={`Special Badge: ${sb.name}`}
                >
                  <span>{sb.emoji}</span>
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border border-white text-white flex items-center justify-center text-[7px] font-black">
                    ★
                  </span>
                </button>
              ))}

              {badgeState.coreBadges.filter(cb => cb.hasAnyBadge).length === 0 && 
               badgeState.specialBadges.filter(sb => sb.unlocked).length === 0 && (
                <div className="w-full text-center py-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-dashed border-slate-250 dark:border-slate-800 text-slate-400 text-xs">
                  🔒 No accreditations earned yet.
                </div>
              )}
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-450 font-mono select-none pt-2 border-t border-slate-100 dark:border-slate-800">
              <span>Total: {
                badgeState.coreBadges.filter(cb => cb.hasAnyBadge).length + 
                badgeState.specialBadges.filter(sb => sb.unlocked).length
              }</span>
              <button 
                onClick={() => {
                  setActiveTab('achievements');
                  const targetEl = document.getElementById('contributor-working-area');
                  if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                View Cabinet
              </button>
            </div>
          </div>

          {/* ================= PORTFOLIO PRIVACY SETTINGS BANNER ================= */}
          {isOwnProfile && (
            <div className="bg-gradient-to-tr from-indigo-950 to-slate-900 text-white border border-slate-800 rounded-3xl p-5 text-left shadow-lg space-y-3.5">
              <div className="flex items-center gap-2">
                <Settings className="w-4.5 h-4.5 text-indigo-400 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider font-mono">Portfolio Controls</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                You are viewing your travel profile and portfolio dashboard. Configure public settings, edit bio details, and sync submissions.
              </p>
              <button
                onClick={() => {
                  setActiveTab('settings');
                  const el = document.getElementById('contributor-working-area');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full py-2 bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider font-mono transition cursor-pointer text-center text-indigo-300"
              >
                ⚙️ MANAGE PORTFOLIO SETTINGS
              </button>
            </div>
          )}

        </div>

        {/* ================= RIGHT MAIN AREA: IMPACT STATISTICS & TABS ================= */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* ================= IMPACT STATISTICS GRID ================= */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 text-left shadow-lg">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono mb-4 flex items-center gap-1.5 select-none">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" /> Verified Community Impact
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Photos Approved</span>
                <span className="text-lg font-black font-mono text-slate-850 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  📸 {cData.stats.photos}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Reviews Logged</span>
                <span className="text-lg font-black font-mono text-slate-850 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  ⭐ {cData.stats.reviews}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Attractions Added</span>
                <span className="text-lg font-black font-mono text-slate-850 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  📍 {cData.stats.attractions}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Road Advisories</span>
                <span className="text-lg font-black font-mono text-slate-850 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  🛣️ {cData.stats.roads}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl col-span-2 sm:col-span-1">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Homestays Added</span>
                <span className="text-lg font-black font-mono text-slate-850 dark:text-slate-100 flex items-center gap-1 mt-0.5">
                  🏡 {cData.stats.homestays}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Likes Received</span>
                <span className="text-base font-black font-mono text-rose-500 flex items-center gap-1 mt-0.5">
                  ❤️ {cData.stats.likes.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Photo Views</span>
                <span className="text-base font-black font-mono text-sky-500 flex items-center gap-1 mt-0.5">
                  👁️ {cData.stats.views.toLocaleString()}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl">
                <span className="text-[9px] font-black uppercase text-slate-400 block font-mono">Comments Left</span>
                <span className="text-base font-black font-mono text-amber-500 flex items-center gap-1 mt-0.5">
                  💬 {cData.stats.comments}
                </span>
              </div>

              <div className="p-3 bg-gradient-to-tr from-emerald-500/10 to-teal-400/5 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-500/20 rounded-2xl col-span-2">
                <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 block font-mono">Total Verified Contributions</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  ✨ {cData.stats.total} submissions
                </span>
              </div>

            </div>
          </div>

          {/* ================= NAVIGATION TABS ROW ================= */}
          <div className="flex overflow-x-auto bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-855 p-1 rounded-2xl scrollbar-none select-none">
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                activeTab === 'photos' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              📸 Photos ({cData.photos.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                activeTab === 'reviews' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              ⭐ Reviews ({cData.reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('attractions')}
              className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                activeTab === 'attractions' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              📍 Attractions ({cData.attractions.length})
            </button>
            <button
              onClick={() => setActiveTab('roads')}
              className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                activeTab === 'roads' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              🛣️ Roads ({cData.roads.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                activeTab === 'timeline' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              📅 Timeline
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                activeTab === 'achievements' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              🏆 Progression
            </button>
            {isOwnProfile && (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                    activeTab === 'dashboard' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  📊 Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 text-xs font-black rounded-xl shrink-0 transition-all cursor-pointer flex items-center gap-1.5 uppercase font-mono ${
                    activeTab === 'settings' ? 'bg-white dark:bg-slate-750 text-emerald-600 dark:text-emerald-450 shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </>
            )}
          </div>

          {/* ================= ACTIVE WORKING WINDOW ================= */}
          <div id="contributor-working-area" className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 text-left shadow-lg min-h-[350px]">
            
            {/* 1. TABS: PHOTOS GALLERY */}
            {activeTab === 'photos' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 border-b border-slate-100 dark:border-slate-805 pb-3">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Photographic Travel Portfolio</h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">High-resolution scenery and community-approved captures.</p>
                  </div>
                  <div className="flex bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border select-none shrink-0 text-xs font-bold">
                    <button
                      onClick={() => setPhotoFilter('latest')}
                      className={`px-2 py-1 rounded-lg ${photoFilter === 'latest' ? 'bg-white dark:bg-slate-750 text-emerald-500 shadow-3xs' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      LATEST
                    </button>
                    <button
                      onClick={() => setPhotoFilter('views')}
                      className={`px-2 py-1 rounded-lg ${photoFilter === 'views' ? 'bg-white dark:bg-slate-750 text-emerald-500 shadow-3xs' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      POPULAR
                    </button>
                    <button
                      onClick={() => setPhotoFilter('likes')}
                      className={`px-2 py-1 rounded-lg ${photoFilter === 'likes' ? 'bg-white dark:bg-slate-750 text-emerald-500 shadow-3xs' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      LIKED
                    </button>
                  </div>
                </div>

                {filteredPhotos.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center italic">No approved photographs in this contributor portfolio yet.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {filteredPhotos.map((photo, index) => (
                      <div
                        key={photo.id}
                        onClick={() => setLightboxIndex(index)}
                        className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden border border-slate-150 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shadow-2xs hover:shadow-md cursor-pointer transition transform hover:scale-[1.015]"
                      >
                        <img 
                          src={photo.url} 
                          alt={photo.caption} 
                          className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        {/* Immersive shadow cover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-90 group-hover:opacity-95 transition" />
                        
                        {/* Engagement overlay data */}
                        <div className="absolute bottom-2.5 inset-x-2.5 flex flex-col gap-1 z-10 text-left">
                          <p className="text-[10px] text-white font-sans font-medium leading-tight line-clamp-2 drop-shadow-sm">
                            {photo.caption}
                          </p>
                          <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-300">
                            <span className="flex items-center gap-0.5">❤️ {photo.likes}</span>
                            <span className="flex items-center gap-0.5">👁️ {photo.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. TABS: REVIEWS */}
            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-805 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Community Trail & Spot Reviews</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Verified, highly technical guides and advisories for fellow travelers.</p>
                </div>

                {cData.reviews.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center italic">No reviews logged by this contributor yet.</p>
                ) : (
                  <div className="space-y-4">
                    {cData.reviews.map((rev, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2.5">
                        <div className="flex flex-wrap justify-between items-start gap-2">
                          <div>
                            <span className="text-[9px] font-black uppercase text-emerald-500 block font-mono">APPROVED VISITOR ADVISORY</span>
                            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white mt-0.5">
                              {rev.attr} <span className="text-slate-400 font-normal">in {rev.dest}</span>
                            </h5>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">{new Date(rev.date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                        </div>

                        {/* Rating stars */}
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-300'}`} />
                          ))}
                          <span className="text-[10px] font-mono text-slate-400 font-bold ml-1">({rev.rating}.0 Rating)</span>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-650 dark:text-slate-300 leading-relaxed font-sans font-medium italic">
                          "{rev.text}"
                        </p>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-400 select-none">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{rev.helpful} helpful votes from HillyTrip community</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. TABS: ATTRACTIONS */}
            {activeTab === 'attractions' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-805 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Scenic Spots & Landmarks Discovered</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Himalayan attractions submitted and integrated into the map router.</p>
                </div>

                {cData.attractions.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center italic">No attractions added by this contributor yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cData.attractions.map((attr, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            {attr.category}
                          </span>
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white pt-1">
                            {attr.name}
                          </h5>
                          <p className="text-[10px] font-mono text-slate-450">Submitted {new Date(attr.date).toLocaleDateString()}</p>
                        </div>
                        <span className="bg-emerald-500 text-white text-[9px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs shrink-0 flex items-center gap-0.5 select-none">
                          ✓ {attr.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 4. TABS: ROADS */}
            {activeTab === 'roads' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-805 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Verified Road & Weather Advisories</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Real-time segment updates supporting high-altitude car transit safety.</p>
                </div>

                {cData.roads.length === 0 ? (
                  <p className="text-xs text-slate-400 py-12 text-center italic">No road segment updates verified yet.</p>
                ) : (
                  <div className="space-y-3.5">
                    {cData.roads.map((road, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-2xl flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-2 text-left flex-grow">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-slate-200 dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-black font-mono uppercase px-2.5 py-0.5 rounded-md">
                              🛣️ Segment: {road.road}
                            </span>
                            <span className={`text-[9px] font-black font-mono uppercase px-2 py-0.5 rounded ${
                              road.status === 'Clear' 
                                ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/25' 
                                : road.status === 'Caution'
                                ? 'bg-amber-500/15 text-amber-600 border border-amber-500/25'
                                : 'bg-red-500/15 text-red-600 border border-red-500/25'
                            }`}>
                              STATUS: {road.status}
                            </span>
                          </div>
                          
                          <p className="text-xs text-slate-600 dark:text-slate-300 font-sans font-medium bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            "{road.notes}"
                          </p>

                          <p className="text-[10px] text-slate-450 font-mono">Last reported: {new Date(road.date).toLocaleDateString()}</p>
                        </div>

                        <div className="shrink-0 flex items-center md:items-end justify-start md:justify-center">
                          <span className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 text-[9px] font-black uppercase font-mono tracking-wider px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm select-none">
                            🛡️ VERIFIED ADVISORY
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. TABS: TIMELINE */}
            {activeTab === 'timeline' && (
              <div className="space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-805 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Chronological Exploration Logs</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Chronicle of approved travel contributions, milestones and credentials.</p>
                </div>

                <div className="relative border-l border-slate-200 dark:border-slate-800 pl-6 ml-3 py-2 space-y-6">
                  {cData.timeline.map((item, idx) => (
                    <div key={idx} className="relative text-left">
                      {/* Circle bullet */}
                      <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
                      </span>

                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-slate-400">{item.date}</span>
                        <div className="flex justify-between items-start">
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">
                            {item.title}
                          </h5>
                          <span className="bg-emerald-500/15 text-emerald-600 text-[10px] font-bold font-mono px-2 py-0.5 rounded-full shrink-0 select-none">
                            {item.points} Points
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. TABS: ACHIEVEMENTS & PROGRESSION */}
            {activeTab === 'achievements' && (
              <div className="space-y-8 text-left animate-fade-in">
                {/* Header */}
                <div className="border-b border-slate-100 dark:border-slate-805 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 uppercase font-mono tracking-wider">
                      <Award className="w-4 h-4 text-emerald-500" /> HillyTrip Badge & Recognition System
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Expertise badges, point milestones, and verified travel credentials across the Himalayas.</p>
                  </div>
                  <div className="flex items-center gap-1.5 self-start md:self-auto bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/15 px-3 py-1 rounded-xl text-[10px] font-mono font-black uppercase tracking-wider">
                    <span>Rank Level: {levelInfo.current.level} ({levelInfo.current.name})</span>
                  </div>
                </div>

                {/* ================= 1. BADGE SHOWCASE BANNER ================= */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Featured Badge */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center text-xl shadow-lg shadow-amber-500/15 shrink-0 select-none">
                      {badgeState.coreBadges.filter(cb => cb.hasAnyBadge).slice(-1)[0]?.currentLevel?.emoji || '🏆'}
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-400 block font-mono">Current Featured Badge</span>
                      <h5 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-tight">
                        {badgeState.coreBadges.filter(cb => cb.hasAnyBadge).slice(-1)[0]?.currentLevel?.label || 'Peak Contributor'}
                      </h5>
                      <span className="text-[9px] text-slate-450">Highest earned tier</span>
                    </div>
                  </div>

                  {/* Recent Badge */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-500 text-white flex items-center justify-center text-xl shadow-lg shadow-sky-500/15 shrink-0 select-none">
                      {badgeState.specialBadges.filter(sb => sb.unlocked).slice(-1)[0]?.emoji || '⭐'}
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-400 block font-mono">Recent Milestone Earned</span>
                      <h5 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-tight">
                        {badgeState.specialBadges.filter(sb => sb.unlocked).slice(-1)[0]?.name || 'Introductory Contributor'}
                      </h5>
                      <span className="text-[9px] text-slate-450">Earned in active categories</span>
                    </div>
                  </div>

                  {/* Total Count */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-2xl flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-mono text-xl font-black shrink-0 select-none">
                      {badgeState.coreBadges.filter(cb => cb.hasAnyBadge).length + badgeState.specialBadges.filter(sb => sb.unlocked).length}
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-400 block font-mono">Total Verified Badges</span>
                      <h5 className="text-xs font-black text-slate-850 dark:text-slate-100 leading-tight">
                        {badgeState.coreBadges.filter(cb => cb.hasAnyBadge).length} Core • {badgeState.specialBadges.filter(sb => sb.unlocked).length} Special
                      </h5>
                      <span className="text-[9px] text-slate-450">Across all travel categories</span>
                    </div>
                  </div>
                </div>

                {/* ================= 2. CORE EXPERTISE CABINET (5 LEVELS) ================= */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">Core Expertise Badges</h5>
                    <span className="text-[9px] text-slate-450 font-mono">Bronze • Silver • Gold • Platinum • Diamond</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {badgeState.coreBadges.map((cb) => {
                      const activeTier = cb.currentLevel;
                      const nextTier = cb.nextLevel;
                      const hasBadge = cb.hasAnyBadge;
                      
                      // Custom glow classes based on current tier
                      let coinGlow = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 opacity-40';
                      if (hasBadge && activeTier) {
                        if (activeTier.levelName === 'Gold') coinGlow = 'border-yellow-400 bg-yellow-400/15 shadow-[0_0_12px_rgba(234,179,8,0.2)] text-yellow-500 animate-pulse';
                        else if (activeTier.levelName === 'Platinum') coinGlow = 'border-sky-400 bg-sky-400/15 shadow-[0_0_12px_rgba(56,189,248,0.25)] text-sky-400';
                        else if (activeTier.levelName === 'Diamond') coinGlow = 'border-indigo-400 bg-indigo-400/15 shadow-[0_0_15px_rgba(129,140,248,0.35)] text-indigo-400';
                        else if (activeTier.levelName === 'Silver') coinGlow = 'border-slate-350 bg-slate-350/15 text-slate-400';
                        else coinGlow = 'border-amber-600 bg-amber-600/15 text-amber-700';
                      }

                      return (
                        <div 
                          key={cb.category.id} 
                          className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-855 rounded-2xl p-4.5 flex flex-col justify-between hover:shadow-md transition-all relative group"
                        >
                          <div className="flex items-start gap-3.5">
                            {/* Circular Badge Coin Graphic */}
                            <button
                              onClick={() => {
                                if (hasBadge && activeTier) {
                                  setSelectedBadge({
                                    emoji: activeTier.emoji,
                                    title: activeTier.label,
                                    description: cb.category.description,
                                    req: `${cb.category.metricLabel} reached ${activeTier.threshold}`,
                                    unlocked: true,
                                    levelName: activeTier.levelName,
                                    metricLabel: cb.category.metricLabel,
                                    currentValue: cb.progress.current,
                                    targetValue: activeTier.threshold,
                                    category: cb.category
                                  });
                                } else {
                                  const bronze = cb.category.levels.Bronze;
                                  setSelectedBadge({
                                    emoji: '🔒',
                                    title: `${cb.category.name} (Bronze)`,
                                    description: cb.category.description,
                                    req: `${cb.category.metricLabel} reached ${bronze.threshold}`,
                                    unlocked: false,
                                    levelName: 'Bronze',
                                    metricLabel: cb.category.metricLabel,
                                    currentValue: cb.progress.current,
                                    targetValue: bronze.threshold,
                                    category: cb.category
                                  });
                                }
                              }}
                              className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl shrink-0 transition-transform group-hover:scale-105 active:scale-95 cursor-pointer select-none ${coinGlow}`}
                            >
                              <span>{hasBadge && activeTier ? activeTier.emoji : cb.category.defaultEmoji}</span>
                            </button>

                            <div className="space-y-0.5">
                              <h6 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                                {cb.category.name}
                              </h6>
                              <p className="text-[10px] font-black font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-450 leading-none">
                                {hasBadge && activeTier ? activeTier.label : '🔒 Locked Tier'}
                              </p>
                              <p className="text-[10px] text-slate-450 leading-relaxed font-sans line-clamp-2 pt-0.5">
                                {cb.category.description}
                              </p>
                            </div>
                          </div>

                          {/* Progression and requirements block */}
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 space-y-1.5">
                            <div className="flex justify-between items-center text-[9px] font-bold font-mono text-slate-500 select-none">
                              <span>{cb.category.metricLabel}: {cb.progress.current}</span>
                              <span>Target: {cb.progress.target}</span>
                            </div>
                            
                            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                                style={{ width: `${cb.progress.percent}%` }}
                              />
                            </div>

                            <div className="flex justify-between items-center pt-0.5 select-none">
                              <span className="text-[8.5px] text-slate-450 font-medium">
                                {nextTier 
                                  ? `Needs ${nextTier.threshold - cb.progress.current} more to reach ${nextTier.levelName}`
                                  : '💎 Max tier achieved'
                                }
                              </span>
                              <button
                                onClick={() => setSelectedBadge({
                                  emoji: activeTier?.emoji || cb.category.defaultEmoji,
                                  title: activeTier?.label || cb.category.name,
                                  description: cb.category.description,
                                  req: nextTier ? `Submit ${nextTier.threshold} total contributions to unlock ${nextTier.levelName}` : 'Peak level',
                                  unlocked: hasBadge,
                                  levelName: activeTier?.levelName || 'Locked',
                                  metricLabel: cb.category.metricLabel,
                                  currentValue: cb.progress.current,
                                  targetValue: nextTier ? nextTier.threshold : cb.progress.target,
                                  category: cb.category
                                })}
                                className="text-[8.5px] font-black font-mono uppercase text-emerald-600 dark:text-emerald-450 hover:underline cursor-pointer bg-transparent border-0 p-0"
                              >
                                Details ➔
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ================= 3. SPECIAL COLLECTORS BADGES grid ================= */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">Special Collectors Badges</h5>
                    <span className="text-[9px] text-slate-450 font-mono">Unlocked through distinct milestones</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                    {badgeState.specialBadges.map((sb) => (
                      <button
                        key={sb.id}
                        onClick={() => setSelectedBadge({
                          emoji: sb.emoji,
                          title: sb.name,
                          description: sb.description,
                          req: sb.requirement,
                          unlocked: sb.unlocked,
                          isSpecial: true
                        })}
                        className={`p-3 rounded-2xl border text-center transition-all hover:shadow-md cursor-pointer flex flex-col items-center justify-center space-y-2 select-none relative ${
                          sb.unlocked 
                            ? `${sb.bgClass} ${sb.borderClass} hover:scale-[1.03]` 
                            : 'bg-slate-50/50 dark:bg-slate-905 border-slate-200 dark:border-slate-850 opacity-40'
                        }`}
                      >
                        <div className="text-2xl">{sb.emoji}</div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-black text-slate-850 dark:text-slate-100 block leading-tight line-clamp-1">{sb.name}</span>
                          <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">
                            {sb.unlocked ? '★ Earned' : '🔒 Locked'}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ================= 4. POINTS LEDGER & LEVEL RULES ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
                  {/* Points Ledger */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">Points System Allocation Ledger</h5>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 space-y-2">
                      <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-[10px] font-black uppercase text-slate-400 font-mono">
                        <span>Contribution Type</span>
                        <span className="text-right">Points Granted</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                        <div className="flex justify-between"><span>📸 Approved Photo Submission</span><span className="font-mono text-emerald-500 font-bold">+10 pts</span></div>
                        <div className="flex justify-between"><span>⭐ Approved Travel Review</span><span className="font-mono text-emerald-500 font-bold">+15 pts</span></div>
                        <div className="flex justify-between"><span>📍 Discover & Map Destination</span><span className="font-mono text-emerald-500 font-bold">+100 pts</span></div>
                        <div className="flex justify-between"><span>🏞️ Register Natural Attraction</span><span className="font-mono text-emerald-500 font-bold">+50 pts</span></div>
                        <div className="flex justify-between"><span>🏡 Verified Local Homestay Add</span><span className="font-mono text-emerald-500 font-bold">+20 pts</span></div>
                        <div className="flex justify-between"><span>🛣️ Live Road condition report</span><span className="font-mono text-emerald-500 font-bold">+15 pts</span></div>
                        <div className="flex justify-between"><span>🚕 Verified Transport Contact</span><span className="font-mono text-emerald-500 font-bold">+10 pts</span></div>
                        <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-1.5"><span>🏆 Homepage Feature Bonus</span><span className="font-mono text-amber-500 font-bold">+25 pts</span></div>
                        <div className="flex justify-between"><span>🌟 Editorial Nominee Reward</span><span className="font-mono text-amber-500 font-bold">+100 pts</span></div>
                        <div className="flex justify-between"><span>💬 Helpful Community Upvote</span><span className="font-mono text-teal-500 font-bold">+10 pts</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Level Progression Rules */}
                  <div className="space-y-3">
                    <h5 className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">HillyTrip Level Progression Rules</h5>
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 space-y-2">
                      <div className="grid grid-cols-2 border-b border-slate-100 dark:border-slate-800 pb-1.5 text-[10px] font-black uppercase text-slate-400 font-mono">
                        <span>Level & Title</span>
                        <span className="text-right">Required Points</span>
                      </div>
                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-350 font-medium">
                        {CONTRIBUTOR_LEVELS.map((lvl) => {
                          const isCurrent = levelInfo.current.level === lvl.level;
                          return (
                            <div 
                              key={lvl.level} 
                              className={`flex justify-between p-1 rounded-lg ${isCurrent ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold' : ''}`}
                            >
                              <span>Level {lvl.level} — {lvl.name}</span>
                              <span className="font-mono">{lvl.minPoints}+ pts</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 6.5. TABS: OWNER DASHBOARD PANEL */}
            {activeTab === 'dashboard' && isOwnProfile && (
              <div className="space-y-6 text-left">
                {/* Dashboard Header */}
                <div className="border-b border-slate-100 dark:border-slate-805 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>📊</span> Contributor Command Dashboard
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-0.5">Analyze your impact stats, review badge progress, and track draft validations.</p>
                  </div>
                  <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg">
                    🔒 Private Owner View
                  </span>
                </div>

                {/* Profile Completion and Next Milestone Progress */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-7 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-450 font-mono">Profile Completion</h5>
                      <span className="text-sm font-black font-mono text-emerald-500">85% Complete</span>
                    </div>
                    
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" style={{ width: '85%' }} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Verified Account Email</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Traveler Bio Configured</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Portfolio Photo Set</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('settings')}
                        className="flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition text-left cursor-pointer font-bold"
                      >
                        <Plus className="w-4 h-4 shrink-0 text-slate-400" />
                        <span>Sync Outbound Link (+15%)</span>
                      </button>
                    </div>
                  </div>

                  {/* Level & Badge progress summary */}
                  <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between">
                    <div className="space-y-1">
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-450 font-mono">Badge Progress</h5>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-white mt-1">Next: Level {levelInfo.next?.level || 'Max'} {levelInfo.next?.name || ''}</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        You need <strong className="text-emerald-500 font-mono">{(levelInfo.next ? levelInfo.next.minPoints - cData.points : 0).toLocaleString()}</strong> points to advance to the next rank.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setActiveTab('achievements')}
                      className="mt-3 text-xs font-black uppercase text-emerald-500 hover:text-emerald-600 transition tracking-wider font-mono flex items-center gap-1 bg-transparent border-0 cursor-pointer"
                    >
                      View Badge Cabinet <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Grid Analytics Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Total Views</span>
                    <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">{cData.stats.views.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-500 font-bold block mt-1">📈 +18% this month</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Scenery Likes</span>
                    <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">{cData.stats.likes.toLocaleString()}</p>
                    <span className="text-[9px] text-emerald-500 font-bold block mt-1">❤️ +5 new appreciations</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Approved Nodes</span>
                    <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">{cData.stats.total}</p>
                    <span className="text-[9px] text-slate-400 font-medium block mt-1">100% acceptance rate</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 font-mono">Monthly Points</span>
                    <p className="text-lg font-black font-mono text-slate-800 dark:text-white mt-0.5">+{cData.monthlyPoints}</p>
                    <span className="text-[9px] text-sky-500 font-bold block mt-1">🔥 Top 5% in Region</span>
                  </div>
                </div>

                {/* Custom Analytical Volume Simulator */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-5 rounded-3xl space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="text-xs font-black uppercase tracking-wider text-slate-450 font-mono">Contribution Impact Analytics</h5>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">Monthly distribution of travel community impressions.</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500">2026 Stats</span>
                  </div>

                  {/* High quality responsive visual bar simulation */}
                  <div className="h-28 flex items-end justify-between gap-3 px-2 pt-2 border-b border-slate-200 dark:border-slate-800 select-none">
                    <div className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500/20 rounded-t-lg h-[30%] transition-all duration-300 relative">
                        <span className="absolute -top-6 inset-x-0 text-center font-mono text-[9px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">120</span>
                      </div>
                      <span className="text-[9px] font-black font-mono text-slate-400">MAR</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500/20 rounded-t-lg h-[45%] transition-all duration-300 relative">
                        <span className="absolute -top-6 inset-x-0 text-center font-mono text-[9px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">240</span>
                      </div>
                      <span className="text-[9px] font-black font-mono text-slate-400">APR</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full bg-slate-200 dark:bg-slate-800 group-hover:bg-emerald-500/20 rounded-t-lg h-[72%] transition-all duration-300 relative">
                        <span className="absolute -top-6 inset-x-0 text-center font-mono text-[9px] font-black text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">480</span>
                      </div>
                      <span className="text-[9px] font-black font-mono text-slate-400">MAY</span>
                    </div>

                    <div className="flex-1 flex flex-col items-center gap-1.5 group">
                      <div className="w-full bg-emerald-500/80 rounded-t-lg h-[88%] transition-all duration-300 relative shadow-xs">
                        <span className="absolute -top-6 inset-x-0 text-center font-mono text-[9px] font-black text-emerald-500">850</span>
                      </div>
                      <span className="text-[9px] font-black font-mono text-emerald-500">JUN</span>
                    </div>
                  </div>
                </div>

                {/* Pending, Rejected, and Draft Contributions Section */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-450 font-mono">My Queue & Status Log</h5>
                  
                  <div className="space-y-3">
                    
                    {/* Draft Item */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            📝 DRAFT
                          </span>
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Pine Forest viewpoint proposal, Kurseong</span>
                        </div>
                        <p className="text-[10px] text-slate-450 font-medium">Saved 3 days ago. Needs coordinates synchronization and route verification details.</p>
                      </div>
                      <button 
                        onClick={() => {
                          setNotification({ type: 'success', message: 'Loading draft template... Form initialized.' });
                        }}
                        className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase rounded-lg transition tracking-wide font-mono shrink-0 cursor-pointer"
                      >
                        Resume Edit
                      </button>
                    </div>

                    {/* Pending Item */}
                    <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/15 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            ⏳ PENDING APPROVAL
                          </span>
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Ghoom Monastery back alley stairs coordinate update</span>
                        </div>
                        <p className="text-[10px] text-slate-455 font-medium">Submitted June 24, 2026. Currently under review by Darjeeling Region travel moderators.</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono italic shrink-0">Est. 24h review left</span>
                    </div>

                    {/* Rejected Item */}
                    <div className="bg-red-500/5 dark:bg-red-950/10 border border-red-550/10 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/15 font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            ⚠️ REJECTED
                          </span>
                          <span className="text-xs font-bold text-slate-850 dark:text-slate-200">Suntalekhay forest checkpoint path block log</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">June 18, 2026</span>
                      </div>
                      <div className="bg-white dark:bg-slate-900 border border-red-200/50 dark:border-red-950/40 p-2.5 rounded-xl">
                        <span className="text-[9px] font-black font-mono uppercase text-red-500 block">Moderator Feedback:</span>
                        <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5 font-medium">
                          "Invalid location coordination mismatch. Please attach a clear geo-tagged photo of the landslide barrier or checkpoint noticeboard to help local drivers locate the exact detours."
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Points Transactions History Ledger */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black uppercase tracking-wider text-slate-450 font-mono">Transaction History Ledger</h5>
                  
                  <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-2xl divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden">
                    <div className="p-3 flex justify-between items-center text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Road Update Verification</span>
                        <p className="text-[10px] text-slate-400">Siliguri to Sevoke Corridor conditions logged</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-500 text-xs">+100 pts</span>
                        <p className="text-[10px] text-slate-400">June 12, 2026</p>
                      </div>
                    </div>

                    <div className="p-3 flex justify-between items-center text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Approved Photo Contribution</span>
                        <p className="text-[10px] text-slate-400">Cardamom trails valley fog high resolution scenery</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-500 text-xs">+150 pts</span>
                        <p className="text-[10px] text-slate-400">June 10, 2026</p>
                      </div>
                    </div>

                    <div className="p-3 flex justify-between items-center text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Approved Community Review</span>
                        <p className="text-[10px] text-slate-400">Detailed historical visitor guide for Ghoom Monastery</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-500 text-xs">+75 pts</span>
                        <p className="text-[10px] text-slate-400">May 20, 2026</p>
                      </div>
                    </div>

                    <div className="p-3 flex justify-between items-center text-xs">
                      <div className="space-y-0.5 text-left">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Attraction Registration Approval</span>
                        <p className="text-[10px] text-slate-400">Rumtek Dharma Center checkpoint registration</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-black text-emerald-500 text-xs">+250 pts</span>
                        <p className="text-[10px] text-slate-400">March 10, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 7. TABS: SETTINGS FOR LOGGED IN USERS */}
            {activeTab === 'settings' && isOwnProfile && (
              <form onSubmit={handleSaveSettings} className="space-y-5 text-left">
                <div className="border-b border-slate-100 dark:border-slate-805 pb-3">
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Manage Portfolio & Profile Settings</h4>
                  <p className="text-[11px] text-slate-450 mt-0.5">Customize your travel portfolio public presence and privacy variables.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Display/Pen Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      placeholder="e.g. Amit Sharma"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Unique Username</label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value.toLowerCase().trim().replace(/[^a-z0-9_-]/g, ''))}
                      required
                      placeholder="e.g. amit_sharma"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Home Base/Country/Region</label>
                    <input
                      type="text"
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      placeholder="e.g. Gangtok, Sikkim"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                    />
                  </div>

                  <div className="flex flex-col justify-end">
                    <FeaturedPhotoUploader
                      onUploadComplete={(url) => setProfileAvatarUrl(url)}
                      onClear={() => setProfileAvatarUrl('')}
                      currentImageUrl={profileAvatarUrl}
                      email={user?.email || 'anonymous'}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Travel Portfolio Bio</label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    required
                    placeholder="Short summary of your mountain knowledge or photographic style."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium font-sans"
                  />
                </div>



                {/* Privacy checkboxes */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Privacy Controls</h5>
                  
                  <div className="space-y-2">
                    <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none text-slate-600 dark:text-slate-350">
                      <input
                        type="checkbox"
                        checked={hideRegion}
                        onChange={() => setHideRegion(!hideRegion)}
                        className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Hide my Home Base/Region from my public portfolio card</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none text-slate-600 dark:text-slate-350">
                      <input
                        type="checkbox"
                        checked={hideEmail}
                        onChange={() => setHideEmail(!hideEmail)}
                        className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Mask my secure email address in public directories</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs font-medium cursor-pointer select-none text-slate-600 dark:text-slate-350">
                      <input
                        type="checkbox"
                        checked={hideSocials}
                        onChange={() => setHideSocials(!hideSocials)}
                        className="rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                      />
                      <span>Disable outbound links to other travel services</span>
                    </label>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Notification Preferences</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Likes Alerts</span>
                        <p className="text-[10px] text-slate-400">Receive notifications when users like your photos.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefLikes}
                        onChange={() => setPrefLikes(!prefLikes)}
                        className="rounded text-emerald-600 border-slate-305 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Comments Alerts</span>
                        <p className="text-[10px] text-slate-400">Receive alerts when someone comments on your guides.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefComments}
                        onChange={() => setPrefComments(!prefComments)}
                        className="rounded text-emerald-600 border-slate-305 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Replies Alerts</span>
                        <p className="text-[10px] text-slate-400">Get notified when someone replies to your comments.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefReplies}
                        onChange={() => setPrefReplies(!prefReplies)}
                        className="rounded text-emerald-600 border-slate-305 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Photo Approvals</span>
                        <p className="text-[10px] text-slate-400">Be notified when your photo uploads are approved.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefPhotoApproval}
                        onChange={() => setPrefPhotoApproval(!prefPhotoApproval)}
                        className="rounded text-emerald-600 border-slate-305 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Review Replies</span>
                        <p className="text-[10px] text-slate-400">Receive replies to your posted reviews.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefReviewReplies}
                        onChange={() => setPrefReviewReplies(!prefReviewReplies)}
                        className="rounded text-emerald-600 border-slate-305 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-805 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-805 dark:text-slate-200">Travel Alerts</span>
                        <p className="text-[10px] text-slate-400">Get severe weather or road transit updates.</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={prefTravelAlerts}
                        onChange={() => setPrefTravelAlerts(!prefTravelAlerts)}
                        className="rounded text-emerald-600 border-slate-305 focus:ring-emerald-500 h-4.5 w-4.5 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Account Preferences */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Account Preferences</h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] font-black uppercase text-slate-405 block mb-1">Preferred Language</label>
                      <select 
                        value={prefLanguage}
                        onChange={(e) => setPrefLanguage(e.target.value)}
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs font-medium p-2 rounded-xl w-full text-slate-700 dark:text-slate-300"
                      >
                        <option value="en">English (US / IN)</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="ne">नेपाली (Nepali)</option>
                        <option value="ben">বাংলা (Bengali)</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.clear();
                          setNotification({ type: 'success', message: 'Local storage cache cleared. Portfolio reset to default.' });
                          setTimeout(() => window.location.reload(), 1200);
                        }}
                        className="w-full bg-red-500/10 hover:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 py-2 px-3 rounded-xl text-xs font-extrabold uppercase font-mono tracking-wider transition cursor-pointer text-center"
                      >
                        🗑️ Reset Local Cache
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl transition shadow active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSavingSettings ? 'Saving Changes...' : 'Save Portfolio Configuration'}
                </button>
              </form>
            )}

          </div>

        </div>

      </div>

      {/* ================= LIGHTBOX POPUP MODAL ================= */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <div 
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-md z-[10010] flex flex-col justify-between select-text"
            onClick={() => setLightboxIndex(null)}
          >
            {/* Top Lightbox header */}
            <div className="p-4 sm:p-5 flex items-center justify-between text-white border-b border-white/5 bg-slate-950/50 backdrop-blur-md z-30">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-mono font-bold uppercase text-slate-350">
                <span>📸 HillyTrip moments viewer</span>
                <span className="text-white/20">|</span>
                <span>{lightboxIndex + 1} / {filteredPhotos.length}</span>
              </div>
              <button
                onClick={() => setLightboxIndex(null)}
                className="w-10 h-10 rounded-full border border-white/15 hover:border-white/25 bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-black text-white hover:scale-105 active:scale-95 transition cursor-pointer select-none"
              >
                ✕
              </button>
            </div>

            {/* Middle Main Picture Viewer */}
            <div className="flex-grow flex items-center justify-center p-4 relative z-10 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prev => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1));
                }}
                className="absolute left-4 w-11 h-11 rounded-full border border-white/15 hover:border-white/25 bg-slate-900/60 hover:bg-slate-900/80 flex items-center justify-center text-white font-black hover:scale-105 active:scale-95 transition cursor-pointer select-none z-20"
              >
                ◀
              </button>

              <div 
                className="max-w-4xl max-h-[70vh] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 flex items-center justify-center select-none"
                onClick={(e) => e.stopPropagation()}
              >
                <img 
                  src={filteredPhotos[lightboxIndex].url} 
                  alt={filteredPhotos[lightboxIndex].caption} 
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(prev => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 w-11 h-11 rounded-full border border-white/15 hover:border-white/25 bg-slate-900/60 hover:bg-slate-900/80 flex items-center justify-center text-white font-black hover:scale-105 active:scale-95 transition cursor-pointer select-none z-20"
              >
                ▶
              </button>
            </div>

            {/* Bottom minimal elegant metadata bar */}
            <div 
              className="p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent border-t border-white/5 flex flex-col md:flex-row md:items-end justify-between gap-4 select-text text-left"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-1.5 flex-grow max-w-2xl">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono font-black uppercase text-emerald-450">
                  <span>📍 {cData.region || 'Himalayas'}</span>
                  <span>•</span>
                  <span>Verified Photo Submission</span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-white tracking-tight leading-tight">
                  {filteredPhotos[lightboxIndex].caption}
                </h4>
                <p className="text-xs text-slate-400">
                  Uploaded by @{cData.id} • {new Date(filteredPhotos[lightboxIndex].date).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}
                </p>
              </div>

              {/* Stats & Actions inside Lightbox */}
              <div className="flex items-center gap-3 select-none">
                <span className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-mono text-xs font-bold flex items-center gap-1">
                  ❤️ {filteredPhotos[lightboxIndex].likes} likes
                </span>
                <span className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-300 font-mono text-xs font-bold flex items-center gap-1">
                  👁️ {filteredPhotos[lightboxIndex].views} views
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= ACCREDITATION BADGE DETAIL MODAL ================= */}
      {selectedBadge && (
        <div className="fixed inset-0 z-[10005] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 select-none overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full text-left relative shadow-2xl space-y-5 my-8">
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer font-black text-sm p-1 bg-transparent border-0"
            >
              ✕
            </button>

            {/* Top overview */}
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-400/10 border border-emerald-500/20 text-3xl flex items-center justify-center shadow-inner shrink-0">
                <span>{selectedBadge.emoji}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black font-mono uppercase text-emerald-500 tracking-wider block">
                  {selectedBadge.isSpecial ? 'Special HillyTrip Recognition' : `${selectedBadge.levelName || 'Bronze'} Level Accreditation`}
                </span>
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                  {selectedBadge.title}
                </h4>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-medium">
              "{selectedBadge.description}"
            </p>

            {/* If Core Badge: display tier progression list */}
            {!selectedBadge.isSpecial && selectedBadge.category && (
              <div className="space-y-3.5 text-left">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-slate-400 font-mono">Accreditation Tiers Progression</h5>
                <div className="space-y-2 bg-slate-50 dark:bg-slate-955 p-3 rounded-2xl border border-slate-150 dark:border-slate-850">
                  {(Object.keys(selectedBadge.category.levels) as Array<'Bronze'|'Silver'|'Gold'|'Platinum'|'Diamond'>).map((tierKey) => {
                    const tier = selectedBadge.category.levels[tierKey];
                    const isReached = selectedBadge.currentValue >= tier.threshold;
                    const isActive = selectedBadge.levelName === tierKey;
                    
                    return (
                      <div 
                        key={tierKey} 
                        className={`flex justify-between items-center p-2 rounded-xl border text-[11px] font-medium transition-all ${
                          isActive 
                            ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border-emerald-500/30 text-slate-900 dark:text-white font-bold scale-[1.01]' 
                            : isReached 
                              ? 'bg-slate-100/40 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 text-slate-500 dark:text-slate-400' 
                              : 'bg-transparent border-transparent text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{tier.emoji}</span>
                          <span>{tier.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span>{tier.threshold}+ {selectedBadge.category.metricLabel}</span>
                          {isReached ? (
                            <span className="text-emerald-500 font-bold ml-1">✓</span>
                          ) : (
                            <span className="text-slate-300 dark:text-slate-700 ml-1">🔒</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress bar info */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold font-mono text-slate-500">
                    <span>Category Progress</span>
                    <span>{selectedBadge.currentValue} / {selectedBadge.targetValue} {selectedBadge.category.metricLabel}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (selectedBadge.currentValue / selectedBadge.targetValue) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Special Badge requirement block */}
            {selectedBadge.isSpecial && (
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border dark:border-slate-850 text-left space-y-1">
                <span className="text-[8px] font-black uppercase text-slate-450 dark:text-slate-450 block font-mono">How to Earn</span>
                <p className="text-[11px] font-bold text-slate-750 dark:text-slate-300">{selectedBadge.req}</p>
              </div>
            )}

            {/* Metadata footer */}
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-450 border-t border-slate-100 dark:border-slate-800 pt-3 select-none">
              <span>Status: {selectedBadge.unlocked ? '✅ Unlocked' : '🔒 Locked'}</span>
              <span>Earned: {selectedBadge.unlocked ? cData.memberSince : 'N/A'}</span>
            </div>
          </div>
        </div>
      )}

      {/* ================= REPORT DISCREPANCY MODAL ================= */}
      {showReportModal && (
        <div className="fixed inset-0 z-[10005] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-805 rounded-3xl p-6 max-w-md w-full text-left relative shadow-2xl space-y-4">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer font-black text-sm"
            >
              ✕
            </button>

            <div className="space-y-1 text-center sm:text-left">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-red-500/10 text-red-500 border border-red-500/15">
                🛡️ HillyTrip Security Control
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Report Contributor discrepancy</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ensure accuracy across the Himalayan network. Flag plagiarized content, fabricated reports or commercial listings.
              </p>
            </div>

            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Reason for report *</label>
                <select
                  required
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium"
                >
                  <option value="">-- Select reason --</option>
                  <option value="plagiarism">Plagiarized/Stolen photography</option>
                  <option value="spam">Commercial advertisement spam</option>
                  <option value="incorrect">Inaccurate/Hazardous road update</option>
                  <option value="scam">Scam/Fake homestay listings</option>
                  <option value="abusive">Abusive/Inappropriate caption</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Supporting Details *</label>
                <textarea
                  rows={3}
                  required
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Provide links, photo references, or specific evidence verifying the error."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100 font-medium font-sans"
                />
              </div>

              <div className="flex gap-3 select-none">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl text-slate-700 dark:text-slate-300 cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmittingReport ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
