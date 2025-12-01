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
            
        soup = BeautifulSoup(html, 'lxml')
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
                        "title": "👻 Missing Page Title",
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
                        "title": "👤 Title Too Long",
                        "description": f"Title is {len(title_text)} characters (recommended: 50-60)",
                        "url": page_url,
                        "fix_suggestion": "Shorten your title tag to 50-60 characters",
                        "current_content": title_text,
                        "suggested_code": f'<title>{shortened_title}</title>'
                    })
                    page_issues += 5
        
                # Check for meta description
                meta_desc = soup.find('meta', attrs={'name': 'description'})
                if not meta_desc:
                    # Generate smart suggestion from page content
                    first_p = soup.find('p')
                    
                    # Try to create a compelling description
                    if first_p and len(first_p.get_text().strip()) > 20:
                        # Use first paragraph, cleaned up
                        desc_text = first_p.get_text().strip()
                        # Remove extra whitespace
                        desc_text = ' '.join(desc_text.split())
                        # Truncate to 157 chars and add ellipsis
                        if len(desc_text) > 157:
                            suggested_desc = desc_text[:157] + "..."
                        else:
                            # Pad if too short
                            suggested_desc = desc_text + " Learn more about our services and offerings."
                            suggested_desc = suggested_desc[:160]
                    else:
                        # Fallback: use title + generic text
                        page_title = title_text if title_text else "this page"
                        suggested_desc = f"Learn more about {page_title}. Discover comprehensive information, resources, and insights to help you make informed decisions."[:160]
                    
                    all_entities.append({
                        "type": "ghost",
                        "severity": "high",
                        "title": "👻 Missing Meta Description",
                        "description": "No meta description found - this is crucial for search results",
                        "url": page_url,
                        "fix_suggestion": "Add a compelling meta description (150-160 characters) that summarizes your page and includes target keywords",
                        "suggested_code": f'<meta name="description" content="{suggested_desc}">'
                    })
                    page_issues += 10
                elif meta_desc.get('content'):
                    # Check if existing description is too short or too long
                    desc_content = meta_desc.get('content', '')
                    if len(desc_content) < 50:
                        all_entities.append({
                            "type": "specter",
                            "severity": "medium",
                            "title": "👤 Meta Description Too Short",
                            "description": f"Meta description is only {len(desc_content)} characters (recommended: 150-160)",
                            "url": page_url,
                            "fix_suggestion": "Expand your meta description to 150-160 characters for better search results",
                            "current_content": desc_content,
                            "suggested_code": f'<meta name="description" content="{desc_content} Add more compelling details about your page content to reach the optimal length of 150-160 characters."[:160]>'
                        })
                        page_issues += 5
                    elif len(desc_content) > 160:
                        shortened_desc = desc_content[:157] + "..."
                        all_entities.append({
                            "type": "specter",
                            "severity": "low",
                            "title": "👤 Meta Description Too Long",
                            "description": f"Meta description is {len(desc_content)} characters (recommended: 150-160)",
                            "url": page_url,
                            "fix_suggestion": "Shorten your meta description to 150-160 characters to avoid truncation in search results",
                            "current_content": desc_content,
                            "suggested_code": f'<meta name="description" content="{shortened_desc}">'
                        })
                        page_issues += 3
        
                # Check for H1 tags
                h1_tags = soup.find_all('h1')
                if len(h1_tags) == 0:
                    # Suggest using title or first heading
                    suggested_h1 = title_text if title_text else "Your Main Heading Here"
                    all_entities.append({
                        "type": "zombie",
                        "severity": "high",
                        "title": "🧟 Missing H1 Tag",
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
                        "title": "🧟 Multiple H1 Tags",
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
                        "title": "🌫️ Images Missing Alt Text",
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
                        "title": "🧟 Few Internal Links",
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
                        "title": "👤 No Schema Markup",
                        "description": "No structured data (JSON-LD) found",
                        "url": page_url,
                        "fix_suggestion": "Implement Schema.org markup for rich snippets"
                    })
                    page_issues += 8
                
                total_issues += page_issues
        
        # Calculate haunting score (0-100, higher is worse)
        haunting_score = min(100, total_issues)
        
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
