import { defineConfig } from "vite";

function ViteTransformYaml() {
  const yamlReg = /\.ya?ml$/;
  return {
    name: "vite:transform-yaml",
    async transform(code, id) {
      if (!yamlReg.test(id)) return "";
      const filename = id.split("/").pop().replace(yamlReg, "");
      return {
        code: `export const ${filename} = \`${code}\`;`,
        map: { mappings: "" },
      };
    },
  };
}

export default defineConfig({
  root: "./test",
  plugins: [ViteTransformYaml()],
});
