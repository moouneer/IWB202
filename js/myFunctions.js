/**
 * myFunctions.js — وظائف مشتركة للموقع
 * - تخزين واسترجاع التطبيقات عبر localStorage
 * - توليد جدول التطبيقات
 * - نافذة تفاصيل التطبيق
 * - التحقق من صحة نموذج إضافة تطبيق باستخدام jQuery
 */

// مفتاح التخزين
const STORAGE_KEY = "ai_apps_list_v1";

// بيانات أولية (5 تطبيقات على الأقل)
const seedApps = [
  {
    id: "seed-1",
    name: "ChatGPT",
    company: "OpenAI",
    domain: "Productivity",
    free: true,
    url: "https://chat.openai.com/",
    desc: "مساعد ذكي للمحادثة وتوليد النصوص والأفكار وشرح المفاهيم."  },
  {
    id: "seed-2",
    name: "GitHub Copilot",
    company: "GitHub",
    domain: "Software Development",
    free: false,
    url: "https://github.com/features/copilot",
    desc: "أداة إكمال تلقائي للكود تعتمد على الذكاء الاصطناعي لتسريع البرمجة.",
    media: { type: "image", src: "assets/placeholder.svg" }
  },
  {
    id: "seed-3",
    name: "Midjourney",
    company: "Midjourney",
    domain: "Art & Design",
    free: false,
    url: "https://www.midjourney.com/",
    desc: "توليد صور فنية من أوصاف نصية بقدرات متقدمة.",
    media: { type: "video", src: "https://www.youtube.com/embed/6aLz0fY4G4U" }
  },
  {
    id: "seed-4",
    name: "Gemini",
    company: "Google",
    domain: "Productivity",
    free: true,
    url: "https://gemini.google.com/",
    desc: "نموذج لغوي متعدد الوسائط من جوجل للمساعدة في المهام المختلفة.",
    media: { type: "image", src: "assets/placeholder.svg" }
  },
  {
    id: "seed-5",
    name: "Stable Diffusion",
    company: "Stability AI",
    domain: "Art & Design",
    free: true,
    url: "https://stability.ai/",
    desc: "نموذج مفتوح المصدر لتوليد الصور من النص."  }
];

// إرجاع المصفوفة الحالية من التخزين أو تهيئتها
function getApps(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw){
      // المرة الأولى: خزّن البيانات الأولية
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedApps));
      return [...seedApps];
    }
    const parsed = JSON.parse(raw);
    // تأكد أن البيانات مصفوفة
    if(Array.isArray(parsed)) return parsed;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedApps));
    return [...seedApps];
  }catch(e){
    console.error("Storage error", e);
    return [...seedApps];
  }
}

function saveApps(apps){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

function addApp(app){
  const apps = getApps();
  apps.push(app);
  saveApps(apps);
}

// توليد صف الجدول
function makeRow(app){
  const badge = app.free ? '<span class="badge ok">نعم</span>' : '<span class="badge no">لا</span>';
  return `<tr>
    <td>${escapeHtml(app.name)}</td>
    <td>${escapeHtml(app.company)}</td>
    <td>${escapeHtml(app.domain)}</td>
    <td>${badge}</td>
    <td><button class="btn" data-details-id="${app.id}">إظهار التفاصيل</button></td>
  </tr>`;
}

// توليد تفاصيل داخل النافذة
function makeDetails(app){
  let mediaBlock = "";
  return `<div class="card" style="background:transparent; border:none; box-shadow:none; padding:0;">
    <div style="display:grid; gap:12px;">
      <div style="display:grid; gap:6px;">
        <div><strong>اسم التطبيق:</strong> ${escapeHtml(app.name)}</div>
        <div><strong>الشركة المطورة:</strong> ${escapeHtml(app.company)}</div>
        <div><strong>المجال:</strong> ${escapeHtml(app.domain)}</div>
        <div><strong>الموقع:</strong> <a href="${app.url}" target="_blank" rel="noopener">${app.url}</a></div>
      </div>
      <p>${escapeHtml(app.desc)}</p>
      ${mediaBlock}
    </div>
  </div>`;
}

// عرض الجدول على صفحة apps.html
function renderAppsTable(){
  const tbody = document.getElementById("apps-tbody");
  if(!tbody) return;
  const apps = getApps();
  tbody.innerHTML = apps.map(makeRow).join("");

  // تعامل مع أزرار التفاصيل
  $("#apps-tbody").on("click", "button[data-details-id]", function(){
    const id = $(this).data("details-id");
    const apps = getApps();
    const app = apps.find(a => a.id === id);
    if(!app) return;
    $("#details-content").html(makeDetails(app));
    $("#details-backdrop").addClass("show");
  });

  $("#close-details, #close-details-2, #details-backdrop").on("click", function(e){
    // لا تغلق عند الضغط داخل المودال نفسه
    if(e.target.id === "details-backdrop" || e.target.id === "close-details" || e.target.id === "close-details-2"){
      $("#details-backdrop").removeClass("show");
    }
  });
}

// وظائف مساعدة
function escapeHtml(str){
  return String(str).replace(/[&<>"'`=\/]/g, function(s){
    return ({
      "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"
    })[s];
  });
}

// التحقق من صحة النموذج add_app.html باستخدام jQuery
function setupAddForm(){
  const form = $("#addAppForm");
  if(!form.length) return;

  const setError = (name, msg)=>{ $(`.error[data-error-for="${name}"]`).text(msg || ""); };
  const clearErrors = ()=>{ form.find(".error").text(""); };

  function validate(){
    clearErrors();
    let ok = true;

    // اسم التطبيق: أحرف إنجليزية فقط، بدون فراغات
    const appName = $("#appName").val().trim();
    if(!/^[A-Za-z]+$/.test(appName)){
      setError("appName", "اسم التطبيق يجب أن يكون أحرفاً إنجليزية فقط بدون فراغات.");
      ok = false;
    }

    // الشركة: أحرف إنجليزية فقط (نسمح بالمسافة الواحدة بين الكلمات)
    const company = $("#company").val().trim();
    if(!/^[A-Za-z]+(?: [A-Za-z]+)*$/.test(company)){
      setError("company", "اسم الشركة يجب أن يكون أحرفاً إنجليزية فقط.");
      ok = false;
    }

    // الرابط URL
    const website = $("#website").val().trim();
    try{
      const u = new URL(website);
      if(!/^https?:$/.test(u.protocol)) throw new Error("bad protocol");
    }catch{
      setError("website", "الرجاء إدخال رابط صالح يبدأ بـ http أو https.");
      ok = false;
    }

    // مجاني أم لا
    const isFree = $('input[name="isFree"]:checked').val();
    if(!isFree){
      setError("isFree", "الرجاء اختيار نعم/لا.");
      ok = false;
    }

    // المجال
    const domain = $("#domain").val();
    if(!domain){
      setError("domain", "الرجاء اختيار مجال الاستخدام.");
      ok = false;
    }

    // الوصف
    const desc = $("#desc").val().trim();
    if(desc.length < 20 || desc.length > 280){
      setError("desc", "الوصف يجب أن يكون بين 20 و 280 حرفاً.");
      ok = false;
    }

    return { ok, appName, company, website, isFree: isFree === "yes", domain, desc };
  }

  form.on("submit", function(e){
    e.preventDefault();
    const v = validate();
    if(!v.ok) return;

    const newApp = {
      id: "user-" + Date.now(),
      name: v.appName,
      company: v.company,
      domain: v.domain,
      free: v.isFree,
      url: v.website,
      desc: v.desc,
      media: { type: "image", src: "assets/placeholder.svg" } // يمكن للمستخدم تغييره لاحقاً
    };

    addApp(newApp);

    // الانتقال إلى صفحة التطبيقات مع رسالة نجاح
    window.location.href = "apps.html?added=1";
  });
}

// رسالة نجاح عند العودة من صفحة الإضافة
function showAddedAlertIfAny(){
  const params = new URLSearchParams(window.location.search);
  if(params.get("added") === "1"){
    const box = document.getElementById("apps-alert");
    if(box){
      box.innerHTML = '<div class="alert">✅ تم حفظ التطبيق بنجاح!</div>';
      // إزالة الباراميتر من العنوان بعد العرض
      window.history.replaceState({}, "", "apps.html");
    }
  }
}

// وثيقة جاهزة
$(function(){
  renderAppsTable();
  setupAddForm();
  showAddedAlertIfAny();
});
