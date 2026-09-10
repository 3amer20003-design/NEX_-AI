import { useState } from 'react';
import { Copy, Check, Sparkles, AlertCircle, Info, X } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { ContentType, ToneType, GenerationRequest, GenerationResponse } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';

export function ContentGenerator() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<ContentType>('Blog Post');
  const [tone, setTone] = useState<ToneType>('Professional');
  
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isToneInfoOpen, setIsToneInfoOpen] = useState(false);

  const contentTypes: ContentType[] = ['Blog Post', 'Twitter Thread', 'LinkedIn Post', 'Marketing Email'];
  const toneTypes: ToneType[] = ['Professional', 'Casual', 'Humorous', 'Persuasive', 'Inspirational'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setIsCopied(false);

    try {
      const token = await user.getIdToken();
      const payload: GenerationRequest = { topic, type, tone, language };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('gen_failed'));
      }

      setResult(data.content || data.result || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <>
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5">
          <Card delay={0.1} className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">{t('create_title')}</h2>
              <p className="text-sm text-slate-500 mt-1">{t('create_desc')}</p>
            </div>
            
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('topic_label')}
                </label>
                <textarea
                  id="topic"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 outline-none transition-all resize-none text-slate-700 text-sm"
                  placeholder={t('topic_ph')}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  {t('format_label')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((t_format) => (
                    <button
                      key={t_format}
                      type="button"
                      onClick={() => setType(t_format)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg border transition-all ${
                        type === t_format 
                          ? 'bg-slate-900 border-slate-900 text-white' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {t_format}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    {t('tone_label')}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsToneInfoOpen(true)}
                    className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <Info className="w-4 h-4" />
                    <span>{t('how_to_use')}</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {toneTypes.map((t_tone) => (
                    <button
                      key={t_tone}
                      type="button"
                      onClick={() => setTone(t_tone)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                        tone === t_tone 
                          ? 'bg-slate-100 border-slate-300 text-slate-900' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {t_tone}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  icon={Sparkles} 
                  isLoading={isLoading}
                  disabled={!topic.trim()}
                >
                  {isLoading ? t('generating') : t('generate')}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-7">
          <Card delay={0.2} className="h-full min-h-[500px] flex flex-col bg-slate-50/50">
            {error ? (
              <div className="p-6 m-6 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-red-800">{t('gen_failed')}</h3>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                </div>
              </div>
            ) : result ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b border-slate-200/60 bg-white">
                  <span className="text-sm font-medium text-slate-500">
                    {type} • {tone}
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={handleCopy}
                    icon={isCopied ? Check : Copy}
                  >
                    {isCopied ? t('copied') : t('copy')}
                  </Button>
                </div>
                <div 
                  className={`p-6 overflow-y-auto whitespace-pre-wrap text-slate-700 text-sm leading-relaxed prose prose-slate ${language === 'ar' ? 'text-right' : 'text-left'}`} 
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  {result}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-50">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-slate-200 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">{t('awaiting')}</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  {t('awaiting_desc')}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      {isToneInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsToneInfoOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">{t('tone_info_title')}</h3>
              <button
                onClick={() => setIsToneInfoOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm text-slate-600">
              <p className="font-medium text-slate-900 mb-2">{t('tone_info_desc')}</p>
              
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-1">Professional</span>
                  <p>{t('tone_prof')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-1">Casual</span>
                  <p>{t('tone_casual')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-1">Humorous</span>
                  <p>{t('tone_humorous')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-1">Persuasive</span>
                  <p>{t('tone_persuasive')}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="font-semibold text-slate-900 block mb-1">Inspirational</span>
                  <p>{t('tone_inspire')}</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <Button className="w-full" onClick={() => setIsToneInfoOpen(false)}>
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
