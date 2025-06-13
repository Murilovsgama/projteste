import { fileURLToPath } from 'url';
import path from 'path';
import { execSync } from "child_process";
import fs from "fs-extra";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function compileAndMove() {
  try {
    const environment = process.argv[2];
    const dev = "Dev:Destination"
    const hml = "Hml:Destination";
    const prod = "Prod:Destination";

    let destination;
    let mode;

    if (environment === "hml") {
      destination = hml;
      mode = "hml";
    } else if (environment === "prod") {
      destination = prod;
      mode = "production";
    } else {
      destination = dev;
      mode = "development";
    }

    execSync(`npx vite build --mode ${mode}`, { stdio: "inherit" });

    const origin = path.join(__dirname, "../dist");

    if (!fs.existsSync(destination)) {
      console.error("O diretório de destino não existe. Saindo...");
      process.exit(1);
    }

    fs.emptyDirSync(destination);
    console.log(
      `O conteúdo do diretório de destino foi excluído com sucesso: ${destination}`
    );

    fs.copySync(origin, destination);
    console.log(`Os arquivos foram movidos com sucesso para: ${destination}`);
  } catch (error) {
    console.error(
      "Erro durante a compilação, movimentação de arquivos ou atualização de caminhos.",
      error
    );
    process.exit(1);
  }
}

compileAndMove();
