# HealthMaps - Healthcare Analytics Portal

A complete healthcare analytics system with Supabase authentication, featuring patient management, health trends analysis, and comprehensive data visualization.

## 🚀 Features

- **User Authentication**: Secure email + password authentication via Supabase
- **Healthcare Analytics**: Advanced patient data analysis and insights
- **Patient Management**: Comprehensive patient records and monitoring
- **Health Trends**: Track and analyze healthcare trends over time
- **Modern UI**: Clean, responsive design with teal color scheme
- **Dashboard**: Real-time healthcare metrics and KPIs
- **Protected Routes**: Secure access to sensitive health data
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Comprehensive error display and validation

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM
- **Icons**: React Icons
- **Build Tool**: Vite

## 📁 Project Structure

```
src/
├── components/          # Reusable components
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context with Supabase
├── pages/              # Page components
│   ├── Login.tsx       # Login page with HealthMaps branding
│   ├── Register.tsx    # Registration page with matching design
│   └── Dashboard.tsx   # Healthcare analytics dashboard
├── App.tsx             # Main app with routing
└── main.tsx           # App entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account and project

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd final_year
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To get your Supabase credentials:
1. Go to [supabase.com](https://supabase.com)
2. Create a new project or use an existing one
3. Navigate to Project Settings > API
4. Copy the Project URL and anon public key

### 3. Configure Supabase Auth

In your Supabase project:
1. Go to Authentication > Settings
2. Ensure "Enable email confirmations" is set according to your preference
3. Configure your site URL and redirect URLs

### 4. Run the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📱 Pages & Features

### Login Page (`/login`)
- **Default landing page** with teal background and two-column layout
- Left side: HealthMaps branding with circular logo and tagline
- Right side: White card with "Client Access" login form
- Input fields: Email Address, Password
- Login and "Request Access" buttons
- Error and success message display
- Modern, professional healthcare portal design

### Registration Page (`/register`)
- Matching two-column design with HealthMaps branding
- Input fields: Username, Full Name, Email, Password, Confirm Password
- Password confirmation validation
- "Request Access" button with loading state
- Link to login page
- Comprehensive error handling
- User metadata storage (username, full name)

### Dashboard (`/dashboard`)
- **Protected route** - requires authentication
- Healthcare-focused sidebar navigation
- Real-time patient statistics and KPIs
- Analytics, Patients, and Trends sections
- User profile management
- Responsive design with teal accent colors

## 🔐 Authentication Flow

1. **Registration**: Users sign up with email, password, username, and full name
2. **Email Confirmation**: Optional (based on Supabase settings)
3. **Login**: Users authenticate with email and password
4. **Session Management**: Automatic session handling via Supabase
5. **Protected Routes**: Dashboard accessible only to authenticated users
6. **Logout**: Users can sign out and are redirected to login

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile devices
- **Modern Styling**: Clean Tailwind CSS design with cards, shadows, and rounded corners
- **Loading States**: Spinner animations during async operations
- **Error Messages**: Clear, user-friendly error display
- **Success Messages**: Green notifications for successful actions
- **Form Validation**: Client-side validation with visual feedback

## 🔧 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous public key | Yes |

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Deploy to Other Platforms

The `dist/` folder contains static files that can be deployed to any static hosting service.

## 🔒 Security Considerations

- Passwords are handled securely by Supabase
- Environment variables are used for sensitive data
- Input validation on both client and server side
- Protected routes prevent unauthorized access
- Session management handled by Supabase

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

1. **Environment Variables Not Working**: Ensure your `.env` file is in the root directory and variables are prefixed with `VITE_`
2. **Supabase Connection Issues**: Verify your Supabase URL and anon key are correct
3. **Authentication Errors**: Check your Supabase project settings and email confirmation settings
4. **Build Errors**: Ensure all dependencies are installed and TypeScript is properly configured

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review the [React Documentation](https://react.dev)
- Open an issue in the repository

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
