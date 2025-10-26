// Tarjeta reutilizable de experimento con estilo Material Design y navegación por Link

import { Card, CardActionArea, CardContent, CardMedia, Box, Typography, Chip } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function ExperimentCard({ to, title, description, icon, chipLabel, chipColor = 'default', image }) {
  // Contenedor de la tarjeta con acción completa y soporte de accesibilidad mediante aria-label
  return (
    <Card sx={{ height: '100%' }}>
      <CardActionArea
        component={RouterLink}
        to={to}
        aria-label={title}
        sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}
      >
        {/* Imagen o bloque gráfico superior opcional */}
        {image ? (
          <CardMedia component="img" height="140" image={image} alt={title} />
        ) : (
          <Box
            sx={{
              height: 140,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, rgba(14,77,146,0.10) 0%, rgba(43,177,255,0.10) 100%)'
            }}
            aria-hidden
          >
            {icon}
          </Box>
        )}

        {/* Contenido textual y chip */}
        <CardContent sx={{ display: 'grid', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6">{title}</Typography>
            {chipLabel && <Chip size="small" color={chipColor} label={chipLabel} />}
          </Box>
          <Typography variant="body2" color="text.secondary">{description}</Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
