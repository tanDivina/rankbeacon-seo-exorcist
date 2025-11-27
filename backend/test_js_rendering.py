"""
Quick test script to verify JavaScript rendering works
"""

import asyncio
from js_crawler import fetch_with_js

async def test_js_site():
    """Test fetching a JavaScript-heavy site"""
    print("🎭 Testing JavaScript rendering...")
    print("=" * 60)
    
    # Test with a known React SPA
    url = "https://react.dev"  # Official React docs - definitely a React app
    print(f"\n📍 Fetching: {url}")
    
    try:
        result = await fetch_with_js(url, timeout=30000)
        
        print(f"\n✅ Success!")
        print(f"   Status: {result['status_code']}")
        print(f"   Final URL: {result['url']}")
        print(f"   HTML Length: {len(result['html'])} characters")
        print(f"   Title: {result['title']}")
        print(f"   Meta Description: {result['meta_description'][:100] if result['meta_description'] else 'None'}...")
        print(f"   Links: {result['links_count']}")
        print(f"   Images: {result['images_count']}")
        print(f"   H1 Tags: {result['h1_count']}")
        
        # Check if we got real content
        if len(result['html']) > 5000 and result['title']:
            print("\n🎉 JavaScript rendering is working perfectly!")
            return True
        else:
            print("\n⚠️ Got response but content seems limited")
            return False
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return False

if __name__ == "__main__":
    success = asyncio.run(test_js_site())
    exit(0 if success else 1)
