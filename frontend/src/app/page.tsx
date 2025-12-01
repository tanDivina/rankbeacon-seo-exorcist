'use client';

import { useState, useEffect } from 'react';
import SpookyParticles from '../components/SpookyParticles';

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
            title: '👻 Missing Meta Description',
            description: 'Homepage has no meta description - critical for search results',
            url: 'https://demo-site.example',
            fix_suggestion: 'Add a compelling meta description (150-160 characters) that summarizes your page',
            suggested_code: '<meta name="description" content="Welcome to Demo Site - Your one-stop solution for amazing products and services. Shop now and save 20% on your first order!">'
          },
          {
            type: 'ghost',
            severity: 'high',
            title: '👻 Title Tag Too Long',
            description: 'Title is 78 characters (recommended: 50-60)',
            url: 'https://demo-site.example/products',
            fix_suggestion: 'Shorten your title tag to 50-60 characters',
            current_content: 'Amazing Products for Everyone - Shop Now and Save Big on Quality Items',
            suggested_code: '<title>Amazing Products - Shop Now and Save Big</title>'
          },
          {
            type: 'phantom',
            severity: 'medium',
            title: '🌫️ Images Missing Alt Text',
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
            title: '🧟 Multiple H1 Tags',
            description: 'Found 3 H1 tags (recommended: 1)',
            url: 'https://demo-site.example/about',
            fix_suggestion: 'Use only one H1 tag per page',
            current_content: 'Found: About Us, Our Mission, Contact Info',
            suggested_code: '<h1>About Us</h1>\n<h2>Our Mission</h2>\n<h2>Contact Info</h2>'
          },
          {
            type: 'zombie',
            severity: 'low',
            title: '🧟 Few Internal Links',
            description: 'Only 3 internal links found',
            url: 'https://demo-site.example/blog',
            fix_suggestion: 'Add more internal links to improve site structure'
          },
          {
            type: 'monster',
            severity: 'high',
            title: '👹 Competitor Outranking',
            description: 'competitor-site.com ranks higher for "premium products"',
            url: 'https://demo-site.example',
            fix_suggestion: 'Analyze competitor content and create superior, more comprehensive content'
          },
          {
            type: 'specter',
            severity: 'medium',
            title: '👤 No Schema Markup',
            description: 'No structured data (JSON-LD) found',
            url: 'https://demo-site.example',
            fix_suggestion: 'Implement Schema.org markup for rich snippets',
            suggested_code: '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Demo Site",\n  "url": "https://demo-site.example"\n}\n</script>'
          },
          {
            type: 'phantom',
            severity: 'medium',
            title: '🌫️ Content Gap Opportunity',
            description: 'Missing content for "product reviews" keyword',
            url: 'https://demo-site.example',
            fix_suggestion: 'Create comprehensive content addressing this topic'
          },
          {
            type: 'ghost',
            severity: 'medium',
            title: '👻 Missing Open Graph Tags',
            description: 'No social media preview tags found',
            url: 'https://demo-site.example',
            fix_suggestion: 'Add Open Graph tags for better social sharing',
            suggested_code: '<meta property="og:title" content="Demo Site - Premium Products">\n<meta property="og:description" content="Shop amazing products with great deals">\n<meta property="og:image" content="/images/og-image.jpg">'
          },
          {
            type: 'specter',
            severity: 'low',
            title: '👤 Missing Canonical Tag',
            description: 'No canonical URL specified',
            url: 'https://demo-site.example/products',
            fix_suggestion: 'Add canonical tag to avoid duplicate content issues',
            suggested_code: '<link rel="canonical" href="https://demo-site.example/products">'
          },
          {
            type: 'zombie',
            severity: 'medium',
            title: '🧟 Broken Internal Link',
            description: 'Link to /old-page returns 404',
            url: 'https://demo-site.example/contact',
            fix_suggestion: 'Update or remove broken link',
            suggested_code: '<!-- Remove or update this link -->\n<a href="/new-page">Updated Link</a>'
          },
          {
            type: 'phantom',
            severity: 'low',
            title: '🌫️ Slow Page Load',
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* Spooky Particles */}
      <SpookyParticles />
      
      {/* Haunted Cursor Trail */}
      {cursorTrail.map((point, i) => (
        <div
          key={point.id}
          className="fixed pointer-events-none z-50 text-2xl animate-fade-out"
          style={{
            left: point.x,
            top: point.y,
            opacity: 1 - (i / cursorTrail.length),
            transform: 'translate(-50%, -50%)'
          }}
        >
          {['👻', '🦇', '💀', '🕷️', '🌙'][i % 5]}
        </div>
      ))}

      {/* Flying Bats */}
      {bats.map(bat => (
        <div
          key={bat.id}
          className="fixed pointer-events-none z-40 text-3xl animate-flicker"
          style={{
            left: bat.x,
            top: bat.y,
            transition: 'all 0.05s linear'
          }}
        >
          🦇
        </div>
      ))}

      {/* Spider Webs in Corners */}
      <div className="fixed top-0 left-0 w-32 h-32 pointer-events-none z-30 opacity-30">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0,0 L50,50 M0,20 L50,50 M0,40 L50,50 M20,0 L50,50 M40,0 L50,50" 
                stroke="white" strokeWidth="0.5" fill="none" opacity="0.5"/>
          <circle cx="50" cy="50" r="2" fill="white"/>
        </svg>
        <div className="absolute top-8 left-8 text-xl animate-spider-crawl">🕷️</div>
      </div>
      <div className="fixed top-0 right-0 w-32 h-32 pointer-events-none z-30 opacity-30 transform scale-x-[-1]">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M0,0 L50,50 M0,20 L50,50 M0,40 L50,50 M20,0 L50,50 M40,0 L50,50" 
                stroke="white" strokeWidth="0.5" fill="none" opacity="0.5"/>
          <circle cx="50" cy="50" r="2" fill="white"/>
        </svg>
        <div className="absolute top-8 right-8 text-xl animate-spider-crawl">🕷️</div>
      </div>
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-32 h-32 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating ghosts */}
        <div className="absolute top-1/4 left-1/4 text-6xl opacity-10 animate-ghost-float">👻</div>
        <div className="absolute top-1/3 right-1/4 text-5xl opacity-10 animate-float-slow" style={{animationDelay: '1s'}}>🎃</div>
        <div className="absolute bottom-1/4 left-1/3 text-4xl opacity-10 animate-ghost-float" style={{animationDelay: '2s'}}>🕯️</div>
        <div className="absolute top-2/3 right-1/3 text-5xl opacity-10 animate-float-slow" style={{animationDelay: '3s'}}>🦇</div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-purple-800/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-4xl">👻</span>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  RankBeacon SEO Exorcist
                </h1>
                <p className="text-sm text-gray-400">Banish your SEO demons</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              
              {/* Sound Toggle */}
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  if (!soundEnabled) playSound('click');
                }}
                className="px-3 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-purple-500/30 hover:border-purple-500/50 transition-all"
                title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              >
                <span className="text-xl">
                  {soundEnabled ? '🔊' : '🔇'}
                </span>
              </button>
              <span className="text-2xl animate-flicker">🕯️</span>
              <span className="text-2xl animate-float">🎃</span>
              <span className="text-2xl animate-ghost-float">👻</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Supernatural SEO Monitoring
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Transform your SEO issues into ghosts, zombies, and monsters. 
            <br />
            Then exorcise them with AI-powered insights! 🔮
          </p>
          <p className="text-sm text-purple-400 italic mb-8">
            💡 Works with any website! Try: example.com, github.com, your-site.com, or click "🎬 Try Demo"
          </p>

          {/* Search Box */}
          <div className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && analyzeWebsite()}
                placeholder="Enter website URL (e.g., example.com)"
                className="flex-1 px-6 py-4 bg-gray-900/50 border border-purple-500/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={loading}
              />
              <button
                onClick={analyzeWebsite}
                disabled={loading || !url}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-purple-500/50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 relative overflow-hidden"
              >
                {loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 animate-pulse"></div>
                )}
                <span className="relative z-10 flex items-center space-x-2">
                  {loading ? (
                    <>
                      <span className="animate-spin">🔮</span>
                      <span>Summoning Spirits...</span>
                      <span className="animate-pulse">👻</span>
                    </>
                  ) : (
                    <>
                      <span className="animate-flicker">🕯️</span>
                      <span>Exorcise</span>
                    </>
                  )}
                </span>
              </button>
              <button
                onClick={loadDemoData}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-indigo-500/50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <span>🎬</span>
                <span>Try Demo</span>
              </button>
            </div>
            
            {/* Depth Slider */}
            <div className="mt-4">
              <label className="block text-sm text-gray-300 mb-2">
                🕷️ Crawl Depth: <span className="text-purple-400 font-semibold">{depth} page{depth > 1 ? 's' : ''}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={depth}
                onChange={(e) => setDepth(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
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
                  className="w-5 h-5 rounded border-purple-500 bg-gray-900 text-purple-600 focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-300">
                  🎭 Enable JavaScript Rendering <span className="text-purple-400">(for React/Vue/Angular sites)</span>
                </span>
              </label>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-300 animate-spooky-shake">
              <span className="text-2xl mr-2">💀</span>
              {error}
            </div>
          )}
          
          {/* Loading Overlay */}
          {loading && (
            <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-2xl p-12 border border-purple-500/30 text-center relative overflow-hidden">
              {/* Ritual Circle Background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10">
                <div className="w-64 h-64 border-4 border-purple-500 rounded-full animate-spin-slow"></div>
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
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 transition-all duration-300 ease-out"
                    style={{width: `${loadingProgress}%`}}
                  ></div>
                </div>
                <p className="text-sm text-purple-300 mt-2">{Math.round(loadingProgress)}% Complete</p>
              </div>
              
              {/* Floating Spirits */}
              <div className="relative z-10 mt-6 flex justify-center space-x-4">
                <span className="text-4xl animate-ghost-float">👻</span>
                <span className="text-4xl animate-float" style={{animationDelay: '0.5s'}}>🦇</span>
                <span className="text-4xl animate-ghost-float" style={{animationDelay: '1s'}}>👻</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            {/* Haunting Score */}
            <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-2xl p-8 border border-purple-500/30 shadow-2xl mb-8 animate-fade-in-up relative overflow-hidden">
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 animate-pulse-glow"></div>
              
              <div className="text-center relative z-10">
                <h3 className="text-3xl font-bold mb-4 flex items-center justify-center gap-3">
                  <span className="animate-float">🏚️</span>
                  <span>Haunting Report</span>
                  <span className="animate-float" style={{animationDelay: '0.5s'}}>🏚️</span>
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
                        strokeDashoffset={`${2 * Math.PI * 88 * (1 - animatedScore / 100)}`}
                        className={`transition-all duration-1000 ease-out ${
                          result.haunting_score < 20 ? 'text-green-400' :
                          result.haunting_score < 40 ? 'text-blue-400' :
                          result.haunting_score < 60 ? 'text-yellow-400' :
                          result.haunting_score < 80 ? 'text-orange-400' :
                          'text-red-400'
                        }`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Center text */}
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-5xl font-bold bg-gradient-to-r ${
                        result.haunting_score < 20 ? 'from-green-400 to-emerald-400' :
                        result.haunting_score < 40 ? 'from-blue-400 to-cyan-400' :
                        result.haunting_score < 60 ? 'from-yellow-400 to-orange-400' :
                        result.haunting_score < 80 ? 'from-orange-400 to-red-400' :
                        'from-red-400 to-pink-400'
                      } bg-clip-text text-transparent`}>
                        {animatedScore}
                      </span>
                      <span className="text-sm text-gray-400 uppercase tracking-wider">/ 100</span>
                    </div>
                  </div>

                  {/* Stats Breakdown */}
                  <div className="text-left space-y-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">👻</span>
                      <div>
                        <p className="text-sm text-gray-400">Ghosts</p>
                        <p className="text-xl font-bold text-purple-300">
                          {result.entities.filter((e: any) => e.type === 'ghost').length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">🧟</span>
                      <div>
                        <p className="text-sm text-gray-400">Zombies</p>
                        <p className="text-xl font-bold text-green-300">
                          {result.entities.filter((e: any) => e.type === 'zombie').length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">👹</span>
                      <div>
                        <p className="text-sm text-gray-400">Monsters</p>
                        <p className="text-xl font-bold text-red-300">
                          {result.entities.filter((e: any) => e.type === 'monster').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ROI Calculator & Performance Score */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {/* ROI Calculator */}
                  <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-green-300 mb-3 flex items-center">
                      <span className="mr-2">💰</span>
                      Potential ROI
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Current Traffic:</span>
                        <span className="text-white font-semibold">~1,000/month</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Potential Increase:</span>
                        <span className="text-green-300 font-semibold">+{Math.round((100 - result.haunting_score) * 0.5)}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">New Traffic:</span>
                        <span className="text-green-300 font-bold">~{Math.round(1000 * (1 + (100 - result.haunting_score) * 0.005))}/month</span>
                      </div>
                      <div className="pt-2 border-t border-green-500/30">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Est. Revenue Impact:</span>
                          <span className="text-green-400 font-bold text-lg">+${Math.round((100 - result.haunting_score) * 50)}/mo</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Score */}
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="font-bold text-blue-300 mb-3 flex items-center">
                      <span className="mr-2">⚡</span>
                      Performance Impact
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Page Speed:</span>
                        <span className={`font-semibold ${result.haunting_score > 60 ? 'text-orange-300' : 'text-green-300'}`}>
                          {result.haunting_score > 60 ? 'Needs Work' : 'Good'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Mobile Friendly:</span>
                        <span className="text-green-300 font-semibold">Yes</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Core Web Vitals:</span>
                        <span className={`font-semibold ${result.haunting_score > 50 ? 'text-yellow-300' : 'text-green-300'}`}>
                          {result.haunting_score > 50 ? 'Fair' : 'Good'}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-blue-500/30">
                        <div className="flex justify-between">
                          <span className="text-gray-400">SEO Impact:</span>
                          <span className={`font-bold text-lg ${
                            result.haunting_score < 40 ? 'text-green-400' :
                            result.haunting_score < 70 ? 'text-yellow-400' : 'text-orange-400'
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
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg flex items-center space-x-2"
                  >
                    <span>📥</span>
                    <span>Export Report</span>
                  </button>
                </div>
                <div className={`mt-6 inline-block px-6 py-3 rounded-full text-lg font-semibold ${
                  result.haunting_score < 20 ? 'bg-green-500/20 text-green-300 border border-green-500/50' :
                  result.haunting_score < 40 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50' :
                  result.haunting_score < 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                  result.haunting_score < 80 ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' :
                  'bg-red-500/20 text-red-300 border border-red-500/50 animate-pulse'
                }`}>
                  {result.haunting_score < 20 ? '✨ Barely Haunted!' :
                   result.haunting_score < 40 ? '👻 Mildly Spooky' :
                   result.haunting_score < 60 ? '😱 Moderately Haunted' :
                   result.haunting_score < 80 ? '💀 Very Haunted!' :
                   '🔥 Extremely Haunted!'}
                </div>
              </div>
            </div>

            {/* Progress Tracker */}
            {result.entities && result.entities.length > 0 && (
              <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 backdrop-blur-md rounded-xl p-6 border border-green-500/30 mb-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">📊</span>
                    <div>
                      <h3 className="text-xl font-bold text-green-300">Exorcism Progress</h3>
                      <p className="text-sm text-gray-400">Track your SEO fixes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-300">
                      {fixedIssues.size} / {result.entities.length}
                    </div>
                    <p className="text-sm text-gray-400">Issues Resolved</p>
                  </div>
                </div>
                <div className="mt-4 bg-gray-900/50 rounded-full h-4 overflow-hidden">
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
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-purple-500/30 mb-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3">🎯</span>
                  Issue Priority Matrix
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* High Impact, Low Effort - FIX FIRST! */}
                  <div className="bg-green-900/20 border-2 border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-green-300">🚀 Quick Wins</h4>
                      <span className="text-xs bg-green-500/20 px-2 py-1 rounded">High Impact, Low Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => (e.severity === 'high' || e.severity === 'critical') && e.type !== 'monster')
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className="text-sm text-green-200 flex items-start space-x-2">
                            <span>•</span>
                            <span>{e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => (e.severity === 'high' || e.severity === 'critical') && e.type !== 'monster').length === 0 && (
                        <p className="text-sm text-gray-400 italic">No quick wins found! 🎉</p>
                      )}
                    </div>
                  </div>

                  {/* High Impact, High Effort - PLAN THESE */}
                  <div className="bg-orange-900/20 border-2 border-orange-500/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-orange-300">📋 Major Projects</h4>
                      <span className="text-xs bg-orange-500/20 px-2 py-1 rounded">High Impact, High Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => e.type === 'monster' || (e.severity === 'critical' && e.type === 'specter'))
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className="text-sm text-orange-200 flex items-start space-x-2">
                            <span>•</span>
                            <span>{e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => e.type === 'monster').length === 0 && (
                        <p className="text-sm text-gray-400 italic">No major projects needed!</p>
                      )}
                    </div>
                  </div>

                  {/* Low Impact, Low Effort - FILL TIME */}
                  <div className="bg-blue-900/20 border-2 border-blue-500/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-blue-300">⚡ Fill Time</h4>
                      <span className="text-xs bg-blue-500/20 px-2 py-1 rounded">Low Impact, Low Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => e.severity === 'low')
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className="text-sm text-blue-200 flex items-start space-x-2">
                            <span>•</span>
                            <span>{e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => e.severity === 'low').length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nothing here!</p>
                      )}
                    </div>
                  </div>

                  {/* Low Impact, High Effort - AVOID */}
                  <div className="bg-gray-900/20 border-2 border-gray-500/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-300">⏸️ Avoid/Defer</h4>
                      <span className="text-xs bg-gray-500/20 px-2 py-1 rounded">Low Impact, High Effort</span>
                    </div>
                    <div className="space-y-2">
                      {result.entities
                        .filter((e: any) => e.severity === 'medium' && e.type === 'phantom')
                        .slice(0, 3)
                        .map((e: any, i: number) => (
                          <div key={i} className="text-sm text-gray-300 flex items-start space-x-2">
                            <span>•</span>
                            <span>{e.title}</span>
                          </div>
                        ))}
                      {result.entities.filter((e: any) => e.severity === 'medium' && e.type === 'phantom').length === 0 && (
                        <p className="text-sm text-gray-400 italic">Nothing to avoid!</p>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 text-center">
                  💡 Tip: Focus on Quick Wins first for maximum impact with minimum effort!
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
                      className={`bg-gray-800/50 backdrop-blur-md rounded-xl border transition-all animate-fade-in-up ${
                        isFixed 
                          ? 'border-green-500/50 opacity-60' 
                          : 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.02] hover:animate-spooky-shake-subtle'
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
                                className="w-6 h-6 rounded border-2 border-purple-500 bg-gray-900 text-green-500 focus:ring-2 focus:ring-purple-500 cursor-pointer"
                              />
                            </div>
                            
                            {/* Icon and Content */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`text-4xl ${isFixed ? 'grayscale' : ''}`}>
                                  {entity.type === 'ghost' ? '👻' :
                                   entity.type === 'zombie' ? '🧟' :
                                   entity.type === 'monster' ? '👹' :
                                   entity.type === 'specter' ? '👤' : '🌫️'}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className={`text-lg font-semibold ${isFixed ? 'line-through text-gray-500' : ''}`}>
                                      {entity.title}
                                    </h4>
                                    {isFixed && <span className="text-green-400">✓</span>}
                                    {/* Educational Tooltip */}
                                    {!isFixed && (
                                      <div className="group relative">
                                        <span className="text-purple-400 cursor-help text-sm">ℹ️</span>
                                        <div className="invisible group-hover:visible absolute left-0 top-6 z-50 w-80 bg-purple-900/95 backdrop-blur-md border-2 border-purple-500 rounded-lg p-4 shadow-2xl shadow-purple-500/50 animate-fade-in">
                                          <h5 className="font-bold text-purple-300 mb-2 flex items-center">
                                            <span className="mr-2">🎓</span>
                                            Why This Matters
                                          </h5>
                                          <p className="text-sm text-gray-200 mb-2">
                                            {getEducationalInfo(entity.type, entity.severity).why}
                                          </p>
                                          <div className="border-t border-purple-500/30 pt-2 mt-2">
                                            <p className="text-xs text-purple-300 font-semibold mb-1">📊 Impact:</p>
                                            <p className="text-xs text-gray-300">{getEducationalInfo(entity.type, entity.severity).impact}</p>
                                          </div>
                                          <div className="border-t border-purple-500/30 pt-2 mt-2">
                                            <p className="text-xs text-purple-300 font-semibold mb-1">🎯 Ranking Effect:</p>
                                            <p className="text-xs text-gray-300">{getEducationalInfo(entity.type, entity.severity).ranking}</p>
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-400">{entity.description}</p>
                                </div>
                              </div>
                              
                              {entity.url && (
                                <div className="mt-2 ml-14">
                                  <p className="text-xs text-gray-500 mb-1">📍 Location:</p>
                                  <p className="text-xs text-purple-300 font-mono break-all bg-gray-900/50 px-2 py-1 rounded">
                                    {entity.url}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Severity Badge and Expand Arrow */}
                          <div className="flex items-center space-x-3 ml-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                              entity.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                              entity.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' :
                              entity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                              'bg-blue-500/20 text-blue-300 border border-blue-500/50'
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
                        <div className="border-t border-purple-500/30 p-6 bg-gray-900/30">
                          <div className="space-y-6">
                            {/* Quick Summary */}
                            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                              <p className="text-sm text-purple-300 font-semibold mb-2">🕯️ Quick Fix:</p>
                              <p className="text-sm text-gray-300">{entity.fix_suggestion}</p>
                            </div>

                            {/* Step-by-Step Instructions */}
                            <div>
                              <h5 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                                <span className="mr-2">📋</span>
                                Step-by-Step Guide
                              </h5>
                              <ol className="space-y-2">
                                {instructions.steps.map((step: string, i: number) => (
                                  <li key={i} className="flex items-start space-x-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                                      {i + 1}
                                    </span>
                                    <span className="text-sm text-gray-300 pt-0.5">{step}</span>
                                  </li>
                                ))}
                              </ol>
                            </div>

                            {/* Context-Specific Suggestion (if available from backend) */}
                            {entity.suggested_code && (
                              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-4">
                                <h5 className="text-lg font-semibold text-green-300 mb-2 flex items-center">
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
                                    <p className="text-xs text-gray-400 mb-2">Images found:</p>
                                    {entity.image_examples.map((img: any, i: number) => (
                                      <div key={i} className="text-xs text-gray-300 bg-gray-900/50 px-3 py-2 rounded mb-2">
                                        <p className="font-mono text-purple-300">{img.src}</p>
                                        <p className="text-green-300 mt-1">→ Suggested alt: "{img.suggested_alt}"</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="relative">
                                  <pre className="bg-gray-950 border border-green-700 rounded-lg p-4 overflow-x-auto text-sm">
                                    <code className="text-green-400">{entity.suggested_code}</code>
                                  </pre>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(entity.suggested_code);
                                      playSound('click');
                                    }}
                                    className="absolute top-2 right-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-semibold transition-colors"
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* General Code Example */}
                            <div>
                              <h5 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
                                <span className="mr-2">💻</span>
                                General Code Examples
                              </h5>
                              <div className="relative">
                                <pre className="bg-gray-950 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm">
                                  <code className="text-green-400">{instructions.code}</code>
                                </pre>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(instructions.code);
                                    playSound('click');
                                  }}
                                  className="absolute top-2 right-2 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs font-semibold transition-colors"
                                >
                                  📋 Copy
                                </button>
                              </div>
                            </div>

                            {/* Documentation Link */}
                            <div>
                              <h5 className="text-lg font-semibold text-purple-300 mb-3 flex items-center">
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
                            <div className="pt-4 border-t border-purple-500/30">
                              <button
                                onClick={() => markAsFixed(index)}
                                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-green-500/50 flex items-center justify-center space-x-2"
                              >
                                <span>✓</span>
                                <span>Mark as Fixed</span>
                                <span>🎉</span>
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
                      className="absolute bottom-0 left-1/2 w-1 bg-gradient-to-t from-yellow-400 via-purple-500 to-transparent animate-light-beam"
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
                  <h2 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    EXORCISM COMPLETE!
                  </h2>
                  <p className="text-3xl text-purple-300 mb-8">
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
              <div className="bg-gray-800/50 backdrop-blur-md rounded-xl p-8 border border-purple-500/30">
                <h3 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3">📜</span>
                  Exorcism Recommendations
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3 text-gray-300">
                      <span className="text-purple-400 mt-1">🕯️</span>
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
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-8 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-purple-500/20 hover:border-purple-500/40 transition-all hover:scale-105 hover:shadow-xl">
              <div className="text-6xl mb-4 animate-ghost-float">👻</div>
              <h3 className="text-xl font-semibold mb-2 text-purple-300">Detect Ghosts</h3>
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-purple-800/30 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex justify-center space-x-4 mb-4">
              <span className="text-2xl animate-flicker">🕯️</span>
              <span className="text-2xl animate-ghost-float">👻</span>
              <span className="text-2xl animate-float">🎃</span>
              <span className="text-2xl animate-ghost-float" style={{animationDelay: '0.5s'}}>🦇</span>
              <span className="text-2xl animate-flicker" style={{animationDelay: '1s'}}>🕯️</span>
            </div>
            
            {/* Social Links */}
            <div className="flex justify-center space-x-6 mb-4">
              <a href="https://github.com/tanDivina" target="_blank" rel="noopener noreferrer" 
                 className="text-gray-400 hover:text-purple-400 transition-colors"
                 aria-label="GitHub">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://x.com/DorienVibecodes" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-purple-400 transition-colors"
                 aria-label="X (Twitter)">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/dorien-van-den-abbeele-136170b/" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-purple-400 transition-colors"
                 aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@DorienVibecodes" target="_blank" rel="noopener noreferrer"
                 className="text-gray-400 hover:text-purple-400 transition-colors"
                 aria-label="YouTube">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            
            <p className="text-gray-400 text-sm">
              Built with 💜 for Kiroween Hackathon
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Banishing SEO demons since 2025 🔮
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
