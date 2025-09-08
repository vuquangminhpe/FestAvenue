/* eslint-disable prefer-const */
/* eslint-disable react-refresh/only-export-components */
import { Navigate, Outlet, useLocation, useRoutes } from 'react-router'
import { Suspense } from 'react'
import path from './constants/path'
import { useAdminStore, useUsersStore } from './contexts/app.context'
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

  let location = useLocation()
  return isLogin ? (
    <Suspense fallback={<Loader />}></Suspense>
  ) : (
    <Navigate to={path.admin.login} state={{ from: location }} />
  )
}

function RejectedAdminRoute() {
  const isLogin = useAdminStore((state) => state.isLogin)
  const location = useLocation()
  const from = location.state?.from || path.admin.users
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
              path: path.user.organization.created_organization,
              element: (
                <SuspenseWrapper>
                  <MyLayout>
                    <CreateOrganization />
                  </MyLayout>
                </SuspenseWrapper>
              )
            }
          ]
        }
      ]
    },
    {
      path: path.admin.dashboard,
      element: <ProtectedAdminRoute />,
      children: [
        {
          path: path.admin.users,
          element: (
            <SuspenseWrapper>
              <Outlet />
            </SuspenseWrapper>
          )
        }
      ]
    },
    {
      path: path.admin.login,
      element: <RejectedAdminRoute />,
      children: [
        {
          index: true,
          element: (
            <SuspenseWrapper>
              <Outlet />
            </SuspenseWrapper>
          )
        }
      ]
    }
  ])
  return routeElements
}
