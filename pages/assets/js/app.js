<script>
const I18N = {
  jp: { langName:"日本語", home:"メニュー", prev:"前へ", next:"次へ", audio:"音声ガイド",
    "title.season-dinner":"夕食案内","title.breakfast":"朝食提供","title.steak-plan":"和牛ステーキプラン","title.seasonal-menu":"季節の献立","title.checkin":"チェックイン",
    "h1.season-dinner":"夕食のご案内","h1.breakfast":"朝食のご提供手順","h1.steak-plan":"和牛ステーキプランの説明","h1.seasonal-menu":"季節の献立のポイント","h1.checkin":"チェックイン手順",
  },
  np: { langName:"नेपाली", home:"मेनु", prev:"अघिल्लो", next:"अर्को", audio:"अडियो गाइड",
    "title.season-dinner":"साँझको भोजन जानकारी","title.breakfast":"बिहानको भोजन सेवा","title.steak-plan":"वाग्यु स्टेक योजना","title.seasonal-menu":"मौसमी मेनु","title.checkin":"चेक-इन म्यानुअल",
    "h1.season-dinner":"साँझको भोजन मार्गदर्शन","h1.breakfast":"बिहानको सेवा प्रक्रिया","h1.steक-plan":"वाग्यु स्टेक योजनाको विवरण","h1.seasonal-menu":"मौसमी मेनुको मुख्य बुँदा","h1.checkin":"चेक-इन प्रक्रिया",
  }
};

const PAGES = [
  { id:"season-dinner", file:"season-dinner.html", audio:"assets/audio/season-dinner.mp3", top:"assets/img/top_season-dinner.jpg" },
  { id:"breakfast", file:"breakfast.html", audio:"assets/audio/breakfast.mp3", top:"assets/img/top_breakfast.jpg" },
  { id:"steak-plan", file:"steak-plan.html", audio:"assets/audio/steak-plan.mp3", top:"assets/img/top_steak-plan.jpg" },
  { id:"seasonal-menu", file:"seasonal-menu.html", audio:"assets/audio/seasonal-menu.mp3", top:"assets/img/top_seasonal-menu.jpg" },
  { id:"checkin", file:"checkin.html", audio:"assets/audio/checkin.mp3", top:"assets/img/top_checkin.jpg" },
];

const getLang = () => localStorage.getItem("lang") || "jp";
const setLang = (l) => { localStorage.setItem("lang", l); applyI18n(); };

function applyI18n(){
  const lang = getLang();
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(I18N[lang] && I18N[lang][key]) el.textContent = I18N[lang][key];
  });
  const pageId = document.body.dataset.page;
  if(pageId && I18N[lang][`title.${pageId}`]) {
    document.title = I18N[lang][`title.${pageId}`] + " | きぬ川不動瀧 マニュアル";
  }
}

function setupNav(){
  const pageId = document.body.dataset.page;
  const idx = PAGES.findIndex(p=>p.id===pageId);
  const prev = document.getElementById("nav-prev");
  const next = document.getElementById("nav-next");
  const home = document.getElementById("nav-home");
  if(prev && idx>0) prev.href = PAGES[idx-1].file; else if(prev) prev.classList.add("is-disabled");
  if(next && idx<PAGES.length-1) next.href = PAGES[idx+1].file; else if(next) next.classList.add("is-disabled");
  if(home) home.href = "index.html";

  const top = document.querySelector(".top-hero");
  if(top && idx>=0) top.style.backgroundImage = `url('${PAGES[idx].top}')`;

  const audio = document.getElementById("guide-audio");
  if(audio && idx>=0) audio.src = PAGES[idx].audio;

  let xStart = null;
  document.addEventListener("touchstart",(e)=>{ xStart = e.touches[0].clientX; }, {passive:true});
  document.addEventListener("touchend",(e)=>{
    if(xStart===null) return;
    const dx = e.changedTouches[0].clientX - xStart;
    const SWIPE = 60;
    if(dx > SWIPE && idx>0) location.href = PAGES[idx-1].file;
    if(dx < -SWIPE && idx<PAGES.length-1) location.href = PAGES[idx+1].file;
    xStart = null;
  }, {passive:true});
}

function setupLangToggle(){
  const jpBtn = document.getElementById("btn-jp");
  const npBtn = document.getElementById("btn-np");
  if(jpBtn) jpBtn.addEventListener("click", ()=> setLang("jp"));
  if(npBtn) npBtn.addEventListener("click", ()=> setLang("np"));
}

document.addEventListener("DOMContentLoaded", ()=>{
  applyI18n();
  setupNav();
  setupLangToggle();
});
</script>
