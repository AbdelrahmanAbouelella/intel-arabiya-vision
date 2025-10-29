-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE public.app_role AS ENUM ('org_admin', 'analyst', 'viewer');
CREATE TYPE public.sector AS ENUM (
  'banking', 'insurance', 'real_estate', 'retail', 'healthcare', 
  'technology', 'energy', 'telecommunications', 'manufacturing', 
  'transportation', 'construction', 'other'
);
CREATE TYPE public.country_code AS ENUM ('SA', 'AE', 'EG', 'KW', 'QA', 'BH', 'OM');
CREATE TYPE public.event_type AS ENUM (
  'earnings_release', 'earnings_beat', 'earnings_miss', 'guidance_up', 'guidance_down',
  'executive_change', 'ceo_change', 'board_change', 'litigation_filed', 'litigation_settled',
  'merger_acquisition', 'ipo', 'dividend_announced', 'dividend_cut', 'debt_issuance',
  'credit_rating_upgrade', 'credit_rating_downgrade', 'regulatory_action', 'esg_event', 'other'
);
CREATE TYPE public.severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.sentiment AS ENUM ('very_negative', 'negative', 'neutral', 'positive', 'very_positive');

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Companies table
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en TEXT NOT NULL,
  name_ar TEXT,
  ticker TEXT,
  isin TEXT,
  country country_code NOT NULL,
  sector sector NOT NULL,
  exchange TEXT,
  market_cap_usd BIGINT,
  currency TEXT DEFAULT 'SAR',
  website TEXT,
  logo_url TEXT,
  description_en TEXT,
  description_ar TEXT,
  risk_score INTEGER DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_companies_sector ON public.companies(sector);
CREATE INDEX idx_companies_country ON public.companies(country);
CREATE INDEX idx_companies_ticker ON public.companies(ticker);

-- Financials table
CREATE TABLE public.financials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  period DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('Q1', 'Q2', 'Q3', 'Q4', 'FY')),
  revenue_usd BIGINT,
  ebitda_usd BIGINT,
  net_income_usd BIGINT,
  total_assets_usd BIGINT,
  total_debt_usd BIGINT,
  shareholders_equity_usd BIGINT,
  operating_margin DECIMAL(5,2),
  net_margin DECIMAL(5,2),
  roe DECIMAL(5,2),
  debt_to_equity DECIMAL(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, period, period_type)
);

ALTER TABLE public.financials ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_financials_company ON public.financials(company_id);
CREATE INDEX idx_financials_period ON public.financials(period DESC);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  event_type event_type NOT NULL,
  title_en TEXT NOT NULL,
  title_ar TEXT,
  summary_en TEXT,
  summary_ar TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  source_url TEXT,
  source_type TEXT,
  sentiment sentiment DEFAULT 'neutral',
  severity severity DEFAULT 'medium',
  extracted_metrics JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_events_company ON public.events(company_id);
CREATE INDEX idx_events_date ON public.events(event_date DESC);
CREATE INDEX idx_events_type ON public.events(event_type);
CREATE INDEX idx_events_severity ON public.events(severity);

-- Forecasts table
CREATE TABLE public.forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  metric TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  forecast_value BIGINT,
  confidence_interval_low BIGINT,
  confidence_interval_high BIGINT,
  model_version TEXT,
  last_retrain_date TIMESTAMPTZ,
  mape DECIMAL(5,2),
  mae BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(company_id, metric, forecast_date)
);

ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_forecasts_company ON public.forecasts(company_id);

-- Watchlists table
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_watchlists_user ON public.watchlists(user_id);

-- Watchlist companies (junction table)
CREATE TABLE public.watchlist_companies (
  watchlist_id UUID NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (watchlist_id, company_id)
);

ALTER TABLE public.watchlist_companies ENABLE ROW LEVEL SECURITY;

-- Alert rules table
CREATE TABLE public.alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  scope_filters JSONB NOT NULL,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  severity severity NOT NULL DEFAULT 'medium',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alert_rules_user ON public.alert_rules(user_id);

-- Alert history table
CREATE TABLE public.alert_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID NOT NULL REFERENCES public.alert_rules(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  summary_en TEXT,
  summary_ar TEXT,
  severity severity NOT NULL
);

ALTER TABLE public.alert_history ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_alert_history_triggered ON public.alert_history(triggered_at DESC);

-- Saved views table
CREATE TABLE public.saved_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_views ENABLE ROW LEVEL SECURITY;

-- Function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for user_roles
CREATE POLICY "Users can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only org admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'org_admin'));

-- RLS Policies for companies (public read)
CREATE POLICY "Anyone can view companies"
  ON public.companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Analysts can insert companies"
  ON public.companies FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'org_admin'));

CREATE POLICY "Analysts can update companies"
  ON public.companies FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'analyst') OR public.has_role(auth.uid(), 'org_admin'));

-- RLS Policies for financials (public read)
CREATE POLICY "Anyone can view financials"
  ON public.financials FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for events (public read)
CREATE POLICY "Anyone can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for forecasts (public read)
CREATE POLICY "Anyone can view forecasts"
  ON public.forecasts FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for watchlists
CREATE POLICY "Users can view own watchlists"
  ON public.watchlists FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY "Users can create own watchlists"
  ON public.watchlists FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own watchlists"
  ON public.watchlists FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own watchlists"
  ON public.watchlists FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for watchlist_companies
CREATE POLICY "Users can view watchlist companies"
  ON public.watchlist_companies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists
      WHERE watchlists.id = watchlist_companies.watchlist_id
      AND (watchlists.user_id = auth.uid() OR watchlists.is_shared = true)
    )
  );

CREATE POLICY "Users can manage own watchlist companies"
  ON public.watchlist_companies FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.watchlists
      WHERE watchlists.id = watchlist_companies.watchlist_id
      AND watchlists.user_id = auth.uid()
    )
  );

-- RLS Policies for alert_rules
CREATE POLICY "Users can view own alert rules"
  ON public.alert_rules FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own alert rules"
  ON public.alert_rules FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own alert rules"
  ON public.alert_rules FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own alert rules"
  ON public.alert_rules FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for alert_history
CREATE POLICY "Users can view own alert history"
  ON public.alert_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.alert_rules
      WHERE alert_rules.id = alert_history.rule_id
      AND alert_rules.user_id = auth.uid()
    )
  );

-- RLS Policies for saved_views
CREATE POLICY "Users can view own saved views"
  ON public.saved_views FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY "Users can create own saved views"
  ON public.saved_views FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own saved views"
  ON public.saved_views FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own saved views"
  ON public.saved_views FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_watchlists_updated_at BEFORE UPDATE ON public.watchlists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_alert_rules_updated_at BEFORE UPDATE ON public.alert_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_saved_views_updated_at BEFORE UPDATE ON public.saved_views
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default viewer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();