/**
 * Convert Whisky ME.xlsx to value.json and volume.json
 *
 * Excel structure (Master Sheet):
 * - Row 0: Title
 * - Row 4: [count, "Value"]
 * - Row 5: Headers [Region, Segment, Sub-segment, 2000, 2001, ..., 2033]
 * - Rows 6-766: Value data
 * - Row 767: ["Volume"]
 * - Row 768: Headers
 * - Rows 769+: Volume data
 */

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, 'Whisky ME.xlsx'));
const ws = wb.Sheets['Master Sheet'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Find section boundaries
let valueHeaderRow = -1;
let volumeHeaderRow = -1;

for (let i = 0; i < rows.length; i++) {
  const row = rows[i];
  if (row && row[1] === 'Value') {
    valueHeaderRow = i + 1; // next row is the header
  }
  if (row && row[0] === 'Volume' && row.length <= 2) {
    volumeHeaderRow = i + 1; // next row is the header
  }
}

console.log(`Value header at row ${valueHeaderRow}, Volume header at row ${volumeHeaderRow}`);

// Extract year columns from header row
const headerRow = rows[valueHeaderRow];
const years = [];
for (let c = 3; c < headerRow.length; c++) {
  const yr = headerRow[c];
  if (typeof yr === 'number' && yr >= 2000 && yr <= 2033) {
    years.push(yr);
  }
}
console.log(`Years: ${years[0]} to ${years[years.length - 1]} (${years.length} years)`);

// Name normalization map
const nameNormalize = {
  'UK': 'U.K.',
};

function normalizeName(name) {
  if (!name) return name;
  const trimmed = name.trim();
  return nameNormalize[trimmed] || trimmed;
}

/**
 * Parse a section of the Excel into the JSON structure the dashboard expects.
 *
 * Structure:
 *   { geography: { segmentType: { subSegment: { year: value } } } }
 *
 * - Global gets: 6 segment types (no By Region — those are separate geography entries)
 * - Regions get: 6 segment types + By Country
 * - Countries get: 6 segment types only
 */
function parseSection(startDataRow, endRow, rounder) {
  const data = {};

  for (let i = startDataRow; i < endRow; i++) {
    const row = rows[i];
    if (!row || !row[0] || typeof row[0] !== 'string') continue;
    if (row[0] === 'Region') continue; // skip header rows

    const geography = row[0].trim();
    const segment = row[1] ? row[1].trim() : '';
    const subSegment = normalizeName(row[2]);

    if (!geography || !segment || !subSegment) continue;

    // Skip "By Region" under Global — those totals exist as separate geography entries
    if (geography === 'Global' && segment === 'By Region') continue;

    // Initialize geography
    if (!data[geography]) data[geography] = {};
    // Initialize segment type
    if (!data[geography][segment]) data[geography][segment] = {};
    // Initialize sub-segment with year data
    if (!data[geography][segment][subSegment]) data[geography][segment][subSegment] = {};

    for (let c = 0; c < years.length; c++) {
      const year = years[c].toString();
      const val = row[3 + c];
      if (val !== undefined && val !== null && val !== '') {
        data[geography][segment][subSegment][year] = rounder(val);
      }
    }
  }

  return data;
}

// Find end of value section (the blank rows before Volume marker)
let valueEndRow = volumeHeaderRow - 1;
// Walk back to find last data row
while (valueEndRow > 0 && (!rows[valueEndRow] || !rows[valueEndRow][0])) {
  valueEndRow--;
}
valueEndRow++; // exclusive

// Find end of volume section
let volumeEndRow = rows.length;

// Round functions
const roundValue = (val) => Math.round(val * 10) / 10;
const roundVolume = (val) => Math.round(val * 10) / 10; // Keep 1 decimal for Th Units too

console.log('\nParsing Value section...');
const valueData = parseSection(valueHeaderRow + 1, valueEndRow, roundValue);

console.log('Parsing Volume section...');
const volumeData = parseSection(volumeHeaderRow + 1, volumeEndRow, roundVolume);

// Write output files
const dataDir = path.join(__dirname, 'public', 'data');

fs.writeFileSync(
  path.join(dataDir, 'value.json'),
  JSON.stringify(valueData, null, 2),
  'utf8'
);
console.log('✅ value.json written');

fs.writeFileSync(
  path.join(dataDir, 'volume.json'),
  JSON.stringify(volumeData, null, 2),
  'utf8'
);
console.log('✅ volume.json written');

// Verification
console.log('\n--- Verification ---');
console.log('Value geographies:', Object.keys(valueData));
console.log('Value geography count:', Object.keys(valueData).length);

console.log('\nGlobal segments:', Object.keys(valueData['Global']));
console.log('North America segments:', Object.keys(valueData['North America']));
console.log('U.S. segments:', Object.keys(valueData['U.S.']));

console.log('\nSample Global -> By Underlying Whisky Type -> Single Malt (first 3 years):');
const sample = valueData['Global']['By Underlying Whisky Type']['Single Malt'];
console.log('  2000:', sample['2000'], '2001:', sample['2001'], '2002:', sample['2002']);

console.log('\nVolume geographies count:', Object.keys(volumeData).length);
console.log('Volume sample Global -> By Underlying Whisky Type -> Single Malt (first 3 years):');
const vSample = volumeData['Global']['By Underlying Whisky Type']['Single Malt'];
console.log('  2000:', vSample['2000'], '2001:', vSample['2001'], '2002:', vSample['2002']);

// Check for By Region in Global (should NOT be there)
if (valueData['Global']['By Region']) {
  console.log('\n⚠️  WARNING: By Region found in Global value data — should be excluded!');
} else {
  console.log('\n✅ By Region correctly excluded from Global');
}

// Check By Country exists for regions
const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'];
regions.forEach(r => {
  if (valueData[r] && valueData[r]['By Country']) {
    console.log(`✅ ${r} has By Country with ${Object.keys(valueData[r]['By Country']).length} countries`);
  } else {
    console.log(`⚠️  ${r} missing By Country!`);
  }
});
