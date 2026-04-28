/**
 * terminal.js — Static man leo output
 * No animation. Content loads immediately.
 */

(function () {
  const OUTPUT_ID = 'terminal-output';
  const SKIP_ID   = 'terminal-skip';

  const LINES = [
    { text: '$ man leo' },
    { text: '' },
    { text: 'NAME', color: 'white' },
    { text: '    Leo Varghese — Backend Engineer' },
    { text: '' },
    { text: 'SYNOPSIS', color: 'white' },
    { text: '    leo [--python] [--django] [--aws] [--llm]' },
    { text: '' },
    { text: 'DESCRIPTION', color: 'white' },
    { text: '    Backend engineer who enjoys building things that work in production.' },
    { text: '    Has spent a few years working with Python and Django, picking up AWS' },
    { text: '    and LLM integration along the way. Currently at SII India, working' },
    { text: '    on search infrastructure for Thomson Reuters. Previously at Impress.ai.' },
    { text: '' },
    { text: '    Tends to reach for automation when something is done more than twice.' },
    { text: '    Lately that means building custom Claude skills and using the BMad' },
    { text: '    Method to keep AI-assisted work structured and sane.' },
    { text: '' },
    { text: 'STACK', color: 'white' },
    { text: '    Languages  : Python, Django, DRF, Celery, Django Channels' },
    { text: '    Cloud      : AWS (Lambda, ECS, CloudFormation, S3), DigitalOcean' },
    { text: '    Search     : OpenSearch' },
    { text: '    AI         : LangChain, LLM/SLM integration, Claude' },
    { text: '    Infra      : Docker, GitHub Actions, Jenkins, Serverless Framework' },
    { text: '    Databases  : PostgreSQL, Redis, SQLite3' },
    { text: '    Observability: Sentry, Grafana, Kibana, Loki' },
    { text: '    APIs       : REST, SOAP, GraphQL' },
    { text: '' },
    { text: 'SEE ALSO', color: 'white' },
    { text: '    github(1), linkedin(1), POST /api/hire', color: 'accent' },
  ];

  function colorClass(color) {
    if (color === 'white')  return 'term-white';
    if (color === 'accent') return 'term-accent';
    if (color === 'muted')  return 'term-muted';
    if (color === 'green')  return 'term-green';
    return '';
  }

  function render(container) {
    const fragment = document.createDocumentFragment();
    LINES.forEach(function (line) {
      const div = document.createElement('div');
      div.className = 'term-line' + (line.color ? ' ' + colorClass(line.color) : '');
      div.textContent = line.text === '' ? '\u00A0' : line.text;
      fragment.appendChild(div);
    });
    container.appendChild(fragment);
  }

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById(OUTPUT_ID);
    const skipBtn   = document.getElementById(SKIP_ID);
    if (!container) return;

    render(container);

    if (skipBtn) {
      skipBtn.addEventListener('click', function () {
        const projects = document.getElementById('projects');
        if (projects) projects.scrollIntoView({ behavior: 'smooth' });
      });
    }
  });

})();
