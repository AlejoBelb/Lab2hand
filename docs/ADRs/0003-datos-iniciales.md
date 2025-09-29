# ADR 0003: Datos iniciales (experiments/runs/measurements)

## Estado
Propuesto

## Contexto
MVP necesita crear experimentos, runs y mediciones.

## Decisión
Esquema mínimo con `experiments`, `runs`, `measurements` y índices por `run_id` y `(run_id, t)`.

## Migraciones (borrador SQL)
```sql
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  owner_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id uuid NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS runs_experiment_idx ON runs(experiment_id);

CREATE TABLE IF NOT EXISTS measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  t double precision NOT NULL,
  value double precision NOT NULL,
  unit text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS measurements_run_idx ON measurements(run_id);
CREATE INDEX IF NOT EXISTS measurements_order_idx ON measurements(run_id, t);
```
