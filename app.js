const RULE_NAMES = {
  insane: "인세인",
  shinobigami: "시노비가미",
  magicalogica: "마기카로기아",
  stratoshout: "스트라토 샤우트"
};

function showPage() {
  const rule = window.location.hash.slice(1);
  const isHome = !Object.prototype.hasOwnProperty.call(RULE_NAMES, rule);
  document.querySelector("#homePage").hidden = !isHome;
  document.querySelector("#editorPage").hidden = rule !== "insane";
  document.querySelector("#pendingPage").hidden = isHome || rule === "insane";
  document.querySelector("#pendingRuleTitle").textContent = RULE_NAMES[rule] || "";
  document.title = isHome ? "사이코로 픽션 공식풍 핸드아웃 메이커" : `${RULE_NAMES[rule]} 핸드아웃 메이커`;
}

window.addEventListener("hashchange", showPage);
showPage();

const TYPE_CONFIG = {
  public: { fileName: "insane-public-handout.png" },
  secret: { fileName: "insane-secret-handout.png" },
  madness: { fileName: "insane-madness-card.png" },
  ritual: { fileName: "insane-ritual-sheet.png" }
};

const RITUAL_STEPS = 6;

const fields = {
  typeRadios: document.querySelectorAll('input[name="handoutType"]'),
  titleField: document.querySelector("#titleField"),
  title: document.querySelector("#titleInput"),
  metaField: document.querySelector("#metaField"),
  metaLabel: document.querySelector("#metaLabel"),
  meta: document.querySelector("#metaInput"),
  bodyField: document.querySelector("#bodyInput").closest(".stacked-field"),
  body: document.querySelector("#bodyInput"),
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

function buildRitualInputs() {
  const rows = [];
  for (let step = 1; step <= RITUAL_STEPS; step += 1) {
    rows.push(`<div class="ritual-row"><input class="ritual-input" data-step="${step}" data-key="step" type="text"><input class="ritual-input" data-step="${step}" data-key="name" type="text"><input class="ritual-input" data-step="${step}" data-key="skill" type="text" placeholder="특기명"><input class="ritual-input" data-step="${step}" data-key="condition" type="text"><input class="ritual-input" data-step="${step}" data-key="penalty" type="text"></div>`);
  }
  fields.ritualRows.innerHTML = rows.join("");
}

function getType() {
  return document.querySelector('input[name="handoutType"]:checked').value;
}

function values() {
  return {
    title: fields.title.value.trim(),
    meta: fields.meta.value.trim(),
    body: fields.body.value.trim(),
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
    .slice(0, 2)
    .map((line) => `<div>${escapeHtml(line)}</div>`)
    .join("");
}

function publicHtml(data) {
  return `<div style="width:300px; height:420px; box-sizing:border-box; border:1px solid #111; background:#fff; font-family:Arial, 'Noto Sans KR', sans-serif; color:#111; padding-top:10px;"><div style="text-align:center; font-size:24px; line-height:1.2; margin-bottom:6px;">Handout</div><div style="width:278px; height:364px; margin:0 auto; border:2px solid #111; box-sizing:border-box; padding:3px;"><div style="width:100%; height:100%; border:1px solid #666; box-sizing:border-box;"><div style="display:flex; height:38px; border-bottom:1px solid #111; box-sizing:border-box;"><div style="width:53px; border-right:1px solid #777; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">이름</div><div style="flex:1; display:flex; align-items:center; padding-left:11px; font-size:16px; box-sizing:border-box;">${escapeHtml(data.title)}</div></div><div style="height:31px; border-bottom:1px solid #111; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">사명</div><div style="padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box;">${escapeHtml(data.body)}</div></div></div></div>`;
}

function secretHtml(data) {
  return `<div style="width:300px; height:434px; box-sizing:border-box; background:#000; font-family:Arial, 'Noto Sans KR', sans-serif; color:#fff; padding-top:10px;"><div style="text-align:center; font-size:24px; line-height:1.2; margin-bottom:8px;">Handout</div><div style="width:280px; height:364px; margin:0 auto; border:3px solid #fff; box-sizing:border-box; padding:3px;"><div style="width:100%; height:100%; border:1px solid #fff; box-sizing:border-box; position:relative;"><div style="height:28px; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">비밀</div><div style="display:flex; height:39px; background:#fff; color:#000; border-bottom:1px solid #000; box-sizing:border-box; margin-left:2px; margin-right:2px;"><div style="width:53px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">쇼크</div><div style="flex:1; display:flex; align-items:center; padding-left:11px; font-size:16px; box-sizing:border-box;">${escapeHtml(data.meta)}</div></div><div style="height:262px; background:#fff; color:#000; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box; margin-left:2px; margin-right:2px;">${escapeHtml(data.body)}</div><div style="position:absolute; left:0; right:0; bottom:0; height:34px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#fff; box-sizing:border-box; transform:translateY(5px);">이 비밀을 스스로 밝힐 수는 없다.</div></div></div></div>`;
}

function madnessHtml(data) {
  return `<div style="width:300px; height:434px; box-sizing:border-box; background:#000; font-family:Arial, 'Noto Sans KR', sans-serif; color:#fff; padding-top:10px;"><div style="text-align:center; font-size:24px; line-height:1.2; margin-bottom:8px;">Handout</div><div style="width:280px; height:364px; margin:0 auto; border:3px solid #fff; box-sizing:border-box; padding:3px;"><div style="width:100%; height:100%; box-sizing:border-box; position:relative;"><div style="background:#fff; color:#000;"><div style="display:flex; height:32px; border-bottom:1px solid #000; box-sizing:border-box;"><div style="width:60px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">광기</div><div style="flex:1; display:flex; align-items:center; padding-left:11px; font-size:16px; font-weight:bold; box-sizing:border-box;">${escapeHtml(data.title)}</div></div><div style="display:flex; height:33px; border-bottom:1px solid #000; box-sizing:border-box;"><div style="width:60px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:16px; font-weight:bold; box-sizing:border-box;">트리거</div><div style="flex:1; display:flex; flex-direction:column; justify-content:center; padding-left:11px; font-size:11px; line-height:1.1; box-sizing:border-box; transform:translateY(1px);">${triggerHtml(data.meta)}</div></div><div style="height:264px; color:#000; padding:10px; font-size:16px; line-height:1.5; box-sizing:border-box;">${escapeHtml(data.body)}</div></div><div style="position:absolute; left:0; right:0; bottom:0; height:34px; display:flex; align-items:center; justify-content:center; font-size:10px; color:#fff; box-sizing:border-box; transform:translateY(6px);">이 광기를 스스로 밝힐 수는 없다.</div></div></div></div>`;
}

function ritualCellHtml(text, extraStyle = "") {
  return `<div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; padding:0 6px; box-sizing:border-box; font-size:14px; line-height:1.2; overflow-wrap:anywhere; ${extraStyle}">${escapeHtml(text)}</div>`;
}

function ritualRowHtml(row, hasBottomBorder) {
  const border = hasBottomBorder ? " border-bottom:1px solid #000;" : "";
  const skill = row.skill;
  return `<div style="display:grid; grid-template-columns:70px 125px 97px 185px 1fr; height:40px;${border} box-sizing:border-box; font-size:16px;">${ritualCellHtml(row.step)}${ritualCellHtml(row.name)}${ritualCellHtml(skill)}${ritualCellHtml(row.condition)}<div style="display:flex; align-items:center; justify-content:center; padding:0 6px; box-sizing:border-box; font-size:14px; line-height:1.2; overflow-wrap:anywhere;">${escapeHtml(row.penalty)}</div></div>`;
}

function ritualHtml(data) {
  const rows = data.ritualRows
    .map((row, index) => ritualRowHtml(row, index < RITUAL_STEPS - 1))
    .join("");

  return `<div id="ritual-sheet" style="width:700px; height:360px; box-sizing:border-box; background:#fff; font-family:Arial, 'Noto Sans KR', sans-serif; color:#000; padding:6px;"><div style="width:688px; height:344px; border:3px solid #111; box-sizing:border-box; padding:4px;"><div style="width:100%; height:100%; border:1px solid #555; box-sizing:border-box;"><div style="display:flex; height:44px; border-bottom:2px solid #111; box-sizing:border-box;"><div style="width:135px; border-right:1px solid #000; display:flex; align-items:center; justify-content:center; font-size:24px; font-weight:bold; box-sizing:border-box; transform:translateY(-1px);">의식 시트</div><div style="flex:1; display:flex; align-items:center; padding-left:16px; font-size:22px; box-sizing:border-box; transform:translateY(-1px);">의식명: ${escapeHtml(data.title)}</div></div><div style="display:grid; grid-template-columns:70px 125px 97px 185px 1fr; height:44px; border-bottom:1px solid #000; box-sizing:border-box; font-size:16px; font-weight:bold;"><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">단계</div><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">절차명</div><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">지정 특기</div><div style="border-right:1px solid #000; display:flex; align-items:center; justify-content:center; box-sizing:border-box;">참가 조건</div><div style="display:flex; align-items:center; justify-content:center; box-sizing:border-box;">페널티</div></div>${rows}</div></div></div>`;
}

function handoutHtml(type, data) {
  if (type === "public") return publicHtml(data);
  if (type === "madness") return madnessHtml(data);
  if (type === "ritual") return ritualHtml(data);
  return secretHtml(data);
}

function updatePreview() {
  const type = getType();
  fields.titleField.hidden = type === "secret";
  fields.metaField.hidden = type === "public" || type === "ritual";
  fields.bodyField.hidden = type === "ritual";
  fields.ritualFields.hidden = type !== "ritual";
  fields.metaLabel.textContent = type === "secret" ? "쇼크" : "트리거";
  fields.preview.innerHTML = handoutHtml(type, values());
}

function getSelfContainedHtml() {
  return handoutHtml(getType(), values());
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
  const target = lastFocusedTextField && !lastFocusedTextField.closest("[hidden]") ? lastFocusedTextField : fields.body;
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

function clearInputs() {
  const type = getType();

  if (type === "public") {
    fields.title.value = "";
    fields.body.value = "";
  } else if (type === "secret") {
    fields.meta.value = "";
    fields.body.value = "";
  } else if (type === "madness") {
    fields.title.value = "";
    fields.meta.value = "";
    fields.body.value = "";
  } else if (type === "ritual") {
    fields.title.value = "";
    fields.ritualRows.querySelectorAll(".ritual-input").forEach((input) => {
      input.value = "";
    });
  }

  lastFocusedTextField = fields.body;
  updatePreview();
  setStatus("현재 레이아웃의 입력 내용을 지웠습니다.");
}

async function savePng() {
  updatePreview();

  const target = fields.preview.firstElementChild;
  if (!target || !window.htmlToImage) {
    throw new Error("html-to-image is not available");
  }

  const dataUrl = await window.htmlToImage.toPng(target, {
    cacheBust: true,
    pixelRatio: Math.max(2, Math.ceil(window.devicePixelRatio || 1))
  });

  const link = document.createElement("a");
  link.download = TYPE_CONFIG[getType()].fileName;
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

buildRitualInputs();
[fields.title, fields.meta, fields.body].forEach(registerTextField);
fields.ritualRows.querySelectorAll(".ritual-input").forEach(registerTextField);
fields.symbolButtons.forEach((button) => {
  button.addEventListener("click", () => insertSymbol(button.dataset.insert));
});
fields.typeRadios.forEach((radio) => radio.addEventListener("change", updatePreview));
fields.clearButton.addEventListener("click", clearInputs);
fields.copyButton.addEventListener("click", () => {
  copyHtml().catch(() => setStatus("클립보드 복사 권한을 확인해 주세요."));
});
fields.saveButton.addEventListener("click", () => {
  savePng().catch(() => setStatus("PNG 저장 중 오류가 발생했습니다."));
});

function setStatus(message) {
  fields.status.textContent = message;
  window.clearTimeout(setStatus.timer);
  setStatus.timer = window.setTimeout(() => {
    fields.status.textContent = "";
  }, 2600);
}

updatePreview();
