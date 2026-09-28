/* ==========================================================================
   matildefacetdds.com — Default site content (bilingual EN/ES)
   This is the FALLBACK + SEED. The live content is stored in Firestore
   (collection "site", document "config") and edited from the admin panel.
   If Firebase is not configured yet, the site renders from these defaults.
   ========================================================================== */
window.DEFAULT_CONTENT = {
  version: 1,

  /* ---------- Brand ---------- */
  brand: {
    name: "matildefacetdds",
    short: "matildefacetdds",
    doctor: "Matilde E. Facet, DDS",
    tagline_en: "Cosmetic & General Dentistry",
    tagline_es: "Cosmetic & General Dentistry",
    logoText: "matildefacetdds",
    logo: "assets/img/logo.png"
  },

  /* ---------- Theme (editable from the admin panel) ---------- */
  theme: {
    primary: "#0E7C86",
    primaryDark: "#0A5F66",
    primarySoft: "#E6F4F4",
    accent: "#37C2B0",
    ink: "#0A2540"
  },

  /* ---------- Contact ---------- */
  contact: {
    phone: "(301) 593-5477",
    phoneRaw: "+13015935477",
    fax: "(301) 593-5472",
    emergency: "(301) 807-1876",
    emergencyRaw: "+13018071876",
    email: "drfacet@verizon.net",
    whatsapp: "",
    addressLine1: "11161 New Hampshire Ave.",
    addressLine2: "Suite 205",
    city: "Silver Spring",
    state: "MD",
    zip: "20904",
    mapsQuery: "11161 New Hampshire Ave Suite 205, Silver Spring, MD 20904",
    mapsLink: "https://www.google.com/maps/search/?api=1&query=11161+New+Hampshire+Ave+Suite+205+Silver+Spring+MD+20904",
    reviewsLink: ""
  },

  /* ---------- Office hours ---------- */
  hours: [
    { day_en: "Monday – Thursday", day_es: "Lunes – Jueves", time_en: "9:00 am – 4:00 pm", time_es: "9:00 am – 4:00 pm" },
    { day_en: "Friday", day_es: "Viernes", time_en: "9:00 am – 1:00 pm", time_es: "9:00 am – 1:00 pm" },
    { day_en: "Saturday & Sunday", day_es: "Sábado y Domingo", time_en: "Closed", time_es: "Cerrado" }
  ],
  hoursNote_en: "Dr. Facet is in the office on the first Friday of every month.",
  hoursNote_es: "La Dra. Facet atiende el primer viernes de cada mes.",

  /* ---------- Hero carousel ---------- */
  hero: {
    slides: [
      {
        image: "assets/img/hero-2.jpg",
        title_en: "Dentistry that feels calm, personal and unhurried",
        title_es: "Odontología que se siente tranquila, cercana y sin prisas",
        text_en: "Modern general and cosmetic dentistry in Silver Spring, Maryland — with a bilingual team that takes the time to explain every option.",
        text_es: "Odontología general y estética moderna en Silver Spring, Maryland — con un equipo bilingüe que se toma el tiempo de explicarte cada opción."
      },
      {
        image: "assets/img/hero-1.jpg",
        title_en: "A practice built around how you feel",
        title_es: "Un consultorio pensado para cómo te sientes",
        text_en: "From your first phone call to your follow-up visit, everything here is designed to be simple, clear and gentle.",
        text_es: "Desde tu primera llamada hasta tu cita de seguimiento, todo aquí está diseñado para ser simple, claro y cuidadoso."
      },
      {
        image: "assets/img/hero-3.jpg",
        title_en: "Healthy habits, beautiful smiles",
        title_es: "Hábitos saludables, sonrisas hermosas",
        text_en: "Our goal is prevention first: helping you keep your natural teeth healthy for life.",
        text_es: "Nuestra prioridad es la prevención: ayudarte a mantener tus dientes naturales sanos de por vida."
      }
    ]
  },

  /* ---------- Trust stats ---------- */
  stats: [
    { num: "25+", label_en: "Years of practice", label_es: "Años de práctica" },
    { num: "Bilingual", label_en: "English & Spanish team", label_es: "Equipo inglés y español" },
    { num: "UMD", label_en: "DDS, University of Maryland", label_es: "DDS, University of Maryland" },
    { num: "Silver Spring", label_en: "Serving our neighbors since 2012", label_es: "Sirviendo a la comunidad desde 2012" }
  ],

  /* ---------- Services ---------- */
  services: [
    {
      icon: "tooth", group_en: "General & Preventive", group_es: "General y Preventiva",
      title_en: "Exams, Cleanings & Fillings",
      title_es: "Exámenes, Limpiezas y Resinas",
      desc_en: "Routine check-ups, professional cleanings and tooth-coloured fillings that restore decayed teeth while blending in naturally.",
      desc_es: "Revisiones de rutina, limpiezas profesionales y resinas del color del diente que restauran piezas dañadas de forma natural.",
      detail_en: "We remove decayed tooth structure and rebuild the tooth with resin (composite) or amalgam restorations. Most fillings today are tooth-coloured composite, which bonds to the tooth and helps strengthen what remains.",
      detail_es: "Retiramos el tejido dental afectado y reconstruimos la pieza con resina (composite) o amalgama. Hoy se usan mayormente resinas del color del diente, que se adhieren y ayudan a reforzar el diente."
    },
    {
      icon: "sparkle", group_en: "Cosmetic Dentistry", group_es: "Odontología Estética",
      title_en: "Bonding & Veneers",
      title_es: "Bonding y Carillas",
      desc_en: "Repair chips, close small gaps and reshape teeth with bonded resin or ultra-thin custom porcelain veneers.",
      desc_es: "Reparamos fracturas, cerramos espacios y damos forma con resina adherida o carillas de porcelana ultrafinas hechas a medida.",
      detail_en: "Bonding attaches resinous material directly to the enamel. Veneers are ultra-thin custom porcelain laminates bonded to the front of the teeth — an option for gaps or discoloration that whitening can't fix. Depending on the case, some tooth reduction may be needed.",
      detail_es: "El bonding adhiere material resinoso directamente al esmalte. Las carillas son láminas de porcelana ultrafinas hechas a medida y adheridas a la cara frontal del diente — opción para espacios o manchas que el blanqueamiento no corrige. Según el caso, puede requerirse un leve desgaste."
    },
    {
      icon: "smile", group_en: "Cosmetic Dentistry", group_es: "Odontología Estética",
      title_en: "Teeth Whitening",
      title_es: "Blanqueamiento Dental",
      desc_en: "Professional in-office or take-home whitening, supervised by your dentist for safer, more even results.",
      desc_es: "Blanqueamiento profesional en consultorio o para casa, supervisado por tu dentista para resultados más seguros y uniformes.",
      detail_en: "Whitening (tooth bleaching) is the most requested cosmetic procedure. While over-the-counter options exist, dentist-supervised treatment remains the recommended approach for lightening discoloured teeth.",
      detail_es: "El blanqueamiento es el procedimiento estético más solicitado. Aunque existen opciones de venta libre, el tratamiento supervisado por el dentista sigue siendo el recomendado para aclarar dientes decolorados."
    },
    {
      icon: "crown", group_en: "Restorative", group_es: "Restauradora",
      title_en: "Crowns & Bridges",
      title_es: "Coronas y Puentes",
      desc_en: "Custom restorations that rebuild a damaged tooth or replace missing teeth permanently.",
      desc_es: "Restauraciones a medida que reconstruyen una pieza dañada o reemplazan dientes perdidos de forma fija.",
      detail_en: "A crown completely caps or encircles a tooth and is often needed when a large cavity threatens its health. A bridge uses porcelain crowns on both sides to fill the space left by missing teeth — a fixed alternative to a partial denture.",
      detail_es: "Una corona cubre o rodea por completo la pieza y suele ser necesaria cuando una caries grande amenaza su salud. Un puente usa coronas de porcelana a ambos lados para cubrir el espacio de dientes perdidos — alternativa fija a la prótesis parcial."
    },
    {
      icon: "implant", group_en: "Restorative", group_es: "Restauradora",
      title_en: "Dental Implants",
      title_es: "Implantes Dentales",
      desc_en: "A long-term replacement for missing teeth, anchored into the jawbone and finished with a custom crown.",
      desc_es: "Reemplazo duradero para dientes perdidos, anclado en el hueso y terminado con una corona a medida.",
      detail_en: "Implants are placed into the upper or lower jaw as an alternative to partial or complete tooth loss. Once integrated with the bone, they can support crowns, bridges, or attachments for removable and hybrid prostheses.",
      detail_es: "Los implantes se colocan en el maxilar o la mandíbula como alternativa a la pérdida parcial o total de piezas. Una vez integrados al hueso, pueden sostener coronas, puentes o aditamentos para prótesis removibles e híbridas."
    },
    {
      icon: "denture", group_en: "Restorative", group_es: "Restauradora",
      title_en: "Dentures",
      title_es: "Prótesis Dentales",
      desc_en: "Removable prosthetics that restore function and appearance when several or all teeth are missing.",
      desc_es: "Prótesis removibles que devuelven función y estética cuando faltan varias piezas o todas.",
      detail_en: "Dentures are prosthetic devices supported by the surrounding soft and hard tissues. Conventional dentures are removable; other designs rely on bonding or clasping onto teeth or implants.",
      detail_es: "Las prótesis son dispositivos que se apoyan en los tejidos blandos y duros de la boca. Las convencionales son removibles; otros diseños se sujetan mediante adhesión o ganchos a dientes o implantes."
    },
    {
      icon: "rootcanal", group_en: "Advanced Care", group_es: "Cuidado Avanzado",
      title_en: "Root Canal Treatment",
      title_es: "Tratamiento de Conducto",
      desc_en: "Saves an infected or badly damaged tooth by cleaning and sealing the inner canal instead of extracting it.",
      desc_es: "Salva una pieza infectada o muy dañada limpiando y sellando el conducto interno en lugar de extraerla.",
      detail_en: "In endodontic treatment the nerve and blood supply are removed, and the pulp chamber and root canal are thoroughly cleansed and filled to prevent future bacterial invasion.",
      detail_es: "En el tratamiento endodóntico se retira el nervio y el aporte sanguíneo, y la cámara pulpar y el conducto se limpian a fondo y se rellenan para evitar futuras infecciones."
    },
    {
      icon: "gum", group_en: "General & Preventive", group_es: "General y Preventiva",
      title_en: "Gum (Periodontal) Treatment",
      title_es: "Tratamiento de Encías",
      desc_en: "Non-surgical care for gum disease — best treated at the very first sign of a problem.",
      desc_es: "Cuidado no quirúrgico de la enfermedad de encías — ideal atenderla al primer signo.",
      detail_en: "Non-surgical treatment removes damaging substances found beneath the gums under local anaesthetic, together with local antibiotic agents. If the disease becomes severe, surgical treatment or extraction may be needed.",
      detail_es: "El tratamiento no quirúrgico elimina las sustancias dañinas bajo la encía con anestesia local, junto con antibióticos locales. Si la enfermedad se agrava, puede requerirse cirugía o extracción."
    },
    {
      icon: "xray", group_en: "Technology", group_es: "Tecnología",
      title_en: "Digital X-Rays",
      title_es: "Rayos X Digitales",
      desc_en: "Digital radiography with lower radiation than conventional film-based X-rays.",
      desc_es: "Radiografía digital con menos radiación que las placas convencionales.",
      detail_en: "Digital X-ray sensors replace traditional film. A major advantage is that less radiation can be used to produce an image of similar contrast to conventional radiography.",
      detail_es: "Los sensores digitales reemplazan la placa tradicional. Una ventaja importante es que se puede usar menos radiación para obtener una imagen de contraste similar a la radiografía convencional."
    }
  ],

  /* ---------- Why choose us ---------- */
  why: [
    { icon: "globe", title_en: "Fully bilingual", title_es: "Totalmente bilingüe", text_en: "Dr. Facet and her staff speak English and Spanish, so nothing gets lost in translation.", text_es: "La Dra. Facet y su equipo hablan inglés y español, para que nada se pierda en la traducción." },
    { icon: "heart", title_en: "Unhurried appointments", title_es: "Citas sin prisa", text_en: "We take the time to explain your options, listen to your concerns and answer your questions.", text_es: "Nos tomamos el tiempo para explicarte tus opciones, escuchar tus inquietudes y responder tus preguntas." },
    { icon: "award", title_en: "Experienced hands", title_es: "Manos con experiencia", text_en: "DDS from the University of Maryland and a one-year Advanced General Dentistry residency.", text_es: "Título de DDS de la Universidad de Maryland y residencia de un año en Odontología General Avanzada." },
    { icon: "card", title_en: "Payment flexibility", title_es: "Flexibilidad de pago", text_en: "Call the office and we will explain your options and insurance questions.", text_es: "Llama al consultorio y te explicamos tus opciones y dudas sobre seguros." }
  ],

  /* ---------- About ---------- */
  about: {
    image: "assets/img/about.jpg",
    eyebrow_en: "Meet your dentist", eyebrow_es: "Conoce a tu dentista",
    title_en: "Dr. Matilde E. Facet",
    title_es: "Dra. Matilde E. Facet",
    subtitle_en: "Doctor of Dental Surgery & Advanced General Dentistry",
    subtitle_es: "Doctora en Cirugía Dental y Odontología General Avanzada",
    p1_en: "Originally from Argentina, Dr. Facet moved to the Washington, DC area with her family at an early age. She earned her Bachelor of Science from the University of Maryland at College Park in 1996 and her Doctor of Dental Surgery degree at the Baltimore College of Dental Surgery, University of Maryland, in 2000.",
    p1_es: "Originaria de Argentina, la Dra. Facet se mudó con su familia al área de Washington, DC a temprana edad. Obtuvo su licenciatura en Ciencias en la Universidad de Maryland en College Park en 1996 y su título de Doctora en Cirugía Dental en el Baltimore College of Dental Surgery de la Universidad de Maryland en el año 2000.",
    p2_en: "During dental school she was inducted into the Gamma Phi Delta Prosthodontic Honor Society. After graduating, she completed a one-year Advanced General Dentistry residency at the Baltimore College of Dental Surgery, then spent ten years as an associate dentist in a family practice in Frederick, Maryland.",
    p2_es: "Durante sus años en la facultad fue incorporada a la Sociedad de Honor en Prostodoncia Gamma Phi Delta. Al graduarse completó una residencia de un año en Odontología General Avanzada en el Baltimore College of Dental Surgery y luego trabajó diez años como odontóloga asociada en una práctica familiar en Frederick, Maryland.",
    p3_en: "In 2012 she acquired her own practice in Silver Spring, Maryland, moving closer to Potomac, the area where she grew up. Today Dr. Facet and her team perform a wide range of dental procedures with a special focus on cosmetic dentistry, and she continues to expand her training through continuing education seminars.",
    p3_es: "En 2012 adquirió su propia práctica en Silver Spring, Maryland, acercándose a Potomac, la zona donde creció. Hoy la Dra. Facet y su equipo realizan una amplia variedad de procedimientos con especial enfoque en odontología estética, y ella continúa ampliando su formación con seminarios de educación continua."
  },

  /* ---------- Testimonials (PLACEHOLDERS — replace with real reviews) ---------- */
  testimonials: {
    enabled: true,
    note_en: "Sample layout — replace with real patient reviews from the admin panel.",
    note_es: "Maquetación de ejemplo — reemplazar con reseñas reales de pacientes desde el panel.",
    items: [
      { name: "Patient review 1", meta_en: "Replace with a real review", meta_es: "Reemplazar con una reseña real", text_en: "This is a placeholder card. Open the admin panel to add a genuine review from one of your patients.", text_es: "Esta es una tarjeta de ejemplo. Abre el panel de administración para agregar una reseña real de uno de tus pacientes.", rating: 5 },
      { name: "Patient review 2", meta_en: "Replace with a real review", meta_es: "Reemplazar con una reseña real", text_en: "This is a placeholder card. Open the admin panel to add a genuine review from one of your patients.", text_es: "Esta es una tarjeta de ejemplo. Abre el panel de administración para agregar una reseña real de uno de tus pacientes.", rating: 5 },
      { name: "Patient review 3", meta_en: "Replace with a real review", meta_es: "Reemplazar con una reseña real", text_en: "This is a placeholder card. Open the admin panel to add a genuine review from one of your patients.", text_es: "Esta es una tarjeta de ejemplo. Abre el panel de administración para agregar una reseña real de uno de tus pacientes.", rating: 5 }
    ]
  },

  /* ---------- FAQ ---------- */
  faq: [
    { q_en: "Which type of toothbrush should I use?", q_es: "¿Qué tipo de cepillo de dientes debo usar?",
      a_en: "The brand is not as critical as the bristle type and head size. A soft toothbrush with a small head is recommended: medium and hard brushes tend to irritate the gums and contribute to gum recession, and a small head lets you reach around each tooth more completely. There is no need to scrub — brush at least twice a day and visit your dentist at least twice a year for cleanings.",
      a_es: "La marca no es tan importante como el tipo de cerdas y el tamaño del cabezal. Se recomienda un cepillo de cerdas suaves y cabezal pequeño: los medianos y duros irritan las encías y contribuyen a su retracción, y un cabezal pequeño permite llegar mejor alrededor de cada diente. No hace falta frotar con fuerza — cepíllate al menos dos veces al día y visita a tu dentista al menos dos veces al año para limpiezas." },
    { q_en: "Is one toothpaste better than others?", q_es: "¿Hay una pasta dental mejor que otras?",
      a_en: "Generally, no. What matters is that it contains fluoride, which decreases the incidence of dental decay. We recommend using whatever tastes good to you, as long as it has fluoride.",
      a_es: "En general, no. Lo importante es que contenga flúor, que reduce la incidencia de caries. Recomendamos usar la que te sepa bien, siempre que contenga flúor." },
    { q_en: "How often should I floss?", q_es: "¿Con qué frecuencia debo usar hilo dental?",
      a_en: "Flossing at least once a day helps prevent cavities from forming between the teeth, where your toothbrush cannot reach, and helps keep your gums healthy.",
      a_es: "Usar hilo dental al menos una vez al día ayuda a prevenir caries entre los dientes, donde el cepillo no llega, y mantiene las encías sanas." },
    { q_en: "What's the difference between a \"crown\" and a \"cap\"?", q_es: "¿Cuál es la diferencia entre una \"corona\" y una \"funda\"?",
      a_en: "They are the same restoration: a covering that repairs a severely broken tooth after removing old fillings, fractured structure and decay. The material can be gold, porcelain, composite or stainless steel. Dentists call all of them crowns; patients often call the tooth-coloured ones caps and the gold or metal ones crowns.",
      a_es: "Son la misma restauración: una cubierta que repara una pieza muy dañada tras retirar obturaciones antiguas, estructura fracturada y caries. El material puede ser oro, porcelana, composite o acero inoxidable. Los dentistas las llaman coronas; los pacientes suelen llamar \"fundas\" a las del color del diente y \"coronas\" a las de oro o metal." },
    { q_en: "What's the difference between a \"bridge\" and a \"partial denture\"?", q_es: "¿Cuál es la diferencia entre un \"puente\" y una \"prótesis parcial\"?",
      a_en: "Both replace missing teeth. A bridge is permanently attached to the neighbouring teeth or, in some cases, to implants. A partial denture is attached by clasps and can be easily removed by the patient. Patients are usually more satisfied with bridges than with partial dentures.",
      a_es: "Ambos reemplazan dientes perdidos. El puente se fija de forma permanente a los dientes vecinos o, en algunos casos, a implantes. La prótesis parcial se sujeta con ganchos y el paciente puede retirarla fácilmente. Por lo general, los pacientes quedan más satisfechos con los puentes." },
    { q_en: "Silver fillings versus white fillings?", q_es: "¿Amalgama plateada o resina blanca?",
      a_en: "Although a 1993 U.S. Public Health Service report stated there is no health reason not to use amalgam, more patients today ask for tooth-coloured composite fillings. We also prefer them, because they bond to the tooth structure and help strengthen a tooth weakened by decay. However, they cannot be used in every situation — if a tooth is badly broken down, a crown will usually be necessary.",
      a_es: "Aunque un informe del Servicio de Salud Pública de EE. UU. de 1993 indicó que no hay razón de salud para no usar amalgama, hoy más pacientes piden resinas del color del diente. Nosotros también las preferimos, porque se adhieren a la estructura dental y ayudan a reforzar un diente debilitado por caries. Sin embargo, no sirven en todos los casos — si el diente está muy deteriorado, normalmente hará falta una corona." },
    { q_en: "Do I need a root canal just because I need a crown?", q_es: "¿Necesito un conducto solo porque necesito una corona?",
      a_en: "No. While most teeth that have had root canal treatment do need a crown to strengthen them and restore normal form and function, not every tooth needing a crown also needs a root canal.",
      a_es: "No. Aunque la mayoría de los dientes con tratamiento de conducto sí necesitan una corona para reforzarse y recuperar forma y función normales, no todos los dientes que necesitan corona requieren también un conducto." }
  ],

  /* ---------- Appointment wizard config ---------- */
  appointment: {
    enabled: true,
    reasons: [
      { value: "new-patient", icon: "user", label_en: "I'm a new patient", label_es: "Soy paciente nuevo", hint_en: "First visit or transferring records", hint_es: "Primera visita o traslado de historial" },
      { value: "cleaning", icon: "tooth", label_en: "Cleaning & check-up", label_es: "Limpieza y revisión", hint_en: "Routine exam and hygiene", hint_es: "Examen de rutina e higiene" },
      { value: "pain", icon: "heart", label_en: "I'm in pain", label_es: "Tengo dolor", hint_en: "Urgent or emergency visit", hint_es: "Visita urgente o de emergencia" },
      { value: "cosmetic", icon: "sparkle", label_en: "Cosmetic consultation", label_es: "Consulta estética", hint_en: "Whitening, veneers, bonding", hint_es: "Blanqueamiento, carillas, bonding" },
      { value: "restorative", icon: "crown", label_en: "Crowns, implants or dentures", label_es: "Coronas, implantes o prótesis", hint_en: "Restorative consultation", hint_es: "Consulta restauradora" },
      { value: "other", icon: "calendar", label_en: "Something else", label_es: "Otro motivo", hint_en: "We'll call to find out more", hint_es: "Te llamamos para saber más" }
    ],
    times: ["9:00 am", "9:45 am", "10:30 am", "11:15 am", "12:00 pm", "1:30 pm", "2:15 pm", "3:00 pm"],
    notice_en: "This form is a request, not a confirmed booking. Our team will call or email you to confirm the exact time.",
    notice_es: "Este formulario es una solicitud, no una cita confirmada. Nuestro equipo te llamará o escribirá para confirmar la hora exacta."
  },

  /* ---------- Documents (web forms replace the old PDFs) ---------- */
  documents: [
    { icon: "user", title_en: "New patient registration", title_es: "Registro de paciente nuevo", desc_en: "Fill it out online before your first visit — no printing needed.", desc_es: "Complétalo en línea antes de tu primera visita — sin imprimir.", href: "appointment.html" },
    { icon: "mail", title_en: "Request your dental records", title_es: "Solicita tu historial dental", desc_en: "Ask us to send your records to another practice.", desc_es: "Pídenos enviar tu historial a otra práctica.", href: "contact.html#records" },
    { icon: "mail", title_en: "Transfer records to us", title_es: "Transferir tu historial a nosotros", desc_en: "Send us your previous records from another dentist.", desc_es: "Envíanos tu historial previo de otro dentista.", href: "contact.html#records" }
  ],

  /* ---------- External links ---------- */
  links: [
    { title_en: "American Dental Association", title_es: "Asociación Dental Americana", url: "https://www.ada.org/" },
    { title_en: "Maryland State Dental Association", title_es: "Asociación Dental del Estado de Maryland", url: "https://www.msda.com/" }
  ],

  /* ---------- Social (empty by default — add real profiles in admin) ---------- */
  social: [],

  /* ---------- SEO ---------- */
  seo: {
    title_en: "matildefacetdds.com — Dentist in Silver Spring, MD | Matilde E. Facet, DDS",
    title_es: "matildefacetdds.com — Dentista en Silver Spring, MD | Dra. Matilde E. Facet",
    desc_en: "General and cosmetic dentistry in Silver Spring, Maryland. Bilingual (English & Spanish) team led by Dr. Matilde E. Facet, DDS. Call (301) 593-5477.",
    desc_es: "Odontología general y estética en Silver Spring, Maryland. Equipo bilingüe (inglés y español) liderado por la Dra. Matilde E. Facet. Llama al (301) 593-5477."
  }
};
