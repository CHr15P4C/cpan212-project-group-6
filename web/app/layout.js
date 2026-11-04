import Link from 'next/link';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

export const metadata = {
  title: 'Meal Planner App',
  description: 'Manage recipes and meal plans',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', backgroundColor: '#f9f9f9', color: '#333' }}>
        <AppProvider>
          <header style={{ background: '#2c3e50', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
              <Link href="/recipes" style={{ color: '#fff', textDecoration: 'none' }}>🍽️ MealPlanner</Link>
            </h1>
            <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <Link href="/recipes" style={{ color: '#fff', textDecoration: 'none' }}>Recipes</Link>
              <Link href="/recipes/new" style={{ color: '#fff', textDecoration: 'none' }}>+ New Recipe</Link>
              <Link href="/mealplans" style={{ color: '#fff', textDecoration: 'none' }}>Meal Plans</Link>
              <Link href="/mealplans/new" style={{ color: '#fff', textDecoration: 'none' }}>+ New Meal Plan</Link>
              <Link href="/categories" style={{ color: '#fff', textDecoration: 'none' }}>External Categories</Link>
            </nav>
          </header>
          <main style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', minHeight: '70vh' }}>
            {children}
          </main>
          <footer style={{ textAlign: 'center', padding: '1.5rem', color: '#7f8c8d', fontSize: '0.875rem' }}>
            CPAN212 Group Project &copy; 2026
          </footer>
        </AppProvider>
      </body>
    </html>
  );
}