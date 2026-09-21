(()=>document.head.append(Object.assign(
  document.createElement('script'), {
    type: 'importmap',
    textContent: JSON.stringify({
      imports: {
        "collapse": "https://cdn.sdelal.tech/core/latest/collapse.js",
        "event": "https://cdn.sdelal.tech/core/latest/event.js",
        "field": "https://cdn.sdelal.tech/core/latest/field.js",
        "form": "https://cdn.sdelal.tech/core/latest/form.js",
        "motion": "https://cdn.sdelal.tech/core/latest/motion.js",
        "navigation": "https://cdn.sdelal.tech/core/latest/navigation.js",
        "popup": "https://cdn.sdelal.tech/core/latest/popup.js",
        "resource": "https://cdn.sdelal.tech/core/latest/resource.js",
        "slider": "https://cdn.sdelal.tech/core/latest/slider.js",
        "state": "https://cdn.sdelal.tech/core/latest/state.js"
      }
    }, null, 2)
  }
)))();
