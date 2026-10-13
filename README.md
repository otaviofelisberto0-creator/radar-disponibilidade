# Radar de Disponibilidade de Agenda

Dashboard web estático para análise de disponibilidade de agenda das regionais PR e Santa Catarina.

## Conteúdo do repositório

- `index.html` — aplicação completa do Radar.
- `dados/` — pasta destinada aos JSONs diários no padrão `radar-AAAA-MM-DD.json`.
- `.gitignore` — evita o versionamento acidental de bases locais, temporários e arquivos de sistema.

O dashboard processa os arquivos no navegador. Nenhum dado da base é enviado a um servidor pelo fluxo da página **ANALISTA**.

## Publicar no GitHub Pages

1. Entre em [GitHub](https://github.com/login) e crie um repositório.
2. Envie para a raiz do repositório o `index.html`, este `README.md`, o `.gitignore` e a pasta `dados`.
3. No repositório, acesse **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch principal, normalmente `main`, e a pasta `/ (root)`.
6. Clique em **Save** e aguarde o endereço público disponibilizado pelo GitHub Pages.

O `index.html` precisa permanecer na raiz para abrir diretamente pelo endereço do GitHub Pages.

## Fluxo diário

Na página **ANALISTA**, siga as etapas na ordem exibida:

1. **Carregar arquivo** — selecione Excel `.xlsx`/`.xls` ou CSV.
2. **Processar** — valida a base e atualiza tabelas, alertas, gráficos, filtros e indicadores.
3. **Converter para JSON** — gera o JSON localmente no navegador.
4. **Baixar JSON** — salva o arquivo com nome `radar-AAAA-MM-DD.json`, usando o D+0 identificado no nome da base.
5. **Acessar GitHub** — abre `https://github.com/login` em uma nova aba.

O botão **Acessar GitHub** apenas abre a página de login. Ele **não publica, envia nem versiona automaticamente** o JSON. Para manter um histórico no repositório, faça o upload manual do JSON diário para a pasta `dados/`.

## Nomes de arquivo compatíveis

A data D+0 pode ser identificada em nomes como:

- `Radar DD-MM-AA.xlsx`
- `Tabela DD-MM-AAAA.xls`
- `radar-AAAA-MM-DD.csv`

Exemplo de JSON gerado para D+0 em 2 de outubro de 2026:

```text
radar-2026-10-02.json
```

## Uso e segurança

- O processamento e a conversão para JSON ocorrem no navegador.
- Revise os dados antes de publicar qualquer JSON no repositório.
- Não versione planilhas ou CSVs corporativos; o `.gitignore` bloqueia esses formatos por padrão.
- O dashboard depende de conexão com a internet para carregar SheetJS e html2canvas pelos CDNs já referenciados no `index.html`.
