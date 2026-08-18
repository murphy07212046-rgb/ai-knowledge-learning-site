const state = {
  data: null,
};

const flowElement = document.querySelector("#learning-flow");
const updatesElement = document.querySelector("#updates-list");
const learningModePanel = document.querySelector("#learning-mode-panel");
const learningModeContent = document.querySelector("#learning-mode-content");

const CASE_FAILURE_GUIDANCE = {
  foundations: {
    issue: "把模型记忆中的旧信息当成实时数据，或误解“当前、在职、年龄段”等条件。",
    symptom: "回答看似合理，但数字与数据源不一致，或只回答了其中一个统计需求。",
    check: "确认每个数字都来自受控查询；逐项核对问题中的时间、人员状态和统计维度。",
  },
  input: {
    issue: "没有拆分“总人数”和“年龄段分布”两个需求，或遗漏提问者的访问边界。",
    symptom: "只返回部分答案，或尝试查询不在授权范围内的组织数据。",
    check: "查看原始问题、意图拆分结果和已校验的权限范围。",
  },
  knowledge: {
    issue: "组织范围、在职定义或年龄分档取错，或者被历史偏好覆盖了本次权威规则。",
    symptom: "同一个部门在不同时间得到不一致结果，引用的口径也无法解释。",
    check: "核对组织树、口径版本、检索资料和本次实际传入的上下文。",
  },
  agent: {
    issue: "跳过权限或结果校验，工具参数错误，或在异常后执行了不该执行的查询。",
    symptom: "年龄段合计与总人数对不上，或出现无结果后仍给出确定答案。",
    check: "查看行动顺序、工具参数、重试记录，以及年龄段合计校验结果。",
  },
  output: {
    issue: "输出格式不稳定，或在小样本场景中展示了可识别个人的信息。",
    symptom: "前端无法解析结果，或用户看到了不应展示的细分人数与敏感信息。",
    check: "检查原始输出、格式校验、k-匿名规则和展示前的安全拦截记录。",
  },
  operations: {
    issue: "失败样本没有沉淀，团队只知道体验不好，却无法定位是哪个环节出了问题。",
    symptom: "相同问题反复出现，质量、时延和成本变化也无法解释。",
    check: "关联真实失败样本、链路记录和版本变更，查看质量、时延与成本趋势。",
  },
};

const MODULE_PRACTICAL_ACCEPTANCE = {
  foundations: {
    task: "选一个 HR 高频问题，判断它是否适合交给 AI，并写清模型不能替代的判断。",
    deliverables: ["AI 机会评估卡", "用户任务与成功标准", "AI、规则与人工的职责边界"],
    criteria: ["只解决一个明确用户任务", "说明为什么不能由模型凭记忆回答", "高影响决定保留人工确认"],
    caseStage: "foundations",
  },
  input: {
    task: "把一条模糊的 HR 请求拆成可执行任务，并设计缺少关键信息时的追问。",
    deliverables: ["意图拆分表", "必填信息与追问清单", "越权或注入输入的处理规则"],
    criteria: ["覆盖多意图与模糊表达", "先确认范围再触发高成本动作", "不能用提示词替代权限校验"],
    caseStage: "input",
  },
  knowledge: {
    task: "为一套 HR 政策知识问答设计资料来源、版本失效和权限规则。",
    deliverables: ["知识来源分级表", "资料更新与失效流程", "回答引用与资料不足时的兜底规则"],
    criteria: ["权威资料优先且可追溯", "旧版资料不会被当成现行规则", "用户能看到答案依据或转人工入口"],
    caseStage: "knowledge",
  },
  agent: {
    task: "为 HR 数据查询助手画出从提问到返回结果的受控行动流程。",
    deliverables: ["工具调用流程图", "参数与权限校验规则", "失败、重试与停止条件"],
    criteria: ["权限校验发生在查询之前", "每一步都有可观察结果", "错误或空结果不会被包装成确定答案"],
    caseStage: "agent",
  },
  output: {
    task: "设计一张可直接给员工使用的 HR 数据/政策回答卡，同时覆盖格式与隐私保护。",
    deliverables: ["回答页面原型", "结构化字段定义", "敏感信息与小样本展示规则"],
    criteria: ["用户能理解口径、来源和下一步", "关键字段可被页面稳定展示", "不输出姓名、工号或可识别的小群体信息"],
    caseStage: "output",
  },
  operations: {
    task: "为一个 HR AI 助手建立上线前评测和试点复盘方案。",
    deliverables: ["至少 20 条测试任务", "质量、时延、成本与安全指标", "问题归因与下一轮优先级"],
    criteria: ["样本覆盖正常、异常和高风险请求", "每个指标有明确通过阈值", "失败能定位到资料、模型、工具或流程环节"],
    caseStage: "operations",
  },
  "product-delivery": {
    task: "完成“组织调整影响分析助手”的基础产品方案，串起问题、规则、AI 解释与评测。",
    deliverables: ["机会评估与用户旅程", "核心 PRD 与异常流程", "验收样本、风险清单与试点计划"],
    criteria: ["规则判断与 AI 解释职责分离", "影响、冲突和待处理项均可行动", "最终组织与人事决策始终由人确认"],
  },
};

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "日期未知";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
  }).format(date);
}

function safeHttpUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function updatesForModule(moduleId) {
  return state.data.updates.filter((update) => update.modules?.includes(moduleId));
}

function latestNewCount(moduleId) {
  return updatesForModule(moduleId).filter((update) => update.isNew).length;
}

function lessonHref(moduleId, lessonId) {
  return `./lesson.html#lesson=${encodeURIComponent(`${moduleId}:${lessonId}`)}`;
}

function lessonForUpdate(module, update) {
  return module?.lessons.find((lesson) => lesson.id === update.lessonId) || module?.lessons[0];
}

function updateConnection(update, module, lesson) {
  if (update.learningConnection) return update.learningConnection;
  return `这条更新归入「${module?.name || "AI 学习框架"}」${lesson ? `的「${lesson.name}」知识点` : ""}。`;
}

function updateCard(update, module, className = "update-card") {
  const lesson = lessonForUpdate(module, update);
  const card = createElement(lesson ? "a" : "article", className);
  if (lesson) card.href = lessonHref(module.id, lesson.id);
  const meta = createElement("div", "update-meta");
  meta.append(
    createElement("span", "source-type", update.sourceType === "official" ? "官方" : update.sourceType === "research" ? "研究" : "社区"),
    createElement("span", "update-module", `${module?.number || "新增"} / ${module?.shortName || "框架扩展"}`),
    createElement("span", "update-lesson", lesson ? `关联知识：${lesson.name}` : "框架新增"),
    createElement("span", "", formatDate(update.publishedAt)),
    createElement("span", "new-badge", "更新"),
  );
  card.append(
    meta,
    createElement("h3", "", update.title),
    createElement("p", "", update.summary),
    createElement("p", "update-connection", `为什么放在这里：${updateConnection(update, module, lesson)}`),
  );
  return card;
}

function createCaseStage(stage) {
  const section = createElement("section", "detail-section detail-section-wide case-stage");
  section.id = `case-stage-${stage.id}`;
  section.append(createElement("h3", "", stage.title), createElement("p", "", stage.description));

  const failureGuidance = CASE_FAILURE_GUIDANCE[stage.id];
  if (failureGuidance) {
    const failureMap = createElement("aside", "case-failure-map");
    const failureItems = createElement("div", "case-failure-items");
    [
      ["可能问题", failureGuidance.issue],
      ["用户会看到的症状", failureGuidance.symptom],
      ["优先检查什么", failureGuidance.check],
    ].forEach(([label, description]) => {
      const item = createElement("div", "case-failure-item");
      item.append(createElement("h4", "", label), createElement("p", "", description));
      failureItems.append(item);
    });
    failureMap.append(createElement("h4", "case-failure-map-title", "本环节可能出现的问题"), failureItems);
    section.append(failureMap);
  }

  const module = state.data.modules.find((item) => item.id === stage.moduleId);
  const links = createElement("div", "case-stage-links");
  links.append(createElement("span", "case-stage-label", "对照学习"));
  stage.lessonIds.forEach((lessonId) => {
    const lesson = module?.lessons.find((item) => item.id === lessonId);
    if (!lesson) return;
    const link = createElement("a", "case-lesson-link", lesson.name);
    link.href = lessonHref(module.id, lesson.id);
    links.append(link);
  });
  section.append(links);
  return section;
}

function createModulePractice(module) {
  const guidance = MODULE_PRACTICAL_ACCEPTANCE[module.id];
  if (!guidance) return null;

  const practice = createElement("details", "module-practice");
  const summary = createElement("summary", "module-practice-summary");
  summary.append(
    createElement("span", "module-practice-kicker", "PRACTICAL CHECK"),
    createElement("strong", "", "实战验收：完成本模块的最小产品交付"),
  );

  const body = createElement("div", "module-practice-body");
  body.append(createElement("p", "module-practice-task", guidance.task));
  const grid = createElement("div", "module-practice-grid");
  [
    ["需要提交", guidance.deliverables],
    ["通过标准", guidance.criteria],
  ].forEach(([title, items]) => {
    const block = createElement("section", "module-practice-block");
    const list = createElement("ul", "module-practice-list");
    items.forEach((item) => list.append(createElement("li", "", item)));
    block.append(createElement("h4", "", title), list);
    grid.append(block);
  });
  body.append(grid);

  if (guidance.caseStage) {
    const caseButton = createElement("button", "module-practice-case", "查看关联案例");
    caseButton.type = "button";
    caseButton.addEventListener("click", () => openLearningMode("case", guidance.caseStage));
    body.append(caseButton);
  }

  practice.append(summary, body);
  return practice;
}

function openLearningMode(mode, focusStageId = "") {
  learningModePanel.hidden = false;
  learningModePanel.style.setProperty("--detail-accent", "var(--knowledge)");
  learningModeContent.replaceChildren();
  const businessCase = state.data.businessCase;
  const title = createElement("h2", "detail-title", `案例演练：${businessCase.title}`);
  const subtitle = createElement("p", "detail-subtitle", "真实业务案例（已脱敏）：一条 HR 数据查询链路贯穿六个模块；每一步均包含该环节的风险、可见症状和排查方向，并可进入对应知识点继续学习。");
  const sections = createElement("div", "detail-sections");
  const briefing = createElement("section", "detail-section detail-section-wide");
  briefing.append(
    createElement("h3", "", "真实业务问题"),
    createElement("p", "", businessCase.summary),
  );
  sections.append(briefing);

  state.data.businessCase.stages.forEach((stage) => sections.append(createCaseStage(stage)));

  learningModeContent.append(title, subtitle, sections);
  learningModePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  if (focusStageId) {
    document.querySelector(`#case-stage-${focusStageId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderFlow() {
  flowElement.replaceChildren();
  state.data.modules.forEach((module) => {
    const layer = createElement("section", "flow-layer");
    layer.dataset.accent = module.accent;
    const header = createElement("div", "flow-layer-header");
    const headerText = createElement("div");
    headerText.append(
      createElement("p", "layer-index", `${module.number} / ${module.shortName}`),
      createElement("h3", "layer-title", module.name),
    );
    header.append(headerText, createElement("p", "layer-description", module.description));

    const grid = createElement("div", "lesson-grid");
    module.lessons.forEach((lesson) => {
      const lessonLink = createElement("a", "lesson-card");
      lessonLink.href = lessonHref(module.id, lesson.id);
      lessonLink.append(
        createElement("strong", "", lesson.name),
        createElement("span", "", lesson.subtitle),
      );
      grid.append(lessonLink);
    });

    const practice = createModulePractice(module);

    const count = latestNewCount(module.id);
    if (count) {
      const badge = createElement("span", "new-badge", `${count} 条更新`);
      headerText.querySelector("h3").append(badge);
    }
    const moduleUpdates = updatesForModule(module.id).filter((update) => update.isNew).slice(0, 2);
    if (module.autoGenerated) {
      headerText.querySelector("h3").append(createElement("span", "framework-badge", "框架新增"));
    }
    layer.append(header, grid);
    if (practice) layer.append(practice);
    if (moduleUpdates.length) {
      const updateList = createElement("div", "flow-module-updates");
      updateList.append(createElement("p", "flow-module-updates-title", "本模块的新更新"));
      moduleUpdates.forEach((update) => updateList.append(updateCard(update, module, "flow-update-card")));
      layer.append(updateList);
    }
    flowElement.append(layer);
  });
}

function renderUpdates() {
  updatesElement.replaceChildren();
  const updates = state.data.updates.filter((update) => update.isNew).slice(0, 8);
  if (!updates.length) {
    updatesElement.append(createElement("p", "empty-updates", "尚未发现 7 天内的公开更新。每日任务完成后，内容会按学习模块与关联知识点展示；框架外的新能力会作为“框架新增”加入学习路径。"));
    return;
  }

  state.data.modules.forEach((module) => {
    const moduleUpdates = updates.filter((update) => update.modules?.includes(module.id));
    if (!moduleUpdates.length) return;
    const group = createElement("section", "updates-module-group");
    const heading = createElement("div", "updates-module-heading");
    heading.append(
      createElement("p", "layer-index", `${module.number} / ${module.shortName}`),
      createElement("h3", "", `${module.name}的新更新`),
      createElement("p", "", module.description),
    );
    const list = createElement("div", "updates-module-list");
    moduleUpdates.forEach((update) => list.append(updateCard(update, module)));
    group.append(heading, list);
    updatesElement.append(group);
  });
}

function redirectLegacyLessonHash() {
  const match = decodeURIComponent(location.hash).match(/^#lesson=([^:]+):(.+)$/);
  if (!match) return false;
  location.replace(lessonHref(match[1], match[2]));
  return true;
}

function businessCaseStageFromHash() {
  const match = decodeURIComponent(location.hash).match(/^#case=([a-z-]+)$/);
  return match?.[1] || "";
}

function initialise() {
  try {
    if (redirectLegacyLessonHash()) return;
    if (!window.AI_KNOWLEDGE_DATA?.site || !Array.isArray(window.AI_KNOWLEDGE_DATA.modules) || !Array.isArray(window.AI_KNOWLEDGE_DATA.updates)) {
      throw new Error("knowledge data unavailable");
    }
    state.data = window.AI_KNOWLEDGE_DATA;
    const newCount = state.data.updates.filter((update) => update.isNew).length;
    document.querySelector("#site-tagline").textContent = state.data.site.tagline;
    document.querySelector("#module-count").textContent = `${state.data.modules.length} 个知识模块`;
    document.querySelector("#new-update-summary").textContent = `${newCount} 条 7 天内更新`;
    document.querySelector("#updated-at").textContent = `最近同步：${new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(state.data.site.updatedAt))}`;
    renderFlow();
    renderUpdates();
    const caseStage = businessCaseStageFromHash();
    if (caseStage) openLearningMode("case", caseStage);
    document.querySelectorAll("[data-learning-mode]").forEach((button) => {
      button.addEventListener("click", () => openLearningMode(button.dataset.learningMode));
    });
  } catch {
    document.querySelector("#site-tagline").textContent = "知识数据暂时不可用，请稍后刷新重试。";
  }
}

initialise();
