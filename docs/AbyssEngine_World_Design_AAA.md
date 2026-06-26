# PROJECT ABYSS — WORLD DESIGN FRAMEWORK (v2.4.0)
**Manual de Referência de Level Design, Atmosfera e Narrativa Ambiental AAA**  
**Autores:** Lead Narrative Designer & Principal Level Designer  
**Status:** Especificação Aprovada para os Setores de Produção Visual e Scripting

---

## 1 — ARQUITETURA DE REGIÕES E BIOMAS (WORLD DIVISION)

O mundo do Project Abyss é estruturado em zonas de horror interconectadas de forma não-linear, misturando arquiteturas industriais brutalistas, laboratórios esterilizados e decadência orgânica visceral. Cada região possui regras exclusivas de colisão, iluminação, e comportamento da IA.

```
                  +-----------------------------------+
                  |      ÁREA ADMINISTRATIVA (Hub)     |
                  +-----------------------------------+
                                    |
            +-----------------------+-----------------------+
            |                                               |
  +-------------------+                           +-------------------+
  |     HOSPITAL      |                           | SETOR INDUSTRIAL  |
  | (Psiquiatria/Nec) |                           | (Usina/Dormitório)|
  +-------------------+                           +-------------------+
            |                                               |
  +-------------------+                           +-------------------+
  | PRISÃO / BUNKER   |                           | MINA / SUBSOLO    |
  |  (Capela/Secretas)|                           | (Laboratório/Flo) |
  +-------------------+                           +-------------------+
```

### 1.1 Catálogo de Regiões de Exploração
1. **Hospital & Psiquiatria**:
   * *Estética Visual*: Paredes de azulejos verdes descascados, macas enferrujadas, iluminação fluorescente piscando intermitentemente e poças de fluidos químicos secos.
   * *Dinâmica de Jogo*: Corredores estreitos propícios para confrontos em curvas cegas. Alta densidade de esconderijos (armários e cortinas médicas).
2. **Necrotério**:
   * *Estética Visual*: Gavetas frias de aço inoxidável, mesas de autópsia com canais de drenagem de sangue entupidos e névoa fraca vinda de sistemas de refrigeração avariados.
   * *Dinâmica de Jogo*: Espaço silencioso com grande foco em puzzles de identificação biológica e pistas em etiquetas de corpos.
3. **Laboratório & Usina**:
   * *Estética Visual*: Tubulações de gás pressurizado, computadores CRT emitindo ruídos de alta frequência, salas estéreis seladas por comportas hidráulicas industriais.
   * *Dinâmica de Jogo*: Áreas perigosas com vazamentos químicos ativos que bloqueiam caminhos e exigem quebra-cabeças de pressão de válvulas.
4. **Prisão & Bunker**:
   * *Estética Visual*: Grades de ferro maciço corrompidas por ferrugem profunda, celas estreitas com colchões mofados e concreto armado brutalista reforçado.
   * *Dinâmica de Jogo*: Labirintos com rotas alternativas curtas via túneis de ventilação suspensos. Presença de armadilhas mecânicas esquecidas no solo.
5. **Capela**:
   * *Estética Visual*: Vitrais góticos fragmentados projetando luz azul-cobalto e carmim nas naves centrais, bancos de carvalho antigo destruídos e velas derretidas em pilhas deformadas.
   * *Dinâmica de Jogo*: Espaço de silêncio e puzzles simbólicos. A reverberação acústica nesta área é ampliada em 150%, tornando ruídos de passos altamente perigosos.
6. **Subsolo, Mina & Floresta Negra**:
   * *Estética Visual*: Túneis escavados em rocha viva sustentados por escoras de madeira estalando sob a pressão geológica, poços verticais inundados e raízes negras de árvores retorcidas invadindo o solo.
   * *Dinâmica de Jogo*: Exploração com limites extremos de visibilidade. Exige gerenciamento de bateria e navegação tridimensional complexa sem o auxílio de mapas impressos simples.
7. **Setor Industrial, Área Administrativa & Dormitórios**:
   * *Estética Visual*: Escritórios burocráticos bagunçados cobertos por papéis arquivados em 1980, salas de descanso com beliches vazios e quadros elétricos estourados.
   * *Dinâmica de Jogo*: Atua como o "Hub" semi-seguro de transição entre os grandes mapas do Abismo. Possui menor densidade de spawn de monstros no início do jogo.

---

## 2 — CATEGORIZAÇÃO E METODOLOGIA DE LEVEL DESIGN (ZONING)

A AbyssEngine organiza o espaço tridimensional em zonas lógicas delimitadas por volumes invisíveis que ditam as ações e regras que a engine impõe ao jogador e às IAs.

```
       +-------------------------------------------------------------+
       |                        LEVEL DESIGN ZONE                    |
       +-------------------------------------------------------------+
       |   [Safe Zone]   -> Iluminação quente, sem spawn, sem pavor   |
       |   [Unsafe Zone] -> Patrulhas de IA ativas, escuridão        |
       |   [Panic Zone]  -> Perseguições programadas, som agressivo  |
       |   [Event Zone]  -> Alucinações, portas travando, blackout   |
       +-------------------------------------------------------------+
```

### 2.1 Zoneamento de Tensão
* **Safe Zones (Zonas de Respiro)**:
  * Espaços delimitados por luz amarela/quente estável (ex: salas de gravação, geradores principais funcionando).
  * A IA do monstro é proibida de spawnar nestas áreas de forma direta. A velocidade de recuperação de sanidade e stress do jogador é acelerada em 300%.
* **Unsafe Zones (Zonas de Tensão Ativa)**:
  * Todo o território padrão de exploração do jogo.
  * O **Horror Director** tem total liberdade para orquestrar patrulhas, spawns preditivos nas sombras e barulhos sutis na tubulação.
* **Panic Zones (Zonas de Choque / Perseguição)**:
  * Áreas críticas sem esconderijos viáveis, geralmente com gargalos estruturais e saídas obstruídas por escombros físicos.
  * Projetadas especificamente para testar o tempo de reação e agilidade do jogador em escapar de perseguições frenéticas usando rotas alternativas em alta velocidade.
* **Event Zones (Zonas Narrativas / Gatilhos)**:
  * Polígonos de colisão física que disparam eventos procedurais de terror de uso único (ex: um cano estourando ao passar, um corpo caindo do teto ou uma alucinação em espelho).
* **Boss Areas (Setor da Criatura Thorne)**:
  * Arenas estruturadas de grande escala que possuem múltiplos níveis verticais, passarelas e rotas em loop infinito. Projetadas para o confronto prolongado com a ameaça principal.
* **Hallucination Areas (Distorção da Realidade)**:
  * Áreas dinâmicas que alteram suas propriedades de malhas de colisão tridimensionais se a sanidade do jogador estiver em níveis críticos. Portas e corredores surgem e desaparecem em ângulos cegos.

### 2.2 Rotas e Fluxo de Exploração Não-Linear
O layout dos mapas segue o consagrado "design de quebra-cabeça de fechadura e chave" refinado com rotas alternativas:
* **Hidden Rooms & Secret Corridors**: Pequenas salas ocultas atrás de prateleiras móveis ou buracos na parede de gesso. Exigem observação atenta do jogador e oferecem suprimentos médicos e segredos narrativos cruciais.
* **Maintenance Tunnels (Dutos de Serviço)**: Rotas de rastejamento de baixa visibilidade e teto baixo que ligam setores distantes, contornando salas repletas de anomalias. Se o jogador for localizado dentro de um duto, ele fica encurralado sem capacidade de correr rápido, tornando o uso de dutos uma tática de alto risco.
* **Alternative Routes & Escape Paths**: Garantia de que nenhuma sala de puzzle importante possua apenas uma única porta de acesso. Se o monstro entrar por uma porta, o jogador sempre terá uma janela trincada para pular ou uma escotilha de piso para descer.

---

## 3 — NARRATIVA AMBIENTAL E VESTÍGIOS (AMBIENT STORYTELLING)

A história do Abismo não é contada por cenas cinemáticas interruptivas, mas sim costurada silenciosamente através de vestígios e microdetalhes depositados com precisão nos cenários de exploração.

```
       +-------------------------------------------------------------+
       |                     AMBIENT STORYTELLING                    |
       +-------------------------------------------------------------+
       |   * Diários e Documentos fragmentados em mesas              |
       |   * Terminais e Computadores antigos com logs corrompidos   |
       |   * Riscos em paredes e marcas de desespero (Sangue)        |
       |   * Objetos pessoais e vestígios de experimentos biológicos |
       +-------------------------------------------------------------+
```

### 3.1 Camadas de Informação Coletável
1. **Documentos e Anotações Físicas**:
   * Pranchetas de experimentos, boletins de admissão médica psiquiátrica rabiscados com caligrafia tremula e cartas pessoais abandonadas em armários de vestiário.
   * *Função de Design*: Oferecem lore profundo sobre a criação do Abismo e dão pistas lógicas para puzzles de decodificação mecânica ou senhas de cofres.
2. **Terminais de Computador Antigos**:
   * Sistemas operacionais jurássicos com e-mails trocados entre engenheiros da Usina e relatórios de segurança corrompidos em setores administratvos.
3. **Riscos e Mensagens em Paredes**:
   * Marcas esculpidas nas paredes de concreto usando pregos ou sangue seco. Frases fragmentadas expressando paranoia sobre "o monstro que ouve através do ferro" ou mapas rudimentares desenhados por sobreviventes que falharam em escapar.
4. **Anomalias Estéticas e Vestígios Biológicos**:
   * **Corpos de Sobreviventes**: Corpos posicionados de forma narrativa para ilustrar como morreram (ex: um corpo dentro de um duto de ventilação segurando uma lanterna sem bateria, apontando para o perigo que o matou).
   * **Marcas de Garras e Sangue**: Trajetórias de rastro de sangue nas paredes que mostram uma vítima sendo arrastada para dentro de saídas de ar, informando sutilmente ao jogador que o teto acima dele é um local perigoso de spawn ativo de monstros.

---

## 4 — ENCONTROS PROCEDURAIS E EVENTOS DE MEDO (DYNAMIC FEAR SCENARIOS)

Para quebrar a previsibilidade de repetições de partidas (*speedruns* ou mortes recorrentes), a AbyssEngine utiliza o `ProceduralEventsSystem` para introduzir variações assustadoras de forma aleatória nas rotas de exploração.

```
          +-------------------------------------------------------+
          |                   PROCEDURAL EVENT                    |
          +-------------------------------------------------------+
          |  Se Sanidade < 50% & Tempo sem Eventos > 120s          |
          |  70% Chance de Blackout ou 30% Chance de Hallucination|
          +-------------------------------------------------------+
                                      |
                                      v
          [Gatilho de Evento] -> Apaga luzes + Tranca Portas Próximas
```

### 4.1 Tipos de Eventos de Terror Dinâmico
* **Blackouts Temporários (Bleautes)**:
  * Disparados de forma inesperada na Usina ou Setor Industrial. Todas as luzes elétricas de teto se apagam com barulho estático de fusível estourando, forçando o jogador a depender unicamente de sua lanterna de curto alcance por até 45 segundos.
* **Object Movements (Poltergeist dinâmico)**:
  * Usando o sistema de física integrado, a engine aplica forças cinéticas sutis e repentinas em objetos soltos (latas de refrigerante rolam da prateleira, cadeiras de escritório deslizam na direção do jogador ao abrir uma porta ou uma lâmpada fluorescente pendurada cai no chão e se estilhaça).
* **Door Locks (Bloqueios Inesperados)**:
  * Portas corta-fogo pesadas desabam ou se fecham hermeticamente se o monstro estiver caçando nas imediações, alterando instantaneamente a rota de fuga planejada do jogador.
* **Entity Manifestation (Vislumbres Rápidos)**:
  * O monstro corre de forma rápida e silenciosa por um corredor transversal à frente do jogador, cruzando a linha de visão lateral por frações de segundo e desaparecendo na escuridão sem iniciar combate direto.
* **Storms and Environmental Changes**:
  * Trovões intensos que chacoalham vidraças no Hospital, vazamentos súbitos de tubos de vapor quente na Usina que bloqueiam rotas ou gotejamento procedural de água que imita o som de passos discretos atrás do jogador.

---

## 5 — DESIGN DE QUEBRA-CABEÇAS (PUZZLES TAXONOMY)

Os puzzles do Project Abyss servem como barreiras de ritmo estruturadas para canalizar a tensão emocional do jogador de forma inteligente. Eles são categorizados em classes fundamentais:

```
       +-----------------------------------------------------------+
       |                      PUZZLES TAXONOMY                     |
       +-----------------------------------------------------------+
       |  1. MECÂNICOS  -> Válvulas, engrenagens, pressão de tubos |
       |  2. ELÉTRICOS  -> Fusíveis, rearranjo de fiação, painéis  |
       |  3. BIOLÓGICOS -> Mistura de reagentes, identificação     |
       |  4. PSICOLÓGICOS -> Realidade vs Ilusão, reflexo de tela  |
       +-----------------------------------------------------------+
```

### 5.1 Categorias e Mecânicas de Puzzles
1. **Puzzles Mecânicos**:
   * *Mecânica*: Encaixe de engrenagens em painéis de trancas hidráulicas, sincronização de tempos de rotação de eixos e travamento de válvulas de pressão de vapor de alta temperatura.
2. **Puzzles Elétricos**:
   * *Mecânica*: Busca e reposicionamento de fusíveis em caixas de energia desativadas no Hospital para abrir comportas industriais, e redistribuição de correntes elétricas em painéis de relés (*circuit breakers*).
3. **Puzzles Biológicos & Experimentais**:
   * *Mecânica*: Análise de reagentes químicos no Laboratório. Exige encontrar frascos com componentes específicos para misturar em um agitador magnético, criando um solvente ácido forte para derreter trancas biológicas de anomalias espalhadas nas portas de saída.
4. **Puzzles Psicológicos & Temporais**:
   * *Mecânica*: Uso da câmera ou espelhos em áreas de psiquiatria para revelar portas ocultas ou pistas que não estão presentes no mundo real física tridimensional.
5. **Puzzles Simbólicos & Ambientais**:
   * *Mecânica*: Alinhamento de vitrais na Capela para que a luz da lua forme uma sombra específica em um altar, revelando a chave de uma tumba subterrânea secreta.

---

## 6 — INTERFACE COM O CMS E LEVEL DESIGN TOOLS

O fluxo de design e disposição de assets de construção de mundo é diretamente controlado pela aba do **Map Editor** e **Quest Editor** no CMS integrado da AbyssEngine:

| Componente de Design | Atributo no CMS Mapeado | Evento no Jogo / Comportamento de Level Design |
| :--- | :--- | :--- |
| **Ponto de Spawn de Item** | `MapEditor.spawnTable`<br>`MapEditor.itemDensity` | Distribui chaves, cartões de acesso, munição UV ou baterias nas gavetas e mesas do setor correspondente. |
| **Zona de Gatilho (Trigger)**| `QuestEditor.triggerCondition`<br>`QuestEditor.targetEventID` | Registra e executa o disparo do evento procedural de blackout ou fechamento de portas quando o jogador pisa no limite virtual da zona. |
| **Geração de Puzzles** | `MapEditor.puzzleDifficulty`<br>`MapEditor.codeRandomizer` | Altera aleatoriamente as senhas numéricas dos painéis de porta administradas por arquivos JSON salvos no CMS a cada nova campanha de jogo. |
| **Atmosfera de Região** | `LightingEditor.ambientColor`<br>`LightingEditor.fogDensity` | Altera dinamicamente as cores das luzes e densidade de névoa no Hospital ou Laboratório, alterando a linha de visibilidade máxima do jogador. |

---
*Fim da Documentação Técnica de World Building. Todos os biomas, zoneamentos e dinâmicas procedurais de sustos e puzzles de terror estão perfeitamente integrados ao Core Engine e aos painéis analíticos de CMS.*
