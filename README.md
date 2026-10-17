# Halogenation Lab

**Industrial Halogenation & Chloromethane Process Analysis · RagabLabs**

مختبر علمي تعليمي يعمل في المتصفح، يضم **20 حاسبة** لكلورة الميثان والكلوروميثانات وموازنات المادة والتحليل الحراري. يدعم العربية RTL والإنجليزية LTR، والوضعين الفاتح والداكن، وخطوات الحل والمعادلات والرسوم والتقارير.

## تشغيل مباشر دون تثبيت

بعد فك الضغط، افتح **Open-Halogenation-Lab.html** بضغطتين في متصفح حديث. يحتوي الملف على التطبيق والتنسيق والخطوط داخله، ويتيح الحسابات دون خادم محلي أو اتصال إنترنت. انظر [START-HERE.txt](START-HERE.txt).

اختبار المتصفح الإضافي للملف المستقل تعذّر في بيئة هذه المراجعة لعدم إتاحة Chromium؛ نتائج التحقق الدقيقة موجودة في [VALIDATION.md](docs/VALIDATION.md).

## تشغيل وتعديل الكود

المتطلبات: **Node.js 22 أو أحدث** ومتصفح حديث.

```bash
npm ci
npm run dev
```

افتح الرابط المحلي الذي يظهر في الطرفية، مع المسار `/Halogenation-Lab/`.

### تشغيل النسخة الجاهزة دون تثبيت الحزم

يتضمن الملف المضغوط مجلد `dist` المبني مسبقًا. مع وجود Node.js فقط:

```bash
node tests/serve.mjs
```

افتح `http://127.0.0.1:4173/Halogenation-Lab/`. لا تحتاج النسخة المبنية إلى اتصال خارجي أو CDN. فتح `index.html` مباشرةً بنظام `file://` غير مدعوم، لأن هذا المدخل مخصص لبناء Vite. استخدم `Open-Halogenation-Lab.html` للتشغيل المباشر.

## النشر على GitHub Pages

1. أنشئ مستودعًا باسم **Halogenation-Lab**.
2. ارفع **محتويات مجلد Halogenation-Lab** بحيث يكون `package.json` في جذر المستودع، مع المجلد المخفي `.github`.
3. من **Settings → Pages → Source** اختر **GitHub Actions**.
4. استخدم الفرع `main`، ثم انتظر نجاح سير العمل `Verify and deploy Halogenation Lab`.

الرابط المستهدف بعد النشر: **https://ragablabs.github.io/Halogenation-Lab/**. هذا عنوان متوقع وفق اسم الحساب والمستودع، وليس إثباتًا أن الموقع نُشر بالفعل.

تم ضبط `base: '/Halogenation-Lab/'`. يعتمد التنقل على hash، لذا لا تحتاج صفحات الحاسبات إلى إعادة توجيه على الخادم. التفاصيل في [تعليمات النشر](docs/DEPLOYMENT.md).

## الأدوات العشرون

| # | Calculator | الحاسبة |
|---|---|---|
| 01 | Methane chlorination stoichiometry | ستوكيومترية كلورة الميثان |
| 02 | Chlorine-to-methane molar ratio | النسبة المولية للكلور إلى الميثان |
| 03 | Limiting reactant | المتفاعل المحدد |
| 04 | Chlorination conversion | تحويل المتفاعل |
| 05 | Sequential chlorination stoichiometry | ستوكيومترية الكلورة المتتابعة |
| 06 | Chloromethane product distribution | توزيع منتجات الكلوروميثان |
| 07 | Chloromethane selectivity | انتقائية الكلوروميثان |
| 08 | Chloromethane yield | مردود الكلوروميثان |
| 09 | Chlorine consumption | استهلاك الكلور |
| 10 | Hydrogen chloride byproduct | الناتج الجانبي HCl |
| 11 | Methane feed requirement | احتياج تغذية الميثان |
| 12 | Integrated chlorination mass balance | الموازنة الكتلية الشاملة |
| 13 | Chlorination reaction enthalpy | إنثالبي تفاعلات الكلورة |
| 14 | Chlorination heat duty | حرارة تفاعلات الكلورة |
| 15 | Adiabatic temperature change | التغيّر الأدياباتي في الحرارة |
| 16 | Gas mixture and dilution | مزيج الغازات والتخفيف |
| 17 | Chloromethane mixture properties | خواص تركيب المزيج |
| 18 | Product recovery mass balance | موازنة استرجاع المنتجات |
| 19 | Multi-stage chlorination stream balance | موازنة تدفقات متعددة المراحل |
| 20 | Integrated halogenation laboratory | مختبر الهلجنة المتكامل |

## الاستخدام والتقارير

- أمثلة افتراضية موضحة بوسم «مثال محلول»، وليست بيانات مصنع أو قياسات تجريبية.
- تغيّر المدخلات يخفي النتائج السابقة والتصدير حتى إعادة الحساب.
- الكسور من **0 إلى 1**. وحدات التغذية والمنتجات: mol وkmol وg وkg، مع أساس كمية أو تدفق بالساعة. امتدادات التفاعل مولية دائمًا.
- تغيير وحدة الكتلة/المولات يحوّل المدخلات بما يحفظ الكمية المولية. التبديل بين كمية وتدفق يغيّر تفسير الأساس دون افتراض مدة زمنية.
- **CSV:** المدخلات والنتائج والجداول والخطوات والافتراضات، بترميز UTF-8 مع BOM.
- **JSON:** حالة قابلة لإعادة الاستيراد، تشمل المدخلات والنتائج والإصدار. يعاد حساب الحالة المستوردة؛ لا تُعتمد نتائجها المحفوظة.
- **HTML:** تقرير مستقل قابل للفتح والطباعة، يدعم العربية ويستخدم MathML للمعادلات.
- **PDF / طباعة:** يفتح نافذة طباعة المتصفح. اختر **Save as PDF / حفظ كملف PDF**. يتضمن التقرير نسخة المدخلات والجداول والخطوات والمراجع. لا يحتاج التطبيق إلى خدمة تقارير خارجية.
- تُحفظ اللغة والمظهر وآخر مدخلات محسوبة محليًا على الجهاز. لا تُرسل المدخلات إلى خادم.

## Scientific scope

The stoichiometric engine uses four balanced substitution reactions and **user-entered extents**. It does not predict kinetic product distributions from feed ratio. Molecular weights use one consistent set of conventional rounded atomic weights. Thermochemistry uses gas-phase NIST-JANAF formation data and temperature-dependent Shomate heat capacities, with a documented alternative for user-justified constant Cp.

The adiabatic model has fixed composition, ideal-gas reference states, and a **298.15–1000 K** validity interval. A root outside that interval is rejected. Recovery is an entered component split, not a distillation simulator. The app provides no operating setpoints, control strategy, materials selection, or safe feed-ratio recommendation.

## Verification

```bash
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

The scientific suite contains at least five named cases per calculator: reference, boundary, invalid input, unit consistency and scientific consistency. See [TESTING.md](docs/TESTING.md) and the retained [validation record](docs/VALIDATION.md) for what actually ran and its limits.

## Architecture

```text
src/
  engine/        calculations, thermochemistry, validation, units, network
  data/          calculator definitions, reference data, bilingual UI text
  components/    SVG chemistry, diagrams, KaTeX equations, Recharts plots
  reports/       CSV, JSON, HTML and input snapshot helpers
  App.tsx        routes, inputs, results, language and theme
  styles.css     responsive blueprint design and print layout
tests/
  science.test.ts
  browser/application.spec.ts
docs/            scientific documentation, sources, audit, examples, deployment
scripts/         standalone build and structural verification
Open-Halogenation-Lab.html  direct-open single-file application
dist/            ready-built static application
.github/workflows/pages.yml
```

React, TypeScript, Vite, Tailwind CSS, KaTeX, Recharts, Lucide, Vitest and Playwright. All runtime fonts and assets are bundled locally.

## Documentation

- [Scientific documentation](docs/SCIENTIFIC.md)
- [All calculator equations](docs/EQUATIONS.md)
- [Reaction network and material balances](docs/REACTION-NETWORK.md)
- [Thermodynamic assumptions](docs/THERMODYNAMICS.md)
- [Slide-by-slide lecture audit](docs/LECTURE-AUDIT.md)
- [Worked examples](docs/WORKED-EXAMPLES.md)
- [References](docs/REFERENCES.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Third-party notices](THIRD-PARTY-NOTICES.md)

## License

Current release: **1.0.1**.

Original project code is licensed under MIT. Third-party code, fonts, factual reference data and the original lecture retain their respective terms. The supplied lecture is not redistributed. See [LICENSE](LICENSE) and [THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).
