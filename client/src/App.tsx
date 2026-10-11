import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Temples from './pages/Temples';
import TempleDetail from './pages/TempleDetail';
import Deities from './pages/Deities';
import Festivals from './pages/Festivals';
import Blog from './pages/Blog';
import Article from './pages/Article';
import Plan from './pages/Plan';
import About from './pages/About';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="temples" element={<Temples />} />
          <Route path="temples/:slug" element={<TempleDetail />} />
          <Route path="deities" element={<Deities />} />
          <Route path="festivals" element={<Festivals />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<Article />} />
          <Route path="plan" element={<Plan />} />
          <Route path="about" element={<About />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}
