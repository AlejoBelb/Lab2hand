# Definition of Ready (DoR) y Definition of Done (DoD) — Lab2hand

## Propósito
Criterios mínimos y medibles para iniciar y finalizar trabajo, con trazabilidad DT.

## Definition of Ready (DoR)
- Problema/objetivo claros y persona/segmento ligado.
- Criterios de aceptación medibles (Dado/Cuando/Entonces).
- Hipótesis definida y evidencia DT cuando aplique.
- Prototipo/referencia cuando aplique.
- Dependencias identificadas y estimación lista.
- Trazabilidad: links a `/docs/DT/...` y ADR si aplica.
- Etiquetas: tipo, prioridad, estado, área, DT.

## Definition of Done (DoD)
- Código revisado y probado en CI.
- Documentación y `/docs/CHANGELOG.md` actualizados.
- Issue ↔ PR cerrado; ADR creado/actualizado si aplica.
- Seguridad mínima aplicada.
- DT (si aplica): Informe de Test en `/docs/DT/TEST_REPORTS/` con métricas; backlog ajustado.

## Checklists
### DoR (para issues)
- [ ] Criterios medibles
- [ ] Evidencia DT/prototipo (si aplica)
- [ ] Dependencias
- [ ] Estimación
- [ ] Etiquetas
- [ ] Trazabilidad

### DoD (para PRs)
- [ ] Código revisado
- [ ] Pruebas CI en verde
- [ ] Documentación y changelog
- [ ] ADR actualizado (si aplica)
- [ ] Informe de Test (si aplica)
- [ ] Listo para release
