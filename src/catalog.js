export const courses = Array.from({ length: 6 }, (_, index) => ({
  id: `primaria-${index + 1}`,
  label: `${index + 1}.º de Primaria`,
  shortLabel: `${index + 1}.º`,
  stage: 'Primaria',
}));

export const activities = [{
  id: 'mates-1-u1-u2',
  courseId: 'primaria-1',
  subject: 'Matemáticas',
  title: 'Un mundo del 1 al 10',
  description: 'Contamos, calculamos y descubrimos formas.',
  topics: [
    { id: 'numbers', title: 'Números del 1 al 10', description: 'Cuenta y reconoce cantidades.', symbol: '123', color: '#2563eb' },
    { id: 'compare', title: 'Mayor y menor', description: 'Compara dos números.', symbol: '≷', color: '#7c3aed' },
    { id: 'addition', title: 'Sumas', description: 'Junta cantidades hasta 10.', symbol: '+', color: '#15803d' },
    { id: 'subtraction', title: 'Restas', description: 'Descubre cuántos quedan.', symbol: '−', color: '#c2410c' },
    { id: 'problems', title: 'Pequeños problemas', description: 'Resuelve historias con una operación.', symbol: '?', color: '#a21caf' },
    { id: 'shapes', title: 'Figuras geométricas', description: 'Reconoce cuatro figuras.', symbol: '△', color: '#0e7490' },
  ],
}];
