# SEO Best Practices - RankBeacon SEO Exorcist

This steering document provides SEO guidance for the RankBeacon platform and helps Kiro provide accurate, context-aware SEO recommendations.

## Technical SEO Guidelines

### Page Speed and Core Web Vitals
- **LCP (Largest Contentful Paint)**: Target under 2.5 seconds - optimize largest image/element
- **FID (First Input Delay)**: Maintain under 100ms - reduce JavaScript blocking
- **CLS (Cumulative Layout Shift)**: Keep under 0.1 - reserve space for dynamic content
- Optimize images with modern formats (WebP, AVIF) and compress to reduce file size
- Implement lazy loading for below-the-fold content to improve initial load time
- Minimize JavaScript execution time by code splitting and deferring non-critical scripts
- Enable browser caching and use CDN for static assets
- Compress text files with gzip or brotli compression
- Remove unused CSS and JavaScript to reduce bundle size

### Mobile Optimization
- Ensure responsive design across all devices using flexible grids and media queries
- Use mobile-friendly navigation patterns like hamburger menus and bottom navigation
- Avoid intrusive interstitials that block content access
- Test with Google's Mobile-Friendly Test and fix identified issues
- Implement touch-friendly UI elements (44x44px minimum) with adequate spacing
- Optimize viewport settings and prevent horizontal scrolling
- Use legible font sizes (16px minimum) without requiring zoom
- Design for thumb-friendly interactions on mobile devices

### Crawlability and Indexing
- Create and maintain XML sitemaps with all important pages
- Use robots.txt appropriately (don't block important resources like CSS/JS)
- Implement proper canonical tags to avoid duplicate content issues
- Use structured data (Schema.org) for rich snippets and enhanced search results
- Ensure proper internal linking structure with descriptive anchor text
- Submit sitemaps to Google Search Console and monitor crawl errors
- Fix broken internal links and redirect chains promptly
- Optimize crawl budget by blocking low-value pages in robots.txt
- Monitor index coverage and resolve indexing issues quickly

### URL Structure
- Use descriptive, keyword-rich URLs that indicate page content
- Keep URLs short and readable for better user experience
- Use hyphens (not underscores) to separate words in URLs
- Avoid excessive parameters and session IDs that clutter URLs
- Implement proper URL hierarchy reflecting site structure
- Include target keywords naturally in URL paths
- Remove stop words from URLs when possible
- Maintain consistent URL patterns across the site

## Content Optimization

### On-Page SEO
- **Title Tags**: 50-60 characters, include primary keyword
- **Meta Descriptions**: 150-160 characters, compelling and descriptive
- **H1 Tags**: One per page, include primary keyword
- **Header Hierarchy**: Use H2-H6 properly for content structure
- **Image Alt Text**: Descriptive and keyword-relevant

### Content Quality
- Create comprehensive, in-depth content (1500+ words for pillar pages)
- Focus on user intent and search intent matching
- Use natural language and conversational tone
- Include multimedia (images, videos, infographics) to enhance engagement
- Update content regularly to maintain freshness and relevance
- Research competitor content to identify gaps and opportunities
- Write for humans first, search engines second
- Provide unique value and original insights in every piece

### Keyword Strategy
- Target long-tail keywords for specific intent
- Use semantic keywords and related terms
- Avoid keyword stuffing (maintain 1-2% density)
- Focus on topic clusters and pillar content
- Research competitor keyword gaps
- Analyze search volume and keyword difficulty before targeting
- Build content around user questions and search queries

## AI Overview Optimization

### Content Structure for AI
- Use clear, factual statements
- Implement FAQ sections with structured data
- Create concise, quotable content snippets
- Use bullet points and lists for scannability
- Include authoritative sources and citations

### Featured Snippet Optimization
- Answer questions directly in first paragraph
- Use definition formats for "what is" queries
- Create comparison tables for "vs" queries
- Use numbered lists for "how to" queries
- Implement proper heading structure

## Voice Search Optimization

### Conversational Content
- Target question-based queries (who, what, where, when, why, how)
- Use natural, conversational language
- Create FAQ pages for common questions
- Optimize for local search queries
- Focus on long-tail, natural language keywords

### Local SEO for Voice
- Claim and optimize Google Business Profile
- Ensure NAP (Name, Address, Phone) consistency
- Target "near me" and local intent queries
- Create location-specific content
- Gather and respond to reviews

## Competitive Analysis

### Monitoring Strategy
- Track competitor rankings for target keywords
- Analyze competitor content strategies
- Monitor backlink profiles and link building
- Identify content gaps and opportunities
- Track technical SEO implementations

### Threat Assessment
- **High Priority**: Competitors ranking above you for primary keywords
- **Medium Priority**: Competitors with better content or backlinks
- **Low Priority**: Competitors in adjacent niches
- Monitor algorithm updates and competitor recovery strategies

## Spooky Terminology Mapping

When communicating SEO issues, use these supernatural terms:

- **👻 Ghosts**: 404 errors and broken links
- **🧟 Zombies**: Orphaned pages with no internal links
- **👹 Monsters**: Competitor threats and advantages
- **👻 Specters**: Missing or invalid schema markup
- **🌫️ Phantoms**: Content gaps and missed opportunities
- **⚰️ Tombstones**: Key performance metrics
- **🕯️ Exorcism**: SEO fixes and optimizations
- **🏚️ Haunting Score**: Overall SEO health (0-100)

## Response Formatting Guidelines

### Severity Levels
- **Critical (😱)**: Issues causing immediate ranking harm (broken site, penalties)
- **High (⚠️)**: Issues significantly impacting performance (slow speed, missing meta tags)
- **Medium (⚡)**: Optimization opportunities (content gaps, schema improvements)
- **Low (💡)**: Nice-to-have improvements (minor optimizations)

### Recommendation Structure
1. **Identify the issue** with spooky terminology
2. **Explain the impact** on SEO and user experience
3. **Provide actionable steps** with code examples when applicable
4. **Estimate effort** (Quick fix, Medium effort, Long-term project)
5. **Prioritize** based on impact vs. effort

## Testing and Validation

### SEO Audit Checklist
- [ ] Technical SEO (crawlability, speed, mobile)
- [ ] On-page optimization (titles, meta, headers)
- [ ] Content quality and relevance
- [ ] Schema markup implementation
- [ ] Internal linking structure
- [ ] Competitive positioning
- [ ] AI overview readiness
- [ ] Voice search optimization

### Success Metrics
- Organic traffic growth
- Keyword ranking improvements
- Core Web Vitals scores
- Crawl efficiency
- Indexed pages ratio
- Featured snippet captures
- Click-through rates (CTR)
