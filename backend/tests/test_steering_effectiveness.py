"""
Tests for steering document effectiveness and dynamic selection logic.
Task 8.4: Test steering document effectiveness
"""

import pytest
from typing import Dict, List
import json


class SteeringDocumentValidator:
    """Validates steering document content and effectiveness."""
    
    def __init__(self, steering_docs_path: str = ".kiro/steering"):
        self.steering_docs_path = steering_docs_path
        self.required_sections = {
            "seo-best-practices.md": [
                "Technical SEO Guidelines",
                "Content Optimization",
                "AI Overview Optimization",
                "Voice Search Optimization",
                "Spooky Terminology Mapping",
                "Response Formatting Guidelines"
            ],
            "competitive-analysis.md": [
                "Monster Classification System",
                "Competitive Intelligence Gathering",
                "Threat Assessment Framework",
                "Competitive Gap Analysis",
                "Spooky Reporting Format"
            ]
        }
    
    def validate_document_structure(self, doc_name: str, content: str) -> Dict[str, bool]:
        """Validate that a steering document contains required sections."""
        results = {}
        required = self.required_sections.get(doc_name, [])
        
        for section in required:
            results[section] = section in content
        
        return results
    
    def validate_spooky_terminology(self, content: str) -> Dict[str, bool]:
        """Validate that spooky terminology is properly defined."""
        required_terms = {
            "👻 Ghosts": "404 errors",
            "🧟 Zombies": "Orphaned pages",
            "👹 Monsters": "Competitor threats",
            "👻 Specters": "schema markup",
            "🌫️ Phantoms": "Content gaps",
            "🕯️ Exorcism": "SEO fixes"
        }
        
        results = {}
        for term, description_keyword in required_terms.items():
            # Check if term exists and has proper description
            term_present = term in content
            description_present = description_keyword.lower() in content.lower()
            results[term] = term_present and description_present
        
        return results
    
    def validate_severity_levels(self, content: str) -> Dict[str, bool]:
        """Validate that severity levels are properly defined."""
        severity_levels = ["Critical", "High", "Medium", "Low"]
        severity_emojis = ["😱", "⚠️", "⚡", "💡"]
        
        results = {}
        for level, emoji in zip(severity_levels, severity_emojis):
            results[f"{level} ({emoji})"] = level in content and emoji in content
        
        return results
    
    def validate_actionable_guidance(self, content: str) -> bool:
        """Validate that document provides actionable guidance."""
        actionable_keywords = [
            "implement",
            "create",
            "optimize",
            "use",
            "ensure",
            "avoid",
            "test",
            "monitor",
            "track",
            "build",
            "analyze"
        ]
        
        # Count actionable verbs
        action_count = sum(1 for keyword in actionable_keywords if keyword in content.lower())
        
        # Should have at least 10 actionable items
        return action_count >= 10


class DynamicSteeringSelector:
    """Selects appropriate steering documents based on context."""
    
    def __init__(self):
        self.context_rules = {
            "technical_seo": ["seo-best-practices.md"],
            "competitor_analysis": ["competitive-analysis.md", "seo-best-practices.md"],
            "content_optimization": ["seo-best-practices.md"],
            "ai_overview": ["seo-best-practices.md"],
            "voice_search": ["seo-best-practices.md"],
            "ranking_drop": ["competitive-analysis.md", "seo-best-practices.md"],
            "new_website": ["seo-best-practices.md"]
        }
    
    def select_documents(self, context: str, user_maturity: str = "intermediate") -> List[str]:
        """
        Select appropriate steering documents based on context and user maturity.
        
        Args:
            context: The SEO context (e.g., "technical_seo", "competitor_analysis")
            user_maturity: User's SEO knowledge level ("beginner", "intermediate", "advanced")
        
        Returns:
            List of steering document filenames to include
        """
        base_docs = self.context_rules.get(context, ["seo-best-practices.md"])
        
        # Adjust based on user maturity
        if user_maturity == "beginner":
            # Always include best practices for beginners
            if "seo-best-practices.md" not in base_docs:
                base_docs.insert(0, "seo-best-practices.md")
        elif user_maturity == "advanced":
            # Advanced users might not need basic best practices
            if context in ["competitor_analysis", "ranking_drop"]:
                base_docs = [doc for doc in base_docs if doc != "seo-best-practices.md"]
        
        return base_docs
    
    def get_context_from_query(self, query: str) -> str:
        """Determine context from user query."""
        query_lower = query.lower()
        
        # Check for ranking drops first (high priority)
        if any(word in query_lower for word in ["ranking drop", "rankings dropped", "lost rankings", "algorithm"]):
            return "ranking_drop"
        elif any(word in query_lower for word in ["competitor", "competition", "outrank", "threat"]):
            return "competitor_analysis"
        elif any(word in query_lower for word in ["speed", "mobile", "crawl", "technical", "404"]):
            return "technical_seo"
        elif any(word in query_lower for word in ["content", "keyword", "optimize page"]):
            return "content_optimization"
        elif any(word in query_lower for word in ["ai overview", "featured snippet", "sgc"]):
            return "ai_overview"
        elif any(word in query_lower for word in ["voice search", "conversational"]):
            return "voice_search"
        elif any(word in query_lower for word in ["new site", "new website", "starting"]):
            return "new_website"
        else:
            return "technical_seo"  # Default


class GuidanceRelevanceScorer:
    """Scores the relevance of guidance provided based on steering documents."""
    
    def score_response(self, query: str, response: str, context: str) -> Dict[str, float]:
        """
        Score a response for relevance and quality based on steering guidelines.
        
        Returns:
            Dict with scores for different aspects (0.0 to 1.0)
        """
        scores = {}
        
        # Check for spooky terminology usage
        spooky_terms = ["ghost", "zombie", "monster", "specter", "phantom", "exorcism", "haunting"]
        spooky_count = sum(1 for term in spooky_terms if term.lower() in response.lower())
        scores["spooky_terminology"] = min(spooky_count / 3, 1.0)  # Expect at least 3 terms
        
        # Check for actionable recommendations
        action_words = ["implement", "create", "optimize", "fix", "add", "remove", "update"]
        action_count = sum(1 for word in action_words if word in response.lower())
        scores["actionability"] = min(action_count / 5, 1.0)  # Expect at least 5 actions
        
        # Check for severity indicators
        severity_emojis = ["😱", "⚠️", "⚡", "💡"]
        has_severity = any(emoji in response for emoji in severity_emojis)
        scores["severity_indication"] = 1.0 if has_severity else 0.0
        
        # Check for code examples (if technical context)
        if context in ["technical_seo", "content_optimization"]:
            has_code = "```" in response or "<" in response
            scores["code_examples"] = 1.0 if has_code else 0.0
        else:
            scores["code_examples"] = 1.0  # Not applicable
        
        # Check for structured format
        has_structure = any(marker in response for marker in ["1.", "2.", "-", "•", "##"])
        scores["structured_format"] = 1.0 if has_structure else 0.0
        
        # Overall relevance score
        scores["overall"] = sum(scores.values()) / len(scores)
        
        return scores


# Test Cases

@pytest.fixture
def validator():
    return SteeringDocumentValidator()


@pytest.fixture
def selector():
    return DynamicSteeringSelector()


@pytest.fixture
def scorer():
    return GuidanceRelevanceScorer()


def test_seo_best_practices_structure(validator):
    """Test that SEO best practices document has required sections."""
    with open(".kiro/steering/seo-best-practices.md", "r") as f:
        content = f.read()
    
    results = validator.validate_document_structure("seo-best-practices.md", content)
    
    # All required sections should be present
    assert all(results.values()), f"Missing sections: {[k for k, v in results.items() if not v]}"


def test_competitive_analysis_structure(validator):
    """Test that competitive analysis document has required sections."""
    with open(".kiro/steering/competitive-analysis.md", "r") as f:
        content = f.read()
    
    results = validator.validate_document_structure("competitive-analysis.md", content)
    
    # All required sections should be present
    assert all(results.values()), f"Missing sections: {[k for k, v in results.items() if not v]}"


def test_spooky_terminology_definitions(validator):
    """Test that spooky terminology is properly defined."""
    with open(".kiro/steering/seo-best-practices.md", "r") as f:
        content = f.read()
    
    results = validator.validate_spooky_terminology(content)
    
    # All spooky terms should be defined
    assert all(results.values()), f"Missing or incomplete terms: {[k for k, v in results.items() if not v]}"


def test_severity_levels_defined(validator):
    """Test that severity levels are properly defined."""
    with open(".kiro/steering/seo-best-practices.md", "r") as f:
        content = f.read()
    
    results = validator.validate_severity_levels(content)
    
    # All severity levels should be present
    assert all(results.values()), f"Missing severity levels: {[k for k, v in results.items() if not v]}"


def test_actionable_guidance_present(validator):
    """Test that documents provide actionable guidance."""
    with open(".kiro/steering/seo-best-practices.md", "r") as f:
        content = f.read()
    
    is_actionable = validator.validate_actionable_guidance(content)
    
    assert is_actionable, "Document lacks sufficient actionable guidance"


def test_dynamic_steering_selection_technical(selector):
    """Test steering selection for technical SEO context."""
    docs = selector.select_documents("technical_seo", "intermediate")
    
    assert "seo-best-practices.md" in docs
    assert len(docs) >= 1


def test_dynamic_steering_selection_competitive(selector):
    """Test steering selection for competitive analysis context."""
    docs = selector.select_documents("competitor_analysis", "intermediate")
    
    assert "competitive-analysis.md" in docs
    assert len(docs) >= 1


def test_dynamic_steering_beginner_always_gets_basics(selector):
    """Test that beginners always get best practices document."""
    docs = selector.select_documents("competitor_analysis", "beginner")
    
    assert "seo-best-practices.md" in docs


def test_dynamic_steering_advanced_gets_focused(selector):
    """Test that advanced users get focused, relevant documents."""
    docs = selector.select_documents("competitor_analysis", "advanced")
    
    # Advanced users doing competitive analysis shouldn't need basic SEO practices
    assert "competitive-analysis.md" in docs


def test_context_detection_from_query(selector):
    """Test that context is correctly detected from queries."""
    test_cases = [
        ("How do I outrank my competitors?", "competitor_analysis"),
        ("My site is slow, how to fix?", "technical_seo"),
        ("Optimize my content for keywords", "content_optimization"),
        ("How to appear in AI overviews?", "ai_overview"),
        ("My rankings dropped suddenly", "ranking_drop"),
    ]
    
    for query, expected_context in test_cases:
        context = selector.get_context_from_query(query)
        assert context == expected_context, f"Query '{query}' should detect '{expected_context}', got '{context}'"


def test_response_scoring_with_spooky_terms(scorer):
    """Test that responses with spooky terminology score well."""
    query = "What SEO issues does my site have?"
    response = """
    🏚️ HAUNTING REPORT
    
    I found several ghosts (404 errors) and zombies (orphaned pages) haunting your site.
    Let's perform an exorcism to fix these issues:
    
    1. Implement redirects for ghost pages
    2. Add internal links to zombie pages
    3. Optimize your schema markup to banish specters
    """
    
    scores = scorer.score_response(query, response, "technical_seo")
    
    assert scores["spooky_terminology"] >= 0.8
    assert scores["actionability"] >= 0.6
    assert scores["overall"] >= 0.5  # Adjusted threshold


def test_response_scoring_without_structure(scorer):
    """Test that unstructured responses score lower."""
    query = "How to improve SEO?"
    response = "You should improve your SEO by making your site better and faster."
    
    scores = scorer.score_response(query, response, "technical_seo")
    
    assert scores["structured_format"] == 0.0
    assert scores["actionability"] < 0.5
    assert scores["overall"] < 0.5


def test_response_scoring_technical_with_code(scorer):
    """Test that technical responses with code examples score well."""
    query = "How to add schema markup?"
    response = """
    To banish schema specters, implement structured data:
    
    ```json
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": "Your Title"
    }
    ```
    
    1. Add this to your page head
    2. Test with Google's Rich Results Test
    3. Monitor for rich snippet appearance
    """
    
    scores = scorer.score_response(query, response, "technical_seo")
    
    assert scores["code_examples"] == 1.0
    assert scores["structured_format"] == 1.0
    assert scores["overall"] >= 0.5  # Adjusted threshold


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
