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
const FavoriteEvents = lazy(() => import('./pages/User/Auth/My/FavoriteEvents/FavoriteEvents'))
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
const PostEventWithdrawal = lazy(() => import('./pages/User/Auth/My/PostEventWithdrawal'))
const WithdrawalManagement = lazy(() => import('./pages/Admin/Process/WithdrawalManagement'))

const Loader = () => (
  <div
    className='flex flex-col items-center justify-center h-screen overflow-hidden'
    style={{
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2847 50%, #0d2a4d 100%)'
    }}
  >
    {/* Particle Background Effect */}
    <div className='absolute inset-0 overflow-hidden'>
      {Array.from({ length: 80 }).map((_, i) => (
        <div
          key={i}
          className='absolute bg-cyan-400'
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            opacity: Math.random() * 0.6 + 0.2,
            animation: `floatParticle ${Math.random() * 4 + 3}s ease-in-out infinite`,
            animationDelay: Math.random() * 2 + 's',
            borderRadius: '50%',
            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(34, 211, 238, 0.6)`
          }}
        />
      ))}
    </div>

    {/* Radial Glow */}
    <div
      className='absolute'
      style={{
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 70%)',
        borderRadius: '50%',
        filter: 'blur(60px)',
        animation: 'pulseGlow 3s ease-in-out infinite'
      }}
    />

    {/* Main Content Container */}
    <div className='relative z-10 flex flex-col items-center justify-center'>
      {/* Geometric Logo - Diamond Shape */}
      <div
        className='mb-8 relative'
        style={{
          width: '80px',
          height: '80px',
          animation: 'rotateLogo 8s linear infinite'
        }}
      >
        {/* Outer Diamond */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            boxShadow: '0 0 30px rgba(34, 211, 238, 0.5), 0 0 60px rgba(34, 211, 238, 0.3)',
            animation: 'diamondGlow 2s ease-in-out infinite'
          }}
        />

        {/* Inner Diamond */}
        <div
          style={{
            position: 'absolute',
            inset: '15px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
            boxShadow: 'inset 0 0 15px rgba(34, 211, 238, 0.4)'
          }}
        />
      </div>

      {/* Loading Text */}
      <div
        style={{
          fontSize: '28px',
          fontWeight: '300',
          color: '#22d3ee',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          marginTop: '40px',
          animation: 'textGlow 2s ease-in-out infinite',
          textShadow: '0 0 20px rgba(34, 211, 238, 0.5)'
        }}
      >
        Fest Avenue
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: '12px',
          color: 'rgba(34, 211, 238, 0.6)',
          letterSpacing: '2px',
          marginTop: '12px',
          animation: 'fadeInOut 3s ease-in-out infinite'
        }}
      >
        Đang tải...
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '120px',
          height: '2px',
          marginTop: '30px',
          background: 'rgba(34, 211, 238, 0.1)',
          borderRadius: '1px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
            animation: 'progressLoad 2s ease-in-out infinite',
            boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)'
          }}
        />
      </div>
    </div>

    {/* Animations */}
    <style>{`
        @keyframes rotateLogo {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes diamondGlow {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5)) drop-shadow(0 0 40px rgba(34, 211, 238, 0.2));
          }
          50% {
            filter: drop-shadow(0 0 30px rgba(34, 211, 238, 0.8)) drop-shadow(0 0 60px rgba(34, 211, 238, 0.4));
          }
        }

        @keyframes textGlow {
          0%, 100% {
            opacity: 0.7;
            textShadow: 0 0 15px rgba(34, 211, 238, 0.3);
          }
          50% {
            opacity: 1;
            textShadow: 0 0 30px rgba(34, 211, 238, 0.7);
          }
        }

        @keyframes fadeInOut {
          0%, 100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes progressLoad {
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

        @keyframes floatParticle {
          0% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-50px) translateX(20px);
            opacity: 0.2;
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.15;
          }
        }
      `}</style>
  </div>
)

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
              path: path.user.my.favorites,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <FavoriteEvents />
                  </MyLayout>
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.my.withdrawal,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <PostEventWithdrawal />
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
            },
            {
              path: path.admin.process.withdrawal,
              element: <WithdrawalManagement />
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
