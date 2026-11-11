# Course discovery

Course pages support search (including Chinese subject names), subject and GER filters, popularity by visible review count, rating order, and a first-year introductory-course shortcut. Filters intersect. Other category pages retain their existing directory.

## Metadata

`data/course-catalog.json` stores factual tags extracted from the Oxford 2026–27 printed catalog (source URL and verification date are included). Base course codes map to printed catalog entries. W adds CC and E adds XA only on the actual listing's suffix. PE is displayed as PED. Unknown tags are explicitly shown as pending verification, never inferred from a department. A missing tag does not establish that a course satisfies no GER. OPUS remains authoritative for a particular section.

Old QTM codes map to the corresponding DASCI metadata. ENGCW 270–272 map to the printed English creative-writing entries. The introductory shortcut conservatively includes 100-level catalog courses without listed prerequisites, permission, placement, audition, heritage/native-speaker restrictions, varsity status, intermediate level, or Calculus II. This is a discovery aid, not a registration eligibility decision or freshman enrollment statistic. More advanced courses a freshman could take are not automatically included.

To refresh: download the linked official PDF, extract its text with pypdf, then run `python3 scripts/generate-course-metadata.py /absolute/path/to/extracted.txt`. Review the factual mappings and regression tests before committing. The full source PDF and course descriptions are not included in this repository.

## Duplicate cleanup on 2026-11-10

Three visible duplicate listings were soft-hidden through the logged-in admin interface: ANTH_OX 101 (empty listing ID 62; reviewed ID 51 retained), LING_OX 242 (empty listing ID 136; reviewed ID 45 retained), and one of the two unreviewed PSYC_OX 205 (E) listings. Public directory count changed from 168 to 165; all three courses still appear once. No reviews were moved or deleted. Restore is available in admin item management.

New course submissions check visible records for a normalized matching code, preserving different W/E/lab variants. A match returns HTTP 409 with the existing item ID. This application check handles routine accidental resubmission; a future database constraint would be required to arbitrate simultaneous concurrent inserts atomically. No schema migration is required for this change.

## Validation

- `node --test tests/course-discovery.cjs`
- `npx tsc --noEmit`
- `npm run build` with configured Supabase environment (placeholder public values suffice for compilation).
