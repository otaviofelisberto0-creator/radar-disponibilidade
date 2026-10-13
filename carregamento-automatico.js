/* Radar de Disponibilidade - carregamento automatico via dados/manifest.json */
(function () {
  'use strict';

  const MANIFEST_URL = './dados/manifest.json';

  function isoToLocalDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;
    const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function setAutoStatus(message, kind) {
    const el = document.getElementById('status');
    if (!el) return;
    el.className = 'status' + (kind ? ' ' + kind : '');
    el.textContent = message;
  }

  async function fetchJson(url) {
    const separator = url.includes('?') ? '&' : '?';
    const response = await fetch(url + separator + 'v=' + Date.now(), { cache: 'no-store' });
    if (!response.ok) throw new Error('HTTP ' + response.status + ' ao acessar ' + url);
    return response.json();
  }

  function validatePayload(payload) {
    if (!payload || typeof payload !== 'object') throw new Error('JSON diario vazio ou invalido.');
    if (!payload.radar || !Array.isArray(payload.radar.horizons) || !Array.isArray(payload.radar.records)) {
      throw new Error('JSON diario sem radar.horizons ou radar.records.');
    }
  }

  async function loadLatestRadarBase() {
    setAutoStatus('Consultando o manifest.json...', '');

    const manifest = await fetchJson(MANIFEST_URL);
    if (!manifest || !manifest.arquivoAtual) {
      throw new Error('O manifest.json nao informa arquivoAtual.');
    }

    const fileName = String(manifest.arquivoAtual).split('/').pop();
    const payload = await fetchJson('./dados/' + encodeURIComponent(fileName));
    validatePayload(payload);

    const metadata = payload.metadata || {};
    const ref = isoToLocalDate(metadata.d0 || manifest.ultimaAtualizacao) ||
      (typeof parseFileDate === 'function' ? parseFileDate(fileName) : null);
    if (!ref) throw new Error('Nao foi possivel identificar o D+0 do JSON diario.');

    const horizons = payload.radar.horizons.map((item, index) => ({
      ...item,
      date: item && item.date ? item.date : (typeof formatDateBR === 'function'
        ? formatDateBR(new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + index))
        : '')
    }));

    M = {
      all: Array.isArray(payload.sourceRows) ? payload.sourceRows : payload.radar.records,
      rps: Array.isArray(payload.sourceRows) ? payload.sourceRows : payload.radar.records,
      gs: horizons,
      rec: payload.radar.records
    };

    SOURCE_RAW = Array.isArray(payload.sourceRows) ? payload.sourceRows : [];
    SOURCE_REF = ref;
    SOURCE_SHEET = metadata.sheetName || '';
    SOURCE_CONTENT = null;
    SOURCE_FILE = {
      name: metadata.sourceFile || fileName,
      size: Number(metadata.sourceSizeBytes) || 0
    };
    JSON_FILE_NAME = fileName;

    if (typeof refreshOperationalClassifications === 'function') refreshOperationalClassifications();
    if (typeof saveSnapshot === 'function') saveSnapshot(fileName);
    if (typeof build === 'function') build();
    if (typeof updateInstitutionalMeta === 'function') {
      const processedAt = metadata.convertedAt ? new Date(metadata.convertedAt) : new Date();
      updateInstitutionalMeta(ref, Number.isNaN(processedAt.getTime()) ? new Date() : processedAt);
    }

    const setText = (id, value) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    };

    setText('fn', fileName + ' (GitHub)');
    setText('sourceSize', typeof formatBytes === 'function' ? formatBytes(metadata.sourceSizeBytes || 0) : '—');
    setText('sourceRecords', metadata.recordCount ?? M.all.length);
    setText('sourceD0', typeof formatDateShort === 'function' ? formatDateShort(ref) : metadata.d0);
    setText('jsonName', fileName);
    setText('tag', 'Base automatica: ' + fileName);

    if (typeof setFlowVisual === 'function') {
      setFlowVisual('load', 'completed', 'JSON carregado do GitHub', 100);
      setFlowVisual('process', 'completed', 'Base pronta para consulta', 100);
      setFlowVisual('convert', 'waiting', 'Carga automatica ja convertida', 0);
      setFlowVisual('download', 'waiting', 'Disponivel somente no fluxo manual', 0);
      setFlowVisual('github', 'waiting', 'Nenhuma acao necessaria', 0);
    }

    const overallStatus = document.getElementById('overallStatus');
    const overallPercent = document.getElementById('overallPercent');
    const overallBar = document.getElementById('overallBar');
    const stageStatus = document.getElementById('stageStatus');
    const stagePercent = document.getElementById('stagePercent');
    const stageBar = document.getElementById('stageBar');
    if (overallStatus) overallStatus.textContent = 'Base automatica carregada';
    if (overallPercent) overallPercent.textContent = '100%';
    if (overallBar) overallBar.style.width = '100%';
    if (stageStatus) stageStatus.textContent = 'Etapa concluida: leitura do GitHub';
    if (stagePercent) stagePercent.textContent = '100%';
    if (stageBar) stageBar.style.width = '100%';

    setAutoStatus('Base carregada automaticamente: ' + fileName + '.', 'ok');
  }

  window.addEventListener('DOMContentLoaded', function () {
    loadLatestRadarBase().catch(function (error) {
      console.error('[Radar] Falha no carregamento automatico:', error);
      setAutoStatus('Carga automatica indisponivel: ' + error.message + ' Use Carregar arquivo como alternativa.', 'err');
    });
  });
})();
