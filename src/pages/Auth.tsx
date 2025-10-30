import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { GlobeAltIcon } from '@heroicons/react/24/outline';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = isSignUp
        ? await signUp(email, password, fullName)
        : await signIn(email, password);

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(isSignUp ? t('auth.createAccount') : t('auth.signIn'));
        if (!isSignUp) {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-primary opacity-5" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleLanguage}
        className="absolute top-4 right-4 z-10 hover:bg-card/80 backdrop-blur-sm"
      >
        <GlobeAltIcon className="h-5 w-5 mr-2" />
        {language === 'en' ? 'العربية' : 'English'}
      </Button>

      <Card className="w-full max-w-md shadow-2xl border-none bg-card/80 backdrop-blur-xl z-10">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <div className="h-16 w-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <span className="text-3xl font-bold text-white">CI</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-primary bg-clip-text text-transparent">
            Corporate Intelligence
          </CardTitle>
          <CardDescription className="text-center text-base">
            {isSignUp ? t('auth.createAccount') : t('auth.signInToContinue')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-lg text-lg py-6"
              disabled={loading}
            >
              {loading ? t('common.loading') : (isSignUp ? t('auth.signUp') : t('auth.signIn'))}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-primary hover:underline font-medium"
              disabled={loading}
            >
              {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
