/* eslint-disable no-console */
/**
 * Restores the block identity of columns variants in generated JCR XML.
 *
 * helix-md2jcr writes every "Columns*" block as a plain core columns node with only
 * rows/columns, dropping name/model/filter. AEM then publishes "Columns Links" etc. as the
 * generic "columns" block. This re-adds the attributes from component-definition.json,
 * matching each <columns> node, in order, to the "Columns ..." table headers in the .md.
 *
 * Usage: node tools/importer/fix-columns-jcr.mjs [migration-work/jcr-content/index]
 */
import { readFileSync, writeFileSync } from 'node:fs';

const base = process.argv[2] || 'migration-work/jcr-content/index';
const md = readFileSync(`${base}.md`, 'utf8');
let xml = readFileSync(`${base}.xml`, 'utf8');

const definitions = JSON.parse(readFileSync('component-definition.json', 'utf8'))
  .groups.flatMap((g) => g.components);
const byName = new Map(definitions
  .map((c) => c.plugins?.xwalk?.page?.template)
  .filter((t) => t?.name)
  .map((t) => [t.name, t]));

// block table headers look like "| Columns Links   |" (optionally with "(classes)")
const headers = [...md.matchAll(/^\|\s*(Columns[^|(]*?)\s*(?:\([^)]*\))?\s*\|\s*$/gm)]
  .map((m) => m[1].trim());

let index = 0;
xml = xml.replace(/<(columns\d*) ([^>]*sling:resourceType="core\/franklin\/components\/columns\/v1\/columns"[^>]*)>/g, (tag, el, attrs) => {
  const name = headers[index];
  index += 1;
  const template = byName.get(name);
  if (!template || / name="/.test(attrs)) return tag;
  const extra = [`name="${template.name}"`];
  if (template.model) extra.push(`model="${template.model}"`, 'modelFields="[columns,rows]"');
  if (template.filter) extra.push(`filter="${template.filter}"`);
  console.log(`${el} #${index}: ${template.name}`);
  return `<${el} ${attrs} ${extra.join(' ')}>`;
});

if (index !== headers.length) {
  console.error(`Mismatch: ${index} columns nodes vs ${headers.length} Columns headers; not writing.`);
  process.exit(1);
}
writeFileSync(`${base}.xml`, xml);
