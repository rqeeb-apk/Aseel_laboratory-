/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - University Curriculum Experiments
 */

import { LabExperiment } from '../types/circuit';

export const CURRICULUM_EXPERIMENTS: LabExperiment[] = [
  {
    id: 'exp_ohm',
    number: 1,
    title: 'تحقيق قانون أوم (Ohm’s Law)',
    subtitle: 'العلاقة الخطية بين الجهد والتيار والمقاومة الكهربائية',
    category: 'أساسيات الدوائر',
    difficulty: 'مبتدئ',
    theory:
      'ينص قانون أوم على أن شدة التيار الكهربائي (I) المار في موصل تتناسب طردياً مع فرق الجهد (V) المطبق بين طرفيه وعكسياً مع مقاومته الكهربائية (R) عند ثبوت درجة الحرارة.\n\nتعتبر هذه التجربة حجر الأساس لجميع مهندسي الميكاترونكس والإلكترونيات لفهم حسابات الحمل والقدرة واختيار المكونات المناسبة.',
    equations: ['V = I \\times R', 'I = \\frac{V}{R}', 'P = V \\times I = I^2 \\times R'],
    requiredComponents: [
      { type: 'dc_source', count: 1, name: 'مصدر تيار مستمر (9V)' },
      { type: 'resistor', count: 1, name: 'مقاومة كربونية (1kΩ)' },
      { type: 'ammeter', count: 1, name: 'أميتر رقمي' },
      { type: 'voltmeter', count: 1, name: 'فولتميتر رقمي' },
      { type: 'ground', count: 1, name: 'أرضي مرجعي (GND)' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'ضع مصدر جهد مستمر (بطارية) واضبط قيمتها على 9V.',
        verificationTip: 'تحقق من القطبية الموجبة والسالبة للمصدر.',
      },
      {
        stepNumber: 2,
        instruction: 'وصّل القطب الموجب للبطارية بالطرف الموجب للأميتر الرقمي (لقياس التيار على التوالي).',
        verificationTip: 'الأميتر يوصل دائماً على التوالي في المسار.',
      },
      {
        stepNumber: 3,
        instruction: 'وصّل الطرف السالب للأميتر بأحد أطراف المقاومة R1 (1000Ω).',
        verificationTip: 'تأكد من أن قيمة المقاومة 1kΩ (كود الألوان: بني - أسود - أحمر).',
      },
      {
        stepNumber: 4,
        instruction: 'أغلق الدائرة بتوصيل الطرف الثاني للمقاومة بالقطب السالب للبطارية والأرضي GND.',
        verificationTip: 'تأكد من اكتمال المسار المغلق.',
      },
      {
        stepNumber: 5,
        instruction: 'وصّل الفولتميتر على التوازي عبر طرفي المقاومة R1 وشغّل المحاكاة.',
        verificationTip: 'يجب أن يقرأ الأميتر 9.00 mA والفولتميتر 9.00 V.',
      },
    ],
    expectedResults: [
      { parameter: 'الجهد المقاس (V)', formula: 'V = 9.0 V', expectedValue: '9.00 V' },
      { parameter: 'التيار المار (I)', formula: 'I = 9V / 1000Ω', expectedValue: '9.00 mA' },
      { parameter: 'القدرة المبددة (P)', formula: 'P = V × I', expectedValue: '81.0 mW' },
    ],
    quiz: [
      {
        question: 'إذا ضاعفنا قيمة الجهد من 9V إلى 18V مع ثبات المقاومة عند 1kΩ، فماذا يحدث للتيار؟',
        options: ['يتضاعف التيار إلى 18 mA', 'ينخفض التيار إلى 4.5 mA', 'يبقى التيار ثابتاً', 'يصبح التيار صفراً'],
        correctIndex: 0,
        explanation: 'وفق قانون أوم I = V / R، التناسب بين التيار والجهد طردي مباشر عند ثبات المقاومة.',
      },
      {
        question: 'لماذا يوصل الأميتر دائماً على التوالي بينما يوصل الفولتميتر على التوازي؟',
        options: [
          'لأن الأميتر ذو مقاومة داخلية صغيرة جداً بينما الفولتميتر ذو مقاومة عالية جداً',
          'لأن الأميتر يقيس الجهد والفولتميتر يقيس التيار',
          'لتجنب احتراق الأسلاك فقط',
          'لا يوجد فرق في طريقة التوصيل',
        ],
        correctIndex: 0,
        explanation: 'المقاومة الداخلية الصغيرة للأميتر تمنع هبوط الجهد عليه، بينما المقاومة العالية للفولتميتر تمنع سحب تيار من الدائرة.',
      },
    ],
    circuitTemplate: {
      elements: [
        { id: 'v1', type: 'dc_source', x: 120, y: 160, rotation: 0, label: 'V1', value: 9, unit: 'V', properties: { voltage: 9 } },
        { id: 'amm1', type: 'ammeter', x: 280, y: 100, rotation: 0, label: 'A1', value: 0, unit: 'mA', properties: { reading: 9 } },
        { id: 'r1', type: 'resistor', x: 440, y: 160, rotation: 90, label: 'R1', value: 1000, unit: 'Ω', properties: { resistance: 1000 } },
        { id: 'vm1', type: 'voltmeter', x: 560, y: 160, rotation: 90, label: 'VM1', value: 0, unit: 'V', properties: { reading: 9 } },
        { id: 'gnd1', type: 'ground', x: 120, y: 260, rotation: 0, label: 'GND', value: 0, unit: 'V', properties: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v1', fromPinId: 'pos', toComponentId: 'amm1', toPinId: 'in' },
        { id: 'w2', fromComponentId: 'amm1', fromPinId: 'out', toComponentId: 'r1', toPinId: 'p1' },
        { id: 'w3', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'v1', toPinId: 'neg' },
        { id: 'w4', fromComponentId: 'v1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
        { id: 'w5', fromComponentId: 'r1', fromPinId: 'p1', toComponentId: 'vm1', toPinId: 'pos' },
        { id: 'w6', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'vm1', toPinId: 'neg' },
      ],
    },
  },

  {
    id: 'exp_voltage_divider',
    number: 2,
    title: 'مجزئ الجهد وقراءة الحساسات (Voltage Divider)',
    subtitle: 'تحويل تغير المقاومة إلى تغير في الجهد لقراءة الحساسات في الميكاترونكس',
    category: 'دوائر الحساسات',
    difficulty: 'مبتدئ',
    theory:
      'تعتمد معظم حساسات الميكاترونكس التناظرية (مثل حساسات الضوء LDR، حساسات الحرارة NTC، وأجهزة قياس الانفعال) على تغير مقاومتها الكهربائية. وبما أن المتحكمات الدقيقة مثل Arduino أو ESP32 تقيس جهداً وليس مقاومة، نستخدم دارة مجزئ الجهد لتحويل التغير في المقاومة إلى إشارة جهد تناظرية قابلة للقراءة.',
    equations: ['V_{out} = V_{in} \\times \\frac{R_2}{R_1 + R_2}'],
    requiredComponents: [
      { type: 'dc_source', count: 1, name: 'مصدر تغذية (5V)' },
      { type: 'resistor', count: 1, name: 'مقاومة ثابتة (10kΩ)' },
      { type: 'ldr', count: 1, name: 'مقاومة ضوئية LDR' },
      { type: 'voltmeter', count: 1, name: 'فولتميتر لقياس Vout' },
      { type: 'ground', count: 1, name: 'أرضي GND' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'وصّل مصدر جهد 5V بالأرضي لتوفير خط التغذية القياسي.',
        verificationTip: 'تحقق من ثبات الجهد عند 5V.',
      },
      {
        stepNumber: 2,
        instruction: 'وصّل المقاومة الثابتة R1 (10kΩ) بالقطب الموجب 5V.',
        verificationTip: 'المقاومة R1 تعمل كمقاومة سحب (Pull-up).',
      },
      {
        stepNumber: 3,
        instruction: 'وصّل الطرف السفلي لـ R1 بالطرف العلوي للحساس الضوئي LDR (هذه نقطة الخرج Vout).',
        verificationTip: 'هذه النقطة تمثل مدخل الـ ADC في مشاريع الميكاترونكس.',
      },
      {
        stepNumber: 4,
        instruction: 'وصّل الطرف الآخر للـ LDR بالأرضي GND.',
        verificationTip: 'اكتمل مسار مجزئ الجهد.',
      },
      {
        stepNumber: 5,
        instruction: 'وصّل الفولتميتر بين نقطة Vout والأرضي، وغيّر شدة الإضاءة على الحساس لرؤية تغير الجهد.',
        verificationTip: 'عند زيادة الضوء تنخفض مقاومة LDR فينخفض Vout نحو 0.5V.',
      },
    ],
    expectedResults: [
      { parameter: 'جهد الخرج في الظلام', formula: 'LDR ≈ 100kΩ', expectedValue: '4.55 V' },
      { parameter: 'جهد الخرج في الإضاءة المتوسطة', formula: 'LDR ≈ 10kΩ', expectedValue: '2.50 V' },
      { parameter: 'جهد الخرج في الضوء الساطع', formula: 'LDR ≈ 1kΩ', expectedValue: '0.45 V' },
    ],
    quiz: [
      {
        question: 'في دارة مجزئ الجهد، إذا كانت R1 = 10kΩ و R2 = 10kΩ ومصدر الدخل 10V، فما قيمة Vout؟',
        options: ['5.0 V', '10.0 V', '2.5 V', '0.0 V'],
        correctIndex: 0,
        explanation: 'عندما تتساوى المقاومتان يقسم الجهد بالتساوي: 10V × (10 / (10 + 10)) = 5V.',
      },
    ],
    circuitTemplate: {
      elements: [
        { id: 'v1', type: 'dc_source', x: 120, y: 160, rotation: 0, label: 'V_IN', value: 5, unit: 'V', properties: { voltage: 5 } },
        { id: 'r1', type: 'resistor', x: 300, y: 120, rotation: 90, label: 'R1 (10k)', value: 10000, unit: 'Ω', properties: { resistance: 10000 } },
        { id: 'ldr1', type: 'ldr', x: 300, y: 220, rotation: 90, label: 'LDR', value: 10, unit: 'kΩ', properties: { lightLevel: 50 } },
        { id: 'vm1', type: 'voltmeter', x: 460, y: 180, rotation: 0, label: 'V_OUT', value: 0, unit: 'V', properties: { reading: 2.5 } },
        { id: 'gnd1', type: 'ground', x: 120, y: 260, rotation: 0, label: 'GND', value: 0, unit: 'V', properties: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v1', fromPinId: 'pos', toComponentId: 'r1', toPinId: 'p1' },
        { id: 'w2', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'ldr1', toPinId: 'p1' },
        { id: 'w3', fromComponentId: 'ldr1', fromPinId: 'p2', toComponentId: 'v1', toPinId: 'neg' },
        { id: 'w4', fromComponentId: 'v1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
        { id: 'w5', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'vm1', toPinId: 'pos' },
        { id: 'w6', fromComponentId: 'v1', fromPinId: 'neg', toComponentId: 'vm1', toPinId: 'neg' },
      ],
    },
  },

  {
    id: 'exp_led_diode',
    number: 3,
    title: 'الدايود المشع (LED) ومقاومة الحماية',
    subtitle: 'الانحياز الأمامي والعكسي وحساب مقاومة حماية الدايود الضوئي',
    category: 'أشباه الموصلات',
    difficulty: 'مبتدئ',
    theory:
      'الدايود الضوئي (LED) عنصر شبه موصل يسمح بمرور التيار في اتجاه واحد فقط (الانحياز الأمامي). يتميز بانخفاض جهد أمامي مميز (حوالي 2.0V للدايود الأحمر) ويجب دائماً وضع مقاومة حماية على التوالي للحد من التيار ومنع احتراقه.',
    equations: ['R_{limit} = \\frac{V_s - V_{LED}}{I_{LED}}', 'P_{resistor} = I_{LED}^2 \\times R_{limit}'],
    requiredComponents: [
      { type: 'dc_source', count: 1, name: 'بطارية (9V)' },
      { type: 'spst_switch', count: 1, name: 'مفتاح تشغيل' },
      { type: 'resistor', count: 1, name: 'مقاومة حماية (350Ω - 470Ω)' },
      { type: 'led', count: 1, name: 'دايود ضوئي LED أحمر' },
      { type: 'ammeter', count: 1, name: 'أميتر لقياس تيار الـ LED' },
      { type: 'ground', count: 1, name: 'أرضي GND' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'وصّل القطب الموجب لمصدر 9V بمفتاح التشغيل SPST.',
        verificationTip: 'المفتاح يسمح بالتحكم في فتح وإغلاق الدائرة.',
      },
      {
        stepNumber: 2,
        instruction: 'وصّل الخرج من المفتاح بمقاومة الحماية R1 (350Ω).',
        verificationTip: 'حساب المقاومة: (9V - 2V) / 0.02A = 350Ω.',
      },
      {
        stepNumber: 3,
        instruction: 'وصّل المقاومة بمدخل الأميتر، ثم خرجه بمصعد الـ LED (الأنود +).',
        verificationTip: 'تأكد من توصيل الأنود بالجهة الموجبة.',
      },
      {
        stepNumber: 4,
        instruction: 'وصّل مهبط الـ LED (الكاثود -) بالقطب السالب للبطارية والأرضي.',
        verificationTip: 'اكتملت دائرة الـ LED.',
      },
      {
        stepNumber: 5,
        instruction: 'شغّل المحاكاة واضغط المفتاح لمشاهدة إضاءة الـ LED وقراءة تيار ~20 mA.',
        verificationTip: 'جرب عكس أطراف الـ LED لملاحظة انقطاع التيار (انحياز عكسي).',
      },
    ],
    expectedResults: [
      { parameter: 'انخفاض جهد الـ LED', formula: 'V_f (Red LED)', expectedValue: '2.00 V' },
      { parameter: 'التيار المار في الـ LED', formula: '(9V - 2V) / 350Ω', expectedValue: '20.0 mA' },
      { parameter: 'حالة الإضاءة', formula: 'I > 5mA', expectedValue: 'مضيء (Bright)' },
    ],
    quiz: [
      {
        question: 'ماذا يحدث إذا تم توصيل LED مباشرة ببطارية 9V بدون مقاومة حماية؟',
        options: [
          'يمر تيار مفرط يؤدي لاحتراق وتلف الـ LED فورياً',
          'يضيء الـ LED بشكل طبيعي',
          'لا يضيء إطلاقاً',
          'يفرغ البطارية دون أن يتأثر',
        ],
        correctIndex: 0,
        explanation: 'الدايود ذو مقاومة ديناميكية صغيرة جداً بعد جهد العتبة، فبدون مقاومة حماية يسحب تياراً هائلاً يؤدي لاحتراقه.',
      },
    ],
    circuitTemplate: {
      elements: [
        { id: 'v1', type: 'dc_source', x: 100, y: 160, rotation: 0, label: 'BAT (9V)', value: 9, unit: 'V', properties: { voltage: 9 } },
        { id: 'sw1', type: 'spst_switch', x: 230, y: 100, rotation: 0, label: 'SW1', value: 0, unit: '', properties: { closed: true } },
        { id: 'r1', type: 'resistor', x: 370, y: 100, rotation: 0, label: 'R_LIMIT', value: 350, unit: 'Ω', properties: { resistance: 350 } },
        { id: 'amm1', type: 'ammeter', x: 500, y: 100, rotation: 0, label: 'A1', value: 0, unit: 'mA', properties: { reading: 20 } },
        { id: 'led1', type: 'led', x: 500, y: 220, rotation: 90, label: 'LED Red', value: 2, unit: 'V', properties: { color: 'red', forwardDrop: 2.0, isLit: true } },
        { id: 'gnd1', type: 'ground', x: 100, y: 260, rotation: 0, label: 'GND', value: 0, unit: 'V', properties: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v1', fromPinId: 'pos', toComponentId: 'sw1', toPinId: 'p1' },
        { id: 'w2', fromComponentId: 'sw1', fromPinId: 'p2', toComponentId: 'r1', toPinId: 'p1' },
        { id: 'w3', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'amm1', toPinId: 'in' },
        { id: 'w4', fromComponentId: 'amm1', fromPinId: 'out', toComponentId: 'led1', toPinId: 'anode' },
        { id: 'w5', fromComponentId: 'led1', fromPinId: 'cathode', toComponentId: 'v1', toPinId: 'neg' },
        { id: 'w6', fromComponentId: 'v1', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
      ],
    },
  },

  {
    id: 'exp_bjt_motor',
    number: 4,
    title: 'الترانزستور كمفتاح لقيادة محرك كهربائي (BJT Transistor Switch)',
    subtitle: 'استخدام إشارة تحكم صغيرة للتحكم في أحمال القدرة والمحركات في الميكاترونكس',
    category: 'مشغلات ميكاترونكس',
    difficulty: 'متوسط',
    theory:
      'في أنظمة الميكاترونكس، لا تستطيع منافذ المتحكمات الدقيقة (مثل الأردوينو) توفير التيار الكافي لتشغيل المحركات أو الريلاي مباشرة (التي تسحب 200mA إلى عدة أمبيرات بينما المنفذ يوفر 20mA كحد أقصى). لذلك نستخدم الترانزستور ثنائي القطبية (BJT) أو الموسفت (MOSFET) كمفتاح كهربائي صلب (Solid State Switch) يتم تفعيله بتيار قاعدة ضئيل.',
    equations: [
      'I_B = \\frac{V_{control} - V_{BE}}{R_B}',
      'I_C = \\beta \\times I_B \\quad (في المنطقة الفعالة)',
      'V_{CE(sat)} \\approx 0.2V \\quad (في حالة التشبع)',
    ],
    requiredComponents: [
      { type: 'dc_source', count: 1, name: 'مصدر قدرة للمحرك (9V)' },
      { type: 'vcc', count: 1, name: 'إشارة تحكم المنطق (+5V)' },
      { type: 'spst_switch', count: 1, name: 'مفتاح التحكم' },
      { type: 'resistor', count: 1, name: 'مقاومة قاعدة (1kΩ)' },
      { type: 'transistor_npn', count: 1, name: 'ترانزستور NPN (BC547)' },
      { type: 'dc_motor', count: 1, name: 'محرك تيار مستمر DC Motor' },
      { type: 'ground', count: 1, name: 'أرضي مشترك GND' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'وصّل باعث الترانزستور (Emitter) بالأرضي المشترك GND.',
        verificationTip: 'دائرة باعث مشترك Common Emitter.',
      },
      {
        stepNumber: 2,
        instruction: 'وصّل مجمع الترانزستور (Collector) بالطرف السالب للمحرك الكهربائي.',
        verificationTip: 'المحرك يمثل حمل المجمع Collector Load.',
      },
      {
        stepNumber: 3,
        instruction: 'وصّل الطرف الموجب للمحرك بمصدر القدرة 9V.',
        verificationTip: 'المحرك يحصل على طاقته من مصدر القدرة المنفصل.',
      },
      {
        stepNumber: 4,
        instruction: 'وصّل قاعدة الترانزستور بمقاومة 1kΩ عبر مفتاح متصل بإشارة التحكم 5V.',
        verificationTip: 'مقاومة القاعدة تحمي وصلة Base-Emitter من التيار المفرط.',
      },
      {
        stepNumber: 5,
        instruction: 'شغّل المحاكاة وأغلق المفتاح؛ لاحظ دوران المحرك وظهور مؤشر السرعة RPM!',
        verificationTip: 'تيار القاعدة الصغير سمح بمرور تيار المجمع الكبير لتشغيل المحرك.',
      },
    ],
    expectedResults: [
      { parameter: 'جهد V_BE للترانزستور', formula: 'Silicon B-E Junction', expectedValue: '0.65 V - 0.70 V' },
      { parameter: 'تيار القاعدة I_B', formula: '(5V - 0.7V) / 1000Ω', expectedValue: '4.30 mA' },
      { parameter: 'سرعة دوران المحرك', formula: '9V Applied', expectedValue: '~2800 RPM' },
    ],
    quiz: [
      {
        question: 'ما هي وظيفة دايود الحماية العكسية (Flyback Diode) الذي يوضع بالتوازي مع ملف المحرك أو الريلاي؟',
        options: [
          'تفريغ القوة الدافعة الكهربائية العكسية (Back-EMF) وحماية الترانزستور من الاحتراق عند فصل التيار',
          'زيادة سرعة دوران المحرك للضعف',
          'تقليل استهلاك البطارية',
          'تحويل التيار من مستمر إلى متردد',
        ],
        correctIndex: 0,
        explanation: 'الملفات تخزن طاقة مغناطيسية، وعند فصل التيار فجأة يتولد جهد عكسي هائل يفرغه دايود الحماية بأمان.',
      },
    ],
    circuitTemplate: {
      elements: [
        { id: 'v_motor', type: 'dc_source', x: 100, y: 120, rotation: 0, label: 'PWR (9V)', value: 9, unit: 'V', properties: { voltage: 9 } },
        { id: 'v_ctrl', type: 'vcc', x: 100, y: 220, rotation: 0, label: 'V_IN (+5V)', value: 5, unit: 'V', properties: { voltage: 5 } },
        { id: 'sw1', type: 'spst_switch', x: 220, y: 220, rotation: 0, label: 'CTRL_SW', value: 0, unit: '', properties: { closed: true } },
        { id: 'rb', type: 'resistor', x: 340, y: 220, rotation: 0, label: 'R_B (1k)', value: 1000, unit: 'Ω', properties: { resistance: 1000 } },
        { id: 'q1', type: 'transistor_npn', x: 440, y: 220, rotation: 0, label: 'Q1 (BC547)', value: 150, unit: 'hFE', properties: { beta: 150 } },
        { id: 'm1', type: 'dc_motor', x: 440, y: 100, rotation: 0, label: 'DC Motor', value: 9, unit: 'V', properties: { rpm: 2800, isRunning: true } },
        { id: 'gnd1', type: 'ground', x: 100, y: 300, rotation: 0, label: 'GND', value: 0, unit: 'V', properties: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'v_motor', fromPinId: 'pos', toComponentId: 'm1', toPinId: 'p1' },
        { id: 'w2', fromComponentId: 'm1', fromPinId: 'p2', toComponentId: 'q1', toPinId: 'collector' },
        { id: 'w3', fromComponentId: 'v_ctrl', fromPinId: 'out', toComponentId: 'sw1', toPinId: 'p1' },
        { id: 'w4', fromComponentId: 'sw1', fromPinId: 'p2', toComponentId: 'rb', toPinId: 'p1' },
        { id: 'w5', fromComponentId: 'rb', fromPinId: 'p2', toComponentId: 'q1', toPinId: 'base' },
        { id: 'w6', fromComponentId: 'q1', fromPinId: 'emitter', toComponentId: 'v_motor', toPinId: 'neg' },
        { id: 'w7', fromComponentId: 'v_motor', fromPinId: 'neg', toComponentId: 'gnd1', toPinId: 'gnd' },
      ],
    },
  },

  {
    id: 'exp_logic_gates',
    number: 5,
    title: 'البوابات المنطقية وجدول الحقيقة (Logic Gates & Truth Table)',
    subtitle: 'بناء واختبار الدوائر الرقمية الأساسية AND و OR و NOT',
    category: 'الإلكترونيات الرقمية',
    difficulty: 'متوسط',
    theory:
      'البوابات المنطقية هي اللبنات الأساسية لجميع المعالجات والمتحكمات الرقمية. تقوم بمعالجة مستويات الجهد الثنائية (High = 5V و Low = 0V) وفق قواعد الجبر البوليني (Boolean Algebra).',
    equations: ['Q_{AND} = A \\cdot B', 'Q_{OR} = A + B', 'Q_{NOT} = \\overline{A}'],
    requiredComponents: [
      { type: 'vcc', count: 1, name: 'قضيب تغذية (+5V)' },
      { type: 'spst_switch', count: 2, name: 'مفاتيح للمدخلات A و B' },
      { type: 'and_gate', count: 1, name: 'بوابة AND' },
      { type: 'resistor', count: 1, name: 'مقاومة حماية (330Ω)' },
      { type: 'led', count: 1, name: 'دايود ضوئي LED لمؤشر الخرج' },
      { type: 'ground', count: 1, name: 'أرضي GND' },
    ],
    steps: [
      {
        stepNumber: 1,
        instruction: 'وصّل قضيب التغذية +5V بكلا المفتاحين SW_A و SW_B.',
        verificationTip: 'المفاتيح تمثل المدخلات الثنائية 0 و 1.',
      },
      {
        stepNumber: 2,
        instruction: 'وصّل خرج المفتاح الأول بالمدخل in1 لبوابة AND، وخرج المفتاح الثاني بالمدخل in2.',
        verificationTip: 'تأكد من توصيل المدخلين A و B.',
      },
      {
        stepNumber: 3,
        instruction: 'وصّل خرج البوابة out بمقاومة حماية 330Ω على التوالي مع LED أحمر.',
        verificationTip: 'الـ LED يضيء عندما يكون الخرج المنطقي HIGH (5V).',
      },
      {
        stepNumber: 4,
        instruction: 'وصّل مهبط الـ LED بالأرضي GND.',
        verificationTip: 'اكتملت دائرة التحقق المنطقي.',
      },
      {
        stepNumber: 5,
        instruction: 'اختبر حالات جدول الحقيقة الأربع: (0,0), (1,0), (0,1), (1,1) وتحقق من إضاءة الـ LED في حالة (1,1) فقط.',
        verificationTip: 'بوابة AND تتطلب تفعيل كلا المدخلين معاً.',
      },
    ],
    expectedResults: [
      { parameter: 'الدخل A=0, B=0', formula: '0 AND 0', expectedValue: 'Q = 0 (LED مطفأ)' },
      { parameter: 'الدخل A=1, B=0', formula: '1 AND 0', expectedValue: 'Q = 0 (LED مطفأ)' },
      { parameter: 'الدخل A=1, B=1', formula: '1 AND 1', expectedValue: 'Q = 1 (LED مضيء)' },
    ],
    quiz: [
      {
        question: 'ما هي البوابة المنطقية التي تعطي خرجاً HIGH (1) فقط عندما يكون كلا المدخلين مختلفين؟',
        options: ['بوابة XOR (Exclusive OR)', 'بوابة AND', 'بوابة NOR', 'بوابة XNOR'],
        correctIndex: 0,
        explanation: 'بوابة XOR تعطي 1 عند اختلاف المدخلين (0,1 أو 1,0) وتستخدم كأساس لدوائر الجمع النصفي Half Adder.',
      },
    ],
    circuitTemplate: {
      elements: [
        { id: 'vcc1', type: 'vcc', x: 100, y: 160, rotation: 0, label: 'VCC (+5V)', value: 5, unit: 'V', properties: { voltage: 5 } },
        { id: 'sw_a', type: 'spst_switch', x: 220, y: 120, rotation: 0, label: 'SW_A', value: 0, unit: '', properties: { closed: true } },
        { id: 'sw_b', type: 'spst_switch', x: 220, y: 200, rotation: 0, label: 'SW_B', value: 0, unit: '', properties: { closed: true } },
        { id: 'gate1', type: 'and_gate', x: 380, y: 160, rotation: 0, label: 'AND Gate', value: 1, unit: '', properties: {} },
        { id: 'r1', type: 'resistor', x: 500, y: 160, rotation: 0, label: 'R1 (330)', value: 330, unit: 'Ω', properties: { resistance: 330 } },
        { id: 'led1', type: 'led', x: 620, y: 160, rotation: 0, label: 'OUT LED', value: 2, unit: 'V', properties: { color: 'green', isLit: true } },
        { id: 'gnd1', type: 'ground', x: 620, y: 260, rotation: 0, label: 'GND', value: 0, unit: 'V', properties: {} },
      ],
      wires: [
        { id: 'w1', fromComponentId: 'vcc1', fromPinId: 'out', toComponentId: 'sw_a', toPinId: 'p1' },
        { id: 'w2', fromComponentId: 'vcc1', fromPinId: 'out', toComponentId: 'sw_b', toPinId: 'p1' },
        { id: 'w3', fromComponentId: 'sw_a', fromPinId: 'p2', toComponentId: 'gate1', toPinId: 'in1' },
        { id: 'w4', fromComponentId: 'sw_b', fromPinId: 'p2', toComponentId: 'gate1', toPinId: 'in2' },
        { id: 'w5', fromComponentId: 'gate1', fromPinId: 'out', toComponentId: 'r1', toPinId: 'p1' },
        { id: 'w6', fromComponentId: 'r1', fromPinId: 'p2', toComponentId: 'led1', toPinId: 'anode' },
        { id: 'w7', fromComponentId: 'led1', fromPinId: 'cathode', toComponentId: 'gnd1', toPinId: 'gnd' },
      ],
    },
  },
];
