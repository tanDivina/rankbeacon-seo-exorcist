'use client';

import { useState, useEffect } from 'react';
import SpookyParticles from '../components/SpookyParticles';
import BatExplosion from '../components/BatExplosion';
import RetroButton from '../components/RetroButton';
import RetroInput from '../components/RetroInput';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [useJsRendering, setUseJsRendering] = useState(true);
  const [depth, setDepth] = useState(3);
  const [expandedIssue, setExpandedIssue] = useState<number | null>(null);
  const [fixedIssues, setFixedIssues] = useState<Set<number>>(new Set());
  const [showVictory, setShowVictory] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [cursorTrail, setCursorTrail] = useState<Array<{x: number, y: number, id: number}>>([]);
  const [bats, setBats] = useState<Array<{x: number, y: number, id: number, speed: number}>>([]);
  const [showFullExorcism, setShowFullExorcism] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isProfessionalMode, setIsProfessionalMode] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Initialize audio context on first user interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      }
    };
    
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, [audioContext]);

  // Haunted cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newTrail = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now()
      };
      setCursorTrail(prev => [...prev.slice(-10), newTrail]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Clean up old trail particles
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorTrail(prev => prev.filter(p => Date.now() - p.id < 1000));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Flying bats animation
  useEffect(() => {
    // Initialize bats
    const initialBats = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      id: i,
      speed: 1 + Math.random() * 2
    }));
    setBats(initialBats);

    // Animate bats
    const interval = setInterval(() => {
      setBats(prev => prev.map(bat => {
        const newX = bat.x + bat.speed;
        return {
          ...bat,
          x: newX > window.innerWidth ? -50 : newX,
          y: bat.y + Math.sin(Date.now() / 1000 + bat.id) * 2
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Load persistent progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('rankbeacon_progress');
    const savedAchievements = localStorage.getItem('rankbeacon_achievements');
    const savedSound = localStorage.getItem('rankbeacon_sound');
    
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        if (progress.url === url && progress.fixedIssues) {
          setFixedIssues(new Set(progress.fixedIssues));
        }
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
    
    if (savedAchievements) {
      try {
        setAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        console.error('Failed to load achievements:', e);
      }
    }
    
    if (savedSound !== null) {
      setSoundEnabled(savedSound === 'true');
    }
  }, [url]);

  // Save progress to localStorage
  useEffect(() => {
    if (result && url) {
      localStorage.setItem('rankbeacon_progress', JSON.stringify({
        url,
        fixedIssues: Array.from(fixedIssues),
        timestamp: Date.now()
      }));
    }
  }, [fixedIssues, url, result]);

  // Save achievements
  useEffect(() => {
    localStorage.setItem('rankbeacon_achievements', JSON.stringify(achievements));
  }, [achievements]);

  // Save sound preference
  useEffect(() => {
    localStorage.setItem('rankbeacon_sound', soundEnabled.toString());
  }, [soundEnabled]);

  // Check if first visit and show tutorial
  useEffect(() => {
    const hasVisited = localStorage.getItem('rankbeacon_visited');
    if (!hasVisited) {
      setShowTutorial(true);
      localStorage.setItem('rankbeacon_visited', 'true');
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to analyze
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && url && !loading) {
        e.preventDefault();
        analyzeWebsite();
      }
      // Ctrl/Cmd + D for demo
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !loading) {
        e.preventDefault();
        loadDemoData();
      }
      // Escape to close expanded issue
      if (e.key === 'Escape') {
        if (expandedIssue !== null) setExpandedIssue(null);
        if (showTutorial) setShowTutorial(false);
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
      }
      // ? to show keyboard shortcuts
      if (e.key === '?' && !showTutorial) {
        setShowKeyboardShortcuts(!showKeyboardShortcuts);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [url, loading, expandedIssue, showTutorial, showKeyboardShortcuts]);

  // Check for achievements
  const checkAchievements = (newFixed: Set<number>) => {
    const newAchievements: string[] = [];
    
    // First Fix
    if (newFixed.size === 1 && !achievements.includes('first_fix')) {
      newAchievements.push('first_fix');
      showAchievementNotification('🎯 First Fix!', 'You fixed your first SEO issue!');
    }
    
    // Speed Demon (fix 3 in under 2 minutes)
    if (newFixed.size === 3 && !achievements.includes('speed_demon')) {
      newAchievements.push('speed_demon');
      showAchievementNotification('⚡ Speed Demon!', 'Fixed 3 issues quickly!');
    }
    
    // Perfectionist (fix all issues)
    if (result && newFixed.size === result.entities.length && !achievements.includes('perfectionist')) {
      newAchievements.push('perfectionist');
      showAchievementNotification('✨ Perfectionist!', 'All issues exorcised!');
    }
    
    // Ghost Hunter (fix 5 ghost issues)
    const ghostsFix = Array.from(newFixed).filter(i => 
      result?.entities[i]?.type === 'ghost'
    ).length;
    if (ghostsFix >= 5 && !achievements.includes('ghost_hunter')) {
      newAchievements.push('ghost_hunter');
      showAchievementNotification('👻 Ghost Hunter!', 'Exorcised 5 ghosts!');
    }
    
    if (newAchievements.length > 0) {
      setAchievements([...achievements, ...newAchievements]);
    }
  };

  const showAchievementNotification = (title: string, description: string) => {
    setShowAchievement(`${title}|${description}`);
    playSound('complete');
    setTimeout(() => setShowAchievement(null), 4000);
  };

  // Demo mode with pre-loaded data
  const loadDemoData = () => {
    playSound('spooky');
    setUrl('demo-site.example');
    setLoading(true);
    setError('');
    setResult(null);
    setFixedIssues(new Set());
    setExpandedIssue(null);
    setLoadingProgress(0);

    // Simulate loading
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    // Load demo data after 2 seconds
    setTimeout(() => {
      clearInterval(progressInterval);
      setLoadingProgress(100);
      
      const demoData = {
        url: 'demo-site.example',
        haunting_score: 65,
        pages_analyzed: 5,
        total_issues: 12,
        entities: [
          {
            type: 'ghost',
            severity: 'critical',
            title: 'Missing Meta Description',
            description: 'Homepage has no meta description - critical for search results',
            url: 'https://demo-site.example',
            fix_suggestion: 'Add a compelling meta description (150-160 characters) that summarizes your page',
            suggested_code: '<meta name="description" content="Welcome to Demo Site - Your one-stop solution for amazing products and services. Shop now and save 20% on your first order!">'
          },
          {
            type: 'ghost',
            severity: 'high',
            title: 'Title Tag Too Long',
            description: 'Title is 78 characters (recommended: 50-60)',
            url: 'https://demo-site.example/products',
            fix_suggestion: 'Shorten your title tag to 50-60 characters',
            current_content: 'Amazing Products for Everyone - Shop Now and Save Big on Quality Items',
            suggested_code: '<title>Amazing Products - Shop Now and Save Big</title>'
          },
          {
            type: 'phantom',
            severity: 'medium',
            title: 'Images Missing Alt Text',
            description: '8 out of 12 images lack alt text',
            url: 'https://demo-site.example',
            fix_suggestion: 'Add descriptive alt text to all images for accessibility and SEO',
            image_examples: [
              { src: '/images/hero-banner.jpg', suggested_alt: 'Hero Banner - Premium Products Showcase' },
              { src: '/images/product-laptop.png', suggested_alt: 'Product Photo - Modern Laptop Computer' },
              { src: '/images/team-photo.jpg', suggested_alt: 'Team Photo - Our Dedicated Staff' }
            ],
            suggested_code: '<img src="/images/hero-banner.jpg" alt="Hero Banner - Premium Products Showcase">\n<img src="/images/product-laptop.png" alt="Product Photo - Modern Laptop Computer">\n<img src="/images/team-photo.jpg" alt="Team Photo - Our Dedicated Staff">'
          },
          {
            type: 'zombie',
            severity: 'high',
            title: 'Multiple H1 Tags',
            description: 'Found 3 H1 tags (recommended: 1)',
            url: 'https://demo-site.example/about',
            fix_suggestion: 'Use only one H1 tag per page',
            current_content: 'Found: About Us, Our Mission, Contact Info',
            suggested_code: '<h1>About Us</h1>\n<h2>Our Mission</h2>\n<h2>Contact Info</h2>'
          },
          {
            type: 'zombie',
            severity: 'low',
            title: 'Few Internal Links',
            description: 'Only 3 internal links found',
            url: 'https://demo-site.example/blog',
            fix_suggestion: 'Add more internal links to improve site structure'
          },
          {
            type: 'monster',
            severity: 'high',
            title: 'Competitor Outranking',
            description: 'competitor-site.com ranks higher for "premium products"',
            url: 'https://demo-site.example',
            fix_suggestion: 'Analyze competitor content and create superior, more comprehensive content'
          },
          {
            type: 'specter',
            severity: 'medium',
            title: 'No Schema Markup',
            description: 'No structured data (JSON-LD) found',
            url: 'https://demo-site.example',
            fix_suggestion: 'Implement Schema.org markup for rich snippets',
            suggested_code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Demo Site",\n  "url": "https://demo-site.example"\n}\n</script>'
          },
          {
            type: 'phantom',
            severity: 'medium',
            title: 'Content Gap Opportunity',
            description: 'Missing content for "product reviews" keyword',
            url: 'https://demo-site.example',
            fix_suggestion: 'Create comprehensive content addressing this topic'
          },
          {
            type: 'ghost',
            severity: 'medium',
            title: 'Missing Open Graph Tags',
            description: 'No social media preview tags found',
            url: 'https://demo-site.example',
            fix_suggestion: 'Add Open Graph tags for better social sharing',
            suggested_code: '<meta property="og:title" content="Demo Site - Premium Products">\n<meta property="og:description" content="Shop amazing products with great deals">\n<meta property="og:image" content="/images/og-image.jpg">'
          },
          {
            type: 'specter',
            severity: 'low',
            title: 'Missing Canonical Tag',
            description: 'No canonical URL specified',
            url: 'https://demo-site.example/products',
            fix_suggestion: 'Add canonical tag to avoid duplicate content issues',
            suggested_code: '<link rel="canonical" href="https://demo-site.example/products">'
          },
          {
            type: 'zombie',
            severity: 'medium',
            title: 'Broken Internal Link',
            description: 'Link to /old-page returns 404',
            url: 'https://demo-site.example/contact',
            fix_suggestion: 'Update or remove broken link',
            suggested_code: '<!-- Remove or update this link -->\n<a href="/new-page">Updated Link</a>'
          },
          {
            type: 'phantom',
            severity: 'low',
            title: 'Slow Page Load',
            description: 'Estimated load time: 4.2 seconds (target: <3s)',
            url: 'https://demo-site.example',
            fix_suggestion: 'Optimize images and reduce JavaScript bundle size'
          }
        ],
        recommendations: [
          'Fix critical meta description issues first for immediate SEO impact',
          'Optimize all images with descriptive alt text for accessibility',
          'Implement proper heading hierarchy (one H1 per page)',
          'Add Schema.org structured data for rich search results',
          'Improve internal linking structure for better crawlability',
          'Create content to fill identified keyword gaps',
          'Optimize page speed by compressing images and minifying code'
        ],
        analysis_complete: true
      };

      setTimeout(() => {
        setResult(demoData);
        playSound('ambient');
        setAnimatedScore(0);
        const scoreInterval = setInterval(() => {
          setAnimatedScore(prev => {
            if (prev >= demoData.haunting_score) {
              clearInterval(scoreInterval);
              return demoData.haunting_score;
            }
            return prev + Math.ceil(demoData.haunting_score / 30);
          });
        }, 50);
      }, 300);
      
      setLoading(false);
    }, 2000);
  };

  const analyzeWebsite = async () => {
    if (!url) return;
    
    playSound('spooky');
    setLoading(true);
    setError('');
    setResult(null);
    setFixedIssues(new Set());
    setExpandedIssue(null);
    setLoadingProgress(0);

    // Animate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.startsWith('http') ? url : `https://${url}`,
          depth: depth,
          include_competitors: false,
          use_js_rendering: useJsRendering
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setLoadingProgress(100);
      setTimeout(() => {
        setResult(data);
        playSound('ambient');
        // Animate score counting up
        setAnimatedScore(0);
        const scoreInterval = setInterval(() => {
          setAnimatedScore(prev => {
            if (prev >= data.haunting_score) {
              clearInterval(scoreInterval);
              return data.haunting_score;
            }
            return prev + Math.ceil(data.haunting_score / 30);
          });
        }, 50);
      }, 300);
    } catch (err) {
      setError('Failed to analyze website. Please check the URL and try again.');
      playSound('error');
      console.error('Analysis error:', err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => setLoading(false), 300);
    }
  };

  const toggleIssue = (index: number) => {
    const willExpand = expandedIssue !== index;
    setExpandedIssue(expandedIssue === index ? null : index);
    if (willExpand) {
      playSound('expand');
    } else {
      playSound('click');
    }
  };

  const markAsFixed = (index: number) => {
    const newFixed = new Set(fixedIssues);
    newFixed.add(index);
    setFixedIssues(newFixed);
    
    // Check achievements
    checkAchievements(newFixed);
    
    // Check if all issues are fixed
    const allFixed = result && newFixed.size === result.entities.length;
    
    // Show victory animation
    setShowVictory(true);
    if (allFixed) {
      playSound('complete');
      // Trigger full-screen exorcism animation
      setTimeout(() => {
        setShowFullExorcism(true);
        setTimeout(() => setShowFullExorcism(false), 5000);
      }, 2000);
    } else {
      playSound('victory');
    }
    setTimeout(() => setShowVictory(false), 2000);
  };

  // Sound Effects Library
  const playSound = (type: string) => {
    if (!soundEnabled || !audioContext) return;

    switch (type) {
      case 'victory':
        playVictorySound();
        break;
      case 'spooky':
        playSpookySound();
        break;
      case 'click':
        playClickSound();
        break;
      case 'expand':
        playExpandSound();
        break;
      case 'error':
        playErrorSound();
        break;
      case 'complete':
        playCompleteSound();
        break;
      case 'ambient':
        playAmbientSound();
        break;
    }
  };

  const playVictorySound = () => {
    if (!audioContext) return;
    // Magical victory chime: C-E-G-C (major chord arpeggio)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + i * 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.1 + 0.5);
      
      oscillator.start(audioContext.currentTime + i * 0.1);
      oscillator.stop(audioContext.currentTime + i * 0.1 + 0.5);
    });

    // Add sparkle effect
    setTimeout(() => {
      const sparkle = audioContext.createOscillator();
      const sparkleGain = audioContext.createGain();
      sparkle.connect(sparkleGain);
      sparkleGain.connect(audioContext.destination);
      sparkle.frequency.value = 2093; // High C
      sparkle.type = 'sine';
      sparkleGain.gain.setValueAtTime(0.2, audioContext.currentTime);
      sparkleGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      sparkle.start(audioContext.currentTime);
      sparkle.stop(audioContext.currentTime + 0.3);
    }, 400);
  };

  const playSpookySound = () => {
    if (!audioContext) return;
    // Eerie descending tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 1);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const playClickSound = () => {
    if (!audioContext) return;
    // Subtle click sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.05);
  };

  const playExpandSound = () => {
    if (!audioContext) return;
    // Ascending whoosh
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  };

  const playErrorSound = () => {
    if (!audioContext) return;
    // Ominous low tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 100;
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const playCompleteSound = () => {
    if (!audioContext) return;
    // Triumphant fanfare
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C-E-G-C-E
    
    notes.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = freq;
      oscillator.type = 'triangle';
      
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime + i * 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.6);
      
      oscillator.start(audioContext.currentTime + i * 0.08);
      oscillator.stop(audioContext.currentTime + i * 0.08 + 0.6);
    });
  };

  const playAmbientSound = () => {
    if (!audioContext) return;
    // Subtle atmospheric drone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 110; // Low A
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 3);
  };

  // Get entity emoji based on type
  const getEntityEmoji = (type: string) => {
    const emojiMap: any = {
      ghost: '👻',
      zombie: '🧟',
      monster: '👹',
      specter: '💀',
      phantom: '🌫️'
    };
    return emojiMap[type] || '👻';
  };

  // Strip emoji from title
  const stripEmoji = (title: string) => {
    return title.replace(/^[👻🧟👹💀🌫️]\s*/, '');
  };

  // Educational tooltips - Why each issue matters
  const getEducationalInfo = (type: string, severity: string) => {
    const education: any = {
      ghost: {
        why: "Missing or broken elements hurt your search visibility and user experience",
        impact: "Can reduce rankings by 20-40% and increase bounce rate",
        ranking: "High impact on search engine rankings"
      },
      zombie: {
        why: "Poor site structure makes it hard for search engines to understand your content",
        impact: "Reduces crawl efficiency and internal link equity distribution",
        ranking: "Medium impact on overall site authority"
      },
      monster: {
        why: "Competitors with better SEO will capture your potential traffic and customers",
        impact: "Lost market share and revenue to competing websites",
        ranking: "Critical for competitive positioning"
      },
      specter: {
        why: "Missing technical elements prevent rich search results and enhanced visibility",
        impact: "Miss out on featured snippets, rich cards, and enhanced SERP features",
        ranking: "Medium-high impact on click-through rates"
      },
      phantom: {
        why: "Content gaps mean missed opportunities to rank for valuable keywords",
        impact: "Competitors capture traffic for keywords you could own",
        ranking: "High potential for new traffic acquisition"
      }
    };
    return education[type] || education.ghost;
  };

  const getFixInstructions = (entity: any) => {
    const instructions: any = {
      ghost: {
        steps: [
          'Identify all broken links using the URL provided',
          'Set up 301 redirects to relevant replacement pages',
          'Update internal links pointing to the dead page',
          'Create a custom 404 page if you don\'t have one'
        ],
        code: `# .htaccess redirect example
Redirect 301 /old-page.html /new-page.html

# Or in Next.js (next.config.js)
async redirects() {
  return [
    {
      source: '/old-page',
      destination: '/new-page',
      permanent: true,
    },
  ]
}`,
        docs: 'https://developers.google.com/search/docs/crawling-indexing/301-redirects'
      },
      zombie: {
        steps: [
          'Find related content pages on your site',
          'Add contextual internal links from those pages',
          'Include the page in your navigation menu if relevant',
          'Add to your XML sitemap',
          'Consider creating a hub page that links to related orphaned content'
        ],
        code: `<!-- Add internal links in your content -->
<p>Learn more about <a href="/orphaned-page">this topic</a>.</p>

<!-- Or in your navigation -->
<nav>
  <a href="/orphaned-page">Important Page</a>
</nav>`,
        docs: 'https://developers.google.com/search/docs/crawling-indexing/links-crawlable'
      },
      monster: {
        steps: [
          'Analyze competitor\'s content depth and quality',
          'Identify their keyword strategy',
          'Create superior, more comprehensive content',
          'Build relevant backlinks from authoritative sources',
          'Optimize your technical SEO (speed, mobile, schema)'
        ],
        code: `// Improve your content with better structure
<article>
  <h1>Comprehensive Guide to [Topic]</h1>
  <div class="table-of-contents">...</div>
  <section>
    <h2>In-depth Section</h2>
    <p>More detailed content than competitors...</p>
  </section>
</article>`,
        docs: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content'
      },
      specter: {
        steps: [
          'Choose the appropriate schema type for your content',
          'Implement JSON-LD structured data',
          'Test with Google\'s Rich Results Test',
          'Monitor performance in Search Console',
          'Expand schema coverage across all content types'
        ],
        code: `<!-- Add JSON-LD schema markup -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Your Article Title",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2025-01-01"
}
</script>`,
        docs: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data'
      },
      phantom: {
        steps: [
          'Use keyword gap analysis tools to find opportunities',
          'Analyze search intent (informational, navigational, transactional)',
          'Create comprehensive content (1500+ words for pillar topics)',
          'Structure content for featured snippets (paragraphs, lists, tables)',
          'Answer questions directly in the first paragraph',
          'Use proper heading hierarchy (H1, H2, H3)',
          'Add FAQ schema markup for question-based queries',
          'Build internal links from related existing content'
        ],
        code: `<!-- Featured Snippet Optimization Examples -->

<!-- For "What is" queries - Paragraph snippet -->
<article>
  <h1>What is Search Engine Optimization?</h1>
  <p>Search Engine Optimization (SEO) is the practice of improving 
  your website's visibility in search engine results pages (SERPs) 
  through organic (non-paid) methods. It involves optimizing content, 
  technical elements, and building authority to rank higher.</p>
</article>

<!-- For "How to" queries - Numbered list snippet -->
<article>
  <h2>How to Improve Your SEO</h2>
  <ol>
    <li>Research relevant keywords for your target audience</li>
    <li>Create high-quality, comprehensive content</li>
    <li>Optimize title tags and meta descriptions</li>
    <li>Build high-quality backlinks from authoritative sites</li>
    <li>Improve page speed and mobile experience</li>
  </ol>
</article>

<!-- For comparison queries - Table snippet -->
<table>
  <caption>SEO vs SEM Comparison</caption>
  <thead>
    <tr>
      <th>Feature</th>
      <th>SEO</th>
      <th>SEM</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cost</td>
      <td>Free (organic)</td>
      <td>Paid (ads)</td>
    </tr>
    <tr>
      <td>Results</td>
      <td>Long-term</td>
      <td>Immediate</td>
    </tr>
  </tbody>
</table>`,
        docs: 'https://developers.google.com/search/docs/appearance/featured-snippets'
      }
    };

    return instructions[entity.type] || instructions.ghost;
  };

  // Export report function
  const exportReport = () => {
    if (!result) return;
    
    const report = `
🎃 RANKBEACON SEO EXORCISM REPORT 🎃
═══════════════════════════════════════

📊 HAUNTING SCORE: ${result.haunting_score}/100
🌐 URL: ${result.url}
📅 Date: ${new Date().toLocaleDateString()}
📄 Pages Analyzed: ${result.pages_analyzed}

${result.haunting_score < 20 ? '✨ BARELY HAUNTED!' :
  result.haunting_score < 40 ? '👻 MILDLY SPOOKY' :
  result.haunting_score < 60 ? '😱 MODERATELY HAUNTED' :
  result.haunting_score < 80 ? '💀 VERY HAUNTED!' :
  '🔥 EXTREMELY HAUNTED!'}

═══════════════════════════════════════
🕯️ ISSUES FOUND (${result.entities.length})
═══════════════════════════════════════

${result.entities.map((entity: any, i: number) => `
${i + 1}. ${entity.title}
   Severity: ${entity.severity.toUpperCase()}
   Location: ${entity.url}
   
   📝 Description:
   ${entity.description}
   
   🔧 Fix Suggestion:
   ${entity.fix_suggestion}
   
   ${entity.suggested_code ? `💻 Suggested Code:
   ${entity.suggested_code}
   ` : ''}
   ${entity.current_content ? `📄 Current Content:
   ${entity.current_content}
   ` : ''}
   ───────────────────────────────────────
`).join('\n')}

═══════════════════════════════════════
📜 RECOMMENDATIONS
═══════════════════════════════════════

${result.recommendations.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n')}

═══════════════════════════════════════
Generated by RankBeacon SEO Exorcist 👻
Banishing SEO demons since 2025 🔮
═══════════════════════════════════════
    `.trim();

    // Copy to clipboard
    navigator.clipboard.writeText(report);
    playSound('click');
    
    // Show success message
    alert('📋 Report copied to clipboard!');
  };

  // VHS timestamp
  const [vhsTime, setVhsTime] = useState('');
  
  useEffect(() => {
    const updateVhsTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
      setVhsTime(`OCT 31, 1987\n${formattedHours}:${formattedMinutes} ${ampm}`);
    };
    updateVhsTime();
    const interval = setInterval(updateVhsTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      isProfessionalMode 
        ? 'bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900' 
        : 'bg-black text-gray-200'
    }`}>
      {/* Costume Mode: VHS Effects */}
      {!isProfessionalMode && (
        <>
          {/* VHS Background Layers */}
          <div className="absolute inset-0 bg-[#020202] z-0"></div>
          
          {/* Red/Black Supernatural Gradient */}
          <div 
            className="absolute inset-0 z-0 opacity-100" 
            style={{
              background: `radial-gradient(circle at 50% 55%, rgba(130, 10, 30, 0.7) 0%, rgba(60, 5, 20, 0.8) 35%, rgba(10, 0, 5, 0.95) 70%, #000 100%)`
            }}
          ></div>
          
          {/* Noise/Grain Texture */}
          <div 
            className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='1'/%3E%3C/svg%3E")`,
              filter: 'contrast(150%) brightness(100%)'
            }}
          ></div>
          
          {/* Scanlines */}
          <div className="absolute inset-0 z-50 opacity-30 pointer-events-none" style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, transparent 1px, transparent 2px, rgba(0,0,0,0.15) 3px)',
            backgroundSize: '100% 3px'
          }}></div>
          
          {/* Vignette */}
          <div className="absolute inset-0 z-50 opacity-60 pointer-events-none" style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)'
          }}></div>
          
          {/* Bat Explosion Effect */}
          <BatExplosion />
          
          {/* Spooky Particles */}
          <SpookyParticles />
        </>
      )}

      {/* Professional Mode: Clean Background */}
      {isProfessionalMode && (
        <>
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50 z-0"></div>
          
          {/* Subtle grid pattern */}
          <div 
            className="absolute inset-0 z-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          ></div>
        </>
      )}
      


      {/* Subtle Corner Accents - Only in Costume Mode */}
      {!isProfessionalMode && (
        <>
          <div className="fixed top-0 left-0 w-48 h-48 pointer-events-none z-30 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M0,0 L50,50 M0,15 L50,50 M0,30 L50,50 M15,0 L50,50 M30,0 L50,50" 
                    stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none"/>
            </svg>
          </div>
          <div className="fixed top-0 right-0 w-48 h-48 pointer-events-none z-30 opacity-20 transform scale-x-[-1]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path d="M0,0 L50,50 M0,15 L50,50 M0,30 L50,50 M15,0 L50,50 M30,0 L50,50" 
                    stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" fill="none"/>
            </svg>
          </div>
        </>
      )}
      
      {/* Header */}
      <header className={`relative z-10 border-b backdrop-blur-sm ${
        isProfessionalMode 
          ? 'border-gray-300 bg-white/80' 
          : 'border-red-900/30'
      }`}>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-12">
              {!isProfessionalMode && <span className="text-8xl md:text-9xl opacity-70">💀</span>}
              <div className="text-center">
                <p className={`text-sm tracking-[0.5em] mb-3 uppercase ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400 font-mono'
                }`}>RankBeacon SEO {isProfessionalMode ? 'Analytics' : 'Exorcist'}</p>
                <h1 className={`text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider leading-tight ${
                  isProfessionalMode 
                    ? 'text-gray-900 font-sans' 
                    : 'text-white'
                }`} style={!isProfessionalMode ? {
                  fontFamily: "'VT323', monospace",
                  textShadow: '0.05em 0 0 rgba(255, 0, 0, 0.75), -0.025em -0.05em 0 rgba(0, 255, 0, 0.75), 0.025em 0.05em 0 rgba(0, 0, 255, 0.75)'
                } : {}}>
                  {isProfessionalMode ? (
                    <>PROFESSIONAL<br/><span className="text-blue-600">SEO ANALYSIS</span></>
                  ) : (
                    <>SUPERNATURAL<br/><span className="text-green-400">SEO MONITORING</span></>
                  )}
                </h1>
              </div>
              {!isProfessionalMode && <span className="text-8xl md:text-9xl opacity-70">💀</span>}
            </div>
          <div className="absolute top-4 right-4 flex items-center space-x-2">
              {/* Achievements Badge */}
              {achievements.length > 0 && (
                <div className="relative">
                  <button
                    className="px-3 py-2 bg-yellow-900/50 hover:bg-yellow-800/50 rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 transition-all"
                    title={`${achievements.length} achievement${achievements.length > 1 ? 's' : ''} unlocked`}
                  >
                    <span className="text-xl">🏆</span>
                  </button>
                  <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {achievements.length}
                  </span>
                </div>
              )}
              
              {/* Theme Toggle */}
              <button
                onClick={() => {
                  setIsProfessionalMode(!isProfessionalMode);
                  playSound('click');
                }}
                className={`px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                  isProfessionalMode 
                    ? 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-700 shadow-sm' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-red-600/30 hover:border-red-600/50 font-mono'
                }`}
                title={isProfessionalMode ? 'Switch to Costume Mode' : 'Switch to Professional Mode'}
              >
                <span className="text-xs uppercase tracking-wider">
                  {isProfessionalMode ? '💀 Costume' : '💼 Pro'}
                </span>
              </button>
              
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playSound('click');
                }}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  isProfessionalMode 
                    ? 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-red-600/30 hover:border-red-600/50'
                }`}
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                <span className="text-xl">
                  {soundEnabled ? '🔊' : '🔇'}
                </span>
              </button>

              {/* Tutorial Button */}
              <button
                onClick={() => setShowTutorial(true)}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  isProfessionalMode 
                    ? 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-700' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-red-600/30 hover:border-red-600/50'
                }`}
                title="Show tutorial"
              >
                <span className="text-xl">💡</span>
              </button>

              {/* Help Button */}
              <button
                onClick={() => setShowKeyboardShortcuts(true)}
                className={`px-3 py-2 rounded-lg border transition-all ${
                  isProfessionalMode 
                    ? 'bg-white hover:bg-gray-50 border-gray-300 hover:border-gray-400 text-gray-700' 
                    : 'bg-gray-800/50 hover:bg-gray-700/50 border-red-600/30 hover:border-red-600/50'
                }`}
                title="Keyboard shortcuts"
              >
                <span className="text-xl">❓</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <p className={`text-xl mb-4 ${isProfessionalMode ? 'text-gray-700' : 'text-gray-300'}`}>
            {isProfessionalMode ? (
              <>
                Comprehensive SEO analysis powered by AI.
                <br />
                Identify issues, get actionable recommendations, and improve your rankings.
              </>
            ) : (
              <>
                Transform your SEO issues into ghosts, zombies, and monsters. 
                <br />
                Then exorcise them with AI-powered insights! 🔮
              </>
            )}
          </p>
          <p className={`text-sm italic mb-8 ${isProfessionalMode ? 'text-gray-600' : 'text-red-400'}`}>
            {isProfessionalMode ? (
              <>Enter any website URL to analyze. Try: example.com, github.com, or click "Try Demo"</>
            ) : (
              <>💡 Works with any website! Try: example.com, github.com, your-site.com, or click "🎬 Try Demo"</>
            )}
          </p>

          {/* Search Box */}
          <div className={`backdrop-blur-md rounded-lg p-8 ${
            isProfessionalMode 
              ? 'bg-white shadow-xl border border-gray-200' 
              : 'bg-[#1a1a1a]/80 border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]'
          }`}>
            <div className="flex flex-col md:flex-row gap-4">
              {isProfessionalMode ? (
                <>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                    placeholder="Enter website URL (e.g., example.com)"
                    disabled={loading}
                    className="flex-1 px-4 py-3 bg-blue-100 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-blue-900 placeholder-blue-500 font-sans shadow-sm"
                  />
                  <button
                    onClick={analyzeWebsite}
                    disabled={loading || !url}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin inline-block mr-2">⏳</span> Analyzing...
                      </>
                    ) : (
                      <>Analyze Website</>
                    )}
                  </button>
                  <button
                    onClick={loadDemoData}
                    disabled={loading}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors border border-gray-300 whitespace-nowrap"
                  >
                    Try Demo
                  </button>
                </>
              ) : (
                <>
                  <RetroInput
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                    placeholder="Enter website URL (e.g., example.com)"
                    disabled={loading}
                    className="flex-1"
                  />
                  <RetroButton
                    onClick={analyzeWebsite}
                    disabled={loading || !url}
                    variant="primary"
                    className="whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin">🔮</span> EXORCISING...
                      </>
                    ) : (
                      <>EXORCISE</>
                    )}
                  </RetroButton>
                  <RetroButton
                    onClick={loadDemoData}
                    disabled={loading}
                    variant="secondary"
                    className="whitespace-nowrap"
                  >
                    🎬 TRY DEMO
                  </RetroButton>
                </>
              )}
            </div>
            
            {/* Depth Slider */}
            <div className="mt-4">
              <label className={`block text-sm mb-2 ${
                isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'
              }`}>
                {isProfessionalMode ? '📊' : '🕷️'} Crawl Depth: <span className={`font-semibold ${
                  isProfessionalMode ? 'text-blue-600' : 'text-red-400'
                }`}>{depth} page{depth > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                  isProfessionalMode 
                    ? 'bg-gray-200 accent-blue-600' 
                    : 'bg-gray-700 accent-red-700'
                }`}
              />
              <div className={`flex justify-between text-xs mt-1 ${
                isProfessionalMode ? 'text-gray-600' : 'text-gray-500'
              }`}>
                <span>Quick (1)</span>
                <span>Deep (10)</span>
              </div>
            </div>
            
            {/* JavaScript Rendering Toggle */}
            <div className="mt-4 flex items-center justify-center space-x-3">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useJsRendering}
                  onChange={(e) => setUseJsRendering(e.target.checked)}
                  className={`w-5 h-5 rounded focus:ring-2 ${
                    isProfessionalMode 
                      ? 'border-gray-300 bg-white text-blue-600 focus:ring-blue-500' 
                      : 'border-red-600 bg-gray-900 text-red-700 focus:ring-red-600'
                  }`}
                />
                <span className={`text-sm ${
                  isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'
                }`}>
                  {isProfessionalMode ? '⚙️' : '🎭'} Enable JavaScript Rendering <span className={
                    isProfessionalMode ? 'text-blue-600' : 'text-red-400'
                  }>(for React/Vue/Angular sites)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mt-6 p-4 rounded-xl ${
              isProfessionalMode 
                ? 'bg-red-50 border border-red-300 text-red-700 font-sans' 
                : 'bg-red-900/30 border border-red-500/50 text-red-300 animate-spooky-shake'
            }`}>
              <span className="text-2xl mr-2">{isProfessionalMode ? '⚠️' : '💀'}</span>
              {error}
            </div>
          )}
          
          {/* Loading Overlay */}
          {loading && (
            <div className={`mt-8 backdrop-blur-md rounded-2xl p-12 border text-center relative overflow-hidden ${
              isProfessionalMode 
                ? 'bg-white border-gray-200' 
                : 'bg-gray-800/50 border-red-600/30'
            }`}>
              {isProfessionalMode ? (
                <>
                  {/* Professional Loading */}
                  <div className="relative z-10 flex justify-center mb-6">
                    <div className="text-7xl animate-spin">⏳</div>
                  </div>
                  
                  <h3 className="relative z-10 text-2xl font-bold mb-2 animate-pulse text-gray-900 font-sans">
                    Analyzing Website...
                  </h3>
                  <p className="relative z-10 text-gray-600 animate-pulse-glow font-sans">
                    Scanning pages and evaluating SEO performance
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="relative z-10 mt-6 w-full max-w-md mx-auto">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 transition-all duration-300 ease-out"
                        style={{width: `${loadingProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-sm text-blue-600 mt-2 font-sans font-semibold">{Math.round(loadingProgress)}% Complete</p>
                  </div>
                  
                  {/* Loading Steps */}
                  <div className="relative z-10 mt-6 flex justify-center space-x-4">
                    <span className={`text-3xl transition-opacity ${loadingProgress > 25 ? 'opacity-100' : 'opacity-30'}`}>✓</span>
                    <span className={`text-3xl transition-opacity ${loadingProgress > 50 ? 'opacity-100' : 'opacity-30'}`}>✓</span>
                    <span className={`text-3xl transition-opacity ${loadingProgress > 75 ? 'opacity-100' : 'opacity-30'}`}>✓</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Ritual Circle Background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <div className="w-64 h-64 border-4 border-red-600 rounded-full animate-spin-slow"></div>
                    <div className="absolute w-48 h-48 border-4 border-pink-500 rounded-full animate-spin-reverse"></div>
                    <div className="absolute w-32 h-32 border-4 border-indigo-500 rounded-full animate-spin-slow"></div>
                  </div>
                  
                  {/* Candles */}
                  <div className="relative z-10 flex justify-center space-x-8 mb-6">
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl ${loadingProgress > 20 ? 'animate-flicker' : 'opacity-30'}`}>🕯️</span>
                      <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-transparent"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl ${loadingProgress > 40 ? 'animate-flicker' : 'opacity-30'}`}>🕯️</span>
                      <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-transparent"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-7xl animate-ghost-float">🔮</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl ${loadingProgress > 60 ? 'animate-flicker' : 'opacity-30'}`}>🕯️</span>
                      <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-transparent"></div>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className={`text-6xl ${loadingProgress > 80 ? 'animate-flicker' : 'opacity-30'}`}>🕯️</span>
                      <div className="w-1 h-8 bg-gradient-to-b from-orange-400 to-transparent"></div>
                    </div>
                  </div>
                  
                  <h3 className="relative z-10 text-2xl font-bold mb-2 animate-pulse">Performing Dark Rituals...</h3>
                  <p className="relative z-10 text-gray-400 animate-pulse-glow">Summoning SEO spirits from the digital realm</p>
                  
                  {/* Progress Bar */}
                  <div className="relative z-10 mt-6 w-full max-w-md mx-auto">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-600 via-pink-500 to-red-600 transition-all duration-300 ease-out"
                        style={{width: `${loadingProgress}%`}}
                      ></div>
                    </div>
                    <p className="text-sm text-red-300 mt-2">{Math.round(loadingProgress)}% Complete</p>
                  </div>
                  
                  {/* Floating Spirits */}
                  <div className="relative z-10 mt-6 flex justify-center space-x-4">
                    <span className="text-4xl animate-ghost-float">👻</span>
                    <span className="text-4xl animate-float" style={{animationDelay: '0.5s'}}>🦇</span>
                    <span className="text-4xl animate-ghost-float" style={{animationDelay: '1s'}}>👻</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Warning Banner for JS Rendering */}
            {result.warning && (
              <div className="bg-yellow-900/30 backdrop-blur-md rounded-xl p-6 border border-yellow-500/50 shadow-xl mb-6 animate-fade-in-up">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">⚠️</span>
                  <div className="flex-1">
                    <h4 className="text-yellow-300 font-bold text-lg mb-2">JavaScript Rendering Notice</h4>
                    <p className="text-yellow-100/90 leading-relaxed">{result.warning}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Haunting Score */}
            <div className={`backdrop-blur-md rounded-2xl p-8 shadow-2xl mb-8 animate-fade-in-up relative overflow-hidden ${
              isProfessionalMode 
                ? 'bg-white border border-gray-200' 
                : 'bg-gradient-to-r from-red-950/50 to-pink-900/50 border border-red-600/30'
            }`}>
              {/* Animated background effect - Costume Mode Only */}
              {!isProfessionalMode && (
                <div className="absolute inset-0 bg-gradient-to-r from-red-700/10 to-pink-600/10 animate-pulse-glow"></div>
              )}
              
              <div className="text-center relative z-10">
                <h3 className={`text-3xl font-bold mb-4 flex items-center justify-center gap-3 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : ''
                }`}>
                  {isProfessionalMode ? (
                    <>
                      <span>📊</span>
                      <span>SEO Health Score</span>
                      <span>📊</span>
                    </>
                  ) : (
                    <>
                      <span className="animate-float">💀</span>
                      <span>Haunting Score</span>
                      <span className="animate-float" style={{animationDelay: '0.5s'}}>💀</span>
                    </>
                  )}
                </h3>
                {/* Circular Progress Meter */}
                <div className="flex items-center justify-center space-x-8 my-6">
                  {/* Animated Circle */}
                  <div className="relative w-48 h-48">
                    <svg className="transform -rotate-90 w-48 h-48">
                      {/* Background circle */}
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-gray-700"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - (isProfessionalMode ? (100 - animatedScore) : animatedScore) / 100)}`}
                        className={`transition-all duration-1000 ease-out ${
                          isProfessionalMode
                            ? (result.haunting_score < 20 ? 'text-green-600' :
                               result.haunting_score < 40 ? 'text-blue-600' :
                               result.haunting_score < 60 ? 'text-yellow-600' :
                               result.haunting_score < 80 ? 'text-orange-600' :
                               'text-red-600')
                            : (result.haunting_score < 20 ? 'text-green-400' :
                               result.haunting_score < 40 ? 'text-blue-400' :
                               result.haunting_score < 60 ? 'text-yellow-400' :
                               result.haunting_score < 80 ? 'text-orange-400' :
                               'text-red-400')
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-5xl font-bold ${
                        isProfessionalMode 
                          ? `bg-gradient-to-r ${
                              result.haunting_score < 20 ? 'from-green-600 to-emerald-600' :
                              result.haunting_score < 40 ? 'from-blue-600 to-cyan-600' :
                              result.haunting_score < 60 ? 'from-yellow-600 to-orange-600' :
                              result.haunting_score < 80 ? 'from-orange-600 to-red-600' :
                              'from-red-600 to-pink-600'
                            } bg-clip-text text-transparent`
                          : `bg-gradient-to-r ${
                              result.haunting_score < 20 ? 'from-green-400 to-emerald-400' :
                              result.haunting_score < 40 ? 'from-blue-400 to-cyan-400' :
                              result.haunting_score < 60 ? 'from-yellow-400 to-orange-400' :
                              result.haunting_score < 80 ? 'from-orange-400 to-red-400' :
                              'from-red-400 to-pink-400'
                            } bg-clip-text text-transparent`
                      }`}>
                        {isProfessionalMode ? (100 - animatedScore) : animatedScore}
                      </span>
                      <span className={`text-sm uppercase tracking-wider ${isProfessionalMode ? 'text-gray-500' : 'text-gray-400'}`}>/ 100</span>
                    </div>
                  </div>

                  {/* Stats Breakdown */}
                  <div className="text-left space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{isProfessionalMode ? '🔴' : '👻'}</span>
                      <div>
                        <p className={`text-sm ${isProfessionalMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {isProfessionalMode ? 'Critical' : 'Ghosts'}
                        </p>
                        <p className={`text-xl font-bold ${isProfessionalMode ? 'text-red-600' : 'text-red-300'}`}>
                          {result.entities.filter((e: any) => e.type === 'ghost').length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{isProfessionalMode ? '🟡' : '🧟'}</span>
                      <div>
                        <p className={`text-sm ${isProfessionalMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {isProfessionalMode ? 'Warnings' : 'Zombies'}
                        </p>
                        <p className={`text-xl font-bold ${isProfessionalMode ? 'text-yellow-600' : 'text-gray-300'}`}>
                          {result.entities.filter((e: any) => e.type === 'zombie').length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{isProfessionalMode ? '🔵' : '👹'}</span>
                      <div>
                        <p className={`text-sm ${isProfessionalMode ? 'text-gray-600' : 'text-gray-400'}`}>
                          {isProfessionalMode ? 'Competitive' : 'Monsters'}
                        </p>
                        <p className={`text-xl font-bold ${isProfessionalMode ? 'text-blue-600' : 'text-red-300'}`}>
                          {result.entities.filter((e: any) => e.type === 'monster').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex justify-center gap-3 mb-6 flex-wrap">
                  <button
                    onClick={() => {
                      const score = isProfessionalMode ? (100 - result.haunting_score) : result.haunting_score;
                      const text = isProfessionalMode 
                        ? `I just scored ${score}/100 on SEO health! 🎯 Check your site's SEO at`
                        : `I just exorcised ${result.entities.length} SEO issues from my website! 👻 Haunting Score: ${score}/100. Check yours at`;
                      const url = 'https://rankbeacon-exorcist.vercel.app';
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
                      playSound('click');
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      isProfessionalMode
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    Share on X
                  </button>
                  <button
                    onClick={() => {
                      const score = isProfessionalMode ? (100 - result.haunting_score) : result.haunting_score;
                      const text = isProfessionalMode
                        ? `Just analyzed my website's SEO health and scored ${score}/100! 📊 RankBeacon SEO Exorcist provides actionable insights in seconds.`
                        : `Just used RankBeacon SEO Exorcist to analyze my site! 👻 Found ${result.entities.length} issues to fix. Haunting Score: ${score}/100`;
                      const url = 'https://rankbeacon-exorcist.vercel.app';
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`, '_blank');
                      playSound('click');
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      isProfessionalMode
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Share on LinkedIn
                  </button>
                  <button
                    onClick={() => {
                      const url = 'https://rankbeacon-exorcist.vercel.app';
                      navigator.clipboard.writeText(url);
                      playSound('victory');
                      // Show toast notification
                      const toast = document.createElement('div');
                      toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up ${
                        isProfessionalMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-green-300 border border-green-500'
                      }`;
                      toast.textContent = '✓ Link copied to clipboard!';
                      document.body.appendChild(toast);
                      setTimeout(() => toast.remove(), 3000);
                    }}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                      isProfessionalMode
                        ? 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Link
                  </button>
                </div>

                {/* ROI Calculator & Performance Score */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* ROI Calculator */}
                  <div className="bg-gray-900/40 border border-gray-600/30 rounded-lg p-4">
                    <h4 className={`font-bold mb-3 flex items-center ${isProfessionalMode ? 'text-gray-800' : 'text-gray-200'}`}>
                      <span className={`mr-2 ${isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}`}>$</span>
                      Potential ROI
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>Current Traffic:</span>
                        <span className={`font-semibold ${isProfessionalMode ? 'text-gray-900' : 'text-white'}`}>~1,000/month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>Potential Increase:</span>
                        <span className={`font-semibold ${isProfessionalMode ? 'text-gray-800' : 'text-gray-300'}`}>+{Math.round((100 - result.haunting_score) * 0.5)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>New Traffic:</span>
                        <span className={`font-bold ${isProfessionalMode ? 'text-gray-800' : 'text-gray-300'}`}>~{Math.round(1000 * (1 + (100 - result.haunting_score) * 0.005))}/month</span>
                      </div>
                      <div className="pt-2 border-t border-gray-600/30">
                        <div className="flex justify-between">
                          <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>Est. Revenue Impact:</span>
                          <span className={`font-bold text-lg ${isProfessionalMode ? 'text-gray-900' : 'text-white'}`}>+${Math.round((100 - result.haunting_score) * 50)}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="bg-gray-900/40 border border-gray-600/30 rounded-lg p-4">
                    <h4 className={`font-bold mb-3 flex items-center ${isProfessionalMode ? 'text-gray-800' : 'text-gray-200'}`}>
                      <span className={`mr-2 ${isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}`}>▲</span>
                      Performance Impact
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>Page Speed:</span>
                        <span className={`font-semibold ${
                          isProfessionalMode 
                            ? (result.haunting_score > 60 ? 'text-gray-800' : 'text-gray-900')
                            : (result.haunting_score > 60 ? 'text-gray-300' : 'text-white')
                        }`}>
                          {result.haunting_score > 60 ? 'Needs Work' : 'Good'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>Mobile Friendly:</span>
                        <span className={`font-semibold ${isProfessionalMode ? 'text-gray-900' : 'text-white'}`}>Yes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>Core Web Vitals:</span>
                        <span className={`font-semibold ${
                          isProfessionalMode
                            ? (result.haunting_score > 50 ? 'text-gray-800' : 'text-gray-900')
                            : (result.haunting_score > 50 ? 'text-gray-300' : 'text-white')
                        }`}>
                          {result.haunting_score > 50 ? 'Fair' : 'Good'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-gray-600/30">
                        <div className="flex justify-between">
                          <span className={isProfessionalMode ? 'text-gray-700' : 'text-gray-400'}>SEO Impact:</span>
                          <span className={`font-bold text-lg ${
                            isProfessionalMode
                              ? (result.haunting_score < 40 ? 'text-gray-900' : result.haunting_score < 70 ? 'text-gray-800' : 'text-gray-800')
                              : (result.haunting_score < 40 ? 'text-white' : result.haunting_score < 70 ? 'text-gray-300' : 'text-gray-300')
                          }`}>
                            {result.haunting_score < 40 ? 'Excellent' :
                             result.haunting_score < 70 ? 'Moderate' : 'Significant'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Button */}
                <div className="flex justify-center space-x-4 mb-4">
                  <button
                    onClick={exportReport}
                    className={`px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 ${
                      isProfessionalMode 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white font-sans' 
                        : 'bg-gray-900 hover:bg-black text-red-400 border-2 border-red-600/50 hover:border-red-500 font-mono hover:shadow-red-600/50'
                    }`}
                  >
                    <span>{isProfessionalMode ? '📥' : '📜'}</span>
                    <span>{isProfessionalMode ? 'Export Report' : 'Export Exorcism'}</span>
                  </button>
                  <button
                    onClick={() => {
                      const shareUrl = `${window.location.origin}?url=${encodeURIComponent(result.url)}`;
                      navigator.clipboard.writeText(shareUrl);
                      playSound('click');
                      alert('📋 Share link copied to clipboard!');
                    }}
                    className={`px-6 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2 ${
                      isProfessionalMode 
                        ? 'bg-green-600 hover:bg-green-700 text-white font-sans' 
                        : 'bg-gray-900 hover:bg-black text-gray-300 border-2 border-gray-600/50 hover:border-gray-500 font-mono hover:shadow-gray-600/50'
                    }`}
                  >
                    <span>{isProfessionalMode ? '🔗' : '🔮'}</span>
                    <span>{isProfessionalMode ? 'Share Results' : 'Share Haunting'}</span>
                  </button>
                </div>
                <div className={`mt-6 inline-block px-6 py-3 rounded-full text-lg font-semibold uppercase tracking-wider ${
                  isProfessionalMode ? 'font-sans' : 'font-mono'
                } ${
                  result.haunting_score < 20 ? (isProfessionalMode ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-500/20 text-gray-300 border border-gray-500/50') :
                  result.haunting_score < 40 ? (isProfessionalMode ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-blue-500/20 text-blue-300 border border-blue-500/50') :
                  result.haunting_score < 60 ? (isProfessionalMode ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50') :
                  result.haunting_score < 80 ? (isProfessionalMode ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-orange-500/20 text-orange-300 border border-orange-500/50') :
                  (isProfessionalMode ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse')
                }`}>
                  {isProfessionalMode ? (
                    result.haunting_score < 20 ? '✓ Excellent SEO Health' :
                    result.haunting_score < 40 ? '✓ Good SEO Health' :
                    result.haunting_score < 60 ? '⚠ Fair SEO Health' :
                    result.haunting_score < 80 ? '⚠ Poor SEO Health' :
                    '⚠ Critical SEO Issues'
                  ) : (
                    result.haunting_score < 20 ? '✨ Barely Haunted!' :
                    result.haunting_score < 40 ? '👻 Mildly Spooky' :
                    result.haunting_score < 60 ? '😱 Moderately Haunted' :
                    result.haunting_score < 80 ? '💀 Very Haunted!' :
                    '🔥 Extremely Haunted!'
                  )}
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            {result.entities && result.entities.length > 0 && (
              <div className={`backdrop-blur-md rounded-xl p-6 mb-8 ${
                isProfessionalMode 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-gradient-to-r from-gray-900/30 to-gray-800/30 border border-gray-500/30'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{isProfessionalMode ? '✓' : '📊'}</span>
                    <div>
                      <h3 className={`text-xl font-bold ${
                        isProfessionalMode ? 'text-green-700 font-sans' : 'text-gray-200'
                      }`}>{isProfessionalMode ? 'Resolution Progress' : 'Exorcism Progress'}</h3>
                      <p className={`text-sm ${
                        isProfessionalMode ? 'text-gray-600' : 'text-gray-400'
                      }`}>Track your SEO fixes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold ${
                      isProfessionalMode ? 'text-green-700' : 'text-gray-200'
                    }`}>
                      {fixedIssues.size} / {result.entities.length}
                    </div>
                    <p className={`text-sm ${
                      isProfessionalMode ? 'text-gray-600' : 'text-gray-400'
                    }`}>Issues Resolved</p>
                  </div>
                </div>
                <div className={`mt-4 rounded-full h-4 overflow-hidden ${
                  isProfessionalMode ? 'bg-gray-200' : 'bg-gray-900/50'
                }`}>
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500 ease-out"
                    style={{width: `${(fixedIssues.size / result.entities.length) * 100}%`}}
                  ></div>
                </div>
                {fixedIssues.size === result.entities.length && (
                  <div className="mt-4 text-center animate-bounce">
                    <span className="text-4xl">🎉</span>
                    <p className="text-green-300 font-bold mt-2">All issues exorcised! Your site is clean! ✨</p>
                  </div>
                )}
              </div>
            )}

            {/* Issue Priority Matrix */}
            {result.entities && result.entities.length > 0 && (
              <div className={`backdrop-blur-md rounded-xl p-8 mb-8 ${
                isProfessionalMode 
                  ? 'bg-white border-2 border-blue-200' 
                  : 'bg-gray-800/50 border border-red-600/30'
              }`}>
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className={`mr-3 ${isProfessionalMode ? 'text-blue-500' : 'text-gray-400'}`}>🎯</span>
                  <span className={isProfessionalMode ? 'text-blue-900' : 'text-gray-200'}>Issue Priority Matrix</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* High Impact, Low Effort - FIX FIRST! */}
                  <div className={`border-2 rounded-lg p-4 ${
                    isProfessionalMode 
                      ? 'bg-blue-50 border-blue-300' 
                      : 'bg-gray-900/30 border-red-600/40'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${isProfessionalMode ? 'text-blue-900' : 'text-red-300'}`}>🚀 Quick Wins</h4>
                      <span className={`text-xs px-2 py-1 rounded ${isProfessionalMode ? 'bg-blue-200 text-blue-800' : 'bg-red-900/30 text-red-300'}`}>High Impact, Low Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => (e.severity === 'high' || e.severity === 'critical') && e.type !== 'monster')
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className={`text-sm flex items-start space-x-2 ${isProfessionalMode ? 'text-blue-800' : 'text-gray-300'}`}>
                            {!isProfessionalMode && <span className="text-red-400">☠</span>}
                            {isProfessionalMode && <span className="text-blue-500">•</span>}
                            <span>{isProfessionalMode ? stripEmoji(e.title) : e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => (e.severity === 'high' || e.severity === 'critical') && e.type !== 'monster').length === 0 && (
                        <p className="text-sm text-gray-400 italic">No quick wins found! 🎉</p>
                      )}
                    </div>
                  </div>

                  {/* High Impact, High Effort - PLAN THESE */}
                  <div className={`border-2 rounded-lg p-4 ${
                    isProfessionalMode 
                      ? 'bg-blue-50/50 border-blue-200' 
                      : 'bg-gray-900/30 border-gray-600/40'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${isProfessionalMode ? 'text-blue-800' : 'text-gray-200'}`}>📋 Major Projects</h4>
                      <span className={`text-xs px-2 py-1 rounded ${isProfessionalMode ? 'bg-blue-100 text-blue-700' : 'bg-gray-700/30 text-gray-300'}`}>High Impact, High Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => e.type === 'monster' || (e.severity === 'critical' && e.type === 'specter'))
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className={`text-sm flex items-start space-x-2 ${isProfessionalMode ? 'text-blue-700' : 'text-gray-300'}`}>
                            <span className={isProfessionalMode ? 'text-blue-400' : 'text-gray-500'}>•</span>
                            <span>{isProfessionalMode ? stripEmoji(e.title) : e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => e.type === 'monster').length === 0 && (
                        <p className="text-sm text-gray-400 italic">No major projects needed!</p>
                      )}
                    </div>
                  </div>

                  {/* Low Impact, Low Effort - FILL TIME */}
                  <div className={`border-2 rounded-lg p-4 ${
                    isProfessionalMode 
                      ? 'bg-white border-blue-100' 
                      : 'bg-gray-900/30 border-gray-700/40'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${isProfessionalMode ? 'text-blue-700' : 'text-gray-400'}`}>⚡ Fill Time</h4>
                      <span className={`text-xs px-2 py-1 rounded ${isProfessionalMode ? 'bg-blue-50 text-blue-600' : 'bg-gray-800/30 text-gray-400'}`}>Low Impact, Low Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => e.severity === 'low')
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className={`text-sm flex items-start space-x-2 ${isProfessionalMode ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={isProfessionalMode ? 'text-blue-300' : 'text-gray-600'}>•</span>
                            <span>{isProfessionalMode ? stripEmoji(e.title) : e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => e.severity === 'low').length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nothing here!</p>
                      )}
                    </div>
                  </div>

                  {/* Low Impact, High Effort - AVOID */}
                  <div className={`border-2 rounded-lg p-4 ${
                    isProfessionalMode 
                      ? 'bg-white border-blue-100' 
                      : 'bg-gray-900/30 border-gray-700/40'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-bold ${isProfessionalMode ? 'text-blue-700' : 'text-gray-400'}`}>⏸️ Avoid/Defer</h4>
                      <span className={`text-xs px-2 py-1 rounded ${isProfessionalMode ? 'bg-blue-50 text-blue-600' : 'bg-gray-800/30 text-gray-400'}`}>Low Impact, High Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => e.severity === 'medium' && e.type === 'phantom')
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className={`text-sm flex items-start space-x-2 ${isProfessionalMode ? 'text-blue-600' : 'text-gray-400'}`}>
                            <span className={isProfessionalMode ? 'text-blue-300' : 'text-gray-600'}>•</span>
                            <span>{isProfessionalMode ? stripEmoji(e.title) : e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => e.severity === 'medium' && e.type === 'phantom').length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nothing to avoid!</p>
                      )}
                    </div>
                  </div>
                </div>
                <p className={`text-sm text-center ${isProfessionalMode ? 'text-gray-600' : 'text-gray-400'}`}>
                  <span className="text-gray-500">💀</span> Tip: Focus on Quick Wins first for maximum impact with minimum effort!
                </p>
              </div>
            )}

            {/* Entities Grid with Guidance Mode */}
            {result.entities && result.entities.length > 0 && (
              <div className="space-y-4 mb-8">
                {result.entities.map((entity: any, index: number) => {
                  const isExpanded = expandedIssue === index;
                  const isFixed = fixedIssues.has(index);
                  const instructions = getFixInstructions(entity);
                  
                  return (
                    <div
                      key={index}
                      className={`backdrop-blur-md rounded-xl border transition-all animate-fade-in-up ${
                        isProfessionalMode 
                          ? (isFixed 
                              ? 'bg-gray-50 border-green-300 opacity-70' 
                              : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-lg')
                          : (isFixed 
                              ? 'bg-gray-800/50 border-green-500/50 opacity-60' 
                              : 'bg-gray-800/50 border-red-600/30 hover:border-red-600/60 hover:shadow-2xl hover:shadow-red-600/20 hover:scale-[1.02] hover:animate-spooky-shake-subtle')
                      }`}
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      {/* Issue Header */}
                      <div 
                        className="p-6 cursor-pointer"
                        onClick={() => !isFixed && toggleIssue(index)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            {/* Checkbox */}
                            <div className="pt-1">
                              <input
                                type="checkbox"
                                checked={isFixed}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  if (!isFixed) markAsFixed(index);
                                }}
                                className="w-6 h-6 rounded border-2 border-red-600 bg-gray-900 text-green-500 focus:ring-2 focus:ring-red-600 cursor-pointer"
                              />
                            </div>
                            
                            {/* Icon and Content */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`text-4xl ${isFixed ? 'grayscale' : ''}`}>
                                  {isProfessionalMode ? (
                                    entity.type === 'ghost' ? '🔴' :
                                    entity.type === 'zombie' ? '🟡' :
                                    entity.type === 'monster' ? '🔵' :
                                    entity.type === 'specter' ? '⚙️' : '📊'
                                  ) : (
                                    entity.type === 'ghost' ? '👻' :
                                    entity.type === 'zombie' ? '🧟' :
                                    entity.type === 'monster' ? '👹' :
                                    entity.type === 'specter' ? '💀' : '🌫️'
                                  )}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={`text-lg font-semibold ${
                                      isProfessionalMode ? 'font-sans' : ''
                                    } ${
                                      isFixed 
                                        ? (isProfessionalMode ? 'line-through text-gray-400' : 'line-through text-gray-500') 
                                        : (isProfessionalMode ? 'text-gray-900' : '')
                                    }`}>
                                      {entity.title}
                                    </h4>
                                    {isFixed && <span className={isProfessionalMode ? 'text-green-600' : 'text-gray-400'}>✓</span>}
                                    {/* Educational Tooltip */}
                                    {!isFixed && (
                                      <div className="group relative">
                                        <span className="text-red-400 cursor-help text-sm">ℹ️</span>
                                        <div className="invisible group-hover:visible absolute left-0 top-6 z-50 w-80 bg-red-950/95 backdrop-blur-md border-2 border-red-600 rounded-lg p-4 shadow-2xl shadow-red-600/50 animate-fade-in">
                                          <h5 className="font-bold text-red-300 mb-2 flex items-center">
                                            <span className="mr-2">🎓</span>
                                            Why This Matters
                                          </h5>
                                          <p className="text-sm text-gray-200 mb-2">
                                            {getEducationalInfo(entity.type, entity.severity).why}
                                          </p>
                                          <div className="border-t border-red-600/30 pt-2 mt-2">
                                            <p className="text-xs text-red-300 font-semibold mb-1">📊 Impact:</p>
                                            <p className="text-xs text-gray-300">{getEducationalInfo(entity.type, entity.severity).impact}</p>
                                          </div>
                                          <div className="border-t border-red-600/30 pt-2 mt-2">
                                            <p className="text-xs text-red-300 font-semibold mb-1">🎯 Ranking Effect:</p>
                                            <p className="text-xs text-gray-300">{getEducationalInfo(entity.type, entity.severity).ranking}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <p className={`text-sm ${
                                    isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                                  }`}>{entity.description}</p>
                                </div>
                              </div>
                              
                              {entity.url && (
                                <div className="mt-2 ml-14">
                                  <p className={`text-xs mb-1 ${isProfessionalMode ? 'text-gray-600' : 'text-gray-500'}`}>📍 Location:</p>
                                  <p className={`text-xs font-mono break-all px-2 py-1 rounded ${
                                    isProfessionalMode 
                                      ? 'text-blue-600 bg-blue-50 border border-blue-200' 
                                      : 'text-red-300 bg-gray-900/50'
                                  }`}>
                                    {entity.url}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Severity Badge and Expand Arrow */}
                          <div className="flex items-center space-x-3 ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              isProfessionalMode ? 'font-sans' : ''
                            } ${
                              entity.severity === 'critical' ? (isProfessionalMode ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-red-500/20 text-red-300 border border-red-500/50') :
                              entity.severity === 'high' ? (isProfessionalMode ? 'bg-orange-100 text-orange-700 border border-orange-300' : 'bg-orange-500/20 text-orange-300 border border-orange-500/50') :
                              entity.severity === 'medium' ? (isProfessionalMode ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50') :
                              (isProfessionalMode ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-blue-500/20 text-blue-300 border border-blue-500/50')
                            }`}>
                              {entity.severity.toUpperCase()}
                            </span>
                            {!isFixed && (
                              <span className={`text-2xl transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                ⬇️
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Guidance Section */}
                      {isExpanded && !isFixed && (
                        <div className="border-t border-red-600/30 p-6 bg-gray-900/30">
                          <div className="space-y-6">
                            {/* Quick Summary */}
                            <div className={`rounded-lg p-4 ${
                              isProfessionalMode 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'bg-red-950/20 border border-red-600/30'
                            }`}>
                              <p className={`text-sm font-semibold mb-2 ${
                                isProfessionalMode ? 'text-blue-700 font-sans' : 'text-red-300'
                              }`}>{isProfessionalMode ? '💡' : '🕯️'} Quick Fix:</p>
                              <p className={`text-sm ${
                                isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'
                              }`}>{entity.fix_suggestion}</p>
                            </div>

                            {/* Step-by-Step Instructions */}
                            <div>
                              <h5 className={`text-lg font-semibold mb-3 flex items-center ${
                                isProfessionalMode ? 'text-blue-700 font-sans' : 'text-red-300'
                              }`}>
                                <span className="mr-2">📋</span>
                                Step-by-Step Guide
                              </h5>
                              <ol className="space-y-2">
                                {instructions.steps.map((step: string, i: number) => (
                                  <li key={i} className="flex items-start space-x-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                      isProfessionalMode ? 'bg-blue-600 text-white' : 'bg-red-700'
                                    }`}>
                                      {i + 1}
                                    </span>
                                    <span className={`text-sm pt-0.5 ${
                                      isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'
                                    }`}>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Context-Specific Suggestion (if available from backend) */}
                            {entity.suggested_code && (
                              <div className={`rounded-lg p-4 mb-4 ${
                                isProfessionalMode 
                                  ? 'bg-blue-50 border border-blue-200' 
                                  : 'bg-green-900/20 border border-green-500/30'
                              }`}>
                                <h5 className={`text-lg font-semibold mb-2 flex items-center ${
                                  isProfessionalMode ? 'text-blue-700 font-sans' : 'text-green-300'
                                }`}>
                                  <span className="mr-2">✨</span>
                                  Suggested Fix for Your Content
                                </h5>
                                {entity.current_content && (
                                  <div className="mb-3">
                                    <p className="text-xs text-gray-400 mb-1">Current:</p>
                                    <p className="text-sm text-gray-300 bg-gray-900/50 px-3 py-2 rounded">{entity.current_content}</p>
                                  </div>
                                )}
                                {entity.image_examples && entity.image_examples.length > 0 && (
                                  <div className="mb-3">
                                    <p className={`text-xs mb-2 ${
                                      isProfessionalMode ? 'text-gray-600' : 'text-gray-400'
                                    }`}>Images found:</p>
                                    {entity.image_examples.map((img: any, i: number) => (
                                      <div key={i} className={`text-xs px-3 py-2 rounded mb-2 ${
                                        isProfessionalMode 
                                          ? 'text-gray-700 bg-gray-50' 
                                          : 'text-gray-300 bg-gray-900/50'
                                      }`}>
                                        <p className={`font-mono ${
                                          isProfessionalMode ? 'text-blue-600' : 'text-red-300'
                                        }`}>{img.src}</p>
                                        <p className={`mt-1 ${
                                          isProfessionalMode ? 'text-blue-700' : 'text-green-300'
                                        }`}>→ Suggested alt: "{img.suggested_alt}"</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="relative">
                                  <pre className={`rounded-lg p-4 overflow-x-auto text-sm ${
                                    isProfessionalMode 
                                      ? 'bg-gray-900 border border-blue-300' 
                                      : 'bg-gray-950 border border-green-700'
                                  }`}>
                                    <code className={isProfessionalMode ? 'text-blue-400' : 'text-gray-400'}>
                                      {entity.suggested_code}
                                    </code>
                                  </pre>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(entity.suggested_code);
                                      playSound('victory');
                                      // Show toast notification
                                      const toast = document.createElement('div');
                                      toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-up ${
                                        isProfessionalMode ? 'bg-blue-600 text-white' : 'bg-gray-800 text-green-300 border border-green-500'
                                      }`;
                                      toast.textContent = '✓ Code copied to clipboard!';
                                      document.body.appendChild(toast);
                                      setTimeout(() => toast.remove(), 3000);
                                    }}
                                    className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold transition-all hover:scale-105 ${
                                      isProfessionalMode 
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                  >
                                    📋 Copy Code
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* General Code Example */}
                            <div>
                              <h5 className={`text-lg font-semibold mb-3 flex items-center ${
                                isProfessionalMode ? 'text-blue-700 font-sans' : 'text-red-300'
                              }`}>
                                <span className="mr-2">💻</span>
                                General Code Examples
                              </h5>
                              <div className="relative">
                                <pre className={`rounded-lg p-4 overflow-x-auto text-sm ${
                                  isProfessionalMode 
                                    ? 'bg-gray-900 border border-gray-300' 
                                    : 'bg-gray-950 border border-gray-700'
                                }`}>
                                  <code className={isProfessionalMode ? 'text-blue-400' : 'text-gray-400'}>
                                    {instructions.code}
                                  </code>
                                </pre>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(instructions.code);
                                    playSound('click');
                                  }}
                                  className={`absolute top-2 right-2 px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                    isProfessionalMode 
                                      ? 'bg-blue-600 hover:bg-blue-700' 
                                      : 'bg-gray-700 hover:bg-gray-600'
                                  }`}
                                >
                                  📋 Copy
                                </button>
                              </div>
                            </div>

                            {/* Documentation Link */}
                            <div>
                              <h5 className={`text-lg font-semibold mb-3 flex items-center ${
                                isProfessionalMode ? 'text-blue-700 font-sans' : 'text-red-300'
                              }`}>
                                <span className="mr-2">📚</span>
                                Learn More
                              </h5>
                              <a
                                href={instructions.docs}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 underline"
                              >
                                <span>Official Google Documentation</span>
                                <span>↗️</span>
                              </a>
                            </div>

                            {/* Mark as Fixed Button */}
                            <div className={`pt-4 ${
                              isProfessionalMode ? 'border-t border-gray-200' : 'border-t border-red-600/30'
                            }`}>
                              <button
                                onClick={() => markAsFixed(index)}
                                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 ${
                                  isProfessionalMode 
                                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/50 font-sans' 
                                    : 'bg-gray-700 hover:bg-gray-600 hover:shadow-gray-500/50 font-mono'
                                }`}
                              >
                                <span>✓</span>
                                <span>Mark as Fixed</span>
                                {!isProfessionalMode && <span>🎉</span>}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Victory Animation Overlay */}
            {showVictory && (
              <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
                <div className="animate-bounce">
                  <div className="text-9xl animate-spin-slow">🎉</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl animate-ping">✨</div>
                </div>
                {/* Confetti Effect */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-2xl animate-confetti"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    >
                      {['🎉', '✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 5)]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievement Notification */}
            {showAchievement && (
              <div className="fixed top-20 right-4 z-50 animate-slide-in-right">
                <div className="bg-gradient-to-r from-yellow-900/90 to-orange-900/90 backdrop-blur-md rounded-xl p-6 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/50 max-w-sm">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl animate-bounce">🏆</div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-yellow-300 mb-1">
                        {showAchievement.split('|')[0]}
                      </h4>
                      <p className="text-sm text-yellow-100">
                        {showAchievement.split('|')[1]}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 h-1 bg-yellow-900 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 animate-progress-bar"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Full-Screen Exorcism Animation */}
            {showFullExorcism && (
              <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center animate-fade-in">
                {/* Light beams */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute bottom-0 left-1/2 w-1 bg-gradient-to-t from-yellow-400 via-red-600 to-transparent animate-light-beam"
                      style={{
                        height: '200%',
                        transform: `rotate(${i * 30}deg) translateX(-50%)`,
                        transformOrigin: 'bottom center',
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                  ))}
                </div>

                {/* Flying away ghosts */}
                <div className="absolute inset-0">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-6xl animate-ghost-fly-away"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${50 + Math.random() * 50}%`,
                        animationDelay: `${i * 0.2}s`
                      }}
                    >
                      👻
                    </div>
                  ))}
                </div>

                {/* Center message */}
                <div className="relative z-10 text-center animate-scale-in">
                  <div className="text-9xl mb-8 animate-pulse">✨</div>
                  <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                    EXORCISM COMPLETE!
                  </h2>
                  <p className="text-3xl text-red-300 mb-8">
                    All SEO demons have been banished! 🎉
                  </p>
                  <div className="flex justify-center space-x-4 text-6xl">
                    <span className="animate-bounce" style={{animationDelay: '0s'}}>🎊</span>
                    <span className="animate-bounce" style={{animationDelay: '0.1s'}}>🎉</span>
                    <span className="animate-bounce" style={{animationDelay: '0.2s'}}>✨</span>
                    <span className="animate-bounce" style={{animationDelay: '0.3s'}}>🎊</span>
                    <span className="animate-bounce" style={{animationDelay: '0.4s'}}>🎉</span>
                  </div>
                </div>

                {/* Particle explosion */}
                <div className="absolute inset-0">
                  {[...Array(50)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-3xl animate-particle-explode"
                      style={{
                        left: '50%',
                        top: '50%',
                        animationDelay: `${i * 0.05}s`,
                        '--angle': `${i * 7.2}deg`
                      } as any}
                    >
                      {['⭐', '✨', '💫', '🌟', '💥'][i % 5]}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className={`backdrop-blur-md rounded-xl p-8 ${
                isProfessionalMode 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-gray-800/50 border border-red-600/30'
              }`}>
                <h3 className={`text-2xl font-bold mb-6 flex items-center ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : ''
                }`}>
                  <span className="mr-3">{isProfessionalMode ? '📋' : '📜'}</span>
                  {isProfessionalMode ? 'Recommendations' : 'Exorcism Recommendations'}
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className={`flex items-start space-x-3 ${
                      isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'
                    }`}>
                      <span className={`mt-1 ${
                        isProfessionalMode ? 'text-blue-600' : 'text-red-400'
                      }`}>{isProfessionalMode ? '✓' : '🕯️'}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        {!result && !loading && (
          <>
            <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
              {isProfessionalMode ? (
                <>
                  <div className="text-center p-8 bg-white backdrop-blur-sm rounded-xl border border-gray-200 hover:border-blue-400 transition-all hover:shadow-xl">
                    <div className="text-6xl mb-4">🔴</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 font-sans">Critical Issues</h3>
                    <p className="text-gray-600 font-sans">Identify 404 errors and broken links affecting your site</p>
                  </div>
                  <div className="text-center p-8 bg-white backdrop-blur-sm rounded-xl border border-gray-200 hover:border-blue-400 transition-all hover:shadow-xl">
                    <div className="text-6xl mb-4">🟡</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 font-sans">Structure Warnings</h3>
                    <p className="text-gray-600 font-sans">Discover orphaned pages and internal linking issues</p>
                  </div>
                  <div className="text-center p-8 bg-white backdrop-blur-sm rounded-xl border border-gray-200 hover:border-blue-400 transition-all hover:shadow-xl">
                    <div className="text-6xl mb-4">🔵</div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 font-sans">Competitive Analysis</h3>
                    <p className="text-gray-600 font-sans">Analyze competitor threats and market opportunities</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-red-600/20 hover:border-red-600/40 transition-all hover:scale-105 hover:shadow-xl">
                    <div className="text-6xl mb-4 animate-ghost-float">👻</div>
                    <h3 className="text-xl font-semibold mb-2 text-red-300">Detect Ghosts</h3>
                    <p className="text-gray-400">Find 404 errors and broken links haunting your site</p>
                  </div>
                  <div className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-green-500/20 hover:border-green-500/40 transition-all hover:scale-105 hover:shadow-xl">
                    <div className="text-6xl mb-4 animate-float-slow">🧟</div>
                    <h3 className="text-xl font-semibold mb-2 text-green-300">Hunt Zombies</h3>
                    <p className="text-gray-400">Discover orphaned pages with no internal links</p>
                  </div>
                  <div className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all hover:scale-105 hover:shadow-xl">
                    <div className="text-6xl mb-4 animate-float" style={{animationDelay: '0.5s'}}>👹</div>
                    <h3 className="text-xl font-semibold mb-2 text-red-300">Fight Monsters</h3>
                    <p className="text-gray-400">Analyze competitor threats and opportunities</p>
                  </div>
                </>
              )}
            </div>

            {/* MCP Integration Highlight */}
            <div className="max-w-4xl mx-auto mt-12">
              <div className={`backdrop-blur-md p-8 ${
                isProfessionalMode 
                  ? 'bg-white shadow-xl border border-gray-200 rounded-lg' 
                  : 'bg-[#1a1a1a]/80 border-4 border-[#333] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] rounded-lg'
              }`}>
                <div className="flex items-start gap-6">
                  <div className="text-6xl">{isProfessionalMode ? '🤖' : '🔮'}</div>
                  <div className="flex-1">
                    <h3 className={`text-2xl font-bold mb-3 ${
                      isProfessionalMode ? 'text-blue-900 font-sans' : 'text-purple-300'
                    }`}>
                      {isProfessionalMode ? 'AI Assistant Integration' : 'Supernatural AI Powers'}
                    </h3>
                    <p className={`text-lg mb-4 ${
                      isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'
                    }`}>
                      {isProfessionalMode 
                        ? 'First SEO tool with Model Context Protocol (MCP) support. Analyze websites directly from Kiro IDE using natural language.'
                        : 'Summon the SEO Exorcist from your IDE! First spooky SEO tool with MCP integration for Kiro.'}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className={`p-4 ${
                        isProfessionalMode 
                          ? 'bg-blue-50 border border-blue-200 rounded-lg' 
                          : 'bg-[#2a2a2a]/80 border-2 border-[#444] rounded'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{isProfessionalMode ? '💬' : '🗣️'}</span>
                          <h4 className={`font-semibold ${
                            isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                          }`}>Natural Language</h4>
                        </div>
                        <p className={`text-sm ${
                          isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                        }`}>
                          {isProfessionalMode 
                            ? 'Ask "Analyze my site" in Kiro - no UI needed'
                            : 'Cast spells with words: "Exorcise example.com"'}
                        </p>
                      </div>
                      <div className={`p-4 ${
                        isProfessionalMode 
                          ? 'bg-blue-50 border border-blue-200 rounded-lg' 
                          : 'bg-[#2a2a2a]/80 border-2 border-[#444] rounded'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{isProfessionalMode ? '⚡' : '✨'}</span>
                          <h4 className={`font-semibold ${
                            isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                          }`}>Instant Results</h4>
                        </div>
                        <p className={`text-sm ${
                          isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                        }`}>
                          {isProfessionalMode 
                            ? 'Get SEO insights in seconds, right in your IDE'
                            : 'Instant supernatural insights in your cauldron'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <a 
                        href="https://github.com/tanDivina/rankbeacon-seo-exorcist/tree/main/mcp-server"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all uppercase tracking-wider ${
                          isProfessionalMode 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg rounded-lg' 
                            : 'bg-gray-900 hover:bg-black text-red-400 border-2 border-red-600/50 hover:border-red-500 font-mono hover:shadow-red-600/50 rounded-lg transform hover:scale-105 shadow-lg'
                        }`}
                      >
                        <span>{isProfessionalMode ? '📚' : '📜'}</span>
                        <span>{isProfessionalMode ? 'View MCP Documentation' : 'Read the Grimoire'}</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`max-w-2xl w-full rounded-2xl p-8 shadow-2xl ${
            isProfessionalMode ? 'bg-white' : 'bg-gray-900 border-2 border-red-600/50'
          }`}>
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">{isProfessionalMode ? '👋' : '🎃'}</div>
              <h2 className={`text-3xl font-bold mb-2 ${
                isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
              }`}>
                Welcome to RankBeacon!
              </h2>
              <p className={`text-lg ${
                isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-300'
              }`}>
                {isProfessionalMode 
                  ? 'Your AI-powered SEO analysis platform' 
                  : 'Your supernatural SEO monitoring companion'}
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                isProfessionalMode ? 'bg-blue-50' : 'bg-gray-800/50'
              }`}>
                <span className="text-3xl">{isProfessionalMode ? '🔍' : '🔮'}</span>
                <div>
                  <h3 className={`font-bold mb-1 ${
                    isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                  }`}>Analyze Any Website</h3>
                  <p className={`text-sm ${
                    isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                  }`}>
                    Enter any URL and get instant SEO insights with AI-powered recommendations
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                isProfessionalMode ? 'bg-blue-50' : 'bg-gray-800/50'
              }`}>
                <span className="text-3xl">{isProfessionalMode ? '💡' : '🕯️'}</span>
                <div>
                  <h3 className={`font-bold mb-1 ${
                    isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                  }`}>Step-by-Step Guidance</h3>
                  <p className={`text-sm ${
                    isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                  }`}>
                    Click any issue to see detailed fix instructions with code examples
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                isProfessionalMode ? 'bg-blue-50' : 'bg-gray-800/50'
              }`}>
                <span className="text-3xl">{isProfessionalMode ? '⌨️' : '🎮'}</span>
                <div>
                  <h3 className={`font-bold mb-1 ${
                    isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                  }`}>Keyboard Shortcuts</h3>
                  <p className={`text-sm ${
                    isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                  }`}>
                    Press <kbd className="px-2 py-1 bg-gray-700 text-white rounded text-xs">?</kbd> anytime to see all shortcuts
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                isProfessionalMode ? 'bg-blue-50' : 'bg-gray-800/50'
              }`}>
                <span className="text-3xl">{isProfessionalMode ? '🎨' : '👻'}</span>
                <div>
                  <h3 className={`font-bold mb-1 ${
                    isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                  }`}>Dual Themes</h3>
                  <p className={`text-sm ${
                    isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                  }`}>
                    Toggle between Professional and Costume modes in the top-right corner
                  </p>
                </div>
              </div>

              <div className={`flex items-start space-x-4 p-4 rounded-lg ${
                isProfessionalMode ? 'bg-blue-50' : 'bg-gray-800/50'
              }`}>
                <span className="text-3xl">{isProfessionalMode ? '📤' : '🦇'}</span>
                <div>
                  <h3 className={`font-bold mb-1 ${
                    isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                  }`}>Share Your Results</h3>
                  <p className={`text-sm ${
                    isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                  }`}>
                    Share your SEO score on X, LinkedIn, or copy the link to spread the word!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowTutorial(false);
                  loadDemoData();
                }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isProfessionalMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white'
                }`}
              >
                Try Demo
              </button>
              <button
                onClick={() => setShowTutorial(false)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isProfessionalMode 
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300' 
                    : 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600'
                }`}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 z-[200] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className={`max-w-lg w-full rounded-2xl p-8 shadow-2xl ${
            isProfessionalMode ? 'bg-white' : 'bg-gray-900 border-2 border-red-600/50'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${
                isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
              }`}>
                ⌨️ Keyboard Shortcuts
              </h2>
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className={`text-2xl ${
                  isProfessionalMode ? 'text-gray-400 hover:text-gray-600' : 'text-gray-400 hover:text-white'
                }`}
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isProfessionalMode ? 'bg-gray-50' : 'bg-gray-800/50'
              }`}>
                <span className={isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'}>
                  Analyze website
                </span>
                <kbd className={`px-3 py-1 rounded text-sm font-mono ${
                  isProfessionalMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white'
                }`}>
                  Ctrl + Enter
                </kbd>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isProfessionalMode ? 'bg-gray-50' : 'bg-gray-800/50'
              }`}>
                <span className={isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'}>
                  Load demo
                </span>
                <kbd className={`px-3 py-1 rounded text-sm font-mono ${
                  isProfessionalMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white'
                }`}>
                  Ctrl + D
                </kbd>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isProfessionalMode ? 'bg-gray-50' : 'bg-gray-800/50'
              }`}>
                <span className={isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'}>
                  Close modal/issue
                </span>
                <kbd className={`px-3 py-1 rounded text-sm font-mono ${
                  isProfessionalMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white'
                }`}>
                  Esc
                </kbd>
              </div>

              <div className={`flex items-center justify-between p-3 rounded-lg ${
                isProfessionalMode ? 'bg-gray-50' : 'bg-gray-800/50'
              }`}>
                <span className={isProfessionalMode ? 'text-gray-700 font-sans' : 'text-gray-300'}>
                  Show shortcuts
                </span>
                <kbd className={`px-3 py-1 rounded text-sm font-mono ${
                  isProfessionalMode ? 'bg-gray-200 text-gray-700' : 'bg-gray-700 text-white'
                }`}>
                  ?
                </kbd>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setShowKeyboardShortcuts(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  isProfessionalMode 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`relative z-10 backdrop-blur-sm mt-20 ${
        isProfessionalMode ? 'border-t border-gray-200' : 'border-t border-red-900/30'
      }`}>
        <div className="container mx-auto px-4 py-8">
          {/* API Documentation Section */}
          <div className={`max-w-4xl mx-auto mb-8 p-6 rounded-xl ${
            isProfessionalMode ? 'bg-gray-50 border border-gray-200' : 'bg-gray-800/30 border border-red-600/20'
          }`}>
            <h3 className={`text-xl font-bold mb-4 flex items-center ${
              isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
            }`}>
              <span className="mr-2">🔌</span>
              API Access for Developers
            </h3>
            <p className={`mb-4 ${
              isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-300'
            }`}>
              Integrate RankBeacon into your workflow with our REST API
            </p>
            <div className={`rounded-lg p-4 font-mono text-sm overflow-x-auto ${
              isProfessionalMode ? 'bg-gray-900 text-green-400' : 'bg-gray-900/50 text-green-400'
            }`}>
              <div className="mb-2 text-gray-400">// POST /api/analyze</div>
              <div>curl -X POST {process.env.NEXT_PUBLIC_API_URL || 'https://api.rankbeacon.com'}/api/analyze \</div>
              <div className="ml-4">-H "Content-Type: application/json" \</div>
              <div className="ml-4">-d '{"{"}"url": "example.com", "depth": 3{"}"}'</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-xs ${
                isProfessionalMode ? 'bg-blue-100 text-blue-700' : 'bg-blue-900/30 text-blue-300'
              }`}>
                ✓ CI/CD Integration
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                isProfessionalMode ? 'bg-green-100 text-green-700' : 'bg-green-900/30 text-green-300'
              }`}>
                ✓ Webhook Support
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                isProfessionalMode ? 'bg-purple-100 text-purple-700' : 'bg-purple-900/30 text-purple-300'
              }`}>
                ✓ Scheduled Scans
              </span>
              <span className={`px-3 py-1 rounded-full text-xs ${
                isProfessionalMode ? 'bg-orange-100 text-orange-700' : 'bg-orange-900/30 text-orange-300'
              }`}>
                ✓ Team Collaboration
              </span>
            </div>
          </div>

          {/* Use Cases Section */}
          <div className="max-w-6xl mx-auto mb-8">
            <h3 className={`text-2xl font-bold mb-6 text-center ${
              isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
            }`}>
              Who Benefits from RankBeacon?
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Solo Developers */}
              <div className={`p-6 rounded-xl ${
                isProfessionalMode 
                  ? 'bg-white border border-gray-200 hover:border-blue-400' 
                  : 'bg-gray-800/30 border border-red-600/20 hover:border-red-600/40'
              } transition-all hover:shadow-lg`}>
                <div className="text-4xl mb-3">👨‍💻</div>
                <h4 className={`font-bold mb-2 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Solo Developers</h4>
                <ul className={`text-sm space-y-1 ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>
                  <li>• Quick SEO checks</li>
                  <li>• Learn best practices</li>
                  <li>• Free to use</li>
                  <li>• Fun interface</li>
                </ul>
              </div>

              {/* Agencies */}
              <div className={`p-6 rounded-xl ${
                isProfessionalMode 
                  ? 'bg-white border border-gray-200 hover:border-blue-400' 
                  : 'bg-gray-800/30 border border-red-600/20 hover:border-red-600/40'
              } transition-all hover:shadow-lg`}>
                <div className="text-4xl mb-3">🏢</div>
                <h4 className={`font-bold mb-2 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Agencies</h4>
                <ul className={`text-sm space-y-1 ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>
                  <li>• Client presentations</li>
                  <li>• Export reports</li>
                  <li>• Share results</li>
                  <li>• Professional mode</li>
                </ul>
              </div>

              {/* Enterprises */}
              <div className={`p-6 rounded-xl ${
                isProfessionalMode 
                  ? 'bg-white border border-gray-200 hover:border-blue-400' 
                  : 'bg-gray-800/30 border border-red-600/20 hover:border-red-600/40'
              } transition-all hover:shadow-lg`}>
                <div className="text-4xl mb-3">🏭</div>
                <h4 className={`font-bold mb-2 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Enterprises</h4>
                <ul className={`text-sm space-y-1 ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>
                  <li>• API integration</li>
                  <li>• Automated scans</li>
                  <li>• Team features</li>
                  <li>• White-label ready</li>
                </ul>
              </div>

              {/* Educators */}
              <div className={`p-6 rounded-xl ${
                isProfessionalMode 
                  ? 'bg-white border border-gray-200 hover:border-blue-400' 
                  : 'bg-gray-800/30 border border-red-600/20 hover:border-red-600/40'
              } transition-all hover:shadow-lg`}>
                <div className="text-4xl mb-3">🎓</div>
                <h4 className={`font-bold mb-2 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Educators</h4>
                <ul className={`text-sm space-y-1 ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>
                  <li>• Teaching SEO</li>
                  <li>• Interactive learning</li>
                  <li>• Visual feedback</li>
                  <li>• Gamification</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Competitive Advantage Section */}
          <div className={`max-w-4xl mx-auto mb-8 p-6 rounded-xl ${
            isProfessionalMode ? 'bg-blue-50 border border-blue-200' : 'bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-600/30'
          }`}>
            <h3 className={`text-xl font-bold mb-4 text-center ${
              isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
            }`}>
              Why RankBeacon Stands Out
            </h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl mb-2">🎭</div>
                <h4 className={`font-bold mb-1 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Dual Personality</h4>
                <p className={`text-sm ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>Professional + Fun modes</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎮</div>
                <h4 className={`font-bold mb-1 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Gamification</h4>
                <p className={`text-sm ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>Makes SEO engaging</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎓</div>
                <h4 className={`font-bold mb-1 ${
                  isProfessionalMode ? 'text-gray-900 font-sans' : 'text-white'
                }`}>Educational</h4>
                <p className={`text-sm ${
                  isProfessionalMode ? 'text-gray-600 font-sans' : 'text-gray-400'
                }`}>Learn while you fix</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            {!isProfessionalMode && (
              <div className="flex justify-center space-x-4 mb-4">
                <span className="text-2xl animate-flicker">🕯️</span>
                <span className="text-2xl animate-ghost-float">👻</span>
                <span className="text-2xl animate-float">🎃</span>
                <span className="text-2xl animate-ghost-float" style={{animationDelay: '0.5s'}}>🦇</span>
                <span className="text-2xl animate-flicker" style={{animationDelay: '1s'}}>🕯️</span>
              </div>
            )}
            
            {/* Social Links */}
            <div className="flex justify-center space-x-6 mb-4">
              <a href="https://github.com/tanDivina" target="_blank" rel="noopener noreferrer" 
                 className={`transition-colors ${
                   isProfessionalMode 
                     ? 'text-gray-600 hover:text-blue-600' 
                     : 'text-gray-400 hover:text-red-400'
                 }`}
                 aria-label="GitHub">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://x.com/DorienVibecodes" target="_blank" rel="noopener noreferrer"
                 className={`transition-colors ${
                   isProfessionalMode 
                     ? 'text-gray-600 hover:text-blue-600' 
                     : 'text-gray-400 hover:text-red-400'
                 }`}
                 aria-label="X (Twitter)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/dorien-van-den-abbeele-136170b/" target="_blank" rel="noopener noreferrer"
                 className={`transition-colors ${
                   isProfessionalMode 
                     ? 'text-gray-600 hover:text-blue-600' 
                     : 'text-gray-400 hover:text-red-400'
                 }`}
                 aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@DorienVibecodes" target="_blank" rel="noopener noreferrer"
                 className={`transition-colors ${
                   isProfessionalMode 
                     ? 'text-gray-600 hover:text-blue-600' 
                     : 'text-gray-400 hover:text-red-400'
                 }`}
                 aria-label="YouTube">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            
            <p className={`text-sm ${isProfessionalMode ? 'text-gray-600' : 'text-gray-400'}`}>
              {isProfessionalMode 
                ? 'Built with Kiro AI for the Kiro Hackathon' 
                : 'Built with 💀 for Kiroween Hackathon'}
            </p>
            <p className={`text-xs mt-2 ${isProfessionalMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {isProfessionalMode 
                ? 'Empowering better SEO since 2025' 
                : 'Banishing SEO demons since 2025 🔮'}
            </p>
          </div>
        </div>
      </footer>



      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        @keyframes spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 3s linear infinite;
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
        @keyframes slide-in-right {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }
        @keyframes progress-bar {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress-bar {
          animation: progress-bar 4s ease-out;
        }
        @keyframes fade-out {
          from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          to { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
        }
        .animate-fade-out {
          animation: fade-out 1s ease-out forwards;
        }
        @keyframes spider-crawl {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(10px, 10px); }
          50% { transform: translate(20px, 0); }
          75% { transform: translate(10px, -10px); }
        }
        .animate-spider-crawl {
          animation: spider-crawl 8s ease-in-out infinite;
        }
        @keyframes spooky-shake-subtle {
          0%, 100% { transform: translateX(0) scale(1.02); }
          25% { transform: translateX(-2px) scale(1.02); }
          75% { transform: translateX(2px) scale(1.02); }
        }
        .animate-spooky-shake-subtle {
          animation: spooky-shake-subtle 0.3s ease-in-out;
        }
        @keyframes light-beam {
          0% { opacity: 0; transform: rotate(var(--angle, 0deg)) translateX(-50%) scaleY(0); }
          50% { opacity: 1; transform: rotate(var(--angle, 0deg)) translateX(-50%) scaleY(1); }
          100% { opacity: 0; transform: rotate(var(--angle, 0deg)) translateX(-50%) scaleY(0); }
        }
        .animate-light-beam {
          animation: light-beam 2s ease-in-out infinite;
        }
        @keyframes ghost-fly-away {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
        }
        .animate-ghost-fly-away {
          animation: ghost-fly-away 3s ease-out forwards;
        }
        @keyframes scale-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        @keyframes particle-explode {
          0% { 
            transform: translate(-50%, -50%) rotate(0deg) translateX(0) scale(1); 
            opacity: 1; 
          }
          100% { 
            transform: translate(-50%, -50%) rotate(720deg) translateX(300px) scale(0); 
            opacity: 0; 
          }
        }
        .animate-particle-explode {
          animation: particle-explode 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
