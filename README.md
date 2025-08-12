# 🚀 Live Blog + Video Grid

A comprehensive, real-time collaborative blogging platform with Twitter Spaces integration, built with React, Yjs, and Supabase.

## ✨ Features

- **🔐 Passkey Authentication** - Secure login with WebAuthn (Face ID, Touch ID, Windows Hello)
- **📝 Real-time Collaboration** - Live editing with Yjs CRDT and presence indicators
- **🎨 Live Theme Editor** - Customize colors, fonts, spacing, and dark mode in real-time
- **📺 Twitter Spaces Integration** - Stream directly to Twitter with OBS integration
- **💾 Database Persistence** - All content and themes saved to Supabase
- **🌐 Free Hosting Ready** - Deploy to Vercel (frontend) and Render (backend)
- **📱 Responsive Design** - Works on all devices with beautiful animations

## 🏗️ Architecture

```
Frontend (React + Vercel)
├── Passkey Authentication
├── Live Theme Editor
├── Real-time Blog Grid (3x3)
└── Twitter Spaces Integration

Backend (Y-WebSocket + Render)
├── Yjs Collaboration Server
├── WebSocket Connections
└── Document Persistence

Database (Supabase)
├── User Profiles
├── Blog Posts
├── Theme Settings
├── Twitter Streams
└── Yjs Documents
```

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd live-blog-video-grid
npm install
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to SQL Editor and run the contents of `database-schema.sql`
4. Copy your project URL and anon key from Settings > API

### 3. Configure Environment

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` with your Supabase credentials:

```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_WEBSOCKET_URL=ws://localhost:1234
```

### 4. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run start          # React frontend
npm run server         # Y-WebSocket backend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend**: ws://localhost:1234

## 🎯 Usage

### Authentication
- Click "Sign In" to register with passkey
- Use your device's biometric authentication (Face ID, Touch ID, etc.)
- No passwords required!

### Blog Editing
- Click "Edit" on any blog post to start editing
- Changes sync in real-time across all connected users
- See presence indicators for other users
- Use Cmd+Enter to save, Escape to cancel

### Theme Customization
- Click "🎨 Theme Editor" in the header
- Customize colors, fonts, spacing, and more
- Changes apply instantly
- Themes are automatically saved to your account

### Twitter Streaming
- Click "Start New Stream" in the Twitter Spaces section
- Enter your OBS stream key
- Go live directly to Twitter
- Embed Twitter Spaces URLs for enhanced integration

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Connect your repo to [vercel.com](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Backend (Render)

1. Connect your GitHub repo to [render.com](https://render.com)
2. Create a new Web Service
3. Set environment variables:
   - `NODE_ENV=production`
   - `SUPABASE_URL=your_supabase_url`
   - `SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`
4. Deploy and get your WebSocket URL

### Update Frontend Environment

Update your Vercel environment variables with the Render WebSocket URL:

```env
REACT_APP_WEBSOCKET_URL=wss://your-app.onrender.com
```

## 🔧 Configuration

### Supabase Setup

1. **Authentication**: Enable Email/Password in Authentication > Settings
2. **Row Level Security**: Already configured in the schema
3. **Storage**: Enable storage for future file uploads
4. **Edge Functions**: Optional for enhanced features

### Custom Domains

- **Frontend**: Add custom domain in Vercel dashboard
- **Backend**: Add custom domain in Render dashboard
- **Database**: Supabase provides custom domains for Pro plans

## 🛠️ Development

### Project Structure

```
src/
├── components/          # React components
│   ├── LiveBlog.js     # Main blog grid with Yjs
│   ├── ThemeEditor.js  # Live theme customization
│   └── TwitterSpaces.js # Twitter streaming integration
├── contexts/           # React contexts
│   ├── AuthContext.js  # Passkey authentication
│   └── ThemeContext.js # Theme management
├── config/             # Configuration files
│   └── supabase.js     # Supabase client setup
└── styles/             # Styled components and CSS
```

### Key Technologies

- **Frontend**: React 19, Styled Components, Framer Motion
- **Backend**: Node.js, Y-WebSocket, WebSocket
- **Database**: Supabase (PostgreSQL)
- **Authentication**: WebAuthn, Supabase Auth
- **Real-time**: Yjs CRDT, WebSocket
- **Deployment**: Vercel, Render

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **New Contexts**: Add to `src/contexts/`
3. **Database Changes**: Update `database-schema.sql`
4. **API Endpoints**: Add to backend server

## 🔒 Security

- **Passkey Authentication**: Uses WebAuthn standard
- **Row Level Security**: Database-level access control
- **Environment Variables**: Sensitive data never committed
- **HTTPS Only**: Production deployments use secure connections
- **Input Validation**: Client and server-side validation

## 📊 Performance

- **Lazy Loading**: Components load on demand
- **Optimized Bundles**: Vercel optimizes builds automatically
- **CDN**: Global content delivery via Vercel
- **Database Indexes**: Optimized queries with proper indexing
- **WebSocket**: Efficient real-time communication

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**
   - Check if backend server is running
   - Verify WebSocket URL in environment
   - Check firewall/network settings

2. **Passkey Not Working**
   - Ensure HTTPS in production
   - Check browser compatibility
   - Verify Supabase configuration

3. **Theme Not Saving**
   - Check Supabase connection
   - Verify user authentication
   - Check browser console for errors

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debug', 'y-websocket,yjs,supabase');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Issues**: Create GitHub issue
- **Documentation**: Check this README
- **Community**: Join our Discord/community

## 🎉 What's Next?

- [ ] File uploads and media management
- [ ] Advanced collaboration features
- [ ] Analytics and insights
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] Advanced theming system
- [ ] Multi-language support

---

Built with ❤️ using modern web technologies
