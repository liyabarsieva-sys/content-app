const AWARENESS_STAGES = [
  { id: "unaware",   label: "Не осознаёт проблему",  goal: "заставить задуматься",       share: "40%", color: "#5a8a6a" },
  { id: "aware",     label: "Осознаёт проблему",      goal: "углубить понимание",          share: "25%", color: "#7a9a5a" },
  { id: "seeking",   label: "Ищет решение",           goal: "показать правильный путь",    share: "20%", color: "#9a8a4a" },
  { id: "choosing",  label: "Выбирает решение",       goal: "сформировать доверие",        share: "10%", color: "#c4954a" },
  { id: "ready",     label: "Готов к покупке",        goal: "перевести в действие",        share: "5%",  color: "#c46a4a" },
];

const RUBRICS = [
  { id: "expert",    label: "Экспертный",    desc: "Знания, факты, разборы",         share: "30%", icon: "🎓" },
  { id: "personal",  label: "Личный",        desc: "История, опыт, за кулисами",     share: "20%", icon: "💬" },
  { id: "engaging",  label: "Вовлекающий",   desc: "Вопросы, опросы, дискуссии",     share: "20%", icon: "🔥" },
  { id: "pain",      label: "Боль/Проблема", desc: "Закрываем страхи и возражения",  share: "20%", icon: "💊" },
  { id: "selling",   label: "Продающий",     desc: "Конкретное предложение, выгода, призыв",   share: "10%", icon: "💰" },

];

const CTA_OPTIONS = [
  { id: "dm",       label: "Написать в директ",     icon: "✉️" },
  { id: "site",     label: "Перейти на сайт",        icon: "🌐" },
  { id: "signup",   label: "Записаться / заявка",    icon: "📋" },
  { id: "save",     label: "Сохранить пост",         icon: "🔖" },
  { id: "share",    label: "Поделиться",             icon: "🔄" },
  { id: "comment",  label: "Оставить комментарий",   icon: "💭" },
  { id: "sub",      label: "Подписаться",            icon: "➕" },
  { id: "none",     label: "Без CTA",               icon: "—"  },
];

const RUBRIC_SORDELL_MAP = {
  expert:    ["professional_unexpected", "professional_known"],
  personal:  ["personal_unexpected", "personal_known"],
  engaging:  ["personal_unexpected", "professional_unexpected", "personal_known", "professional_known"],
  pain:      ["personal_unexpected", "professional_unexpected", "personal_known", "professional_known"],
  selling:   ["professional_unexpected", "professional_known"],
};

export { AWARENESS_STAGES, RUBRICS, CTA_OPTIONS, RUBRIC_SORDELL_MAP };
