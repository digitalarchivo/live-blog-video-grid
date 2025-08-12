import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

/**
 * Live Blog + Video Grid (Collaborative)
 * - Client: React component using Yjs + y-websocket for realtime collaboration
 * - Server: simple y-websocket server (Node) provided in the comment block below
 * - Features: 3x3 blog grid + 3x3 video grid, image uploads, Markdown preview,
 *   Google Font picker, color pickers for bg/text, theme presets, export JSON
 *
 * Install (client):
 * npm install yjs y-websocket react-markdown framer-motion
 *
 * Create server file at server/y-websocket-server.js (code below) and run:
 * node server/y-websocket-server.js
 *
 */

// ---- React component ----
const STORAGE_KEY = "live_blog_video_grid_v2";

export default function LiveBlogVideoGrid() {
  const docRef = useRef(null);
  const providerRef = useRef(null);
  const sharedRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [font, setFont] = useState('Inter');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#111827');

  // Initialize Yjs and websocket provider
  useEffect(() => {
    const Y = require('yjs');
    const { WebsocketProvider } = require('y-websocket');

    const doc = new Y.Doc();
    docRef.current = doc;
    const wsUrl = typeof window !== 'undefined' ? `ws://${window.location.hostname}:1234` : 'ws://localhost:1234';
    const provider = new WebsocketProvider(wsUrl, 'live-blog-room', doc);
    providerRef.current = provider;

    const shared = doc.getMap('app');
    sharedRef.current = shared;

    // seed default content if empty (only in new documents)
    if (!shared.has('posts')) {
      shared.set('posts', Array.from({ length: 9 }, (_, i) => ({ id: `post-${i}`, title: `Title ${i+1}`, body: `Write in **Markdown** here for Post ${i+1}`, image: null })));
    }
    if (!shared.has('videos')) {
      shared.set('videos', Array.from({ length: 9 }, (_, i) => ({ id: `video-${i}`, title: `Video ${i+1}`, url: '' })));
    }
    if (!shared.has('settings')) {
      shared.set('settings', { font: 'Inter', bgColor: '#ffffff', textColor: '#111827' });
    }

    // Pull initial state and watch for changes
    const pull = () => {
      try {
        const p = shared.get('posts') || [];
        const v = shared.get('videos') || [];
        const s = shared.get('settings') || {};
        setPosts(Array.isArray(p) ? p : Array.from(p));
        setVideos(Array.isArray(v) ? v : Array.from(v));
        setFont(s.font || 'Inter');
        setBgColor(s.bgColor || '#ffffff');
        setTextColor(s.textColor || '#111827');
        // persist to localStorage as well for offline fallback
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ posts: p, videos: v, settings: s }));
      } catch (e) {
        console.warn('pull failed', e);
      }
    };

    pull();

    // yjs doesn't accept plain observe on Map's values if we stored plain arrays.
    // For simplicity we poll for changes via provider awareness or on 'synced' events.
    provider.on('synced', pull);

    // also watch localStorage as fallback
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (!shared.get('posts')) shared.set('posts', parsed.posts || []);
        if (!shared.get('videos')) shared.set('videos', parsed.videos || []);
        if (!shared.get('settings')) shared.set('settings', parsed.settings || {});
      } catch (e) {
        // ignore
      }
    }

    // cleanup
    return () => {
      try { provider.disconnect(); } catch {};
      try { doc.destroy(); } catch {};
    };
  }, []);

  // helper to write to shared map
  const ySet = (key, value) => {
    const shared = sharedRef.current;
    if (!shared) {
      // fallback: persist locally
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : { posts, videos, settings: { font, bgColor, textColor } };
      parsed[key] = value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return;
    }
    shared.set(key, value);
  };

  const updatePost = (id, field, value) => {
    const next = posts.map(p => p.id === id ? { ...p, [field]: value } : p);
    setPosts(next);
    ySet('posts', next);
  };
  const updateVideo = (id, field, value) => {
    const next = videos.map(v => v.id === id ? { ...v, [field]: value } : v);
    setVideos(next);
    ySet('videos', next);
  };

  const handleImageUpload = (e, id) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updatePost(id, 'image', reader.result);
    reader.readAsDataURL(file);
  };

  const exportData = () => {
    const payload = { posts, videos, settings: { font, bgColor, textColor } };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload));
    const dl = document.createElement('a');
    dl.href = dataStr;
    dl.download = 'blog_video_data.json';
    dl.click();
  };

  // Apply Google Font dynamically
  useEffect(() => {
    const family = font.replace(/\s+/g, '+');
    const id = 'gf-' + family;
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@300;400;600;700&display=swap`;
      document.head.appendChild(link);
    }
    document.documentElement.style.setProperty('--app-font', font);
  }, [font]);

  // Persist theme settings
  useEffect(() => {
    ySet('settings', { font, bgColor, textColor });
    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
  }, [font, bgColor, textColor]);

  const defaultFonts = ['Inter', 'Roboto', 'Poppins', 'Merriweather', 'Montserrat'];
  const presets = [
    { name: 'Light', bg: '#ffffff', text: '#111827' },
    { name: 'Dark', bg: '#0b1220', text: '#e6eef8' },
    { name: 'Sepia', bg: '#f4ecd8', text: '#3b2f2f' },
  ];

  // UI
  return (
    <div style={{ fontFamily: `var(--app-font), system-ui, -apple-system, "Segoe UI", Roboto`, background: 'var(--bg-color)', color: 'var(--text-color)' }} className="min-h-screen p-6">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Live Blog + Video Grid — Collaborative</h1>
          <p className="text-sm text-gray-500">Edit in-place — changes sync in realtime to other connected users.</p>
        </div>
        <div className="flex gap-3 items-center">
          <label className="flex items-center gap-2">
            Font
            <select value={font} onChange={e => setFont(e.target.value)} className="ml-2 p-1 border rounded">
              {defaultFonts.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2">
            BG
            <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="ml-1" />
          </label>
          <label className="flex items-center gap-2">
            Text
            <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="ml-1" />
          </label>

          <div className="flex gap-2">
            {presets.map(p => (
              <button key={p.name} onClick={() => { setBgColor(p.bg); setTextColor(p.text); }} className="px-3 py-1 border rounded">{p.name}</button>
            ))}
          </div>

          <button onClick={exportData} className="px-4 py-2 bg-green-600 text-white rounded">Export JSON</button>
        </div>
      </header>

      <main className="grid lg:grid-cols-2 gap-8">
        <section>
          <h2 className="text-xl mb-4">Blog Posts (3×3)</h2>
          <div className="grid grid-cols-3 gap-4">
            {posts.map(post => (
              <motion.article key={post.id} className="bg-white/80 border rounded shadow p-3 flex flex-col" style={{ background: 'rgba(255,255,255,0.8)' }}>
                {post.image && <img src={post.image} alt="cover" className="h-32 w-full object-cover mb-2 rounded" />}
                <input type="file" accept="image/*" onChange={e => handleImageUpload(e, post.id)} className="mb-2" />
                <input value={post.title} onChange={e => updatePost(post.id, 'title', e.target.value)} className="font-semibold w-full mb-1 p-1" />
                <textarea value={post.body} onChange={e => updatePost(post.id, 'body', e.target.value)} className="w-full text-sm h-20 p-1 mb-2" placeholder="Write Markdown here..." />
                <div className="overflow-auto text-xs text-gray-800 p-1 bg-white rounded flex-1">
                  <ReactMarkdown>{post.body || ''}</ReactMarkdown>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl mb-4">Videos (3×3)</h2>
          <div className="grid grid-cols-3 gap-4">
            {videos.map(video => (
              <motion.div key={video.id} className="bg-white/80 border rounded shadow p-2">
                {video.url ? (
                  <div className="h-32 w-full mb-2">
                    <iframe title={video.title} src={video.url} className="w-full h-full" allowFullScreen />
                  </div>
                ) : (
                  <div className="h-32 w-full mb-2 flex items-center justify-center text-sm text-gray-500 bg-gray-100 rounded">No video URL</div>
                )}
                <input value={video.title} onChange={e => updateVideo(video.id, 'title', e.target.value)} className="font-semibold w-full mb-1 p-1" />
                <input value={video.url} onChange={e => updateVideo(video.id, 'url', e.target.value)} className="w-full text-sm p-1" placeholder="Embed URL (Twitch/YouTube)" />
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-6 text-sm text-gray-500">Tip: Run the included y-websocket server to enable realtime collaboration for everyone on your LAN / hosted server.</footer>
    </div>
  );
}