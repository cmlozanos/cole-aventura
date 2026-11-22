export const garden = `<svg viewBox="0 0 450 320" role="img" aria-label="Un pequeño jardín donde crecen números y formas">
<defs><pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#477b64" stroke-opacity=".10"/></pattern></defs>
<rect x="20" y="12" width="410" height="290" rx="32" fill="url(#grid)"/><ellipse cx="230" cy="278" rx="166" ry="20" fill="#cfddba"/>
<path d="M93 260Q103 210 137 173M130 186Q89 183 89 151Q130 145 130 186M121 203Q156 164 175 183Q169 213 121 216" fill="#6e9f68" stroke="#3e7855" stroke-width="4" stroke-linejoin="round"/>
<path d="M79 245H160L150 281H91Z" fill="#d78458"/><path d="M74 239H165V252H74Z" fill="#edaa7e"/>
<g transform="rotate(-9 235 181)"><rect x="161" y="105" width="146" height="169" rx="14" fill="#eac66d"/><path d="M179 105V274" stroke="#cfa552" stroke-width="3"/><rect x="193" y="130" width="91" height="112" rx="8" fill="#fff9e8"/><text x="239" y="180" text-anchor="middle" fill="#266c55" font-size="48" font-family="Georgia" font-weight="bold">1 2</text><text x="239" y="222" text-anchor="middle" fill="#d77d55" font-size="39" font-family="Georgia" font-weight="bold">3 +</text></g>
<g transform="rotate(14 337 199)"><path d="M323 120L348 120L348 257L336 281L323 257Z" fill="#e89c82"/><path d="M323 139H348V249H323Z" fill="#e8a25d"/><path d="M332 139V249" stroke="#f8cf8a" stroke-width="7"/><path d="M323 257L336 281L348 257Z" fill="#f0d9b2"/><path d="M331 272L336 281L341 272Z" fill="#344e44"/><rect x="323" y="129" width="25" height="13" fill="#e8dbc4"/></g>
<circle cx="332" cy="67" r="26" fill="#edb866"/><path d="M81 77L105 35L129 77Z" fill="#d48d79"/><rect x="363" y="211" width="40" height="40" rx="7" transform="rotate(13 383 231)" fill="#93a9cb"/>
<path d="M177 62L182 47L187 62L202 67L187 72L182 87L177 72L162 67Z" fill="#769b73"/><path d="M385 108V128M375 118H395M58 189V203M51 196H65" stroke="#c89a5d" stroke-width="3" stroke-linecap="round"/>
<circle cx="288" cy="45" r="4" fill="#cf8b73"/><circle cx="67" cy="122" r="5" fill="#99b4a0"/></svg>`;
export function shapeSvg(shape, decorative = false) {
  const paths = {circle:'<circle cx="60" cy="60" r="43"/>',square:'<rect x="18" y="18" width="84" height="84" rx="5"/>',rectangle:'<rect x="5" y="32" width="110" height="56" rx="5"/>',triangle:'<path d="M60 12L111 103H9Z" stroke-linejoin="round"/>'};
  const descriptions = {circle:'Una línea curva cerrada, sin lados rectos ni esquinas.',square:'Cuatro lados iguales y cuatro esquinas rectas.',rectangle:'Cuatro esquinas rectas, dos lados largos y dos cortos.',triangle:'Tres lados rectos y tres esquinas.'};
  return `<svg viewBox="0 0 120 120" ${decorative ? 'aria-hidden="true"' : 'role="img" aria-label="${descriptions[shape]}"'} fill="#e7b46b" stroke="#9e662a" stroke-width="3">${paths[shape] || paths.circle}</svg>`;
}
