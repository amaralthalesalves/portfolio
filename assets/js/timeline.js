// Trajetória: os anos aparecem em sequência quando a seção entra na tela,
// e os nomes em destaque rolam até a entrada correspondente, que pisca de leve.
// (Sem trocar o #hash: ele é usado para escolher o idioma.)
(function () {
  var list = document.getElementById("tl");
  if (!list) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    list.classList.add("is-in");
  } else {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      list.classList.add("is-in");
      io.disconnect();
    }, { threshold: 0.2 });
    io.observe(list);
  }

  // delegação: o i18n troca o HTML dos itens, então os links são recriados a cada troca de idioma
  list.addEventListener("click", function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var target = document.getElementById(a.getAttribute("href").slice(1));
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
    target.classList.remove("is-flash");
    void target.offsetWidth; // reinicia a animação
    target.classList.add("is-flash");
  });
})();

// Liga o início e o fim de uma atividade (itens com o mesmo data-act) com uma chave.
(function () {
  var list = document.getElementById("tl");
  if (!list) return;
  var brace = null;
  var pinned = null;

  function items(act) { return list.querySelectorAll('li[data-act="' + act + '"]'); }

  function clear() {
    list.classList.remove("has-act");
    list.querySelectorAll("li.is-on").forEach(function (li) { li.classList.remove("is-on"); });
    if (brace) { brace.remove(); brace = null; }
  }

  function show(act) {
    clear();
    var on = items(act);
    on.forEach(function (li) { li.classList.add("is-on"); });
    list.classList.add("has-act");
    if (on.length < 2) return;
    // a chave fica no vão entre o trilho e o texto, do meio da primeira linha do início ao do fim
    var box = list.getBoundingClientRect();
    var first = on[0].getBoundingClientRect();
    var last = on[on.length - 1].getBoundingClientRect();
    var line = parseFloat(getComputedStyle(on[0]).lineHeight) || 20;
    brace = document.createElement("span");
    brace.className = "tl-brace";
    brace.style.left = (first.left - box.left - 14) + "px";
    brace.style.top = (first.top - box.top + line / 2) + "px";
    brace.style.height = (last.top - first.top) + "px";
    list.appendChild(brace);
  }

  list.addEventListener("mouseover", function (e) {
    if (pinned) return;
    var li = e.target.closest("li[data-act]");
    if (li) show(li.getAttribute("data-act"));
  });
  list.addEventListener("mouseleave", function () { if (!pinned) clear(); });
  // toque/clique fixa a atividade; clicar de novo (ou fora) solta. Links continuam levando à seção.
  list.addEventListener("click", function (e) {
    if (e.target.closest("a")) return;
    var li = e.target.closest("li[data-act]");
    var act = li && li.getAttribute("data-act");
    if (!act || act === pinned) { pinned = null; clear(); return; }
    pinned = act;
    show(act);
  });
  window.addEventListener("resize", function () { if (pinned) show(pinned); else clear(); });
})();
