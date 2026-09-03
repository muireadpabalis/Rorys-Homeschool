# Rory’s seven-week ELA / writing bridge

41 actual instructional activities extend the existing Grade 3 portal. The focus is idea → complete sentence → expanded sentence → connected sentences → organized paragraph → revision → editing. The unit does not presume a reading deficit, score baseline non-responses as failures, or calculate an overall writing grade.

## Sequence

| Week | Activities | Focus | Independent evidence |
| --- | ---: | --- | --- |
| 1 | 6 | Whole thoughts, subjects/predicates, sorting, repairs, capitals/end marks | Approximately 4–5 familiar-topic sentences |
| 2 | 6 | Requested detail types, adjectives/adverbs, combining, precise information | Expand four sentences using specified details |
| 3 | 6 | Topic, opening, related details, ordering, ending, visual plan | Plan and write one short paragraph |
| 4 | 6 | Oral storytelling, map, sequence, event, reaction, outcome | New narrative prompt |
| 5 | 6 | Familiar-topic explanation, reader needs, order, details, ending | New informational prompt |
| 6 | 6 | Opinion, reasons/examples, links, sentence boundaries, conclusion | New opinion prompt |
| 7 | 5 | Revision versus editing; self-checklist; separate performance sessions | New narrative, informational, and opinion samples |

Every activity is explicitly marked PARENT INSTRUCTION, GUIDED PRACTICE, INDEPENDENT PRACTICE, or INDEPENDENT PERFORMANCE SAMPLE. Teaching activities include short original mentor texts or examples, no more than three directions, and application through writing. Select controls provide sentence sorting, detail-type selection, and sentence ordering. Blank labeled organizers support planning. Daily language checks revisit complete sentences, irregular plurals, capitals, greetings, spelling, sentence boundaries, and other Grade 3 language skills during actual writing.

Standards are mapped to the work practiced. Proper-name/day capitals, basic sentence punctuation, and greeting commas are identified as earlier-grade review; they are not mislabeled as Grade 3 title, address, or dialogue substandards. California destinations include W.3.1–3, W.3.4–5, L.3.1 and L.3.2 subskills, L.3.3a, and oral narration under SL.3.4 where used. This is selected writing/language instruction, not a claim to cover every Grade 3 ELA expectation. Source: [California Grade 3 ELA standards](https://www2.cde.ca.gov/cacs/ela?dl=0&maxgrade=3&mingrade=3&order=0&page=0&perpage=10).

## Student work and independence

Responses save on input in Rory-specific browser storage. Text is preserved without spelling correction, case changes, or whitespace trimming. Performance fields disable browser spellcheck/autocorrect/autocapitalization. A checkpoint records a separate dated copy. Editing an activity later never edits its older checkpoints. Completed activities appear in the existing progress and portfolio architecture.

Nine independent samples preserve a blank plan (optional or on paper), original draft, and final response. Revision happens in the final-writing step; the original remains unchanged. Copying the learner’s own first draft into the final box is optional. No minimum word count or automatic quality score is enforced. If planning is on paper, retain that paper/photo as evidence using the existing portfolio-link workflow and record any transcription/scribing help.

Weeks 4–6 and all three Week 7 final prompts are parent-released. The supplied prompts are distinct from the original diagnostic prompts; parents must confirm they are also new relative to Rory’s actual practice, and can replace them before release. Keep the same genre and familiar-content difficulty. The three final samples must use separate sessions. Later final prompts cannot release before the preceding sample is complete or a parent has recorded insufficient evidence for a non-response. Once released, a prompt is fixed for that attempt. Independent writing screens do not display mentor texts, suggested ideas, models, completed organizers, or the guided editing checklist.

## Parent evidence

New parent content renders only after the existing passphrase gate succeeds. Assistance types are Independent, Directions clarified, Verbal prompting, Organizational help, Spelling help, Scribing/dictation, and Other assistance. Independent is exclusive of other checked support types. Multiple other support types can be retained together. Parent review never edits student text.

Record dated observations against a selected checkpoint or a preserved copy of current work. Qualitative skill findings distinguish not observed, developing, demonstrated with support, demonstrated independently, and insufficient evidence. Repeated observations accumulate by skill; there is no percentage, placement score, or automatic mastery claim. A no-response observation is stored as insufficient evidence, not as zero performance. Partially written parent-review drafts save before a dated observation is added.

The baseline/final comparison reads actual local baseline responses only in the parent area. No private diagnostic response from the request is hardcoded in the published files. Narrative/informational non-responses remain insufficient evidence. Parent comparison notes record progress, help, and next instructional steps without inventing reading findings.

## Persistence and export

Existing record, diagnostic, and parent-review storage keys are unchanged. New per-activity work uses `roryELABridge2026_`; parent observations use `roryELAParent2026`. Full-record and parent ELA exports preserve prompts, planning, drafts, final writing, dated checkpoints, standards, skills, assistance, observations, and comparison notes. Student exports exclude parent metadata and diagnostic responses. Both full-record and ELA-only backups restore through the existing parent area, preserving current values on conflicts and merging missing checkpoint/observation IDs. Parent print expands evidence and observation sections.

The inherited static-site passphrase deters casual access; it is not server authentication. Source files remain public. Actual responses remain browser-local, as before. Use the same GitHub Pages origin/path when deploying so existing saved records remain available. Local previews have separate storage from the live site. Tests use isolated synthetic browser records.

## Integration and validation

Modified: `index.html`, `parent.html`, `parent.js`. Added: `ela.html`, `ela.css`, `ela-curriculum.js`, `ela-store.js`, `ela-student.js`, `ela-parent.js`, `ela-prompts.parent.js`, `ela-portal.js`. No new runtime dependencies or build system are required. Publish the runtime files together; leave original assessments, app code, configuration, and storage keys intact.

The original local tree matched published commit `be0f3aa42940ab28f9938adf7b439296b846b44c` apart from line endings. Git history and GitHub Pages deployment status identify the published revision.

`tests/ela-qa.cjs` verifies all 41 activities, nine independent samples, every response/control type, exact-text persistence, snapshots, prompts, parent privacy, assistance, repeated skill evidence, progress/portfolio, exports/restores, mobile width, and storage failure. `tests/ela-edge-qa.cjs` checks non-response handling, ELA-only restoration, and concurrent-edit protection. Results are recorded alongside the tests. Serve the directory containing both homeschool repositories at localhost:8766, then run with Node and Playwright. `ELA_QA_URL`, `ELA_QA_OUT`, and `CHROME_PATH` can override test defaults.
