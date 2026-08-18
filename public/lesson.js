const lessonContent = document.querySelector("#lesson-content");

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function currentLessonKey() {
  const match = decodeURIComponent(location.hash).match(/^#lesson=([^:]+):(.+)$/);
  return match ? { moduleId: match[1], lessonId: match[2] } : null;
}

function createSection(title, content, className = "") {
  const section = createElement("section", `lesson-section ${className}`.trim());
  section.append(createElement("h2", "lesson-section-title", title), content);
  return section;
}

function createParagraph(text) {
  return createElement("p", "", text);
}

function renderNotFound() {
  lessonContent.replaceChildren(
    createElement("p", "eyebrow", "KNOWLEDGE DETAIL"),
    createElement("h1", "lesson-not-found-title", "未找到这个知识点"),
    createElement("p", "lesson-not-found-copy", "请返回学习路径，从知识卡片重新进入。"),
  );
}

function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
}

function renderModuleUpdates(module, updates = []) {
  const moduleUpdates = updates
    .filter((update) => update.modules?.includes(module.id))
    .slice(0, 6);
  const content = createElement("div", "module-updates-list");

  if (!moduleUpdates.length) {
    content.append(createParagraph("每日任务会持续收集与本模块相关的公开来源；目前尚无可展示的新更新。"));
    return createSection("本模块的新更新", content, "lesson-section-wide module-updates");
  }

  moduleUpdates.forEach((update) => {
    const item = createElement("article", "module-update-item");
    const lesson = module.lessons.find((item) => item.id === update.lessonId) || module.lessons[0];
    const meta = createElement("p", "module-update-meta", `${update.sourceName || "公开来源"} · ${new Date(update.publishedAt).toLocaleDateString("zh-CN")}`);
    item.append(
      meta,
      createElement("h3", "module-update-title", update.title),
      createParagraph(update.summary),
      createElement("p", "module-update-connection", `关联知识：${lesson?.name || "本模块"} · ${update.learningConnection || "这条更新用于补充本模块的当前知识。"}`),
    );
    const sourceUrl = safeSourceUrl(update.sourceUrl);
    if (sourceUrl) {
      const link = createElement("a", "module-update-link", "查看公开来源 →");
      link.href = sourceUrl;
      link.target = "_blank";
      link.rel = "noreferrer";
      item.append(link);
    }
    content.append(item);
  });
  return createSection("本模块的新更新", content, "lesson-section-wide module-updates");
}

function renderLesson(module, lesson, data) {
  document.title = `${lesson.name} · AI 知识地图`;
  lessonContent.replaceChildren();

  const breadcrumb = createElement("p", "lesson-breadcrumb", `${module.number} · ${module.name}`);
  const title = createElement("h1", "lesson-page-title", lesson.name);
  const subtitle = createElement("p", "lesson-page-subtitle", lesson.subtitle);
  const summary = createElement("section", "lesson-summary");
  summary.append(
    createElement("p", "lesson-summary-label", "先用一句话理解"),
    createParagraph(lesson.beginnerSummary),
  );

  const overview = createElement("div", "lesson-overview");
  overview.append(
    createSection("它解决什么问题", createParagraph(lesson.whyItMatters)),
    createSection("它是什么", createParagraph(lesson.definition)),
  );

  const explanation = createSection("如何工作", createParagraph(lesson.principle), "lesson-section-wide");
  const example = createSection("快速示例", createParagraph(lesson.example), "lesson-section-wide");

  const businessCase = data.businessCase;
  const caseStage = businessCase && businessCase.stages.find((stage) => stage.lessonIds.includes(lesson.id));
  const caseConnection = caseStage && createElement("section", "lesson-case-connection");
  if (caseConnection) {
    caseConnection.append(
      createElement("p", "eyebrow", "IN THE REAL HR CASE"),
      createElement("h2", "lesson-case-connection-title", "这个知识点在真实业务案例中的位置"),
      createElement("p", "lesson-case-stage", caseStage.title),
      createElement("p", "lesson-case-focus", caseStage.lessonFocus[lesson.id]),
    );
    const caseLink = createElement("a", "lesson-case-link", "去案例巩固：查看完整 HR 业务案例 · 定位到本环节");
    caseLink.href = `./index.html#case=${encodeURIComponent(caseStage.id)}`;
    caseLink.append(createElement("span", "", "→"));
    caseConnection.append(caseLink);
  }

  const lessonCase = createElement("section", "lesson-case");
  lessonCase.id = "lesson-case";
  lessonCase.append(
    createElement("p", "eyebrow", "EXTRA PRACTICE"),
    createElement("h2", "lesson-case-title", `扩展练习：${lesson.name} 如何应用到其他场景`),
    createElement("p", "lesson-case-scenario", lesson.caseStudy.scenario),
  );
  const steps = createElement("ol", "lesson-case-steps");
  lesson.caseStudy.steps.forEach((step, index) => {
    const item = createElement("li", "");
    item.append(createElement("strong", "", `0${index + 1}`), createElement("span", "", step));
    steps.append(item);
  });
  lessonCase.append(steps, createElement("p", "lesson-case-takeaway", `结论：${lesson.caseStudy.takeaway}`));

  const practice = createElement("ul", "practice-list");
  lesson.practice.forEach((item) => practice.append(createElement("li", "", item)));
  const pitfalls = createElement("ul", "practice-list");
  lesson.pitfalls.forEach((item) => pitfalls.append(createElement("li", "", item)));
  const practical = createElement("div", "lesson-overview lesson-practical");
  practical.append(
    createSection("实践要点", practice),
    createSection("PM 视角的常见故障点", pitfalls),
  );

  const related = createElement("div", "relation-list");
  lesson.related.forEach((item) => related.append(createElement("span", "", item)));
  const relatedSection = createSection("关联知识", related, "lesson-section-wide");
  const moduleUpdates = renderModuleUpdates(module, data.updates);

  lessonContent.append(
    breadcrumb,
    title,
    subtitle,
    summary,
    overview,
    explanation,
    example,
    ...(caseConnection ? [caseConnection] : []),
    lessonCase,
    practical,
    relatedSection,
    moduleUpdates,
  );
}

function initialise() {
  const key = currentLessonKey();
  const data = window.AI_KNOWLEDGE_DATA;
  if (!key || !data?.modules) {
    renderNotFound();
    return;
  }

  const module = data.modules.find((item) => item.id === key.moduleId);
  const lesson = module?.lessons.find((item) => item.id === key.lessonId);
  if (!module || !lesson) {
    renderNotFound();
    return;
  }
  renderLesson(module, lesson, data);
}

initialise();
