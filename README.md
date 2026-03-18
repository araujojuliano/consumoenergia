# ⚡ Calculadora de Consumo de Energia

Sistema web interativo e inteligente para estimar o consumo e o custo mensal de aparelhos domésticos com base na **última conta de energia** do usuário. 

O projeto foi desenvolvido com foco em uso simples, visual direto e funcionamento 100% local no navegador, servindo não apenas como uma calculadora, mas como uma ferramenta de educação financeira e consumo consciente.

---

## 🎯 Objetivo

A proposta do sistema é ajudar o usuário a:
- Entender na prática quanto cada aparelho representa financeiramente na sua conta de luz.
- Estimar o gasto mensal da residência de forma realista.
- Identificar rapidamente os "vilões" do consumo.
- Receber orientações personalizadas para reduzir o desperdício.
- Registrar e acompanhar o histórico de aparelhos mês a mês, comparando com uma meta de economia.

---

## ⚙️ Como o sistema funciona

O grande diferencial desta calculadora é que ela não usa uma tarifa genérica. O cálculo do valor do kWh é feito a partir da **última conta de energia informada pelo usuário**:

> **Custo efetivo do kWh = Valor total da última conta ÷ Consumo da última conta em kWh**

Dessa forma, o sistema utiliza um valor real, considerando impostos e bandeiras tarifárias efetivamente cobradas. A partir daí, os aparelhos cadastrados são calculados de duas formas:

### 1. Aparelhos com uso controlado pelo usuário
Calculados com base na potência do equipamento e no hábito do usuário.
- **Variáveis:** Potência (W), Horas de uso por dia, Dias de uso no mês e Quantidade.
- **Exemplos:** Lâmpadas, Ventilador, Televisão, Ar-condicionado, Chuveiro, Micro-ondas, Air Fryer, Notebook e Ferro de passar.

### 2. Aparelhos com consumo mensal fixo
Calculados com base na eficiência energética de fábrica, já que operam em ciclos contínuos ou predefinidos.
- **Variáveis:** Consumo médio padrão (kWh/mês) e Quantidade.
- **Exemplos:** Geladeiras (diversos modelos), Máquina de lavar, Tanquinho e Lava e seca.

---

## ✨ Funcionalidades

- **Cálculo Dinâmico:** Geração automática do custo efetivo do kWh.
- **Gestão de Metas:** Definição de meta de redução (%) com cálculo imediato da economia-alvo e conta ideal.
- **Cadastro Inteligente:** Formulário adaptativo que oculta ou exibe campos dependendo do tipo de aparelho (Uso Controlado vs. Fixo).
- **Painel Mensal Completo:**
  - Gasto financeiro estimado do mês.
  - Consumo total estimado (kWh).
  - Identificação imediata do aparelho que mais pesa na conta.
  - Status em tempo real (Meta atingida, Dentro da média, Consumo crítico).
- **💡 Motor de Dicas Inteligentes:** O sistema analisa a lista cadastrada, isola os **3 maiores impactos na conta** e gera conselhos de economia cirúrgicos para aqueles aparelhos específicos.
- **Exportação e Gestão de Dados:**
  - Download de relatórios em formato `.csv` para planilhas.
  - Armazenamento 100% local utilizando a API do `localStorage`.
  - Exclusão individual de registros ou limpeza total.

---

## 💻 Tecnologias utilizadas

Projeto construído sem dependências de frameworks externos, focado em manipulação avançada de DOM e regras de negócio no Client-Side:
- **HTML5** (Semântica e Acessibilidade)
- **CSS3** (Responsividade e UI/UX)
- **JavaScript (Vanilla JS - ES6+)** (Lógica, Cálculos e Storage)

---

## 📂 Estrutura do projeto

```bash
.
├── index.html     # Estrutura da interface e formulários
├── style.css      # Estilização visual e classes de estado (ex: .escondido)
└── script.js      # Lógica de cálculo, manipulação do DOM e Motor de Dicas
