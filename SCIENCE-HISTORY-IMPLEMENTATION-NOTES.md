# Rory Grade 3 instructional courses

The completed `roryBaseline2026_science` and `roryBaseline2026_history` records remain independent assessment payloads. Science and History course work lives under `roryScienceBridge2026_*` and `roryHistoryBridge2026_*`; parent observations live under `roryScienceParent2026` and `roryHistoryParent2026`. Course synchronization adds only stable weekly assignment and portfolio IDs to `roryHomeschoolRecordV2`.

Each course has seven weekly modules with a direct lesson, child-friendly vocabulary, a parent-prepared activity, an investigation or model, thinking and evidence prompts, a short end check, saved fields, immutable checkpoints, assistance reporting, and portfolio identification. Completion is shown as saved evidence checkpoints and assignment counts rather than a mastery percentage.

The shared reasoning routine is visible throughout Science as `OBSERVE → RECORD DATA → CHOOSE EVIDENCE → MAKE A CLAIM`. History uses the parallel routine `LOOK CLOSELY → RECORD A CLUE → CHECK A SOURCE → EXPLAIN YOUR IDEA`.

## Assessment persistence repair

The earlier portal stored attempts under `roryHomeschoolCompleteV2`. The current portal reads `roryBaseline2026_*` and `rory_math_baseline_v1`, but had no migration or recovery read for the older container. That made completed attempts look absent after a change of portal architecture even when the old browser key remained.

`assessment-persistence.js` now preserves exact legacy raw bytes in an append-only recovery archive, retains malformed raw values for parent recovery, keeps imported current-format candidates separate, and never lets an archive replace an existing current attempt merely because it has more answers. A submitted primary attempt is protected from an older open copy. Reads do not overwrite a valid primary key. Complete-record restore validates the student, subject, version, question IDs, and answer shapes before any attempt write, while course and record restore rolls back Rory-prefixed writes if a later operation fails.

No lost assessment answers were reconstructed. Older attempts are displayed and exported as historical, unscored evidence. A valid surviving Science assessment remains byte-for-byte unchanged in the focused browser checks.

## Source shelf

The History course links the California Grade 3 standards and framework, Library of Congress primary-source guidance, official Falmouth and Redding government pages, and official Mashpee Wampanoag, Aquinnah Wampanoag, and Redding Rancheria pages. Week 5 asks the parent to record the exact organization, title, URL, and claim used. The student lesson avoids invented ceremonies, beliefs, language, quotations, or homeland boundaries.

## Local verification

The focused Playwright check in `tests/instructional-courses-qa.cjs` uses an isolated browser context, seeds synthetic baselines and an older legacy container, completes all 14 weekly checkpoints, reloads each record, checks cross-course filters, opens parent records, checks official Week 5 links, and verifies mobile width and same-origin responses. It passed on 2026-09-05. The existing Grade 3 subject regression also passed. The broad legacy `browser-qa.cjs` and `edge-qa.cjs` require the installed Chrome executable to be supplied; `edge-qa.cjs` passed, while the separate Brody legacy bridge assertion remains a pre-existing fixture expectation outside this Rory repository.
