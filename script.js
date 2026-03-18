// ==========================================
// 1. CONFIGURAÇÕES E BANCO DE DADOS
// ==========================================
const MODOS = { MANUAL: 'manual_horas', FIXO: 'fixo_mensal' };
const STORAGE_CONFIG = 'calculadora_energia_config_v11';
const STORAGE_REGISTROS = 'calculadora_energia_registros_v11';

// Inicia vazio para forçar o preenchimento pelo usuário
const CONFIG_PADRAO = {
  valor_conta_anterior: '',
  consumo_conta_anterior: '',
  meta_reducao: ''
};

// Banco de dados original
const aparelhosDB = [
  // Uso controlado pelo usuário (Potência + Tempo)
  { id: 1, nome: 'Lâmpada LED bulbo 9W', modo: MODOS.MANUAL, potencia_w: 9, horas_padrao: 5, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 2, nome: 'Ventilador de mesa/coluna', modo: MODOS.MANUAL, potencia_w: 126, horas_padrao: 8, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 3, nome: 'Televisão LED ', modo: MODOS.MANUAL, potencia_w: 195, horas_padrao: 4, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 4, nome: 'Ar-condicionado Split 9.000 BTU', modo: MODOS.MANUAL, potencia_w: 840, horas_padrao: 8, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 5, nome: 'Chuveiro elétrico', modo: MODOS.MANUAL, potencia_w: 5500, horas_padrao: 0.5, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 6, nome: 'Micro-ondas', modo: MODOS.MANUAL, potencia_w: 1400, horas_padrao: 0.3, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 7, nome: 'Air Fryer', modo: MODOS.MANUAL, potencia_w: 1500, horas_padrao: 0.5, dias_padrao: 20, quantidade_padrao: 1 },
  { id: 8, nome: 'Notebook', modo: MODOS.MANUAL, potencia_w: 65, horas_padrao: 6, dias_padrao: 30, quantidade_padrao: 1 },
  { id: 10, nome: 'Ferro de passar', modo: MODOS.MANUAL, potencia_w: 1200, horas_padrao: 0.5, dias_padrao: 8, quantidade_padrao: 1 },

  // Consumo mensal fixo de fábrica
  { id: 11, nome: 'Geladeira antiga (+10 anos)', modo: MODOS.FIXO, consumo_base_kwh: 150, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 12, nome: 'Geladeira frost free duplex', modo: MODOS.FIXO, consumo_base_kwh: 50, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 13, nome: 'Geladeira inverter duplex', modo: MODOS.FIXO, consumo_base_kwh: 40.1, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 14, nome: 'Geladeira inverse / inverter grande', modo: MODOS.FIXO, consumo_base_kwh: 55, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 15, nome: 'Máquina de lavar 13 kg', modo: MODOS.FIXO, consumo_base_kwh: 4.32, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 16, nome: 'Máquina de lavar 14 kg', modo: MODOS.FIXO, consumo_base_kwh: 4.68, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 17, nome: 'Máquina de lavar 17 kg', modo: MODOS.FIXO, consumo_base_kwh: 5.52, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 18, nome: 'Tanquinho 12 kg', modo: MODOS.FIXO, consumo_base_kwh: 1.56, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 19, nome: 'Lava e seca (água fria)', modo: MODOS.FIXO, consumo_base_kwh: 3.6, unidadeBase: 'kWh/mês', quantidade_padrao: 1 },
  { id: 20, nome: 'Lava e seca (água quente)', modo: MODOS.FIXO, consumo_base_kwh: 19.2, unidadeBase: 'kWh/mês', quantidade_padrao: 1 }
];

// ==========================================
// 2. UTILITÁRIOS
// ==========================================
const formatarMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatarNumero = (valor, casas = 2) => Number(valor || 0).toFixed(casas);
const mesAtualISO = () => new Date().toISOString().slice(0, 7);
const formatarMesReferencia = (mes) => (mes ? mes.split('-').reverse().join('/') : '-');
const numVal = (val) => parseFloat(val) || 0; 
const intVal = (val) => parseInt(val, 10) || 0;

function tipoCalculoParaTexto(modo) {
  return modo === MODOS.FIXO ? 'Consumo de fábrica fixo (kWh/mês)' : 'Potência (W) + Tempo de uso';
}

function escaparCSV(texto) {
  return `"${String(texto || '').replace(/"/g, '""')}"`;
}

// Remove acentos e deixa minúsculo para busca inteligente
function normalizarNome(nome) {
  return String(nome || '').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// ==========================================
// 3. MAPEAMENTO DO DOM
// ==========================================
const els = {
  valorContaAnterior: document.getElementById('valor_conta_anterior'),
  consumoContaAnterior: document.getElementById('consumo_conta_anterior'),
  custoKwhEfetivo: document.getElementById('custo_kwh_efetivo'),
  metaReducao: document.getElementById('meta_reducao'),
  economiaAlvo: document.getElementById('economia_alvo'),
  contaIdeal: document.getElementById('conta_ideal'),
  parametrosInternos: document.getElementById('parametros-internos'),
  simulacaoResultado: document.getElementById('simulacao-resultado'),
  simulacaoAlerta: document.getElementById('simulacao-alerta'),
  formSimulacao: document.getElementById('form-simulacao'),
  btnLimparConfig: document.getElementById('btn-limpar-config'),

  registroMes: document.getElementById('registro_mes'),
  registroAparelhoPadrao: document.getElementById('registro_aparelho_padrao'),
  registroAparelhoNome: document.getElementById('registro_aparelho_nome'),
  registroTipoCalculo: document.getElementById('registro_tipo_calculo'),

  campoPotencia: document.getElementById('campo-potencia'),
  campoHoras: document.getElementById('campo-horas'),
  campoDiasUso: document.getElementById('campo-dias-uso'),
  campoConsumoBase: document.getElementById('campo-consumo-base'),
  campoUnidadeBase: document.getElementById('campo-unidade-base'),

  registroPotencia: document.getElementById('registro_potencia'),
  registroHorasDia: document.getElementById('registro_horas_dia'),
  registroDiasUso: document.getElementById('registro_dias_uso'),
  registroConsumoBase: document.getElementById('registro_consumo_base'),
  registroUnidadeBase: document.getElementById('registro_unidade_base'),

  registroQuantidade: document.getElementById('registro_quantidade'),
  registroConsumo: document.getElementById('registro_consumo'),
  registroCusto: document.getElementById('registro_custo'),
  registroObs: document.getElementById('registro_obs'),
  formRegistro: document.getElementById('form-registro'),

  filtroMes: document.getElementById('filtro_mes'),
  btnExportarCsv: document.getElementById('btn-exportar-csv'),
  btnLimparRegistros: document.getElementById('btn-limpar-registros'),
  painelMensal: document.getElementById('painel-mensal'),
  statusMes: document.getElementById('status-mes'),
  tabelaRegistros: document.getElementById('tabela-registros')
};

// ==========================================
// 4. ESTADO E STORAGE
// ==========================================
const carregarConfig = () => JSON.parse(localStorage.getItem(STORAGE_CONFIG)) || { ...CONFIG_PADRAO };
const salvarConfig = (config) => localStorage.setItem(STORAGE_CONFIG, JSON.stringify(config));
const carregarRegistros = () => JSON.parse(localStorage.getItem(STORAGE_REGISTROS)) || [];
const salvarRegistros = (registros) => localStorage.setItem(STORAGE_REGISTROS, JSON.stringify(registros));

function lerConfigDaTela() {
  return {
    valor_conta_anterior: numVal(els.valorContaAnterior.value),
    consumo_conta_anterior: numVal(els.consumoContaAnterior.value),
    meta_reducao: numVal(els.metaReducao.value)
  };
}

// ==========================================
// 5. LÓGICA DE NEGÓCIO E DICAS INTELIGENTES
// ==========================================
function calcularIndicadoresPuros(config) {
  const custo_kwh_efetivo = config.consumo_conta_anterior > 0 
    ? config.valor_conta_anterior / config.consumo_conta_anterior 
    : 0;
  
  const economia_alvo = config.valor_conta_anterior * (config.meta_reducao / 100);
  const conta_ideal = Math.max(config.valor_conta_anterior - economia_alvo, 0);
  const consumo_ideal = custo_kwh_efetivo > 0 ? conta_ideal / custo_kwh_efetivo : 0;

  return { ...config, custo_kwh_efetivo, economia_alvo, conta_ideal, consumo_ideal };
}

function calcularRegistroPuro(dadosTela, indicadoresBase) {
  const { modo, potencia, horasDia, diasUso, consumoBaseKwh, quantidade } = dadosTela;
  let consumoMensal = 0;

  if (modo === MODOS.MANUAL) {
    if (potencia > 0 && horasDia > 0 && diasUso > 0) {
      consumoMensal = (potencia * horasDia * diasUso * quantidade) / 1000;
    }
  } else if (modo === MODOS.FIXO) {
    if (consumoBaseKwh > 0) {
      consumoMensal = consumoBaseKwh * quantidade;
    }
  }

  const custoMensal = consumoMensal * indicadoresBase.custo_kwh_efetivo;
  return { ...dadosTela, consumoMensal, custoMensal, temDadosValidos: consumoMensal > 0 };
}

function obterStatusConsumo(custoEstimado, contaIdeal, contaAtual) {
  if (custoEstimado <= contaIdeal) return { classe: 'meta', texto: 'Meta atingida' };
  if (custoEstimado <= contaAtual) return { classe: 'estavel', texto: 'Dentro da média atual' };
  if (custoEstimado <= contaAtual * 1.1) return { classe: 'atencao', texto: 'Acima da média' };
  return { classe: 'critico', texto: 'Consumo crítico' };
}

// MOTOR DE DICAS CORRIGIDO E BLINDADO
function gerarDicasPersonalizadas(topViloes) {
  const dicas = [];
  if (!topViloes || topViloes.length === 0) return [];

  topViloes.forEach((aparelho, index) => {
    const nomeAlvo = normalizarNome(aparelho.nome);
    const posicao = index + 1;
    let dicaTexto = "";

    // Buscas rigorosas para não misturar "ar" com "lavar", etc.
    if (nomeAlvo.includes('chuveiro')) {
      dicaTexto = `Mudar a chave para a posição 'Verão' reduz o consumo em cerca de 30%. Evite banhos acima de 10 minutos.`;
    } else if (nomeAlvo.includes('ar condicionado') || nomeAlvo.includes('split') || nomeAlvo.match(/\bar\b/)) {
      dicaTexto = `Ajuste o aparelho para 23ºC ou 24ºC. Temperaturas mais baixas forçam o motor e não gelam o ambiente mais rápido. Mantenha os filtros limpos.`;
    } else if (nomeAlvo.includes('geladeira') || nomeAlvo.includes('refrigerador')) {
      if (nomeAlvo.includes('antiga')) {
        dicaTexto = `Aparelhos com mais de 10 anos puxam muita energia. Considere trocar por uma com Selo Procel A; o investimento se paga a médio prazo.`;
      } else {
        dicaTexto = `Evite guardar alimentos quentes e faça o teste prendendo uma folha de papel na porta para checar se a borracha está vedando bem.`;
      }
    } else if (nomeAlvo.includes('lavar') || nomeAlvo.includes('seca') || nomeAlvo.includes('tanquinho') || nomeAlvo.includes('maquina')) {
      dicaTexto = `Lavar poucas roupas várias vezes gasta muito. Acumule roupas para usar a capacidade máxima e evite lavagem com água quente.`;
    } else if (nomeAlvo.includes('ferro')) {
      dicaTexto = `Esquentar o ferro é a fase que mais puxa energia. Tente passar todas as roupas da semana em um único dia, começando pelas peças mais leves.`;
    } else if (nomeAlvo.includes('lampada') || nomeAlvo.includes('luz')) {
      dicaTexto = `Aproveite ao máximo a luz natural abrindo janelas durante o dia. Sempre apague ao sair do ambiente.`;
    } else if (nomeAlvo.includes('televis') || nomeAlvo.includes('tv') || nomeAlvo.includes('computador') || nomeAlvo.includes('notebook')) {
      dicaTexto = `Evite deixar ligado sem uso (como "som de fundo"). Desligue da tomada quando não for usar por longos períodos para evitar o consumo em stand-by.`;
    } else if (nomeAlvo.includes('ventilador')) {
      dicaTexto = `O ventilador consome bem menos que o ar-condicionado, mas deixá-lo ligado em um quarto vazio é desperdício. Desligue ao sair.`;
    } else if (nomeAlvo.includes('micro') || nomeAlvo.includes('air fryer') || nomeAlvo.includes('fritadeira')) {
      dicaTexto = `Aparelhos que geram muito calor rápido puxam um pico alto de energia. Use apenas pelo tempo estritamente necessário para o preparo.`;
    } else {
      // Dica de segurança dinâmica
      if (aparelho.modo === MODOS.MANUAL) {
        dicaTexto = `Para economizar com este item, foque em reduzir as <strong>${formatarNumero(aparelho.horasDia, 1)}h diárias</strong> de uso. Reduzir o tempo é a forma mais garantida de baixar a conta.`;
      } else {
        dicaTexto = `Este aparelho possui um consumo fixo de fábrica. A única forma de economizar é trocando-o futuramente por um modelo mais eficiente (Selo Procel A).`;
      }
    }

    dicas.push(`<strong>${posicao}º Maior Impacto (${aparelho.nome}):</strong> ${dicaTexto}`);
  });

  return dicas;
}

// ==========================================
// 6. MANIPULAÇÃO DA INTERFACE
// ==========================================
function popularAparelhos() {
  const aparelhosUsoManual = aparelhosDB.filter(item => item.modo === MODOS.MANUAL);
  const aparelhosUsoFixo = aparelhosDB.filter(item => item.modo === MODOS.FIXO);

  els.registroAparelhoPadrao.innerHTML = `
    <option value="">Selecione um aparelho</option>
    <optgroup label="⏱️ Uso dependente do usuário (Horas/Dias)">
      ${aparelhosUsoManual.map((item) => `<option value="${item.id}">${item.nome}</option>`).join('')}
    </optgroup>
    <optgroup label="❄️ Consumo Fixo Padrão (Mensal)">
      ${aparelhosUsoFixo.map((item) => `<option value="${item.id}">${item.nome}</option>`).join('')}
    </optgroup>
  `;
}

function preencherConfigNaTela(config) {
  els.valorContaAnterior.value = config.valor_conta_anterior;
  els.consumoContaAnterior.value = config.consumo_conta_anterior;
  els.metaReducao.value = config.metaReducao;
  atualizarCamposDerivados();
}

function atualizarCamposDerivados() {
  const config = lerConfigDaTela();
  const base = calcularIndicadoresPuros(config);

  els.custoKwhEfetivo.value = base.custo_kwh_efetivo ? formatarNumero(base.custo_kwh_efetivo, 4) : '';
  els.economiaAlvo.value = base.economia_alvo ? formatarNumero(base.economia_alvo, 2) : '';
  els.contaIdeal.value = base.conta_ideal ? formatarNumero(base.conta_ideal, 2) : '';

  els.parametrosInternos.innerHTML = `
    <strong>O que o sistema faz:</strong><br>
    • Calcula o custo efetivo do kWh com base na última conta.<br>
    • Estima o custo dos aparelhos usando esse valor.<br>
    • Soma tudo para gerar o gasto estimado do mês.<br>
    • Compara o total com sua meta de economia.
  `;
}

function alternarCamposCadastro(modo) {
  const isManual = modo === MODOS.MANUAL;
  
  els.campoPotencia.classList.toggle('escondido', !isManual);
  els.campoHoras.classList.toggle('escondido', !isManual);
  els.campoDiasUso.classList.toggle('escondido', !isManual);
  
  els.campoConsumoBase.classList.toggle('escondido', isManual);
  els.campoUnidadeBase.classList.toggle('escondido', isManual);
}

function limparCamposCadastro() {
  els.registroAparelhoPadrao.value = '';
  els.registroAparelhoNome.value = '';
  els.registroTipoCalculo.value = '';
  els.registroPotencia.value = '';
  els.registroHorasDia.value = '';
  els.registroDiasUso.value = '';
  els.registroConsumoBase.value = '';
  els.registroUnidadeBase.value = '';
  els.registroQuantidade.value = 1;
  els.registroConsumo.value = '';
  els.registroCusto.value = '';
  els.registroObs.value = '';
  
  alternarCamposCadastro(null);
}

function aplicarPadraoAparelho() {
  const id = intVal(els.registroAparelhoPadrao.value);
  const aparelho = aparelhosDB.find((item) => item.id === id);

  if (!aparelho) {
    limparCamposCadastro();
    renderSimulacao();
    return;
  }

  els.registroAparelhoNome.value = aparelho.nome;
  els.registroTipoCalculo.value = tipoCalculoParaTexto(aparelho.modo);
  els.registroQuantidade.value = aparelho.quantidade_padrao || 1;

  alternarCamposCadastro(aparelho.modo);

  if (aparelho.modo === MODOS.MANUAL) {
    els.registroPotencia.value = aparelho.potencia_w;
    els.registroHorasDia.value = aparelho.horas_padrao;
    els.registroDiasUso.value = aparelho.dias_padrao;
    els.registroConsumoBase.value = '';
  } else {
    els.registroPotencia.value = '';
    els.registroHorasDia.value = '';
    els.registroDiasUso.value = '';
    els.registroConsumoBase.value = aparelho.consumo_base_kwh;
    els.registroUnidadeBase.value = aparelho.unidadeBase || 'kWh/mês';
  }

  atualizarCalculoRegistroAtual();
  renderSimulacao();
}

function extrairDadosCadastro() {
  const idSelecionado = intVal(els.registroAparelhoPadrao.value);
  const aparelho = aparelhosDB.find(item => item.id === idSelecionado);
  
  return {
    mes: els.registroMes.value || mesAtualISO(),
    nome: els.registroAparelhoNome.value.trim(),
    modo: aparelho ? aparelho.modo : '',
    potencia: numVal(els.registroPotencia.value),
    horasDia: numVal(els.registroHorasDia.value),
    diasUso: intVal(els.registroDiasUso.value),
    consumoBaseKwh: numVal(els.registroConsumoBase.value),
    unidadeBase: els.registroUnidadeBase.value || 'kWh/mês',
    quantidade: intVal(els.registroQuantidade.value),
    observacoes: els.registroObs.value.trim()
  };
}

function atualizarCalculoRegistroAtual() {
  const base = calcularIndicadoresPuros(lerConfigDaTela());
  const dados = extrairDadosCadastro();
  const registro = calcularRegistroPuro(dados, base);

  els.registroConsumo.value = registro.consumoMensal ? formatarNumero(registro.consumoMensal, 2) : '';
  els.registroCusto.value = registro.custoMensal ? formatarNumero(registro.custoMensal, 2) : '';
  return registro; 
}

function renderSimulacao() {
  const base = calcularIndicadoresPuros(lerConfigDaTela());
  const atual = atualizarCalculoRegistroAtual();

  const cards = [
    { label: 'Última conta', value: formatarMoeda(base.valor_conta_anterior), extra: 'Valor total informado.' },
    { label: 'Consumo anterior', value: `${formatarNumero(base.consumo_conta_anterior, 2)} kWh`, extra: 'Consumo total informado.' },
    { label: 'Custo efetivo do kWh', value: formatarMoeda(base.custo_kwh_efetivo), extra: 'Calculado por valor ÷ consumo.' },
    { label: 'Meta de conta do mês', value: formatarMoeda(base.conta_ideal), extra: `${formatarNumero(base.meta_reducao, 1)}% de redução.` },
    { label: 'Consumo ideal do mês', value: `${formatarNumero(base.consumo_ideal, 2)} kWh`, extra: 'Consumo estimado compatível.' },
    { label: 'Aparelho em análise', 
      value: atual.temDadosValidos ? atual.nome : 'Nenhum preenchido', 
      extra: atual.temDadosValidos 
        ? `${formatarNumero(atual.consumoMensal, 2)} kWh • ${formatarMoeda(atual.custoMensal)}/mês` 
        : 'Selecione um modelo.' }
  ];

  els.simulacaoResultado.innerHTML = cards.map(c => `
    <div class="card"><span class="label">${c.label}</span><div class="value">${c.value}</div><small>${c.extra}</small></div>
  `).join('');

  if (!base.valor_conta_anterior || !base.consumo_conta_anterior) {
    els.simulacaoAlerta.innerHTML = `<div class="status atencao">Preencha os valores da sua conta anterior no quadro 1 para começar as estimativas.</div>`;
  } else if (base.meta_reducao > 30) {
    els.simulacaoAlerta.innerHTML = `<div class="status atencao">Meta alta: talvez seja melhor começar com uma redução menor.</div>`;
  } else {
    els.simulacaoAlerta.innerHTML = `<div class="status meta">Aparelhos estimados usando o custo efetivo do kWh da sua última conta.</div>`;
  }
}

function registrarAparelho(event) {
  event.preventDefault();

  const base = calcularIndicadoresPuros(lerConfigDaTela());
  
  if (!base.valor_conta_anterior || !base.consumo_conta_anterior) {
      return alert('Por favor, preencha os dados da conta anterior (Passo 1) antes de salvar aparelhos.');
  }

  salvarConfig(base); 
  const atual = atualizarCalculoRegistroAtual();

  if (!atual.nome) return alert('Informe o nome do aparelho.');
  if (!atual.temDadosValidos) return alert('Preencha um aparelho válido com valores maiores que zero.');

  const registros = carregarRegistros();
  
  const novoRegistro = {
    id: Date.now(), 
    ...atual
  };

  registros.push(novoRegistro);
  
  salvarRegistros(registros);

  limparCamposCadastro();
  renderSimulacao();
  atualizarPainel();
}

function atualizarPainel() {
  const base = calcularIndicadoresPuros(lerConfigDaTela());
  const mesSelecionado = els.filtroMes.value || mesAtualISO();
  els.filtroMes.value = mesSelecionado;

  const registros = carregarRegistros().filter((item) => item.mes === mesSelecionado);

  let consumo = 0, custo = 0, quantidade = 0;

  const registrosRender = registros.map((item) => {
    const custoAtual = item.consumoMensal * base.custo_kwh_efetivo;
    consumo += item.consumoMensal;
    custo += custoAtual;
    quantidade += item.quantidade;

    return { ...item, custoAtual };
  });

  registrosRender.sort((a, b) => b.custoAtual - a.custoAtual);
  
  const topViloes = registrosRender.slice(0, 3);
  const maiorCusto = topViloes[0] || null;

  const economiaVsContaAtual = Math.max(base.valor_conta_anterior - custo, 0);
  const diferencaParaMeta = custo - base.conta_ideal;
  
  const statusGeral = base.valor_conta_anterior > 0 
    ? obterStatusConsumo(custo, base.conta_ideal, base.valor_conta_anterior)
    : { classe: 'atencao', texto: 'Aguardando dados da conta' };

  const cards = [
    { label: 'Gasto estimado no mês', value: formatarMoeda(custo), extra: `Consumo: ${formatarNumero(consumo, 2)} kWh` },
    { label: 'Meta de conta', value: formatarMoeda(base.conta_ideal), extra: 'Valor a alcançar.' },
    { label: 'Aparelho que mais pesa', value: maiorCusto ? maiorCusto.nome : '—', extra: maiorCusto ? `${formatarMoeda(maiorCusto.custoAtual)}/mês` : 'Sem aparelhos.' },
    { label: 'Aparelhos cadastrados', value: `${registros.length} item(ns)`, extra: `Qtd total informada: ${quantidade}` },
    { label: 'Economia estimada', value: formatarMoeda(economiaVsContaAtual), extra: economiaVsContaAtual > 0 ? 'Abaixo da conta anterior.' : 'Sem redução ainda.' }
  ];

  els.painelMensal.innerHTML = cards.map(c => `<div class="card"><span class="label">${c.label}</span><div class="value">${c.value}</div><small>${c.extra}</small></div>`).join('');

  let htmlDicas = '';
  
  if (topViloes.length > 0) {
    const dicas = gerarDicasPersonalizadas(topViloes);
    
    htmlDicas = `
      <div class="note-box" style="margin-top: 15px; border-left: 4px solid #f39c12; background-color: #fffdf5;">
        <h4 style="margin: 0 0 8px 0; color: #b9770e;">Análise de Consumo Consciente (Seus maiores gastos)</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 0.9em; line-height: 1.5;">
          ${dicas.map(d => `<li style="margin-bottom: 8px;">${d}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  const mensagemResumo = !registros.length 
    ? 'Nenhum aparelho foi cadastrado neste mês.' 
    : diferencaParaMeta <= 0 
      ? 'A estimativa atual está dentro da meta.' 
      : `A estimativa atual está <strong>${formatarMoeda(diferencaParaMeta)} acima da meta</strong>.`;

  els.statusMes.innerHTML = `
    <div class="actions" style="margin-top: 14px;">
      <span class="status ${statusGeral.classe}">Status do mês: ${statusGeral.texto}</span>
    </div>
    <div class="note-box" style="margin-top: 12px;">
      ${mensagemResumo}
    </div>
    ${htmlDicas}
  `;

  renderTabelaRegistros(registrosRender);
}

function renderTabelaRegistros(registros) {
  if (!registros.length) {
    els.tabelaRegistros.innerHTML = '<p class="muted">Nenhum aparelho cadastrado para o mês selecionado.</p>';
    return;
  }

  els.tabelaRegistros.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Mês</th><th>Aparelho</th><th>Tipo</th><th>Base</th><th>Uso</th><th>Qtd.</th><th>Consumo</th><th>Custo</th><th>Obs.</th><th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${registros.map(item => `
          <tr>
            <td>${formatarMesReferencia(item.mes)}</td>
            <td>${item.nome}</td>
            <td>${tipoCalculoParaTexto(item.modo)}</td>
            <td>${item.modo === MODOS.FIXO ? `${formatarNumero(item.consumoBaseKwh, 2)} ${item.unidadeBase}` : `${formatarNumero(item.potencia, 0)} W`}</td>
            <td>${item.modo === MODOS.FIXO ? '-' : `${formatarNumero(item.horasDia, 1)} h/dia × ${item.diasUso} dias`}</td>
            <td>${item.quantidade}</td>
            <td>${formatarNumero(item.consumoMensal, 2)} kWh</td>
            <td>${formatarMoeda(item.custoAtual)}</td>
            <td>${item.observacoes || '-'}</td>
            <td><button type="button" class="btn-row-delete btn-danger" data-id="${item.id}">Excluir</button></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ==========================================
// 7. AÇÕES E EVENTOS EXTERNOS
// ==========================================
function exportarCSV() {
  const base = calcularIndicadoresPuros(lerConfigDaTela());
  const mesSelecionado = els.filtroMes.value || mesAtualISO();
  const registros = carregarRegistros().filter((item) => item.mes === mesSelecionado);

  if (!registros.length) return alert('Não há registros para exportar no mês selecionado.');

  const cabecalho = ['MesReferencia', 'Aparelho', 'Modo', 'PotenciaW', 'HorasPorDia', 'DiasUsoMes', 'ConsumoBaseKwh', 'UnidadeBase', 'Quantidade', 'ConsumoMensalKwh', 'CustoMensalTarifaAtual', 'Observacoes'];
  
  const linhas = registros.map(item => [
    item.mes, item.nome, item.modo, item.potencia || '', item.horasDia || '', item.diasUso || '',
    item.consumoBaseKwh || '', item.unidadeBase || '', item.quantidade, item.consumoMensal,
    item.consumoMensal * base.custo_kwh_efetivo,
    escaparCSV(item.observacoes)
  ]);

  const csv = [cabecalho, ...linhas].map(linha => linha.join(';')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = `relatorio_energia_${mesSelecionado}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function limparConfig() {
  localStorage.removeItem(STORAGE_CONFIG);
  preencherConfigNaTela(CONFIG_PADRAO); 
  renderSimulacao();
  atualizarPainel();
}

function limparRegistros() {
  if (!confirm('Deseja apagar todos os registros salvos? Essa ação não pode ser desfeita.')) return;
  localStorage.removeItem(STORAGE_REGISTROS);
  renderSimulacao();
  atualizarPainel();
}

function excluirRegistro(id) {
  if (!confirm('Deseja excluir este cadastro?')) return;
  const registros = carregarRegistros().filter((item) => Number(item.id) !== Number(id));
  salvarRegistros(registros);
  renderSimulacao();
  atualizarPainel();
}

// ==========================================
// 8. INICIALIZAÇÃO
// ==========================================
function inicializar() {
  popularAparelhos();
  preencherConfigNaTela(carregarConfig());
  
  els.registroMes.value = mesAtualISO();
  els.filtroMes.value = mesAtualISO();
  limparCamposCadastro();

  renderSimulacao();
  atualizarPainel();

  els.tabelaRegistros.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-row-delete')) {
      excluirRegistro(e.target.dataset.id);
    }
  });

  els.formSimulacao.addEventListener('input', () => {
    atualizarCamposDerivados();
    renderSimulacao();
    atualizarPainel();
  });

  els.formSimulacao.addEventListener('submit', (e) => {
    e.preventDefault();
    salvarConfig(lerConfigDaTela());
  });

  els.registroAparelhoPadrao.addEventListener('change', aplicarPadraoAparelho);

  ['input', 'change'].forEach(evento => {
    els.formRegistro.addEventListener(evento, (e) => {
      if (e.target !== els.registroObs) renderSimulacao();
    });
  });

  els.filtroMes.addEventListener('change', atualizarPainel);
  els.formRegistro.addEventListener('submit', registrarAparelho);
  els.btnExportarCsv.addEventListener('click', exportarCSV);
  els.btnLimparConfig.addEventListener('click', limparConfig);
  els.btnLimparRegistros.addEventListener('click', limparRegistros);
}

inicializar(); 