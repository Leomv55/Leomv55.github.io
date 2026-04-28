/**
 * graph.js — Interactive skill dependency graph (D3.js force simulation)
 * Click a skill node → highlights connected project cards
 * Click a project card → glows connected skill nodes
 * Degrades to static tag list on mobile / if D3 fails to load
 */

(function () {
  const GRAPH_ID    = 'dependency-graph';
  const CDN_URL     = 'https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js';
  const MOBILE_BREAKPOINT = 768;

  // ── Data ──────────────────────────────────────────────────────────────────

  const SKILLS = [
    { id: 'python',      label: 'Python',         group: 'lang' },
    { id: 'django',      label: 'Django',          group: 'lang' },
    { id: 'drf',         label: 'DRF',             group: 'lang' },
    { id: 'celery',      label: 'Celery',          group: 'lang' },
    { id: 'langchain',   label: 'LangChain',       group: 'ai' },
    { id: 'llm',         label: 'LLM/SLM',         group: 'ai' },
    { id: 'aws',         label: 'AWS',             group: 'cloud' },
    { id: 'lambda',      label: 'Lambda',          group: 'cloud' },
    { id: 'ecs',         label: 'ECS',             group: 'cloud' },
    { id: 'opensearch',  label: 'OpenSearch',      group: 'search' },
    { id: 'docker',      label: 'Docker',          group: 'infra' },
    { id: 'gha',         label: 'GitHub Actions',  group: 'infra' },
    { id: 'serverless',  label: 'Serverless',      group: 'infra' },
    { id: 'jenkins',     label: 'Jenkins',         group: 'infra' },
    { id: 'graphql',     label: 'GraphQL',         group: 'api' },
    { id: 'rest',        label: 'REST',            group: 'api' },
    { id: 'soap',        label: 'SOAP',            group: 'api' },
    { id: 'postgresql',  label: 'PostgreSQL',      group: 'db' },
    { id: 'redis',       label: 'Redis',           group: 'db' },
    { id: 'sentry',      label: 'Sentry',          group: 'infra' },
    { id: 'grafana',     label: 'Grafana',         group: 'infra' },
    { id: 'kibana',      label: 'Kibana',          group: 'infra' },
    { id: 'loki',        label: 'Loki',            group: 'infra' },
    { id: 'digitalocean',label: 'DigitalOcean',    group: 'cloud' },
  ];

  // project id must match data-project on the card elements
  const PROJECTS = [
    { id: 'bias-detection', label: 'Bias Detection',        skills: ['python','langchain','llm','aws','lambda','serverless','graphql','opensearch'] },
    { id: 'arm-migration',  label: 'ARM Migration',         skills: ['python','aws','ecs','opensearch','docker','gha','jenkins'] },
    { id: 'impress-ai',     label: 'Enterprise Integrations', skills: ['python','django','drf','celery','rest','soap','postgresql','redis','sentry','grafana','kibana','loki','digitalocean'] },
    { id: 'opensearch-3',   label: 'OpenSearch 3 Migration', skills: ['opensearch','aws','ecs','docker','python'] },
  ];

  const GROUP_COLORS = {
    lang:   '#79c0ff',  // blue
    ai:     '#d2a8ff',  // purple
    cloud:  '#ffa657',  // orange
    search: '#56d364',  // green
    infra:  '#8b949e',  // muted
    api:    '#e3b341',  // yellow
    db:     '#f78166',  // red-ish
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function () { cb(new Error('Failed to load ' + src)); };
    document.head.appendChild(s);
  }

  function renderFallback(container) {
    container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'graph-fallback';
    SKILLS.forEach(function (skill) {
      const span = document.createElement('span');
      span.className = 'tag graph-fallback__tag';
      span.textContent = skill.label;
      span.style.borderColor = GROUP_COLORS[skill.group] || '#30363d';
      span.style.color       = GROUP_COLORS[skill.group] || '#8b949e';
      wrap.appendChild(span);
    });
    container.appendChild(wrap);
  }

  function highlightByProject(projectId, svg) {
    const project  = PROJECTS.find(function (p) { return p.id === projectId; });
    if (!project) return;
    const skillSet = new Set(project.skills);

    svg.selectAll('.node-skill')
      .classed('node--dimmed',      function (d) { return !skillSet.has(d.id); })
      .classed('node--highlighted', function (d) { return skillSet.has(d.id); });

    svg.selectAll('.link')
      .classed('link--active', function (d) {
        return d.project === projectId;
      });
  }

  function highlightBySkill(skillId, svg) {
    const relatedProjects = PROJECTS
      .filter(function (p) { return p.skills.includes(skillId); })
      .map(function (p) { return p.id; });

    svg.selectAll('.node-skill')
      .classed('node--dimmed',      function (d) { return d.id !== skillId; })
      .classed('node--highlighted', function (d) { return d.id === skillId; });

    svg.selectAll('.link')
      .classed('link--active', function (d) {
        return relatedProjects.includes(d.project);
      });

    // Highlight project cards in the DOM
    document.querySelectorAll('.project-card').forEach(function (card) {
      const pid = card.dataset.project;
      card.classList.toggle('card--highlighted', relatedProjects.includes(pid));
      card.classList.toggle('card--dimmed',      !relatedProjects.includes(pid));
    });
  }

  function clearHighlight(svg) {
    svg.selectAll('.node-skill, .node-project')
      .classed('node--dimmed', false)
      .classed('node--highlighted', false);
    svg.selectAll('.link').classed('link--active', false);
    document.querySelectorAll('.project-card')
      .forEach(function (c) {
        c.classList.remove('card--highlighted', 'card--dimmed');
      });
  }

  // ── D3 render ─────────────────────────────────────────────────────────────

  function buildGraph(container) {
    const W = container.clientWidth  || 700;
    const H = Math.max(420, W * 0.55);

    container.innerHTML = '';

    // Build node + link arrays
    const nodes = SKILLS.map(function (s) {
      return Object.assign({ type: 'skill' }, s);
    });

    const links = [];
    PROJECTS.forEach(function (proj) {
      proj.skills.forEach(function (skillId) {
        links.push({ source: skillId, target: proj.id + '__proj', project: proj.id });
      });
      nodes.push({ id: proj.id + '__proj', label: proj.label, type: 'project', projectId: proj.id });
    });

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', H)
      .attr('viewBox', [0, 0, W, H]);

    // Arrow marker
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -4 8 8')
      .attr('refX', 18).attr('refY', 0)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-4L8,0L0,4')
      .attr('fill', '#30363d');

    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#30363d')
      .attr('stroke-width', 1);

    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', function (d) {
        return d.type === 'skill' ? 'node-skill' : 'node-project';
      })
      .call(d3.drag()
        .on('start', dragStart)
        .on('drag',  dragged)
        .on('end',   dragEnd));

    // Skill nodes — circles
    node.filter(function (d) { return d.type === 'skill'; })
      .append('circle')
      .attr('r', 22)
      .attr('fill', '#161b22')
      .attr('stroke', function (d) { return GROUP_COLORS[d.group] || '#30363d'; })
      .attr('stroke-width', 1.5);

    // Project nodes — rounded rects
    node.filter(function (d) { return d.type === 'project'; })
      .append('rect')
      .attr('width', 110)
      .attr('height', 32)
      .attr('x', -55).attr('y', -16)
      .attr('rx', 6)
      .attr('fill', '#1c2128')
      .attr('stroke', '#58a6ff')
      .attr('stroke-width', 1.5);

    // Labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', function (d) { return d.type === 'skill' ? '10px' : '11px'; })
      .attr('fill', function (d) {
        if (d.type === 'project') return '#58a6ff';
        return GROUP_COLORS[d.group] || '#8b949e';
      })
      .attr('pointer-events', 'none')
      .text(function (d) { return d.label; });

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link',    d3.forceLink(links).id(function (d) { return d.id; }).distance(90).strength(0.6))
      .force('charge',  d3.forceManyBody().strength(-280))
      .force('center',  d3.forceCenter(W / 2, H / 2))
      .force('collide', d3.forceCollide(40))
      .on('tick', ticked);

    function ticked() {
      link
        .attr('x1', function (d) { return d.source.x; })
        .attr('y1', function (d) { return d.source.y; })
        .attr('x2', function (d) { return d.target.x; })
        .attr('y2', function (d) { return d.target.y; });
      node.attr('transform', function (d) { return 'translate(' + d.x + ',' + d.y + ')'; });
    }

    function dragStart(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d)   { d.fx = event.x; d.fy = event.y; }
    function dragEnd(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null; d.fy = null;
    }

    // Click interactions
    node.filter(function (d) { return d.type === 'skill'; })
      .style('cursor', 'pointer')
      .on('click', function (event, d) {
        event.stopPropagation();
        highlightBySkill(d.id, svg);
      });

    node.filter(function (d) { return d.type === 'project'; })
      .style('cursor', 'pointer')
      .on('click', function (event, d) {
        event.stopPropagation();
        highlightByProject(d.projectId, svg);
        const card = document.querySelector('[data-project="' + d.projectId + '"]');
        if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });

    // Click outside → clear
    svg.on('click', function () { clearHighlight(svg); });

    // Wire project cards → graph highlight
    document.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        highlightByProject(card.dataset.project, svg);
      });
      card.addEventListener('mouseleave', function () {
        clearHighlight(svg);
      });
    });
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById(GRAPH_ID);
    if (!container) return;

    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      renderFallback(container);
      return;
    }

    loadScript(CDN_URL, function (err) {
      if (err || typeof d3 === 'undefined') {
        renderFallback(container);
        return;
      }
      buildGraph(container);
    });
  });

})();
