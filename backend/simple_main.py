"""
Simple RankBeacon Backend - Real SEO Analysis without Playwright
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import aiohttp
from bs4 import BeautifulSoup
from typing import List, Optional
import random
import os
import re
import json
from urllib.parse import quote_plus

app = FastAPI(title="RankBeacon SEO Exorcist API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    url: str
    depth: int = 1
    include_competitors: bool = False
    use_js_rendering: bool = False

class Entity(BaseModel):
    type: str
    severity: str
    title: str
    description: str
    url: str
    fix_suggestion: str

@app.get("/")
async def root():
    return {
        "message": "👻 RankBeacon SEO Exorcist API",
        "status": "haunting",
        "version": "2.0.0 - Real Analysis"
    }

@app.get("/api/health")
async def health():
    return {"status": "healthy", "haunting_score": 100}

async def analyze_page(session, url: str):
    """Analyze a single page"""
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
            html = await response.text()
            status_code = response.status
            
        soup = BeautifulSoup(html, 'html.parser')
        return soup, status_code, None
    except Exception as e:
        return None, None, str(e)

async def find_internal_links(soup, base_url: str, max_links: int = 10):
    """Find internal links to crawl"""
    from urllib.parse import urljoin, urlparse
    
    links = soup.find_all('a', href=True)
    base_domain = urlparse(base_url).netloc
    
    internal_urls = set()
    for link in links:
        href = link['href']
        
        # Skip javascript, mailto, tel, and anchor links
        if href.startswith(('javascript:', 'mailto:', 'tel:', '#')):
            continue
        
        # Convert relative URLs to absolute
        full_url = urljoin(base_url, href)
        
        # Check if it's internal (same domain)
        link_domain = urlparse(full_url).netloc
        if link_domain == base_domain or link_domain == f"www.{base_domain}" or base_domain == f"www.{link_domain}":
            # Remove fragments
            full_url = full_url.split('#')[0]
            if full_url and full_url != base_url:
                internal_urls.add(full_url)
        
        if len(internal_urls) >= max_links:
            break
    
    return list(internal_urls)

async def analyze_competitors_with_google(session, url: str, title: str):
    """
    Use Google Custom Search API to find competitors
    Falls back gracefully if API key not configured
    """
    api_key = os.getenv('GOOGLE_API_KEY')
    search_engine_id = os.getenv('GOOGLE_CSE_ID')
    
    print(f"🔍 Google API Debug: API Key present: {bool(api_key)}, CSE ID present: {bool(search_engine_id)}")
    
    if not api_key or not search_engine_id:
        print("⚠️ Google API credentials not found, skipping competitor search")
        return []  # Gracefully return empty if not configured
    
    try:
        # Extract potential keywords from title
        keywords = re.sub(r'[^\w\s]', '', title).strip()
        print(f"🔍 Searching Google for keywords: '{keywords}'")
        
        if not keywords or len(keywords) < 3:
            print("⚠️ Keywords too short, skipping search")
            return []
        
        # Search Google for these keywords
        search_url = f"https://www.googleapis.com/customsearch/v1"
        params = {
            'key': api_key,
            'cx': search_engine_id,
            'q': keywords[:100],  # Limit query length
            'num': 5  # Get top 5 results
        }
        
        print(f"🌐 Making Google API request...")
        
        async with session.get(search_url, params=params, timeout=aiohttp.ClientTimeout(total=5)) as response:
            print(f"📡 Google API response status: {response.status}")
            
            if response.status != 200:
                error_text = await response.text()
                print(f"❌ Google API error: {error_text[:200]}")
                return []
            
            data = await response.json()
            print(f"✅ Google API returned {len(data.get('items', []))} results")
            
            competitors = []
            
            from urllib.parse import urlparse
            current_domain = urlparse(url).netloc
            
            for item in data.get('items', [])[:5]:
                competitor_url = item.get('link', '')
                competitor_domain = urlparse(competitor_url).netloc
                
                # Skip if it's the same domain
                if competitor_domain == current_domain:
                    continue
                
                competitors.append({
                    'url': competitor_url,
                    'title': item.get('title', 'Unknown'),
                    'snippet': item.get('snippet', '')
                })
            
            print(f"🎯 Found {len(competitors)} unique competitors")
            return competitors
    
    except Exception as e:
        # Fail gracefully - don't break the analysis
        print(f"❌ Google API exception: {str(e)}")
        return []

@app.post("/api/analyze")
async def analyze(request: AnalyzeRequest):
    """Analyze a website for REAL SEO issues"""
    
    url = request.url
    if not url.startswith('http'):
        url = f'https://{url}'
    
    try:
        all_entities = []
        pages_analyzed = 0
        total_issues = 0
        
        async with aiohttp.ClientSession() as session:
            # Analyze main page
            soup, status_code, error = await analyze_page(session, url)
            if error:
                raise HTTPException(status_code=400, detail=f"Failed to fetch website: {error}")
            
            pages_to_analyze = [url]
            
            # If depth > 1, find internal links to crawl
            if request.depth > 1 and soup:
                internal_links = await find_internal_links(soup, url, max_links=min(request.depth * 3, 10))
                pages_to_analyze.extend(internal_links[:request.depth - 1])
            
            # Analyze each page
            for page_url in pages_to_analyze:
                if pages_analyzed >= request.depth:
                    break
                    
                if page_url != url:
                    soup, status_code, error = await analyze_page(session, page_url)
                    if error:
                        continue
                
                pages_analyzed += 1
                
                # Parse HTML
                if not soup:
                    continue
                
                # Real SEO Analysis for this page
                page_issues = 0
        
                # Check for title tag
                title = soup.find('title')
                title_text = title.get_text().strip() if title else ""
                h1_text = soup.find('h1').get_text().strip() if soup.find('h1') else ""
                
                if not title or len(title_text) == 0:
                    # Suggest using H1 as title if available
                    suggested_title = h1_text[:60] if h1_text else "Your Page Title Here"
                    all_entities.append({
                        "type": "ghost",
                        "severity": "critical",
                        "title": "Missing Page Title",
                        "description": "No title tag found - critical for SEO",
                        "url": page_url,
                        "fix_suggestion": f"Add a descriptive <title> tag with your target keywords",
                        "suggested_code": f'<title>{suggested_title}</title>'
                    })
                    page_issues += 15
                elif len(title_text) > 60:
                    # Suggest shortened version
                    shortened_title = title_text[:57] + "..." if len(title_text) > 60 else title_text
                    all_entities.append({
                        "type": "specter",
                        "severity": "medium",
                        "title": "Title Too Long",
                        "description": f"Title is {len(title_text)} characters (recommended: 50-60)",
                        "url": page_url,
                        "fix_suggestion": "Shorten your title tag to 50-60 characters",
                        "current_content": title_text,
                        "suggested_code": f'<title>{shortened_title}</title>'
                    })
                    page_issues += 5
        
                # Get H1 tags early (needed for meta description generation)
                h1_tags = soup.find_all('h1')
        
                # Check for meta description
                meta_desc = soup.find('meta', attrs={'name': 'description'})
                if not meta_desc:
                    # Generate smart, contextual suggestion from page content
                    suggested_desc = None
                    
                    # Strategy 1: Use first meaningful paragraph (most reliable)
                    paragraphs = soup.find_all('p')
                    for p in paragraphs[:10]:  # Check first 10 paragraphs
                        p_text = p.get_text().strip()
                        # Skip very short paragraphs, navigation, or boilerplate text
                        skip_phrases = ['cookie', 'javascript', 'browser', 'click here', 'read more', 
                                       'learn more', 'sign up', 'subscribe', 'follow us', 'copyright']
                        if len(p_text) > 80 and not any(skip in p_text.lower() for skip in skip_phrases):
                            desc_text = ' '.join(p_text.split())  # Clean whitespace
                            if len(desc_text) > 157:
                                suggested_desc = desc_text[:157] + "..."
                            else:
                                suggested_desc = desc_text
                            break
                    
                    # Strategy 2: Combine H1 + first substantial paragraph
                    if not suggested_desc and h1_tags:
                        h1_text = h1_tags[0].get_text().strip()
                        # Find first paragraph with real content
                        for p in paragraphs[:10]:
                            p_text = p.get_text().strip()
                            if len(p_text) > 30:
                                p_text = ' '.join(p_text.split())
                                combined = f"{h1_text}. {p_text}"
                                if len(combined) > 157:
                                    suggested_desc = combined[:157] + "..."
                                else:
                                    suggested_desc = combined
                                break
                    
                    # Strategy 3: Extract from article/main content areas
                    if not suggested_desc:
                        main_content = soup.find(['article', 'main', 'section'])
                        if main_content:
                            # Get text from main content, skip nav/footer
                            content_text = main_content.get_text().strip()
                            content_text = ' '.join(content_text.split())
                            if len(content_text) > 80:
                                suggested_desc = content_text[:157] + "..." if len(content_text) > 157 else content_text
                    
                    # Strategy 4: Use any text content we can find
                    if not suggested_desc:
                        # Get all text, clean it up
                        all_text = soup.get_text().strip()
                        all_text = ' '.join(all_text.split())
                        # Remove common navigation/footer text
                        lines = [line for line in all_text.split('.') if len(line.strip()) > 30]
                        if lines:
                            suggested_desc = lines[0].strip()
                            if len(suggested_desc) > 157:
                                suggested_desc = suggested_desc[:157] + "..."
                    
                    # Strategy 5: Use title with intelligent context (last resort)
                    if not suggested_desc and title_text:
                        # Extract keywords from title
                        title_lower = title_text.lower()
                        
                        # Detect page type from title and structure
                        if any(word in title_lower for word in ['shop', 'store', 'buy', 'product', 'chocolate', 'farm']):
                            suggested_desc = f"Visit {title_text} to discover quality products and services. Browse our selection and find exactly what you need."
                        elif any(word in title_lower for word in ['about', 'who', 'team', 'company']):
                            suggested_desc = f"Learn about {title_text}. Discover our story, mission, and the team behind our work."
                        elif any(word in title_lower for word in ['contact', 'reach', 'get in touch']):
                            suggested_desc = f"{title_text} - Get in touch with us. We're here to answer your questions and help you get started."
                        elif any(word in title_lower for word in ['blog', 'news', 'article']):
                            suggested_desc = f"Read the latest from {title_text}. Stay updated with insights, tips, and news."
                        else:
                            # Generic but better than nothing
                            suggested_desc = f"Welcome to {title_text}. Explore our content and discover what we have to offer."
                    
                    # Absolute fallback
                    if not suggested_desc:
                        suggested_desc = "Explore this page to discover valuable information and resources tailored to your needs."
                    
                    # Ensure optimal length
                    suggested_desc = suggested_desc[:160] if len(suggested_desc) > 160 else suggested_desc
                    
                    all_entities.append({
                        "type": "ghost",
                        "severity": "high",
                        "title": "Missing Meta Description",
                        "description": "No meta description found - this is crucial for search results and click-through rates",
                        "url": page_url,
                        "fix_suggestion": f"Add a compelling meta description (150-160 characters) that:\n• Summarizes your page content\n• Includes target keywords naturally\n• Encourages clicks with a clear value proposition\n• Matches user search intent\n\nSuggested based on your content: \"{suggested_desc}\"",
                        "suggested_code": f'<meta name="description" content="{suggested_desc}">'
                    })
                    page_issues += 10
                elif meta_desc.get('content'):
                    # Check if existing description is too short or too long
                    desc_content = meta_desc.get('content', '')
                    if len(desc_content) < 50:
                        # Try to expand with page content
                        first_p = soup.find('p')
                        expansion_text = ""
                        if first_p:
                            p_text = first_p.get_text().strip()
                            p_text = ' '.join(p_text.split())
                            # Add relevant content from first paragraph
                            remaining_chars = 157 - len(desc_content)
                            if remaining_chars > 20:
                                expansion_text = " " + p_text[:remaining_chars]
                        
                        improved_desc = (desc_content + expansion_text).strip()[:160]
                        
                        all_entities.append({
                            "type": "specter",
                            "severity": "medium",
                            "title": "Meta Description Too Short",
                            "description": f"Meta description is only {len(desc_content)} characters (recommended: 150-160). Short descriptions miss opportunities to attract clicks.",
                            "url": page_url,
                            "fix_suggestion": f"Expand your meta description to 150-160 characters by:\n• Adding specific benefits or features\n• Including relevant keywords\n• Highlighting what makes your page unique\n• Adding a call-to-action\n\nCurrent: \"{desc_content}\"\nSuggested: \"{improved_desc}\"",
                            "current_content": desc_content,
                            "suggested_code": f'<meta name="description" content="{improved_desc}">'
                        })
                        page_issues += 5
                    elif len(desc_content) > 160:
                        # Smart truncation - try to end at a sentence or word boundary
                        shortened_desc = desc_content[:157]
                        # Try to end at last complete word
                        last_space = shortened_desc.rfind(' ')
                        if last_space > 140:  # Only if we're not cutting too much
                            shortened_desc = shortened_desc[:last_space]
                        shortened_desc = shortened_desc.rstrip('.,;:') + "..."
                        
                        all_entities.append({
                            "type": "specter",
                            "severity": "low",
                            "title": "Meta Description Too Long",
                            "description": f"Meta description is {len(desc_content)} characters (recommended: 150-160). Google will truncate it in search results.",
                            "url": page_url,
                            "fix_suggestion": f"Shorten your meta description to 150-160 characters by:\n• Removing redundant words\n• Focusing on the most important message\n• Keeping the key value proposition\n• Ending with a clear call-to-action\n\nCurrent ({len(desc_content)} chars): \"{desc_content}\"\nSuggested ({len(shortened_desc)} chars): \"{shortened_desc}\"",
                            "current_content": desc_content,
                            "suggested_code": f'<meta name="description" content="{shortened_desc}">'
                        })
                        page_issues += 3
        
                # Check for H1 tags (already defined earlier)
                if len(h1_tags) == 0:
                    # Suggest using title or first heading
                    suggested_h1 = title_text if title_text else "Your Main Heading Here"
                    all_entities.append({
                        "type": "zombie",
                        "severity": "high",
                        "title": "Missing H1 Tag",
                        "description": "No H1 heading found on the page",
                        "url": page_url,
                        "fix_suggestion": "Add one H1 tag with your primary keyword",
                        "suggested_code": f'<h1>{suggested_h1}</h1>'
                    })
                    page_issues += 10
                elif len(h1_tags) > 1:
                    # Show the actual H1s found
                    h1_list = [h1.get_text().strip()[:50] for h1 in h1_tags[:3]]
                    all_entities.append({
                        "type": "zombie",
                        "severity": "medium",
                        "title": "Multiple H1 Tags",
                        "description": f"Found {len(h1_tags)} H1 tags (recommended: 1)",
                        "url": page_url,
                        "fix_suggestion": "Use only one H1 tag per page",
                        "current_content": f"Found: {', '.join(h1_list)}",
                        "suggested_code": f'<!-- Keep only one H1, convert others to H2 -->\n<h1>{h1_list[0]}</h1>\n<h2>{h1_list[1] if len(h1_list) > 1 else "Subheading"}</h2>'
                    })
                    page_issues += 5
        
                # Check for images without alt text
                images = soup.find_all('img')
                images_without_alt = [img for img in images if not img.get('alt')]
                if len(images_without_alt) > 0:
                    # Get actual image sources and suggest SMART AI alt text
                    image_examples = []
                    for img in images_without_alt[:3]:  # Show first 3 examples
                        src = img.get('src', 'unknown')
                        # SMART AI ALT TEXT GENERATION
                        filename = src.split('/')[-1].split('.')[0] if src else 'image'
                        filename_lower = filename.lower()
                        
                        # Context-aware smart suggestions
                        if 'logo' in filename_lower:
                            suggested_alt = f"{title_text.split('-')[0].strip() if title_text else 'Company'} Logo"
                        elif 'hero' in filename_lower or 'banner' in filename_lower:
                            suggested_alt = f"{title_text[:40] if title_text else 'Welcome'} - Hero Banner"
                        elif 'product' in filename_lower:
                            product_name = filename.replace('product-', '').replace('product_', '')
                            suggested_alt = f"Product Image - {product_name.replace('-', ' ').replace('_', ' ').title()}"
                        elif 'team' in filename_lower or 'staff' in filename_lower or 'employee' in filename_lower:
                            person_name = filename.replace('team-', '').replace('staff-', '')
                            suggested_alt = f"Team Member - {person_name.replace('-', ' ').replace('_', ' ').title()}"
                        elif any(word in filename_lower for word in ['icon', 'button', 'arrow', 'chevron']):
                            suggested_alt = f"{filename.replace('-', ' ').replace('_', ' ').title()} Icon"
                        elif 'screenshot' in filename_lower or 'screen' in filename_lower:
                            suggested_alt = f"Screenshot - {filename.replace('screenshot-', '').replace('-', ' ').title()}"
                        elif 'chart' in filename_lower or 'graph' in filename_lower:
                            suggested_alt = f"Chart showing {filename.replace('chart-', '').replace('graph-', '').replace('-', ' ')}"
                        else:
                            # Default: clean up filename
                            suggested_alt = filename.replace('-', ' ').replace('_', ' ').title()
                        image_examples.append({
                            'src': src,
                            'suggested_alt': suggested_alt
                        })
                    
                    # Create code example with actual images
                    code_examples = '\n'.join([
                        f'<img src="{ex["src"]}" alt="{ex["suggested_alt"]}">'
                        for ex in image_examples
                    ])
                    
                    all_entities.append({
                        "type": "phantom",
                        "severity": "medium",
                        "title": "Images Missing Alt Text",
                        "description": f"{len(images_without_alt)} out of {len(images)} images lack alt text",
                        "url": page_url,
                        "fix_suggestion": "Add descriptive alt text to all images for accessibility and SEO",
                        "image_examples": image_examples,
                        "suggested_code": f'<!-- Examples of images needing alt text -->\n{code_examples}'
                    })
                    page_issues += len(images_without_alt) * 2
        
                # Check for broken internal links (simplified)
                links = soup.find_all('a', href=True)
                domain = page_url.split('/')[2] if len(page_url.split('/')) > 2 else ''
                internal_links = [link for link in links if link['href'].startswith('/') or (domain and domain in link['href'])]
                if len(internal_links) < 5:
                    all_entities.append({
                        "type": "zombie",
                        "severity": "low",
                        "title": "Few Internal Links",
                        "description": f"Only {len(internal_links)} internal links found",
                        "url": page_url,
                        "fix_suggestion": "Add more internal links to improve site structure and SEO"
                    })
                    page_issues += 3
        
                # Check for schema markup
                schema_scripts = soup.find_all('script', type='application/ld+json')
                if len(schema_scripts) == 0:
                    all_entities.append({
                        "type": "specter",
                        "severity": "medium",
                        "title": "No Schema Markup",
                        "description": "No structured data (JSON-LD) found",
                        "url": page_url,
                        "fix_suggestion": "Implement Schema.org markup for rich snippets"
                    })
                    page_issues += 8
                
                total_issues += page_issues
        
        # Calculate haunting score (0-100, higher is worse)
        haunting_score = min(100, total_issues)
        
        # Smart Competitor Analysis - Generate monster entities based on SEO health
        critical_issues = len([e for e in all_entities if e.get('severity') == 'critical'])
        high_issues = len([e for e in all_entities if e.get('severity') == 'high'])
        
        # Try to get real competitors from Google API
        competitors = []
        if request.include_competitors and soup:
            title_tag = soup.find('title')
            if title_tag:
                # Create a new session for Google API (the main session might be closed)
                async with aiohttp.ClientSession() as google_session:
                    competitors = await analyze_competitors_with_google(google_session, url, title_tag.get_text())
        
        # If we found real competitors from Google, always show them
        if competitors:
            competitor_list = "\n".join([f"- {c['title']}: {c['url']}" for c in competitors[:3]])
            all_entities.append({
                "type": "monster",
                "severity": "high",
                "title": "Real Competitors Detected",
                "description": f"Found {len(competitors)} competitors currently ranking for your keywords in Google search results",
                "url": url,
                "fix_suggestion": f"Top competitors ranking for your keywords:\n\n{competitor_list}\n\nAnalyze their SEO strategies, content quality, and technical implementation to identify opportunities.",
                "suggested_code": f"# Competitor Analysis Checklist:\n# 1. Compare title tags and meta descriptions\n# 2. Analyze content depth and structure\n# 3. Check their backlink profiles\n# 4. Review their technical SEO (schema, speed)\n# 5. Identify content gaps you can fill"
            })
        
        # If site has significant issues, competitors are likely outranking you
        elif haunting_score > 40 or critical_issues > 0:
            all_entities.append({
                "type": "monster",
                "severity": "high",
                "title": "Competitor Advantage Detected",
                "description": f"Your site has {len(all_entities)} SEO issues that competitors may be exploiting to outrank you",
                "url": url,
                "fix_suggestion": "Analyze top-ranking competitors for your target keywords. Focus on fixing critical issues first to close the gap.",
                "suggested_code": "# Recommended Actions:\n1. Identify your top 3 competitors\n2. Compare their title tags and meta descriptions\n3. Analyze their content depth and structure\n4. Check their backlink profiles\n5. Fix your critical issues to compete"
            })
        
        # If site has good structure but missing advanced features
        if haunting_score < 40 and len([e for e in all_entities if e.get('type') == 'specter']) > 0:
            all_entities.append({
                "type": "monster",
                "severity": "medium",
                "title": "Competitive Gap in Technical SEO",
                "description": "Competitors with better technical SEO (schema markup, structured data) may rank higher",
                "url": url,
                "fix_suggestion": "Implement advanced SEO features like Schema.org markup to compete with technically optimized competitors",
                "suggested_code": '<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "name": "Your Company",\n  "url": "' + url + '"\n}\n</script>'
            })
        
        # If site has content gaps (missing alt text, few links)
        phantom_count = len([e for e in all_entities if e.get('type') == 'phantom'])
        if phantom_count > 0 or len([e for e in all_entities if 'Few Internal Links' in e.get('title', '')]) > 0:
            all_entities.append({
                "type": "monster",
                "severity": "low",
                "title": "Content Strategy Opportunity",
                "description": "Competitors with richer content and better internal linking may capture more traffic",
                "url": url,
                "fix_suggestion": "Expand your content strategy: add descriptive alt text to images, create more internal links, and develop comprehensive content",
                "suggested_code": "# Content Improvement Checklist:\n- Add alt text to all images\n- Create 5+ internal links per page\n- Write comprehensive content (1500+ words for key pages)\n- Add multimedia (images, videos)\n- Update content regularly"
            })
        
        # Generate recommendations
        recommendations = [
            "Optimize your title tags and meta descriptions",
            "Ensure all images have descriptive alt text",
            "Implement proper heading hierarchy (H1-H6)",
            "Add Schema.org structured data markup",
            "Improve internal linking structure"
        ]
        
        return {
            "url": request.url,
            "haunting_score": haunting_score,
            "entities": all_entities[:20],  # Limit to 20 entities
            "recommendations": recommendations[:5],
            "analysis_complete": True,
            "pages_analyzed": pages_analyzed,
            "total_issues": len(all_entities)
        }
        
    except aiohttp.ClientError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch website: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
