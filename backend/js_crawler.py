"""
JavaScript-aware web crawler using Playwright
Handles SPAs and JavaScript-rendered content
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from playwright.async_api import async_playwright, Browser, Page, TimeoutError as PlaywrightTimeout

logger = logging.getLogger(__name__)

class JavaScriptCrawler:
    """Headless browser crawler for JavaScript-rendered sites"""
    
    def __init__(self):
        self.browser: Optional[Browser] = None
        self._playwright = None
        
    async def __aenter__(self):
        """Context manager entry"""
        await self.start()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        await self.close()
        
    async def start(self):
        """Initialize the browser"""
        if not self.browser:
            self._playwright = await async_playwright().start()
            self.browser = await self._playwright.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            logger.info("🌐 Playwright browser started")
    
    async def close(self):
        """Close the browser"""
        if self.browser:
            await self.browser.close()
            self.browser = None
        if self._playwright:
            await self._playwright.stop()
            self._playwright = None
            logger.info("🌐 Playwright browser closed")
    
    async def fetch_rendered_html(
        self, 
        url: str, 
        wait_for_selector: Optional[str] = None,
        timeout: int = 30000
    ) -> Dict[str, Any]:
        """
        Fetch fully rendered HTML after JavaScript execution
        
        Args:
            url: URL to fetch
            wait_for_selector: Optional CSS selector to wait for before capturing
            timeout: Maximum wait time in milliseconds
            
        Returns:
            Dict with html, title, meta_description, and other metadata
        """
        if not self.browser:
            await self.start()
        
        page: Page = await self.browser.new_page()
        
        try:
            # Set viewport and user agent
            await page.set_viewport_size({"width": 1920, "height": 1080})
            
            logger.info(f"🔍 Fetching JavaScript-rendered content from {url}")
            
            # Navigate to the page
            response = await page.goto(url, wait_until='networkidle', timeout=timeout)
            
            if not response:
                raise Exception("Failed to load page")
            
            # Wait for specific selector if provided
            if wait_for_selector:
                try:
                    await page.wait_for_selector(wait_for_selector, timeout=5000)
                except PlaywrightTimeout:
                    logger.warning(f"⚠️ Selector '{wait_for_selector}' not found, continuing anyway")
            
            # Wait for body to be populated (common for SPAs)
            try:
                await page.wait_for_selector('body', timeout=5000)
                # Wait for network to be mostly idle
                await page.wait_for_load_state('domcontentloaded')
            except PlaywrightTimeout:
                pass
            
            # Wait a bit more for any dynamic content
            await page.wait_for_timeout(3000)
            
            # Extract content
            html = await page.content()
            title = await page.title()
            
            # Get meta description
            meta_desc = await page.evaluate("""
                () => {
                    const meta = document.querySelector('meta[name="description"]');
                    return meta ? meta.getAttribute('content') : null;
                }
            """)
            
            # Get all links
            links = await page.evaluate("""
                () => {
                    return Array.from(document.querySelectorAll('a[href]')).length;
                }
            """)
            
            # Get all images
            images = await page.evaluate("""
                () => {
                    return Array.from(document.querySelectorAll('img')).length;
                }
            """)
            
            # Get h1 count
            h1_count = await page.evaluate("""
                () => {
                    return document.querySelectorAll('h1').length;
                }
            """)
            
            logger.info(f"✅ Successfully fetched {len(html)} chars of rendered HTML")
            
            return {
                'html': html,
                'title': title,
                'meta_description': meta_desc,
                'status_code': response.status,
                'url': page.url,  # Final URL after redirects
                'links_count': links,
                'images_count': images,
                'h1_count': h1_count,
            }
            
        except PlaywrightTimeout:
            logger.error(f"⏱️ Timeout loading {url}")
            raise Exception(f"Timeout loading page: {url}")
        except Exception as e:
            logger.error(f"❌ Error fetching {url}: {e}")
            raise
        finally:
            await page.close()


# Singleton instance for reuse
_crawler_instance: Optional[JavaScriptCrawler] = None

async def get_crawler() -> JavaScriptCrawler:
    """Get or create the global crawler instance"""
    global _crawler_instance
    if _crawler_instance is None:
        _crawler_instance = JavaScriptCrawler()
        await _crawler_instance.start()
    return _crawler_instance

async def fetch_with_js(url: str, timeout: int = 30000) -> Dict[str, Any]:
    """
    Convenience function to fetch a URL with JavaScript rendering
    
    Args:
        url: URL to fetch
        timeout: Maximum wait time in milliseconds
        
    Returns:
        Dict with rendered HTML and metadata
    """
    crawler = await get_crawler()
    return await crawler.fetch_rendered_html(url, timeout=timeout)
