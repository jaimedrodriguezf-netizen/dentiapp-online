-- Permitir lectura pública de horarios de atención (para la landing page)
CREATE POLICY "Public can view operating hours"
  ON operating_hours FOR SELECT
  USING (true);
