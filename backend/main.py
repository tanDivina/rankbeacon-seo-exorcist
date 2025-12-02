"""
RankBeacon SEO Exorcist - FastAPI Backend
AI-powered SEO monitoring with supernatural twist
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional
import asyncio
import httpx
from datetime import datetime
import logging

# Configure logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import JS crawler (optional)
try:
    from js_crawler import fetch_with_js
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    logger.warning("⚠️ Playwright not available - JS rendering disabled")

app = FastAPI(
    title="RankBeacon SEO Exorcist API",
    description="AI-powered SEO monitoring with supernatural twist 👻",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS middleware for frontend communication
# In production, replace "*" with your specific frontend domain
import os
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = allowed_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins if allow_origins != ["*"] else [
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True if allow_origins != ["*"] else False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class WebsiteAnalysisRequest(BaseModel):
    url: HttpUrl
    depth: int = 1
    include_competitors: bool = False
    use_js_rendering: bool = True  # Enable JavaScript rendering by default

class SEOEntity(BaseModel):
    type: str  # ghost, zombie, monster, specter
    severity: str  # low, medium, high, critical
    title: str
    description: str
    url: Optional[str] = None
    fix_suggestion: str
    haunting_since: Optional[datetime] = None

class SEOAnalysisResponse(BaseModel):
    url: str
    haunting_score: int  # 0-100, lower is better
    entities: List[SEOEntity]
    recommendations: List[str]
    analysis_timestamp: datetime
    exorcism_available: bool
    warning: Optional[str] = None  # Warning message for JS rendering issues

# In-memory storage for demo (replace with Redis/PostgreSQL in production)
analysis_cache: Dict[str, SEOAnalysisResponse] = {}

@app.get("/")
async def root():
    """Welcome endpoint with spooky greeting"""
    return {
        "message": "👻 Welcome to RankBeacon SEO Exorcist API",
        "status": "haunted",
        "version": "1.0.0",
        "endpoints": {
            "analyze": "/api/analyze",
            "entities": "/api/entities/{url}",
            "exorcise": "/api/exorcise",
            "docs": "/api/docs"
        }
    }

@app.post("/api/analyze", response_model=SEOAnalysisResponse)
async def analyze_website(request: WebsiteAnalysisRequest, background_tasks: BackgroundTasks):
    """
    Perform comprehensive SEO analysis and detect supernatural entities
    """
    url_str = str(request.url)
    logger.info(f"👻 Starting SEO exorcism for {url_str}")
    
    try:
        # Check cache first
        if url_str in analysis_cache:
            logger.info(f"📋 Returning cached analysis for {url_str}")
            return analysis_cache[url_str]
        
        # Perform basic website crawling with proper headers
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.get(url_str, headers=headers)
            response.raise_for_status()
            
            # Check if we got a minimal HTML with JS redirect
            if len(response.text) < 500 and 'window.location' in response.text:
                logger.info(f"🔄 Detected JS redirect, attempting to follow...")
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Try to extract redirect URL from common patterns
                script_tags = soup.find_all('script')
                for script in script_tags:
                    if script.string and 'window.location' in script.string:
                        # Simple extraction for window.location.href="..."
                        import re
                        match = re.search(r'window\.location\.href\s*=\s*["\']([^"\']+)["\']', script.string)
                        if match:
                            redirect_path = match.group(1)
                            # Handle relative URLs
                            if redirect_path.startswith('/'):
                                from urllib.parse import urlparse
                                parsed = urlparse(url_str)
                                redirect_url = f"{parsed.scheme}://{parsed.netloc}{redirect_path}"
                            else:
                                redirect_url = redirect_path
                            
                            logger.info(f"🔄 Following redirect to: {redirect_url}")
                            response = await client.get(redirect_url, headers=headers)
                            response.raise_for_status()
                            break
            
        logger.info(f"📄 Fetched {len(response.text)} characters of HTML")
        
        # Check if this is a heavily JS-rendered site
        is_js_heavy = (
            len(response.text) < 1000 and 
            ('<div id="root"></div>' in response.text or 
             '<div id="app"></div>' in response.text or
             'defer' in response.text.lower())
        )
        
        # Use JavaScript rendering if needed and enabled
        html_content = response.text
        js_rendering_warning = None
        
        if is_js_heavy and request.use_js_rendering and PLAYWRIGHT_AVAILABLE:
            logger.info(f"🎭 Using JavaScript rendering for {url_str}")
            try:
                js_result = await fetch_with_js(url_str, timeout=30000)
                html_content = js_result['html']
                is_js_heavy = False  # We now have the rendered content
                logger.info(f"✅ JavaScript rendering successful - {len(html_content)} chars")
            except Exception as e:
                logger.error(f"❌ JavaScript rendering failed: {e}")
                logger.warning(f"⚠️ Falling back to static HTML analysis")
                js_rendering_warning = "JavaScript rendering failed - analyzing static HTML only"
        elif is_js_heavy and request.use_js_rendering and not PLAYWRIGHT_AVAILABLE:
            logger.warning(f"⚠️ JS rendering requested but not available - analyzing static HTML")
            js_rendering_warning = "⚠️ This site relies heavily on JavaScript rendering. Sites that require JS to display content are already failing SEO best practices, as search engines prefer server-side rendered content for better indexing and performance."
        elif is_js_heavy:
            logger.warning(f"⚠️ Detected JavaScript-heavy site - analysis may be limited")
            js_rendering_warning = "This site appears to be JavaScript-heavy. Enable JS rendering for more accurate analysis."
        
        # Analyze the HTML content
        entities = await detect_seo_entities(url_str, html_content, is_js_heavy)
        haunting_score = calculate_haunting_score(entities)
        
        analysis = SEOAnalysisResponse(
            url=url_str,
            haunting_score=haunting_score,
            entities=entities,
            recommendations=generate_exorcism_recommendations(entities),
            analysis_timestamp=datetime.now(),
            exorcism_available=len(entities) > 0,
            warning=js_rendering_warning
        )
        
        # Cache the result
        analysis_cache[url_str] = analysis
        
        # Schedule background competitive analysis if requested
        if request.include_competitors:
            background_tasks.add_task(analyze_competitors, url_str)
        
        logger.info(f"✅ Analysis complete for {url_str} - Haunting Score: {haunting_score}")
        return analysis
        
    except httpx.RequestError as e:
        logger.error(f"❌ Failed to crawl {url_str}: {e}")
        raise HTTPException(status_code=400, detail=f"Failed to crawl website: {str(e)}")
    except Exception as e:
        logger.error(f"💀 Unexpected error analyzing {url_str}: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during analysis")

@app.get("/api/entities/{url:path}")
async def get_entities(url: str):
    """Get detected SEO entities for a specific URL"""
    if url not in analysis_cache:
        raise HTTPException(status_code=404, detail="No analysis found for this URL")
    
    analysis = analysis_cache[url]
    return {
        "url": url,
        "entities": analysis.entities,
        "last_updated": analysis.analysis_timestamp
    }

@app.post("/api/exorcise")
async def exorcise_entity(entity_data: Dict[str, Any]):
    """
    Perform exorcism (fix) for a specific SEO entity
    """
    entity_type = entity_data.get("type")
    url = entity_data.get("url")
    
    logger.info(f"🕯️ Performing exorcism for {entity_type} on {url}")
    
    # Mock exorcism logic (replace with real fix implementations)
    exorcism_steps = {
        "ghost": [
            "Create 301 redirect to relevant page",
            "Update internal links",
            "Remove from sitemap if necessary"
        ],
        "zombie": [
            "Add internal links from relevant pages",
            "Update navigation structure",
            "Improve content discoverability"
        ],
        "monster": [
            "Analyze competitor strategy",
            "Identify content gaps",
            "Develop counter-strategy"
        ],
        "specter": [
            "Add missing schema markup",
            "Validate structured data",
            "Test rich snippets"
        ]
    }
    
    steps = exorcism_steps.get(entity_type, ["Generic SEO improvement steps"])
    
    return {
        "status": "exorcism_initiated",
        "entity_type": entity_type,
        "steps": steps,
        "estimated_completion": "24-48 hours",
        "follow_up_required": True
    }

@app.get("/api/health")
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "alive",
        "timestamp": datetime.now(),
        "services": {
            "api": "operational",
            "crawler": "operational",
            "ai_analysis": "operational"
        }
    }

@app.get("/api/debug/fetch")
async def debug_fetch(url: str):
    """Debug endpoint to see what HTML we're actually fetching"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    }
    
    async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
        response = await client.get(url, headers=headers)
        
        # Check for JS redirect
        if len(response.text) < 500 and 'window.location' in response.text:
            from bs4 import BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            script_tags = soup.find_all('script')
            for script in script_tags:
                if script.string and 'window.location' in script.string:
                    import re
                    match = re.search(r'window\.location\.href\s*=\s*["\']([^"\']+)["\']', script.string)
                    if match:
                        redirect_path = match.group(1)
                        if redirect_path.startswith('/'):
                            from urllib.parse import urlparse
                            parsed = urlparse(url)
                            redirect_url = f"{parsed.scheme}://{parsed.netloc}{redirect_path}"
                        else:
                            redirect_url = redirect_path
                        response = await client.get(redirect_url, headers=headers)
                        break
        
    from bs4 import BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')
    
    return {
        "url": url,
        "status_code": response.status_code,
        "html_length": len(response.text),
        "title": soup.find('title').string if soup.find('title') else None,
        "h1_count": len(soup.find_all('h1')),
        "meta_description": soup.find('meta', attrs={'name': 'description'}).get('content') if soup.find('meta', attrs={'name': 'description'}) else None,
        "link_count": len(soup.find_all('a')),
        "image_count": len(soup.find_all('img')),
        "html_preview": response.text[:1000]
    }

# Helper functions
async def detect_seo_entities(url: str, html_content: str, is_js_heavy: bool = False) -> List[SEOEntity]:
    """
    Analyze HTML content and detect SEO entities (ghosts, zombies, etc.)
    Enhanced with more detailed analysis
    """
    entities = []
    from bs4 import BeautifulSoup
    
    try:
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Debug logging
        logger.info(f"🔍 Parsing HTML - Length: {len(html_content)} chars")
        
        # Add warning for JS-heavy sites
        if is_js_heavy:
            entities.append(SEOEntity(
                type="phantom",
                severity="high",
                title="JavaScript-Rendered Content Detected",
                description="This site uses heavy JavaScript rendering. Our crawler sees limited content. Consider server-side rendering (SSR) or static site generation (SSG) for better SEO.",
                url=url,
                fix_suggestion="Implement SSR/SSG with Next.js, Nuxt.js, or pre-rendering. Ensure critical content is in initial HTML for search engines."
            ))
        
        # Check for missing title
        title = soup.find('title')
        logger.info(f"📝 Title found: {title.string if title else 'None'}")
        if not title or not title.string or len(title.string.strip()) == 0:
            entities.append(SEOEntity(
                type="specter",
                severity="critical",
                title="Missing Title Tag Specter",
                description="Page is missing a title tag - critical for SEO",
                url=url,
                fix_suggestion="Add <title>Your Page Title Here</title> in the <head> section"
            ))
        elif len(title.string) < 30:
            entities.append(SEOEntity(
                type="specter",
                severity="medium",
                title="Short Title Tag",
                description=f"Title is only {len(title.string)} characters (recommended: 50-60)",
                url=url,
                fix_suggestion="Expand title to 50-60 characters with relevant keywords"
            ))
        
        # Check for missing meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        if not meta_desc or not meta_desc.get('content'):
            entities.append(SEOEntity(
                type="specter",
                severity="high",
                title="Missing Meta Description Specter",
                description="No meta description found - impacts click-through rates",
                url=url,
                fix_suggestion='Add <meta name="description" content="Your description here"> in <head>'
            ))
        
        # Check for missing H1
        h1_tags = soup.find_all('h1')
        if len(h1_tags) == 0:
            entities.append(SEOEntity(
                type="zombie",
                severity="high",
                title="Missing H1 Zombie",
                description="No H1 heading found - important for page structure",
                url=url,
                fix_suggestion="Add a single <h1> tag with your main page heading"
            ))
        elif len(h1_tags) > 1:
            entities.append(SEOEntity(
                type="zombie",
                severity="medium",
                title="Multiple H1 Tags",
                description=f"Found {len(h1_tags)} H1 tags (recommended: 1 per page)",
                url=url,
                fix_suggestion="Use only one H1 tag per page, use H2-H6 for subheadings"
            ))
        
        # Check for images without alt text
        images = soup.find_all('img')
        images_without_alt = [img for img in images if not img.get('alt')]
        if images_without_alt:
            entities.append(SEOEntity(
                type="phantom",
                severity="medium",
                title="Images Missing Alt Text",
                description=f"{len(images_without_alt)} of {len(images)} images lack alt text",
                url=url,
                fix_suggestion="Add descriptive alt attributes to all images for accessibility and SEO"
            ))
        
        # Check for broken internal links (simplified check)
        links = soup.find_all('a', href=True)
        if len(links) < 3:
            entities.append(SEOEntity(
                type="zombie",
                severity="medium",
                title="Orphaned Page - Few Internal Links",
                description=f"Only {len(links)} links found - page may be isolated",
                url=url,
                fix_suggestion="Add more internal links to improve site navigation and SEO"
            ))
        
        # Check for missing schema markup
        schema_script = soup.find('script', type='application/ld+json')
        if not schema_script:
            entities.append(SEOEntity(
                type="specter",
                severity="low",
                title="Missing Schema Markup",
                description="No structured data (Schema.org) found",
                url=url,
                fix_suggestion="Add JSON-LD structured data for rich snippets"
            ))
        
        # Check content length
        text_content = soup.get_text()
        word_count = len(text_content.split())
        if word_count < 300:
            entities.append(SEOEntity(
                type="phantom",
                severity="high",
                title="Thin Content Phantom",
                description=f"Only {word_count} words found (recommended: 300+ for most pages)",
                url=url,
                fix_suggestion="Add more comprehensive, valuable content to improve rankings"
            ))
        
    except Exception as e:
        logger.error(f"Error parsing HTML: {e}")
        entities.append(SEOEntity(
            type="ghost",
            severity="high",
            title="Analysis Error",
            description="Could not fully analyze page structure",
            url=url,
            fix_suggestion="Ensure page is accessible and has valid HTML"
        ))
    
    return entities

def calculate_haunting_score(entities: List[SEOEntity]) -> int:
    """Calculate overall haunting score based on detected entities"""
    if not entities:
        return 5  # Minimal haunting for perfect sites
    
    severity_weights = {
        "low": 5,
        "medium": 15,
        "high": 25,
        "critical": 40
    }
    
    total_score = sum(severity_weights.get(entity.severity, 10) for entity in entities)
    return min(total_score, 100)  # Cap at 100

def generate_exorcism_recommendations(entities: List[SEOEntity]) -> List[str]:
    """Generate prioritized recommendations for fixing SEO issues"""
    if not entities:
        return ["🎉 Your site is remarkably clean! No major entities detected."]
    
    recommendations = [
        "🕯️ Start with critical severity entities first",
        "👻 Focus on ghost entities (404s) for immediate impact",
        "🧟 Address zombie pages to improve site architecture",
        "📊 Monitor progress with regular re-analysis"
    ]
    
    return recommendations

async def analyze_competitors(url: str):
    """Background task for competitive analysis"""
    logger.info(f"🔍 Starting competitive analysis for {url}")
    # Implement competitor analysis logic
    await asyncio.sleep(5)  # Mock processing time
    logger.info(f"✅ Competitive analysis complete for {url}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
