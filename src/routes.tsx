import { createBrowserRouter } from 'react-router-dom';
import { LandingLayout } from '@/layouts/LandingLayout';
import { MainLayout } from '@/layouts/MainLayout';
import AboutPage from '@/pages/AboutPage';
import HomePage from '@/pages/HomePage';
import NotFoundPage from '@/pages/NotFoundPage';
import SkillDetailPage from '@/pages/SkillDetailPage';
import SkillsPage from '@/pages/SkillsPage';

/**
 * Every path the application knows. A route MUST be referenced through this
 * constant, never as a string literal in a component. Entity keys are added by
 * each entity US together with its routes (LLD §5.1, §7.11 step 9).
 */
export const ROUTES = {
  home: '/',
  about: '/about',
  skills: '/skills',
  skill: (id: number | string) => `/skills/${id}`,
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
      {
        path: ROUTES.skills,
        element: <SkillsPage />,
        // Nested, so the detail dialog is deep-linkable and the back button
        // closes it — it renders in the listing page's <Outlet/> (LLD §5.1, §5.3).
        children: [{ path: ':id', element: <SkillDetailPage /> }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
