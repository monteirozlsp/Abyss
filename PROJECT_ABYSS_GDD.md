# PROJECT ABYSS (PROJETO ABISSO)
## DOCUMENTO DE DESIGN DE JOGO (GDD) — ETAPA 1: CONCEITO, NARRATIVA E ATMOSFERA
**Classificação Interna:** Altamente Confidencial (AAA Horror Division)
**Plataforma de Alvo:** WebGL (Browser-focused high-end rendering)
**Referências de Atmosfera:** *Outlast*, *SOMA*, *Alien: Isolation*, *The Mortuary Assistant*, *Resident Evil VII*

---

## 1. VISÃO GERAL E FILOSOFIA DE DESIGN

`PROJECT ABYSS` é um thriller psicológico de horror e sobrevivência em primeira pessoa de alta fidelidade desenvolvido especificamente para navegadores usando WebGL de última geração. O jogo rejeita o combate tradicional em prol de uma imersão física extrema, vulnerabilidade mecânica e terror cognitivo. 

### Pilares de Design:
*   **Vulnerabilidade Física Absoluta:** Sem armas, sem contra-ataques. Cada confronto com as anomalias do complexo é uma escolha binária entre fuga ágil, ocultamento estratégico ou morte inevitável.
*   **Terror Neurossensorial (Feedback Fisiológico):** O corpo do protagonista reage dinamicamente ao medo. A visão distorce por meio de aberração cromática sob pânico, a respiração afeta a detecção dos inimigos e os batimentos cardíacos são transmitidos diretamente no feedback visual e auditivo.
*   **Investigação Tátil:** A interação com o mundo é física. Portas devem ser puxadas ou empurradas gradualmente (controle de velocidade), gavetas são abertas manualmente e equipamentos requerem calibração ativa.
*   **Fidelidade WebGL AAA:** Utilização de iluminação volumétrica avançada, reflexos em tempo real, pós-processamento pesado (grain, vignette, screen-space ambient occlusion) e áudio posicional 3D dinâmico para romper as barreiras de fidelidade visual associadas a jogos de navegador.

---

## 2. LORE COMPLETA E HISTÓRICO DO INCIDENTE

### O Complexo Mount Kestrel (Estação Subterrânea Sete - ES7)
Escondido sob as geleiras eternas da Cordilheira de Kestrel, o complexo é uma monstruosidade brutalista de concreto e aço construída na década de 1970 pela corporação fantasma **Aetheris Neurological Group**. Oficialmente, a instalação pesquisava reabilitação de traumas severos e otimização cognitiva para atletas e astronautas. Extraoficialmente, era o berço do **Projeto Chasm** (Abismo).

### O Projeto Chasm (A Ciência do Medo e da Consciência)
Sob a liderança do Dr. Alistair Thorne, os cientistas descobriram que o cérebro humano, quando submetido a estados limiares de pânico induzido quimicamente e estimulação eletromagnética de alta frequência, emite um padrão de ondas neurais apelidado de **"Assinatura do Abismo" (Abyss Signature)**. 

Essa frequência não era apenas um subproduto biológico; ela atuava como uma ponte de ressonância. Os pesquisadores acidentalmente romperam a barreira da consciência coletiva humana, acessando uma dimensão não física composta pelo subconsciente primordial da espécie — um mar de traumas arquétipos, medo ancestral e sofrimento acumulado ao longo de milênios. Eles chamaram essa força senciente de **O Eco Sub-Límico**.

### O Incidente de Ruptura (The Sundering)
Em 14 de Novembro de 2025, durante um experimento de sincronização neural em massa envolvendo trinta cobaias humanas conectadas à máquina "Synapse-Grid", a frequência atingiu o ponto de saturação. O Eco Sub-Límico não apenas fluiu para dentro dos cérebros dos indivíduos; ele se manifestou fisicamente no complexo por meio de distorções espaciais e necrosamento celular acelerado do tecido neural dos cientistas. 

Os pacientes libertaram-se, transformados em cascas vazias e violentas movidas por pesadelos encarnados. A corporação Aetheris selou os níveis inferiores da ES7 por fora, deixando cientistas, guardas e cobaias para morrerem no escuro gelado.

---

## 3. CRONOLOGIA (TIMELINE)

*   **1982:** Fundação da Estação Subterrânea Sete (ES7) sob a fachada de um centro de pesquisa geofísica. Primeiros túneis são escavados na rocha vulcânica sob Mount Kestrel.
*   **1998:** Dr. Alistair Thorne assume o controle científico da Aetheris. O foco muda inteiramente para neurologia quântica e "Mapeamento Trans-Consciente".
*   **2012:** Descoberta da "Frequência Abissal". O governo retira o financiamento público devido a preocupações éticas; a Aetheris continua as operações clandestinamente com fundos privados obscuros.
*   **Janeiro de 2024:** Início dos testes com a máquina **Synapse-Grid**. Cobaias humanas (denominadas "Doadores") são adquiridas de asilos públicos e prisões estrangeiras por vias ilegais.
*   **Agosto de 2024:** Relatórios internos de segurança começam a detalhar "alucinações compartilhadas de arquitetura impossível" e o aparecimento de manchas pretas viscosas que evaporam ao toque nas paredes do Setor de Isolamento.
*   **14 de Novembro de 2025 (03:14 AM):** **O Incidente Synapse**. A sincronização neural atinge 100%. Falha catastrófica de contenção energética. O sistema elétrico principal colapsa. O protocolo de quarentena de nível V é ativado automaticamente, prendendo 142 funcionários lá dentro.
*   **Janeiro de 2026:** Sinais de rádio codificados começam a escapar das montanhas de Kestrel. Mensagens distorcidas implorando por socorro misturam-se com leituras biométricas impossíveis.
*   **26 de Junho de 2026 (Presente):** O investigador freelance Thomas Cole invade o perímetro externo da ES7 através de um duto de ventilação secundário danificado por avalanches.

---

## 4. O PROTAGONISTA: THOMAS COLE

*   **Ocupação:** Ex-analista de inteligência militar britânica e atual investigador de desaparecimentos corporativos.
*   **Motivação:** Thomas não está ali por heroísmo. Sua irmã mais nova, Dra. Elena Cole, era uma das neurocientistas seniores enviadas para Mount Kestrel que desapareceram após a quarentena. Ele tem em mãos o último email codificado enviado por ela antes do silêncio de rádio.
*   **Condição Psicológica (O Mecanismo de Sanidade):**
    *   Thomas sofre de transtorno de estresse pós-traumático (TEPT) leve e dependência de bloqueadores de beta-receptores (medicamentos que ele precisa gerenciar durante o jogo).
    *   Seu batimento cardíaco é monitorado pelo relógio biométrico militar em seu pulso esquerdo. Quando o estresse aumenta, suas mãos tremem (dificultando a resolução de puzzles e uso de chaves) e sua respiração se torna barulhenta, alertando os inimigos.
*   **Atributos de Jogabilidade:**
    *   **Passos Furtivos:** Pode se mover agachado para minimizar o som de seus passos sobre superfícies barulhentas (metal enferrujado, poças d'água, vidro quebrado).
    *   **Fôlego Limitado:** Thomas pode correr intensamente por curtos períodos. Se exaurido, ele entra em um estado de exaustão, forçando uma desaceleração dramática e respiração ofegante e incontrolável por 10 segundos.

---

## 5. FACÇÕES DO ABISSO

Embora o complexo pareça um covil de monstros caóticos, a ruína de Mount Kestrel é dividida por correntes ideológicas e de sobrevivência extremas formadas entre os sobreviventes enlouquecidos:

### A. Os Transcendidos (The Synced)
Cientistas e cobaias que aceitaram a invasão da frequência cerebral do Abismo. Eles acreditam que a dor física e a perda da individualidade são o próximo passo da evolução da consciência humana.
*   **Comportamento:** Não atacam o jogador à primeira vista, a menos que ele perturbe seus rituais ou tente desligar os geradores de frequência. Eles murmuram equações matemáticas e relatórios médicos incompreensíveis enquanto mutilam a si mesmos.
*   **Objetivo:** Manter a Synapse-Grid ativa e proteger a anomalia central a todo custo.

### B. Os Esquecidos (The Stranded)
Sobreviventes da equipe de segurança e engenharia que conseguiram evitar a infecção neural direta, mas sucumbiram à paranoia absoluta e ao isolamento.
*   **Comportamento:** Extremamente hostis. Eles usam máscaras de gás modificadas e armaduras de contenção improvisadas. Eles consideram Thomas um "vetor de infecção externa" e tentarão eliminá-lo para evitar que a quarentena seja violada.
*   **Objetivo:** Purgar tudo o que se move usando fogo químico e armas brancas industriais improvisadas.

---

## 6. CRIATURAS (ANOMALIAS COGNITIVAS)

As ameaças em `PROJECT ABYSS` não são monstros biológicos tradicionais, mas manifestações físicas de distúrbios neurológicos graves catalisados pela frequência do Abismo, fundidos com restos de tecidos humanos e tecnologia médica.

```
                  +-----------------------------------+
                  |      O ECO SUB-LÍMICO (Senciente) |
                  +-----------------+-----------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
+-----------v-----------+                       +-----------v-----------+
|   O CIRURGIÃO CEGO    |                       |       O COLETOR       |
| (Neurose de Controle) |                       | (Depravação Sensorial)|
|                       |                       |                       |
| - Cegueira completa   |                       | - Persegue pelo som   |
| - Ecolocalização      |                       | - Rasteja por dutos   |
| - Agulhas hidráulicas |                       | - Pânico visual       |
+-----------------------+                       +-----------------------+
```

### 1. O Cirurgião Cego (The Blind Surgeon / Dr. Alistair Thorne)
O outrora brilhante Dr. Thorne fundiu-se parcialmente com os braços robóticos cirúrgicos de sua cadeira experimental de neurocirurgia. Suas órbitas oculares foram cauterizadas pelo calor gerado na queima dos módulos neurais.
*   **Aparência:** Um torso humano suspenso por três pernas mecânicas hidráulicas de titânio que rangem e batem contra o chão metálico. Ele possui cabos de fibra ótica enfiados diretamente em seu crânio exposto.
*   **Mecânica de IA:** Totalmente cego. Ele navega exclusivamente por ecolocalização (emitindo cliques sônicos agudos de sua garganta que reverberam no cenário) e pelo som dos passos do jogador. Se o jogador congelar atrás de uma cobertura ou prender a respiração (pressionando um botão específico de mecânica de pulmão), o Cirurgião passará direto, tocando as superfícies de forma ameaçadora com suas pinças metálicas.

### 2. O Coletor de Olhares (The Gaze Collector / Anomalia de Sincronia)
Uma amálgama flutuante de cabeças humanas coladas umas às outras por uma substância preta viscosa, suspensas por feixes de nervos expostos que agem como tentáculos.
*   **Aparência:** Uma massa grotesca que flutua silenciosamente a poucos centímetros do chão, envolta em uma névoa estática eletromagnética que distorce as luzes ao seu redor.
*   **Mecânica de IA:** Ele não caça pelo som. Ele caça pela *visão*. Se a luz da lanterna do jogador tocar o Coletor de Olhares, ele detecta Thomas instantaneamente e inicia uma investida psíquica que drena a sanidade e estressa o coração do protagonista. O jogador deve navegar por áreas patrulhadas pelo Coletor usando apenas a iluminação fraca do ambiente ou visão termográfica de curta duração de sua câmera de investigação.

### 3. O Phantom de Kestrel (The Phantasm)
Uma alucinação semi-física invisível que só pode ser detectada pela estática do rádio ou pela distorção visual na lente da câmera do jogador.
*   **Mecânica de IA:** Ele assombra o jogador de forma intermitente, sussurrando segredos familiares e mentiras psicológicas no canal de áudio binaural do jogador. Se o jogador olhar diretamente para ele através da lente da câmera por muito tempo, sua barra de estresse explode, levando-o a um estado de desmaio temporário ou induzindo ataques cardíacos fatais.

---

## 7. NPCs (PERSONAGENS NÃO JOGÁVEIS)

### Dra. Elena Cole (O Espectro no Sistema)
A irmã de Thomas. Ela não está fisicamente acessível no início do jogo, mas ela hackeou o sistema de intercomunicação da instalação. Sua voz distorcida guia Thomas pelos alto-falantes e monitores de segurança degradados do complexo. Ao longo da narrativa, Thomas começa a duvidar se as transmissões de Elena são reais ou apenas uma ilusão criada pelo Abismo para atraí-lo para o núcleo da máquina.

### Paciente Zero (O Profeta do Concreto)
Um ex-paciente psiquiátrico cego de 70 anos chamado Gabriel, que foi o primeiro dador da Synapse-Grid. Ele sobreviveu ao incidente sem se tornar agressivo. Ele vive nas sombras das tubulações de esgoto sob o laboratório químico.
*   **Função:** Ele serve como o oráculo sinistro do jogo. Se Thomas lhe trouxer frascos de sedativos e remédios de controle de estresse encontrados pelo complexo, Gabriel revelará códigos de portas secretas e insights detalhados sobre as fraquezas das criaturas.

---

## 8. DOCUMENTOS COLETÁVEIS (REVELAÇÕES DA LORE)

Os documentos em `PROJECT ABYSS` são fragmentos de dor e ciência que o jogador descobre nas mesas frias e terminais decadentes do complexo:

### Registro Escrito: Memorando de Quarentena (Setor C)
> **De:** Direção Geral de Segurança da Aetheris Group
> **Para:** Todo o pessoal médico e científico (Níveis 1 a 4)
> **Assunto:** Ativação do Protocolo de Quarentena "Gelo Negro"
>
> *Este memorando serve como notificação oficial de que o perímetro externo da Estação Sete foi selado hidraulicamente. As cargas de demolição das rotas de fuga primárias foram detonadas para evitar a propagação do patógeno psíquico e das frequências de ressonância eletromagnética aberrantes além do Mount Kestrel.*
>
> *Nenhum pedido de evacuação será processado. Não tentem se aproximar das saídas hidráulicas. Conservem seus kits de oxigênio e rações. O sacrifício de vocês pela integridade científica é altamente valorizado pela corporação.*

### Registro de Áudio Traduzido (Módulo Transcrito 09)
> *(Som de estática pesada, seguido por batidas mecânicas rítmicas e respiração pesada)*
>
> **Dr. Thorne (Voz trêmula e extasiada):** "...não estamos mais sozinhos no escuro do lobo frontal. A frequência... ela é linda. Ela não cria monstros; ela apenas remove a pele da hipocrisia biológica. Eu vi as paredes respirarem, e elas respiram o mesmo ar que minha irmã falecida respirou em 1994. Não é uma infecção. É uma fusão. Se você estiver ouvindo isso no exterior... não venha nos salvar. Venha se juntar a nós. O Abismo é acolhedor..."
>
> *(Sons de carne sendo rasgada seguidos por uma risada estridente mecânica e o rangido de pistões hidráulicos)*

---

## 9. MISSÕES (ESTRUTURA DE GAMEPLAY)

```
+-------------------------------------------------------------+
|                     FLUXO DE MISSÕES                        |
+-------------------------------------------------------------+
|                                                             |
|  [ETAPA 1: Infiltração] -> Entrada pelos Dutos Frios        |
|                                |                            |
|  [ETAPA 2: Investigação] -> Reativação dos Sistemas         |
|                                |                            |
|  [ETAPA 3: Acomodação] -> Encontro com o Cirurgião Cego     |
|                                |                            |
|  [ETAPA 4: Escolha] -> Conectar ao Synapse-Grid ou Destruir |
|                                                             |
+-------------------------------------------------------------+
```

### Missões Principais (Main Path)

1.  **O Descenso Silencioso:** Infiltrar-se nos níveis superiores do complexo através do duto de ventilação secundário congelado e restaurar a energia de emergência da guarita de segurança para destravar as portas principais de acesso aos laboratórios.
2.  **O Sussurro no Monitor:** Seguir as pistas de vídeo e áudio supostamente deixadas pela irmã Elena Cole através do Setor Clínico, evitando o primeiro encontro direto com o *Cirurgião Cego* usando dutos de serviço estreitos.
3.  **Purificação de Resíduos:** Descer ao Setor Industrial Inferior para desviar o fluxo de gás tóxico inflamável que bloqueia o laboratório de biometria neural. O jogador deve encontrar válvulas de alívio de pressão enquanto é caçado pelo *Coletor de Olhares*.
4.  **O Coração da Máquina:** Invadir o Laboratório de Sincronização Synapse-Grid, coletar os três núcleos de memória neural de Elena Cole e decidir o destino da instalação nas profundezas da Terra.

### Missões Secundárias (Optional Content)

*   **O Testamento de Gabriel:** Localizar os registros de áudio pessoais do Paciente Zero escondidos no setor psiquiátrico abandonado para desbloquear uma área de armazenamento que contém um detector de frequência aprimorado.
*   **A Autópsia da Razão:** Investigar o necrotério clandestino nos níveis inferiores e realizar uma autópsia manual em um espécime infectado usando instruções de áudio degradadas para descobrir a frequência de rádio necessária para destravar uma sala de segurança militar lacrada (que abriga o final alternativo "Redenção").

---

## 10. EVENTOS RAROS E ALUCINAÇÕES (SISTEMA DE TENSÃO DINÂMICA)

Para simular o desgaste psicológico e a manipulação neural da frequência abissal no cérebro do jogador, o jogo possui um sistema de **Eventos Liminares de Pânico**. Eles ocorrem aleatoriamente ou são acionados pelo alto nível de estresse do protagonista:

### Exemplos de Alucinações Dinâmicas:
1.  **O Corredor Infinito:** Ao cruzar um longo corredor escuro, o jogador olha para trás e percebe que a porta pela qual acabou de passar desapareceu, sendo substituída por um abismo geométrico que se estende ao infinito. Se ele continuar andando sem olhar para trás por 10 segundos, o corredor volta ao normal com um baque sonoro violento de metal batendo.
2.  **A Cópia de Elena:** Uma silhueta idêntica à de Elena caminha calmamente pelo canto de um corredor de vidro. Ao segui-la, o jogador descobre que ela entra em uma sala sem saída. Ao abrir a porta da sala, ela está completamente vazia, exceto por um espelho que exibe o reflexo de Thomas deformado e sangrando pelos olhos por breves instantes.
3.  **Inundação de Sangue Falso:** Os tubos de resfriamento nas paredes começam a verter um líquido preto e viscoso que sobe rapidamente pelos tornozelos do jogador, distorcendo seus movimentos. Se o jogador tomar um sedativo ou fechar os olhos por 5 segundos através de uma tecla de ação tátil, ele percebe que os canos estavam perfeitamente secos.

---

## 11. SEGREDOS E COLECIONÁVEIS

*   **Disquetes de Frequência Antiga:** Disquetes de 3,5 polegadas contendo trechos criptografados do código-fonte da Synapse-Grid. Se inseridos nos computadores antigos funcionais espalhados pelo jogo, eles revelam easter eggs de desenvolvimento e logs secretos sobre a origem do Dr. Thorne.
*   **Objetos Pessoais das Vítimas:** Canetas gravadas, fotos de família rasgadas, relógios parados exatamente às 03:14 AM. Coletar estes itens restaura permanentemente uma pequena porção da sanidade máxima de Thomas e adiciona comentários de áudio melancólicos de sua própria mente, aprofundando sua história pessoal.
*   **O Cofre Cósmico:** Uma sala oculta atrás de uma parede de concreto falsa no Setor de Arquivos. Ela contém uma pintura gigante de uma montanha flutuante e um rádio de ondas curtas tocando uma melodia de ninar russa melancólica. É uma referência direta à lore profunda da Aetheris Group e a um futuro jogo da franquia.

---

## 12. FINAIS ALTERNATIVOS

A história possui três conclusões dramáticas distintas que dependem exclusivamente de quão profundamente o jogador investigou as ruínas, de sua integridade física (uso de sedativos) e das decisões morais tomadas no Laboratório Synapse-Grid.

```
                              +---------------------------------------+
                              |         O NÚCLEO DA SYNAPSE           |
                              +-------------------+-------------------+
                                                  |
                    +-----------------------------+-----------------------------+
                    |                                                           |
+-------------------v-------------------+                       +---------------+-----------------------+
|    Destruir a Máquina / Sobreviver    |                       |     Sincronizar à Frequência          |
+-------------------+-------------------+                       +---------------+-----------------------+
                    |                                                           |
         +----------+----------+                                                |
         |                     |                                                |
+--------v--------+  +---------v--------+                                       |
|  "A QUARENTENA"  |  "O RETORNO"       |                               +--------v--------+
| (Estresse Alto) | (Evidências 100%)  |                               | "ASCENSÃO ABISSAL"|
|                 |                    |                               | (Escolha de Thorne)|
+-----------------+  +------------------+                               +-----------------+
```

### Final A: "A Quarentena" (Final Padrão / Sobrevivência Trágica)
*   **Condições:** O jogador escolhe destruir a máquina Synapse-Grid removendo à força os fios de processamento biológico. O estresse acumulado durante a jornada foi alto e pouca evidência científica foi coletada.
*   **Resultado:** Thomas explode o gerador central, colapsando as estruturas de Mount Kestrel. Ele consegue escapar pelos túneis de gelo arrastando-se para o exterior gelado no meio de uma nevasca. Ao amanhecer, ele percebe que o rádio de seu relógio biométrico ainda emite a voz de Elena, implorando para que ele volte para salvá-la de dentro de sua própria mente. Ele percebe que a frequência o acompanhou para fora e que ele agora é o portador do Abismo para a civilização.

### Final B: "O Retorno" (Final Bom / Redenção Científica)
*   **Condições:** O jogador coletou todos os 12 documentos confidenciais, encontrou os registros médicos de Elena e terminou o jogo com níveis baixos de estresse (uso estratégico de sedativos e gerenciamento de pânico).
*   **Resultado:** Com as evidências corretas em mãos, Thomas não apenas desliga o reator de frequência, mas inicia um protocolo de purga eletromagnética direcionada (EMP), desintegrando a ressonância do Eco Sub-Límico e libertando as mentes presas (incluindo o espectro de sua irmã). Ele escapa do complexo de helicóptero militar de resgate enviado após as evidências serem enviadas automaticamente via satélite. Thomas chora no helicóptero olhando para o nascer do sol sobre as montanhas de Kestrel, finalmente encontrando a paz para sua alma atormentada.

### Final C: "Ascensão Abissal" (Final Ruim / Fusão Mental)
*   **Condições:** O jogador decide não destruir a máquina, mas se conectar à cadeira experimental central na esperança de se fundir mentalmente com o Eco de Elena e entender o mistério por completo.
*   **Resultado:** A consciência de Thomas é completamente fragmentada e devorada pelo mar cósmico de dor do Eco Sub-Límico. Sua forma física morre, transformando-se em uma casca biológica imóvel no centro da máquina. No entanto, sua consciência agora se torna o novo arquétipo dominante do Abismo. A tela escurece e o jogo termina com a voz fria e calma de Thomas assumindo o papel de narrador do pesadelo, convidando o próximo investigador a descer ao complexo.

---

## 13. CONQUISTAS (ACHIEVEMENTS)

*   **"Não Olhe para Trás"** — Conclua a sequência de perseguição do Setor Clínico sem olhar para o *Cirurgião Cego* uma única vez.
*   **"Química Controlada"** — Termine o jogo usando menos de 3 sedativos no total.
*   **"Silêncio Absoluto"** — Segure a respiração com sucesso por mais de 45 segundos cumulativos ao se esconder de anomalias cognitivas.
*   **"Verdades Enterradas"** — Encontre e leia todos os 12 documentos corporativos confidenciais da Aetheris Group.
*   **"O Último Abraço de Elena"** — Assista ao final bom "O Retorno".
*   **"03:14"** — Encontre o relógio de bolso quebrado nas profundezas dos arquivos exatamente quando o relógio do mundo real marcar 03:14 da manhã (ou simulado na mecânica do sistema).

---

## 14. ROADMAP NARRATIVO & PRÓXIMOS PASSOS

Este documento serve como a fundação narrativa estrutural absoluta de `PROJECT ABYSS`. 

Para a **Etapa 2 (Implementação Prática)**, a arquitetura WebGL do jogo será construída sobre uma base modular em React/TypeScript, utilizando as melhores práticas de gerenciamento de estado assíncrono para garantir taxas de quadros fluidas diretamente no navegador sem comprometer os efeitos visuais de alta densidade necessários para a atmosfera de horror psicológico AAA.

---
*Fim do Documento de Conceito Narrativo — Autorizado para distribuição interna na Divisão AAA Horror.*
