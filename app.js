const RULE_NAMES = {
  insane: "인세인",
  shinobigami: "시노비가미",
  magicalogica: "마기카로기아",
  stratoshout: "스트라토 샤우트"
};

function isLyrics() { return isStrato() && selectedValue("stratoTab") === "lyrics"; }
function isStrato() { return window.location.hash === "#stratoshout"; }
function isMagica() { return window.location.hash === "#magicalogica"; }
function isShinobi() { return window.location.hash === "#shinobigami"; }

function showPage() {
  const rule = window.location.hash.slice(1);
  const isHome = !Object.prototype.hasOwnProperty.call(RULE_NAMES, rule);
  document.querySelector("#homePage").hidden = !isHome;
  document.querySelector("#editorPage").hidden = isHome;
  document.title = isHome ? "사이코로 픽션 공식풍 핸드아웃 메이커" : `${RULE_NAMES[rule]} 핸드아웃 메이커`;
}

const TYPE_CONFIG = {
  public: { fileName: "insane-public-handout.png" },
  secret: { fileName: "insane-secret-handout.png" },
  madness: { fileName: "insane-madness-card.png" },
  ritual: { fileName: "insane-ritual-sheet.png" }
};

const RITUAL_STEPS = 6;

const fields = {
  titleField: document.querySelector("#titleField"),
  title: document.querySelector("#titleInput"),
  metaField: document.querySelector("#metaField"),
  metaLabel: document.querySelector("#metaLabel"),
  meta: document.querySelector("#metaInput"),
  bodyField: document.querySelector("#bodyInput").closest(".stacked-field"),
  body: document.querySelector("#bodyInput"),
  enigmaFields: document.querySelector("#enigmaFields"),
  enigmaCondition: document.querySelector("#enigmaConditionInput"),
  enigmaEffect: document.querySelector("#enigmaEffectInput"),
  ritualFields: document.querySelector("#ritualFields"),
  ritualRows: document.querySelector("#ritualRows"),
  status: document.querySelector("#statusMessage"),
  preview: document.querySelector("#handoutPreview"),
  copyButton: document.querySelector("#copyHtmlButton"),
  saveButton: document.querySelector("#savePngButton"),
  clearButton: document.querySelector("#clearInputsButton"),
  symbolButtons: document.querySelectorAll("[data-insert]")
};

let lastFocusedTextField = fields.body;
const formDrafts = new Map();
let activeFormKey = null;
let textFields = [];
let defaultTextValues = [];

function buildRitualInputs() {
  const rows = [];
  for (let step = 1; step <= RITUAL_STEPS; step += 1) {
    rows.push(`<div class="ritual-row"><input class="ritual-input" data-step="${step}" data-key="step" type="text"><input class="ritual-input" data-step="${step}" data-key="name" type="text"><input class="ritual-input" data-step="${step}" data-key="skill" type="text"><input class="ritual-input" data-step="${step}" data-key="condition" type="text"><input class="ritual-input" data-step="${step}" data-key="penalty" type="text"></div>`);
  }
  fields.ritualRows.innerHTML = rows.join("");
}

function selectedValue(name) {
  return document.querySelector(`input[name="${name}"]:checked`).value;
}

function readInputGroup(key) {
  return Object.fromEntries(Array.from(document.querySelectorAll(`[data-${key}]`), input => [input.dataset[key], input.value.trim()]));
}

function getType() {
  const group = isStrato() ? "stratoSide" : isMagica() ? "magicaVisibility" : isShinobi() ? "shinobiVisibility" : "handoutType";
  return selectedValue(group);
}

function getFormKey() {
  const rule = window.location.hash.slice(1);
  if (!Object.prototype.hasOwnProperty.call(RULE_NAMES, rule)) return null;
  if (isLyrics()) return "stratoshout:lyrics";
  const tab = isStrato() ? "card" : isMagica() ? selectedValue("magicaTab") : isShinobi() ? selectedValue("shinobiTab") : "handout";
  return `${rule}:${tab}:${getType()}`;
}

function switchFormDraft() {
  const nextKey = getFormKey();
  if (!nextKey || nextKey === activeFormKey) return;

  // Capture the outgoing form before reusing its inputs for another layout.
  if (activeFormKey) formDrafts.set(activeFormKey, textFields.map(field => field.value));
  const draft = formDrafts.get(nextKey) || defaultTextValues;
  textFields.forEach((field, index) => { field.value = draft[index]; });
  activeFormKey = nextKey;
  lastFocusedTextField = fields.body;
}

function values() {
  return {
    title: fields.title.value.trim(),
    meta: fields.meta.value.trim(),
    body: fields.body.value.trim(),
    condition: fields.enigmaCondition.value.trim(),
    effect: fields.enigmaEffect.value.trim(),
    lyrics: readInputGroup("lyrics"),
    strato: readInputGroup("strato"),
    fragment: readInputGroup("fragment"),
    ritualRows: getRitualRows()
  };
}

function getRitualRows() {
  const rows = Array.from({ length: RITUAL_STEPS }, () => ({
    step: "",
    name: "",
    skill: "",
    condition: "",
    penalty: ""
  }));

  fields.ritualRows.querySelectorAll(".ritual-input").forEach((input) => {
    const stepIndex = Number(input.dataset.step) - 1;
    rows[stepIndex][input.dataset.key] = input.value.trim();
  });

  return rows;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br>");
}

function triggerHtml(text) {
  return text
    .split(/\r?\n/)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");
}

// Flexible frames keep the original 300 × 420 minimum and grow with their body.
// The 9.2px bottom padding preserves the original space below the 28.8px heading.
function publicHtml(data) {
  return `<div style="width:300px; min-height:420px; display:flex; flex-direction:column; box-sizing:border-box; border:1px solid #111; background:#fff; font-family:Arial, 'Noto Sans KR', sans-serif; color:#111; padding:10px 0 9.2px;"><div style="text-align:center; font-size:24px; font-weight:500; line-height:1.2; margin-bottom:6px;">Handout</div><div style="width:278px; min-height:364px; flex:1; display:flex; flex-direction:column; margin:0 auto; border:2px solid #111; box-sizing:border-box; padding:3px;"><div style="width:100%; flex:1; display:flex; flex-direction:column; border:1px solid #666; box-sizing:border-box;"><div style="display:flex; height:38px; flex-shrink:0; border-bottom:1px solid #111; box-sizing:border-box;"><div style="width:53px; border-right:1px solid #777; display:flex; align-items:center; justify-content:center; font-size:16px; line-height:1; font-weight:bold; box-sizing:border-box;">이름</div><div style="flex:1; display:flex; align-items:center; padding-left:11px; font-size:16px; line-height:1; box-sizing:border-box;">${escapeHtml(data.title)}</div></div><div style="height:31px; flex-shrink:0; border-bottom:1px solid #111; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">사명</div><div style="flex:1; overflow-wrap:anywhere; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box;">${escapeHtml(data.body)}</div></div></div></div>`;
}

// Reserve the original 23px footer area while the body and both borders grow.
function secretHtml(data) {
  return `<div style="width:300px; min-height:420px; display:flex; flex-direction:column; overflow:hidden; box-sizing:border-box; background:#000; font-family:Arial, 'Noto Sans KR', sans-serif; color:#fff; padding:10px 0 9.2px;"><div style="text-align:center; font-size:24px; font-weight:500; line-height:1.2; margin-bottom:6px;">Handout</div><div style="width:280px; min-height:366px; flex:1; display:flex; flex-direction:column; margin:0 auto; border:3px solid #fff; box-sizing:border-box; padding:3px;"><div style="width:100%; flex:1; display:flex; flex-direction:column; padding-bottom:23px; border:1px solid #fff; box-sizing:border-box; position:relative;"><div style="height:28px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">비밀</div><div style="display:flex; height:39px; flex-shrink:0; background:#fff; color:#000; border-bottom:1px solid #000; box-sizing:border-box; margin-left:2px; margin-right:2px;"><div style="width:53px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:16px; line-height:1; font-weight:bold; box-sizing:border-box;">쇼크</div><div style="flex:1; display:flex; align-items:center; padding-left:11px; font-size:16px; line-height:1; box-sizing:border-box;">${escapeHtml(data.meta)}</div></div><div style="min-height:262px; flex:1; overflow-wrap:anywhere; background:#fff; color:#000; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box; margin-left:2px; margin-right:2px;">${escapeHtml(data.body)}</div><div style="position:absolute; left:0; right:0; bottom:0; height:34px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#fff; box-sizing:border-box; transform:translateY(5px);">이 비밀을 스스로 밝힐 수는 없다.</div></div></div></div>`;
}

function madnessHtml(data) {
  return `<div style="width:300px; min-height:420px; display:flex; flex-direction:column; overflow:hidden; box-sizing:border-box; background:#000; font-family:Arial, 'Noto Sans KR', sans-serif; color:#fff; padding:10px 0 9.2px;"><div style="text-align:center; font-size:24px; font-weight:500; line-height:1.2; margin-bottom:8px;">Handout</div><div style="width:280px; min-height:364px; flex:1; display:flex; flex-direction:column; margin:0 auto; border:3px solid #fff; box-sizing:border-box; padding:3px;"><div style="width:100%; flex:1; display:flex; flex-direction:column; padding-bottom:23px; box-sizing:border-box; position:relative;"><div style="background:#fff; color:#000; flex:1; display:flex; flex-direction:column;"><div style="display:flex; height:32px; flex-shrink:0; border-bottom:1px solid #000; box-sizing:border-box;"><div style="width:60px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:16px; line-height:1; font-weight:bold; box-sizing:border-box;">광기</div><div style="flex:1; display:flex; align-items:center; padding-left:11px; font-size:16px; line-height:1; font-weight:bold; box-sizing:border-box;">${escapeHtml(data.title)}</div></div><div style="display:flex; height:33px; flex-shrink:0; border-bottom:1px solid #000; box-sizing:border-box;"><div style="width:60px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:16px; line-height:1; font-weight:bold; box-sizing:border-box;">트리거</div><div data-trigger style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center; padding-left:11px; font-size:16px; line-height:1; overflow-wrap:anywhere; box-sizing:border-box;"><div data-trigger-text style="flex-shrink:0; width:100%;">${triggerHtml(data.meta)}</div></div></div><div style="min-height:264px; flex:1; overflow-wrap:anywhere; color:#000; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box;">${escapeHtml(data.body)}</div></div><div style="position:absolute; left:0; right:0; bottom:0; height:34px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#fff; box-sizing:border-box; transform:translateY(6px);">이 광기를 스스로 밝힐 수는 없다.</div></div></div></div>`;
}

function ritualCellHtml(text) {
  return `<div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; padding:0 6px; box-sizing:border-box; font-size:14px; line-height:1.2; overflow-wrap:anywhere;">${escapeHtml(text)}</div>`;
}

function ritualRowHtml(row, hasBottomBorder) {
  const border = hasBottomBorder ? " border-bottom:1px solid #000;" : "";
  return `<div style="display:grid; grid-template-columns:70px 125px 97px 185px 1fr; height:40px;${border} box-sizing:border-box; font-size:16px;">${ritualCellHtml(row.step)}${ritualCellHtml(row.name)}${ritualCellHtml(row.skill)}${ritualCellHtml(row.condition)}<div style="display:flex; align-items:center; justify-content:center; padding:0 6px; box-sizing:border-box; font-size:14px; line-height:1.2; overflow-wrap:anywhere;">${escapeHtml(row.penalty)}</div></div>`;
}

function ritualHtml(data) {
  const rows = data.ritualRows
    .map((row, index) => ritualRowHtml(row, index < RITUAL_STEPS - 1))
    .join("");

  return `<div id="ritual-sheet" style="width:700px; height:360px; box-sizing:border-box; background:#fff; font-family:Arial, 'Noto Sans KR', sans-serif; color:#000; padding:6px;"><div style="width:688px; height:344px; border:3px solid #111; box-sizing:border-box; padding:4px;"><div style="width:100%; height:100%; border:1px solid #555; box-sizing:border-box;"><div style="display:flex; height:44px; border-bottom:2px solid #111; box-sizing:border-box;"><div style="width:135px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; box-sizing:border-box; transform:translateY(-1px);">의식 시트</div><div style="flex:1; display:flex; align-items:center; padding-left:16px; font-size:22px; box-sizing:border-box; transform:translateY(-1px);">의식명: ${escapeHtml(data.title)}</div></div><div style="display:grid; grid-template-columns:70px 125px 97px 185px 1fr; height:44px; border-bottom:1px solid #000; box-sizing:border-box; font-size:16px; font-weight:bold;"><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">단계</div><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">절차명</div><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">지정 특기</div><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">참가 조건</div><div style="display:flex; align-items:center; justify-content:center; box-sizing:border-box;">페널티</div></div>${rows}</div></div></div>`;
}

function shinobiSecretHtml(data) {
  return `<div style="width:300px; min-height:420px; display:flex; flex-direction:column; overflow:hidden; box-sizing:border-box; background:#000; font-family:Arial, 'Noto Sans KR', sans-serif; color:#fff; padding:10px 0 9.2px;"><div style="text-align:center; font-size:24px; font-weight:500; line-height:1.2;">Handout</div><div style="height:45px; display:flex; align-items:flex-end; justify-content:center; box-sizing:border-box; padding-bottom:9px;"><div style="text-align:center; font-size:12px; line-height:1.2; margin:0;">이 비밀을<br>스스로 밝힐 수는 없다</div></div><div style="width:280px; min-height:327px; flex:1; display:flex; flex-direction:column; margin:0 auto; border:3px solid #fff; box-sizing:border-box; padding:3px;"><div style="width:100%; flex:1; border:1px solid #fff; box-sizing:border-box; display:flex; flex-direction:column;"><div style="height:28px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">비밀</div><div style="flex:1; overflow-wrap:anywhere; background:#fff; color:#000; margin:0 2px; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box;">${escapeHtml(data.body)}</div></div></div></div>`;
}

function personaSecretHtml(data) {
  return publicHtml(data)
    .replace(">Handout</div>", ">페르소나</div>")
    .replace(">사명</div>", ">진실</div>")
    .replace("background:#fff;", "background:#000;")
    .replace("color:#111;", "color:#fff;")
    .replaceAll("solid #111", "solid #fff")
    .replaceAll("solid #666", "solid #fff")
    .replaceAll("solid #777", "solid #fff")
    .replace("flex:1; display:flex; align-items:center; padding-left:11px;", "flex:1; background:#fff; color:#111; display:flex; align-items:center; padding-left:11px;")
    .replace("padding:10px; font-size:16px; line-height:1.5;", "background:#fff; color:#111; padding:10px; font-size:16px; line-height:1.5;");
}

function enigmaSectionHtml(label, text, divided) {
  return `<div style="box-sizing:border-box; padding:0 5px 5px;${divided ? ' border-bottom:1px solid #111;' : ''}"><div style="height:7px; margin:8px 0 8px; border-radius:4px; background:#666; text-align:center;"><span style="position:relative; top:-9px; font-size:10px; line-height:12px; font-weight:bold; color:#333; text-shadow:-1px -1px 0 #fff,1px -1px 0 #fff,-1px 1px 0 #fff,1px 1px 0 #fff;">${label}</span></div><div style="padding:0 5px; font-size:16px; line-height:1.5; overflow-wrap:anywhere;">${escapeHtml(text)}</div></div>`;
}

function enigmaSecretHtml(data) {
  const originalBody = `<div style="flex:1; overflow-wrap:anywhere; background:#fff; color:#111; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box;">${escapeHtml(data.body)}</div>`;
  const splitBody = `<div style="flex:1; display:grid; grid-template-rows:repeat(2,minmax(min-content,1fr)); background:#fff; color:#111; box-sizing:border-box;">${enigmaSectionHtml('해제 조건', data.condition, true)}${enigmaSectionHtml('효과', data.effect, false)}</div>`;
  return personaSecretHtml(data)
    .replace(">페르소나</div>", ">에니그마</div>")
    .replace(">진실</div>", ">전력</div>")
    .replace(originalBody, splitBody);
}

function fragmentInfoHtml(data) {
  const groups = [[["name","단장"]],[["depth","초기 빙의 심도"]],[["attack","공격력"],["defense","방어력"],["source","근원력"]],[["mana","마력"]],[["magic","마법"]],[["domain","영역"],["skill","특기"]]];
  return `<div style="flex:1; display:grid; grid-template-rows:repeat(6,minmax(min-content,1fr)); box-sizing:border-box;">${groups.map(group => `<div style="display:grid; grid-template-columns:repeat(${group.length},minmax(0,1fr));">${group.map(([key,label]) => `<div style="display:flex; align-items:center; min-width:0; padding:0 5px; font-size:14px; line-height:1.2; box-sizing:border-box;"><span style="flex-shrink:0;">${label}${key === 'name' ? ' 〈' : ':'}</span><span style="flex:1; min-width:0; overflow-wrap:anywhere; white-space:pre-wrap;">${escapeHtml(data.fragment[key] || '')}</span>${key === 'name' ? '<span>〉</span>' : ''}</div>`).join('')}</div>`).join('')}</div>`;
}

function magicaHtml(type, data) {
  const secret = type === "secret";
  const background = secret ? "#000" : "#fff";
  const foreground = secret ? "#fff" : "#111";
  const nameRow = secret ? "" : `<div style="display:flex; height:38px; flex-shrink:0; border-bottom:1px solid #111; box-sizing:border-box;"><div style="width:53px; flex-shrink:0; border-right:1px solid #111; display:flex; align-items:center; justify-content:center; font-size:16px; line-height:1; font-weight:bold; box-sizing:border-box;">이름</div><div style="flex:1; min-width:0; display:flex; align-items:center; padding-left:11px; font-size:16px; line-height:1; box-sizing:border-box;">${escapeHtml(data.title)}</div></div>`;
  const fragment = selectedValue("magicaTab") === "fragment";
  const body = secret && fragment
    ? `<div style="flex:1; display:grid; grid-template-rows:repeat(2,minmax(min-content,1fr)); background:#fff; color:#111; box-sizing:border-box;"><div style="padding:10px; font-size:16px; line-height:1.5; overflow-wrap:anywhere; box-sizing:border-box;">${escapeHtml(data.body)}</div><div style="border-top:1px solid #111; background:#c5c5c5; display:flex; flex-direction:column; box-sizing:border-box;">${fragmentInfoHtml(data)}</div></div>`
    : `<div style="flex:1; background:#fff; color:#111; padding:10px; box-sizing:border-box; font-size:16px; line-height:1.5; overflow-wrap:anywhere;">${escapeHtml(data.body)}</div>`;
  return `<div style="width:300px; min-height:420px; display:flex; flex-direction:column; box-sizing:border-box; ${secret ? "" : "border:1px solid #111;"} padding:10px; background:${background}; color:${foreground}; font-family:Arial, 'Noto Sans KR', sans-serif;"><div style="width:100%; flex:1; display:flex; flex-direction:column; border:2px solid ${foreground}; padding:3px; box-sizing:border-box;"><div style="width:100%; flex:1; border:1px solid ${foreground}; display:flex; flex-direction:column; box-sizing:border-box;"><div style="height:32px; flex-shrink:0; ${secret ? "" : "border-bottom:1px solid #111;"} box-sizing:border-box; display:flex; align-items:center; justify-content:center; font-size:20px; line-height:1.2; font-weight:500;">${secret ? '비밀' : '개요'}</div>${nameRow}${body}</div></div></div>`;
}

function stratoHtml(type, data) {
  const v = data.strato;
  const cell = (text, height = "28px", padding = "5px 8px") => `<div style="background:#fff; color:#111; padding:${padding}; min-height:${height}; font-size:16px; line-height:1.3; box-sizing:border-box; overflow-wrap:anywhere;">${escapeHtml(text)}</div>`;
  const frontCell = (text) => `<div style="height:36px; flex-shrink:0; background:#fff; color:#111; padding:0 8px; display:flex; align-items:center; overflow:hidden; font-size:16px; line-height:1.3; box-sizing:border-box;">${escapeHtml(text)}</div>`;
  const heading = (text) => `<div style="background:#111; color:#fff; text-align:center; font-size:14px; line-height:1.5; font-weight:bold;">${text}</div>`;
  if (type === "public") return `<div style="width:300px; height:420px; background:#000; color:#fff; padding:10px; box-sizing:border-box; font-family:Arial, 'Noto Sans KR', sans-serif;"><div style="height:100%; border:2px solid #fff; padding:8px; box-sizing:border-box; display:flex; flex-direction:column;"><div style="text-align:center; font-size:24px; line-height:1.2; font-weight:500; margin-bottom:16px;">굴레</div><div style="font-size:14px; margin-bottom:4px;">넘버</div><div style="display:grid; grid-template-columns:48px minmax(0,1fr); gap:6px; flex-shrink:0;">${frontCell(v.number)}${frontCell(v.name)}</div><div style="font-size:14px; margin:10px 0 4px;">지정특기</div>${frontCell(v.skill)}<div style="margin-top:4px; flex-shrink:0;">${frontCell(v.skillExtra)}</div><div style="flex:1; display:flex; align-items:center; justify-content:center; text-align:center; font-size:14px; line-height:1.6;">이 카드의<br>뒷면은 접근 판정이<br>성공하면 공개된다.</div><div style="flex-shrink:0; text-align:center; font-size:28px; line-height:1.2; font-weight:700; white-space:nowrap;">STRATo SHoUT</div></div></div>`;
  return `<div style="width:300px; min-height:420px; display:flex; flex-direction:column; border:1px solid #111; background:#fff; color:#111; padding:10px; box-sizing:border-box; font-family:Arial, 'Noto Sans KR', sans-serif;"><div style="flex:1; border:2px solid #111; padding:8px; box-sizing:border-box; display:flex; flex-direction:column; gap:8px;"><div style="flex:1; padding:0 8px; box-sizing:border-box; font-size:16px; line-height:1.5; overflow-wrap:anywhere;">${escapeHtml(data.body)}</div><div style="min-height:57px; flex-shrink:0;">${heading('정체')}${cell(v.identity, "36px")}</div><div style="display:grid; grid-template-columns:64px minmax(0,1fr); gap:8px; min-height:142px; flex-shrink:0;"><div style="border:1px solid #111; text-align:center;">${heading('지배력')}<div style="padding:5px; font-size:12px; line-height:1.5;">공개 시</div>${cell(v.publicPower, "28px", "0")}<div style="padding:5px; font-size:12px; line-height:1.5;">비공개 시</div>${cell(v.secretPower, "28px", "0")}</div><div>${heading('효과')}${cell(v.effect, "121px")}</div></div></div></div>`;
}

function lyricsHtml(data) {
  const v = data.lyrics;
  const parts = ['A', 'B', 'C'].map((part, i) => `<section style="min-height:0; display:flex; flex-direction:column;"><div style="height:24px; flex-shrink:0; text-align:center; background:#111; color:#fff; font-size:16px; line-height:24px;">${part} 파트 / 제 ${i+1} 라운드</div><div style="flex:1; min-height:0; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20px; padding:10px 12px; box-sizing:border-box;">${['Left','Right'].map(side => `<div style="min-height:0; overflow:hidden; font-size:16px; line-height:1.5; overflow-wrap:anywhere;">${escapeHtml(v[part+side])}</div>`).join('')}</div></section>`).join('');
  return `<div style="width:600px; height:840px; overflow:hidden; box-sizing:border-box; border:1px solid #111; padding:16px; background:#fff; color:#111; font-family:Arial, 'Noto Sans KR', sans-serif; display:flex; flex-direction:column;"><div style="height:82px; flex-shrink:0;"><div style="height:40px; overflow:hidden; font-size:28px; line-height:1.2; font-weight:500;">${escapeHtml(v.title)}</div><div style="height:28px; padding:3px 0; overflow:hidden; box-sizing:border-box; background:#fff; color:#111; font-size:16px; line-height:22px;">노래: ${escapeHtml(v.author)}</div></div><div style="flex:1; min-height:0; display:grid; grid-template-rows:repeat(3,minmax(0,1fr)); gap:12px;">${parts}</div></div>`;
}

function handoutHtml(type, data) {
  if (isLyrics()) return lyricsHtml(data);
  if (isStrato()) return stratoHtml(type, data);
  if (isMagica()) return magicaHtml(type, data);
  if (isShinobi()) {
    const tab = selectedValue("shinobiTab");
    if (tab === "enigma" && type === "secret") return enigmaSecretHtml(data);
    if (tab === "persona" && type === "secret") return personaSecretHtml(data);
    if (type === "public" && (tab === "enigma" || tab === "persona")) {
      const heading = tab === "persona" ? "페르소나" : "에니그마";
      return publicHtml(data).replace(">Handout</div>", `>${heading}</div>`).replace(">사명</div>", ">위장</div>");
    }
    if (type === "secret") return shinobiSecretHtml(data);
  }
  if (type === "public") return publicHtml(data);
  if (type === "madness") return madnessHtml(data);
  if (type === "ritual") return ritualHtml(data);
  return secretHtml(data);
}

function updatePreview() {
  switchFormDraft();
  const type = getType();
  const shinobi = isShinobi();
  const magica = isMagica();
  const strato = isStrato();
  const lyrics = isLyrics();
  document.querySelector("#lyricsFields").hidden = !lyrics;
  document.querySelector("#stratoSideControls").hidden = lyrics;
  document.querySelector("#stratoControls").hidden = !strato;
  document.querySelector("#stratoFrontFields").hidden = !strato || lyrics || type !== "public";
  document.querySelector("#stratoBackFields").hidden = !strato || lyrics || type !== "secret";
  document.querySelector("#fragmentFields").hidden = !(magica && type === "secret" && selectedValue("magicaTab") === "fragment");
  const tab = shinobi ? selectedValue("shinobiTab") : "basic";
  document.querySelector("#insaneControls").hidden = shinobi || magica || strato;
  document.querySelector("#magicaControls").hidden = !magica;
  document.querySelector("#shinobiControls").hidden = !shinobi;
  fields.titleField.hidden = strato || (type === "secret" && !(shinobi && (tab === "persona" || tab === "enigma")));
  fields.metaField.hidden = strato || magica || shinobi || type === "public" || type === "ritual";
  const enigmaSecret = shinobi && tab === "enigma" && type === "secret";
  fields.enigmaFields.hidden = !enigmaSecret;
  fields.bodyField.hidden = lyrics || type === "ritual" || enigmaSecret || (strato && type === "public");
  fields.ritualFields.hidden = type !== "ritual";
  fields.metaLabel.textContent = type === "secret" ? "쇼크" : "트리거";
  fields.preview.innerHTML = handoutHtml(type, values());
  fitMadnessTrigger();
  constrainCardText();
}

function getSelfContainedHtml() {
  updatePreview();
  return fields.preview.firstElementChild.outerHTML;
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.inset = "0 auto auto 0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  return copied;
}

async function copyHtml() {
  const html = getSelfContainedHtml();

  if (navigator.clipboard && window.ClipboardItem && window.isSecureContext) {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([html], { type: "text/plain" })
    });
    await navigator.clipboard.write([item]);
    setStatus("스타일이 적용된 HTML을 클립보드에 복사했습니다.");
    return;
  }

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(html);
    setStatus("브라우저 제한으로 HTML 코드를 텍스트로 복사했습니다.");
    return;
  }

  if (!fallbackCopy(html)) {
    throw new Error("copy failed");
  }
  setStatus("브라우저 제한으로 HTML 코드를 텍스트로 복사했습니다.");
}

function insertSymbol(pair) {
  const visible = visibleTextFields();
  const target = visible.includes(lastFocusedTextField) ? lastFocusedTextField : visible[0];
  if (!target) return;
  const start = target.selectionStart ?? target.value.length;
  const end = target.selectionEnd ?? target.value.length;
  const selected = target.value.slice(start, end);
  const nextText = `${pair[0]}${selected}${pair[1]}`;

  target.setRangeText(nextText, start, end, "end");
  if (!selected) {
    target.setSelectionRange(start + 1, start + 1);
  }
  target.focus();
  updatePreview();
}

function visibleTextFields() {
  return Array.from(document.querySelectorAll('.editor-panel input[type="text"], .editor-panel textarea'))
    .filter(field => !field.closest("[hidden]"));
}

function clearInputs() {
  const visible = visibleTextFields();
  visible.forEach(field => { field.value = ""; });
  lastFocusedTextField = visible.includes(fields.body) ? fields.body : visible[0];
  updatePreview();
  setStatus("현재 레이아웃의 입력 내용을 지웠습니다.");
}

function downloadFileName() {
  const type = getType();
  if (isLyrics()) return "stratoshout-lyrics-sheet.png";
  if (isStrato()) return `stratoshout-shackle-${type === "public" ? "front" : "back"}.png`;
  if (isMagica()) return `magicalogica-${selectedValue("magicaTab")}-${type}-handout.png`;
  if (isShinobi()) return `shinobigami-${selectedValue("shinobiTab")}-${type}-handout.png`;
  return TYPE_CONFIG[type].fileName;
}

async function savePng() {
  updatePreview();

  const target = fields.preview.firstElementChild;
  if (!target || !window.htmlToImage) {
    throw new Error("html-to-image is not available");
  }

  const dataUrl = await window.htmlToImage.toPng(target, {
    cacheBust: true,
    pixelRatio: 2
  });

  const link = document.createElement("a");
  link.download = downloadFileName();
  link.href = dataUrl;
  link.click();
  setStatus("PNG 파일을 저장했습니다.");
}

function registerTextField(field) {
  field.addEventListener("focus", () => {
    lastFocusedTextField = field;
  });
  field.addEventListener("input", updatePreview);
}

function setStatus(message) {
  fields.status.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    fields.status.textContent = "";
  }, 2600);
}

function fitMadnessTrigger() {
  const trigger = fields.preview.querySelector("[data-trigger]");
  if (!trigger) return;
  const text = trigger.querySelector("[data-trigger-text]");
  if (text.getBoundingClientRect().height > 32.5) {
    trigger.style.fontSize = "11px";
    trigger.style.lineHeight = "1.1";
  }
}

function constrainCardText() {
  const card = fields.preview.firstElementChild;
  if (!card) return;
  card.style.overflow = "hidden";
  fields.preview.querySelectorAll('div').forEach(element => {
    if (element.style.paddingLeft === "11px") {
      element.style.minWidth = "0";
      element.style.overflow = "hidden";
    }
    if (element.style.width === "53px" || element.style.width === "60px") element.style.flexShrink = "0";
  });
}

// Initialize generated fields before registering their input events.
buildRitualInputs();
textFields = Array.from(document.querySelectorAll('.editor-panel input[type="text"], .editor-panel textarea'));
defaultTextValues = textFields.map(field => field.value);
textFields.forEach(registerTextField);
document.querySelectorAll('.editor-panel input[type="radio"]').forEach(radio => radio.addEventListener("change", updatePreview));
fields.symbolButtons.forEach((button) => {
  button.addEventListener("click", () => insertSymbol(button.dataset.insert));
});
fields.clearButton.addEventListener("click", clearInputs);
fields.copyButton.addEventListener("click", () => {
  copyHtml().catch(() => setStatus("클립보드 복사 권한을 확인해 주세요."));
});
fields.saveButton.addEventListener("click", () => {
  savePng().catch(() => setStatus("PNG 저장 중 오류가 발생했습니다."));
});

window.addEventListener("hashchange", () => {
  showPage();
  updatePreview();
});
showPage();
updatePreview();
