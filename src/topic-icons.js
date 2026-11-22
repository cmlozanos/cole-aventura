const paths = {
  numbers:'<circle cx="7" cy="7" r="3"/><circle cx="17" cy="7" r="3"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="3"/>',
  compare:'<path d="m5 5 6 7-6 7m14-14-6 7 6 7"/>',
  addition:'<path d="M12 4v16M4 12h16"/>',
  subtraction:'<path d="M4 12h16"/>',
  problems:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6m-6 4h6m-6 4h3"/>',
  shapes:'<path d="m7 4 5 8H2Z"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
  stories:'<path d="M12 5Q6 1 2 4v15q5-3 10 1 5-4 10-1V4q-4-3-10 1Zm0 0v15"/>'
};
export function topicIcon(topic) {
  return `<svg class="topic-icon" data-topic-icon="${Object.prototype.hasOwnProperty.call(paths,topic) ? topic : 'numbers'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[topic] || paths.numbers}</svg>`;
}
