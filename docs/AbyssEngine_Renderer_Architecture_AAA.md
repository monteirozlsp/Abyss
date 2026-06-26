# PROJECT ABYSS — RENDERING PIPELINE & GRAPHICS ARCHITECTURE (v1.0.0)
**Documento de Especificação de Renderização AAA, PBR, Pós-Processamento e Otimização de GPU**  
**Autor:** Principal Rendering Architect & Principal Graphics Engineer  
**Status:** Implementado & Integrado (Production Ready)

---

## 1 — FLUXO DO PIPELINE DE RENDERIZAÇÃO ABISSAL

A renderização do **Project Abyss** adota o motor **BabylonJS** configurado para WebGL2/WebGPU de alto desempenho, integrando shaders PBR customizados e pipelines pós-processamento de densidade cinematográfica.

```
                  ┌─────────────────────────────┐
                  │    Canvas Ingress / WebGL2   │
                  └──────────────┬──────────────┘
                                 │ Inicializa Engine
                  ┌──────────────▼──────────────┐
                  │   Scene Graph (BabylonScene)│
                  └──────────────┬──────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌──────────────────┐                            ┌──────────────────┐
│  PBR Materials   │                            │  Mesh Processing │
│  - Rough/Metal   │                            │  - Thin Instances│
│  - KTX2 Textures │                            │  - LOD Levels    │
│  - HDR Cubemaps  │                            │  - Occlusion Q.  │
└────────┬─────────┘                            └────────┬─────────┘
         │                                               │
         └───────────────────────┬───────────────────────┘
                                 │ Renderiza Malhas
                  ┌──────────────▼──────────────┐
                  │   Spotlight (Shadow Maps)   │
                  └──────────────┬──────────────┘
                                 │ Aplica Post-Processing
                  ┌──────────────▼──────────────┐
                  │   SSAO2 Rendering Pipeline  │
                  └──────────────┬──────────────┘
                                 │ Aplica Post-Processing
                  ┌──────────────▼──────────────┐
                  │  DefaultRenderingPipeline   │
                  │  - HDR Framebuffers         │
                  │  - Bloom / Volumetric Fog   │
                  │  - ACES ToneMapping         │
                  │  - Noise Lens Grain         │
                  └──────────────┬──────────────┘
                                 │
                                 ▼
                     [ TELA FINAL DO JOGADOR ]
```

---

## 2 — DETALHAMENTO TÉCNICO DOS SUBSISTEMAS GRÁFICOS

### 2.1 — PHYSICALLY BASED RENDERING (PBR)
Todas as superfícies e modelos carregados no Project Abyss utilizam materiais PBR (`PBRMaterial`). 
* **Roughness/Metalness Map**: Definição exata de propriedades reflexivas e microfissuras para simular metais oxidados, concreto úmido e estruturas industriais enferrujadas.
* **Albedo/Normal Map**: Texturas de alta frequência para relevo tridimensional através de tangent-space normal mapping.

### 2.2 — HDR ENVIRONMENT & LIGHTING
Uso de iluminação baseada em imagem (IBL - Image-Based Lighting) de alta dinâmica (HDR) pre-filtrada no formato `.env` ou `.hdr`.
* Simula a reflexão em tempo real das fontes de iluminação ambiental na superfície dos materiais PBR sem custo computacional direto na GPU.

### 2.3 — KTX2 TEXTURE COMPRESSION
Suporte nativo para compressão de texturas de GPU **KTX2** utilizando a codificação **Basis Universal**.
* Reduz drasticamente o consumo de VRAM e o tempo de carregamento em rede de arquivos de textura (texturas KTX2 são decodificadas diretamente pelo hardware da GPU).

### 2.4 — SSAO 2 (SCREEN SPACE AMBIENT OCCLUSION)
Utiliza o pipeline avançado de SSAO 2 (`SSAO2RenderingPipeline`) rodando em tela cheia (Full-screen pass) com desfoque bilateral de alta qualidade.
* Adiciona sombras de contato extremamente realistas em cantos, dobras e junções de objetos da cena tridimensional para aumentar a profundidade e o senso de claustrofobia.

### 2.5 — DYNAMIC FLASHLIGHT (LANTERNA LED)
Implementa uma lanterna de foco cônico presa à câmera (`SpotLight`) simulando LEDs frios de alta potência.
* **Shadow Maps**: Projetores de sombra Poisson-Sampled com ajuste de bias dinâmico para evitar vazamentos (*shadow acne*).
* Sincronização e interpolação do vetor de visão e posição do jogador para criar a sensação de feixe de lanterna físico.

### 2.6 — VOLUMETRIC FOG & PARTICLE SYSTEM
* **Volumetric Fog**: Simulação atmosférica através de fog exponencial esverdeado e escuro que engole o cenário à distância.
* **Ambient Dust Particles**: Sistema de partículas de alto desempenho que emite pequenas poeiras reflexivas e partículas suspensas iluminadas pelo feixe da lanterna para aumentar a imersão.

### 2.7 — RECURSOS DE PERFORMANCE (OCULAR OPTIMIZATIONS)
* **Hardware Occlusion Queries**: Malhas grandes fora do campo de visão direto ou ocultas por paredes de concreto não consomem processamento de desenho da GPU (são testadas de forma assíncrona usando hardware queries).
* **Thin Instances**: Permite a renderização procedural de milhares de detritos físicos, folhas ou grama em uma única chamada de desenho (Single Draw Call).
* **Level of Detail (LOD)**: Transição suave de polígonos com base na distância da câmera para manter taxas estáveis de frames.

---

## 3 — REGRAS DE INTEGRAÇÃO DO COMPILADOR

Todas as dependências gráficas estão centralizadas no serviço `Renderer` e controladas estritamente sob as diretrizes de compilação limpa do Monorepo, garantindo compatibilidade entre os ambientes de desenvolvimento e builds de produção.
