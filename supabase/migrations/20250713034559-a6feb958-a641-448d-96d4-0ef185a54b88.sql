-- Criar bucket para documentos de editais
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-editais', 'documentos-editais', true);

-- Criar políticas para o bucket de documentos
CREATE POLICY "Permitir upload de documentos para usuários autenticados" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documentos-editais' AND auth.uid() IS NOT NULL);

CREATE POLICY "Permitir visualização pública de documentos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documentos-editais');

CREATE POLICY "Permitir atualização para donos dos documentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documentos-editais' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Permitir exclusão para donos dos documentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documentos-editais' AND auth.uid()::text = (storage.foldername(name))[1]);