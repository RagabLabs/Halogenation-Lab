import { b, type ErrorCode } from "../engine/types";
import { APP_VERSION } from "./version";
export const ui = {
  home: b("Overview", "الرئيسية"),
  tools: b("Calculators", "الحاسبات"),
  network: b("Reaction network", "شبكة التفاعلات"),
  process: b("Process flow", "تدفق العملية"),
  science: b("Methods & sources", "المنهجية والمراجع"),
  menu: b("Open navigation", "فتح التنقل"),
  close: b("Close", "إغلاق"),
  dark: b("Switch theme", "تبديل المظهر"),
  tagline: b("REACTION ENGINEERING BLUEPRINT", "مخطط هندسة التفاعلات"),
  heroSubtitle: b(
    "Explore Industrial Halogenation & Chloromethane Chemistry",
    "استكشف الهلجنة الصناعية وكيمياء الكلوروميثانات",
  ),
  heroText: b(
    "20 interactive scientific calculators for methane chlorination, chloromethane product distribution, reaction stoichiometry, thermal analysis, and process mass balances.",
    "20 حاسبة علمية تفاعلية لكلورة الميثان، وتوزيع منتجات الكلوروميثان، وستوكيومترية التفاعلات، والتحليل الحراري، وموازنات المادة.",
  ),
  openLab: b("Open integrated laboratory", "افتح المختبر المتكامل"),
  explore: b("Explore all calculators", "استكشف الحاسبات"),
  reactionPlate: b(
    "CHLORINATION / REACTION NETWORK",
    "الكلورة / شبكة التفاعلات",
  ),
  plateHint: b(
    "Select a reaction to inspect its balanced chemistry.",
    "اختر تفاعلًا لعرض معادلته الموزونة.",
  ),
  educational: b(
    "Educational analysis · Fixed extents · Transparent equations",
    "تحليل تعليمي · امتدادات محددة · معادلات قابلة للمراجعة",
  ),
  scope: b(
    "Educational calculations require independent engineering assessment before any industrial use. No operating recommendations are generated.",
    "تحتاج الحسابات التعليمية إلى تقييم هندسي مستقل قبل أي استخدام صناعي. لا يقدّم التطبيق توصيات تشغيلية.",
  ),
  toolkit: b("Calculation toolkit", "مجموعة أدوات الحساب"),
  toolkitText: b(
    "Follow a material stream from the first mole of feed to the final product account.",
    "تتبّع تيار المادة من أول مول في التغذية حتى موازنة المنتجات النهائية.",
  ),
  all: b("All tools", "كل الأدوات"),
  search: b("Find a calculator…", "ابحث عن حاسبة…"),
  noResults: b(
    "No calculators match your search.",
    "لا توجد حاسبات تطابق البحث.",
  ),
  open: b("Open calculator", "افتح الحاسبة"),
  featured: b("THE COMPLETE WORKBENCH", "منصة الحساب المتكاملة"),
  featuredText: b(
    "One calculation. Every component accounted for.",
    "حساب واحد يراجع كل مكوّن.",
  ),
  featuredBody: b(
    "Connect four reaction extents to material balances, product fractions, reference heat and recovery. Review every equation and export your result.",
    "اربط امتدادات التفاعلات الأربعة بموازنات المادة وكسور المنتجات والحرارة المرجعية والاسترجاع. راجع كل معادلة وصدّر النتائج.",
  ),
  workbench: b("ENGINEERING CALCULATION WORKBENCH", "منصة الحسابات الهندسية"),
  overview: b("Scientific overview", "نظرة علمية"),
  inputs: b("Input parameters", "معلمات الإدخال"),
  unit: b("Feed and product input unit", "وحدة إدخال التغذية والمنتجات"),
  unitNote: b(
    "Extents stay molar. Changing units converts entered amounts. Switching amount ↔ hourly flow reinterprets the basis; it does not apply a duration.",
    "تظل الامتدادات مولية. يغيّر تبديل الوحدات قيم الكميات بما يكافئها. التبديل بين الكمية والتدفق بالساعة يغيّر تفسير الأساس دون تطبيق مدة زمنية.",
  ),
  fractionNote: b(
    "Fractions use 0–1 (for example 0.8 = 80%).",
    "تُدخل الكسور من 0 إلى 1 (مثلًا 0.8 = 80%).",
  ),
  calculate: b("Calculate balance", "احسب النتائج"),
  example: b("Load example", "تحميل مثال"),
  clear: b("Clear inputs", "مسح المدخلات"),
  equation: b("Governing equation", "المعادلة الأساسية"),
  results: b("Calculation results", "نتائج الحساب"),
  exampleBadge: b("Worked example", "مثال محلول"),
  calculatedBadge: b(
    "Calculated from entered data",
    "محسوب من البيانات المدخلة",
  ),
  steps: b("Step-by-step solution", "خطوات الحل"),
  interpretation: b("Scientific interpretation", "التفسير العلمي"),
  assumptions: b("Model and assumptions", "النموذج والافتراضات"),
  references: b("References", "المراجع"),
  exports: b("Export result", "تصدير النتائج"),
  csv: b("CSV tables", "جداول CSV"),
  json: b("JSON case", "حالة JSON"),
  print: b("PDF / print report", "تقرير PDF / طباعة"),
  html: b("HTML report", "تقرير HTML"),
  import: b("Import case", "استيراد حالة"),
  imported: b(
    "Case imported. Review the inputs and calculate.",
    "تم استيراد الحالة. راجع المدخلات ثم احسب.",
  ),
  invalidImport: b(
    "Invalid case file. Import a Halogenation Lab v1 JSON case under 1 MB.",
    "ملف حالة غير صحيح. استخدم ملف JSON صادرًا من Halogenation Lab v1 وحجمه أقل من 1 MB.",
  ),
  dirty: b(
    "Inputs changed. Calculate to update the results and exports.",
    "تغيّرت المدخلات. اضغط احسب لتحديث النتائج والتصدير.",
  ),
  emptyResult: b(
    "Enter your parameters, then calculate.",
    "أدخل المعلمات ثم اضغط احسب.",
  ),
  errorTitle: b("Please review the inputs", "راجع المدخلات"),
  thermalData: b("Thermochemical data", "البيانات الكيميائية الحرارية"),
  standardData: b(
    "Gas-phase data at 298.15 K · NIST-JANAF, Chase (1998). View values and sources in Methods.",
    "بيانات غازية عند 298.15 K · NIST-JANAF، Chase (1998). القيم والمصادر متاحة في المنهجية.",
  ),
  source: b("Data source", "مصدر البيانات"),
  phase: b("Gas reference state", "الحالة المرجعية الغازية"),
  chart: b("Visualization", "الرسم البياني"),
  undefined: b("Undefined", "غير معرّف"),
  submitted: b("Submitted input snapshot", "نسخة المدخلات المستخدمة"),
  generated: b("Generated locally in your browser", "أُنشئ محليًا في متصفحك"),
  privacy: b(
    "All calculations run in your browser. Inputs are not sent to a server.",
    "تُجرى الحسابات في متصفحك، ولا تُرسل المدخلات إلى خادم.",
  ),
  version: b(`Version ${APP_VERSION}`, `الإصدار ${APP_VERSION}`),
  back: b("Back to tools", "العودة للأدوات"),
  methodsTitle: b("Every result has a method.", "لكل نتيجة منهج واضح."),
  methodsDesc: b(
    "Inspect the reaction network, data provenance and the limits of each model.",
    "راجع شبكة التفاعلات ومصادر البيانات وحدود كل نموذج.",
  ),
  lecture: b("Lecture review and corrections", "مراجعة المحاضرة وتصحيحاتها"),
  lectureIntro: b(
    "All 32 slides of “Halogenation Process”, Dr. Ghada Kadry, were reviewed, including image-only process diagrams. The lecture provides context; it is not a calibrated process model. The original deck is not redistributed.",
    "تمت مراجعة شرائح محاضرة «Halogenation Process» للدكتورة غادة قدري وعددها 32 شريحة، بما فيها مخططات العملية المصوّرة. المحاضرة سياق تعليمي وليست نموذج عملية معايرًا. لا يُعاد توزيع العرض الأصلي.",
  ),
  dataTitle: b("Reference property register", "سجل الخواص المرجعية"),
  dataDesc: b(
    "Conventional atomic weights: C 12.011, H 1.008, Cl 35.45, N 14.007. Molecular weights are derived consistently from these values. Thermochemical values follow a single documented Chase 1998 dataset.",
    "الأوزان الذرية التقريبية المستخدمة: C 12.011 وH 1.008 وCl 35.45 وN 14.007. تُشتق الكتل المولية باتساق من هذه القيم. تتبع القيم الحرارية مجموعة بيانات موثقة من Chase 1998.",
  ),
  molecules: b("Molecular connectivity", "الاتصال الجزيئي"),
  moleculeNote: b(
    "Original 2D connectivity drawings. Each carbon has four single bonds; these are not 3D conformational models.",
    "رسومات اتصال ثنائية الأبعاد أصلية. لكل كربون أربع روابط أحادية؛ لا تمثل الرسومات نماذج بنية ثلاثية الأبعاد.",
  ),
  processTitle: b(
    "A material stream, made visible.",
    "تيار المادة بصورة واضحة.",
  ),
  processDesc: b(
    "Select a block to inspect the supported calculation. This is an educational flow diagram with prescribed extents and splits.",
    "اختر وحدة لعرض الحساب المرتبط بها. المخطط تعليمي بامتدادات تفاعل ومعاملات فصل محددة.",
  ),
  reactionTitle: b(
    "Four substitutions. One carbon backbone.",
    "أربع خطوات استبدال مع حفظ ذرة الكربون.",
  ),
  reactionDesc: b(
    "Each step replaces one C–H bond with C–Cl, consuming one Cl₂ and forming one HCl.",
    "تستبدل كل خطوة رابطة C–H برابطة C–Cl، وتستهلك Cl₂ واحدًا وتكوّن HCl واحدًا.",
  ),
  related: b("Related calculators", "الحاسبات المرتبطة"),
  inputStage: b("Feed streams", "تيارات التغذية"),
  reactionStage: b("Reaction stages", "مراحل التفاعل"),
  mixtureStage: b("Product mixture", "مزيج المنتجات"),
  recoveryStage: b("Specified recovery", "استرجاع محدد"),
  productStage: b("Recovered products", "المنتجات المسترجعة"),
  otherGases: b("Other gases", "الغازات الأخرى"),
  plotNote: b(
    "Charts use the current calculated data. The tables provide exact values.",
    "تستخدم الرسوم بيانات الحساب الحالي. الجداول تعرض القيم العددية.",
  ),
  mainUnit: b("Unit", "الوحدة"),
  value: b("Value", "القيمة"),
  calculator: b("Calculator", "الحاسبة"),
  dataSaved: b(
    "Preferences and cases are stored only on this device.",
    "تُحفظ التفضيلات والحالات على هذا الجهاز فقط.",
  ),
};
export const errors: Record<ErrorCode, ReturnType<typeof b>> = {
  number: b(
    "Enter a finite numeric value in every required field.",
    "أدخل رقمًا محدودًا في كل حقل مطلوب.",
  ),
  negative: b(
    "Amounts and reaction extents cannot be negative.",
    "لا يمكن أن تكون الكميات أو امتدادات التفاعل سالبة.",
  ),
  range: b(
    "A value is outside its permitted range. Fractions must be 0–1.",
    "توجد قيمة خارج المجال المسموح. يجب أن تكون الكسور من 0 إلى 1.",
  ),
  empty: b(
    "The requested ratio or model needs a nonzero feed, total, conversion or selectivity.",
    "تحتاج النسبة أو النموذج المطلوب إلى تغذية أو مجموع أو تحويل أو انتقائية لا تساوي صفرًا.",
  ),
  overdraw: b(
    "The extents consume more material than is available. Review methane, chlorine and intermediate balances.",
    "تستهلك الامتدادات مادة أكبر من المتاح. راجع أرصدة الميثان والكلور والمركبات الوسيطة.",
  ),
  reaction: b(
    "Choose a valid reaction, reactant or product.",
    "اختر تفاعلًا أو متفاعلًا أو منتجًا صحيحًا.",
  ),
  unit: b("Choose a supported unit.", "اختر وحدة مدعومة."),
  thermalRange: b(
    "The thermochemical model supports 298.15–1000 K only.",
    "يدعم النموذج الحراري المجال 298.15–1000 K فقط.",
  ),
  root: b(
    "No adiabatic solution lies within 298.15–1000 K for these inputs. The model will not extrapolate.",
    "لا يوجد حل أدياباتي داخل 298.15–1000 K لهذه المدخلات. لا يستقرئ النموذج خارج المجال.",
  ),
  source: b(
    "Provide the source, physical state and justification for custom thermochemical data.",
    "أدخل مصدر البيانات الحرارية المخصصة وحالتها الفيزيائية ومبرر استخدامها.",
  ),
  stage: b(
    "A stage consumes more material than its inlet supplies.",
    "تستهلك إحدى المراحل كمية أكبر مما توفره تغذيتها.",
  ),
  yield: b(
    "Actual product exceeds its stoichiometric theoretical maximum.",
    "يتجاوز الإنتاج الفعلي الحد النظري الستوكيومتري.",
  ),
  conversion: b(
    "Reactant outlet cannot exceed its inlet in this conversion account.",
    "لا يمكن أن يتجاوز خروج المتفاعل دخوله في حساب التحويل هذا.",
  ),
  unknown: b(
    "The calculation could not be completed. Review the inputs.",
    "تعذّر إكمال الحساب. راجع المدخلات.",
  ),
};
