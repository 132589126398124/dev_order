export interface FilmEntry {
  id: string;
  name: string;
  brand: string;
  iso: number;
  process: "C-41" | "ECN-2" | "B&W" | "E-6" | "기타";
  formats: Array<"135" | "120" | "4x5" | "8x10">;
  aliases?: string[];
  discontinued?: boolean;
}

export const FILMS: FilmEntry[] = [
  // ── Kodak 컬러 ──────────────────────────────────────────────────────────────
  { id: "kodak-portra-160", name: "Kodak Portra 160", brand: "Kodak", iso: 160, process: "C-41", formats: ["135", "120", "4x5", "8x10"], aliases: ["포트라160", "포160", "portra160"] },
  { id: "kodak-portra-400", name: "Kodak Portra 400", brand: "Kodak", iso: 400, process: "C-41", formats: ["135", "120", "4x5", "8x10"], aliases: ["포트라400", "포400", "portra400"] },
  { id: "kodak-portra-800", name: "Kodak Portra 800", brand: "Kodak", iso: 800, process: "C-41", formats: ["135", "120"], aliases: ["포트라800", "포800", "portra800"] },
  { id: "kodak-ektar-100", name: "Kodak Ektar 100", brand: "Kodak", iso: 100, process: "C-41", formats: ["135", "120", "4x5"], aliases: ["엑타100", "엑타르100", "ektar", "ektar100"] },
  { id: "kodak-gold-200", name: "Kodak Gold 200", brand: "Kodak", iso: 200, process: "C-41", formats: ["135", "120"], aliases: ["골드", "골드200", "코닥골드", "gold200"] },
  { id: "kodak-colorplus-200", name: "Kodak ColorPlus 200", brand: "Kodak", iso: 200, process: "C-41", formats: ["135"], aliases: ["컬플", "컬러플러스", "컬플200", "colorplus"] },
  { id: "kodak-ultramax-400", name: "Kodak UltraMax 400", brand: "Kodak", iso: 400, process: "C-41", formats: ["135"], aliases: ["울맥", "울트라맥스", "울트라맥스400", "ultramax", "ultramax400"] },
  { id: "kodak-pro-image-100", name: "Kodak Pro Image 100", brand: "Kodak", iso: 100, process: "C-41", formats: ["135"], aliases: ["프로이미지", "프로이미지100", "proimage", "proimage100"] },
  { id: "kodak-portra-400vc", name: "Kodak Portra 400VC", brand: "Kodak", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["포트라400VC", "400VC", "VC"], discontinued: true },
  { id: "kodak-portra-400nc", name: "Kodak Portra 400NC", brand: "Kodak", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["포트라400NC", "400NC", "NC"], discontinued: true },
  { id: "kodak-portra-160vc", name: "Kodak Portra 160VC", brand: "Kodak", iso: 160, process: "C-41", formats: ["135", "120"], aliases: ["포트라160VC", "160VC"], discontinued: true },
  { id: "kodak-portra-160nc", name: "Kodak Portra 160NC", brand: "Kodak", iso: 160, process: "C-41", formats: ["135", "120"], aliases: ["포트라160NC", "160NC"], discontinued: true },
  { id: "kodak-bw400cn", name: "Kodak BW400CN", brand: "Kodak", iso: 400, process: "C-41", formats: ["135"], aliases: ["BW400CN", "흑백C-41"], discontinued: true },

  // ── Kodak 흑백 ──────────────────────────────────────────────────────────────
  { id: "kodak-tmax-100", name: "Kodak T-Max 100", brand: "Kodak", iso: 100, process: "B&W", formats: ["135", "120", "4x5", "8x10"], aliases: ["티맥스100", "tmax100", "TMX"] },
  { id: "kodak-tmax-400", name: "Kodak T-Max 400", brand: "Kodak", iso: 400, process: "B&W", formats: ["135", "120", "4x5", "8x10"], aliases: ["티맥스400", "tmax400", "TMY"] },
  { id: "kodak-tmax-p3200", name: "Kodak T-Max P3200", brand: "Kodak", iso: 3200, process: "B&W", formats: ["135"], aliases: ["티맥스3200", "P3200", "tmax3200"] },
  { id: "kodak-tri-x-400", name: "Kodak Tri-X 400", brand: "Kodak", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["트라이엑스", "트라이X", "trix", "tri-x", "tx", "400tx"] },
  { id: "kodak-tri-x-320", name: "Kodak Tri-X 320 (TXP)", brand: "Kodak", iso: 320, process: "B&W", formats: ["4x5", "8x10"], aliases: ["TXP", "트라이엑스320", "trix320"] },
  { id: "kodak-plus-x", name: "Kodak Plus-X 125", brand: "Kodak", iso: 125, process: "B&W", formats: ["135", "120"], aliases: ["플러스엑스", "plus-x", "plusx", "PX"], discontinued: true },

  // ── Kodak ECN-2 (시네마) ─────────────────────────────────────────────────────
  { id: "kodak-vision3-50d", name: "Kodak Vision3 50D (5203)", brand: "Kodak", iso: 50, process: "ECN-2", formats: ["135"], aliases: ["비전3 50D", "vision3-50d", "50D", "5203"] },
  { id: "kodak-vision3-200t", name: "Kodak Vision3 200T (5213)", brand: "Kodak", iso: 200, process: "ECN-2", formats: ["135"], aliases: ["비전3 200T", "200T", "5213"] },
  { id: "kodak-vision3-250d", name: "Kodak Vision3 250D (5207)", brand: "Kodak", iso: 250, process: "ECN-2", formats: ["135"], aliases: ["비전3 250D", "250D", "5207"] },
  { id: "kodak-vision3-500t", name: "Kodak Vision3 500T (5219)", brand: "Kodak", iso: 500, process: "ECN-2", formats: ["135"], aliases: ["비전3 500T", "500T", "5219"] },
  { id: "kodak-double-x-5222", name: "Kodak Double-X 5222", brand: "Kodak", iso: 250, process: "B&W", formats: ["135"], aliases: ["더블엑스", "더블X", "double-x", "doublex", "XX", "5222"] },
  { id: "kodak-vision3-50d-ahu", name: "Kodak Vision3 50D AHU", brand: "Kodak", iso: 50, process: "C-41", formats: ["135"], aliases: ["비전3 50D AHU", "50D AHU", "AHU"] },
  { id: "kodak-vision3-250d-ahu", name: "Kodak Vision3 250D AHU", brand: "Kodak", iso: 250, process: "C-41", formats: ["135"], aliases: ["비전3 250D AHU", "250D AHU", "AHU"] },
  { id: "kodak-vision3-500t-ahu", name: "Kodak Vision3 500T AHU", brand: "Kodak", iso: 500, process: "C-41", formats: ["135"], aliases: ["비전3 500T AHU", "500T AHU", "AHU"] },

  // ── Kodak E-6 ───────────────────────────────────────────────────────────────
  { id: "kodak-ektachrome-e100", name: "Kodak Ektachrome E100", brand: "Kodak", iso: 100, process: "E-6", formats: ["135", "120", "4x5"], aliases: ["엑타크롬", "E100", "ektachrome"] },
  { id: "kodak-ektachrome-100vs", name: "Kodak Ektachrome E100VS", brand: "Kodak", iso: 100, process: "E-6", formats: ["135", "120", "4x5"], aliases: ["엑타크롬100VS", "E100VS"], discontinued: true },
  { id: "kodak-ektachrome-64t", name: "Kodak Ektachrome 64T", brand: "Kodak", iso: 64, process: "E-6", formats: ["135", "120"], aliases: ["엑타크롬64T", "64T", "EPY"], discontinued: true },

  // ── Fujifilm 컬러 ────────────────────────────────────────────────────────────
  { id: "fuji-200", name: "Fujifilm 200 (Made in USA)", brand: "Fujifilm", iso: 200, process: "C-41", formats: ["135"], aliases: ["후지200", "fujifilm200", "후지필름200"] },
  { id: "fuji-400", name: "Fujifilm 400 (Made in USA)", brand: "Fujifilm", iso: 400, process: "C-41", formats: ["135"], aliases: ["후지400", "fujifilm400", "후지필름400"] },
  { id: "fuji-c200", name: "Fujicolor C200", brand: "Fujifilm", iso: 200, process: "C-41", formats: ["135"], aliases: ["C200", "후지C200", "fujicolorc200"], discontinued: true },
  { id: "fuji-industrial-100", name: "Fujicolor Industrial 100", brand: "Fujifilm", iso: 100, process: "C-41", formats: ["135"], aliases: ["인더스트리얼100", "industrial100", "후지100"], discontinued: true },
  { id: "fuji-superia-xtra-400", name: "Fujifilm Superia X-Tra 400", brand: "Fujifilm", iso: 400, process: "C-41", formats: ["135"], aliases: ["슈페리아", "슈페리아400", "엑스트라400", "superia", "xtra400"], discontinued: true },
  { id: "fuji-superia-premium-400", name: "Fujifilm Superia Premium 400", brand: "Fujifilm", iso: 400, process: "C-41", formats: ["135"], aliases: ["프리미엄400", "슈페리아 프리미엄", "premium400"], discontinued: true },
  { id: "fuji-superia-200", name: "Fujifilm Superia 200", brand: "Fujifilm", iso: 200, process: "C-41", formats: ["135"], aliases: ["슈페리아200", "superia200"], discontinued: true },
  { id: "fuji-superia-1600", name: "Fujifilm Superia 1600", brand: "Fujifilm", iso: 1600, process: "C-41", formats: ["135"], aliases: ["슈페리아1600", "superia1600"], discontinued: true },
  { id: "fuji-natura-1600", name: "Fujifilm Natura 1600", brand: "Fujifilm", iso: 1600, process: "C-41", formats: ["135"], aliases: ["나투라1600", "natura1600"], discontinued: true },
  { id: "fuji-pro-400h", name: "Fujifilm Pro 400H", brand: "Fujifilm", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["프로400H", "pro400h", "400H"], discontinued: true },
  { id: "fuji-pro-160ns", name: "Fujifilm Pro 160NS", brand: "Fujifilm", iso: 160, process: "C-41", formats: ["135", "120"], aliases: ["프로160NS", "160NS", "pro160ns"], discontinued: true },
  { id: "fuji-pro-160s", name: "Fujifilm Pro 160S", brand: "Fujifilm", iso: 160, process: "C-41", formats: ["135", "120"], aliases: ["프로160S", "160S", "pro160s"], discontinued: true },
  { id: "fuji-reala-100", name: "Fujifilm Reala 100", brand: "Fujifilm", iso: 100, process: "C-41", formats: ["135", "120"], aliases: ["리얼라", "리얼라100", "reala", "reala100"], discontinued: true },

  // ── Fujifilm 흑백 ────────────────────────────────────────────────────────────
  { id: "fuji-acros-ii", name: "Fujifilm Neopan 100 Acros II", brand: "Fujifilm", iso: 100, process: "B&W", formats: ["135", "120"], aliases: ["아크로스", "아크로스2", "아크로스II", "네오판", "acros", "acros2"] },
  { id: "fuji-acros-i", name: "Fujifilm Neopan 100 Acros", brand: "Fujifilm", iso: 100, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["아크로스1", "구아크로스", "old acros"], discontinued: true },
  { id: "fuji-neopan-400", name: "Fujifilm Neopan 400", brand: "Fujifilm", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["네오판400", "neopan400"], discontinued: true },
  { id: "fuji-neopan-1600", name: "Fujifilm Neopan 1600", brand: "Fujifilm", iso: 1600, process: "B&W", formats: ["135"], aliases: ["네오판1600", "neopan1600"], discontinued: true },

  // ── Fujifilm E-6 ─────────────────────────────────────────────────────────────
  { id: "fuji-velvia-50", name: "Fujifilm Velvia 50", brand: "Fujifilm", iso: 50, process: "E-6", formats: ["135", "120"], aliases: ["벨비아50", "벨비아", "velvia50", "RVP50"] },
  { id: "fuji-velvia-100", name: "Fujifilm Velvia 100", brand: "Fujifilm", iso: 100, process: "E-6", formats: ["135", "120", "4x5"], aliases: ["벨비아100", "velvia100", "RVP100"] },
  { id: "fuji-velvia-100f", name: "Fujifilm Velvia 100F", brand: "Fujifilm", iso: 100, process: "E-6", formats: ["135", "120"], aliases: ["벨비아100F", "velvia100F", "RVP100F"], discontinued: true },
  { id: "fuji-provia-100f", name: "Fujifilm Provia 100F", brand: "Fujifilm", iso: 100, process: "E-6", formats: ["135", "120", "4x5"], aliases: ["프로비아", "프로비아100F", "provia", "provia100F", "RDP III"] },
  { id: "fuji-provia-400x", name: "Fujifilm Provia 400X", brand: "Fujifilm", iso: 400, process: "E-6", formats: ["135", "120"], aliases: ["프로비아400X", "provia400X", "RXP"], discontinued: true },
  { id: "fuji-astia-100f", name: "Fujifilm Astia 100F", brand: "Fujifilm", iso: 100, process: "E-6", formats: ["135", "120", "4x5"], aliases: ["아스티아", "아스티아100F", "astia", "astia100F", "RAP"], discontinued: true },
  { id: "fuji-sensia-100", name: "Fujifilm Sensia 100", brand: "Fujifilm", iso: 100, process: "E-6", formats: ["135"], aliases: ["센시아", "센시아100", "sensia", "sensia100"], discontinued: true },

  // ── Ilford 흑백 ──────────────────────────────────────────────────────────────
  { id: "ilford-hp5-plus", name: "Ilford HP5 Plus", brand: "Ilford", iso: 400, process: "B&W", formats: ["135", "120", "4x5", "8x10"], aliases: ["HP5", "HP5+", "HP5 플러스", "hp5plus"] },
  { id: "ilford-fp4-plus", name: "Ilford FP4 Plus", brand: "Ilford", iso: 125, process: "B&W", formats: ["135", "120", "4x5", "8x10"], aliases: ["FP4", "FP4+", "FP4 플러스", "fp4plus"] },
  { id: "ilford-pan-f-plus", name: "Ilford Pan F Plus 50", brand: "Ilford", iso: 50, process: "B&W", formats: ["135", "120"], aliases: ["팬F", "팬F50", "팬F플러스", "panF", "panFplus"] },
  { id: "ilford-delta-100", name: "Ilford Delta 100 Professional", brand: "Ilford", iso: 100, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["델타100", "delta100"] },
  { id: "ilford-delta-400", name: "Ilford Delta 400 Professional", brand: "Ilford", iso: 400, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["델타400", "delta400"] },
  { id: "ilford-delta-3200", name: "Ilford Delta 3200 Professional", brand: "Ilford", iso: 3200, process: "B&W", formats: ["135", "120"], aliases: ["델타3200", "delta3200"] },
  { id: "ilford-xp2-super", name: "Ilford XP2 Super 400", brand: "Ilford", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["XP2", "XP2 수퍼", "xp2super"] },
  { id: "ilford-sfx-200", name: "Ilford SFX 200", brand: "Ilford", iso: 200, process: "B&W", formats: ["135", "120"], aliases: ["SFX200", "sfx"] },
  { id: "ilford-ortho-plus", name: "Ilford Ortho Plus 80", brand: "Ilford", iso: 80, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["오르토", "오르토플러스", "orthoplus"] },

  // ── Kentmere ─────────────────────────────────────────────────────────────────
  { id: "kentmere-pan-100", name: "Kentmere Pan 100", brand: "Kentmere", iso: 100, process: "B&W", formats: ["135", "120"], aliases: ["켄트미어100", "kentmere100"] },
  { id: "kentmere-pan-200", name: "Kentmere Pan 200", brand: "Kentmere", iso: 200, process: "B&W", formats: ["135", "120"], aliases: ["켄트미어200", "kentmere200"] },
  { id: "kentmere-pan-400", name: "Kentmere Pan 400", brand: "Kentmere", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["켄트미어400", "kentmere400"] },

  // ── Harman ───────────────────────────────────────────────────────────────────
  { id: "harman-phoenix-200", name: "Harman Phoenix 200", brand: "Harman", iso: 200, process: "C-41", formats: ["135", "120"], aliases: ["피닉스200", "페닉스", "phoenix200"], discontinued: true },
  { id: "harman-phoenix-ii-200", name: "Harman Phoenix II 200", brand: "Harman", iso: 200, process: "C-41", formats: ["135", "120"], aliases: ["피닉스2", "피닉스II", "phoenix2", "phoenixII"] },
  { id: "harman-red-125", name: "Harman Red 125", brand: "Harman", iso: 125, process: "C-41", formats: ["135", "120"], aliases: ["하만 레드", "redscale", "harman red"] },

  // ── CineStill ────────────────────────────────────────────────────────────────
  { id: "cinestill-50d", name: "CineStill 50D", brand: "CineStill", iso: 50, process: "C-41", formats: ["135", "120"], aliases: ["시네스틸50D", "cinestill50D", "50daylight"] },
  { id: "cinestill-400d", name: "CineStill 400D", brand: "CineStill", iso: 400, process: "C-41", formats: ["135", "120", "4x5"], aliases: ["시네스틸400D", "cinestill400D", "400dynamic"] },
  { id: "cinestill-800t", name: "CineStill 800T", brand: "CineStill", iso: 800, process: "C-41", formats: ["135", "120", "4x5"], aliases: ["시네스틸800T", "800T", "cinestill800T", "800tungsten"] },
  { id: "cinestill-bwxx", name: "CineStill BwXX", brand: "CineStill", iso: 250, process: "B&W", formats: ["135", "120"], aliases: ["시네스틸BwXX", "BwXX", "cinestillxx"] },

  // ── Lomography 컬러 ──────────────────────────────────────────────────────────
  { id: "lomo-color-100", name: "Lomography Color Negative 100", brand: "Lomography", iso: 100, process: "C-41", formats: ["135", "120"], aliases: ["로모컬러100", "로모100", "lomo100"] },
  { id: "lomo-color-400", name: "Lomography Color Negative 400", brand: "Lomography", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["로모컬러400", "로모400", "lomo400"] },
  { id: "lomo-color-800", name: "Lomography Color Negative 800", brand: "Lomography", iso: 800, process: "C-41", formats: ["135", "120"], aliases: ["로모컬러800", "로모800", "lomo800"] },
  { id: "lomo-metropolis", name: "Lomography LomoChrome Metropolis", brand: "Lomography", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["메트로폴리스", "로모메트로", "metropolis", "lomochrome metropolis"] },
  { id: "lomo-purple", name: "Lomography LomoChrome Purple", brand: "Lomography", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["퍼플", "로모퍼플", "purple", "lomochrome purple"] },
  { id: "lomo-turquoise", name: "Lomography LomoChrome Turquoise", brand: "Lomography", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["터쿼이즈", "로모터쿼이즈", "turquoise", "lomochrome turquoise"] },
  { id: "lomo-color-92", name: "Lomography LomoChrome Color '92", brand: "Lomography", iso: 400, process: "C-41", formats: ["135", "120"], aliases: ["컬러92", "로모92", "color92", "lomochrome color 92"] },
  { id: "lomo-redscale-xr", name: "Lomography Redscale XR 50-200", brand: "Lomography", iso: 100, process: "C-41", formats: ["135", "120"], aliases: ["레드스케일", "로모레드", "redscale", "redscale xr"] },
  { id: "santacolor-100", name: "Lomography SantaColor 100", brand: "Lomography", iso: 100, process: "C-41", formats: ["135"], aliases: ["산타컬러", "산타컬러100", "santacolor", "santacolor100"] },

  // ── Lomography 흑백 ──────────────────────────────────────────────────────────
  { id: "lomo-earl-grey-100", name: "Lomography Earl Grey 100", brand: "Lomography", iso: 100, process: "B&W", formats: ["135", "120"], aliases: ["얼그레이", "earlgrey", "earl grey"] },
  { id: "lomo-lady-grey-400", name: "Lomography Lady Grey 400", brand: "Lomography", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["레이디그레이", "ladygrey", "lady grey"] },
  { id: "lomo-berlin-kino-400", name: "Lomography Berlin Kino 400", brand: "Lomography", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["베를린키노", "berlin kino", "berlinkino"] },
  { id: "lomo-potsdam-kino-100", name: "Lomography Potsdam Kino 100", brand: "Lomography", iso: 100, process: "B&W", formats: ["135", "120"], aliases: ["포츠담키노", "포츠담", "potsdam kino", "potsdamkino"] },
  { id: "lomo-fantome-kino-8", name: "Lomography Fantôme Kino 8", brand: "Lomography", iso: 8, process: "B&W", formats: ["135"], aliases: ["팡톰키노", "fantome kino"] },
  { id: "lomo-babylon-kino-13", name: "Lomography Babylon Kino 13", brand: "Lomography", iso: 13, process: "B&W", formats: ["135"], aliases: ["바빌론키노", "babylon kino"] },

  // ── Foma ─────────────────────────────────────────────────────────────────────
  { id: "fomapan-100", name: "Fomapan 100 Classic", brand: "Foma", iso: 100, process: "B&W", formats: ["135", "120", "4x5", "8x10"], aliases: ["포마판100", "포마100", "fomapan100", "foma100"] },
  { id: "fomapan-200", name: "Fomapan 200 Creative", brand: "Foma", iso: 200, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["포마판200", "포마200", "fomapan200", "foma200"] },
  { id: "fomapan-400", name: "Fomapan 400 Action", brand: "Foma", iso: 400, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["포마판400", "포마400", "fomapan400", "foma400"] },
  { id: "foma-retropan-320", name: "Foma Retropan 320 Soft", brand: "Foma", iso: 320, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["레트로판", "retropan", "retropan320"] },
  { id: "foma-ortho-400", name: "Foma Ortho 400", brand: "Foma", iso: 400, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["포마 오르토", "foma ortho", "fomaortho400"] },

  // ── ADOX ─────────────────────────────────────────────────────────────────────
  { id: "adox-chs-100-ii", name: "ADOX CHS 100 II", brand: "ADOX", iso: 100, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["아독스 CHS", "CHS100", "chs100ii"] },
  { id: "adox-cms-20-ii", name: "ADOX CMS 20 II", brand: "ADOX", iso: 20, process: "B&W", formats: ["135", "120"], aliases: ["아독스 CMS", "CMS20", "cms20ii"] },
  { id: "adox-hr-50", name: "ADOX HR-50", brand: "ADOX", iso: 50, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["아독스 HR-50", "HR50", "hr-50"] },
  { id: "adox-scala-50", name: "ADOX Scala 50", brand: "ADOX", iso: 50, process: "B&W", formats: ["135"], aliases: ["아독스 스칼라", "scala", "scala50"] },
  { id: "adox-silvermax-100", name: "ADOX Silvermax 100", brand: "ADOX", iso: 100, process: "B&W", formats: ["135"], aliases: ["실버맥스", "silvermax", "silvermax100"] },
  { id: "adox-color-mission-200", name: "ADOX Color Mission 200", brand: "ADOX", iso: 200, process: "C-41", formats: ["135"], aliases: ["컬러미션", "color mission", "colormission200"] },

  // ── Rollei ───────────────────────────────────────────────────────────────────
  { id: "rollei-retro-80s", name: "Rollei Retro 80S", brand: "Rollei", iso: 80, process: "B&W", formats: ["135", "120"], aliases: ["로라이 레트로80S", "retro80s", "rolleiretro80s"] },
  { id: "rollei-retro-400s", name: "Rollei Retro 400S", brand: "Rollei", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["로라이 레트로400S", "retro400s", "rolleiretro400s"] },
  { id: "rollei-rpx-25", name: "Rollei RPX 25", brand: "Rollei", iso: 25, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["RPX25", "rpx25"] },
  { id: "rollei-rpx-100", name: "Rollei RPX 100", brand: "Rollei", iso: 100, process: "B&W", formats: ["135", "120"], aliases: ["RPX100", "rpx100"] },
  { id: "rollei-rpx-400", name: "Rollei RPX 400", brand: "Rollei", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["RPX400", "rpx400"] },
  { id: "rollei-infrared-400", name: "Rollei Infrared 400", brand: "Rollei", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["로라이 인프라레드", "인프라레드", "infrared", "rolleiinfrared"] },
  { id: "rollei-superpan-200", name: "Rollei Superpan 200", brand: "Rollei", iso: 200, process: "B&W", formats: ["135", "120", "4x5"], aliases: ["수퍼판", "superpan", "superpan200"] },
  { id: "rollei-ortho-25-plus", name: "Rollei Ortho 25 Plus", brand: "Rollei", iso: 25, process: "B&W", formats: ["135", "120"], aliases: ["로라이 오르토25", "ortho25", "ortho25plus"] },

  // ── Bergger ──────────────────────────────────────────────────────────────────
  { id: "bergger-pancro-400", name: "Bergger Pancro 400", brand: "Bergger", iso: 400, process: "B&W", formats: ["135", "120", "4x5", "8x10"], aliases: ["베거", "팡크로", "pancro", "pancro400"] },

  // ── ORWO Wolfen ──────────────────────────────────────────────────────────────
  { id: "wolfen-nc500", name: "ORWO Wolfen NC500", brand: "ORWO", iso: 400, process: "C-41", formats: ["135"], aliases: ["오르오", "오르보", "볼펜NC500", "NC500", "orwonc500", "wolfennc500"] },
  { id: "wolfen-nc400", name: "ORWO Wolfen NC400", brand: "ORWO", iso: 400, process: "C-41", formats: ["135"], aliases: ["오르오", "오르보", "볼펜NC400", "NC400", "orwonc400", "wolfennc400"] },
  { id: "wolfen-nc200", name: "ORWO Wolfen NC200", brand: "ORWO", iso: 200, process: "C-41", formats: ["135"], aliases: ["오르오", "오르보", "볼펜NC200", "NC200", "orwonc200", "wolfennc200"] },
  { id: "wolfen-np100", name: "ORWO Wolfen NP100", brand: "ORWO", iso: 100, process: "B&W", formats: ["135"], aliases: ["오르오", "오르보", "볼펜NP100", "NP100", "wolfennp100"] },
  { id: "wolfen-un54", name: "ORWO Wolfen UN54", brand: "ORWO", iso: 100, process: "B&W", formats: ["135"], aliases: ["오르오", "오르보", "볼펜UN54", "UN54", "wolfenun54"] },
  { id: "wolfen-p400", name: "ORWO Wolfen P400", brand: "ORWO", iso: 400, process: "B&W", formats: ["135"], aliases: ["오르오", "오르보", "볼펜P400", "wolfenP400"] },

  // ── 기타 ─────────────────────────────────────────────────────────────────────
  { id: "kodak-aerocolor-iv", name: "Kodak Aerocolor IV 2460", brand: "Kodak", iso: 100, process: "C-41", formats: ["135"], aliases: ["에어로컬러", "에어로컬러IV", "aerocolor", "aerocoloriv", "2460"] },
  { id: "flicfilm-elektra-100", name: "Flic Film Elektra 100", brand: "Flic Film", iso: 100, process: "C-41", formats: ["135"], aliases: ["일렉트라", "엘렉트라", "elektra", "elektra100"] },
  { id: "washi-x", name: "Film Washi X", brand: "Film Washi", iso: 100, process: "C-41", formats: ["135"], aliases: ["와시X", "washi-x", "washix"] },
  { id: "reflx-lab-pro-100", name: "Reflx Lab Pro 100", brand: "Reflx Lab", iso: 100, process: "C-41", formats: ["135"], aliases: ["리플렉스 프로100", "reflx pro 100", "reflxpro100"] },
  { id: "reflx-lab-800t", name: "Reflx Lab 800T", brand: "Reflx Lab", iso: 800, process: "C-41", formats: ["135"], aliases: ["리플렉스랩 800t", "reflxlab 800t", "중네스틸"] },
  { id: "reflx-lab-400d", name: "Reflx Lab 400D", brand: "Reflx Lab", iso: 400, process: "C-41", formats: ["135"], aliases: ["리플렉스랩 400d", "reflxlab 400d", "중네스틸"] },
  { id: "agfaphoto-apx-100", name: "AgfaPhoto APX 100", brand: "AgfaPhoto", iso: 100, process: "B&W", formats: ["135", "120"], aliases: ["아그파 APX100", "APX100", "apx100"] },
  { id: "agfaphoto-apx-400", name: "AgfaPhoto APX 400", brand: "AgfaPhoto", iso: 400, process: "B&W", formats: ["135", "120"], aliases: ["아그파 APX400", "APX400", "apx400"] },
  { id: "agfa-vista-200", name: "AgfaPhoto Vista Plus 200", brand: "AgfaPhoto", iso: 200, process: "C-41", formats: ["135"], aliases: ["아그파 비스타200", "비스타200", "vista200", "vistaplus200"], discontinued: true },
  { id: "agfa-vista-400", name: "AgfaPhoto Vista Plus 400", brand: "AgfaPhoto", iso: 400, process: "C-41", formats: ["135"], aliases: ["아그파 비스타400", "비스타400", "vista400", "vistaplus400"], discontinued: true },
  { id: "ferrania-p30", name: "Ferrania P30", brand: "Ferrania", iso: 80, process: "B&W", formats: ["135"], aliases: ["페라니아 P30", "P30", "ferraniap30"] },
  { id: "ferrania-p33", name: "Ferrania P33", brand: "Ferrania", iso: 160, process: "B&W", formats: ["135"], aliases: ["페라니아 P33", "P33", "ferraniap33"] },
  { id: "ferrania-orto", name: "Ferrania Orto", brand: "Ferrania", iso: 50, process: "B&W", formats: ["135"], aliases: ["페라니아 오르토", "ferrania ortho", "ferraniaorto"] },
  { id: "shanghai-gp3-100", name: "Shanghai GP3 100", brand: "Shanghai", iso: 100, process: "B&W", formats: ["120", "4x5"], aliases: ["상하이 GP3", "GP3", "shanghaigp3"] },
  { id: "lucky-shd-100", name: "Lucky SHD 100", brand: "Lucky", iso: 100, process: "B&W", formats: ["135"], aliases: ["럭키 SHD100", "SHD100", "luckyshd100"] },
  { id: "lucky-color-200", name: "Lucky Color 200", brand: "Lucky", iso: 200, process: "C-41", formats: ["135"], aliases: ["럭키 200", "럭키200", "lucky200"] },
];

// 필름명 + 별명으로 검색 (공백 무시, 대소문자 무시)
export function searchFilms(query: string): FilmEntry[] {
  if (!query || query.length < 1) return [];
  const q = query.toLowerCase().replace(/\s+/g, "");
  return FILMS.filter((film) => {
    const name = film.name.toLowerCase().replace(/\s+/g, "");
    const brand = film.brand.toLowerCase();
    const aliases = (film.aliases ?? []).map((a) => a.toLowerCase().replace(/\s+/g, ""));
    return (
      name.includes(q) ||
      brand.includes(q) ||
      aliases.some((a) => a.includes(q)) ||
      String(film.iso).startsWith(q)
    );
  }).slice(0, 8);
}
