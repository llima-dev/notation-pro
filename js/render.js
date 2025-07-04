function renderizarLembretes() {
    const container = document.getElementById('coluna-lembretes');
    container.innerHTML = '';

    // Descobre quantas colunas estão visíveis (não d-none)
    const visiveis = [
        document.querySelector('.col-lembretes'),
        document.querySelector('.col-anotacoes'),
        document.querySelector('.col-snippets')
    ].filter(el => el && !el.classList.contains('d-none')).length;

    // Aplica grid ou lista automático
    if (visiveis === 3) {
        // Três colunas: lista (um card por linha)
        container.classList.remove('row', 'g-2', 'g-3');
    } else {
        // Duas ou uma coluna: grid responsivo
        container.classList.add('row', 'g-2'); // g-2 = espaçamento entre cards
    }

    termoFiltroAtual = document.getElementById('inputFiltroLembrete').value.trim().toLowerCase();
    statusFiltroAtual = document.getElementById('filtroStatusLembrete').value || "";

    const ativos = lembretes.filter(l => {
        if (l.arquivado) return false;
        if (filtroFavoritos.lembretes && !l.favorito) return false;

        const status = getStatusPrazoLembrete(l);
        if (statusFiltroAtual && status !== statusFiltroAtual) return false;

        const textoCompleto = `${l.titulo} ${l.descricao}`.toLowerCase();
        if (termoFiltroAtual && !textoCompleto.includes(termoFiltroAtual)) return false;

        return true;
    });

    ativos.forEach((item, index) => {
        // Decide o wrapper da coluna: se grid, usa col-md-6 col-lg-4, se lista, só col-12
        const col = document.createElement('div');
        if (visiveis === 3) {
            col.className = 'col-12';
        } else {
            col.className = 'col-12 col-md-6 col-lg-4';
        }

        // Card real (igual seu código)
        const card = document.createElement('div');
        card.dataset.id = item.id;
        const corClasse = item.cor && item.cor !== 'nenhuma' ? `card-borda-${item.cor}` : 'card-sem-cor';
        card.className = `card mb-3 ${corClasse}`;
        card.style = `position: relative;`;

        const favClass = item.favorito ? 'fa-solid fa-star' : 'fa-regular fa-star';
        const { feitos, total, percentual } = calcularProgressoChecklist(item.checklist || []);
        const corProgresso = corBarraPorcentagem(percentual);
        const barraProgressoHTML = (total > 0 && percentual > 0)
            ? `<div class="progress-check mb-2">
                <div class="progress-check-bar" style="width: ${percentual}%; background-color: ${corProgresso};">
                  ${percentual}%
                </div>
              </div>`
            : '';

        card.innerHTML = `
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="position-absolute top-0 end-0 m-2 drag-handle drag-lembrete text-muted" style="cursor: grab;" title="Arrastar para mover">
            <i class="fas fa-up-down-left-right"></i>
          </div>
          <div class="d-flex">
            <button class="estrela-btn" onclick="alternarFavorito('lembrete', '${item.id}')">
              <i class="${favClass}"></i>
            </button>
            <h5 class="card-title mr-3">
              ${destacarHashtags(item.titulo)}
            </h5>
          </div>
        </div>

        <p class="card-text descricao-limite">
          ${converterQuebrasDeLinha(transformarLinks(removerHashtags(item.descricao)))}
        </p>

        <div class="tags mt-2">
          ${extrairHashtags(item.descricao).map(tag => `
            <span class="badge bg-primary-subtle text-primary fw-medium me-1">#${tag}</span>
          `).join('')}
        </div>

        <p class="text-muted small mt-2">
          ${item.prazo ? `<i class="fas fa-calendar-day me-1"></i> Prazo: <strong>${formatarPrazo(item.prazo)}</strong>` : ''}
        </p>

        <div class="checklist-container">
          ${item.checklist?.map((chk, i) => `
            <div 
              class="d-flex align-items-start gap-2 mb-1 check rounded drag-check"
              id="check-wrapper-${item.id}-${i}"
              data-check-index="${i}"
              style="cursor: grab;"
            >
              <input class="form-check-input mt-1" type="checkbox" id="check-${index}-${i}" ${chk.feito ? 'checked' : ''}>
              <label class="form-check-label flex-grow-1 p-1" for="check-${index}-${i}">${chk.texto}</label>
              <button class="btn-link-acao text-secondary" onclick="editarChecklistItem('${item.id}', ${i})" title="Editar">Editar</button>
              <button class="btn-link-acao text-secondary" onclick="removerChecklistItem('${item.id}', ${i})" title="Remover">Remover</button>
              <i class="fas fa-up-down-left-right text-muted mt-1 drag-handle-check" title="Arrastar para reordenar"></i>
            </div>
          `).join('') || ''}        
        </div>
        <div class="d-flex justify-content-between align-items-center mt-2 bg-white rounded p-1 card-footer-botoes">
          <div class="status-container d-flex" style="flex: 1; max-width: 200px;">
            ${
                estaConcluido(item.checklist)
                    ? `<small class="bandeira-concluido" title="Concluído"><i class="fa-solid fa-flag-checkered text-secondary"></i></small>`
                    : (item.prazo
                        ? `<span 
                              class="bolinha-prazo" 
                              style="background: ${statusPrazoCor(item.prazo, item.checklist)}"
                              title="${statusPrazoTitulo(item.prazo, item.checklist)}"
                            ></span>`
                        : ''
                      )
            }
            ${barraProgressoHTML}
          </div>        
          <div class="d-flex gap-2">
            <button class="btn btn-sm no-border btn-outline-secondary" title="Remover" onclick="removerLembrete('${item.id}')">
              <i class="fas fa-trash"></i>
            </button>
            <button class="btn btn-sm no-border btn-outline-secondary" title="Arquivar" onclick="arquivarLembrete('${item.id}')"><i class="fas fa-box-archive"></i></button>
            <button class="btn btn-sm no-border btn-outline-secondary" title="Editar" onclick="editarLembrete('${item.id}')"><i class="fas fa-pen"></i></button>
            <button class="btn btn-sm no-border btn-outline-secondary" title="Adicionar check-list" onclick="adicionarChecklist('${item.id}')"><i class="fas fa-list-check"></i></button>
            <button class="btn btn-sm no-border btn-outline-secondary info-btn" title="Informações" onclick="abrirModalInformacoes('${item.id}')">
              <i class="fas fa-circle-info"></i>
            </button>
          </div>
        </div>        
      </div>
    `;

        col.appendChild(card);
        container.appendChild(col);
        ativarSortableChecklist(item.id);

        if (termoFiltroAtual || statusFiltroAtual || filtroFavoritos.lembretes) {
            const drags = card.getElementsByClassName('drag-lembrete');
            for (const drag of drags) {
                drag.style.display = 'none';
            }
        }

        item.checklist?.forEach((chk, i) => {
            const checkbox = document.getElementById(`check-${index}-${i}`);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    const realIndex = lembretes.findIndex(l => l.id === item.id);
                    if (realIndex !== -1) {
                        lembretes[realIndex].checklist[i].feito = checkbox.checked;
                        salvarLembretes();
                        renderizarLembretes();
                    }
                    salvarLembretes();
                });
            }
        });
    });

    const cards = container.querySelectorAll('.card');
    const colunasPorLinha = 3; // quantos cards por linha no grid (ajuste se mudar o grid)
    if (cards.length > colunasPorLinha) {
      cards.forEach(card => card.classList.add('card-flex-full'));
    } else {
      cards.forEach(card => card.classList.remove('card-flex-full'));
    }

    ativarSortableLembretes();
    atualizarContadorFavoritos();
}

function renderizarAnotacoes() {
    const container = document.getElementById('coluna-outros');
    container.innerHTML = '';
  
    const ativos = anotacoes.filter(a =>
      !a.arquivado && (!filtroFavoritos.anotacoes || a.favorito)
    );
  
    ativos.forEach(anot => {
      const card = document.createElement('div');
  
      card.className = 'card mb-3 anotacao-card';
      card.dataset.id = anot.id;
      const favClass = anot.favorito ? 'fa-solid fa-star' : 'fa-regular fa-star';
  
      card.innerHTML = `
      <div class="card-body position-relative d-flex flex-column">
        <div class="position-absolute top-0 end-0 m-2 drag-handle drag-anotacoes text-muted" style="cursor: grab;" title="Arrastar para mover">
          <i class="fas fa-up-down-left-right"></i>
        </div>
    
        <div class="d-flex">
        <button class="estrela-btn" onclick="alternarFavorito('anotacao', '${anot.id}')">
          <i class="${favClass}"></i>
        </button>
        <h5 class="card-title">${anot.titulo || 'Sem título'}</h5>
        </div>
    
        <div class="card-text flex-grow-1">
          <div class="anotacao-conteudo-scroll">${anot.conteudoHtml}</div>
        </div>
    
        <p class="text-muted small mt-2 mb-1">${formatarData(anot.criadoEm)}</p>
    
        <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-sm no-border btn-outline-secondary" title="Arquivar" onclick="arquivarAnotacao('${anot.id}')">
            <i class="fas fa-box-archive"></i>
          </button>
          <button class="btn btn-sm no-border btn-outline-secondary" title="Editar" onclick="editarAnotacao('${anot.id}')">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm no-border btn-outline-secondary" title="Remover" onclick="removerAnotacao('${anot.id}')">
            <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm no-border btn-outline-secondary info-btn" title="Ver anotação completa" onclick="abrirAnotacaoCompleta('${anot.id}')">
            <i class="fas fa-circle-info"></i>
          </button>
        </div>
      </div>
    `;  
  
      container.appendChild(card);
  
      const filtroAtivo = filtroFavoritos.anotacoes || termoFiltroAnotacoes.trim();
      const drags = card.getElementsByClassName('drag-anotacoes'); 
  
      for (const drag of drags) {
        drag.style.display = filtroAtivo ? 'none' : '';
      }
    });
  
    ativarSortableAnotacoes();
    atualizarContadorFavoritos();
}


function renderizarSnippets() {
    const container = document.getElementById('coluna-snippets');
    container.innerHTML = '';
  
    const ativos = snippets.filter(s =>
      !s.arquivado && (!filtroFavoritos.snippets || s.favorito)
    );
  
    ativos.forEach(snippet => {
      const card = document.createElement('div');
      card.className = 'card mb-3 snippet-card';
      const favClass = snippet.favorito ? 'fa-solid fa-star' : 'fa-regular fa-star';
  
      card.innerHTML = `
      <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
          <div class="position-absolute top-0 end-0 m-2 drag-handle drag-snippets text-muted" style="cursor: grab;" title="Arrastar para mover">
              <i class="fas fa-up-down-left-right"></i>
          </div>
          <div class="d-flex">
          <button class="estrela-btn" onclick="alternarFavorito('snippet', '${snippet.id}')">
            <i class="${favClass}"></i>
          </button>
          <h5 class="card-title">${snippet.titulo}</h5>
          </div>
          </div>
          <p class="card-text">${snippet.descricao || ''}</p>
          <pre><code class="language-${snippet.linguagem}">${snippet.codigo}</code></pre>
          <div class="d-flex justify-content-end gap-2">
          <button class="btn btn-sm no-border btn-outline-secondary" title="Editar" onclick="editarSnippet('${snippet.id}')">
              <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm no-border btn-outline-secondary" title="Remover" onclick="removerSnippet('${snippet.id}')">
              <i class="fas fa-trash"></i>
          </button>
          <button class="btn btn-sm no-border btn-outline-secondary" title="Copiar código" onclick="copiarCodigo('${snippet.id}')">
              <i class="fas fa-copy"></i>
          </button>
          </div>
      </div>
      `;
      card.dataset.id = snippet.id;
      container.appendChild(card);

      const filtroAtivo =
        filtroFavoritos.snippets || termoFiltroSnippets.trim();
      const drags = card.getElementsByClassName("drag-snippets");

      for (const drag of drags) {
        drag.style.display = filtroAtivo ? "none" : "";
      }
  });
  
      hljs.highlightAll();
      ativarSortableSnippets();
      atualizarContadorFavoritos();
  }

  window.addEventListener('DOMContentLoaded', () => {
    // Logo: bounce e shake
    anime({
      targets: '#mm-logo',
      scale: [0, 1.12, 1],
      opacity: [0, 1],
      easing: 'easeOutElastic(1, .8)',
      duration: 1200,
      delay: 100,
      complete: function() {
        anime({
          targets: '#mm-logo',
          translateX: [
            { value: -8, duration: 60 },
            { value: 8, duration: 60 },
            { value: -6, duration: 50 },
            { value: 6, duration: 50 },
            { value: -4, duration: 40 },
            { value: 4, duration: 40 },
            { value: 0, duration: 30 }
          ],
          easing: 'easeInOutSine',
          complete: function() {
            // Anima o texto depois do shake
            anime({
              targets: '#mm-titulo',
              opacity: [0, 1],
              translateY: [16, 0],
              scale: [0.92, 1],
              easing: 'easeOutCubic',
              duration: 500
            });
          }
        });
      }
    });
  
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) {
        splash.style.transition = 'opacity 0.3s';
        splash.style.opacity = '0';
        setTimeout(() => splash.remove(), 600);
      }
    }, 2500);
  });
  