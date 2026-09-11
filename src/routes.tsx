import { createBrowserRouter } from 'react-router-dom';
import { LandingLayout } from '@/layouts/LandingLayout';
import { MainLayout } from '@/layouts/MainLayout';
import AboutPage from '@/pages/AboutPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';

/**
 * Every path the application knows. A route MUST be referenced through this
 * constant, never as a string literal in a component. Entity keys are added by
 * each entity US together with its routes (LLD §5.1, §7.11 step 9).
 */
export const ROUTES = {
  home: '/',
  about: '/about',
} as const;

/** The single route table of the application (LLD §5.1). */
export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [{ path: ROUTES.home, element: <HomePage /> }],
  },
  {
    element: <MainLayout />,
    children: [
      { path: ROUTES.about, element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
