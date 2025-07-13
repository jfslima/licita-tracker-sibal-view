-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2) NOT NULL,
  price_yearly DECIMAL(10,2),
  max_searches INTEGER,
  max_alerts INTEGER,
  ai_analysis BOOLEAN DEFAULT false,
  api_access BOOLEAN DEFAULT false,
  priority_support BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user subscriptions table
CREATE TABLE public.user_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired', 'pending')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  payment_method JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.user_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  filters JSONB DEFAULT '{}'::jsonb,
  notification_email BOOLEAN DEFAULT true,
  notification_sms BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_checked TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alert matches table
CREATE TABLE public.alert_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_id UUID NOT NULL REFERENCES public.user_alerts(id) ON DELETE CASCADE,
  licitacao_id TEXT NOT NULL,
  matched_keywords TEXT[],
  relevance_score DECIMAL(3,2),
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics table for tracking usage
CREATE TABLE public.user_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI analysis requests table
CREATE TABLE public.ai_analysis_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  licitacao_id TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('viability', 'competition', 'pricing', 'document', 'strategic')),
  input_data JSONB NOT NULL,
  result JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read)
CREATE POLICY "Anyone can view subscription plans" 
ON public.subscription_plans FOR SELECT USING (true);

-- RLS Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions" 
ON public.user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_alerts
CREATE POLICY "Users can manage their own alerts" 
ON public.user_alerts FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for alert_matches
CREATE POLICY "Users can view matches for their alerts" 
ON public.alert_matches FOR SELECT USING (
  alert_id IN (SELECT id FROM public.user_alerts WHERE user_id = auth.uid())
);

-- RLS Policies for user_analytics
CREATE POLICY "Users can view their own analytics" 
ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics" 
ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_analysis_requests
CREATE POLICY "Users can manage their own AI analysis requests" 
ON public.ai_analysis_requests FOR ALL USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_yearly, max_searches, max_alerts, ai_analysis, api_access, priority_support, features) VALUES
('Starter', 'Ideal para pequenos fornecedores e consultores', 29.90, 299.00, 100, 5, false, false, false, '["Pesquisa básica no PNCP", "Alertas por email", "Dashboard básico", "Suporte por email"]'::jsonb),
('Professional', 'Para empresas que precisam de análises avançadas', 99.90, 999.00, 1000, 50, true, true, false, '["Pesquisa avançada", "Análise de IA", "API de acesso", "Alertas inteligentes", "Dashboard executivo", "Relatórios personalizados", "Suporte prioritário"]'::jsonb),
('Enterprise', 'Solução completa para grandes organizações', 299.90, 2999.00, -1, -1, true, true, true, '["Pesquisas ilimitadas", "IA avançada", "API dedicada", "Alertas personalizados", "Dashboard executivo", "Relatórios avançados", "Suporte 24/7", "Integração personalizada", "Consultoria especializada"]'::jsonb);

-- Create triggers for updated_at
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON public.subscription_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_alerts_updated_at
  BEFORE UPDATE ON public.user_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();