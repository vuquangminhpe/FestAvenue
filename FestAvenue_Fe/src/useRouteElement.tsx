/* eslint-disable prefer-const */
/* eslint-disable react-refresh/only-export-components */
import { Navigate, Outlet, useLocation, useRoutes } from 'react-router'
import { Suspense } from 'react'
import path from './constants/path'
import { useAdminStore, useUsersStore, useStaffStore } from './contexts/app.context'
import MainLayout from './layouts/MainLayout'
import Home from './pages/User/Public/Home'
import MyLayout from './layouts/MyLayout'
import Login from './pages/User/Public/Login'
import NotAuthLayout from './layouts/Not_Auth_Layout'
import IMG_LOGIN from '../public/Images/Login_Page.png'
import IMG_SIGNUP from '../public/Images/SignUp_Page.png'
import SignUp from './pages/User/Public/Signup/Signup'
import VerifyEmail from './pages/User/Public/VerifyEmail/VerifyEmail'
import UserProfile from './pages/User/Auth/My/MyProfile/UserProfile'
import ForgotPassword from './pages/User/Public/ForgotPassword'
import ResetPassword from './pages/User/Public/ResetPassword/ResetPassword'
import CreateOrganization from './pages/User/Auth/Organization/CreateOrganization'
import ChatMyMessagesSystem from './pages/User/Auth/My/MyMessages'
import MyOrganization from './pages/User/Auth/My/MyOrganization'
import MyPayment from './pages/User/Auth/My/MyPayment'
import CreatePaymentWithOrganization from './pages/User/Auth/Payment/CreatePaymentWithOrganization'
import ScheduleManagement from './pages/User/Auth/Schedule'
import EventAnalyticsDashboard from './pages/User/Auth/EventAnalytics'
import StaffLogin from './pages/Staff/Auth/Login'
import AdminLogin from './pages/Admin/Auth/Login'
import StaffLayout from './layouts/StaffLayout'
import AdminLayout from './layouts/AdminLayout'
import StaffMessages from './pages/Staff/Process/Messages'
import Dashboard from './pages/Admin/Process/Dashboard'
import Category from './pages/Admin/Process/Category'
import Packages from './pages/Admin/Process/Packages'
import AccountManagement from './pages/Admin/Process/Accounts'
import Analytics from './pages/Admin/Process/Analytics'
import SeatMapEditor from './components/custom/EditorSeat'
import CinemaTemplate from './components/custom/Template/CinemaExperience'
const Loader = () => (
  <div
    className='flex flex-col items-center justify-center h-screen'
    style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}
  >
    <div
      className='w-20 h-20 mb-8'
      style={{
        background:
          'linear-gradient(45deg, #ff6b6b 0%, #4ecdc4 12.5%, #45b7d1 25%, #96ceb4 37.5%, #ffecd2 50%, #fcb69f 62.5%, #ff8a80 75%, #ff80ab 87.5%, #ea80fc 100%)',
        backgroundSize: '300% 300%',
        filter: 'blur(0.8px)',
        boxShadow:
          '0 0 20px rgba(255, 107, 107, 0.4), 0 0 40px rgba(69, 183, 209, 0.3), 0 0 60px rgba(78, 205, 196, 0.2)',
        animation: 'morphShape 6s ease-in-out infinite, colorFlow 8s ease-in-out infinite'
      }}
    />
    <div
      style={{
        color: 'white',
        fontSize: '24px',
        fontWeight: '300',
        letterSpacing: '3px',
        opacity: '0.9',
        animation: 'textPulse 3s ease-in-out infinite'
      }}
    >
      FEST AVENUE
    </div>
    <style>{`
      @keyframes gradientShift {
        0% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }

      @keyframes textPulse {
        0%,
        100% {
          opacity: 0.7;
        }
        50% {
          opacity: 1;
        }
      }

      @keyframes morphShape {
        0% {
          border-radius: 50%;
          transform: rotate(0deg) scale(1);
        }
        12.5% {
          border-radius: 25% 75% 75% 25%;
          transform: rotate(45deg) scale(1.1);
        }
        25% {
          border-radius: 75% 25% 25% 75%;
          transform: rotate(90deg) scale(0.9);
        }
        37.5% {
          border-radius: 50% 25% 75% 50%;
          transform: rotate(135deg) scale(1.2);
        }
        50% {
          border-radius: 25% 50% 50% 75%;
          transform: rotate(180deg) scale(1);
        }
        62.5% {
          border-radius: 75% 50% 25% 50%;
          transform: rotate(225deg) scale(0.8);
        }
        75% {
          border-radius: 50% 75% 25% 50%;
          transform: rotate(270deg) scale(1.1);
        }
        87.5% {
          border-radius: 25% 75% 50% 25%;
          transform: rotate(315deg) scale(0.95);
        }
        100% {
          border-radius: 50%;
          transform: rotate(360deg) scale(1);
        }
      }

      @keyframes colorFlow {
        0% {
          background-position: 0% 50%;
        }
        16.67% {
          background-position: 33% 25%;
        }
        33.33% {
          background-position: 66% 75%;
        }
        50% {
          background-position: 100% 50%;
        }
        66.67% {
          background-position: 75% 25%;
        }
        83.33% {
          background-position: 25% 75%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `}</style>
  </div>
)

function ProtectedRoute() {
  const isLogin = useUsersStore((state) => state.isAuth)
  return isLogin ? <Outlet /> : <Navigate to={path.auth.login} />
}

function RejectedRoute() {
  const isLogin = useUsersStore((state) => state.isAuth)
  return !isLogin ? <Outlet /> : <Navigate to={path.home} />
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
    return <Navigate to={path.home} />
  }

  return <Outlet />
}

function RejectedAdminRoute() {
  const isLogin = useAdminStore((state) => state.isLogin)
  const location = useLocation()
  const from = location.state?.from || path.admin.process.dashboard
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
    return <Navigate to={path.home} />
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
      element: <Navigate to={path.home} />
    },
    {
      path: path.home,
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <Home />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: '/seat/editor',
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <SeatMapEditor />
          </MainLayout>
        </SuspenseWrapper>
      )
    },
    {
      path: '/map1',
      element: (
        <SuspenseWrapper>
          <MainLayout>
            <CinemaTemplate />
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
              path: path.user.my.organization,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <MyOrganization />
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
              path: path.user.schedule.view,
              element: (
                <SuspenseWrapper>
                  <ScheduleManagement />
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.analytics_event.view,
              element: (
                <SuspenseWrapper>
                  <EventAnalyticsDashboard />
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.organization.created_organization,
              element: (
                <SuspenseWrapper>
                  <CreateOrganization />
                </SuspenseWrapper>
              )
            },
            {
              path: path.user.payment.payment_organization,
              element: (
                <SuspenseWrapper>
                  <CreatePaymentWithOrganization />
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
