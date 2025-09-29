# ADR 0002: Autenticación (bosquejo reversible)

## Estado
Propuesto

## Contexto
Autenticación mínima por roles, baja fricción y seguridad razonable, con conectividad inestable.

## Decisión
JWT de corto plazo + refresh token con rotación; hashing argon2id/bcrypt; roles mínimos en claims; cookies httpOnly para refresh en producción.

## Componentes
Endpoints: register/login/refresh/logout; tabla `refresh_tokens`; Helmet/CORS/rate limiting; validación con zod/joi.

## Consecuencias
Positivas: implementación rápida. Negativas: cuidado con XSS si refresh no está en cookie httpOnly en MVP.

## Alternativas
Cookies de sesión; OAuth/SSO; token largo.

## Reversibilidad
Hacia cookies o OAuth sin romper contratos.

## Modelo de datos (borrador)
users, refresh_tokens.

## Seguimiento
Éxito login, errores 401/403, incidentes de tokens.

## Trazabilidad
Épica 3; Sprints 0–1.
