'use client';

import { useState } from 'react';
import SpookyParticles from '../components/SpookyParticles';

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [useJsRendering, setUseJsRendering] = useState(true);

  const analyzeWebsite = async () => {
    if (!url) return;
    
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.startsWith('http') ? url : `https://${url}`,
          depth: 1,
          include_competitors: false,
          use_js_rendering: useJsRendering
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze website. Please check the URL and try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-gray-900 to-black text-white">
      {/* Spooky Particles */}
      <SpookyParticles />
      
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
            💡 Works best with static sites. Try: example.com, github.com, wikipedia.org, or bbc.com
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
            <div className="mt-8 bg-gray-800/50 backdrop-blur-md rounded-2xl p-12 border border-purple-500/30 text-center">
              <div className="flex justify-center space-x-4 mb-6">
                <span className="text-6xl animate-ghost-float">👻</span>
                <span className="text-6xl animate-float" style={{animationDelay: '0.5s'}}>🔮</span>
                <span className="text-6xl animate-ghost-float" style={{animationDelay: '1s'}}>🕯️</span>
              </div>
              <h3 className="text-2xl font-bold mb-2 animate-pulse">Performing Dark Rituals...</h3>
              <p className="text-gray-400 animate-pulse-glow">Summoning SEO spirits from the digital realm</p>
              <div className="mt-6 flex justify-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
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
                <div className="flex items-center justify-center space-x-4 my-6">
                  <span className={`text-7xl font-bold bg-gradient-to-r ${
                    result.haunting_score < 20 ? 'from-green-400 to-emerald-400' :
                    result.haunting_score < 40 ? 'from-blue-400 to-cyan-400' :
                    result.haunting_score < 60 ? 'from-yellow-400 to-orange-400' :
                    result.haunting_score < 80 ? 'from-orange-400 to-red-400' :
                    'from-red-400 to-pink-400'
                  } bg-clip-text text-transparent animate-pulse-glow drop-shadow-lg`}>
                    {result.haunting_score}
                  </span>
                  <div className="text-left">
                    <p className="text-3xl font-semibold text-gray-300">/ 100</p>
                    <p className="text-sm text-gray-400 uppercase tracking-wider">Haunting Score</p>
                  </div>
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

            {/* Entities Grid */}
            {result.entities && result.entities.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {result.entities.map((entity: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 backdrop-blur-md rounded-xl p-6 border border-purple-500/30 hover:border-purple-500/60 transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-4xl">
                        {entity.type === 'ghost' ? '👻' :
                         entity.type === 'zombie' ? '🧟' :
                         entity.type === 'monster' ? '👹' :
                         entity.type === 'specter' ? '👤' : '🌫️'}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        entity.severity === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/50' :
                        entity.severity === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/50' :
                        entity.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50' :
                        'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                      }`}>
                        {entity.severity.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{entity.title}</h4>
                    <p className="text-sm text-gray-400 mb-3">{entity.description}</p>
                    {entity.url && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">📍 Location:</p>
                        <p className="text-xs text-purple-300 font-mono break-all bg-gray-900/50 px-2 py-1 rounded">
                          {entity.url}
                        </p>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-700">
                      <p className="text-xs text-purple-400 font-semibold mb-1">🕯️ Exorcism Plan:</p>
                      <p className="text-sm text-gray-300">{entity.fix_suggestion}</p>
                    </div>
                  </div>
                ))}
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
            <p className="text-gray-400 text-sm">
              Built with 💜 for Kiroween Hackathon
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Banishing SEO demons since 2024 🔮
            </p>
          </div>
        </div>
      </footer>

      {/* Original Footer */}
      <footer className="relative z-10 border-t border-purple-800/30 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
          <p>Built with 💀 for the Kiroween Hackathon</p>
          <p className="text-sm mt-2">Ready to exorcise your SEO demons! 👻✨</p>
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
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
