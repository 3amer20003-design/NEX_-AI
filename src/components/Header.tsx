import { useState } from 'react';
import { Sparkles, Globe, LogOut } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { auth, signOut } from '../lib/firebase';
import { AuthModal } from './AuthModal';
import { Language } from '../i18n/translations';

export function Header() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">{t('app_name')}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('product')}</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('pricing')}</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{language}</span>
              </button>
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="py-2">
                  <button onClick={() => setLanguage('ar')} className={`w-full text-left px-4 py-2 text-sm ${language === 'ar' ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}>العربية</button>
                  <button onClick={() => setLanguage('en')} className={`w-full text-left px-4 py-2 text-sm ${language === 'en' ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}>English</button>
                  <button onClick={() => setLanguage('fr')} className={`w-full text-left px-4 py-2 text-sm ${language === 'fr' ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}>Français</button>
                </div>
              </div>
            </div>

            {user ? (
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                title={user.email}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">{t('sign_out')}</span>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <button onClick={() => setIsAuthOpen(true)} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">{t('sign_in')}</button>
                <button onClick={() => setIsAuthOpen(true)} className="h-9 px-4 text-sm font-medium bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors shadow-sm hidden md:block">
                  {t('start_free')}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
