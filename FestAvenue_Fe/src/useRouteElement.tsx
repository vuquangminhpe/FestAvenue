/* eslint-disable prefer-const */
/* eslint-disable react-refresh/only-export-components */
import { Navigate, Outlet, useLocation, useRoutes } from 'react-router'
import { Suspense, lazy } from 'react'
import path from './constants/path'
import { useAdminStore, useUsersStore, useStaffStore } from './contexts/app.context'
import IMG_LOGIN from '../public/Images/Login_Page.png'
import IMG_SIGNUP from '../public/Images/SignUp_Page.png'

const MainLayout = lazy(() => import('./layouts/MainLayout'))
const EventOwnerLayout = lazy(() => import('./layouts/EventOwnerLayout'))
const Home = lazy(() => import('./pages/User/Public/Home'))
const EventSearch = lazy(() => import('./pages/User/Public/EventSearch/EventSearch'))
const MyLayout = lazy(() => import('./layouts/MyLayout'))
const Login = lazy(() => import('./pages/User/Public/Login'))
const NotAuthLayout = lazy(() => import('./layouts/Not_Auth_Layout'))
const SignUp = lazy(() => import('./pages/User/Public/Signup/Signup'))
const VerifyEmail = lazy(() => import('./pages/User/Public/VerifyEmail/VerifyEmail'))
const UserProfile = lazy(() => import('./pages/User/Auth/My/MyProfile/UserProfile'))
const ForgotPassword = lazy(() => import('./pages/User/Public/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/User/Public/ResetPassword/ResetPassword'))
const ChatMyMessagesSystem = lazy(() => import('./pages/User/Auth/My/MyMessages'))
const MyPayment = lazy(() => import('./pages/User/Auth/My/MyPayment'))
const MyEvents = lazy(() => import('./pages/User/Auth/My/MyEvents'))
const PaymentEvent = lazy(() => import('./pages/User/Auth/Payment/PaymentEvent/PaymentEvent'))
const CreateEvent = lazy(() => import('./pages/User/Auth/Event/CreateEvent/CreateEvent'))
const ScheduleManagement = lazy(() => import('./pages/User/Auth/Schedule/ScheduleManagement'))
const EventAnalyticsDashboard = lazy(() => import('./pages/User/Auth/Event/EventAnalytics'))
const EventDetails = lazy(() => import('./pages/User/Auth/Event/EventDetails/EventDetails'))
const SocialMediaDetail = lazy(() => import('./pages/User/Auth/SocialMediaDetail/SocialMediaDetail'))
const StaffLogin = lazy(() => import('./pages/Staff/Auth/Login'))
const AdminLogin = lazy(() => import('./pages/Admin/Auth/Login'))
const StaffLayout = lazy(() => import('./layouts/StaffLayout'))
const AdminLayout = lazy(() => import('./layouts/AdminLayout'))
const StaffMessages = lazy(() => import('./pages/Staff/Process/Messages'))
const StaffEventManagement = lazy(() => import('./pages/Staff/Process/EventManagement'))
const Dashboard = lazy(() => import('./pages/Admin/Process/Dashboard'))
const Category = lazy(() => import('./pages/Admin/Process/Category'))
const Packages = lazy(() => import('./pages/Admin/Process/Packages'))
const AccountManagement = lazy(() => import('./pages/Admin/Process/Accounts'))
const Analytics = lazy(() => import('./pages/Admin/Process/Analytics'))
const SeatMapViewerPage = lazy(() => import('./pages/User/Auth/TicketManagement/SeatMapViewerPage'))
const UserManagementInEvents = lazy(() => import('./pages/User/Process/UserManagementInEvents/UserManagementInEvent'))
const SocialMediaManagement = lazy(() => import('./pages/User/Auth/SocialMediaManagement/SocialMediaManagement'))
const TicketManagement = lazy(() => import('./pages/User/Auth/TicketManagement/TicketManagement'))

const Loader = () => {
  // Pre-generate random values for stars to avoid re-calculation on each render
  const stars = Array.from({ length: 150 }, () => ({
    size: Math.random() * 2 + 0.5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    opacity: Math.random() * 0.8 + 0.2,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 3,
    glow: Math.random() * 4 + 2
  }))

  const shards = Array.from({ length: 30 }, (_, i) => ({
    angle: (i * 360) / 30,
    distance: 150 + Math.random() * 100,
    delay: i * 0.05
  }))

  const particles = Array.from({ length: 60 }, () => ({
    size: Math.random() * 4 + 2,
    color: Math.random() > 0.5 ? '255, 0, 255' : '0, 255, 255',
    angle: Math.random() * 360,
    distance: Math.random() * 300,
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 2
  }))

  return (
    <div
      className='flex flex-col items-center justify-center h-screen overflow-hidden relative'
      style={{
        background: 'linear-gradient(135deg, #000000 0%, #0a0a2e 30%, #16213e 60%, #0f0f23 100%)'
      }}
    >
      {/* Space Background - Stars */}
      <div className='absolute inset-0 overflow-hidden'>
        {stars.map((star, i) => (
          <div
            key={`star-${i}`}
            className='absolute bg-white'
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.left}%`,
              top: `${star.top}%`,
              opacity: star.opacity,
              animation: `twinkle ${star.duration}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
              borderRadius: '50%',
              boxShadow: `0 0 ${star.glow}px rgba(255, 255, 255, 0.8)`
            }}
          />
        ))}
      </div>

      {/* Dimensional Cracks */}
      <div className='absolute inset-0 overflow-hidden' style={{ opacity: 0.6 }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const angle = (i * 360) / 12
          const duration = 3 + (i % 3)
          return (
            <div
              key={`crack-${i}`}
              className='absolute'
              style={{
                left: '50%',
                top: '50%',
                width: '600px',
                height: '2px',
                background: `linear-gradient(90deg, transparent 0%, rgba(138, 43, 226, 0.8) 30%, rgba(75, 0, 130, 0.9) 50%, rgba(138, 43, 226, 0.8) 70%, transparent 100%)`,
                transformOrigin: '0% 50%',
                transform: `rotate(${angle}deg)`,
                boxShadow: '0 0 20px rgba(138, 43, 226, 0.6), 0 0 40px rgba(75, 0, 130, 0.4)',
                animation: `crackPulse ${duration}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          )
        })}
      </div>

      {/* Energy Shards Exploding */}
      <div className='absolute inset-0 overflow-hidden'>
        {shards.map((shard, i) => (
          <div
            key={`shard-${i}`}
            className='absolute'
            style={{
              left: '50%',
              top: '50%',
              width: '40px',
              height: '8px',
              background: `linear-gradient(90deg, rgba(255, 0, 255, 0.9), rgba(138, 43, 226, 0.6), rgba(0, 255, 255, 0.4))`,
              clipPath: 'polygon(0% 50%, 100% 0%, 100% 100%)',
              transformOrigin: '0% 50%',
              transform: `rotate(${shard.angle}deg)`,
              ['--distance' as any]: `${shard.distance}px`,
              animation: `shardExplode 3s ease-out infinite`,
              animationDelay: `${shard.delay}s`,
              boxShadow: '0 0 15px rgba(138, 43, 226, 0.8)'
            }}
          />
        ))}
      </div>

    {/* Wormhole/Portal Center */}
    <div
      className='absolute'
      style={{
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px'
      }}
    >
      {/* Multiple Rotating Rings */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={`ring-${i}`}
          className='absolute inset-0'
          style={{
            border: `${2 - i * 0.3}px solid`,
            borderColor: `rgba(${138 + i * 20}, ${43 + i * 40}, ${226 - i * 30}, ${0.6 - i * 0.1})`,
            borderRadius: '50%',
            transform: `scale(${1 - i * 0.15}) rotate(${i * 15}deg)`,
            animation: `ringRotate ${4 + i}s linear infinite ${i % 2 === 0 ? 'normal' : 'reverse'}`,
            boxShadow: `0 0 ${30 - i * 5}px rgba(138, 43, 226, ${0.6 - i * 0.1}), inset 0 0 ${20 - i * 3}px rgba(138, 43, 226, ${0.4 - i * 0.05})`
          }}
        />
      ))}

      {/* Central Vortex */}
      <div
        className='absolute'
        style={{
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          height: '120px',
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.9) 0%, rgba(75, 0, 130, 0.6) 40%, rgba(0, 0, 0, 0.9) 100%)',
          borderRadius: '50%',
          animation: 'vortexSpin 2s linear infinite',
          boxShadow: '0 0 60px rgba(138, 43, 226, 0.8), 0 0 120px rgba(75, 0, 130, 0.6), inset 0 0 40px rgba(138, 43, 226, 0.5)'
        }}
      />

      {/* Glitch Effect Layers */}
      <div
        className='absolute inset-0'
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(255, 0, 255, 0.1) 80%, transparent 100%)',
          animation: 'glitchEffect 0.3s steps(2, end) infinite'
        }}
      />
    </div>

      {/* Energy Particles */}
      <div className='absolute inset-0 overflow-hidden'>
        {particles.map((particle, i) => (
          <div
            key={`particle-${i}`}
            className='absolute'
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: '50%',
              top: '50%',
              background: `radial-gradient(circle, rgba(${particle.color}, 0.9) 0%, transparent 70%)`,
              borderRadius: '50%',
              transform: `translate(-50%, -50%) rotate(${particle.angle}deg)`,
              ['--particle-distance' as any]: `${particle.distance}px`,
              animation: `particleExplode ${particle.duration}s ease-out infinite`,
              animationDelay: `${particle.delay}s`,
              boxShadow: `0 0 10px rgba(138, 43, 226, 0.8)`
            }}
          />
        ))}
      </div>

    {/* Main Content */}
    <div className='relative z-20 flex flex-col items-center justify-center'>
      {/* Fractal Logo */}
      <div
        className='mb-12 relative'
        style={{
          width: '100px',
          height: '100px',
          animation: 'logoFloat 3s ease-in-out infinite'
        }}
      >
        {/* Outer Fracture Frame */}
        <div
          style={{
            position: 'absolute',
            inset: '-10px',
            background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.4), rgba(255, 0, 255, 0.3), rgba(0, 255, 255, 0.2))',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            animation: 'fractureRotate 8s linear infinite',
            boxShadow: '0 0 40px rgba(138, 43, 226, 0.6)'
          }}
        />

        {/* Main Octagon */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #8a2be2 0%, #4b0082 50%, #9400d3 100%)',
            clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)',
            boxShadow: '0 0 30px rgba(138, 43, 226, 0.8), inset 0 0 20px rgba(138, 43, 226, 0.4)',
            animation: 'shardGlow 2s ease-in-out infinite'
          }}
        />

        {/* Inner Star */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50px',
            height: '50px',
            background: 'linear-gradient(45deg, #ff00ff, #00ffff)',
            clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
            animation: 'starPulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 20px rgba(255, 0, 255, 0.8)'
          }}
        />
      </div>

      {/* Loading Text with Glitch */}
      <div className='relative'>
        <div
          style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#fff',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(138, 43, 226, 0.8), 0 0 40px rgba(138, 43, 226, 0.4)',
            animation: 'textGlitch 3s ease-in-out infinite'
          }}
        >
          Fest Avenue
        </div>

        {/* Glitch Layers */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            fontSize: '32px',
            fontWeight: '700',
            color: '#ff00ff',
            letterSpacing: '6px',
            textTransform: 'uppercase',
            opacity: 0.7,
            animation: 'glitchLayer1 0.3s steps(2, end) infinite',
            clipPath: 'inset(0 0 0 0)'
          }}
        >
          Fest Avenue
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: '14px',
          color: 'rgba(138, 43, 226, 0.9)',
          letterSpacing: '3px',
          marginTop: '20px',
          textTransform: 'uppercase',
          animation: 'subtitlePulse 2s ease-in-out infinite',
          textShadow: '0 0 10px rgba(138, 43, 226, 0.6)'
        }}
      >
        Đang vỡ không gian...
      </div>

      {/* Energy Progress */}
      <div
        style={{
          width: '200px',
          height: '3px',
          marginTop: '30px',
          background: 'rgba(138, 43, 226, 0.2)',
          borderRadius: '2px',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 0 10px rgba(138, 43, 226, 0.3)'
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #8a2be2, #ff00ff, #00ffff, transparent)',
            animation: 'energyFlow 2s ease-in-out infinite',
            boxShadow: '0 0 15px rgba(138, 43, 226, 0.8)'
          }}
        />
      </div>
    </div>

    {/* Animations */}
    <style>{`
      @keyframes twinkle {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.5); }
      }

      @keyframes crackPulse {
        0%, 100% {
          opacity: 0.3;
          filter: brightness(0.8);
        }
        50% {
          opacity: 1;
          filter: brightness(1.5);
        }
      }

      @keyframes shardExplode {
        0% {
          opacity: 0;
          transform: translateX(0) scale(0);
        }
        30% {
          opacity: 1;
          transform: translateX(calc(var(--distance) * 0.7)) scale(1);
        }
        100% {
          opacity: 0;
          transform: translateX(var(--distance)) scale(0.8);
        }
      }

      @keyframes ringRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes vortexSpin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }

      @keyframes glitchEffect {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
      }

      @keyframes particleExplode {
        0% {
          opacity: 0;
          transform: translateX(0) scale(0);
          filter: brightness(0.5);
        }
        20% {
          opacity: 1;
          transform: translateX(calc(var(--particle-distance) * 0.5)) scale(1);
          filter: brightness(1.5);
        }
        100% {
          opacity: 0;
          transform: translateX(var(--particle-distance)) scale(1.5);
          filter: brightness(0.5);
        }
      }

      @keyframes logoFloat {
        0%, 100% {
          transform: translateY(0px);
        }
        50% {
          transform: translateY(-20px);
        }
      }

      @keyframes fractureRotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      @keyframes shardGlow {
        0%, 100% {
          filter: brightness(1) drop-shadow(0 0 20px rgba(138, 43, 226, 0.6));
        }
        50% {
          filter: brightness(1.3) drop-shadow(0 0 40px rgba(138, 43, 226, 0.9));
        }
      }

      @keyframes starPulse {
        0%, 100% {
          transform: translate(-50%, -50%) scale(1) rotate(0deg);
          opacity: 0.8;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2) rotate(180deg);
          opacity: 1;
        }
      }

      @keyframes textGlitch {
        0%, 90%, 100% {
          transform: translate(0);
        }
        92% {
          transform: translate(-3px, 2px);
        }
        94% {
          transform: translate(3px, -2px);
        }
        96% {
          transform: translate(-2px, -1px);
        }
      }

      @keyframes glitchLayer1 {
        0% {
          transform: translate(0);
          clip-path: inset(40% 0 60% 0);
        }
        20% {
          transform: translate(-3px, 3px);
          clip-path: inset(50% 0 30% 0);
        }
        40% {
          transform: translate(3px, -2px);
          clip-path: inset(20% 0 70% 0);
        }
        60% {
          transform: translate(-2px, -3px);
          clip-path: inset(60% 0 10% 0);
        }
        80% {
          transform: translate(2px, 2px);
          clip-path: inset(30% 0 40% 0);
        }
        100% {
          transform: translate(0);
          clip-path: inset(40% 0 60% 0);
        }
      }

      @keyframes subtitlePulse {
        0%, 100% {
          opacity: 0.6;
          letter-spacing: 3px;
        }
        50% {
          opacity: 1;
          letter-spacing: 4px;
        }
      }

      @keyframes energyFlow {
        0% {
          transform: translateX(-100%);
        }
        50% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(100%);
        }
      }
    `}</style>
    </div>
  )
}

function ProtectedRoute() {
  const isLogin = useUsersStore((state) => state.isAuth)
  return isLogin ? <Outlet /> : <Navigate to={path.asHome} />
}

function RejectedRoute() {
  const isLogin = useUsersStore((state) => state.isAuth)
  return !isLogin ? <Outlet /> : <Navigate to={path.asHome} />
}

function ProtectedAdminRoute() {
  const isLogin = useAdminStore((state) => state.isLogin)
  const profile = useAdminStore((state) => state.profile)
  let location = useLocation()

  if (!isLogin) {
    return <Navigate to={path.admin.auth.login} state={{ from: location }} />
  }

  // Kiểm tra nếu đã login nhưng chưa có profile hoặc không có role Admin
  if (profile && !profile.roles.includes('Admin')) {
    return <Navigate to={path.asHome} />
  }

  return <Outlet />
}

function RejectedAdminRoute() {
  const isLogin = useAdminStore((state) => state.isLogin)
  const location = useLocation()
  const from = location.state?.from?.pathname || path.admin.process.dashboard
  return !isLogin ? <Outlet /> : <Navigate to={from} />
}

function ProtectedStaffRoute() {
  const isLogin = useStaffStore((state) => state.isLogin)
  const profile = useStaffStore((state) => state.profile)
  let location = useLocation()

  if (!isLogin) {
    return <Navigate to={path.staff.auth.login} state={{ from: location }} />
  }

  // Kiểm tra nếu đã login nhưng chưa có profile hoặc không có role Staff
  if (profile && !profile.roles.includes('Staff')) {
    return <Navigate to={path.asHome} />
  }

  return <Outlet />
}

function RejectedStaffRoute() {
  const isLogin = useStaffStore((state) => state.isLogin)
  const location = useLocation()
  const from = location.state?.from || path.staff.messages
  return !isLogin ? <Outlet /> : <Navigate to={from} />
}

const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <Suspense fallback={<Loader />}>{children}</Suspense>
}

export default function useRouteElement() {
  const routeElements = useRoutes([
    {
      path: path.asHome,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <Home />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: path.home,
      element: <Navigate to={path.asHome} />
    },
    {
      path: path.events,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <EventSearch />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: path.auth.forgotPassword,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <ForgotPassword />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: path.user.event.details,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <EventDetails />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: path.user.event.social_media_detail,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <SocialMediaDetail />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: path.auth.resetPassword,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <ResetPassword />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: path.auth.root,
      element: <RejectedRoute />,
      children: [
        {
          path: path.auth.login,
          element: (
            <SuspenseWrapper>
              <MainLayout>
                <NotAuthLayout img={IMG_LOGIN}>
                  <Login />
                </NotAuthLayout>
              </MainLayout>
            </SuspenseWrapper>
          )
        },
        {
          path: path.auth.signup,
          element: (
            <SuspenseWrapper>
              <MainLayout>
                <NotAuthLayout img={IMG_SIGNUP}>
                  <SignUp />
                </NotAuthLayout>
              </MainLayout>
            </SuspenseWrapper>
          )
        },
        {
          path: path.auth.verify_email,
          element: <VerifyEmail />
        }
      ]
    },
    {
      path: path.user.root,
      element: <ProtectedRoute />,
      children: [
        {
          path: '',
          element: (
            <SuspenseWrapper>
              <MainLayout>
                <Outlet />
              </MainLayout>
            </SuspenseWrapper>
          ),
          children: [
            {
              path: path.user.my.profile,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <UserProfile />
                  </MyLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.my.messages,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <ChatMyMessagesSystem />
                  </MyLayout>
                </SuspenseWrapper>
              )
            },

            {
              path: path.user.my.payment,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <MyPayment />
                  </MyLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.my.events,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <MyEvents />
                  </MyLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.schedule.view,
              element: (
                <SuspenseWrapper>
                  <EventOwnerLayout>
                    <ScheduleManagement />
                  </EventOwnerLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.analytics_event.view,
              element: (
                <SuspenseWrapper>
                  <EventOwnerLayout>
                    <EventAnalyticsDashboard />
                  </EventOwnerLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.event.create_event,
              element: (
                <SuspenseWrapper>
                  <CreateEvent />
                </SuspenseWrapper>
              )
            },
            {
              path: `${path.user.event.update_event}/:nameId`,
              element: (
                <SuspenseWrapper>
                  <CreateEvent />
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.event.ticketDetails,
              element: (
                <SuspenseWrapper>
                  <SeatMapViewerPage />
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.event_owner.user_management,
              element: (
                <SuspenseWrapper>
                  <EventOwnerLayout>
                    <UserManagementInEvents />
                  </EventOwnerLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.event_owner.social_media,
              element: (
                <SuspenseWrapper>
                  <EventOwnerLayout>
                    <SocialMediaManagement />
                  </EventOwnerLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.event_owner.ticket_management,
              element: (
                <SuspenseWrapper>
                  <EventOwnerLayout>
                    <TicketManagement />
                  </EventOwnerLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.payment.payment_event,
              element: (
                <SuspenseWrapper>
                  <PaymentEvent />
                </SuspenseWrapper>
              )
            }
          ]
        }
      ]
    },
    // Staff Routes
    {
      path: path.staff.root,
      element: <ProtectedStaffRoute />,
      children: [
        {
          path: '',
          element: (
            <SuspenseWrapper>
              <StaffLayout>
                <Outlet />
              </StaffLayout>
            </SuspenseWrapper>
          ),
          children: [
            {
              path: path.staff.messages,
              element: (
                <SuspenseWrapper>
                  <StaffMessages />
                </SuspenseWrapper>
              )
            },
            {
              path: path.staff.events,
              element: (
                <SuspenseWrapper>
                  <StaffEventManagement />
                </SuspenseWrapper>
              )
            }
          ]
        }
      ]
    },
    {
      path: path.staff.auth.root,
      element: <RejectedStaffRoute />,
      children: [
        {
          path: path.staff.auth.login,
          element: (
            <SuspenseWrapper>
              <StaffLogin />
            </SuspenseWrapper>
          )
        }
      ]
    },

    {
      path: path.admin.process.root,
      element: <ProtectedAdminRoute />,
      children: [
        {
          path: '',
          element: (
            <SuspenseWrapper>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </SuspenseWrapper>
          ),
          children: [
            {
              path: path.admin.process.dashboard,
              element: <Dashboard />
            },
            {
              path: path.admin.process.category,
              element: <Category />
            },
            {
              path: path.admin.process.package,
              element: <Packages />
            },
            {
              path: path.admin.process.accounts,
              element: <AccountManagement />
            },
            {
              path: path.admin.process.analytics,
              element: <Analytics />
            }
          ]
        }
      ]
    },
    {
      path: path.admin.auth.login,
      element: <RejectedAdminRoute />,
      children: [
        {
          index: true,
          element: (
            <SuspenseWrapper>
              <AdminLogin />
            </SuspenseWrapper>
          )
        }
      ]
    }
  ])
  return routeElements
}
