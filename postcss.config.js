// v3 の画面コードをそのまま使うための、生成済み CSS に対する限定的な互換処理。
// パーサーやグロブ処理の旧依存は導入せず、PostCSS の公式 AST だけを使う。
const legacyUtilities = {
  postcssPlugin: "luxury-tailwind-v3-compatibility",
  OnceExit(root) {
    root.walkRules((rule) => {
      const declarations = (rule.nodes ?? []).filter((node) => node.type === "decl");

      // v4 の先頭側 margin を含む方式を、v3 の非 hidden 兄弟間の方式へ戻す。
      const axis = declarations.find((node) => /^--tw-space-[xy]-reverse$/.test(node.prop))?.prop[11];
      if (axis && /^:where\(.+>\s*:not\(:last-child\)\)$/.test(rule.selector)) {
        rule.selector = rule.selector.replace(/^:where\((.+?)\s*>\s*:not\(:last-child\)\)$/, "$1 > :not([hidden]) ~ :not([hidden])");
        const properties = axis === "y"
          ? { "margin-block-start": "margin-bottom", "margin-block-end": "margin-top" }
          : { "margin-inline-start": "margin-right", "margin-inline-end": "margin-left" };
        for (const node of declarations) {
          if (properties[node.prop]) node.prop = properties[node.prop];
          else if (node.prop === (axis === "y" ? "margin-block" : "margin-inline") && node.value === "0") {
            node.prop = axis === "y" ? "margin-top" : "margin-left";
            rule.append({ prop: axis === "y" ? "margin-bottom" : "margin-right", value: "0" });
          }
        }
      }

      // outline-none の旧名を保持し、強制配色モードで見える透明 outline を残す。
      if (rule.selector.includes("outline-none")) {
        const outline = declarations.find((node) => node.prop === "outline-style" && node.value === "none");
        if (outline) {
          declarations.find((node) => node.prop === "--tw-outline-style")?.remove();
          outline.prop = "outline";
          outline.value = "2px solid transparent";
          rule.append({ prop: "outline-offset", value: "2px" });
        }
      }

      // 旧 arbitrary-value 記法（例 origin-[--radix-…]）を有効な CSS 変数参照にする。
      for (const node of declarations) {
        if (["background-color", "border-color", "max-height", "transform-origin"].includes(node.prop)
          && /^--[\w-]+$/.test(node.value)) node.value = `var(${node.value})`;
      }

      // 個別 transform だと inline transform と合成されるため、v3 と同じ一括方式を保持。
      if (/(?:^\.|\\:)-?(?:translate|scale|rotate)-/.test(rule.selector)) {
        let changed = false;
        for (const node of declarations) {
          if (/^--tw-scale-[xy]$/.test(node.prop) && /^-?\d+(\.\d+)?%$/.test(node.value)) {
            node.value = String(parseFloat(node.value) / 100);
          }
          if (node.prop === "rotate") {
            node.prop = "--tw-rotate";
            changed = true;
          } else if (node.prop === "translate" || node.prop === "scale") {
            node.remove();
            changed = true;
          }
        }
        if (changed) rule.append({
          prop: "transform",
          value: "translate(var(--tw-translate-x, 0), var(--tw-translate-y, 0)) rotate(var(--tw-rotate, 0)) skewX(var(--tw-skew-x, 0)) skewY(var(--tw-skew-y, 0)) scaleX(var(--tw-scale-x, 1)) scaleY(var(--tw-scale-y, 1))",
        });
      }
    });
  },
};

export default { plugins: [legacyUtilities] };
