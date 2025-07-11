-- Criar tabela de licitações conforme especificado
CREATE TABLE public.licitacoes (
  id TEXT NOT NULL DEFAULT gen_random_uuid()::text PRIMARY KEY,
  objeto TEXT NOT NULL,
  valor DECIMAL,
  prazo TEXT,
  resumo_ia TEXT,
  raw_data JSONB,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.licitacoes ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access for MCP
CREATE POLICY "Public read access for licitacoes" 
ON public.licitacoes 
FOR SELECT 
USING (true);

-- Create policy to allow authenticated inserts
CREATE POLICY "Authenticated users can create licitacoes" 
ON public.licitacoes 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow authenticated updates
CREATE POLICY "Authenticated users can update licitacoes" 
ON public.licitacoes 
FOR UPDATE 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.atualizado_em = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_licitacoes_updated_at
BEFORE UPDATE ON public.licitacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();