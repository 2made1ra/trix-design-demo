/* @ds-bundle: {"format":4,"namespace":"SunsetGlow","components":[{"name":"Hero"},{"name":"AnimatedBackground"},{"name":"CursorGlow"},{"name":"Button"},{"name":"Badge"},{"name":"Card"},{"name":"Input"},{"name":"SunsetStripe"}]} */
(function () {
  var React = window.React;
  var h = React.createElement;
  var useRef = React.useRef, useEffect = React.useEffect;

  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(" "); }
  function mq(q) { return typeof window.matchMedia === "function" && window.matchMedia(q).matches; }

  function Button(props) {
    var variant = props.variant || "secondary";
    var rest = Object.assign({}, props); delete rest.variant; delete rest.className; delete rest.href;
    var cls = cx("sg-btn", "sg-btn-" + variant, props.className);
    if (props.href) return h("a", Object.assign({}, rest, { className: cls, href: props.href }));
    return h("button", Object.assign({ type: "button" }, rest, { className: cls }));
  }

  function Badge(props) {
    return h("span", { className: cx("sg-badge", "sg-badge-" + (props.tone || "cream"), props.className) }, props.children);
  }

  function Card(props) {
    var v = props.variant || "base";
    return h("div", { className: cx("sg-card", v !== "base" && "sg-card-" + v, props.className), style: props.style }, props.children);
  }

  function Input(props) {
    var rest = Object.assign({}, props); delete rest.label; delete rest.hint; delete rest.className;
    return h("label", { className: cx("sg-field", props.className) },
      props.label, h("input", Object.assign({ className: "sg-input" }, rest)), props.hint ? h("small", null, props.hint) : null);
  }

  function SunsetStripe(props) {
    return h("div", { className: cx("sg-stripe", props.className), "aria-hidden": "true", style: props.height ? { height: props.height } : null },
      h("i"), h("i"), h("i"), h("i"), h("i"));
  }

  /* Soft light that trails the pointer inside its parent section. */
  function CursorGlow(props) {
    var ref = useRef(null);
    useEffect(function () {
      var el = ref.current; if (!el) return;
      var host = el.parentElement; if (!host) return;
      if (mq("(prefers-reduced-motion: reduce)") || mq("(hover: none)")) return;
      var cs = getComputedStyle(el);
      var k = props.follow || parseFloat(cs.getPropertyValue("--cursor-follow")) || 0.12;
      var tx = 0, ty = 0, x = 0, y = 0, raf = 0, placed = false;
      function frame() {
        x += (tx - x) * k; y += (ty - y) * k;
        el.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
        raf = (Math.abs(tx - x) + Math.abs(ty - y) > 0.3) ? requestAnimationFrame(frame) : 0;
      }
      function move(e) {
        var r = host.getBoundingClientRect();
        tx = e.clientX - r.left; ty = e.clientY - r.top;
        if (!placed) { x = tx; y = ty; placed = true; }
        el.classList.add("is-on");
        if (!raf) raf = requestAnimationFrame(frame);
      }
      function leave() { el.classList.remove("is-on"); }
      host.addEventListener("pointermove", move);
      host.addEventListener("pointerleave", leave);
      return function () { host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); if (raf) cancelAnimationFrame(raf); };
    }, [props.follow]);
    var style = {};
    if (props.size) style["--cursor-glow-size"] = typeof props.size === "number" ? props.size + "px" : props.size;
    if (props.color) style["--cursor-glow"] = props.color;
    return h("div", { ref: ref, className: "sg-cursor-glow", "aria-hidden": "true", style: style });
  }

  /* Slowly drifting sunset gradient, paused off-screen and in hidden tabs. */
  function AnimatedBackground(props) {
    var ref = useRef(null);
    var variant = props.variant || "hero";
    var fade = props.fade !== undefined ? props.fade : variant === "hero";
    var glow = props.cursorGlow !== false;
    useEffect(function () {
      var el = ref.current; if (!el) return;
      var visible = true, shown = !document.hidden;
      function sync() { el.classList.toggle("sg-aurora-paused", !(visible && shown)); }
      var io = typeof IntersectionObserver === "function" ? new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }) : null;
      if (io) io.observe(el);
      function vis() { shown = !document.hidden; sync(); }
      document.addEventListener("visibilitychange", vis);
      return function () { if (io) io.disconnect(); document.removeEventListener("visibilitychange", vis); };
    }, []);
    var Tag = props.as || "section";
    return h(Tag, { ref: ref, className: cx("sg-aurora", fade && "sg-aurora-fade", variant === "band" && "sg-aurora-calm", props.className), style: props.style },
      h("div", { className: "sg-aurora-layer", "aria-hidden": "true" },
        h("div", { className: "sg-blob sg-blob-1" }), h("div", { className: "sg-blob sg-blob-2" }),
        h("div", { className: "sg-blob sg-blob-3" }), h("div", { className: "sg-blob sg-blob-4" }),
        h("div", { className: "sg-grain" })),
      glow ? h(CursorGlow, null) : null,
      props.children);
  }

  function Hero(props) {
    return h(AnimatedBackground, { variant: "hero", cursorGlow: props.cursorGlow, className: "sg-hero" },
      h("div", { className: "sg-hero-inner" },
        props.eyebrow ? h("div", { className: "sg-eyebrow" }, props.eyebrow) : null,
        h("h1", null, props.title),
        props.subtitle ? h("p", null, props.subtitle) : null,
        (props.primaryAction || props.secondaryAction) ? h("div", { className: "sg-hero-actions" },
          props.primaryAction ? h(Button, { variant: "primary", href: props.primaryAction.href, onClick: props.primaryAction.onClick }, props.primaryAction.label) : null,
          props.secondaryAction ? h(Button, { variant: "secondary", href: props.secondaryAction.href, onClick: props.secondaryAction.onClick }, props.secondaryAction.label) : null) : null,
        props.children));
  }

  window.SunsetGlow = Object.assign(window.SunsetGlow || {}, {
    Hero: Hero, AnimatedBackground: AnimatedBackground, CursorGlow: CursorGlow,
    Button: Button, Badge: Badge, Card: Card, Input: Input, SunsetStripe: SunsetStripe
  });
})();
