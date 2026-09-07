ALTER TABLE ai_results
    ADD COLUMN IF NOT EXISTS probabilities JSONB,
    ADD COLUMN IF NOT EXISTS class_labels JSONB,
    ADD COLUMN IF NOT EXISTS quality_metrics JSONB;
