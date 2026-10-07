// Selection rules and idea catalogue ported from https://test.llmteam.tech/ (2026-10-06).
// Isolated from the host app; catalogue, prices and hotel details come from Keys.
const KeysIdeas = (()=>{
const regionalCities=['Сочи','Адлер','Сириус','Хоста','Красная Поляна'];
const normalizeCity=value=>String(value||'').trim().toLocaleLowerCase('ru').replaceAll('ё','е');
const isRegionalHotel=hotel=>regionalCities.some(city=>normalizeCity(city)===normalizeCity(hotel.city));
const regionalDestination=ideas=>ideas.destination===undefined||regionalCities.some(city=>normalizeCity(city)===normalizeCity(ideas.destination));
const destinationAllowed=(card,ideas)=>regionalDestination(ideas)||(card.kind!=='out'&&(ideas.destination==='*'||!['breakfast','beach'].includes(card.id)));
const destinationHotels=(ideas,search)=>{const city=ideas.destination??search.city??'Сочи';return city==='*'?_n:_n.filter(hotel=>normalizeCity(hotel.city)===normalizeCity(city));};
const destinationOptions=()=>[{value:'*',label:'Любой город'},...[...new Set(_n.map(hotel=>hotel.city).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ru')).map(city=>({value:city,label:city}))];

const zi=Vc,Hi=(hotel,search,tick)=>tx(hotel,search,tick).total/Math.max(1,Ge(search.arrival,search.departure)),Ee=Te,Rn=as;
const _I = { quiet: "#f1edfd", sea: "#e5f1fc", "sea-view": "#e3f0fb", sunset: "#fff0e3", pool: "#e3f4fb", spa: "#e6f5ee", couple: "#fdecef", kids: "#fff4d9", adults: "#efeafc", sleep: "#eceffc", breakfast: "#fdf1e7", restaurant: "#fdeee8", parking: "#eef1f6", dog: "#f6efe6", work: "#eaf0fb", budget: "#eef7e6", mountains: "#eaf5ec", greenery: "#e8f5ea", "quad-bike": "#fff5d6", rafting: "#fff0e3", jeep: "#eceefd", hiking: "#e8f5ea", ski: "#e8f2fd", "cable-car": "#f7e9f5", paraglider: "#fdeaee", "horse-riding": "#f6efe6", sup: "#e2f6f8", diving: "#e5f0fb", yacht: "#eef1f6", aquapark: "#e3f4fb" }, Lr = { couple: { label: "Вдвоём", icon: "couple", lower: "вдвоём" }, friends: { label: "С друзьями", icon: "adults", lower: "с друзьями" }, kids: { label: "С детьми", icon: "kids", lower: "с детьми" }, work: { label: "По работе", icon: "work", lower: "по работе" } }, Za = { center: { label: "Центр Сочи", in: "в центре Сочи", text: "Набережная, рестораны, всё рядом", icon: "breakfast", nature: -0.8, x: 66, y: 62 }, khosta: { label: "Хоста", in: "в Хосте", text: "Сады и тишина, горы рядом", icon: "greenery", nature: 0.4, x: 142, y: 112 }, adler: { label: "Адлер", in: "в Адлере", text: "У моря, рядом аэропорт и набережная", icon: "budget", nature: -0.4, x: 212, y: 150 }, imereti: { label: "Сириус", in: "в Сириусе", text: "Променад у моря и Олимпийский парк", icon: "sea", nature: -0.3, x: 274, y: 186 }, polyana: { label: "Красная Поляна", in: "на Красной Поляне", text: "Горы, канатка, чистый воздух", icon: "mountains", nature: 1, x: 298, y: 50 } }, a3 = { center: { khosta: 20, adler: 40, imereti: 50, polyana: 90 }, khosta: { adler: 20, imereti: 30, polyana: 70 }, adler: { imereti: 15, polyana: 50 }, imereti: { polyana: 50 } }, Hh = [{ value: "6000", label: "До 6 000 ₽", limit: 6e3 }, { value: "8000", label: "До 8 000 ₽", limit: 8e3 }, { value: "any", label: "Не важно", limit: null }], Hw = [{ id: "breakfast", kind: "in", title: "Завтрак с видом на море", short: "Завтрак с видом", fan: "Завтрак", text: "Терраса, кофе и море до горизонта", icon: "sea-view", trait: "seaview", calm: -0.6, nature: -0.2, slot: "morning" }, { id: "hammam", kind: "in", title: "Хаммам и массаж вдвоём", titleFor: { friends: "Хаммам и сауна компанией", kids: "Спа, пока дети в клубе", work: "Спа после рабочего дня" }, short: "Хаммам и спа", fan: "Хаммам", text: "Спа-комплекс прямо в отеле", icon: "spa", trait: "spa", calm: -0.8, nature: 0, slot: "evening" }, { id: "pool", kind: "in", title: "Бассейн с подогревом", short: "Тёплый бассейн", text: "Тёплая вода в любую погоду", icon: "pool", trait: "pool", calm: -0.3, nature: 0, slot: "evening" }, { id: "sleep", kind: "in", title: "Выспаться в тишине", short: "Тишина", text: "Тихие номера, никто не будит", icon: "sleep", trait: "quiet", calm: -1, nature: 0.2 }, { id: "adults", kind: "in", title: "Отель только для взрослых", short: "Только взрослые", text: "Без аниматоров и детского шума", icon: "adults", trait: "adults", calm: -0.5, nature: 0, for: ["couple", "friends", "work"] }, { id: "terrace", kind: "in", title: "Ужин на террасе на закате", short: "Ужин на закате", text: "Ресторан с видом прямо в отеле", icon: "sunset", trait: "restaurant", calm: -0.3, nature: -0.2, slot: "night" }, { id: "beach", kind: "in", title: "Свой пляж в двух шагах", short: "Свой пляж", text: "Свой выход к морю, без толпы", icon: "sea", trait: "beach", calm: -0.2, nature: -0.3, slot: "day" }, { id: "yoga", kind: "in", title: "Йога на рассвете", short: "Йога", text: "Утренние занятия для гостей отеля", icon: "spa", trait: "yoga", calm: 0.1, nature: 0.3, slot: "morning" }, { id: "kidsclub", kind: "in", title: "Детский клуб, пока вы отдыхаете", short: "Детский клуб", text: "Аниматоры и занятия для детей с 4 лет", icon: "kids", trait: "kidsClub", calm: 0.1, nature: -0.2, slot: "day", for: ["kids"] }, { id: "workdesk", kind: "in", title: "Рабочее место и быстрый интернет", short: "Рабочее место", text: "Стол у окна и тишина для созвонов", icon: "work", trait: "work", calm: -0.2, nature: -0.4, for: ["work"] }, { id: "cable", kind: "out", area: "polyana", title: "Канатка на Розу Хутор", short: "Канатка", fan: "Канатка", text: "Горный воздух и вид на хребет", icon: "cable-car", calm: 0.1, nature: 1, slot: "day" }, { id: "waterfall", kind: "out", area: "khosta", title: "Тропа к водопадам", short: "Водопады", text: "Лёгкий треккинг на полдня", icon: "hiking", calm: 0.5, nature: 1, slot: "day" }, { id: "rafting", kind: "out", area: "polyana", title: "Рафтинг по Мзымте", short: "Рафтинг", text: "Два часа по горной реке с инструктором", icon: "rafting", calm: 1, nature: 0.8, slot: "day", for: ["couple", "friends", "work"] }, { id: "quad", kind: "out", area: "polyana", title: "Квадроциклы по горам", short: "Квадроциклы", text: "По лесным дорогам с инструктором, два часа", icon: "quad-bike", calm: 1, nature: 0.9, slot: "day", for: ["couple", "friends", "work"] }, { id: "jeep", kind: "out", area: "polyana", title: "Джиппинг к смотровым", short: "Джиппинг", text: "По горным дорогам к видам на хребет", icon: "jeep", calm: 0.7, nature: 1, slot: "day" }, { id: "paraglider", kind: "out", area: "polyana", title: "Полёт на параплане", short: "Параплан", text: "Тандем с инструктором над долиной", icon: "paraglider", calm: 0.9, nature: 0.8, slot: "day", for: ["couple", "friends", "work"] }, { id: "horse", kind: "out", area: "polyana", title: "Конная прогулка по лесу", short: "Конная прогулка", text: "Спокойным шагом, полтора часа", icon: "horse-riding", calm: 0, nature: 1, slot: "day" }, { id: "yacht", kind: "out", area: "center", title: "Яхта на закате", short: "Яхта", text: "Два часа в море, берег в огнях", icon: "yacht", calm: 0, nature: -0.1, slot: "night" }, { id: "sup", kind: "out", area: "imereti", title: "САП-прогулка по морю", short: "САП", text: "Утром, пока вода гладкая", icon: "sup", calm: 0.5, nature: 0, slot: "morning" }, { id: "diving", kind: "out", area: "center", title: "Пробное погружение", short: "Дайвинг", text: "С инструктором, опыт не нужен", icon: "diving", calm: 0.7, nature: 0, slot: "day", for: ["couple", "friends", "work"] }, { id: "promenade", kind: "out", area: "center", title: "Вечер на набережной", short: "Набережная", text: "Кафе, огни и прогулка у моря", icon: "breakfast", calm: -0.3, nature: -1, slot: "night" }, { id: "gastro", kind: "out", area: "center", title: "Гастроужины в городе", short: "Рестораны", text: "Кавказская кухня и новые места", icon: "restaurant", calm: 0, nature: -0.9, slot: "night" }, { id: "park", kind: "out", area: "center", title: "Дендрарий и парк «Ривьера»", short: "Дендрарий", text: "Пальмы, сады и неспешные прогулки", icon: "greenery", calm: -0.5, nature: -0.2, slot: "day" }, { id: "tea", kind: "out", area: "khosta", title: "Чайные плантации", short: "Чайные плантации", text: "Самый северный чай и дегустация на месте", icon: "greenery", calm: -0.2, nature: 0.7, slot: "day" }, { id: "aquapark", kind: "out", area: "adler", title: "Аквапарк", short: "Аквапарк", text: "Горки и бассейны на целый день", icon: "aquapark", calm: 0.4, nature: -0.6, slot: "day", for: ["kids", "friends"] }, { id: "ski", kind: "out", area: "polyana", title: "Горные лыжи", short: "Лыжи", text: "Сезон с декабря по апрель", icon: "ski", calm: 0.9, nature: 1, months: [12, 1, 2, 3, 4], lock: "с декабря", lockNote: "На ваши даты склоны закрыты, зато работают канатка и тропы" }, { id: "fun", kind: "out", area: "imereti", title: "Парк аттракционов", short: "Аттракционы", text: "Горки и колесо обозрения у Олимпийского парка", icon: "aquapark", calm: 0.5, nature: -0.7, slot: "day", for: ["kids"] }, { id: "budget", kind: "ask", title: "Сколько готовы тратить за ночь?", short: "Бюджет", text: "Цены на ваши даты, за номер", icon: "budget" }, { id: "car", kind: "ask", title: "Едете на машине?", short: "Парковка", text: "Тогда найдём отель с парковкой", icon: "parking", trait: "parking", options: [{ value: "yes", label: "Да, нужна парковка" }, { value: "no", label: "Нет, без машины" }] }, { id: "dog", kind: "ask", title: "Берёте собаку?", short: "С собакой", text: "Покажем, где рады питомцам", icon: "dog", trait: "pets", options: [{ value: "yes", label: "Да" }, { value: "no", label: "Нет" }] }], II = { couple: ["breakfast", "cable", "hammam", "quad", "promenade"], friends: ["yacht", "rafting", "terrace", "gastro"], kids: ["pool", "kidsclub", "aquapark", "cable"], work: ["workdesk", "sleep", "hammam", "promenade"] }, OI = ["breakfast", "cable", "hammam"], RI = [{ id: "adv", label: "Приключения", icon: "quad-bike", options: ["quad", "rafting", "jeep", "paraglider", "diving", "ski"], for: ["couple", "friends", "work"] }, { id: "mount", label: "Горы и природа", icon: "mountains", options: ["cable", "horse", "waterfall", "tea"] }, { id: "sea", label: "Море", icon: "sea", options: ["beach", "breakfast", "yacht", "sup"] }, { id: "hotel", label: "В отеле", icon: "spa", options: ["hammam", "pool", "sleep", "breakfast", "beach", "terrace", "yoga", "adults", "kidsclub", "workdesk", "dog"] }, { id: "city", label: "Город", icon: "breakfast", options: ["promenade", "gastro", "park"] }, { id: "kids", label: "Для детей", icon: "kids", options: ["aquapark", "fun", "kidsclub", "pool"], for: ["kids"] }], V0 = { polyana: { text: "Лыжи откроются в декабре, а сейчас в горах лучшее время для канатки и троп", months: [5, 6, 7, 8, 9, 10, 11] }, sea: { text: "Бархатный сезон: море тёплое, днём купаются. Вечером прохладнее — пригодится тёплый бассейн", months: [9, 10] }, aquapark: { text: "Уличные аквапарки сейчас закрыты, крытые работают", months: [10, 11, 12, 1, 2, 3, 4, 5] }, yacht: { text: "Яхты выходят, если нет шторма. Лучше бронировать на первый вечер — останется запасной" }, adults: { text: "Отелей только для взрослых в Сочи немного — покажем и просто тихие" } }, An = new Map(Hw.map((e) => [e.id, e])), qt = (e) => An.get(e), Jx = (e) => An.has(e), Ys = (e) => {
  const t = An.get(e);
  if (!t) throw new Error("Unknown idea card " + e);
  return t;
}, Gl = (e, t) => !e.for || e.for.includes(t), Jg = (e, t) => e.titleFor?.[t] ?? e.title;
function Bw(e) {
  return e.childrenAges.length ? "kids" : e.business ? "work" : e.adults >= 3 ? "friends" : "couple";
}
const tu = (e, t) => e.companyChosen ? e.company : Bw(t), Bh = (e) => Number(e.arrival.slice(5, 7)), DI = ["январе", "феврале", "марте", "апреле", "мае", "июне", "июле", "августе", "сентябре", "октябре", "ноябре", "декабре"], LI = (e) => "в " + DI[e - 1], G0 = (e, t) => e.months && !e.months.includes(t) ? e.lock ?? "не сезон" : null, s3 = (e, t = -1, a = 1) => Math.max(t, Math.min(a, e));
function Su(e) {
  let t = 0, a = 0, r = 0;
  for (const l of e.likes) {
    const o = An.get(l);
    o?.calm == null || o.nature == null || (t += o.calm, a += o.nature, r += 1);
  }
  for (const l of e.nopes) {
    const o = An.get(l);
    o?.calm == null || o.nature == null || (t -= 0.4 * o.calm, a -= 0.4 * o.nature, r += 0.4);
  }
  return { calm: e.manual.calm ?? s3(t / (r + 1)), nature: e.manual.nature ?? s3(a / (r + 1)), known: r > 0 || e.manual.calm != null || e.manual.nature != null };
}
const Uw = (e) => [e.calm < -0.25 ? "спокойно" : e.calm > 0.25 ? "активно" : "", e.nature < -0.25 ? "в городе" : e.nature > 0.25 ? "на природе" : ""].filter(Boolean).join(", ") || "без крайностей", MI = { "Красная Поляна": "polyana", Сириус: "imereti", Адлер: "adler", Хоста: "khosta" }, Cu = (e) => MI[e.area] ?? "center", Br = (e, t) => e === t ? 10 : a3[e]?.[t] ?? a3[t]?.[e] ?? 60, PI = (e) => e <= 15 ? `рядом, ${e} минут` : e < 60 ? `${e} минут на машине` : e < 80 ? "около часа на машине" : "около полутора часов", Uh = (e) => typeof e == "string" && e in Za, zI = /* @__PURE__ */ new Set(["spa", "pool", "beach", "parking", "quiet", "adults"]);
function Fh(e, t) {
  const a = zi(e.id);
  return { has: { spa: e.spa, pool: e.pool, beach: e.beach, parking: e.parking, quiet: e.quiet, adults: a.adultsOnly, seaview: isRegionalHotel(e) && e.seaDistance != null && e.seaDistance <= 200, restaurant: a.restaurant, kidsClub: a.kidsClub, work: e.work, pets: e.pets, yoga: null }[t], confirmed: zI.has(t) };
}
const eb = (e) => Hh.find((t) => t.value === e)?.limit ?? null;
function K0(e, t, a, r = 0) {
  for (const o of t.likes) {
    const u = An.get(o);
    if (!(!u?.trait || u.kind === "out") && Fh(e, u.trait).has === false) return false;
  }
  const l = eb(t.answers.budget);
  return !(l !== null && Hi(e, a, r) > l || Uh(t.district) && Cu(e) !== t.district || t.company === "kids" && !e.family);
}
const HI = (e, t, a = 0) => destinationHotels(e,t).filter((r) => K0(r, e, t, a)).length;
function BI(e, t, a, r, l) {
  const o = Cu(e);
  let u = parseFloat(e.rating.replace(",", ".")) / 50;
  for (const f of t.likes) {
    const p = An.get(f);
    if (p) {
      if (p.kind === "out" && p.area && isRegionalHotel(e)) {
        const g = Br(o, p.area);
        u += g <= 15 ? 1.1 : g <= 30 ? 0.6 : g <= 50 ? 0.3 : 0;
      } else if (p.trait) {
        const g = Fh(e, p.trait);
        g.has ? u += g.confirmed ? 1.3 : 1 : g.has === false && (u -= 0.3);
      }
    }
  }
  r.known && isRegionalHotel(e) && (u -= Math.abs(Za[o].nature - r.nature) * 0.5);
  const d = zi(e.id);
  t.company === "kids" && (u += (d.kidsClub ? 1.5 : 0) - (d.adultsOnly ? 9 : 0)), t.company === "couple" && d.kidsClub && (u -= 0.3), t.company === "work" && e.work && (u += 1);
  const h = eb(t.answers.budget);
  if (h !== null) {
    const f = Hi(e, a, l);
    u += f <= h ? 1 : -(f - h) / 1500;
  }
  return Uh(t.district) && (u += o === t.district ? 2.5 : -Br(o, t.district) / 60), u;
}
function UI(e, t, a = 0) {
  const r = Su(e), l = destinationHotels(e,t).map((o) => ({ hotel: o, score: BI(o, e, t, r, a) })).sort((o, u) => u.score - o.score).map((o) => o.hotel);
  return { fitting: l.filter((o) => K0(o, e, t, a)), others: l.filter((o) => !K0(o, e, t, a)) };
}
const Fw = (e) => e.filter((t) => An.get(t)?.kind === "out");
function qw(e) {
  const t = Fw(e.likes);
  return Object.keys(Za).map((a) => {
    const r = t.filter((o) => Br(a, Ys(o).area ?? "center") <= 20), l = t.reduce((o, u) => {
      const d = Br(a, Ys(u).area ?? "center");
      return o + (d <= 15 ? 1 : d <= 30 ? 0.5 : d <= 50 ? 0.25 : 0);
    }, 0);
    return { area: a, near: r, score: l };
  }).sort((a, r) => r.score - a.score);
}
function eh(e) {
  const t = Fw(e.likes), a = t.filter((d) => Ys(d).area === "polyana").length, r = e.likes.some((d) => {
    const h = An.get(d)?.trait;
    return h === "seaview" || h === "beach";
  }), l = t.length - a + (r ? 1 : 0);
  if (!t.length) return { title: "Вам важнее сам отель", text: "Что вокруг — не главное. Район подберём по цене и отзывам", recommended: null, outs: t };
  if (a && l) return { title: "Вам нравятся и горы, и море", text: "Между ними около часа. Ближе всего к горам Сириус: море рядом, до канатки 50 минут", recommended: "imereti", outs: t };
  if (a) return { title: "Похоже, вам ближе горы", text: `${a} из ${t.length} ваших «хочу» — у Красной Поляны. Удобнее жить прямо там`, recommended: "polyana", outs: t };
  const o = qw(e)[0].area, u = t.filter((d) => Br(o, Ys(d).area ?? "center") <= 20).length;
  return { title: o === "center" ? "Похоже, вам ближе город" : o === "khosta" ? "Похоже, вам ближе природа у моря" : "Похоже, вам ближе море", text: `${u} из ${t.length} ваших «хочу» — рядом, если жить ${Za[o].in}`, recommended: o, outs: t };
}
const r3 = (e, t) => e.calm == null || t.calm == null || e.nature == null || t.nature == null ? 0 : 1 - (Math.abs(e.calm - t.calm) + Math.abs(e.nature - t.nature)) / 4 + (e.area && e.area === t.area ? 0.3 : 0) + (e.kind === t.kind ? 0.1 : 0), FI = (e) => (e.charCodeAt(0) * 7 + e.charCodeAt(e.length - 1) * 3) % 10 / 250, i3 = (e) => e.kind === "in" ? "в отеле" : { polyana: "в горах", khosta: "на природе у моря", center: "в городе", adler: "у моря", imereti: "у моря" }[e.area ?? "center"];
function qI(e, t, a, r) {
  return (r.manual.calm != null || r.manual.nature != null) && r.manualAt === r.seen.length ? `Сдвинули шкалу — вот что есть ${i3(e)}` : t && a >= 0.95 ? `Вы отметили «${Ys(t).short}» — вот ещё ${i3(e)}` : r.nopes.filter((o) => (An.get(o)?.calm ?? 0) > 0.4).length >= 2 && (e.calm ?? 0) < 0.2 ? "Без экстрима — вот поспокойнее" : r.nopes.some((o) => (An.get(o)?.nature ?? 0) < -0.5) && (e.nature ?? 0) > 0.3 ? "Без города — вот ближе к природе" : "";
}
function Yw(e, t) {
  const a = new Set(e.seen), r = e.seen.filter((y) => An.get(y) && Ys(y).kind !== "ask").length, l = e.likes.filter((y) => An.get(y) && Ys(y).kind !== "ask"), o = l.filter((y) => Ys(y).kind === "out");
  if (r >= 3 && !a.has("budget")) return { type: "ask", id: "budget", why: "" };
  if (regionalDestination(e) && !a.has("where") && !e.district && (l.length >= 3 && o.length >= 2 || r >= 7)) return { type: "where", id: "where", why: "" };
  if (r >= 6 && !a.has("car")) return { type: "ask", id: "car", why: "" };
  const u = Hw.filter((y) => y.kind !== "ask" && !G0(y, t) && Gl(y, e.company) && destinationAllowed(y,e) && !a.has(y.id));
  if (r >= 12 + e.more || !u.length) return { type: "end", id: "end", why: "", left: u.length > 0 };
  const d = II[e.company].filter((y) => u.some((v) => v.id === y));
  if (r < 5 && d.length) return { type: "ex", id: d[0], why: r === 0 ? "Покажу разное, чтобы понять, что вам ближе" : "" };
  const h = Su(e), f = e.manual.calm != null || e.manual.nature != null, g = u.map((y) => {
    let v = 0, w = null, j = 0;
    for (const C of l) {
      const A = r3(y, Ys(C));
      A > v && (v = A, w = C);
    }
    for (const C of e.nopes) {
      const A = An.get(C);
      A && (j = Math.max(j, r3(y, A)));
    }
    const k = 1 - (Math.abs((y.calm ?? 0) - h.calm) + Math.abs((y.nature ?? 0) - h.nature)) / 4, S = 0.9 * v - 0.8 * j + (f ? 1.4 : 0.5) * k + FI(y.id);
    return { item: y, score: S, similar: v, from: w };
  }).reduce((y, v) => v.score > y.score ? v : y);
  return { type: "ex", id: g.item.id, why: qI(g.item, g.from, g.similar, e) };
}
function YI(e = "couple", t = 9) {
  const a = { mode: "feed", company: e, companyChosen: false, likes: [], nopes: [], seen: [], answers: {}, district: null, manual: { calm: null, nature: null }, manualAt: -1, tips: [], tipAt: -9, more: 0, current: { type: "end", id: "end", why: "" }, note: null, noteSeq: 0 };
  return { ...a, current: Yw(a, t) };
}
function VI(e, t) {
  const a = An.get(e);
  if (!a) return null;
  const r = a.area === "polyana" ? "polyana" : ["beach", "breakfast", "sup"].includes(e) ? "sea" : e in V0 ? e : null;
  if (!r) return null;
  const l = V0[r];
  return !l.months || l.months.includes(t) ? r : null;
}
function keysPreferenceMatches(hotel, ideas) {
 const preferences=[...new Set(ideas.likes)].map(qt).filter(Boolean);
 const matched=preferences.filter(card=>{
  if(card.kind==='out'&&card.area)return isRegionalHotel(hotel)&&Br(Cu(hotel),card.area)<=30;
  if(!card.trait)return false;
  const feature=Fh(hotel,card.trait);
  return feature.has===true&&feature.confirmed===true;
 }).length;
 return {matched,total:preferences.length};
}
function Vw(e, t, a, r = 0) {
  const l = [], o = Cu(e);
  for (const h of t.likes) {
    const f = An.get(h);
    if (!f) continue;
    if (f.kind === "out" && f.area) {
      if(!isRegionalHotel(e)){l.push({kind:"rv",icon:f.icon,text:f.short+" — уточнить расположение"});continue;}
      const g = Br(o, f.area);
      l.push({ kind: g <= 30 ? "ok" : "far", icon: f.icon, text: `${f.short} — ${PI(g)}` });
      continue;
    }
    if (!f.trait) continue;
    const p = Fh(e, f.trait);
    p.has === null ? l.push({ kind: "rv", icon: f.icon, text: `${f.short} — уточним у отеля` }) : p.has ? l.push(p.confirmed ? { kind: "ok", icon: f.icon, text: `${f.short} — есть в отеле` } : { kind: "rv", icon: f.icon, text: `${f.short} — по отзывам гостей, уточним` }) : l.push({ kind: "no", icon: f.icon, text: `${f.short} — ${p.confirmed ? "нет в отеле" : "в отзывах не нашли"}` });
  }
  const u = eb(t.answers.budget);
  if (u !== null) {
    const h = Hi(e, a, r);
    l.push(h <= u ? { kind: "ok", icon: "budget", text: "В вашем бюджете" } : { kind: "no", icon: "budget", text: `Дороже бюджета на ${Ee(h - u)} за ночь` });
  }
  const d = { ok: 0, rv: 1, far: 2, no: 3 };
  return [...l.filter((h) => h.kind !== "no").sort((h, f) => d[h.kind] - d[f.kind]).slice(0, 4), ...l.filter((h) => h.kind === "no").slice(0, 1)];
}
const GI = [["morning", "09:00"], ["day", "12:00"], ["evening", "17:00"], ["night", "20:00"]];
function KI(e, t) {
  const a = Cu(e), r = t.map((o) => An.get(o)).filter((o) => !!o?.slot), l = (o) => o.kind === "out" && o.area ? Br(a, o.area) <= 50 : !!o.trait && Fh(e, o.trait).has === true;
  return GI.flatMap(([o, u]) => {
    const d = r.find((h) => h.slot === o && l(h));
    return d ? [{ id: d.id, time: d.id === "yacht" ? "18:00" : u }] : [];
  });
}
function Gw(e) {
  const t = " " + e.toLocaleLowerCase("ru").replaceAll("ё", "е") + " ", a = [], r = {}, l = [[/вид на море|с видом/, "breakfast"], [/(^|[^а-я])спа([^а-я]|$)|хаммам|массаж|саун/, "hammam"], [/бассейн/, "pool"], [/тих|тиш|спокойн|выспат/, "sleep"], [/пляж/, "beach"], [/ресторан|ужин/, "terrace"], [/только взросл|без детей/, "adults"], [/йог/, "yoga"], [/детск|аниматор/, "kidsclub"], [/работ|интернет|ноутбук/, "workdesk"], [/канатк|роза хутор|гор[аыеу]/, "cable"], [/водопад|поход|треккинг/, "waterfall"], [/рафтинг|сплав/, "rafting"], [/квадро|адреналин/, "quad"], [/джип/, "jeep"], [/парапл|полет/, "paraglider"], [/конн|лошад|верхом/, "horse"], [/яхт|закат/, "yacht"], [/(^|[^а-я])сап|sup|падлборд/, "sup"], [/дайв|погруж|нырн/, "diving"], [/набережн|прогул/, "promenade"], [/гастро|вкусн/, "gastro"], [/дендрар|ривьер/, "park"], [/(^|[^а-я])ча[йя]/, "tea"], [/аквапарк|горк/, "aquapark"], [/лыж|сноуборд/, "ski"], [/аттракцион/, "fun"]];
  for (const [o, u] of l) o.test(t) && a.push(u);
  return /машин|парков|авто/.test(t) && (a.push("car"), r.car = "yes"), /собак|питом|(^|[^а-я])пес([^а-я]|$)/.test(t) && (a.push("dog"), r.dog = "yes"), { likes: a, answers: r };
}
const us = (e) => [...new Set(e)], tb = (e) => e.navigation.screen?.type === "ideas", Bs = (e, t) => {const value={...t,destination:t.destination??e.search.city??'Сочи'};value.likes=value.likes.filter(id=>{const card=qt(id);return card&&destinationAllowed(card,value);});return {...value,current:Yw(value,Bh(e.search))};};
function Kl(e, t, a, r, l = tb(e)) {
  if (!l) return { ...e, ideas: { ...t, note: null }, ui: { ...e.ui, toast: a } };
  const o = t.noteSeq + 1;
  return { ...e, ideas: { ...t, note: { id: o, text: a, action: r }, noteSeq: o } };
}
function bm(e, t, a, r = tb(e)) {
  const l = qt(a), o = HI(t, e.search, e.discovery.priceTick);
  if (l && l.kind !== "out" && o <= 2 && t.likes.length > 1) {
    const d = o === 0 ? "не подходит ни один отель" : o === 1 ? "подходит только один отель" : "подходят только " + Rn(o);
    return Kl(e, t, `С «${l.short}» ${d}. Убрать это желание?`, { label: "Убрать", kind: "drop", cardId: a }, r);
  }
  if (regionalDestination(t) && t.mode === "topics" && !t.tips.includes("where") && !t.district && t.likes.length >= 3 && eh(t).outs.length >= 2) {
    const d = { ...t, tips: [...t.tips, "where"], tipAt: t.seen.length };
    return Kl(e, d, eh(d).title + ". Посмотрим, где жить?", { label: "Где жить", kind: "where" }, r);
  }
  const u = regionalDestination(t)?VI(a, Bh(e.search)):null;
  return u && !t.tips.includes(u) && t.seen.length - t.tipAt >= 2 && (t.mode === "topics" || t.current.type === "ex") ? Kl(e, { ...t, tips: [...t.tips, u], tipAt: t.seen.length }, V0[u].text, void 0, r) : { ...e, ideas: { ...t, note: null } };
}
function XI(e, t) {
  const a = e.ideas;
  switch (t.type) {
    case "IDEAS_DESTINATION": {
      const destination=String(t.city||'*').trim();
      const next={...a,destination,district:null,note:null,tips:[],seen:a.seen.filter(id=>id!=='where')};
      next.likes=next.likes.filter(id=>{const card=qt(id);return card&&destinationAllowed(card,next);});
      return {...e,ideas:Bs(e,next)};
    }
    case "IDEAS_START": {
      const r = a.companyChosen ? a.company : Bw(e.search.party), l = a.likes.filter((h) => {
        const f = qt(h);
        return !f || Gl(f, r);
      }), o = { ...a, company: r, likes: l, mode: t.mode, note: null }, u = t.like;
      if (!u || !Jx(u) || l.includes(u)) return { ...e, ideas: Bs(e, o) };
      const d = Bs(e, { ...o, likes: [...l, u], seen: us([...o.seen, u]) });
      return bm(e, d, u, true);
    }
    case "IDEAS_ANSWER": {
      if (!Jx(t.id)) return e;
      const r = Bs(e, { ...a, seen: us([...a.seen, t.id]), likes: t.liked ? us([...a.likes, t.id]) : a.likes, nopes: t.liked ? a.nopes : us([...a.nopes, t.id]), note: null });
      return t.liked ? bm(e, r, t.id) : { ...e, ideas: r };
    }
    case "IDEAS_ASK": {
      const r = qt(t.id);
      if (r?.kind !== "ask") return e;
      const l = Hh.find((f) => f.value === t.value)?.value, o = t.id === "budget" ? { ...a.answers, budget: l } : { ...a.answers, [t.id]: t.value === "yes" ? "yes" : "no" }, u = !!r.trait && t.value === "yes", d = r.trait ? u ? us([...a.likes, t.id]) : a.likes.filter((f) => f !== t.id) : a.likes, h = Bs(e, { ...a, answers: o, likes: d, seen: us([...a.seen, t.id]), note: null });
      return u ? bm(e, h, t.id) : { ...e, ideas: h };
    }
    case "IDEAS_TOGGLE": {
      if (!Jx(t.id)) return e;
      if (a.likes.includes(t.id)) return { ...e, ideas: { ...a, likes: a.likes.filter((l) => l !== t.id), note: null } };
      const r = Bs(e, { ...a, likes: [...a.likes, t.id], seen: us([...a.seen, t.id]), note: null });
      return bm(e, r, t.id);
    }
    case "IDEAS_DROP":
      return { ...e, ideas: { ...a, likes: a.likes.filter((r) => r !== t.id), answers: t.id === "car" || t.id === "dog" ? { ...a.answers, [t.id]: "no" } : a.answers, note: a.note?.action?.cardId === t.id ? null : a.note } };
    case "IDEAS_LOCKED": {
      const r = qt(t.id);
      return r?.lock ? Kl(e, a, `${Jg(r, a.company)} — ${r.lock}.` + (r.lockNote ? " " + r.lockNote : "")) : e;
    }
    case "IDEAS_DISTRICT": {
      const r = Bs(e, { ...a, district: t.district, seen: us([...a.seen, "where"]), note: null });
      return Uh(t.district) && tb(e) ? Kl(e, r, `Отели ${Za[t.district].in} — теперь наверху подборки`) : { ...e, ideas: r };
    }
    case "IDEAS_COMPANY": {
      const r = a.likes.filter((u) => {
        const d = qt(u);
        return !!d && !Gl(d, t.company);
      }), l = Bs(e, { ...a, company: t.company, companyChosen: true, likes: a.likes.filter((u) => !r.includes(u)) });
      if (!r.length) return { ...e, ideas: l };
      const o = r.map((u) => "«" + (qt(u)?.short ?? u) + "»").join(", ");
      return Kl(e, l, `Убрали ${o}: не подходит, если ${Lr[t.company].lower}.`);
    }
    case "IDEAS_SCALE":
      return { ...e, ideas: { ...a, manual: { ...a.manual, [t.axis]: Math.max(-1, Math.min(1, t.value)) }, manualAt: a.seen.length } };
    case "IDEAS_SCALE_RESET":
      return { ...e, ideas: { ...a, manual: { calm: null, nature: null } } };
    case "IDEAS_MODE":
      return { ...e, ideas: { ...a, mode: t.mode, note: null } };
    case "IDEAS_MORE":
      return { ...e, ideas: Bs(e, { ...a, more: a.more + 6 }) };
    case "IDEAS_WISH": {
      const r = t.likes.filter((l) => {
        const o = qt(l);
        return !!o && Gl(o, a.company) && destinationAllowed(o,a);
      });
      return { ...e, ideas: Bs(e, { ...a, likes: us([...a.likes, ...r]), seen: us([...a.seen, ...r]), answers: { ...a.answers, ...t.answers } }) };
    }
    case "IDEAS_NOTE_CLEAR":
      return a.note?.id === t.id ? { ...e, ideas: { ...a, note: null } } : e;
  }
}

return {destinationOptions,regionalDestination,destinationAllowed,cards:Hw,topics:RI,companies:Lr,areas:Za,budgets:Hh,tints:_I,get:qt,title:Jg,allowed:Gl,locked:G0,initial:YI,company:Bw,month:Bh,mood:Su,moodLabel:Uw,reduce:XI,rank:UI,reasons:Vw,matches:keysPreferenceMatches,plan:KI,parse:Gw,advice:eh,areasRank:qw,refresh:Bs};
})();
