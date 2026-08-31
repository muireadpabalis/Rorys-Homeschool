# Rory's Homeschool Hub — Grade 3

This is a static GitHub Pages homeschool portal for Rory's 2026–2027 Grade 3 year.

## Site areas

The site mirrors the structure used for Brody:

- Dashboard
- Subjects
- Assignments
- Assessments
- Daily Learning Log
- Portfolio
- Reports

## Baseline assessment battery

The starter assessment set is designed to locate Rory's instructional starting point after Grade 2 while sampling selected Grade 3 readiness skills:

1. Math Baseline
2. Reading Baseline
3. Language & Grammar Baseline
4. Science Baseline
5. Social Studies Baseline
6. Study Skills & Technology
7. Writing Baseline
8. Speaking & Listening Check

### Diagnostic behavior

The student can:
- move through the assessment normally;
- leave items blank;
- change answers before submission;
- save and exit;
- resume later.

The student is **not** shown:
- whether an answer is right or wrong;
- red/green correctness feedback;
- hints;
- a running score;
- “try again” prompts;
- an answer key;
- a score after submission.

Once submitted, the attempt locks. Parent reporting calculates objective-item results separately.

## Tracking

The browser stores:
- assignment completion;
- assessment responses and submission timestamps;
- learning-log entries and minutes;
- portfolio catalog entries;
- parent observations.

The Reports page includes:
- objective assessment results;
- a baseline skill map using:
  - Mastered
  - Developing
  - Instruction Needed
  - Not Yet Assessed
- learning hours;
- completion totals;
- record exports.

## Privacy and data durability

GitHub Pages is a static website and may be publicly accessible. The repository should **not** contain Rory's:
- date of birth;
- home address;
- medical information;
- passwords;
- private educational records.

The actual progress record is kept in browser `localStorage`, not committed to GitHub by the site.

Important consequence: browser storage is device/browser specific and can be erased. Use **Reports → Export Full Record** regularly and keep those JSON exports in private family storage.

The Portfolio section catalogs evidence but does not upload private work samples to GitHub. Put scans/photos in private storage and record only a private filename or link.

## Publish on GitHub Pages

1. Create a repository such as `rory-homeschool`.
2. Upload:
   - `index.html`
   - `styles.css`
   - `app.js`
3. Open the repository's **Settings → Pages**.
4. Select the publishing branch/folder.
5. Save.
6. GitHub will provide the Pages URL.

## Editing assignments

Parents can use the **+ Add Assignment** button directly on the site. New assignments are stored locally in the browser and included in exports.

For assignments that should appear on every device before any record is imported, add them to the `ASSIGNMENTS` array in `app.js`.

## Educational alignment

The baseline is intentionally broader than a conventional Grade 3 quiz. It checks retained Grade 2 foundations and adds selected early Grade 3 readiness items so later instruction can be individualized.

The initial mathematics readiness sample includes Grade 3 concepts such as multiplication/division, rounding/place value, and fractions. Reading samples include explicit text evidence, main ideas/details, vocabulary, and inference. These categories are consistent with the broad Grade 3 direction of the California standards, while the baseline's primary purpose is diagnostic rather than standards certification.

## Suggested next development steps

After the baseline is completed:
- replace generic starter assignments with Rory's individualized weekly plan;
- add specific lesson pages and printable activities;
- add parent rubric scoring for writing/oral assessments;
- add January and June progress-report generators;
- add private work-sample storage through an authenticated service if desired;
- optionally add secure cloud sync so multiple devices share one record.
