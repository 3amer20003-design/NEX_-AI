import { Header } from './components/Header';
import { ContentGenerator } from './components/ContentGenerator';
import { motion } from 'motion/react';
import { useLanguage } from './contexts/LanguageContext';

export default function App() {
  const { t, dir } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-slate-200" dir={dir}>
      <Header />
      
      <main className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold tracking-wide text-slate-600 mb-4 uppercase">
              {t('hero_badge')}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              {t('hero_title')}
            </h1>
            <p className="text-lg text-slate-500">
              {t('hero_desc')}
            </p>
          </motion.div>
        </div>

        <ContentGenerator />
      </main>
    </div>
  );
}
