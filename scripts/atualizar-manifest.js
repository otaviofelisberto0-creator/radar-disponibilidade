const fs = require("fs");
const path = require("path");

const pastaDados = path.join(process.cwd(), "dados");
const caminhoManifesto = path.join(pastaDados, "manifest.json");

// Aceita nomes que contenham uma data no formato AAAA-MM-DD.
// Exemplo: radar_2026-10-13.json
const padraoData = /(\d{4}-\d{2}-\d{2})/;

if (!fs.existsSync(pastaDados)) {
  console.error("A pasta dados não foi encontrada.");
  process.exit(1);
}

const arquivos = fs
  .readdirSync(pastaDados)
  .filter((nome) => {
    return (
      nome.toLowerCase().endsWith(".json") &&
      nome.toLowerCase() !== "manifest.json"
    );
  });

const basesPorData = new Map();

for (const arquivo of arquivos) {
  const correspondencia = arquivo.match(padraoData);

  if (!correspondencia) {
    console.warn(`Arquivo ignorado por não conter data: ${arquivo}`);
    continue;
  }

  const data = correspondencia[1];

  // Impede datas impossíveis, como 2026-15-40.
  const dataConvertida = new Date(`${data}T00:00:00Z`);

  if (
    Number.isNaN(dataConvertida.getTime()) ||
    dataConvertida.toISOString().slice(0, 10) !== data
  ) {
    console.warn(`Arquivo ignorado por conter data inválida: ${arquivo}`);
    continue;
  }

  // Se houver mais de um arquivo para a mesma data,
  // mantém o último nome encontrado em ordem alfabética.
  basesPorData.set(data, {
    data,
    arquivo
  });
}

const bases = Array.from(basesPorData.values()).sort((a, b) =>
  a.data.localeCompare(b.data)
);

const baseMaisRecente = bases.length > 0 ? bases[bases.length - 1] : null;

const manifesto = {
  versao: 1,
  ultimaAtualizacao: baseMaisRecente ? baseMaisRecente.data : "",
  arquivoAtual: baseMaisRecente ? baseMaisRecente.arquivo : "",
  bases
};

fs.writeFileSync(
  caminhoManifesto,
  `${JSON.stringify(manifesto, null, 2)}\n`,
  "utf8"
);

console.log(`Manifesto atualizado com ${bases.length} base(s).`);
