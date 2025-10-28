import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { GlobeAltIcon, ChartBarIcon, BellIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Index = () => {
  const { user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-10"
      >
        <GlobeAltIcon className="h-5 w-5 mr-2" />
        {language === 'en' ? 'العربية' : 'English'}
      </Button>

      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
            Corporate Intelligence
          </h1>
          <p className="text-2xl text-muted-foreground mb-8">
            {language === 'en' 
              ? 'Advanced Analytics & Risk Scoring for MENA Markets'
              : 'تحليلات متقدمة وتقييم المخاطر لأسواق الشرق الأوسط'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              {t('auth.signIn')}
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              {t('auth.signUp')}
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-8 rounded-xl bg-card shadow-lg hover:shadow-xl transition-all">
            <ChartBarIcon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {language === 'en' ? 'Real-time Analytics' : 'تحليلات فورية'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Monitor companies across KSA, UAE, and Egypt with comprehensive financial data'
                : 'راقب الشركات في السعودية والإمارات ومصر مع بيانات مالية شاملة'}
            </p>
          </div>

          <div className="p-8 rounded-xl bg-card shadow-lg hover:shadow-xl transition-all">
            <BellIcon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {language === 'en' ? 'Smart Alerts' : 'تنبيهات ذكية'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Create custom rules and get notified of critical events instantly'
                : 'أنشئ قواعد مخصصة واحصل على إشعارات فورية للأحداث الحرجة'}
            </p>
          </div>

          <div className="p-8 rounded-xl bg-card shadow-lg hover:shadow-xl transition-all">
            <ShieldCheckIcon className="h-12 w-12 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2">
              {language === 'en' ? 'Risk Scoring' : 'تقييم المخاطر'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'AI-powered risk assessment with sector-specific insights'
                : 'تقييم مخاطر مدعوم بالذكاء الاصطناعي مع رؤى خاصة بالقطاع'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
